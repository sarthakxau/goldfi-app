'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseUnits, encodeFunctionData } from 'viem';
import {
  clientPublicClient,
  CLIENT_ERC20_ABI,
  CLIENT_CAMELOT_ROUTER_ABI
} from '@/lib/clientViem';
import {
  CONTRACTS,
  USDT_DECIMALS,
  XAUT_DECIMALS,
  GRAMS_PER_OUNCE,
  SWAP_DEADLINE_MINUTES
} from '@/lib/constants';
import type { SwapStep } from '@/types';

export interface SellQuote {
  xautAmount: string;
  expectedUsdt: string;
  minAmountOut: string;
  slippage: number;
  gasEstimate: string;
  validUntil: string;
}

interface UseSellSwapReturn {
  // State
  walletAddress: string | undefined;
  xautBalance: string | null;
  xautBalanceGrams: number | null;
  balanceLoading: boolean;
  quote: SellQuote | null;
  quoteLoading: boolean;
  step: SwapStep;
  error: string | null;
  approvalTxHash: string | null;
  swapTxHash: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchQuote: (gramsAmount: string) => Promise<void>;
  executeSell: (gramsAmount: string) => Promise<void>;
  reset: () => void;
}

export function useSellSwap(): UseSellSwapReturn {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [xautBalance, setXautBalance] = useState<string | null>(null);
  const [xautBalanceGrams, setXautBalanceGrams] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [quote, setQuote] = useState<SellQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [step, setStep] = useState<SwapStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address;
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Fetch XAUT balance
  const fetchBalance = useCallback(async () => {
    console.log('[useSellSwap] fetchBalance called, walletAddress:', walletAddress);
    if (!walletAddress) {
      console.log('[useSellSwap] No wallet address, skipping balance fetch');
      return;
    }

    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/balance/xaut?address=${walletAddress}`);
      const data = await res.json();
      console.log('[useSellSwap] Balance API response:', data);
      if (data.success) {
        setXautBalance(data.data.balance);
        setXautBalanceGrams(data.data.balanceGrams);
      } else {
        console.error('[useSellSwap] Balance API error:', data.error);
      }
    } catch (err) {
      console.error('[useSellSwap] Balance fetch error:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // Fetch sell quote (input is in grams)
  const fetchQuote = useCallback(async (gramsAmount: string) => {
    console.log('[useSellSwap] fetchQuote called, grams:', gramsAmount);
    if (!gramsAmount || Number(gramsAmount) <= 0) {
      console.log('[useSellSwap] Invalid amount, clearing quote');
      setQuote(null);
      return;
    }

    // Convert grams to XAUT (troy ounces)
    const xautAmount = (parseFloat(gramsAmount) / GRAMS_PER_OUNCE).toFixed(6);
    console.log('[useSellSwap] Converted to XAUT:', xautAmount);

    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/sell/quote?xautAmount=${xautAmount}`);
      const data = await res.json();
      console.log('[useSellSwap] Quote API response:', data);
      if (data.success) {
        setQuote(data.data);
      } else {
        console.error('[useSellSwap] Quote API error:', data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error('[useSellSwap] Quote fetch error:', err);
      setError('Failed to fetch quote');
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // Execute the sell (swap XAUT to USDT)
  const executeSell = useCallback(async (gramsAmount: string) => {
    console.log('[useSellSwap] ========== EXECUTE SELL STARTED ==========');
    console.log('[useSellSwap] Grams amount:', gramsAmount);
    console.log('[useSellSwap] Wallet address:', walletAddress);
    console.log('[useSellSwap] Embedded wallet:', embeddedWallet);
    console.log('[useSellSwap] Quote:', quote);

    if (!embeddedWallet) {
      console.error('[useSellSwap] No embedded wallet found');
      setError('No embedded wallet found. Please reconnect your wallet.');
      setStep('error');
      return;
    }

    if (!walletAddress) {
      console.error('[useSellSwap] No wallet address');
      setError('Wallet address not available');
      setStep('error');
      return;
    }

    if (!quote) {
      console.error('[useSellSwap] No quote available');
      setError('Please wait for quote to load');
      setStep('error');
      return;
    }

    try {
      setError(null);

      // Convert grams to XAUT amount
      const xautAmount = (parseFloat(gramsAmount) / GRAMS_PER_OUNCE).toFixed(6);
      console.log('[useSellSwap] XAUT amount to sell:', xautAmount);

      const xautAmountBigInt = parseUnits(xautAmount, XAUT_DECIMALS);
      console.log('[useSellSwap] XAUT amount bigint:', xautAmountBigInt.toString());

      // Get provider from Privy embedded wallet
      console.log('[useSellSwap] Getting Ethereum provider from embedded wallet...');
      const provider = await embeddedWallet.getEthereumProvider();
      console.log('[useSellSwap] Provider obtained:', provider);

      // Step 1: Check XAUT allowance
      console.log('[useSellSwap] Step 1: Checking XAUT allowance...');
      setStep('approve');

      const allowance = await clientPublicClient.readContract({
        address: CONTRACTS.XAUT0 as `0x${string}`,
        abi: CLIENT_ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`],
      });
      console.log('[useSellSwap] Current XAUT allowance:', allowance.toString());

      // Step 2: Approve XAUT if needed
      if (allowance < xautAmountBigInt) {
        console.log('[useSellSwap] Allowance insufficient, requesting approval...');
        const approveAmount = xautAmountBigInt * BigInt(2);
        console.log('[useSellSwap] Approve amount:', approveAmount.toString());

        const approveData = encodeFunctionData({
          abi: CLIENT_ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`, approveAmount],
        });

        console.log('[useSellSwap] Sending XAUT approval transaction...');
        const approveTxHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: CONTRACTS.XAUT0,
            data: approveData,
          }],
        });
        console.log('[useSellSwap] Approval tx hash:', approveTxHash);

        setApprovalTxHash(approveTxHash as string);

        // Wait for approval confirmation
        console.log('[useSellSwap] Waiting for approval confirmation...');
        const approvalReceipt = await clientPublicClient.waitForTransactionReceipt({
          hash: approveTxHash as `0x${string}`
        });
        console.log('[useSellSwap] Approval receipt:', approvalReceipt);
      } else {
        console.log('[useSellSwap] Allowance sufficient, skipping approval');
      }

      // Step 3: Execute swap (XAUT -> USDT)
      console.log('[useSellSwap] Step 3: Executing swap...');
      setStep('swap');

      const deadline = BigInt(Math.floor(Date.now() / 1000) + SWAP_DEADLINE_MINUTES * 60);
      const minAmountOut = parseUnits(quote.minAmountOut, USDT_DECIMALS);

      console.log('[useSellSwap] Swap params:', {
        tokenIn: CONTRACTS.XAUT0,
        tokenOut: CONTRACTS.USDT,
        recipient: walletAddress,
        deadline: deadline.toString(),
        amountIn: xautAmountBigInt.toString(),
        amountOutMinimum: minAmountOut.toString(),
        limitSqrtPrice: '0',
      });

      const swapData = encodeFunctionData({
        abi: CLIENT_CAMELOT_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: CONTRACTS.XAUT0 as `0x${string}`,
          tokenOut: CONTRACTS.USDT as `0x${string}`,
          recipient: walletAddress as `0x${string}`,
          deadline,
          amountIn: xautAmountBigInt,
          amountOutMinimum: minAmountOut,
          limitSqrtPrice: BigInt(0),
        }],
      });

      console.log('[useSellSwap] Sending swap transaction...');
      const swapTxHashResult = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: CONTRACTS.CAMELOT_V3_ROUTER,
          data: swapData,
        }],
      });
      console.log('[useSellSwap] Swap tx hash:', swapTxHashResult);

      setSwapTxHash(swapTxHashResult as string);
      setStep('confirming');

      // Wait for swap confirmation
      console.log('[useSellSwap] Waiting for swap confirmation...');
      const receipt = await clientPublicClient.waitForTransactionReceipt({
        hash: swapTxHashResult as `0x${string}`
      });
      console.log('[useSellSwap] Swap receipt:', receipt);

      if (receipt.status !== 'success') {
        throw new Error('Swap transaction failed on-chain');
      }

      // Step 4: Record transaction on server
      console.log('[useSellSwap] Step 4: Recording transaction...');
      const recordRes = await fetch('/api/sell/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xautAmount,
          usdtAmount: quote.expectedUsdt,
          swapTxHash: swapTxHashResult,
          fromAddress: walletAddress,
        }),
      });
      const recordData = await recordRes.json();
      console.log('[useSellSwap] Record API response:', recordData);

      console.log('[useSellSwap] ========== SELL SUCCESSFUL ==========');
      setStep('success');

      // Refresh balance
      await fetchBalance();

    } catch (err: unknown) {
      console.error('[useSellSwap] ========== SELL ERROR ==========');
      console.error('[useSellSwap] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sell failed';
      setError(errorMessage);
      setStep('error');
    }
  }, [embeddedWallet, walletAddress, quote, fetchBalance]);

  // Reset state
  const reset = useCallback(() => {
    console.log('[useSellSwap] Resetting state');
    setStep('input');
    setQuote(null);
    setError(null);
    setApprovalTxHash(null);
    setSwapTxHash(null);
  }, []);

  // Fetch balance on mount
  useEffect(() => {
    console.log('[useSellSwap] useEffect triggered, fetching balance...');
    fetchBalance();
  }, [fetchBalance]);

  return {
    walletAddress,
    xautBalance,
    xautBalanceGrams,
    balanceLoading,
    quote,
    quoteLoading,
    step,
    error,
    approvalTxHash,
    swapTxHash,
    fetchBalance,
    fetchQuote,
    executeSell,
    reset,
  };
}
