'use client';

import { formatINR } from '@/lib/utils';
import type { GoldPrice } from '@/types';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface PriceDisplayProps {
  price: GoldPrice | null;
  loading: boolean;
}

export function PriceDisplay({ price, loading }: PriceDisplayProps) {
  if (loading && !price) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-border-subtle dark:border-[#2D2D2D] mb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 skeleton" />
            <div className="h-6 w-28 skeleton" />
          </div>
          <div className="h-4 w-16 skeleton" />
        </div>
      </div>
    );
  }

  if (!price) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-border-subtle dark:border-[#2D2D2D] mb-4">
        <p className="text-text-muted dark:text-[#6B7280] text-sm">Unable to fetch gold price</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-border-subtle dark:border-[#2D2D2D] mb-4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary dark:text-[#9CA3AF] text-sm font-medium">Live Gold Price</p>
          <p className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            {formatINR(price.pricePerGramInr)}
            <span className="text-sm font-normal text-text-muted dark:text-[#6B7280]">/gram</span>
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-text-muted dark:text-[#6B7280]">
            <span className="w-2 h-2 bg-success rounded-full live-dot" />
            Live
          </div>
          <p className="text-xs text-text-muted dark:text-[#6B7280] mt-1">
            ${price.priceUsd.toFixed(2)}/oz
          </p>
        </div>
      </div>
    </motion.div>
  );
}
