'use client';

import { ChevronRight, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { SPRING } from '@/lib/animations';
import { formatINR } from '@/lib/utils';
import type { AutoPay } from '@/types';

interface AutoPayCardProps {
  autoPay: AutoPay;
  onPress: (id: string) => void;
}

const frequencyLabels: Record<AutoPay['frequency'], string> = {
  daily: 'daily',
  weekly: 'weekly',
  biweekly: 'bi-weekly',
  monthly: 'monthly',
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AutoPayCard({ autoPay, onPress }: AutoPayCardProps) {
  const isActive = autoPay.status === 'active';

  return (
    <motion.button
      className="card p-5 w-full text-left"
      whileTap={{ scale: 0.98 }}
      transition={SPRING.snappy}
      onClick={() => onPress(autoPay.id)}
    >
      {/* Top row: icon + name + status + chevron */}
      <div className="flex items-center gap-3 mb-4">
        {/* Icon */}
        <div
          className={`size-12 rounded-xl flex items-center justify-center ${
            isActive
              ? 'bg-gold-100 dark:bg-gold-500/10'
              : 'bg-surface-elevated dark:bg-[#242424]'
          }`}
        >
          <Target
            className={`size-5 ${
              isActive ? 'text-gold-500' : 'text-text-muted dark:text-[#6B7280]'
            }`}
          />
        </div>

        {/* Name + amount */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary dark:text-[#F0F0F0] truncate">
            {autoPay.name}
          </p>
          <p className="text-sm text-text-muted dark:text-[#6B7280]">
            {formatINR(autoPay.amount)}/{frequencyLabels[autoPay.frequency]}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`text-xs font-semibold tracking-wide px-3 py-1.5 rounded-lg border ${
            isActive
              ? 'text-success bg-success/10 border-success/20'
              : 'text-warning dark:text-warning bg-warning/10 border-warning/20'
          }`}
        >
          {isActive ? 'ACTIVE' : 'PAUSED'}
        </span>

        <ChevronRight className="size-5 text-text-muted dark:text-[#6B7280] flex-shrink-0" />
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle dark:border-[#2D2D2D] mb-4" />

      {/* Stats row */}
      <div className="flex">
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
            Gold
          </p>
          <p className="text-sm font-semibold text-gold-500 tabular-nums">
            {autoPay.goldAccumulated.toFixed(2)}g
          </p>
        </div>
        <div className="flex-1 border-l border-border-subtle dark:border-[#2D2D2D] pl-4">
          <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
            Invested
          </p>
          <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0] tabular-nums">
            {formatINR(autoPay.totalInvested)}
          </p>
        </div>
        <div className="flex-1 border-l border-border-subtle dark:border-[#2D2D2D] pl-4">
          <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
            Since
          </p>
          <p className="text-sm font-medium text-text-secondary dark:text-[#9CA3AF]">
            {formatShortDate(autoPay.startDate)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
