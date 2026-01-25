'use client';

import { formatINR, formatGrams, formatPercent } from '@/lib/utils';
import type { HoldingWithValue, GoldPrice } from '@/types';
import Decimal from 'decimal.js';

interface HoldingCardProps {
  holding: HoldingWithValue | null;
  goldPrice: GoldPrice | null;
  loading: boolean;
}

export function HoldingCard({ holding, goldPrice, loading }: HoldingCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-6 text-white">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
          <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-40 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Calculate values if holding and price exist
  let currentValueInr = 0;
  let profitLossInr = 0;
  let profitLossPercent = 0;
  let xautAmountGrams = 0;

  if (holding && goldPrice) {
    const xautAmount = new Decimal(holding.xautAmount);
    xautAmountGrams = xautAmount.times(31.1035).toNumber();
    currentValueInr = xautAmount.times(goldPrice.priceInr).toNumber();
    const invested = new Decimal(holding.totalInvestedInr);
    profitLossInr = currentValueInr - invested.toNumber();
    profitLossPercent = invested.isZero()
      ? 0
      : new Decimal(profitLossInr).dividedBy(invested).times(100).toNumber();
  }

  const hasHoldings = holding && new Decimal(holding.xautAmount).greaterThan(0);

  return (
    <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gold-100 text-sm">Your Gold Holdings</p>
          <h2 className="text-3xl font-bold mt-1">
            {hasHoldings ? formatGrams(xautAmountGrams) : '0 g'}
          </h2>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🪙</span>
        </div>
      </div>

      {hasHoldings ? (
        <>
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-gold-100 text-sm">Current Value</p>
            <p className="text-2xl font-bold">{formatINR(currentValueInr)}</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gold-100 text-sm">Total Invested</p>
              <p className="font-semibold">
                {formatINR(holding?.totalInvestedInr || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gold-100 text-sm">Profit/Loss</p>
              <p
                className={`font-semibold ${
                  profitLossInr >= 0 ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {formatINR(Math.abs(profitLossInr))}{' '}
                <span className="text-sm">
                  ({formatPercent(profitLossPercent)})
                </span>
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gold-100">Start your gold savings journey</p>
          <a
            href="/buy"
            className="inline-block mt-3 bg-white text-gold-600 font-semibold py-2 px-6 rounded-lg hover:bg-gold-50 transition-colors"
          >
            Buy Gold
          </a>
        </div>
      )}
    </div>
  );
}
