'use client';

import { Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'motion/react';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface UpiSuccessScreenProps {
  goldGrams: number;
  totalPayable: number;
  ratePerGram: number;
  tds: number;
  inrAmount: number;
  onBuyMore: () => void;
}

export function UpiSuccessScreen({
  goldGrams,
  totalPayable,
  ratePerGram,
  tds,
  inrAmount,
  onBuyMore,
}: UpiSuccessScreenProps) {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto flex flex-col items-center justify-center">
      {/* Success Checkmark */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING.bouncy}
      >
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center">
            <Check className="size-8 text-white" strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, delay: 0.15, ease: EASE_OUT_EXPO }}
      >
        Gold Purchased!
      </motion.h2>

      {/* Gold Amount */}
      <motion.p
        className="text-4xl font-bold text-gold-500 dark:text-gold-400 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, delay: 0.22, ease: EASE_OUT_EXPO }}
      >
        +{goldGrams.toFixed(3)} g
      </motion.p>

      <motion.p
        className="text-text-muted dark:text-[#6B7280] mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal, delay: 0.28 }}
      >
        Added to your holdings
      </motion.p>

      {/* Summary Card */}
      <motion.div
        className="w-full card-gold rounded-2xl p-5 mb-10 space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, delay: 0.32, ease: EASE_OUT_EXPO }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">Paid</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(totalPayable)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">Rate</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(ratePerGram)}/g
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted dark:text-[#6B7280]">TDS Deducted</span>
          <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
            {formatINR(tds)}
          </span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, delay: 0.4, ease: EASE_OUT_EXPO }}
      >
        <motion.div whileTap={{ scale: 0.98 }} transition={SPRING.snappy}>
          <Link
            href="/"
            className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl text-center block mb-4"
          >
            View Holdings
          </Link>
        </motion.div>

        <button
          onClick={onBuyMore}
          className="w-full text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] font-medium transition-colors text-center"
        >
          Buy More
        </button>
      </motion.div>
    </div>
  );
}
