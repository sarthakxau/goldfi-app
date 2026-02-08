'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pause, Play, Target, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { AutoPayTransactionItem, StatusToggle } from '@/components/AutoPay';
import { SPRING, DURATION, EASE_OUT_EXPO, backdropFade, modalScale } from '@/lib/animations';
import { formatINR } from '@/lib/utils';
import { useAutoPay } from '@/hooks/useAutoPay';

const frequencyLabels: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  biweekly: 'bi-weekly',
  monthly: 'monthly',
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AutoPayDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const {
    selectedAutoPay,
    transactions,
    fetchAutoPay,
    fetchTransactions,
    toggleAutoPay,
    deleteAutoPay,
  } = useAutoPay();

  const [toggling, setToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAutoPay(id);
    fetchTransactions(id);
  }, [id, fetchAutoPay, fetchTransactions]);

  const handleToggle = async () => {
    setToggling(true);
    await toggleAutoPay(id);
    // Re-fetch to get updated status
    await fetchAutoPay(id);
    setToggling(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteAutoPay(id);
    setShowDeleteConfirm(false);
    setDeleting(false);
    router.push('/autopay');
  };

  if (!selectedAutoPay) {
    return (
      <div className="p-6 max-w-lg mx-auto min-h-screen flex items-center justify-center">
        <motion.div
          className="size-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const isActive = selectedAutoPay.status === 'active';

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp delay={0}>
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            onClick={() => router.push('/autopay')}
            className="size-10 rounded-full bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            transition={SPRING.snappy}
          >
            <ArrowLeft className="size-5 text-text-primary dark:text-[#F0F0F0]" />
          </motion.button>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            {selectedAutoPay.name}
          </h1>
        </div>
      </FadeUp>

      {/* Amount Card */}
      <FadeUp delay={0.06}>
        <div className="card-gold p-6 relative overflow-hidden mb-4">
          <div className="absolute inset-0 gold-shimmer pointer-events-none" />
          <div className="relative z-10">
            {/* Top row: amount + status */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-2">
                  AutoPay Amount
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-text-muted dark:text-[#6B7280]">&#8377;</span>
                  <span className="text-4xl font-bold text-text-primary dark:text-[#F0F0F0] tabular-nums">
                    {selectedAutoPay.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-text-muted dark:text-[#6B7280] ml-1">
                    /{frequencyLabels[selectedAutoPay.frequency]}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-semibold tracking-wide px-3 py-1.5 rounded-lg border ${
                  isActive
                    ? 'text-success bg-success/10 border-success/20'
                    : 'text-warning dark:text-warning bg-warning/10 border-warning/20'
                }`}
              >
                {isActive ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            {/* Gold Accumulated */}
            <div className="card-elevated p-5 rounded-xl text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-2">
                Gold Accumulated
              </p>
              <p className="text-4xl font-bold text-gold-500 tabular-nums">
                {selectedAutoPay.goldAccumulated.toFixed(2)}g
              </p>
            </div>

            {/* Stats row */}
            <div className="flex mt-5">
              <div className="flex-1 text-center">
                <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
                  Total Invested
                </p>
                <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0] tabular-nums">
                  {formatINR(selectedAutoPay.totalInvested)}
                </p>
              </div>
              <div className="flex-1 text-center border-l border-border-subtle dark:border-[#2D2D2D]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
                  Avg. Price
                </p>
                <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0] tabular-nums">
                  {selectedAutoPay.avgPricePerGram > 0
                    ? `${formatINR(selectedAutoPay.avgPricePerGram)}/g`
                    : '--'}
                </p>
              </div>
              <div className="flex-1 text-center border-l border-border-subtle dark:border-[#2D2D2D]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted dark:text-[#6B7280] font-medium mb-1">
                  Since
                </p>
                <p className="text-sm font-medium text-text-secondary dark:text-[#9CA3AF]">
                  {formatShortDate(selectedAutoPay.startDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* AutoPay Status Toggle */}
      <FadeUp delay={0.12}>
        <div className="card p-5 flex items-center justify-between mb-6">
          <div>
            <p className="text-base font-semibold text-text-primary dark:text-[#F0F0F0]">
              AutoPay Status
            </p>
            <p className="text-sm text-text-muted dark:text-[#6B7280]">
              {isActive ? 'Deductions are active' : 'Deductions are paused'}
            </p>
          </div>
          <StatusToggle
            isActive={isActive}
            onToggle={handleToggle}
            disabled={toggling}
          />
        </div>
      </FadeUp>

      {/* Transaction History */}
      <FadeUp delay={0.18}>
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
          Transaction History
        </h2>
      </FadeUp>

      <StaggerContainer staggerDelay={0.04} delayChildren={0.22}>
        <div className="card divide-y divide-border-subtle dark:divide-[#2D2D2D] px-4">
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted dark:text-[#6B7280]">
                No transactions yet
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <StaggerItem key={tx.id}>
                <AutoPayTransactionItem transaction={tx} />
              </StaggerItem>
            ))
          )}
        </div>
      </StaggerContainer>

      {/* Action Buttons */}
      <FadeUp delay={0.3}>
        <div className="flex gap-3 mt-6 mb-4">
          <motion.button
            onClick={handleToggle}
            disabled={toggling}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold bg-gold-100 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            {isActive ? (
              <>
                <Pause className="size-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-4" />
                Resume
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => {/* Edit amount — future implementation */}}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] border border-border-subtle dark:border-[#2D2D2D]"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            <Target className="size-4" />
            Edit Amount
          </motion.button>

          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="size-14 flex items-center justify-center rounded-2xl bg-error/10 border border-error/20"
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snappy}
          >
            <Trash2 className="size-5 text-error" />
          </motion.button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-text-muted dark:text-[#6B7280] text-center leading-relaxed">
          AutoPay investments are subject to market risk. Returns are not guaranteed.
          Gold.fi is regulated by applicable Indian financial authorities.
        </p>
      </FadeUp>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-6 max-w-sm w-full"
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="mx-auto size-14 bg-error/10 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...SPRING.bouncy, delay: 0.1 }}
                >
                  <Trash2 className="size-6 text-error" />
                </motion.div>
                <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
                  Delete AutoPay?
                </h3>
                <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                  This will permanently delete &ldquo;{selectedAutoPay.name}&rdquo;.
                  Your accumulated gold will remain in your vault.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-surface-elevated dark:bg-[#242424] text-text-primary dark:text-[#F0F0F0] border border-border-subtle dark:border-[#2D2D2D]"
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING.snappy}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-medium bg-error text-white disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING.snappy}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
