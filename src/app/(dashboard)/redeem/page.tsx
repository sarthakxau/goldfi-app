'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SellModal } from '@/components/Sell/SellModal';

export default function RedeemPage() {
  const [showSellModal, setShowSellModal] = useState(false);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">redeem</h1>
        <div className="size-10" />
      </div>

      <div className="space-y-6 flex flex-col items-center">
        {/* Swap to USDT */}
        <div className="w-full">
          <button
            onClick={() => setShowSellModal(true)}
            className="w-full bg-success text-white font-bold text-lg py-5 rounded-2xl border border-success-dark hover:bg-success-dark active:scale-[0.98] transition-all"
          >
            swap to USDT
          </button>
        </div>

        {/* Sell to Jewellers */}
        <div className="w-full">
          <Link
            href="/redeem/jewellers"
            className="w-full block bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] text-text-primary dark:text-[#F0F0F0] font-bold text-lg py-5 rounded-2xl text-center hover:border-gold-500/30 active:scale-[0.98] transition-all"
          >
            sell to jewellers
          </Link>
        </div>
      </div>

      <SellModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
      />
    </div>
  );
}
