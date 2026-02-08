'use client';

import { formatINR, formatGrams, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import Decimal from 'decimal.js';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { slideUpSpring, backdropFade, SPRING } from '@/lib/animations';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !transaction) return null;

  const xautGrams = transaction.xautAmount
    ? new Decimal(transaction.xautAmount).times(31.1035).toNumber()
    : 0;

  const txDate = new Date(transaction.completedAt ?? transaction.createdAt);
  const formattedDate = txDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate gold price per gram from transaction data
  const goldPricePerGram = transaction.goldPriceInr
    ? new Decimal(transaction.goldPriceInr).toNumber()
    : transaction.inrAmount && xautGrams > 0
      ? new Decimal(transaction.inrAmount).dividedBy(xautGrams).toNumber()
      : 0;

  const platformFee = 0;
  const gst = 0;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 relative"
            variants={slideUpSpring}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drag Handle */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 rounded-full bg-text-muted/30 dark:bg-[#6B7280]/30" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
              aria-label="Close modal"
            >
              <X className="size-6" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  'size-16 rounded-full flex items-center justify-center',
                  transaction.type === 'buy'
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
                )}
              >
                {transaction.type === 'buy' ? (
                  <ArrowDownLeft className="size-6" />
                ) : (
                  <ArrowUpRight className="size-6" />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-text-primary dark:text-[#F0F0F0] mb-3">
              {transaction.type === 'buy' ? 'Buy Gold' : 'Sell Gold'}
            </h2>

            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                <span className="size-2 rounded-full bg-success" />
                Completed
              </span>
            </div>

            {/* Amount */}
            <div className="text-center mb-2">
              <p className={cn(
                'text-4xl font-bold tabular-nums',
                transaction.type === 'buy' ? 'text-text-primary dark:text-[#F0F0F0]' : 'text-success'
              )}>
                {transaction.type === 'buy' ? '-' : '+'}{formatINR(transaction.inrAmount || 0)}
              </p>
            </div>

            {/* Grams */}
            <p className="text-center text-lg text-gold-500 mb-8">
              {formatGrams(xautGrams).replace(' g', 'g')} gold
            </p>

            {/* Details Card */}
            <div className="bg-surface-elevated dark:bg-[#2D2D2D] rounded-2xl mb-6">
              {/* Date */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Date</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">{formattedDate}</span>
              </div>

              {/* Gold Price */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Gold Price</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatINR(goldPricePerGram)}/g
                </span>
              </div>

              {/* Quantity */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Quantity</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatGrams(xautGrams).replace(' g', 'g')}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Platform Fee</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatINR(platformFee)}
                </span>
              </div>

              {/* GST */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">GST (18%)</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatINR(gst)}
                </span>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between items-center p-4">
                <span className="text-text-muted dark:text-[#6B7280]">Transaction ID</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium font-mono">
                  GF{transaction.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-surface-elevated dark:bg-[#2D2D2D] text-text-primary dark:text-[#F0F0F0] font-semibold text-lg"
              whileTap={{ scale: 0.98 }}
              transition={SPRING.snappy}
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
