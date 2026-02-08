'use client';

import type { SwapQuote } from '@/types';
import { formatGrams } from '@/lib/utils';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface SwapQuoteDisplayProps {
  quote: SwapQuote | null;
  loading: boolean;
}

export function SwapQuoteDisplay({ quote, loading }: SwapQuoteDisplayProps) {
  if (loading) {
    return (
      <motion.div
        className="bg-success-light dark:bg-success/10 rounded-xl p-4 mb-6 animate-pulse"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
      >
        <div className="h-4 w-20 bg-success/20 rounded mb-2" />
        <div className="h-6 w-32 bg-success/20 rounded" />
      </motion.div>
    );
  }

  if (!quote) return null;

  const minGrams = Number(quote.minAmountOut) * GRAMS_PER_OUNCE;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="quote"
        className="bg-success-light dark:bg-success/10 border border-success/20 dark:border-success/30 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
      >
        <p className="text-xs text-success mb-1">you will receive approximately</p>
        <motion.p
          className="text-2xl font-bold text-success-dark dark:text-success"
          key={quote.expectedGrams}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO, delay: 0.05 }}
        >
          {formatGrams(quote.expectedGrams)}
        </motion.p>
        <motion.div
          className="mt-2 space-y-1 text-xs text-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.fast, delay: 0.1 }}
        >
          <p>Min. output: {formatGrams(minGrams)}</p>
          <p>Slippage: {quote.slippage}%</p>
          <p>Est. gas: ~{parseFloat(quote.gasEstimate).toFixed(6)} ETH</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
