'use client';

import { Gift } from 'lucide-react';
import { formatINR, formatGrams } from '@/lib/utils';
import type { GiftOccasion } from '@/types';

interface GiftPreviewCardProps {
  gramsAmount: number;
  inrAmount: number;
  occasion: GiftOccasion;
}

export function GiftPreviewCard({ gramsAmount, inrAmount, occasion }: GiftPreviewCardProps) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-6 relative overflow-hidden">
      {/* Gold top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />
      
      <div className="flex flex-col items-center text-center pt-2">
        {/* Gift Icon */}
        <div className="size-16 rounded-2xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mb-4">
          <Gift className="size-8 text-gold-500 dark:text-gold-400" />
        </div>
        
        {/* Label */}
        <p className="text-text-secondary dark:text-[#9CA3AF] text-sm mb-1">
          Someone special receives
        </p>
        
        {/* Gold Amount */}
        <p className="text-3xl font-bold text-text-primary dark:text-[#F0F0F0] mb-1">
          {formatGrams(gramsAmount).replace(' g', '')}g Gold
        </p>
        
        {/* INR Value */}
        <p className="text-text-muted dark:text-[#6B7280] text-lg mb-4">
          {formatINR(inrAmount)}
        </p>
        
        {/* Occasion Badge */}
        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-500 text-sm font-medium border border-gold-500/20">
          {occasion}
        </span>
      </div>
    </div>
  );
}
