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
  SWAP_DEADLINE_MINUTES
} from '@/lib/constants';
import type { SwapQuote, SwapStep } from '@/types';

interface UseSwapReturn {
  // State
  walletAddress: string | undefined;
  usdtBalance: string | null;
  balanceLoading: boolean;
  quote: SwapQuote | null;
  quoteLoading: boolean;
  step: SwapStep;
  error: string | null;
  approvalTxHash: string | null;
  swapTxHash: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchQuote: (amount: string) => Promise<void>;
  executeSwap: (usdtAmount: string) => Promise<void>;
  reset: () => void;
}

export function useSwap(): UseSwapReturn {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [step, setStep] = useState<SwapStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address;
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Fetch USDT balance
  const fetchBalance = useCallback(async () => {
    console.log('[useSwap] fetchBalance called, walletAddress:', walletAddress);
    if (!walletAddress) {
      console.log('[useSwap] No wallet address, skipping balance fetch');
      return;
    }

    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/balance/usdt?address=${walletAddress}`);
      const data = await res.json();
      console.log('[useSwap] Balance API response:', data);
      if (data.success) {
        setUsdtBalance(data.data.balance);
      } else {
      console.error('[useSwap] Balance API error:', data.error);
      }
    } catch (err) {
      console.error('[useSwap] Balance fetch error:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // Fetch swap quote
  const fetchQuote = useCallback(async (amount: string) => {
    console.log('[useSwap] fetchQuote called, amount:', amount);
    if (!amount || Number(amount) <= 0) {
      console.log('[useSwap] Invalid amount, clearing quote');
      setQuote(null);
      return;
    }

    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/swap/quote?amount=${amount}`);
      const data = await res.json();
      console.log('[useSwap] Quote API response:', data);
      if (data.success) {
        setQuote(data.data);
      } else {
        console.error('[useSwap] Quote API error:', data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error('[useSwap] Quote fetch error:', err);
      setError('Failed to fetch quote');
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // Execute the swap
  const executeSwap = useCallback(async (usdtAmount: string) => {
    console.log('[useSwap] ========== EXECUTE SWAP STARTED ==========');
    console.log('[useSwap] Input amount:', usdtAmount);
    console.log('[useSwap] Wallet address:', walletAddress);
    console.log('[useSwap] Embedded wallet:', embeddedWallet);
    console.log('[useSwap] All wallets:', wallets);
    console.log('[useSwap] Quote:', quote);

    if (!embeddedWallet) {
      console.error('[useSwap] No embedded wallet found');
      setError('No embedded wallet found. Please reconnect your wallet.');
      setStep('error');
      return;
    }

    if (!walletAddress) {
      console.error('[useSwap] No wallet address');
      setError('Wallet address not available');
      setStep('error');
      return;
    }

    if (!quote) {
      console.error('[useSwap] No quote available');
      setError('Please wait for quote to load');
      setStep('error');
      return;
    }

    try {
      setError(null);
      console.log('[useSwap] Parsing USDT amount...');
      const usdtAmountBigInt = parseUnits(usdtAmount, USDT_DECIMALS);
      console.log('[useSwap] USDT amount bigint:', usdtAmountBigInt.toString());

      // Get provider from Privy embedded wallet
      console.log('[useSwap] Getting Ethereum provider from embedded wallet...');
      const provider = await embeddedWallet.getEthereumProvider();
      console.log('[useSwap] Provider obtained:', provider);

      // Step 1: Check allowance
      console.log('[useSwap] Step 1: Checking allowance...');
      setStep('approve');

      console.log('[useSwap] Reading allowance for:', {
        token: CONTRACTS.USDT,
        owner: walletAddress,
        spender: CONTRACTS.CAMELOT_V3_ROUTER,
      });

      const allowance = await clientPublicClient.readContract({
        address: CONTRACTS.USDT as `0x${string}`,
        abi: CLIENT_ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`],
      });
      console.log('[useSwap] Current allowance:', allowance.toString());

      // Step 2: Approve if needed
      if (allowance < usdtAmountBigInt) {
        console.log('[useSwap] Allowance insufficient, requesting approval...');
        const approveAmount = usdtAmountBigInt * BigInt(2);
        console.log('[useSwap] Approve amount:', approveAmount.toString());

        const approveData = encodeFunctionData({
          abi: CLIENT_ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.CAMELOT_V3_ROUTER as `0x${string}`, approveAmount],
        });
        console.log('[useSwap] Approve calldata:', approveData);

        console.log('[useSwap] Sending approval transaction...');
        const approveTxHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: CONTRACTS.USDT,
            data: approveData,
          }],
        });
        console.log('[useSwap] Approval tx hash:', approveTxHash);

        setApprovalTxHash(approveTxHash as string);

        // Wait for approval confirmation
        console.log('[useSwap] Waiting for approval confirmation...');
        const approvalReceipt = await clientPublicClient.waitForTransactionReceipt({ hash: approveTxHash as `0x${string}` });
        console.log('[useSwap] Approval receipt:', approvalReceipt);
      } else {
        console.log('[useSwap] Allowance sufficient, skipping approval');
      }
      setStep('swap');

      const deadline = BigInt(Math.floor(Date.now() / 1000) + SWAP_DEADLINE_MINUTES * 60);
      const minAmountOut = parseUnits(quote.minAmountOut, XAUT_DECIMALS);

      console.log('[useSwap] Swap params:', {
        tokenIn: CONTRACTS.USDT,
        tokenOut: CONTRACTS.XAUT0,
        recipient: walletAddress,
        deadline: deadline.toString(),
        amountIn: usdtAmountBigInt.toString(),
        amountOutMinimum: minAmountOut.toString(),
        limitSqrtPrice: '0',
      });

      const swapData = encodeFunctionData({
        abi: CLIENT_CAMELOT_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: CONTRACTS.USDT as `0x${string}`,
          tokenOut: CONTRACTS.XAUT0 as `0x${string}`,
          recipient: walletAddress as `0x${string}`,
          deadline,
          amountIn: usdtAmountBigInt,
          amountOutMinimum: minAmountOut,
          limitSqrtPrice: BigInt(0),
        }],
      });
      console.log('[useSwap] Swap calldata:', swapData);

      console.log('[useSwap] Sending swap transaction...');
      const swapTxHashResult = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: CONTRACTS.CAMELOT_V3_ROUTER,
          data: swapData,
        }],
      });
      console.log('[useSwap] Swap tx hash:', swapTxHashResult);

      setSwapTxHash(swapTxHashResult as string);
      setStep('confirming');

      // Wait for swap confirmation
      console.log('[useSwap] Waiting for swap confirmation...');
      const receipt = await clientPublicClient.waitForTransactionReceipt({
        hash: swapTxHashResult as `0x${string}`
      });
      console.log('[useSwap] Swap receipt:', receipt);

      if (receipt.status !== 'success') {
        throw new Error('Swap transaction failed on-chain');
      }

      // Step 4: Record transaction on server
      console.log('[useSwap] Step 4: Recording transaction...');
      const recordRes = await fetch('/api/swap/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdtAmount,
          xautAmount: quote.expectedXautAmount,
          swapTxHash: swapTxHashResult,
          fromAddress: walletAddress,
        }),
      });
      const recordData = await recordRes.json();
      console.log('[useSwap] Record API response:', recordData);
      setStep('success');

      // Refresh balance
      await fetchBalance();

    } catch (err: unknown) {
      console.error('[useSwap] ========== SWAP ERROR ==========');
      console.error('[useSwap] Error object:', err);
      console.error('[useSwap] Error type:', typeof err);
      if (err instanceof Error) {
        console.error('[useSwap] Error message:', err.message);
        console.error('[useSwap] Error stack:', err.stack);
      }
      const errorMessage = err instanceof Error ? err.message : 'Swap failed';
      setError(errorMessage);
      setStep('error');
    }
  }, [embeddedWallet, walletAddress, wallets, quote, fetchBalance]);

  // Reset state
  const reset = useCallback(() => {
    console.log('[useSwap] Resetting state');
    setStep('input');
    setQuote(null);
    setError(null);
    setApprovalTxHash(null);
    setSwapTxHash(null);
  }, []);

  // Fetch balance on mount
  useEffect(() => {
    console.log('[useSwap] useEffect triggered, fetching balance...');
    fetchBalance();
  }, [fetchBalance]);

  // Log state changes
  useEffect(() => {
    console.log('[useSwap] State updated:', { step, error, quote: !!quote, usdtBalance });
  }, [step, error, quote, usdtBalance]);

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
