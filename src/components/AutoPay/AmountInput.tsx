'use client';

import { motion } from 'motion/react';
import { SPRING } from '@/lib/animations';

interface AmountInputProps {
  value: number;
  onChange: (amount: number) => void;
}

const presets = [100, 500, 1000, 2000, 5000];

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div>
      {/* Input */}
      <div className="card-elevated p-5 rounded-2xl mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-text-muted dark:text-[#6B7280]">&#8377;</span>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full text-4xl font-bold bg-transparent border-none outline-none text-text-primary dark:text-[#F0F0F0] tabular-nums placeholder:text-text-muted/40 dark:placeholder:text-[#6B7280]/40"
          />
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              value === preset
                ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                : 'bg-surface-elevated dark:bg-[#242424] border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF]'
            }`}
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snappy}
          >
            &#8377;{preset.toLocaleString('en-IN')}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
