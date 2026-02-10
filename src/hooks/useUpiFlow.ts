import { useState, useCallback, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { authFetchJson } from '@/lib/apiClient';
import Decimal from 'decimal.js';
import {
  UPI_FEE_PERCENT,
  UPI_TDS_PERCENT,
  MIN_INR_BUY,
  MAX_INR_BUY,
  UPI_PAYMENT_TIMEOUT,
  MOCK_PAYMENT_DELAY,
} from '@/lib/constants';
import type { UpiStep, UpiQuote, GoldPrice } from '@/types';

interface UpiFlowState {
  step: UpiStep;
  inrAmount: number;
  quote: UpiQuote | null;
  goldPricePerGram: number;
  priceLoading: boolean;
  upiId: string;
  selectedApp: 'gpay' | 'manual' | null;
  orderId: string | null;
  countdownSeconds: number;
  error: string | null;
  confirmLoading: boolean;
  confirmData: {
    goldGrams: number;
    totalPayable: number;
    ratePerGram: number;
    tds: number;
    fee: number;
    inrAmount: number;
  } | null;
}

export function useUpiFlow() {
  const [state, setState] = useState<UpiFlowState>({
    step: 'amount',
    inrAmount: 0,
    quote: null,
    goldPricePerGram: 0,
    priceLoading: false,
    upiId: '',
    selectedApp: null,
    orderId: null,
    countdownSeconds: UPI_PAYMENT_TIMEOUT,
    error: null,
    confirmLoading: false,
    confirmData: null,
  });

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const mockPaymentRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current gold price
  const fetchPrice = useCallback(async () => {
    setState((s) => ({ ...s, priceLoading: true }));
    try {
      const API_BASE = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? '';
      const res = await fetch(`${API_BASE}/api/prices`);
      const json = (await res.json()) as { success: boolean; data?: GoldPrice; error?: string };
      if (json.success && json.data) {
        setState((s) => ({
          ...s,
          goldPricePerGram: json.data!.pricePerGramInr,
          priceLoading: false,
        }));
        return json.data.pricePerGramInr;
      } else {
        setState((s) => ({ ...s, priceLoading: false, error: 'Failed to fetch gold price' }));
        return 0;
      }
    } catch {
      setState((s) => ({ ...s, priceLoading: false, error: 'Failed to fetch gold price' }));
      return 0;
    }
  }, []);

  // Compute quote from INR amount
  const computeQuote = useCallback(
    (inrAmount: number, pricePerGram: number): UpiQuote | null => {
      if (inrAmount <= 0 || pricePerGram <= 0) return null;

      const amount = new Decimal(inrAmount);
      const fee = amount.times(UPI_FEE_PERCENT);
      const tds = amount.times(UPI_TDS_PERCENT);
      const totalPayable = amount.plus(fee).plus(tds);
      const goldGrams = amount.dividedBy(pricePerGram);

      return {
        inrAmount,
        goldGrams: Number(goldGrams.toFixed(3)),
        fee: Number(fee.toFixed(2)),
        tds: Number(tds.toFixed(2)),
        totalPayable: Number(totalPayable.toFixed(2)),
        ratePerGram: pricePerGram,
      };
    },
    []
  );

  // Set INR amount and recompute quote
  const setAmount = useCallback(
    (inrAmount: number) => {
      const quote = computeQuote(inrAmount, state.goldPricePerGram);
      setState((s) => ({ ...s, inrAmount, quote, error: null }));
    },
    [computeQuote, state.goldPricePerGram]
  );

  // Set UPI ID
  const setUpiId = useCallback((upiId: string) => {
    setState((s) => ({ ...s, upiId, error: null }));
  }, []);

  // Select UPI app
  const selectApp = useCallback((app: 'gpay' | 'manual') => {
    setState((s) => ({ ...s, selectedApp: app, error: null }));
  }, []);

  // Navigate to payment screen
  const goToPayment = useCallback(() => {
    setState((s) => ({ ...s, step: 'payment', error: null }));
  }, []);

  // Navigate back to amount screen
  const goToAmount = useCallback(() => {
    setState((s) => ({ ...s, step: 'amount', error: null, selectedApp: null, upiId: '' }));
  }, []);

  // Initiate payment (create order and go to processing)
  const initiatePayment = useCallback(async () => {
    if (!state.quote) return;

    setState((s) => ({ ...s, confirmLoading: true, error: null }));

    try {
      const res = await authFetchJson<{
        orderId: string;
        transactionId: string;
        paymentUrl: string;
      }>('/api/upi/create-order', {
        method: 'POST',
        body: JSON.stringify({
          inrAmount: state.quote.inrAmount,
          totalPayable: state.quote.totalPayable,
          goldGrams: state.quote.goldGrams,
          goldPricePerGram: state.quote.ratePerGram,
          upiId: state.upiId,
        }),
      });

      if (res.success && res.data) {
        setState((s) => ({
          ...s,
          orderId: res.data!.orderId,
          step: 'processing',
          countdownSeconds: UPI_PAYMENT_TIMEOUT,
          confirmLoading: false,
        }));
      } else {
        setState((s) => ({
          ...s,
          error: res.error || 'Failed to create payment order',
          confirmLoading: false,
        }));
      }
    } catch {
      setState((s) => ({
        ...s,
        error: 'Failed to create payment order',
        confirmLoading: false,
      }));
    }
  }, [state.quote, state.upiId]);

  // Confirm payment (mock - simulates webhook callback)
  const confirmPayment = useCallback(async () => {
    if (!state.orderId || !state.quote) return;

    setState((s) => ({ ...s, confirmLoading: true }));

    try {
      const res = await authFetchJson<{
        orderId: string;
        goldGrams: number;
        xautAmount: number;
        txHash: string;
        totalPayable: number;
        fee: number;
        tds: number;
        goldPricePerGram: number;
      }>('/api/upi/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId: state.orderId,
          goldGrams: state.quote.goldGrams,
          inrAmount: state.quote.inrAmount,
          totalPayable: state.quote.totalPayable,
          goldPricePerGram: state.quote.ratePerGram,
          fee: state.quote.fee,
          tds: state.quote.tds,
        }),
      });

      if (res.success && res.data) {
        setState((s) => ({
          ...s,
          step: 'success',
          confirmLoading: false,
          confirmData: {
            goldGrams: res.data!.goldGrams,
            totalPayable: res.data!.totalPayable,
            ratePerGram: res.data!.goldPricePerGram,
            tds: res.data!.tds,
            fee: res.data!.fee,
            inrAmount: state.quote!.inrAmount,
          },
        }));
      } else {
        setState((s) => ({
          ...s,
          step: 'error',
          error: res.error || 'Payment confirmation failed',
          confirmLoading: false,
        }));
      }
    } catch {
      setState((s) => ({
        ...s,
        step: 'error',
        error: 'Payment confirmation failed',
        confirmLoading: false,
      }));
    }
  }, [state.orderId, state.quote]);

  // Start countdown and mock payment timer when entering processing step
  useEffect(() => {
    if (state.step === 'processing') {
      // Start countdown
      countdownRef.current = setInterval(() => {
        setState((s) => {
          if (s.countdownSeconds <= 1) {
            // Timeout - move to error
            return { ...s, countdownSeconds: 0, step: 'error', error: 'Payment timed out' };
          }
          return { ...s, countdownSeconds: s.countdownSeconds - 1 };
        });
      }, 1000);

      // Auto-complete after MOCK_PAYMENT_DELAY for demo
      mockPaymentRef.current = setTimeout(() => {
        confirmPayment();
      }, MOCK_PAYMENT_DELAY);

      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (mockPaymentRef.current) clearTimeout(mockPaymentRef.current);
      };
    }
  }, [state.step, confirmPayment]);

  // Reset the entire flow
  const reset = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (mockPaymentRef.current) clearTimeout(mockPaymentRef.current);
    setState({
      step: 'amount',
      inrAmount: 0,
      quote: null,
      goldPricePerGram: state.goldPricePerGram, // preserve fetched price
      priceLoading: false,
      upiId: '',
      selectedApp: null,
      orderId: null,
      countdownSeconds: UPI_PAYMENT_TIMEOUT,
      error: null,
      confirmLoading: false,
      confirmData: null,
    });
  }, [state.goldPricePerGram]);

  // Validation helpers
  const isAmountValid = state.inrAmount >= MIN_INR_BUY && state.inrAmount <= MAX_INR_BUY;
  const canProceedToPayment = isAmountValid && state.quote !== null && state.goldPricePerGram > 0;
  const canPay =
    state.selectedApp === 'gpay' ||
    (state.selectedApp === 'manual' && state.upiId.includes('@'));

  return {
    ...state,
    // Actions
    fetchPrice,
    setAmount,
    setUpiId,
    selectApp,
    goToPayment,
    goToAmount,
    initiatePayment,
    confirmPayment,
    reset,
    // Derived
    isAmountValid,
    canProceedToPayment,
    canPay,
    minAmount: MIN_INR_BUY,
    maxAmount: MAX_INR_BUY,
  };
}
