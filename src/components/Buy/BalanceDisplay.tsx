'use client';

import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, loading, onRefresh }: BalanceDisplayProps) {
  return (
    <motion.div
      className="flex items-center justify-between bg-surface-elevated dark:bg-[#242424] rounded-xl p-4 mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
    >
      <div>
        <p className="text-xs text-text-muted dark:text-[#6B7280] mb-1">your USDT balance</p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              className="h-6 w-24 bg-border-subtle dark:bg-[#2D2D2D] animate-pulse rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast }}
            />
          ) : (
            <motion.p
              key="balance"
              className="text-lg font-semibold text-text-primary dark:text-[#F0F0F0]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
            >
              {balance ? `${parseFloat(balance).toFixed(2)} USDT` : '0.00 USDT'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 text-text-muted dark:text-[#6B7280] hover:text-text-secondary dark:hover:text-[#9CA3AF] transition-colors"
        aria-label="Refresh balance"
      >
        <motion.div
          animate={loading ? { rotate: 360 } : { rotate: 0 }}
          transition={loading ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        >
          <RefreshCw className="size-4" />
        </motion.div>
      </button>
    </motion.div>
  );
}
