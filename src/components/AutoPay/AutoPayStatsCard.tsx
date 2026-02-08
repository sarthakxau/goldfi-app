'use client';

import { Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { SPRING } from '@/lib/animations';
import { formatINR } from '@/lib/utils';
import type { AutoPayStats } from '@/types';

interface AutoPayStatsCardProps {
  stats: AutoPayStats;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AutoPayStatsCard({ stats }: AutoPayStatsCardProps) {
  return (
    <motion.div
      className="card-gold p-6 relative overflow-hidden"
      whileTap={{ scale: 0.99 }}
      transition={SPRING.gentle}
    >
      <div className="absolute inset-0 gold-shimmer pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-3">
          Monthly Savings
        </p>

        {/* Large amount */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-sm text-text-muted dark:text-[#6B7280]">&#8377;</span>
          <span className="text-5xl font-bold text-text-primary dark:text-[#F0F0F0] tabular-nums tracking-tight">
            {stats.monthlySavings.toLocaleString('en-IN')}
          </span>
          <span className="text-base text-text-muted dark:text-[#6B7280] ml-1">/month</span>
        </div>

        {/* Summary line */}
        <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mb-4">
          Total Saved: {formatINR(stats.totalSaved)}{' '}<br />
          <span className="text-text-muted dark:text-[#6B7280]">&middot;</span>{' '}
          Gold Accumulated: {stats.totalGoldAccumulated.toFixed(1)}g
        </p>

        {/* Next execution badge */}
        {stats.nextExecution && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20">
            <Calendar className="size-4 text-gold-500" />
            <span className="text-sm font-medium text-gold-500">
              Next: {formatShortDate(stats.nextExecution)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
