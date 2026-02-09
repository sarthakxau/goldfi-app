'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Mail, X } from 'lucide-react';
import { backdropFade, modalScale, SPRING } from '@/lib/animations';

interface UserNotFoundDialogProps {
  isOpen: boolean;
  email: string;
  onContinue: () => void;
  onClose: () => void;
}

export function UserNotFoundDialog({ isOpen, email, onContinue, onClose }: UserNotFoundDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          variants={backdropFade}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-sm border border-border-subtle dark:border-[#2D2D2D]"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Icon */}
            <div className="size-14 rounded-2xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mb-4 mx-auto">
              <Mail className="size-7 text-gold-500 dark:text-gold-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] text-center mb-2">
              User not found
            </h3>

            {/* Description */}
            <p className="text-sm text-text-secondary dark:text-[#9CA3AF] text-center mb-2">
              <span className="font-medium text-text-primary dark:text-[#F0F0F0]">{email}</span>{' '}
              doesn&apos;t have a gold.fi account yet.
            </p>
            <p className="text-sm text-text-secondary dark:text-[#9CA3AF] text-center mb-6">
              Send them a gift via email. They&apos;ll receive a link to sign up and claim their gold.
            </p>

            {/* CTA */}
            <motion.button
              onClick={onContinue}
              className="w-full bg-gold-gradient text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
              transition={SPRING.snappy}
            >
              <Mail className="size-4" />
              Continue with email gift
            </motion.button>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full text-text-secondary dark:text-[#9CA3AF] text-sm font-medium py-3 mt-2"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
