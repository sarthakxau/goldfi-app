'use client';

import React, { useState } from 'react';
import { TolaCard } from '@/components/TolaCard';
import { CardDetailsModal, CardMoreModal } from '@/components/CardModals';
import { Eye, MoreHorizontal, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING } from '@/lib/animations';

export default function CardPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const ActionButton = ({ onClick, icon: Icon, label }: { onClick: () => void, icon: React.ElementType, label: string }) => (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-2 py-4 px-6 rounded-2xl",
        "card transition-colors",
        "hover:border-gold-500/30"
      )}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.snappy}
    >
      <div className="p-2.5 rounded-full bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280] transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-semibold text-text-secondary dark:text-[#9CA3AF] text-sm">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <FadeUp>
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] tracking-tight">Your gold.fi card</h1>
        </div>
      </FadeUp>

      <div className="p-6 pt-2 space-y-8 max-w-md mx-auto">
        {/* Card Component with tilt entrance */}
        <FadeUp delay={0.08}>
          <motion.div
            className="relative z-10"
            initial={{ rotateX: 8, perspective: 800 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <TolaCard />
          </motion.div>
        </FadeUp>

        {/* Action Buttons */}
        <StaggerContainer staggerDelay={0.06} delayChildren={0.18} className="flex gap-4">
          <StaggerItem className="flex-1">
            <ActionButton
              onClick={() => setShowDetails(true)}
              icon={Eye}
              label="Details"
            />
          </StaggerItem>
          <StaggerItem className="flex-1">
            <ActionButton
              onClick={() => setShowMore(true)}
              icon={MoreHorizontal}
              label="More"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Transactions Section */}
        <FadeUp delay={0.28} inView once>
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0]">Transactions</h2>
            </div>

            {/* Empty State / Placeholder */}
            <div className="card border-dashed p-8 flex flex-col items-center justify-center text-center h-64">
              <div className="p-4 bg-surface-elevated dark:bg-[#242424] rounded-full mb-4">
                <Receipt className="w-8 h-8 text-text-muted dark:text-[#6B7280]" />
              </div>
              <p className="text-text-secondary dark:text-[#9CA3AF] font-medium">No transactions yet</p>
              <p className="text-sm text-text-muted dark:text-[#6B7280] mt-1 max-w-[200px]">
                Your card transactions will appear here once you start using your card.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Modals */}
      <CardDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
      <CardMoreModal
        isOpen={showMore}
        onClose={() => setShowMore(false)}
      />
    </div>
  );
}
