'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ArrowDown, AlertCircle, Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSwap } from '@/hooks/useSwap';
import { BalanceDisplay } from './BalanceDisplay';
import { SwapQuoteDisplay } from './SwapQuote';
import { SwapProgress } from './SwapProgress';
import { MIN_USDT_SWAP, MAX_USDT_SWAP, QUOTE_REFRESH_INTERVAL } from '@/lib/constants';
import { debounce, truncateAddress } from '@/lib/utils';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const [mounted, setMounted] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const {
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
  } = useSwap();

  const handleCopyAddress = useCallback(() => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletAddress]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced quote fetch
  const debouncedFetchQuote = useMemo(
    () => debounce((amount: string) => fetchQuote(amount), 500),
    [fetchQuote]
  );

  // Fetch quote when input changes
  useEffect(() => {
    if (inputAmount && Number(inputAmount) >= MIN_USDT_SWAP) {
      debouncedFetchQuote(inputAmount);
    }
  }, [inputAmount, debouncedFetchQuote]);

  // Auto-refresh quote
  useEffect(() => {
    if (!isOpen || step !== 'input' || !inputAmount) return;

    const interval = setInterval(() => {
      if (Number(inputAmount) >= MIN_USDT_SWAP) {
        fetchQuote(inputAmount);
      }
    }, QUOTE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isOpen, step, inputAmount, fetchQuote]);

  const handleClose = useCallback(() => {
    reset();
    setInputAmount('');
    onClose();
  }, [reset, onClose]);

  const handleMaxClick = useCallback(() => {
    if (usdtBalance) {
      const maxAmount = Math.min(parseFloat(usdtBalance), MAX_USDT_SWAP);
      setInputAmount(maxAmount.toString());
    }
  }, [usdtBalance]);

  const handleSwap = useCallback(() => {
    console.log('[SwapModal] handleSwap called');
    console.log('[SwapModal] inputAmount:', inputAmount);
    console.log('[SwapModal] quote:', quote);

    if (!inputAmount) {
      console.log('[SwapModal] No input amount, returning early');
      return;
    }

    // Execute swap even without quote - executeSwap will handle missing quote error
    console.log('[SwapModal] Calling executeSwap with amount:', inputAmount);
    executeSwap(inputAmount);
  }, [inputAmount, quote, executeSwap]);

  const inputError = useMemo(() => {
    if (!inputAmount) return null;
    const amount = Number(inputAmount);
    if (amount < MIN_USDT_SWAP) return `Minimum ${MIN_USDT_SWAP} USDT`;
    if (amount > MAX_USDT_SWAP) return `Maximum ${MAX_USDT_SWAP} USDT`;
    if (usdtBalance && amount > Number(usdtBalance)) return 'Insufficient balance';
    return null;
  }, [inputAmount, usdtBalance]);

  const canSwap = inputAmount &&
    // quote &&
    !inputError &&
    !quoteLoading &&
    step === 'input';

  if (!mounted || !isOpen) return null;

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step === 'input' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 relative animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900"
            disabled={showProgress && step !== 'success' && step !== 'error'}
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">swap USDT to gold</h2>
          <div className="w-10" />
        </div>

        {showProgress ? (
          <SwapProgress
            step={step}
            approvalTxHash={approvalTxHash}
            swapTxHash={swapTxHash}
            error={error}
            onClose={handleClose}
            onRetry={() => {
              reset();
              handleSwap();
            }}
          />
        ) : (
          <>
            {/* Wallet Address Display */}
            {walletAddress && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <div>
                  <p className="text-xs text-amber-600 mb-0.5">your wallet (Arbitrum)</p>
                  <p className="text-sm font-mono text-gray-900">{truncateAddress(walletAddress)}</p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-medium text-green-600">copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-600">copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Balance Display */}
            <BalanceDisplay
              balance={usdtBalance}
              loading={balanceLoading}
              onRefresh={fetchBalance}
            />

            {/* Input Section */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">you pay</label>
              <div className="relative">
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-3xl font-bold bg-gray-50 rounded-xl p-4 pr-24 outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={handleMaxClick}
                    className="text-xs text-amber-600 font-medium hover:text-amber-700"
                  >
                    MAX
                  </button>
                  <span className="text-gray-400 font-medium">USDT</span>
                </div>
              </div>
              {inputError && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {inputError}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Quote Display */}
            <SwapQuoteDisplay quote={quote} loading={quoteLoading} />

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!canSwap}
              className="w-full bg-[#A3F4B5] text-gray-900 font-bold py-4 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quoteLoading ? 'Getting quote...' : 'swap to gold'}
            </button>

            {/* Info */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Swap powered by Camelot DEX on Arbitrum
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
