'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, PiggyBank, BadgePercent, Calendar } from 'lucide-react';
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
    <div className="p-6 max-w-lg mx-auto min-h-screen gold-radial-bg">
      {/* Header / Price Strip */}
      <div className="flex items-center justify-between mb-8">
        {/* Live Price Display - Left */}
        <Link href="/gold-charts" className="flex flex-col items-start group">
          <span className="text-[10px] tracking-widest text-cream-muted/50 font-medium uppercase group-hover:text-cream-muted/70 transition-colors">Live Price</span>
          <div className="flex items-center gap-2">
            {priceLoading ? (
              <div className="h-6 w-28 skeleton rounded" />
            ) : (
              <span className="font-serif text-xl text-gold-400 tabular-nums group-hover:text-gold-300 transition-colors">
                {formatINR(buyingPricePer10g)}<span className="text-cream-muted/40 text-sm font-sans">/10g</span>
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={refreshing}
              className="p-1.5 text-cream-muted/40 hover:text-gold-400 transition-colors rounded-full"
              aria-label="Refresh price"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </Link>

        {/* User Profile - Right */}
        <div className="flex flex-col items-end">
          <Link href="/account" className="size-10 rounded-full overflow-hidden border-2 border-gold-500/30 shadow-gold-glow">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.email?.address?.split('@')[0] || 'User'}&backgroundColor=D4A012&textColor=ffffff`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>

      {/* My Gold Holdings */}
      <section className="mb-8">
        <div className="card-gold p-8 relative">
          {/* Luxury gold glow behind the card */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Value Display */}
            <div className="relative mb-2">
              <h1 className="text-4xl font-serif text-cream tabular-nums tracking-tight">
                {getDisplayValue()}
              </h1>
            </div>

            {/* Label + Unit Selector */}
            <div className="flex items-center justify-between">
              <p className="font-serif text-cream-muted/60 text-sm">my holdings</p>
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
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm
              ${profitLossInr >= 0 
                ? 'bg-success/15 text-success border border-success/20' 
                : 'bg-error/15 text-error border border-error/20'}
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
            className="bg-gold-gradient text-[#271F12] font-bold py-3.5 px-10 rounded-full text-sm border-2 border-yellow-400"
          >
            make your first investment
          </Link>
        </div>
      )}

      {/* Gold Chart - Blurred with Coming Soon */}
      {/* <section className="mb-8 relative">
        <div className="blur-sm pointer-events-none select-none">
          <GoldChart />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-surface-card/90 backdrop-blur-sm px-6 py-3 rounded-full border border-border-subtle">
            <span className="text-cream-muted/60 font-medium text-sm">coming soon</span>
          </div>
        </div>
      </section> */}

      {/* Primary Action Buttons - Golden Row */}
      <div className="flex gap-3 mb-6">
        {/* Start Savings - 70% */}
        <Link 
          href="/buy" 
          className="flex-[7] bg-gold-gradient text-surface font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2"
        >
          {/* <PiggyBank className="size-5" /> */}
          <span>start savings</span>
        </Link>

        {/* Redeem - 30% */}
        <Link 
          href="/sell" 
          className="flex-[3] bg-gold-gradient text-surface font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2"
        >
          <BadgePercent className="size-5" />
        </Link>
      </div>

      {/* Auto Savings Plan Button */}
      <button
        onClick={() => setShowAutoSavingsModal(true)}
        className="w-full card p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400">
            <Calendar className="size-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-cream text-sm">auto savings plan</p>
            <p className="text-xs text-cream-muted/40">set up recurring investments</p>
          </div>
        </div>
        <span className="badge badge-gold text-[10px]">coming soon</span>
      </button>

      {/* Auto Savings Modal */}
      {showAutoSavingsModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-elevated p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-16 bg-gold-500/15 rounded-full flex items-center justify-center mb-5">
              <Calendar className="size-8 text-gold-400" />
            </div>
            <h3 className="text-2xl font-serif text-cream mb-2">Auto Savings Plan</h3>
            <p className="text-cream-muted/60 mb-6 text-sm">
              Set up automatic recurring investments in gold. Choose your amount, frequency, and let your savings grow effortlessly.
            </p>
            <div className="space-y-3">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-4 text-left">
                <p className="text-cream-muted/40 text-xs mb-1">Features coming soon</p>
                <ul className="text-cream-muted/60 text-sm space-y-1">
                  <li>• Daily, weekly, or monthly savings</li>
                  <li>• Flexible amount from ₹100</li>
                  <li>• Pause or cancel anytime</li>
                </ul>
              </div>
              <button
                onClick={() => setShowAutoSavingsModal(false)}
                className="w-full bg-surface-card text-cream font-medium py-3.5 px-8 rounded-xl border border-border-subtle hover:border-gold-500/30 transition-all"
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
