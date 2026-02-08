'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { GiftOccasion } from '@/types';
import { SPRING } from '@/lib/animations';

const OCCASIONS: GiftOccasion[] = [
  'Birthday',
  'Wedding',
  'Festival',
  'Thank You',
  'Just Because',
  'Anniversary',
];

interface OccasionPillsProps {
  selected: GiftOccasion;
  onSelect: (occasion: GiftOccasion) => void;
}

export function OccasionPills({ selected, onSelect }: OccasionPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OCCASIONS.map((occasion) => {
        const isSelected = selected === occasion;
        return (
          <motion.button
            key={occasion}
            type="button"
            className={cn(
              'px-4 py-2.5 rounded-full text-sm font-medium transition-all border',
              isSelected
                ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-500 border-gold-500'
                : 'bg-white dark:bg-[#1A1A1A] text-text-secondary dark:text-[#9CA3AF] border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/30'
            )}
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snappy}
            onClick={() => onSelect(occasion)}
          >
            {occasion}
          </motion.button>
        );
      })}
    </div>
  );
}
