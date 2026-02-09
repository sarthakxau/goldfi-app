'use client';

import { motion } from 'motion/react';
import { Wallet, Loader2 } from 'lucide-react';
import { FadeUp } from '@/components/animations';
import { SPRING } from '@/lib/animations';
import type { GiftStep } from '@/types';

interface PaymentStepProps {
  xautBalanceGrams: number | null;
  gramsAmount: number;
  inrAmount: number;
  step: GiftStep;
  onConfirm: () => void;
}

export function PaymentStep({
  xautBalanceGrams,
  gramsAmount,
  inrAmount,
  step,
  onConfirm,
}: PaymentStepProps) {
  const isProcessing = step === 'approve' || step === 'transfer' || step === 'confirming';
  const insufficientBalance = xautBalanceGrams !== null && xautBalanceGrams < gramsAmount;

  const stepLabel = {
    approve: 'Preparing transfer...',
    transfer: 'Confirm in your wallet...',
    confirming: 'Confirming on-chain...',
  }[step as string] || '';

  return (
    <div>
      <FadeUp>
        <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
          Pay from wallet
        </label>

        <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-5 mb-4">
          {/* Balance display */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary dark:text-[#9CA3AF]">Your gold balance</span>
            <span className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0]">
              {xautBalanceGrams !== null ? `${xautBalanceGrams.toFixed(2)}g` : '—'}
            </span>
          </div>

          {/* Amount being sent */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle dark:border-[#2D2D2D]">
            <span className="text-sm text-text-secondary dark:text-[#9CA3AF]">Sending</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0]">{gramsAmount.toFixed(2)}g</p>
              <p className="text-xs text-text-muted dark:text-[#6B7280]">~&#8377;{inrAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Remaining */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary dark:text-[#9CA3AF]">Remaining</span>
            <span className="text-sm font-medium text-text-primary dark:text-[#F0F0F0]">
              {xautBalanceGrams !== null ? `${Math.max(0, xautBalanceGrams - gramsAmount).toFixed(2)}g` : '—'}
            </span>
          </div>
        </div>

        {/* Insufficient balance warning */}
        {insufficientBalance && (
          <p className="text-error text-xs mb-4">
            Insufficient gold balance. You need {gramsAmount.toFixed(2)}g but only have{' '}
            {xautBalanceGrams?.toFixed(2)}g.
          </p>
        )}

        {/* Processing status */}
        {isProcessing && stepLabel && (
          <div className="flex items-center gap-2 justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="size-4 text-gold-500" />
            </motion.div>
            <span className="text-sm text-gold-500 font-medium">{stepLabel}</span>
          </div>
        )}

        {/* Send button */}
        <motion.button
          onClick={onConfirm}
          disabled={isProcessing || insufficientBalance}
          className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
        >
          {isProcessing ? (
            <motion.div
              className="size-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              <Wallet className="size-5" />
              Send {gramsAmount.toFixed(2)}g Gold
            </>
          )}
        </motion.button>
      </FadeUp>
    </div>
  );
}
