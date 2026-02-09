'use client';

import { motion } from 'motion/react';
import { IndianRupee } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { SPRING } from '@/lib/animations';
import { calculateGramsFromInr } from '@/lib/giftData';

interface AmountSelectorProps {
  presetInrAmounts: number[];
  pricePerGramInr: number;
  selectedAmount: number;
  onSelect: (amount: number, grams: number) => void;
  customAmount?: string;
  onCustomAmountChange?: (value: string) => void;
}

export function AmountSelector({
  presetInrAmounts,
  pricePerGramInr,
  selectedAmount,
  onSelect,
  customAmount,
  onCustomAmountChange,
}: AmountSelectorProps) {
  const isCustomSelected = !presetInrAmounts.some((inr) => inr === selectedAmount);

  return (
    <div className="space-y-3">
      {/* Preset amounts grid */}
      <div className="grid grid-cols-2 gap-3">
        {presetInrAmounts.map((inr) => {
          const grams = calculateGramsFromInr(inr, pricePerGramInr);
          const isSelected = selectedAmount === inr && !isCustomSelected;
          return (
            <motion.button
              key={inr}
              type="button"
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all',
                isSelected
                  ? 'bg-gold-50 dark:bg-gold-500/5 border-gold-500'
                  : 'bg-white dark:bg-[#1A1A1A] border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/30'
              )}
              whileTap={{ scale: 0.98 }}
              transition={SPRING.snappy}
              onClick={() => onSelect(inr, grams)}
            >
              <p
                className={cn(
                  'text-xl font-bold mb-1',
                  isSelected
                    ? 'text-gold-500'
                    : 'text-text-primary dark:text-[#F0F0F0]'
                )}
              >
                {formatINR(inr)}
              </p>
              <p className="text-sm text-text-muted dark:text-[#6B7280]">
                {grams}g gold
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Custom amount input */}
      <motion.div
        className={cn(
          'relative rounded-2xl border-2 overflow-hidden transition-all',
          isCustomSelected
            ? 'bg-gold-50 dark:bg-gold-500/5 border-gold-500'
            : 'bg-white dark:bg-[#1A1A1A] border-border-subtle dark:border-[#2D2D2D] focus-within:border-gold-500/50'
        )}
        whileTap={{ scale: 0.99 }}
        transition={SPRING.snappy}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <IndianRupee
            className={cn(
              'size-5',
              isCustomSelected
                ? 'text-gold-500'
                : 'text-text-muted dark:text-[#6B7280]'
            )}
          />
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={customAmount || ''}
          onChange={(e) => onCustomAmountChange?.(e.target.value)}
          onFocus={() => {
            if (customAmount) {
              const inr = Number(customAmount);
              onSelect(inr, calculateGramsFromInr(inr, pricePerGramInr));
            }
          }}
          className={cn(
            'w-full py-4 pl-12 pr-4 bg-transparent outline-none text-lg font-semibold placeholder:text-text-muted dark:placeholder:text-[#6B7280]',
            isCustomSelected
              ? 'text-gold-500'
              : 'text-text-primary dark:text-[#F0F0F0]'
          )}
        />
      </motion.div>
    </div>
  );
}
