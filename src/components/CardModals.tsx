'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Copy, CreditCard, Shield, Ban, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { slideUpSpring, backdropFade, SPRING } from '@/lib/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modalBackdrop"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-modal bg-white dark:bg-[#1A1A1A] rounded-t-3xl p-6 shadow-card md:bottom-auto md:top-1/2 md:left-1/2 md:w-[400px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl border-t border-border-subtle dark:border-[#2D2D2D] md:border"
            variants={slideUpSpring}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] hover:bg-surface-elevated dark:hover:bg-[#242424] rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="size-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ isOpen, onClose }: CardDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const Field = ({ label, value, copyable = true }: { label: string, value: string, copyable?: boolean }) => (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle dark:border-[#2D2D2D] last:border-0">
      <div>
        <p className="text-xs text-text-muted dark:text-[#6B7280] font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-text-primary dark:text-[#F0F0F0] font-bold text-lg">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={() => copyToClipboard(value, label)}
          className="p-2 text-gold-500 hover:bg-gold-100 dark:hover:bg-gold-500/10 rounded-lg transition-colors"
        >
          <AnimatePresence mode="wait">
            {copiedField === label ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="size-5 text-success" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy className="size-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details">
      <div className="space-y-1">
        <Field label="Card Number" value="3489 2382 3023 3224" />
        <Field label="Expiry Date" value="11/32" />
        <Field label="CVV" value="234" />
        <Field label="Name on Card" value="User" />
      </div>
    </Modal>
  );
}

interface CardMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardMoreModal({ isOpen, onClose }: CardMoreModalProps) {
  const ActionButton = ({ icon: Icon, label, destructive = false }: { icon: React.ElementType, label: string, destructive?: boolean }) => (
    <motion.button
      aria-label={label}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border border-border-subtle dark:border-[#2D2D2D] mb-3 transition-colors",
        "hover:border-gold-500/30 hover:bg-surface-elevated dark:hover:bg-[#242424]",
        destructive && "hover:border-error/30 hover:bg-error-light dark:hover:bg-error/10"
      )}
      whileTap={{ scale: 0.98 }}
      transition={SPRING.snappy}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          destructive ? "bg-error-light dark:bg-error/10 text-error" : "bg-gold-100 dark:bg-gold-500/10 text-gold-500"
        )}>
          <Icon className="size-5" />
        </div>
        <span className={cn(
          "font-semibold",
          destructive ? "text-error" : "text-text-secondary dark:text-[#9CA3AF]"
        )}>{label}</span>
      </div>
      <ChevronRight className={cn(
        "size-5",
        destructive ? "text-error/50" : "text-text-muted dark:text-[#6B7280]"
      )} />
    </motion.button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Options">
      <div className="py-2">
        <ActionButton icon={CreditCard} label="Set Card PIN" />
        <ActionButton icon={Shield} label="Adjust Limits" />
        <div className="h-px bg-border-subtle dark:bg-[#2D2D2D] my-4" />
        <ActionButton icon={Ban} label="Cancel Card" destructive />
      </div>
    </Modal>
  );
}
