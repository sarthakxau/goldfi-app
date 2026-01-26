'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, Plus, Gift, BadgePercent } from 'lucide-react';
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
      // Pass wallet address from Privy to fetch on-chain balance
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
  // Use pre-computed value from API when available, otherwise calculate locally
  const xautAmountGrams = holding?.xautAmountGrams ?? xautAmount.times(31.1035).toNumber();
  const buyingPricePerOz = goldPrice ? goldPrice.priceInr : 0;
  const buyingPricePerGram = goldPrice ? goldPrice.pricePerGramInr : 0;
  const buyingPricePer10g = buyingPricePerGram * 10;

  console.log('holdings', holding);
  console.log('goldPrice', goldPrice);
  console.log('xautAmount', xautAmount);
  console.log('xautAmountGrams', xautAmountGrams);
  console.log('buyingPricePer10g', buyingPricePer10g);
  
  // Use pre-computed value from API when available
  const currentValueInr = holding?.currentValueInr ?? xautAmount.times(buyingPricePerOz).toNumber();
  
  // Calculate Returns (Profit/Loss)
  const totalInvested = holding ? new Decimal(holding.totalInvestedInr) : new Decimal(0);
  const profitLossInr = holding?.profitLossInr ?? (currentValueInr - totalInvested.toNumber());
  // We can estimate the "grams" profit by profitInr / currentPricePerGram
  const profitLossGrams = buyingPricePerGram > 0 ? profitLossInr / buyingPricePerGram : 0;

  const hasHoldings = xautAmount.greaterThan(0);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen bg-white">
      {/* Header / Price Strip */}
      <div className="flex items-center justify-between mb-8">
        <div>
           {/* Empty left side for cleanliness as per mockup, or welcome text if preferred, keeping it minimal */}
        </div>
        <div className="flex items-center gap-2">
            {/* Live Price Display */}
             <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 font-medium tracking-wide">LIVE PRICE</span>
                <div className="flex items-center gap-2">
                    {priceLoading ? (
                         <div className="h-5 w-24 bg-gray-100 animate-pulse rounded" />
                    ) : (
                        <span className="font-semibold text-gray-900">
                            {formatINR(buyingPricePer10g)}<span className="text-gray-400 text-sm font-normal">/10g</span>
                        </span>
                    )}
                     <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                     >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Account / My Gold Card */}
      <section className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium mb-3 ml-1">my gold</h2>
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-[2rem] p-8 text-center relative overflow-hidden">
            {/* Value Display */}
            <div className="mb-2">
                 <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                    {viewMode === 'grams' 
                        ? (hasHoldings ? `${formatGrams(xautAmountGrams)}` : '0.00g')
                        : (hasHoldings ? formatINR(currentValueInr) : '₹0.00')
                    }
                 </h1>
            </div>

            {/* Toggle Switch */}
            <button 
                onClick={() => setViewMode(viewMode === 'grams' ? 'inr' : 'grams')}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Switch View"
            >
               {viewMode === 'grams' ? (
                   <>
                     <span className="text-xs font-semibold border border-gray-200 rounded px-1.5 py-0.5 bg-white">INR</span>
                   </>
               ) : (
                   <>
                      <span className="text-xs font-semibold border border-gray-200 rounded px-1.5 py-0.5 bg-white">grams</span>
                   </>
               )}
            </button>
        </div>

        {/* Returns Badge */}
        {hasHoldings && (
             <div className="flex justify-center -mt-3 relative z-10">
                <div className={`
                    inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                    ${profitLossInr >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                `}>
                    <span>7d returns: {profitLossInr > 0 ? '+' : ''}{formatGrams(profitLossGrams)} ({formatINR(profitLossInr)})</span>
                </div>
            </div>
        )}
      </section>

      {/* First Time User Banner */}
      {!hasHoldings && (
          <div className="mb-10 flex justify-center">
              <Link href="/buy" className="bg-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-sm text-sm transform -rotate-1">
                  make your first investment
              </Link>
          </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-3 gap-6 px-2">
        {/* Buy Gold */}
        <Link href="/buy" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center bg-white group-hover:border-gold-400 group-hover:shadow-md transition-all">
                <Plus className="w-8 h-8 text-gray-800" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-gray-600">buy gold</span>
        </Link>

        {/* My Rewards */}
        <button 
            onClick={() => setShowRewardsModal(true)}
            className="flex flex-col items-center gap-3 group"
        >
            <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center bg-white group-hover:border-gold-400 group-hover:shadow-md transition-all">
                 <Gift className="w-8 h-8 text-gray-800" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-gray-600">my rewards</span>
        </button>

         {/* Redeem */}
         <Link href="/sell" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center bg-white group-hover:border-gold-400 group-hover:shadow-md transition-all">
                 <BadgePercent className="w-8 h-8 text-gray-800" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-gray-600">redeem</span>
        </Link>
      </div>

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rewards Coming Soon!</h3>
            <p className="text-gray-500 mb-6 text-sm">
              We're working on something exciting. Check back later for exclusive rewards.
            </p>
            <button
              onClick={() => setShowRewardsModal(false)}
              className="bg-gray-900 text-white font-medium py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
