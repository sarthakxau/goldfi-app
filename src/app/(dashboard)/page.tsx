'use client';

import { usePrivy, getAccessToken } from '@privy-io/react-auth';
import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import { RefreshCw, Calendar, Info, Sprout } from 'lucide-react';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { TransactionList } from '@/components/TransactionList';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp, AnimatedNumber } from '@/components/animations';
import { StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, EASE_OUT_EXPO, DURATION, fadeUp, scaleIn, backdropFade, modalScale } from '@/lib/animations';

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
    transactions,
    transactionsLoading,
    setTransactions,
    setTransactionsLoading,
    setTransactionsError,
    refreshing,
    setRefreshing,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'grams' | 'inr' | 'usd' | 'scudo'>('inr');
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

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const token = await getAccessToken();
      const res = await fetch('/api/transactions/history', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        setTransactionsError(data.error);
      }
    } catch {
      setTransactionsError('Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [setTransactions, setTransactionsLoading, setTransactionsError]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPrice(), fetchHoldings(), fetchTransactions()]);
    setRefreshing(false);
  }, [fetchPrice, fetchHoldings, fetchTransactions, setRefreshing]);

  useEffect(() => {
    fetchPrice();
    fetchHoldings();
    fetchTransactions();

    const priceInterval = setInterval(fetchPrice, 60000);
    return () => clearInterval(priceInterval);
  }, [fetchPrice, fetchHoldings, fetchTransactions]);

  // Derived State
  const xautAmount = holding ? new Decimal(holding.xautAmount) : new Decimal(0);
  const xautAmountGrams = holding?.xautAmountGrams ?? xautAmount.times(31.1035).toNumber();
  const buyingPricePerGram = goldPrice ? goldPrice.pricePerGramInr : 0;
  const buyingPricePer10g = buyingPricePerGram * 10;
  const currentValueInr = holding?.currentValueInr ?? xautAmount.times(goldPrice?.priceInr || 0).toNumber();

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
    return `${xautAmount.times(1000).toFixed(2)} scudo`;
  };

  const goldHoldingUnits = [
    { key: 'inr', label: '₹' },
    { key: 'usd', label: '$' },
    { key: 'grams', label: 'grams' },
    { key: 'scudo', label: 'scudo' },
  ] as const;
  const recentTransactions = transactions.slice(0, 2);


  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header / Price Strip */}
      <FadeUp delay={0}>
        <div className="flex items-center justify-between mb-8">
          {/* Live Price Display - Left */}
          <Link href="/gold-charts" className="flex flex-col items-start group">
            <span className="text-[10px] tracking-widest text-text-muted dark:text-[#6B7280] font-medium uppercase group-hover:text-text-secondary transition-colors">Live Price</span>
            <div className="flex items-center gap-2">
              {priceLoading ? (
                <div className="h-6 w-28 skeleton rounded" />
              ) : (
                <span className="text-xl font-bold text-gold-500 tabular-nums group-hover:text-gold-400 transition-colors">
                  <AnimatedNumber value={buyingPricePer10g} format={formatINR} duration={0.5} /><span className="text-text-muted dark:text-[#6B7280] text-sm">/10g</span>
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
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                >
                  <RefreshCw className="size-4" />
                </motion.div>
              </button>
            </div>
          </Link>

          {/* User Profile - Right */}
          <div className="flex flex-col items-end">
            <motion.div whileTap={{ scale: 0.92 }} transition={SPRING.snappy}>
              <Link href="/account" className="size-10 rounded-full overflow-hidden border-2 border-gold-500/30 block" aria-label="Account settings">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.email?.address?.split('@')[0] || 'User'}&backgroundColor=B8860B&textColor=ffffff`}
                  alt=""
                  className="w-full h-full object-cover"
                  role="presentation"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </FadeUp>

      {/* My Gold Holdings */}
      <section className="mb-8">
        <FadeUp delay={0.08}>
          <div className="card-gold p-8 relative overflow-hidden">
            {/* Subtle shimmer overlay */}
            <div className="absolute inset-0 gold-shimmer pointer-events-none" />
            <div className="relative z-10">
              {/* Value Display */}
              <div className="relative mb-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={viewMode + getDisplayValue()}
                    className="text-5xl font-bold text-text-primary dark:text-[#F0F0F0] tabular-nums tracking-tight"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
                    aria-live="polite"
                  >
                    {getDisplayValue()}
                  </motion.p>
                </AnimatePresence>
                
                {/* Scudo Info Tooltip */}
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
                <p className="text-gold-500 dark:text-gold-400 text-sm font-medium">my holdings</p>
                <div className="segmented-control !p-0.5 relative">
                  {goldHoldingUnits.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setViewMode(key)}
                      className={`segmented-control-item !px-3 !py-1.5 !text-xs relative z-10 ${viewMode === key ? 'segmented-control-item-active' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Returns Badge */}
        <AnimatePresence>
          {hasHoldings && (
            <motion.div
              className="flex justify-center -mt-4 relative z-10"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className={`
                inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                ${profitLossInr >= 0
                  ? 'bg-success-light dark:bg-success/10 text-success border border-success/20 dark:border-success/30'
                  : 'bg-error-light dark:bg-error/10 text-error border border-error/20 dark:border-error/30'}
              `}>
                <span className="tabular-nums">7d returns: {profitLossInr > 0 ? '+' : ''}{formatGrams(profitLossGrams)} (<AnimatedNumber value={profitLossInr} format={formatINR} duration={0.5} />)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* First Time User Banner */}
      <AnimatePresence>
        {!hasHoldings && (
          <FadeUp delay={0.16}>
            <div className="mb-10 flex justify-center">
              <motion.div whileTap={{ scale: 0.97 }} transition={SPRING.snappy}>
                <Link
                  href="/buy"
                  className="bg-gold-gradient text-white font-bold py-3.5 px-10 rounded-lg text-sm inline-block"
                >
                  buy your first gold
                </Link>
              </motion.div>
            </div>
          </FadeUp>
        )}
      </AnimatePresence>

      {/* Primary Action Buttons */}
      <FadeUp delay={0.14}>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-3">
            <motion.div className="w-1/2" whileTap={{ scale: 0.97 }} transition={SPRING.snappy}>
              <Link
                href="/buy"
                className="w-full bg-gold-gradient text-white font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2"
              >
                <span>buy</span>
              </Link>
            </motion.div>

            <motion.div className="w-1/2" whileTap={{ scale: 0.97 }} transition={SPRING.snappy}>
              <Link
                href="/redeem"
                className="w-full bg-gold-50 dark:bg-gold-500/10 border border-gold-200 dark:border-gold-500/20 text-gold-500 font-semibold py-4 rounded-2xl text-center flex items-center justify-center gap-2 hover:border-gold-500/50 transition-all"
              >
                <span>sell</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </FadeUp>

      <StaggerContainer staggerDelay={0.06} delayChildren={0.2} className="flex flex-col gap-3 mb-6">
        <StaggerItem>
          <Link href="/yield" className='w-full'>
            <motion.button
              className="w-full mx-auto card p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all shadow-lg z-40"
              whileTap={{ scale: 0.98 }}
              transition={SPRING.snappy}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Sprout className="size-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-sm">gold yield</p>
                  <p className="text-xs text-text-muted dark:text-[#6B7280]">variable rates, risks apply</p>
                </div>
              </div>
            </motion.button>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <motion.button
            onClick={() => setShowAutoSavingsModal(true)}
            className="w-full mx-auto card p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all shadow-lg z-40"
            whileTap={{ scale: 0.98 }}
            transition={SPRING.snappy}
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
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gold-100 dark:bg-gold-500/10 text-gold-500 dark:text-gold-400 border border-gold-500/20 dark:border-gold-500/30">soon</span>
          </motion.button>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Transactions */}
      <FadeUp delay={0.28} inView once>
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0]">Recent</h2>
            <Link
              href="/transactions"
              className="text-gold-500 hover:text-gold-400 font-medium transition-colors text-xs"
            >
              See more
            </Link>
          </div>

          {transactionsLoading && recentTransactions.length === 0 ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-20 skeleton rounded" />
                      <div className="h-3 w-16 skeleton rounded" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 w-20 skeleton rounded ml-auto" />
                      <div className="h-3 w-14 skeleton rounded ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-text-muted dark:text-[#6B7280]">No recent transactions</p>
          ) : (
            <TransactionList
              transactions={recentTransactions}
              variant="separated"
              showDateHeaders={false}
              showInlineDate={true}
            />
          )}
        </section>
      </FadeUp>

      {/* Auto Savings Modal */}
      <AnimatePresence>
        {showAutoSavingsModal && (
          <motion.div
            className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowAutoSavingsModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-4 max-w-sm w-full text-center"
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="mx-auto size-16 bg-gold-100 dark:bg-gold-500/10 rounded-full flex items-center justify-center mb-5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING.bouncy, delay: 0.1 }}
              >
                <Calendar className="size-8 text-gold-500" />
              </motion.div>
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
                <motion.button
                  onClick={() => setShowAutoSavingsModal(false)}
                  className="w-full bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] font-medium py-3.5 px-8 rounded-xl border border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/30 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
