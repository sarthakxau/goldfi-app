'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSellSwap } from '@/hooks/useSellSwap';
import { formatINR, formatGrams, debounce } from '@/lib/utils';
import { MIN_GRAMS_SELL, MAX_GRAMS_SELL, QUOTE_REFRESH_INTERVAL } from '@/lib/constants';
import { ArrowLeft, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    step === 'input';

  const handleSell = useCallback(() => {
    if (!grams) {
      console.log('[SellPage] No grams input, returning early');
      return;
    }

    console.log('[SellPage] Calling executeSell with grams:', grams);
    executeSell(grams);
  }, [grams, quote, executeSell]);

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
      <div className="p-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => step === 'success' || step === 'error' ? handleDone() : undefined}
            disabled={step !== 'success' && step !== 'error'}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2">Selling Gold</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Success State */}
          {step === 'success' && (
            <div className="text-center">
              <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="size-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sell Successful!</h2>
              <p className="text-gray-600 mb-6">
                You sold {formatGrams(parseFloat(grams))} for ~${quote?.expectedUsdt} USDT
              </p>
              {swapTxHash && (
                <a
                  href={`https://arbiscan.io/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8"
                >
                  <span>View on Arbiscan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={handleDone}
                className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center">
              <div className="size-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="size-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sell Failed</h2>
              <p className="text-red-600 mb-6">{error || 'Something went wrong'}</p>
              <div className="space-y-3 w-full">
                <button
                  onClick={handleRetry}
                  className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleDone}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Processing States */}
          {['approve', 'swap', 'confirming'].includes(step) && (
            <div className="text-center">
              <div className="size-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="size-10 text-amber-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'approve' && 'Approving XAUT...'}
                {step === 'swap' && 'Executing Sell...'}
                {step === 'confirming' && 'Confirming Transaction...'}
              </h2>
              <p className="text-gray-600 mb-6">
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
                    className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
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
                    className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
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
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold ml-2">Sell Gold</h1>
      </div>

      {/* Available Balance */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Available to sell</p>
            <p className="text-xl font-bold text-gray-900">
              {balanceLoading ? (
                <span className="inline-block w-24 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatGrams(maxGrams)
              )}
            </p>
            {xautBalance && (
              <p className="text-xs text-gray-500">{parseFloat(xautBalance).toFixed(6)} XAUT</p>
            )}
          </div>
          <button
            onClick={fetchBalance}
            disabled={balanceLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw className={`size-5 ${balanceLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Enter amount in grams
        </label>
        <div className="relative">
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="0"
            max={maxGrams}
            step="0.001"
            className="w-full text-3xl font-bold pl-4 pr-10 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
            g
          </span>
        </div>

        {/* Input Error */}
        {inputError && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {inputError}
          </p>
        )}

        {/* Preset Percentages */}
        <div className="flex gap-2 mt-4">
          {presetPercentages.map((pct) => (
            <button
              key={pct}
              onClick={() => setGrams(((maxGrams * pct) / 100).toFixed(3))}
              disabled={maxGrams === 0}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Quote Display */}
      {(quote || quoteLoading) && (
        <div className="bg-green-50 rounded-2xl p-6 mt-4 border border-green-100">
          <h3 className="text-sm font-medium text-green-800 mb-4">
            You will receive (estimated)
          </h3>

          {quoteLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-green-200 rounded mb-2" />
              <div className="h-4 w-24 bg-green-200 rounded" />
            </div>
          ) : quote && (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                ${quote.expectedUsdt} USDT
              </div>
              <div className="text-sm text-green-700">
                Min: ${quote.minAmountOut} (with {quote.slippage}% slippage)
              </div>

              <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Selling</span>
                  <span className="font-medium text-green-900">
                    {quote.xautAmount} XAUT ({formatGrams(parseFloat(grams))})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Network</span>
                  <span className="font-medium text-green-900">Arbitrum</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Est. Gas</span>
                  <span className="font-medium text-green-900">{quote.gasEstimate} ETH</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && step === 'input' && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mt-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sell Button */}
      <button
        onClick={handleSell}
        disabled={!canSell}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl mt-6 transition-colors"
      >
        {quoteLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Getting quote...
          </span>
        ) : (
          `Sell for $${quote?.expectedUsdt || '0'} USDT`
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Swap powered by Camelot DEX on Arbitrum. USDT will be sent to your wallet.
      </p>
    </div>
  );
}
