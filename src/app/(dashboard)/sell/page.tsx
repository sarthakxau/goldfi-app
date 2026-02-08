'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSellSwap } from '@/hooks/useSellSwap';
import { formatINR, formatGrams, debounce } from '@/lib/utils';
import { MIN_GRAMS_SELL, MAX_GRAMS_SELL, QUOTE_REFRESH_INTERVAL } from '@/lib/constants';
import { ArrowLeft, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

export default function SellPage() {
  const router = useRouter();
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

  const debouncedFetchQuote = useMemo(
    () => debounce((amount: string) => fetchQuote(amount), 500),
    [fetchQuote]
  );

  useEffect(() => {
    if (grams && Number(grams) >= MIN_GRAMS_SELL) {
      debouncedFetchQuote(grams);
    }
  }, [grams, debouncedFetchQuote]);

  useEffect(() => {
    if (step !== 'input' || !grams) return;

    const interval = setInterval(() => {
      if (Number(grams) >= MIN_GRAMS_SELL) {
        fetchQuote(grams);
      }
    }, QUOTE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [step, grams, fetchQuote]);

  const maxGrams = xautBalanceGrams ?? 0;
  const presetPercentages = [25, 50, 75, 100];

  const inputError = useMemo(() => {
    if (!grams) return null;
    const amount = Number(grams);
    if (amount < MIN_GRAMS_SELL) return `Minimum ${MIN_GRAMS_SELL} grams`;
    if (amount > MAX_GRAMS_SELL) return `Maximum ${MAX_GRAMS_SELL} grams`;
    if (amount > maxGrams) return 'Insufficient balance';
    return null;
  }, [grams, maxGrams]);

  const canSell = grams &&
    Number(grams) >= MIN_GRAMS_SELL &&
    Number(grams) <= maxGrams &&
    !inputError &&
    !quoteLoading &&
    !!quote &&
    step === 'input';

  const handleSell = useCallback(() => {
    if (!grams) return;
    executeSell(grams);
  }, [grams, executeSell]);

  const handleDone = useCallback(() => {
    reset();
    setGrams('');
    router.push('/');
  }, [reset, router]);

  const handleRetry = useCallback(() => {
    reset();
    handleSell();
  }, [reset, handleSell]);

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  // Progress/Success/Error Screen
  if (showProgress) {
    return (
      <div className="p-6 min-h-screen flex flex-col">
        {/* Header */}
        <FadeUp>
          <div className="flex items-center mb-8">
            <button
              onClick={() => step === 'success' || step === 'error' ? handleDone() : undefined}
              disabled={step !== 'success' && step !== 'error'}
              className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] disabled:opacity-50 transition-colors"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] ml-2">Selling Gold</h1>
          </div>
        </FadeUp>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Success State */}
          {step === 'success' && (
            <div className="text-center">
              <motion.div
                className="size-20 bg-success-light dark:bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/20 dark:border-success/30"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING.bouncy}
              >
                <CheckCircle className="size-10 text-success" />
              </motion.div>
              <motion.h2
                className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.normal, delay: 0.15, ease: EASE_OUT_EXPO }}
              >
                Sell Successful!
              </motion.h2>
              <motion.p
                className="text-text-secondary dark:text-[#9CA3AF] mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.normal, delay: 0.2, ease: EASE_OUT_EXPO }}
              >
                You sold {formatGrams(parseFloat(grams))} for ~${quote?.expectedUsdt} USDT
              </motion.p>
              {swapTxHash && (
                <a
                  href={`https://arbiscan.io/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-8"
                >
                  <span>View on Arbiscan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <motion.button
                onClick={handleDone}
                className="w-full bg-success text-white font-bold py-4 rounded-2xl hover:bg-success-dark transition-colors"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.normal, delay: 0.25, ease: EASE_OUT_EXPO }}
              >
                Done
              </motion.button>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center">
              <motion.div
                className="size-20 bg-error-light dark:bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-error/20 dark:border-error/30"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING.bouncy}
              >
                <AlertCircle className="size-10 text-error" />
              </motion.div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Sell Failed</h2>
              <p className="text-error mb-6">{error || 'Something went wrong'}</p>
              <div className="space-y-3 w-full">
                <motion.button
                  onClick={handleRetry}
                  className="w-full bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] font-semibold py-4 rounded-2xl border border-border dark:border-[#2D2D2D] hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={handleDone}
                  className="w-full bg-white dark:bg-[#1A1A1A] text-text-secondary dark:text-[#9CA3AF] font-semibold py-4 rounded-2xl border border-border-subtle dark:border-[#2D2D2D] hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Go Back
                </motion.button>
              </div>
            </div>
          )}

          {/* Processing States */}
          {['approve', 'swap', 'confirming'].includes(step) && (
            <div className="text-center">
              <motion.div
                className="size-20 bg-gold-100 dark:bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/20 dark:border-gold-500/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING.gentle}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="size-10 text-gold-500" />
                </motion.div>
              </motion.div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
                {step === 'approve' && 'Approving XAUT...'}
                {step === 'swap' && 'Executing Sell...'}
                {step === 'confirming' && 'Confirming Transaction...'}
              </h2>
              <p className="text-text-secondary dark:text-[#9CA3AF] mb-6">
                {step === 'approve' && 'Please confirm the approval in your wallet'}
                {step === 'swap' && 'Please confirm the swap in your wallet'}
                {step === 'confirming' && 'Waiting for blockchain confirmation'}
              </p>

              {/* Transaction Links */}
              <div className="space-y-2">
                {approvalTxHash && (
                  <a
                    href={`https://arbiscan.io/tx/${approvalTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm"
                  >
                    <span>Approval tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {swapTxHash && (
                  <a
                    href={`https://arbiscan.io/tx/${swapTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm"
                  >
                    <span>Swap tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Input Screen
  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors" aria-label="Go back to dashboard">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] ml-2">Sell Gold</h1>
        </div>
      </FadeUp>

      {/* Available Balance */}
      <FadeUp delay={0.06}>
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted dark:text-[#6B7280]">Available to sell</p>
              <p className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
                {balanceLoading ? (
                  <span className="inline-block w-24 h-6 skeleton rounded" />
                ) : (
                  formatGrams(maxGrams)
                )}
              </p>
              {xautBalance && (
                <p className="text-xs text-text-muted dark:text-[#6B7280]">{parseFloat(xautBalance).toFixed(6)} XAUT</p>
              )}
            </div>
            <button
              onClick={fetchBalance}
              disabled={balanceLoading}
              className="p-2 text-text-muted dark:text-[#6B7280] hover:text-gold-500 transition-colors rounded-xl hover:bg-surface-elevated dark:hover:bg-[#242424]"
              aria-label="Refresh balance"
            >
              <motion.div
                animate={balanceLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={balanceLoading ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
              >
                <RefreshCw className="size-5" />
              </motion.div>
            </button>
          </div>
        </div>
      </FadeUp>

      {/* Amount Input */}
      <FadeUp delay={0.12}>
        <div className="card-elevated p-6">
          <label htmlFor="grams-input" className="block text-sm font-medium text-text-muted dark:text-[#6B7280] mb-2">
            Enter amount in grams
          </label>
          <div className="relative">
            <input
              id="grams-input"
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="0"
              max={maxGrams}
              step="0.001"
              className="w-full text-3xl font-bold pl-4 pr-10 py-4 rounded-xl"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "grams-error" : undefined}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-text-muted dark:text-[#6B7280]">
              g
            </span>
          </div>

          {/* Input Error */}
          <AnimatePresence>
            {inputError && (
              <motion.p
                id="grams-error"
                className="text-error text-xs mt-2 flex items-center gap-1"
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

          {/* Preset Percentages */}
          <div className="flex gap-2 mt-4">
            {presetPercentages.map((pct) => (
              <motion.button
                key={pct}
                onClick={() => {
                  const calculated = (maxGrams * pct) / 100;
                  const value = pct === 100 ? maxGrams : Math.min(calculated, maxGrams);
                  setGrams(value.toString());
                }}
                disabled={maxGrams === 0}
                aria-label={`Set amount to ${pct}% of available balance`}
                className="flex-1 py-2 px-3 text-sm font-medium text-text-secondary dark:text-[#9CA3AF] bg-white dark:bg-[#1A1A1A] hover:bg-surface-elevated dark:hover:bg-[#242424] hover:text-text-primary dark:hover:text-[#F0F0F0] border border-border-subtle dark:border-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                whileTap={{ scale: 0.95 }}
                transition={SPRING.snappy}
              >
                {pct}%
              </motion.button>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Quote Display */}
      <AnimatePresence>
        {(quote || quoteLoading) && (
          <motion.div
            className="card-gold p-6 mt-4"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          >
            <h3 className="text-sm font-medium text-success mb-4">
              You will receive (estimated)
            </h3>

            {quoteLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-32 skeleton rounded mb-2" />
                <div className="h-4 w-24 skeleton rounded" />
              </div>
            ) : quote && (
              <>
                <div className="text-3xl font-bold text-text-primary dark:text-[#F0F0F0] mb-1">
                  ${quote.expectedUsdt}
                </div>
                <div className="text-sm text-text-muted dark:text-[#6B7280]">
                  Min: ${quote.minAmountOut} (with {quote.slippage}% slippage)
                </div>

                <div className="mt-4 pt-4 border-t border-border-subtle dark:border-[#2D2D2D] space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted dark:text-[#6B7280]">Selling</span>
                    <span className="font-medium text-text-primary dark:text-[#F0F0F0]">
                      {quote.xautAmount} XAUT ({formatGrams(parseFloat(grams))})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted dark:text-[#6B7280]">Network</span>
                    <span className="font-medium text-text-primary dark:text-[#F0F0F0]">Arbitrum</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted dark:text-[#6B7280]">Est. Gas</span>
                    <span className="font-medium text-text-primary dark:text-[#F0F0F0]">{quote.gasEstimate} ETH</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && step === 'input' && (
          <motion.div
            className="bg-error-light dark:bg-error/10 border border-error/30 text-error rounded-xl p-4 mt-4 flex items-start gap-2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Button */}
      <FadeUp delay={0.18}>
        <motion.button
          onClick={handleSell}
          disabled={!canSell}
          className="w-full bg-success hover:bg-success-dark disabled:bg-surface-elevated dark:disabled:bg-[#242424] disabled:text-text-muted dark:disabled:text-[#6B7280] disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl mt-6 transition-colors"
          whileTap={canSell ? { scale: 0.98 } : undefined}
          transition={SPRING.snappy}
        >
          {quoteLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
              Getting quote...
            </span>
          ) : (
            `Sell for $${quote?.expectedUsdt || '0'} USDT`
          )}
        </motion.button>
      </FadeUp>

      {/* Info */}
      <p className="text-xs text-text-muted dark:text-[#6B7280] text-center mt-4">
        Swap powered by Camelot DEX on Arbitrum. USDT will be sent to your wallet.
      </p>
    </div>
  );
}
