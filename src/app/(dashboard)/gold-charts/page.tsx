'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp } from '@/components/animations';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations';

const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="w-full h-full bg-white dark:bg-[#1A1A1A] rounded-xl animate-pulse flex items-center justify-center">
      <motion.div
        className="size-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

type ChartTab = 'xaut-usd' | 'xau-inr' | 'gold-nifty';

const tabs: { id: ChartTab; label: string; symbol: string }[] = [
  { id: 'xaut-usd', label: 'XAUT/USD', symbol: 'XAUTUSD' },
  { id: 'xau-inr', label: 'XAU/INR', symbol: 'XAUINR' },
  { id: 'gold-nifty', label: 'XAUT ETF', symbol: 'AMEX:GLD' },
];

export default function GoldChartsPage() {
  const [activeTab, setActiveTab] = useState<ChartTab>('xaut-usd');

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="p-6 max-w-lg mx-auto h-screen flex flex-col pb-28">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">live charts</h1>
          <div className="w-10" />
        </div>
      </FadeUp>

      {/* Tab Navigation */}
      <FadeUp delay={0.06}>
        <div className="flex gap-2 mb-4 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'bg-gold-100 dark:bg-gold-500/10 text-gold-500 border border-gold-500/30'
                  : 'bg-white dark:bg-[#1A1A1A] text-text-secondary dark:text-[#9CA3AF] border border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/20 hover:text-text-primary dark:hover:text-[#F0F0F0]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </FadeUp>

      {/* Chart Container */}
      <FadeUp delay={0.1}>
        <div className="flex-1 rounded-none overflow-hidden border border-border-subtle dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
            >
              <TradingViewWidget symbol={currentTab.symbol} />
            </motion.div>
          </AnimatePresence>
        </div>
      </FadeUp>

      {/* Info Footer */}
      <p className="text-center text-xs text-text-muted dark:text-[#6B7280] mt-3 shrink-0">
        Charts powered by TradingView
      </p>
    </div>
  );
}
