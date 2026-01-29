'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="w-full h-full bg-surface-card rounded-xl animate-pulse flex items-center justify-center">
      <div className="size-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
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
    <div className="p-6 max-w-lg mx-auto h-screen gold-radial-bg flex flex-col pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="p-2 -ml-2 text-cream-muted/50 hover:text-cream transition-colors"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-serif text-cream">live charts</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                : 'bg-surface-card text-cream-muted/60 border border-border-subtle hover:border-gold-500/20 hover:text-cream-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Container - needs explicit height for TradingView */}
      <div className="flex-1 rounded-none overflow-hidden border border-border-subtle bg-[#0F0F0F] relative">
        <div className="absolute inset-0">
          <TradingViewWidget
            key={currentTab.id}
            symbol={currentTab.symbol}
          />
        </div>
      </div>

      {/* Info Footer */}
      <p className="text-center text-xs text-cream-muted/40 mt-3 shrink-0">
        Charts powered by TradingView
      </p>
    </div>
  );
}
