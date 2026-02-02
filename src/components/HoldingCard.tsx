'use client';

import { formatINR, formatGrams, formatPercent } from '@/lib/utils';
import type { HoldingWithValue, GoldPrice } from '@/types';
import Decimal from 'decimal.js';
import { Coins } from 'lucide-react';

interface HoldingCardProps {
  holding: HoldingWithValue | null;
  goldPrice: GoldPrice | null;
  loading: boolean;
}

export function HoldingCard({ holding, goldPrice, loading }: HoldingCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-border-subtle dark:border-[#2D2D2D] shadow-card">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-surface-elevated dark:bg-[#242424] rounded animate-pulse" />
          <div className="h-8 w-32 bg-surface-elevated dark:bg-[#242424] rounded animate-pulse" />
          <div className="h-4 w-40 bg-surface-elevated dark:bg-[#242424] rounded animate-pulse" />
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
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/20 dark:border-gold-500/30 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-text-muted dark:text-[#6B7280] text-sm">Your Gold Holdings</p>
          <h2 className="text-3xl font-bold mt-1 tabular-nums text-text-primary dark:text-[#F0F0F0]">
            {hasHoldings ? formatGrams(xautAmountGrams) : '0 g'}
          </h2>
        </div>
        <div className="size-12 bg-gold-100 dark:bg-gold-500/10 rounded-full flex items-center justify-center">
          <Coins className="size-6 text-gold-500" />
        </div>
      </div>

      {hasHoldings ? (
        <>
          <div className="bg-surface-elevated dark:bg-[#242424] rounded-xl p-4 mb-4">
            <p className="text-text-muted dark:text-[#6B7280] text-sm">Current Value</p>
            <p className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0]">{formatINR(currentValueInr)}</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-muted dark:text-[#6B7280] text-sm">Total Invested</p>
              <p className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                {formatINR(holding?.totalInvestedInr || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-muted dark:text-[#6B7280] text-sm">Profit/Loss</p>
              <p
                className={`font-semibold ${
                  profitLossInr >= 0 ? 'text-success' : 'text-error'
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
          <p className="text-text-muted dark:text-[#6B7280]">Start your gold savings journey</p>
          <a
            href="/buy"
            className="inline-block mt-3 bg-gold-gradient text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            Buy Gold
          </a>
        </div>
      )}
    </div>
  );
}
