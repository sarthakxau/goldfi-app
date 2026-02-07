'use client';

import { useState } from 'react';
import { Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { SwapModal } from '@/components/Buy/SwapModal';
import { HistoryModal } from '@/components/Buy/HistoryModal';
import { UpiFlow } from '@/components/Buy/UpiFlow';
import Link from 'next/link';

type ActiveView = 'method' | 'upi' | 'usdt';

export default function BuyPage() {
  const [activeView, setActiveView] = useState<ActiveView>('method');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // When UPI flow is active, render it full-screen
  if (activeView === 'upi') {
    return <UpiFlow onExit={() => setActiveView('method')} />;
  }

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/"
          className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">Buy Gold</h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] rounded-full transition-colors"
          aria-label="View transaction history"
        >
          <Clock className="size-5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Pay with UPI - Recommended */}
        <button
          onClick={() => setActiveView('upi')}
          className="w-full card-gold rounded-2xl p-4 flex items-center gap-4 text-left hover:border-gold-500 dark:hover:border-gold-400 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">&#8377;</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                Pay with UPI
              </span>
              <span className="text-[10px] font-bold uppercase bg-gold-500 text-white px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-xs text-text-muted dark:text-[#6B7280]">
              Instant &middot; Powered by Onmeta
            </p>
          </div>
          <ChevronRight className="size-5 text-text-muted dark:text-[#6B7280] shrink-0" />
        </button>

        {/* Pay with USDT */}
        <button
          onClick={() => setShowSwapModal(true)}
          className="w-full card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-gold-500/50 dark:hover:border-gold-400/50 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-text-primary dark:text-[#F0F0F0] block mb-0.5">
              Pay with USDT
            </span>
            <p className="text-xs text-text-muted dark:text-[#6B7280]">
              Via Camelot DEX &middot; No TDS
            </p>
          </div>
          <ChevronRight className="size-5 text-text-muted dark:text-[#6B7280] shrink-0" />
        </button>

        {/* Bank Transfer - Coming Soon */}
        <div className="w-full card rounded-2xl p-4 flex items-center gap-4 text-left opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 rounded-xl bg-surface dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] flex items-center justify-center shrink-0">
            <span className="text-text-muted dark:text-[#6B7280] text-lg">&#127974;</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                Bank Transfer
              </span>
              <span className="text-[10px] font-bold uppercase bg-gold-500/30 text-gold-500 dark:text-gold-400 px-2 py-0.5 rounded-full">
                Soon
              </span>
            </div>
            <p className="text-xs text-text-muted dark:text-[#6B7280]">NEFT/RTGS</p>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="mt-8 space-y-3">
        <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800/30 rounded-xl px-4 py-3">
          <p className="text-xs text-gold-700 dark:text-gold-400">
            1% TDS deducted on VDA purchases per Section 194S.
          </p>
        </div>
        <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800/30 rounded-xl px-4 py-3">
          <p className="text-xs text-gold-700 dark:text-gold-400">
            Crypto products are unregulated and risky.
          </p>
        </div>
      </div>

      <SwapModal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} />

      <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  );
}
