'use client';

import { TrendingUp } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { AutoPayTransaction } from '@/types';

interface AutoPayTransactionItemProps {
  transaction: AutoPayTransaction;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AutoPayTransactionItem({ transaction }: AutoPayTransactionItemProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      {/* Icon */}
      <div className="size-10 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="size-4 text-gold-500" />
      </div>

      {/* Left: grams + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0] tabular-nums">
          +{transaction.gramsPurchased.toFixed(3)}g
        </p>
        <p className="text-xs text-text-muted dark:text-[#6B7280]">
          {formatShortDate(transaction.executedAt)}
        </p>
      </div>

      {/* Right: amount + price */}
      <div className="text-right">
        <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0] tabular-nums">
          {formatINR(transaction.amount)}
        </p>
        <p className="text-xs text-text-muted dark:text-[#6B7280] tabular-nums">
          @ {formatINR(transaction.pricePerGram)}/g
        </p>
      </div>
    </div>
  );
}
