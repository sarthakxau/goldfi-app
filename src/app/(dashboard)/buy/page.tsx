'use client';

import { useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { SwapModal } from '@/components/Buy/SwapModal';
import { HistoryModal } from '@/components/Buy/HistoryModal';
import Link from 'next/link';

export default function BuyPage() {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">buy gold</h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] rounded-full transition-colors"
          aria-label="View transaction history"
        >
          <Clock className="size-5" />
        </button>
      </div>

      <div className="space-y-6 flex flex-col items-center">
        {/* Buy with INR */}
        <div className="w-full">
          <button
            disabled
            className="w-full bg-gold-gradient text-white font-bold text-lg py-5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <span className="relative z-10">buy with UPI</span>
            <span className="absolute top-2 right-3 text-xs bg-white/20 px-2 py-0.5 rounded-full">coming soon</span>
          </button>
          <p className="text-center text-xs text-text-muted dark:text-[#6B7280] mt-2">1% TDS applicable</p>
        </div>

        {/* Buy with USDT */}
        <div className="w-full">
          <button
            onClick={() => setShowSwapModal(true)}
            className="w-full bg-success text-white font-bold text-lg py-5 rounded-2xl border border-success-dark hover:bg-success-dark active:scale-[0.98] transition-all"
          >
            buy with USDT
          </button>
          <a
            href="https://www.investopedia.com/terms/t/tether-usdt.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-text-muted dark:text-[#6B7280] mt-2 underline underline-offset-2 hover:text-text-secondary dark:hover:text-[#9CA3AF]"
          >
            what is USDT?
          </a>
        </div>
      </div>

      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
