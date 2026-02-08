'use client';

import { motion } from 'motion/react';
import { DURATION, EASE_OUT_EXPO } from '@/lib/animations';
import type { AutoPayFrequency } from '@/types';

interface FrequencySelectorProps {
  value: AutoPayFrequency;
  onChange: (frequency: AutoPayFrequency) => void;
}

const frequencies: { key: AutoPayFrequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export function FrequencySelector({ value, onChange }: FrequencySelectorProps) {
  return (
    <div className="flex gap-2">
      {frequencies.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className="relative flex-1 py-3 px-2 rounded-xl text-sm font-medium transition-colors"
        >
          {value === key && (
            <motion.div
              className="absolute inset-0 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gold-500/30 shadow-card"
              layoutId="frequencyIndicator"
              transition={{
                duration: DURATION.fast,
                ease: EASE_OUT_EXPO,
              }}
            />
          )}
          <span
            className={`relative z-10 ${
              value === key
                ? 'text-text-primary dark:text-[#F0F0F0]'
                : 'text-text-muted dark:text-[#6B7280]'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
