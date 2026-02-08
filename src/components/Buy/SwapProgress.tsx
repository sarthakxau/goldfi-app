'use client';

import { Check, Loader2, X, ExternalLink } from 'lucide-react';
import type { SwapStep } from '@/types';
import { motion } from 'motion/react';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface SwapProgressProps {
  step: SwapStep;
  approvalTxHash: string | null;
  swapTxHash: string | null;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

const ARBISCAN_URL = 'https://arbiscan.io/tx/';

export function SwapProgress({
  step,
  approvalTxHash,
  swapTxHash,
  error,
  onClose,
  onRetry
}: SwapProgressProps) {
  const steps = [
    { key: 'approve', label: 'Approving USDT' },
    { key: 'swap', label: 'Swapping to Gold' },
    { key: 'confirming', label: 'Confirming' },
  ];

  if (step === 'success') {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal }}
      >
        <motion.div
          className="w-16 h-16 bg-success-light dark:bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.bouncy}
        >
          <Check className="w-8 h-8 text-success" />
        </motion.div>
        <motion.h3
          className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, delay: 0.15, ease: EASE_OUT_EXPO }}
        >
          Swap Successful!
        </motion.h3>
        <motion.p
          className="text-text-muted dark:text-[#6B7280] mb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, delay: 0.2, ease: EASE_OUT_EXPO }}
        >
          Your gold has been added to your holdings
        </motion.p>
        {swapTxHash && (
          <a
            href={`${ARBISCAN_URL}${swapTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gold-500 hover:underline mb-6"
          >
            View on Arbiscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <motion.button
          onClick={onClose}
          className="w-full bg-text-primary dark:bg-[#F0F0F0] text-white dark:text-[#0F0F0F] font-medium py-4 rounded-xl"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, delay: 0.25, ease: EASE_OUT_EXPO }}
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  if (step === 'error') {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal }}
      >
        <motion.div
          className="w-16 h-16 bg-error-light dark:bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.bouncy}
        >
          <X className="w-8 h-8 text-error" />
        </motion.div>
        <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Swap Failed</h3>
        <p className="text-error mb-6 text-sm">{error || 'Something went wrong'}</p>
        <div className="space-y-3">
          <motion.button
            onClick={onRetry}
            className="w-full bg-text-primary dark:bg-[#F0F0F0] text-white dark:text-[#0F0F0F] font-medium py-4 rounded-xl"
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
          <motion.button
            onClick={onClose}
            className="w-full border border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF] font-medium py-4 rounded-xl"
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-gold-500" />
        </motion.div>
      </div>
      <div className="space-y-4">
        {steps.map((s, index) => {
          const stepIndex = steps.findIndex(x => x.key === step);
          const isActive = s.key === step;
          const isPast = stepIndex > index;

          return (
            <motion.div
              key={s.key}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: DURATION.normal, delay: index * 0.08, ease: EASE_OUT_EXPO }}
            >
              <motion.div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${isPast ? 'bg-success text-white' : ''}
                  ${isActive ? 'bg-gold-500 text-white' : ''}
                  ${!isPast && !isActive ? 'bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280]' : ''}
                `}
                animate={isPast ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isPast ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className={`text-sm ${isActive ? 'font-medium text-text-primary dark:text-[#F0F0F0]' : 'text-text-muted dark:text-[#6B7280]'}`}>
                {s.label}
              </span>
              {isActive && (
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4 text-gold-500" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {approvalTxHash && (
        <a
          href={`${ARBISCAN_URL}${approvalTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-gold-500 hover:underline mt-4"
        >
          View approval tx <ExternalLink className="w-3 h-3 inline" />
        </a>
      )}
    </div>
  );
}
