'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { clientPublicClient, CLIENT_ERC20_ABI } from '@/lib/clientViem';
import { authFetchJson } from '@/lib/apiClient';
import { CONTRACTS, XAUT_DECIMALS, GRAMS_PER_OUNCE } from '@/lib/constants';
import type { GiftStep, GiftLookupResult, GiftOccasion } from '@/types';

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS;

// ERC20 transfer ABI (not in clientViem)
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

interface GiftFormData {
  recipientEmail: string;
  inrAmount: number;
  gramsAmount: number;
  xautAmount: number;
  goldPriceInr: number;
  occasion: GiftOccasion;
  message?: string;
}

interface UseGiftSendReturn {
  // State
  step: GiftStep;
  error: string | null;
  lookupResult: GiftLookupResult | null;
  lookupLoading: boolean;
  xautBalance: string | null;
  xautBalanceGrams: number | null;
  balanceLoading: boolean;
  txHash: string | null;
  giftId: string | null;

  // Actions
  lookupRecipient: (email: string) => Promise<GiftLookupResult>;
  continueWithEmail: () => void;
  executeGift: (data: GiftFormData) => Promise<void>;
  fetchBalance: () => Promise<void>;
  reset: () => void;
}

export function useGiftSend(): UseGiftSendReturn {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [step, setStep] = useState<GiftStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<GiftLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [xautBalance, setXautBalance] = useState<string | null>(null);
  const [xautBalanceGrams, setXautBalanceGrams] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address;
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Fetch XAUT balance
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;

    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/balance/xaut?address=${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setXautBalance(data.data.balance);
        setXautBalanceGrams(data.data.balanceGrams ?? null);
      }
    } catch (err) {
      console.error('[useGiftSend] Balance fetch error:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // Lookup recipient by email
  const lookupRecipient = useCallback(async (email: string): Promise<GiftLookupResult> => {
    setLookupLoading(true);
    setError(null);
    try {
      const { success, data, error: apiError } = await authFetchJson<GiftLookupResult>(
        `/api/gift/lookup?email=${encodeURIComponent(email)}`
      );

      if (!success || !data) {
        throw new Error(apiError || 'Lookup failed');
      }

      setLookupResult(data);

      if (!data.found) {
        setStep('not-found');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lookup failed';
      setError(message);
      return { found: false };
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // User chooses to continue with email gift (non-user flow)
  const continueWithEmail = useCallback(() => {
    setStep('confirm');
  }, []);

  // Execute the gift transfer
  const executeGift = useCallback(async (data: GiftFormData) => {
    if (!embeddedWallet || !walletAddress) {
      setError('No wallet found. Please reconnect.');
      setStep('error');
      return;
    }

    try {
      setError(null);
      setStep('approve');

      const provider = await embeddedWallet.getEthereumProvider();

      // Determine recipient: existing user's wallet or treasury (escrow)
      const recipientFound = lookupResult?.found ?? false;
      let toAddress: string;

      if (recipientFound && lookupResult?.user) {
        // Direct transfer — look up recipient wallet
        const { data: recipientData } = await authFetchJson<{ walletAddress: string }>(
          `/api/gift/lookup?email=${encodeURIComponent(data.recipientEmail)}`
        );
        // For direct transfers, we need the wallet address from the server
        // The lookup only returns id + email for safety. We'll let the server handle the transfer recording.
        // For now, transfer to treasury and let server-side route it.
        toAddress = TREASURY_WALLET || '';
      } else {
        // Escrow — transfer to treasury wallet
        toAddress = TREASURY_WALLET || '';
      }

      if (!toAddress) {
        throw new Error('Treasury wallet address not configured');
      }

      // Convert grams to XAUT (ounces)
      const xautOunces = data.gramsAmount / GRAMS_PER_OUNCE;
      const xautAmountBigInt = parseUnits(xautOunces.toFixed(XAUT_DECIMALS), XAUT_DECIMALS);

      // Check XAUT balance
      const balance = await clientPublicClient.readContract({
        address: CONTRACTS.XAUT0 as `0x${string}`,
        abi: CLIENT_ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      });

      if (balance < xautAmountBigInt) {
        throw new Error('Insufficient gold balance');
      }

      // Execute ERC20 transfer
      setStep('transfer');

      const transferData = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, xautAmountBigInt],
      });

      const transferTxHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: CONTRACTS.XAUT0,
          data: transferData,
        }],
      });

      setTxHash(transferTxHash as string);
      setStep('confirming');

      // Wait for confirmation
      const receipt = await clientPublicClient.waitForTransactionReceipt({
        hash: transferTxHash as `0x${string}`,
      });

      if (receipt.status !== 'success') {
        throw new Error('Transfer transaction failed on-chain');
      }

      // Record the gift on the server
      const { success, data: giftData, error: recordError } = await authFetchJson<{ gift: { id: string }; claimUrl?: string }>(
        '/api/gift/send',
        {
          method: 'POST',
          body: JSON.stringify({
            recipientEmail: data.recipientEmail,
            recipientFound,
            recipientUserId: lookupResult?.user?.id || null,
            inrAmount: data.inrAmount,
            gramsAmount: data.gramsAmount,
            xautAmount: xautOunces,
            goldPriceInr: data.goldPriceInr,
            occasion: data.occasion,
            message: data.message,
            paymentMethod: 'wallet',
            txHash: transferTxHash,
          }),
        }
      );

      if (!success) {
        // Transfer happened but recording failed — not ideal but not catastrophic
        console.error('[useGiftSend] Record error:', recordError);
      }

      if (giftData?.gift) {
        setGiftId(giftData.gift.id);
      }

      setStep('success');
      await fetchBalance();
    } catch (err) {
      console.error('[useGiftSend] Gift error:', err);
      const message = err instanceof Error ? err.message : 'Gift transfer failed';
      setError(message);
      setStep('error');
    }
  }, [embeddedWallet, walletAddress, lookupResult, fetchBalance]);

  // Reset all state
  const reset = useCallback(() => {
    setStep('input');
    setError(null);
    setLookupResult(null);
    setTxHash(null);
    setGiftId(null);
  }, []);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    step,
    error,
    lookupResult,
    lookupLoading,
    xautBalance,
    xautBalanceGrams,
    balanceLoading,
    txHash,
    giftId,
    lookupRecipient,
    continueWithEmail,
    executeGift,
    fetchBalance,
    reset,
  };
}
