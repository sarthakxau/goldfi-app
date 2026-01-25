'use client';

import { formatINR } from '@/lib/utils';
import type { GoldPrice } from '@/types';

interface PriceDisplayProps {
  price: GoldPrice | null;
  loading: boolean;
}

export function PriceDisplay({ price, loading }: PriceDisplayProps) {
  if (loading && !price) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
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
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
        <p className="text-gray-500 text-sm">Unable to fetch gold price</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800 text-sm font-medium">Live Gold Price</p>
          <p className="text-xl font-bold text-gray-900">
            {formatINR(price.pricePerGramInr)}
            <span className="text-sm font-normal text-gray-500">/gram</span>
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ${price.priceUsd.toFixed(2)}/oz
          </p>
        </div>
      </div>
    </div>
  );
}
