'use client';

import { motion } from 'motion/react';
import { SPRING } from '@/lib/animations';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggle({ isActive, onToggle, disabled }: StatusToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        isActive
          ? 'bg-gold-500'
          : 'bg-surface-elevated dark:bg-[#2D2D2D] border border-border-subtle dark:border-[#3D3D3D]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={isActive ? 'Pause autopay' : 'Resume autopay'}
    >
      <motion.div
        className={`absolute top-1 size-6 rounded-full ${
          isActive ? 'bg-[#1A1A1A]' : 'bg-text-muted dark:bg-[#6B7280]'
        }`}
        animate={{ left: isActive ? 28 : 4 }}
        transition={SPRING.bouncy}
      />
    </button>
  );
}
