'use client';

import { RefreshCw } from 'lucide-react';

interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, loading, onRefresh }: BalanceDisplayProps) {
  return (
    <div className="flex items-center justify-between bg-surface-elevated dark:bg-[#242424] rounded-xl p-4 mb-6">
      <div>
        <p className="text-xs text-text-muted dark:text-[#6B7280] mb-1">your USDT balance</p>
        {loading ? (
          <div className="h-6 w-24 bg-border-subtle dark:bg-[#2D2D2D] animate-pulse rounded" />
        ) : (
          <p className="text-lg font-semibold text-text-primary dark:text-[#F0F0F0]">
            {balance ? `${parseFloat(balance).toFixed(2)} USDT` : '0.00 USDT'}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 text-text-muted dark:text-[#6B7280] hover:text-text-secondary dark:hover:text-[#9CA3AF] transition-colors"
        aria-label="Refresh balance"
      >
        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
