'use client';

import { Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

interface UpiSuccessScreenProps {
  goldGrams: number;
  totalPayable: number;
  ratePerGram: number;
  tds: number;
  inrAmount: number;
  onBuyMore: () => void;
}

export function UpiSuccessScreen({
  goldGrams,
  totalPayable,
  ratePerGram,
  tds,
  inrAmount,
  onBuyMore,
}: UpiSuccessScreenProps) {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto flex flex-col items-center justify-center">
      {/* Success Checkmark */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center">
            <Check className="size-8 text-white" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
        Gold Purchased!
      </h2>

      {/* Gold Amount */}
      <p className="text-4xl font-bold text-gold-500 dark:text-gold-400 mb-2">
        +{goldGrams.toFixed(3)} g
      </p>

      <p className="text-text-muted dark:text-[#6B7280] mb-10">Added to your holdings</p>

      {/* Summary Card */}
      <div className="w-full card-gold rounded-2xl p-5 mb-10 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">Paid</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(totalPayable)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">Rate</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(ratePerGram)}/g
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">TDS Deducted</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(tds)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <Link
        href="/"
        className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl text-center block active:scale-[0.98] transition-all mb-4"
      >
        View Holdings
      </Link>

      <button
        onClick={onBuyMore}
        className="text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] font-medium transition-colors"
      >
        Buy More
      </button>
    </div>
  );
}
