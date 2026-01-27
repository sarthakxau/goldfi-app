'use client';

import { RefreshCw } from 'lucide-react';

interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, loading, onRefresh }: BalanceDisplayProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-1">your USDT balance</p>
        {loading ? (
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
        ) : (
          <p className="text-lg font-semibold text-gray-900">
            {balance ? `${parseFloat(balance).toFixed(2)} USDT` : '0.00 USDT'}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Refresh balance"
      >
        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
