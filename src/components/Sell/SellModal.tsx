'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ArrowDown, AlertCircle, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSellSwap } from '@/hooks/useSellSwap';
import { MIN_GRAMS_SELL, MAX_GRAMS_SELL, QUOTE_REFRESH_INTERVAL } from '@/lib/constants';
import { debounce, formatGrams } from '@/lib/utils';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SellModal({ isOpen, onClose }: SellModalProps) {
  const [mounted, setMounted] = useState(false);
  const [grams, setGrams] = useState('');

  const {
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
  } = useSellSwap();

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
    if (grams && Number(grams) >= MIN_GRAMS_SELL) {
      debouncedFetchQuote(grams);
    }
  }, [grams, debouncedFetchQuote]);

  // Auto-refresh quote
  useEffect(() => {
    if (!isOpen || step !== 'input' || !grams) return;

    const interval = setInterval(() => {
      if (Number(grams) >= MIN_GRAMS_SELL) {
        fetchQuote(grams);
      }
    }, QUOTE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isOpen, step, grams, fetchQuote]);

  const handleClose = useCallback(() => {
    reset();
    setGrams('');
    onClose();
  }, [reset, onClose]);

  const handleMaxClick = useCallback(() => {
    if (xautBalanceGrams) {
      setGrams(xautBalanceGrams.toString());
    }
  }, [xautBalanceGrams]);

  const handleSell = useCallback(() => {
    if (!grams) return;
    executeSell(grams);
  }, [grams, executeSell]);

  const inputError = useMemo(() => {
    if (!grams) return null;
    const amount = Number(grams);
    if (amount < MIN_GRAMS_SELL) return `Minimum ${MIN_GRAMS_SELL} grams`;
    if (amount > MAX_GRAMS_SELL) return `Maximum ${MAX_GRAMS_SELL} grams`;
    if (xautBalanceGrams && amount > xautBalanceGrams) return 'Insufficient balance';
    return null;
  }, [grams, xautBalanceGrams]);

  const canSell = grams &&
    !inputError &&
    !quoteLoading &&
    step === 'input';

  if (!mounted || !isOpen) return null;

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={step === 'input' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 relative animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0]"
            disabled={showProgress && step !== 'success' && step !== 'error'}
            aria-label="Close modal"
          >
            <X className="size-6" />
          </button>
          <h2 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">sell gold</h2>
          <div className="w-10" />
        </div>

        {showProgress ? (
          <SellProgress
            step={step}
            approvalTxHash={approvalTxHash}
            swapTxHash={swapTxHash}
            error={error}
            onClose={handleClose}
            onRetry={() => {
              reset();
              handleSell();
            }}
          />
        ) : (
          <>
            {/* Balance Display */}
            <div className="bg-gold-50 dark:bg-gold-500/5 border border-gold-200 dark:border-gold-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gold-500 mb-0.5">available to sell</p>
                  <p className="text-lg font-bold text-text-primary dark:text-[#F0F0F0]">
                    {balanceLoading ? (
                      <span className="inline-block w-20 h-6 skeleton rounded" />
                    ) : (
                      formatGrams(xautBalanceGrams || 0)
                    )}
                  </p>
                </div>
                <button
                  onClick={fetchBalance}
                  disabled={balanceLoading}
                  className="p-2 text-text-muted dark:text-[#6B7280] hover:text-gold-500 transition-colors"
                >
                  <RefreshCw className={`size-5 ${balanceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="mb-4">
              <label htmlFor="grams-amount" className="text-sm text-text-muted dark:text-[#6B7280] mb-2 block">you sell</label>
              <div className="relative">
                <input
                  id="grams-amount"
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-3xl font-bold bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] rounded-xl p-4 pr-16 outline-none focus:ring-2 focus:ring-gold-500 border border-border-subtle dark:border-[#2D2D2D]"
                  aria-invalid={!!inputError}
                  aria-describedby={inputError ? "grams-error" : undefined}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={handleMaxClick}
                    className="text-xs text-gold-500 font-medium hover:text-gold-600"
                  >
                    MAX
                  </button>
                  <span className="text-text-muted dark:text-[#6B7280] font-medium">g</span>
                </div>
              </div>
              {inputError && (
                <p id="grams-error" className="text-red-500 text-xs mt-2 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {inputError}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-4">
              <div className="w-10 h-10 bg-surface-elevated dark:bg-[#242424] rounded-full flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-text-muted dark:text-[#6B7280]" />
              </div>
            </div>

            {/* Quote Display */}
            <div className="bg-gold-50 dark:bg-gold-500/5 border border-gold-200 dark:border-gold-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-text-muted dark:text-[#6B7280] mb-1">you receive (estimated)</p>
              {quoteLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-24 skeleton rounded" />
                </div>
              ) : quote ? (
                <p className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0]">
                  ${quote.expectedUsdt} USDT
                </p>
              ) : (
                <p className="text-2xl font-bold text-text-muted dark:text-[#6B7280]">$0.00 USDT</p>
              )}
              {quote && (
                <p className="text-xs text-text-muted dark:text-[#6B7280] mt-1">
                  Min: ${quote.minAmountOut} (with {quote.slippage}% slippage)
                </p>
              )}
            </div>

            {/* Sell Button */}
            <button
              onClick={handleSell}
              disabled={!canSell}
              className="w-full bg-success text-white font-bold py-4 rounded-xl hover:bg-success-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quoteLoading ? 'Getting quote...' : `sell for $${quote?.expectedUsdt || '0'} USDT`}
            </button>

            {/* Info */}
            <p className="text-center text-xs text-text-muted dark:text-[#6B7280] mt-4">
              Swap powered by Camelot DEX on Arbitrum
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Progress Component
interface SellProgressProps {
  step: string;
  approvalTxHash: string | null;
  swapTxHash: string | null;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

function SellProgress({ step, approvalTxHash, swapTxHash, error, onClose, onRetry }: SellProgressProps) {
  return (
    <div className="text-center py-8">
      {step === 'success' && (
        <>
          <div className="size-16 bg-success-light dark:bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="size-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Sell Successful!</h3>
          <p className="text-text-secondary dark:text-[#9CA3AF] mb-6">Your gold has been sold for USDT</p>
          {swapTxHash && (
            <a
              href={`https://arbiscan.io/tx/${swapTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:underline text-sm mb-6 block"
            >
              View on Arbiscan
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full bg-success text-white font-bold py-4 rounded-xl"
          >
            Done
          </button>
        </>
      )}

      {step === 'error' && (
        <>
          <div className="size-16 bg-error-light dark:bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="size-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Sell Failed</h3>
          <p className="text-error mb-6">{error || 'Something went wrong'}</p>
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] font-semibold py-4 rounded-xl border border-border dark:border-[#2D2D2D]"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white dark:bg-[#1A1A1A] text-text-secondary dark:text-[#9CA3AF] font-semibold py-4 rounded-xl border border-border-subtle dark:border-[#2D2D2D]"
            >
              Go Back
            </button>
          </div>
        </>
      )}

      {['approve', 'swap', 'confirming'].includes(step) && (
        <>
          <div className="size-16 bg-gold-100 dark:bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="size-8 text-gold-500 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
            {step === 'approve' && 'Approving...'}
            {step === 'swap' && 'Executing Sell...'}
            {step === 'confirming' && 'Confirming...'}
          </h3>
          <p className="text-text-secondary dark:text-[#9CA3AF]">
            {step === 'approve' && 'Please confirm the approval in your wallet'}
            {step === 'swap' && 'Please confirm the swap in your wallet'}
            {step === 'confirming' && 'Waiting for blockchain confirmation'}
          </p>
          {(approvalTxHash || swapTxHash) && (
            <div className="mt-4 space-y-2">
              {approvalTxHash && (
                <a
                  href={`https://arbiscan.io/tx/${approvalTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-500 hover:underline text-sm block"
                >
                  View approval transaction
                </a>
              )}
              {swapTxHash && (
                <a
                  href={`https://arbiscan.io/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-500 hover:underline text-sm block"
                >
                  View swap transaction
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
