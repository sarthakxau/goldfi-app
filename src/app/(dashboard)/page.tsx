'use client';

import { usePrivy, getAccessToken } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, Calendar, Info } from 'lucide-react';
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

  const [viewMode, setViewMode] = useState<'grams' | 'inr' | 'usd' | 'scudo'>('grams');
  const [showAutoSavingsModal, setShowAutoSavingsModal] = useState(false);

  const fetchPrice = useCallback(async () => {
    try {
      setPriceLoading(true);
      // Price endpoint is public, no auth needed
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
      
      // Include auth token for authenticated holdings fetch
      const token = await getAccessToken();
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
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
    if (viewMode === 'usd') {
      const usdValue = xautAmount.times(goldPrice?.priceUsd || 0).toNumber();
      return `$${usdValue.toFixed(2)}`;
    }
    // 1 Scudo = 1/1000 XAUT
    return `${xautAmount.times(1000).toFixed(2)} scudo`;
  };

  const goldHoldingUnits = [
    { key: 'grams', label: 'grams' },
    { key: 'inr', label: '₹' },
    { key: 'usd', label: '$' },
    { key: 'scudo', label: 'scudo' },
  ] as const;


  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header / Price Strip */}
      <div className="flex items-center justify-between mb-8">
        {/* Live Price Display - Left */}
        <Link href="/gold-charts" className="flex flex-col items-start group">
          <span className="text-[10px] tracking-widest text-text-muted dark:text-[#6B7280] font-medium uppercase group-hover:text-text-secondary transition-colors">Live Price</span>
          <div className="flex items-center gap-2">
            {priceLoading ? (
              <div className="h-6 w-28 skeleton rounded" />
            ) : (
              <span className="text-xl font-bold text-gold-500 tabular-nums group-hover:text-gold-400 transition-colors">
                {formatINR(buyingPricePer10g)}<span className="text-text-muted dark:text-[#6B7280] text-sm">/10g</span>
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={refreshing}
              className="p-1.5 text-text-muted dark:text-[#6B7280] hover:text-gold-500 transition-colors rounded-full"
              aria-label="Refresh price"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </Link>

        {/* User Profile - Right */}
        <div className="flex flex-col items-end">
          <Link href="/account" className="size-10 rounded-full overflow-hidden border-2 border-gold-500/30" aria-label="Account settings">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.email?.address?.split('@')[0] || 'User'}&backgroundColor=B8860B&textColor=ffffff`}
              alt=""
              className="w-full h-full object-cover"
              role="presentation"
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
              <p className="text-5xl font-bold text-text-primary dark:text-[#F0F0F0] tabular-nums tracking-tight" aria-live="polite">
                {getDisplayValue()}
              </p>
              
              {/* Scudo Info Tooltip - Only visible when scudo is selected */}
              {viewMode === 'scudo' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 group z-50">
                  <Info className="size-4 text-text-muted dark:text-[#6B7280] cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-lg shadow-lg text-xs text-text-secondary dark:text-[#9CA3AF] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    1 Scudo = 1/1000 XAUT (approx. 31.1 mg gold)
                    <div className="absolute top-full right-2 w-2 h-2 bg-white dark:bg-[#1A1A1A] border-r border-b border-border-subtle dark:border-[#2D2D2D] transform rotate-45 -mt-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Label + Unit Selector */}
            <div className="flex items-center justify-between">
              <p className="text-text-secondary dark:text-[#9CA3AF] text-sm font-medium">my holdings</p>
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
                ? 'bg-success-light dark:bg-success/10 text-success border border-success/20 dark:border-success/30'
                : 'bg-error-light dark:bg-error/10 text-error border border-error/20 dark:border-error/30'}
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
          {/* <PiggyBank className="size-5" /> */}
          <span>buy gold</span>
        </Link>

        <Link
          href="/redeem"
          className="w-full bg-white dark:bg-[#1A1A1A] border border-gold-500/30 text-gold-500 font-semibold py-4 rounded-2xl text-center flex items-center justify-center gap-2 hover:border-gold-500/50 transition-all"
        >
          <span>redeem</span>
        </Link>

        <Link
          href="/yield"
          className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-gold-500/30 text-gold-500 font-semibold py-4 rounded-2xl text-center flex items-center justify-center gap-2 hover:border-gold-500/50 transition-all"
        >
          <span>earn up to 15% on gold</span>
        </Link>

      </div>

      {/* Auto Savings Plan Button - Floating at bottom */}
      <button
        onClick={() => setShowAutoSavingsModal(true)}
        className="fixed bottom-24 left-6 right-6 max-w-lg mx-auto card p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all shadow-lg z-40"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center text-gold-500">
            <Calendar className="size-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-sm">auto savings plan</p>
            <p className="text-xs text-text-muted dark:text-[#6B7280]">set up recurring investments</p>
          </div>
        </div>
        <span className="badge badge-gold text-[10px]">coming soon</span>
      </button>

      {/* Auto Savings Modal */}
      {showAutoSavingsModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-16 bg-gold-100 dark:bg-gold-500/10 rounded-full flex items-center justify-center mb-5">
              <Calendar className="size-8 text-gold-500" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Auto Savings Plan</h3>
            <p className="text-text-secondary dark:text-[#9CA3AF] mb-6 text-sm">
              Set up automatic recurring investments in gold. Choose your amount, frequency, and let your savings grow effortlessly.
            </p>
            <div className="space-y-3">
              <div className="bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] rounded-xl p-4 text-left">
                <p className="text-text-muted dark:text-[#6B7280] text-xs mb-1">Features coming soon</p>
                <ul className="text-text-secondary dark:text-[#9CA3AF] text-sm space-y-1">
                  <li>- Daily, weekly, or monthly savings</li>
                  <li>- Flexible amount from INR 100</li>
                  <li>- Pause or cancel anytime</li>
                </ul>
              </div>
              <button
                onClick={() => setShowAutoSavingsModal(false)}
                className="w-full bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] font-medium py-3.5 px-8 rounded-xl border border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/30 transition-all"
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
