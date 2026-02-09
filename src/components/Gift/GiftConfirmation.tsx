'use client';

import { motion } from 'motion/react';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { FadeUp } from '@/components/animations';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';

interface GiftConfirmationProps {
  recipientEmail: string;
  gramsAmount: number;
  inrAmount: number;
  recipientFound: boolean;
  onViewGifts: () => void;
  onSendAnother: () => void;
}

export function GiftConfirmation({
  recipientEmail,
  gramsAmount,
  inrAmount,
  recipientFound,
  onViewGifts,
  onSendAnother,
}: GiftConfirmationProps) {
  return (
    <div className="flex flex-col items-center text-center pt-8">
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
        className="size-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
      >
        <CheckCircle className="size-10 text-success" />
      </motion.div>

      {/* Title */}
      <FadeUp delay={0.2}>
        <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
          Gift sent!
        </h2>
      </FadeUp>

      {/* Amount */}
      <FadeUp delay={0.25}>
        <p className="text-3xl font-bold text-gold-500 mb-1">
          {gramsAmount.toFixed(2)}g gold
        </p>
        <p className="text-sm text-text-muted dark:text-[#6B7280] mb-6">
          Worth &#8377;{inrAmount.toLocaleString('en-IN')}
        </p>
      </FadeUp>

      {/* Status message */}
      <FadeUp delay={0.3}>
        <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-4 mb-8 w-full">
          {recipientFound ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-success shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary dark:text-[#F0F0F0]">
                  Gold delivered to {recipientEmail}
                </p>
                <p className="text-xs text-text-muted dark:text-[#6B7280] mt-1">
                  The gold has been added to their vault instantly.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-gold-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary dark:text-[#F0F0F0]">
                  Claim link sent to {recipientEmail}
                </p>
                <p className="text-xs text-text-muted dark:text-[#6B7280] mt-1">
                  They&apos;ll receive an email with a link to sign up and claim their gold. The link expires in 30 days.
                </p>
              </div>
            </div>
          )}
        </div>
      </FadeUp>

      {/* Actions */}
      <FadeUp delay={0.35}>
        <div className="w-full space-y-3">
          <motion.button
            onClick={onViewGifts}
            className="w-full bg-gold-gradient text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            View Gifts
            <ArrowRight className="size-4" />
          </motion.button>

          <button
            onClick={onSendAnother}
            className="w-full text-text-secondary dark:text-[#9CA3AF] text-sm font-medium py-3"
          >
            Send another gift
          </button>
        </div>
      </FadeUp>
    </div>
  );
}
