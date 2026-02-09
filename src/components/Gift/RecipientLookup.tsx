'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface RecipientLookupProps {
  value: string;
  onChange: (value: string) => void;
  onLookup: (email: string) => Promise<{ found: boolean }>;
  lookupLoading: boolean;
  found: boolean | null;
  error?: string | null;
  disabled?: boolean;
}

export function RecipientLookup({
  value,
  onChange,
  onLookup,
  lookupLoading,
  found,
  error,
  disabled,
}: RecipientLookupProps) {
  const [touched, setTouched] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleBlur = async () => {
    setTouched(true);
    if (isValidEmail) {
      await onLookup(value);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidEmail) {
      e.preventDefault();
      await onLookup(value);
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
        Recipient Email
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {lookupLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="size-5 text-gold-500" />
            </motion.div>
          ) : (
            <Search className="size-5 text-text-muted dark:text-[#6B7280]" />
          )}
        </div>
        <input
          type="email"
          placeholder="Enter email address"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full py-4 pl-12 pr-12 bg-white dark:bg-[#1A1A1A] border rounded-2xl text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#6B7280] outline-none transition-colors',
            found === true && 'border-success/50 focus:border-success',
            found === false && touched && 'border-gold-500/50 focus:border-gold-500',
            found === null && 'border-border-subtle dark:border-[#2D2D2D] focus:border-gold-500/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <AnimatePresence mode="wait">
          {found === true && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <CheckCircle className="size-5 text-success" />
            </motion.div>
          )}
          {found === false && touched && !lookupLoading && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <AlertCircle className="size-5 text-gold-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {found === true && (
          <motion.p
            key="found-text"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-success text-xs mt-2 flex items-center gap-1"
          >
            <CheckCircle className="size-3" />
            User found — gold will be sent directly
          </motion.p>
        )}
        {error && (
          <motion.p
            key="error-text"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-error text-xs mt-2"
          >
            {error}
          </motion.p>
        )}
        {touched && !isValidEmail && value.length > 0 && (
          <motion.p
            key="invalid-text"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-error text-xs mt-2"
          >
            Please enter a valid email address
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
