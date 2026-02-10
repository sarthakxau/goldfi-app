import { useState, useCallback, useEffect } from 'react';
import { parseUnits, encodeFunctionData } from 'viem';
import Constants from 'expo-constants';
import {
  clientPublicClient,
  CLIENT_ERC20_ABI,
  CLIENT_CAMELOT_ROUTER_ABI,
} from '@/lib/clientViem';
import {
  CONTRACTS,
  USDT_DECIMALS,
  XAUT_DECIMALS,
  SWAP_DEADLINE_MINUTES,
} from '@/lib/constants';
import { authFetchJson } from '@/lib/apiClient';
import type { SwapQuote, SwapStep } from '@/types';

const DEV_BYPASS_AUTH = false;
const API_BASE =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  '';

interface UseSwapReturn {
  walletAddress: string | undefined;
  usdtBalance: string | null;
  balanceLoading: boolean;
  quote: SwapQuote | null;
  quoteLoading: boolean;
  step: SwapStep;
  error: string | null;
  approvalTxHash: string | null;
  swapTxHash: string | null;
  fetchBalance: () => Promise<void>;
  fetchQuote: (amount: string) => Promise<void>;
  executeSwap: (usdtAmount: string) => Promise<void>;
  reset: () => void;
}

// Dev bypass: compute a mock quote from the live price API
async function fetchMockQuote(usdtAmount: string): Promise<SwapQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/api/prices`);
    const json = await res.json();
    if (!json.success || !json.data) return null;
    const pricePerGramUsd = json.data.pricePerGramUsd as number;
    const amount = Number(usdtAmount);
    const grams = amount / pricePerGramUsd;
    const oz = grams / 31.1035;
    const minOz = oz * 0.995;
    return {
      usdtAmount,
      expectedXautAmount: oz.toFixed(6),
      expectedGrams: grams,
      priceImpact: 0.01,
      minAmountOut: minOz.toFixed(6),
      slippage: 0.5,
      gasEstimate: '0.000200',
      validUntil: new Date(Date.now() + 60_000),
    };
  } catch {
    return null;
  }
}

export function useSwap(): UseSwapReturn {
  // In dev mode, we don't have Privy SDK — mock wallet data
  let walletAddress: string | undefined;
  let embeddedWallet: any = null;

  if (!DEV_BYPASS_AUTH) {
    try {
      const { usePrivy, useEmbeddedEthereumWallet } = require('@privy-io/expo');
      const { user } = usePrivy();
      const { wallets } = useEmbeddedEthereumWallet();
      // Extract wallet from linked_accounts or embedded wallets
      const linked = user?.linked_accounts?.find(
        (a: any) => a.type === 'wallet' && a.wallet_client_type === 'privy'
      );
      walletAddress = linked?.address ?? wallets[0]?.address;
      embeddedWallet = wallets[0];
    } catch {
      // Privy not available
    }
  } else {
    walletAddress = '0xDev0000000000000000000000000000000000';
  }

  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [step, setStep] = useState<SwapStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  // Fetch USDT balance
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;
    setBalanceLoading(true);
    try {
      if (DEV_BYPASS_AUTH) {
        // Mock balance in dev
        setUsdtBalance('1000.00');
      } else {
        const res = await authFetchJson<{ balance: string }>(
          `/api/balance/usdt?address=${walletAddress}`
        );
        if (res.success && res.data) {
          setUsdtBalance(res.data.balance);
        }
      }
    } catch {
      // silently fail
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // Fetch swap quote
  const fetchQuote = useCallback(async (amount: string) => {
    if (!amount || Number(amount) <= 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      if (DEV_BYPASS_AUTH) {
        const mockQuote = await fetchMockQuote(amount);
        if (mockQuote) {
          setQuote(mockQuote);
        } else {
          setError('Failed to fetch quote');
        }
      } else {
        const res = await authFetchJson<SwapQuote>(
          `/api/swap/quote?amount=${amount}`
        );
        if (res.success && res.data) {
          setQuote(res.data);
        } else {
          setError(res.error || 'Failed to fetch quote');
        }
      }
    } catch {
      setError('Failed to fetch quote');
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // Execute the swap
  const executeSwap = useCallback(
    async (usdtAmount: string) => {
      if (!walletAddress || !quote) {
        setError('Wallet or quote not available');
        setStep('error');
        return;
      }

      // Dev bypass: simulate the entire swap flow
      if (DEV_BYPASS_AUTH) {
        setError(null);
        setStep('approve');
        await new Promise((r) => setTimeout(r, 1000));
        setApprovalTxHash('0xdev_approval_mock');
        setStep('swap');
        await new Promise((r) => setTimeout(r, 1500));
        setSwapTxHash('0xdev_swap_mock');
        setStep('confirming');
        await new Promise((r) => setTimeout(r, 1000));
        setStep('success');
        return;
      }

      // Real Privy flow
      if (!embeddedWallet) {
        setError('No embedded wallet found. Please reconnect.');
        setStep('error');
        return;
      }

      try {
        setError(null);
        const usdtAmountBigInt = parseUnits(usdtAmount, USDT_DECIMALS);

        const provider = await embeddedWallet.getProvider();

        // Step 1: Check allowance
        setStep('approve');
        const allowance = await clientPublicClient.readContract({
          address: CONTRACTS.USDT as `0x${string}`,
          abi: CLIENT_ERC20_ABI,
          functionName: 'allowance',
          args: [
            walletAddress as `0x${string}`,
            CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`,
          ],
        });

        // Step 2: Approve if needed
        if (allowance < usdtAmountBigInt) {
          const approveAmount = usdtAmountBigInt * BigInt(2);
          const approveData = encodeFunctionData({
            abi: CLIENT_ERC20_ABI,
            functionName: 'approve',
            args: [
              CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`,
              approveAmount,
            ],
          });

          const approveTx = await provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: walletAddress,
                to: CONTRACTS.USDT,
                data: approveData,
              },
            ],
          });
          setApprovalTxHash(approveTx as string);
          await clientPublicClient.waitForTransactionReceipt({
            hash: approveTx as `0x${string}`,
          });
        }

        // Step 3: Swap
        setStep('swap');
        const deadline = BigInt(
          Math.floor(Date.now() / 1000) + SWAP_DEADLINE_MINUTES * 60
        );
        const minAmountOut = parseUnits(quote.minAmountOut, XAUT_DECIMALS);

        const swapData = encodeFunctionData({
          abi: CLIENT_CAMELOT_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: CONTRACTS.USDT as `0x${string}`,
              tokenOut: CONTRACTS.XAUT0 as `0x${string}`,
              recipient: walletAddress as `0x${string}`,
              deadline,
              amountIn: usdtAmountBigInt,
              amountOutMinimum: minAmountOut,
              limitSqrtPrice: BigInt(0),
            },
          ],
        });

        const swapTxResult = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress,
              to: CONTRACTS.CAMELOT_V3_ROUTER,
              data: swapData,
            },
          ],
        });
        setSwapTxHash(swapTxResult as string);
        setStep('confirming');

        const receipt = await clientPublicClient.waitForTransactionReceipt({
          hash: swapTxResult as `0x${string}`,
        });

        if (receipt.status !== 'success') {
          throw new Error('Swap transaction failed on-chain');
        }

        // Step 4: Record transaction
        await authFetchJson('/api/swap/record', {
          method: 'POST',
          body: JSON.stringify({
            usdtAmount,
            xautAmount: quote.expectedXautAmount,
            swapTxHash: swapTxResult,
            fromAddress: walletAddress,
          }),
        });

        setStep('success');
        await fetchBalance();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Swap failed';
        setError(msg);
        setStep('error');
      }
    },
    [embeddedWallet, walletAddress, quote, fetchBalance]
  );

  // Reset state
  const reset = useCallback(() => {
    setStep('input');
    setQuote(null);
    setError(null);
    setApprovalTxHash(null);
    setSwapTxHash(null);
  }, []);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    walletAddress,
    usdtBalance,
    balanceLoading,
    quote,
    quoteLoading,
    step,
    error,
    approvalTxHash,
    swapTxHash,
    fetchBalance,
    fetchQuote,
    executeSwap,
    reset,
  };
}
