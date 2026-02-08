'use client';

import { formatINR, formatGrams } from '@/lib/utils';
import type { GiftTransaction } from '@/types';
import { Send, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { slideUpSpring, backdropFade, SPRING } from '@/lib/animations';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GiftStatusBadge } from './GiftStatusBadge';

interface GiftDetailModalProps {
  gift: GiftTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GiftDetailModal({ gift, isOpen, onClose }: GiftDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !gift) return null;

  const isSent = gift.type === 'sent';
  const displayName = isSent ? gift.recipientName : gift.senderName;
  const title = isSent ? `${displayName}'s ${gift.occasion}` : `From ${displayName}`;
  const Icon = isSent ? Send : Download;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    return `${day} ${month}`;
  };

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
              <div className="size-16 rounded-full bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center text-gold-500">
                <Icon className="size-6" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-center text-text-primary dark:text-[#F0F0F0] mb-1">
              {title}
            </h2>

            {/* Gold Amount */}
            <p className="text-4xl font-bold text-center text-gold-500 mb-1">
              {formatGrams(gift.gramsAmount).replace(' g', '')}g Gold
            </p>

            {/* INR Value */}
            <p className="text-center text-lg text-text-muted dark:text-[#6B7280] mb-6">
              {formatINR(gift.inrAmount)}
            </p>

            {/* Details Card */}
            <div className="bg-surface-elevated dark:bg-[#2D2D2D] rounded-2xl mb-4">
              {/* Status */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Status</span>
                <GiftStatusBadge status={gift.status} />
              </div>

              {/* Date */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Date</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatDate(gift.createdAt)}
                </span>
              </div>

              {/* Type */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Type</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {isSent ? 'Sent Gift' : 'Received Gift'}
                </span>
              </div>

              {/* Gold Weight */}
              <div className="flex justify-between items-center p-4 border-b border-border-subtle dark:border-[#3D3D3D]">
                <span className="text-text-muted dark:text-[#6B7280]">Gold Weight</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatGrams(gift.gramsAmount)} (24K)
                </span>
              </div>

              {/* Value at Transfer */}
              <div className="flex justify-between items-center p-4">
                <span className="text-text-muted dark:text-[#6B7280]">Value at Transfer</span>
                <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                  {formatINR(gift.inrAmount)}
                </span>
              </div>
            </div>

            {/* Message (if exists) */}
            {gift.message && (
              <div className="bg-surface-elevated dark:bg-[#2D2D2D] rounded-2xl p-4 mb-6">
                <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-2">
                  Message
                </p>
                <p className="text-text-secondary dark:text-[#9CA3AF] text-sm leading-relaxed">
                  &ldquo;{gift.message}&rdquo;
                </p>
              </div>
            )}

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
