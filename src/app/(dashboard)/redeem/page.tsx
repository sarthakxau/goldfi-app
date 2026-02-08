'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING } from '@/lib/animations';

export default function RedeemPage() {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors">
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">redeem</h1>
          <div className="size-10" />
        </div>
      </FadeUp>

      <StaggerContainer staggerDelay={0.08} delayChildren={0.06} className="space-y-6 flex flex-col items-center">
        {/* Swap to USDT */}
        <StaggerItem className="w-full">
          <motion.div whileTap={{ scale: 0.98 }} transition={SPRING.snappy}>
            <Link
              href="/sell"
              className="w-full block bg-success text-white font-bold text-lg py-5 rounded-2xl border border-success-dark hover:bg-success-dark transition-all text-center"
            >
              swap to USDT
            </Link>
          </motion.div>
        </StaggerItem>

        {/* Sell to Jewellers */}
        <StaggerItem className="w-full">
          <motion.div whileTap={{ scale: 0.98 }} transition={SPRING.snappy}>
            <Link
              href="/redeem/jewellers"
              className="w-full block bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] text-text-primary dark:text-[#F0F0F0] font-bold text-lg py-5 rounded-2xl text-center hover:border-gold-500/30 transition-all"
            >
              sell to jewellers
            </Link>
          </motion.div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
