'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, Plus, BadgePercent, Sparkles } from 'lucide-react';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { GoldChart } from '@/components/GoldChart';

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

  const [viewMode, setViewMode] = useState<'grams' | 'inr'>('grams');
  const [showRewardsModal, setShowRewardsModal] = useState(false);

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

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen gold-radial-bg">
      {/* Header / Price Strip */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* Empty for asymmetric layout */}
        </div>
        <div className="flex items-center gap-3">
          {/* Live Price Display */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-widest text-cream-muted/50 font-medium uppercase">Live Price</span>
            <div className="flex items-center gap-2">
              {priceLoading ? (
                <div className="h-6 w-28 skeleton rounded" />
              ) : (
                <span className="font-serif text-xl text-gold-400 tabular-nums">
                  {formatINR(buyingPricePer10g)}<span className="text-cream-muted/40 text-sm font-sans">/10g</span>
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 text-cream-muted/40 hover:text-gold-400 transition-colors rounded-full"
                aria-label="Refresh price"
              >
                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Gold Card */}
      <section className="mb-8">
        <h2 className="font-serif text-cream-muted/60 text-lg mb-4 ml-1">my gold</h2>
        <div className="card-gold p-8 text-center relative">
          {/* Luxury gold glow behind the card */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/10 to-transparent pointer-events-none" />
          
          {/* Value Display */}
          <div className="relative mb-3">
            <h1 className="text-5xl font-serif text-cream tabular-nums tracking-tight">
              {viewMode === 'grams'
                ? (hasHoldings ? `${formatGrams(xautAmountGrams)}` : '0.00 g')
                : (hasHoldings ? formatINR(currentValueInr) : '₹0.00')
              }
            </h1>
          </div>

          {/* Toggle Switch */}
          <button 
            onClick={() => setViewMode(viewMode === 'grams' ? 'inr' : 'grams')}
            className="absolute right-5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-elevated border border-border-subtle text-cream-muted/60 hover:text-gold-400 hover:border-gold-500/30 transition-all"
            title="Switch View"
          >
            {viewMode === 'grams' ? 'INR' : 'grams'}
          </button>
        </div>

        {/* Returns Badge */}
        {hasHoldings && (
          <div className="flex justify-center -mt-3 relative z-10">
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
            className="gold-shimmer text-surface font-bold py-3.5 px-10 rounded-full text-sm transform -rotate-1 hover:rotate-0 transition-transform"
          >
            make your first investment
          </Link>
        </div>
      )}

      {/* Gold Chart */}
      <section className="mb-10">
        <GoldChart />
      </section>

      {/* Action Grid */}
      <div className="grid grid-cols-3 gap-6 px-2">
        {/* Buy Gold */}
        <Link href="/buy" className="flex flex-col items-center gap-3 group">
          <div className="size-16 rounded-2xl border border-border-subtle flex items-center justify-center bg-surface-card group-hover:border-gold-500/40 group-hover:shadow-gold-glow transition-all duration-300">
            <Plus className="size-7 text-cream-muted/60 group-hover:text-gold-400" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-cream-muted/50 group-hover:text-cream-muted transition-colors">buy gold</span>
        </Link>

        {/* Rewards */}
        <button
          onClick={() => setShowRewardsModal(true)}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="size-16 rounded-2xl border border-border-subtle flex items-center justify-center bg-surface-card group-hover:border-gold-500/40 group-hover:shadow-gold-glow transition-all duration-300">
            <Sparkles className="size-7 text-cream-muted/60 group-hover:text-gold-400" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-cream-muted/50 group-hover:text-cream-muted transition-colors">rewards</span>
        </button>

        {/* Redeem / Sell */}
        <Link href="/sell" className="flex flex-col items-center gap-3 group">
          <div className="size-16 rounded-2xl border border-border-subtle flex items-center justify-center bg-surface-card group-hover:border-gold-500/40 group-hover:shadow-gold-glow transition-all duration-300">
            <BadgePercent className="size-7 text-cream-muted/60 group-hover:text-gold-400" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-cream-muted/50 group-hover:text-cream-muted transition-colors">redeem</span>
        </Link>
      </div>

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-elevated p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-16 bg-gold-500/15 rounded-full flex items-center justify-center mb-5">
              <Sparkles className="size-8 text-gold-400" />
            </div>
            <h3 className="text-2xl font-serif text-cream mb-2">Rewards Coming Soon!</h3>
            <p className="text-cream-muted/60 mb-6 text-sm">
              We&apos;re working on something exciting. Check back later for exclusive rewards.
            </p>
            <button
              onClick={() => setShowRewardsModal(false)}
              className="w-full bg-surface-card text-cream font-medium py-3.5 px-8 rounded-xl border border-border-subtle hover:border-gold-500/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
