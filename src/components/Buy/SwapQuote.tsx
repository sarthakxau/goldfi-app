'use client';

import type { SwapQuote } from '@/types';
import { formatGrams } from '@/lib/utils';
import { GRAMS_PER_OUNCE } from '@/lib/constants';

interface SwapQuoteDisplayProps {
  quote: SwapQuote | null;
  loading: boolean;
}

export function SwapQuoteDisplay({ quote, loading }: SwapQuoteDisplayProps) {
  if (loading) {
    return (
      <div className="bg-success-light dark:bg-success/10 rounded-xl p-4 mb-6 animate-pulse">
        <div className="h-4 w-20 bg-success/20 rounded mb-2" />
        <div className="h-6 w-32 bg-success/20 rounded" />
      </div>
    );
  }

  if (!quote) return null;

  const minGrams = Number(quote.minAmountOut) * GRAMS_PER_OUNCE;

  return (
    <div className="bg-success-light dark:bg-success/10 border border-success/20 dark:border-success/30 rounded-xl p-4 mb-6">
      <p className="text-xs text-success mb-1">you will receive approximately</p>
      <p className="text-2xl font-bold text-success-dark dark:text-success">
        {formatGrams(quote.expectedGrams)}
      </p>
      <div className="mt-2 space-y-1 text-xs text-success">
        <p>Min. output: {formatGrams(minGrams)}</p>
        <p>Slippage: {quote.slippage}%</p>
        <p>Est. gas: ~{parseFloat(quote.gasEstimate).toFixed(6)} ETH</p>
      </div>
    </div>
  );
}
