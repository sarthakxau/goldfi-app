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
import { motion, AnimatePresence } from 'motion/react';
import { slideUp, backdropFade, SPRING } from '@/lib/animations';

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
    if (!inputAmount) return;
    executeSwap(inputAmount);
  }, [inputAmount, executeSwap]);

  const inputError = useMemo(() => {
    if (!inputAmount) return null;
    const amount = Number(inputAmount);
    if (amount < MIN_USDT_SWAP) return `Minimum ${MIN_USDT_SWAP} USDT`;
    if (amount > MAX_USDT_SWAP) return `Maximum ${MAX_USDT_SWAP} USDT`;
    if (usdtBalance && amount > Number(usdtBalance)) return 'Insufficient balance';
    return null;
  }, [inputAmount, usdtBalance]);

  const canSwap = inputAmount &&
    !inputError &&
    !quoteLoading &&
    step === 'input';

  if (!mounted) return null;

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={step === 'input' ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 relative"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
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
              <h2 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">swap USDT to gold</h2>
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
                  <div className="flex items-center justify-between bg-gold-50 dark:bg-gold-500/5 border border-gold-200 dark:border-gold-500/20 rounded-xl p-3 mb-4">
                    <div>
                      <p className="text-xs text-gold-500 mb-0.5">your wallet (Arbitrum)</p>
                      <p className="text-sm font-mono text-text-primary dark:text-[#F0F0F0]">{truncateAddress(walletAddress)}</p>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#242424] border border-gold-200 dark:border-gold-500/20 hover:bg-gold-50 dark:hover:bg-gold-500/5 transition-colors"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="copied"
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs font-medium text-green-600">copied!</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Copy className="w-3.5 h-3.5 text-gold-500" />
                            <span className="text-xs font-medium text-gold-500">copy</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
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
                  <label htmlFor="usdt-amount" className="text-sm text-text-muted dark:text-[#6B7280] mb-2 block">you pay</label>
                  <div className="relative">
                    <input
                      id="usdt-amount"
                      type="number"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-3xl font-bold bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] rounded-xl p-4 pr-24 outline-none focus:ring-2 focus:ring-gold-500 border border-border-subtle dark:border-[#2D2D2D]"
                      aria-invalid={!!inputError}
                      aria-describedby={inputError ? "usdt-error" : undefined}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={handleMaxClick}
                        className="text-xs text-gold-500 font-medium hover:text-gold-600"
                      >
                        MAX
                      </button>
                      <span className="text-text-muted dark:text-[#6B7280] font-medium">USDT</span>
                    </div>
                  </div>
                  <AnimatePresence>
                    {inputError && (
                      <motion.p
                        id="usdt-error"
                        className="text-red-500 text-xs mt-2 flex items-center gap-1"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {inputError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-4">
                  <div className="w-10 h-10 bg-surface-elevated dark:bg-[#242424] rounded-full flex items-center justify-center">
                    <ArrowDown className="w-5 h-5 text-text-muted dark:text-[#6B7280]" />
                  </div>
                </div>

                {/* Quote Display */}
                <SwapQuoteDisplay quote={quote} loading={quoteLoading} />

                {/* Swap Button */}
                <motion.button
                  onClick={handleSwap}
                  disabled={!canSwap}
                  className="w-full bg-success text-white font-bold py-4 rounded-xl hover:bg-success-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={canSwap ? { scale: 0.98 } : undefined}
                  transition={SPRING.snappy}
                >
                  {quoteLoading ? 'Getting quote...' : 'swap to gold'}
                </motion.button>

                {/* Info */}
                <p className="text-center text-xs text-text-muted dark:text-[#6B7280] mt-4">
                  Swap powered by Camelot DEX on Arbitrum
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
