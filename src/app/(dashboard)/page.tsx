'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, PiggyBank, BadgePercent, TrendingUp, Calendar } from 'lucide-react';
import Decimal from 'decimal.js';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = usePrivy();
  const {
    goldPrice,
    holding,
    priceLoading,
    setGoldPrice,
    setHolding,
    setPriceLoading,
    setHoldingLoading,
    setPriceError,
    setHoldingError,
    refreshing,
    setRefreshing,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'grams' | 'inr' | 'scudo'>('grams');
  const [showAutoSavingsModal, setShowAutoSavingsModal] = useState(false);

  const fetchPrice = useCallback(async () => {
    try {
      setPriceLoading(true);
      const res = await fetch('/api/prices');
      const data = await res.json();
      if (data.success) {
        setGoldPrice(data.data);
      } else {
        setPriceError(data.error);
      }
    } catch {
      setPriceError('Failed to fetch price');
    } finally {
      setPriceLoading(false);
    }
  }, [setGoldPrice, setPriceLoading, setPriceError]);

  const fetchHoldings = useCallback(async () => {
    try {
      setHoldingLoading(true);
      const walletAddress = user?.wallet?.address;
      const url = walletAddress
        ? `/api/holdings?walletAddress=${encodeURIComponent(walletAddress)}`
        : '/api/holdings';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setHolding(data.data);
      } else {
        setHoldingError(data.error);
      }
    } catch {
      setHoldingError('Failed to fetch holdings');
    } finally {
      setHoldingLoading(false);
    }
  }, [user?.wallet?.address, setHolding, setHoldingLoading, setHoldingError]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPrice(), fetchHoldings()]);
    setRefreshing(false);
  }, [fetchPrice, fetchHoldings, setRefreshing]);

  useEffect(() => {
    fetchPrice();
    fetchHoldings();

    const priceInterval = setInterval(fetchPrice, 60000);
    return () => clearInterval(priceInterval);
  }, [fetchPrice, fetchHoldings]);

  // Derived State
  const xautAmount = holding ? new Decimal(holding.xautAmount) : new Decimal(0);
  const xautAmountGrams = holding?.xautAmountGrams ?? xautAmount.times(31.1035).toNumber();
  const buyingPricePerGram = goldPrice ? goldPrice.pricePerGramInr : 0;
  const buyingPricePer10g = buyingPricePerGram * 10; // Price per tola (10g)
  const currentValueInr = holding?.currentValueInr ?? xautAmount.times(goldPrice?.priceInr || 0).toNumber();

  // Calculate Returns
  const totalInvested = holding ? new Decimal(holding.totalInvestedInr) : new Decimal(0);
  const profitLossInr = holding?.profitLossInr ?? (currentValueInr - totalInvested.toNumber());
  const profitLossGrams = buyingPricePerGram > 0 ? profitLossInr / buyingPricePerGram : 0;

  const hasHoldings = xautAmount.greaterThan(0);

  const getDisplayValue = () => {
    if (!hasHoldings) {
      if (viewMode === 'grams') return '0.00 g';
      if (viewMode === 'inr') return '₹0.00';
      if (viewMode === 'scudo') return '0.00 scudo';
    }

    if (viewMode === 'grams') return `${formatGrams(xautAmountGrams)}`;
    if (viewMode === 'inr') return formatINR(currentValueInr);
    // 1 Scudo = 1/1000 XAUT
    return `${xautAmount.times(1000).toFixed(2)} scudo`;
  };

  const goldHoldingUnits = [
    { key: 'grams', label: 'grams' },
    { key: 'inr', label: '₹' },
    { key: 'scudo', label: 'scudo' },
  ] as const;


  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header / Price Strip */}
      <div className="flex items-center justify-between mb-8">
        {/* Live Price Display - Left */}
        <Link href="/gold-charts" className="flex flex-col items-start group">
          <span className="text-[10px] tracking-widest text-text-muted font-medium uppercase group-hover:text-text-secondary transition-colors">Live Price</span>
          <div className="flex items-center gap-2">
            {priceLoading ? (
              <div className="h-6 w-28 skeleton rounded" />
            ) : (
              <span className="text-xl font-bold text-gold-500 tabular-nums group-hover:text-gold-400 transition-colors">
                {formatINR(buyingPricePer10g)}<span className="text-text-muted text-sm">/10g</span>
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={refreshing}
              className="p-1.5 text-text-muted hover:text-gold-500 transition-colors rounded-full"
              aria-label="Refresh price"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </Link>

        {/* User Profile - Right */}
        <div className="flex flex-col items-end">
          <Link href="/account" className="size-10 rounded-full overflow-hidden border-2 border-gold-500/30">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.email?.address?.split('@')[0] || 'User'}&backgroundColor=B8860B&textColor=ffffff`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>

      {/* My Gold Holdings */}
      <section className="mb-8">
        <div className="card-gold p-8 relative">
          <div className="relative z-10">
            {/* Value Display */}
            <div className="relative mb-2">
              <h1 className="text-5xl font-bold text-text-primary tabular-nums tracking-tight">
                {getDisplayValue()}
              </h1>
            </div>

            {/* Label + Unit Selector */}
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm font-medium">my holdings</p>
              <div className="segmented-control !p-0.5">
                {goldHoldingUnits.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`segmented-control-item !px-3 !py-1.5 !text-xs ${viewMode === key ? 'segmented-control-item-active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Returns Badge */}
        {hasHoldings && (
          <div className="flex justify-center -mt-4 relative z-10">
            <div className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
              ${profitLossInr >= 0
                ? 'bg-success-light text-success border border-success/20'
                : 'bg-error-light text-error border border-error/20'}
            `}>
              <span className="tabular-nums">7d returns: {profitLossInr > 0 ? '+' : ''}{formatGrams(profitLossGrams)} ({formatINR(profitLossInr)})</span>
            </div>
          </div>
        )}
      </section>

      {/* First Time User Banner */}
      {!hasHoldings && (
        <div className="mb-10 flex justify-center">
          <Link
            href="/buy"
            className="bg-gold-gradient text-white font-bold py-3.5 px-10 rounded-full text-sm"
          >
            make your first investment
          </Link>
        </div>
      )}

      {/* Primary Action Buttons - Stacked */}
      <div className="flex flex-col gap-3 mb-6">
        <Link
          href="/buy"
          className="w-full bg-gold-gradient text-white font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2"
        >
          <PiggyBank className="size-5" />
          <span>start savings</span>
        </Link>

        <Link
          href="/yield"
          className="w-full bg-white border border-gold-500/30 text-gold-500 font-semibold py-4 rounded-2xl text-center flex items-center justify-center gap-2 hover:border-gold-500/50 transition-all"
        >
          <TrendingUp className="size-5" />
          <span>earn up to 15% on gold</span>
        </Link>

        <Link
          href="/sell"
          className="w-full bg-white border border-border-subtle text-text-secondary font-semibold py-4 rounded-2xl text-center flex items-center justify-center gap-2 hover:border-gold-500/30 transition-all"
        >
          <BadgePercent className="size-5" />
          <span>redeem your gold</span>
        </Link>
      </div>

      {/* Auto Savings Plan Button */}
      <button
        onClick={() => setShowAutoSavingsModal(true)}
        className="w-full card p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-500">
            <Calendar className="size-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-text-primary text-sm">auto savings plan</p>
            <p className="text-xs text-text-muted">set up recurring investments</p>
          </div>
        </div>
        <span className="badge badge-gold text-[10px]">coming soon</span>
      </button>

      {/* Auto Savings Modal */}
      {showAutoSavingsModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border-subtle p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-16 bg-gold-100 rounded-full flex items-center justify-center mb-5">
              <Calendar className="size-8 text-gold-500" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Auto Savings Plan</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Set up automatic recurring investments in gold. Choose your amount, frequency, and let your savings grow effortlessly.
            </p>
            <div className="space-y-3">
              <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 text-left">
                <p className="text-text-muted text-xs mb-1">Features coming soon</p>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• Daily, weekly, or monthly savings</li>
                  <li>• Flexible amount from ₹100</li>
                  <li>• Pause or cancel anytime</li>
                </ul>
              </div>
              <button
                onClick={() => setShowAutoSavingsModal(false)}
                className="w-full bg-surface-elevated text-text-primary font-medium py-3.5 px-8 rounded-xl border border-border-subtle hover:border-gold-500/30 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
