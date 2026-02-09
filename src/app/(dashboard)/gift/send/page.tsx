'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { FadeUp } from '@/components/animations';
import {
  AmountSelector,
  OccasionPills,
  GiftPreviewCard,
  RecipientLookup,
  UserNotFoundDialog,
  PaymentStep,
  GiftConfirmation,
} from '@/components/Gift';
import { GIFT_PRESET_INR, calculateGramsFromInr } from '@/lib/giftData';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
import { useGiftSend } from '@/hooks/useGiftSend';
import type { GiftOccasion } from '@/types';

// Multi-step form schema
const giftFormSchema = z.object({
  recipientEmail: z.string().email('Please enter a valid email').trim(),
  selectedAmount: z.number().min(100, 'Minimum gift amount is ₹100'),
  gramsAmount: z.number().min(0),
  customAmount: z.string().optional(),
  occasion: z.enum(['Birthday', 'Wedding', 'Festival', 'Thank You', 'Just Because', 'Anniversary', 'Custom'] as const),
  message: z.string().max(100, 'Message must be 100 characters or less').optional(),
});

type GiftFormData = FormData<typeof giftFormSchema>;

type PageStep = 'details' | 'payment' | 'success';

export default function SendGiftPage() {
  const router = useRouter();
  const [pageStep, setPageStep] = useState<PageStep>('details');

  const {
    step: giftStep,
    error: giftError,
    lookupResult,
    lookupLoading,
    xautBalanceGrams,
    balanceLoading,
    lookupRecipient,
    continueWithEmail,
    executeGift,
    reset: resetGift,
  } = useGiftSend();

  const {
    watch,
    setValue,
    formState: { errors },
  } = useForm<GiftFormData>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      recipientEmail: '',
      selectedAmount: 500,
      gramsAmount: 0.07,
      customAmount: '',
      occasion: 'Birthday',
      message: '',
    },
    mode: 'onChange',
  });

  const recipientEmail = watch('recipientEmail');
  const selectedAmount = watch('selectedAmount');
  const gramsAmount = watch('gramsAmount');
  const occasion = watch('occasion');
  const message = watch('message') || '';
  const customAmount = watch('customAmount') || '';

  // Whether the recipient was found or user chose to continue with email
  const recipientResolved = lookupResult?.found === true || giftStep === 'confirm';

  const handleAmountSelect = (inr: number, grams: number) => {
    setValue('selectedAmount', inr, { shouldValidate: true });
    setValue('gramsAmount', grams);
    setValue('customAmount', '');
  };

  const handleCustomAmountChange = (value: string) => {
    setValue('customAmount', value);
    if (value) {
      const inr = Number(value);
      setValue('selectedAmount', inr, { shouldValidate: true });
      setValue('gramsAmount', calculateGramsFromInr(inr, selectedAmount / gramsAmount));
    }
  };

  const handleOccasionSelect = (newOccasion: GiftOccasion) => {
    setValue('occasion', newOccasion);
  };

  const handleLookup = async (email: string) => {
    setValue('recipientEmail', email, { shouldValidate: true });
    return lookupRecipient(email);
  };

  const handleContinueWithEmail = () => {
    continueWithEmail();
  };

  const handleProceedToPayment = () => {
    setPageStep('payment');
  };

  const handleConfirmPayment = async () => {
    await executeGift({
      recipientEmail,
      inrAmount: selectedAmount,
      gramsAmount,
      xautAmount: gramsAmount, // Will be converted in hook
      goldPriceInr: selectedAmount / gramsAmount,
      occasion,
      message: message || undefined,
    });
    setPageStep('success');
  };

  const handleReset = () => {
    resetGift();
    setPageStep('details');
    setValue('recipientEmail', '');
    setValue('selectedAmount', 500);
    setValue('gramsAmount', 0.07);
    setValue('customAmount', '');
    setValue('occasion', 'Birthday');
    setValue('message', '');
  };

  const isFormReady = recipientResolved && selectedAmount >= 100 && recipientEmail.length > 0;

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/gift">
            <motion.div
              className="size-10 rounded-xl bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              transition={SPRING.snappy}
            >
              <ArrowLeft className="size-5 text-text-primary dark:text-[#F0F0F0]" />
            </motion.div>
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            Send Gold Gift
          </h1>
        </div>
      </FadeUp>

      <AnimatePresence mode="wait">
        {/* ──────── STEP 1: Gift Details ──────── */}
        {pageStep === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          >
            {/* Recipient Email */}
            <FadeUp delay={0.05}>
              <div className="mb-6">
                <RecipientLookup
                  value={recipientEmail}
                  onChange={val => setValue('recipientEmail', val, { shouldValidate: true })}
                  onLookup={handleLookup}
                  lookupLoading={lookupLoading}
                  found={lookupResult?.found ?? null}
                  error={giftError}
                  disabled={giftStep !== 'input' && giftStep !== 'not-found' && giftStep !== 'confirm'}
                />
              </div>
            </FadeUp>

            {/* Amount Selection */}
            <FadeUp delay={0.1}>
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
                  Amount
                </label>
                <AmountSelector
                  presetInrAmounts={GIFT_PRESET_INR}
                  pricePerGramInr={selectedAmount / gramsAmount}
                  selectedAmount={selectedAmount}
                  onSelect={handleAmountSelect}
                  customAmount={customAmount}
                  onCustomAmountChange={handleCustomAmountChange}
                />
                {errors.selectedAmount && (
                  <p className="text-error text-xs mt-2">{errors.selectedAmount.message}</p>
                )}
              </div>
            </FadeUp>

            {/* Occasion Selection */}
            <FadeUp delay={0.15}>
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
                  Occasion
                </label>
                <OccasionPills selected={occasion} onSelect={handleOccasionSelect} />
              </div>
            </FadeUp>

            {/* Personal Message */}
            <FadeUp delay={0.2}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280]">
                    Personal Message
                  </label>
                  <span className="text-xs text-text-muted dark:text-[#6B7280]">
                    {message.length}/100
                  </span>
                </div>
                <textarea
                  placeholder="Add a personal note (optional)"
                  value={message}
                  onChange={e => setValue('message', e.target.value)}
                  rows={3}
                  className="w-full py-4 px-4 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#6B7280] outline-none focus:border-gold-500/50 transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-error text-xs mt-2">{errors.message.message}</p>
                )}
              </div>
            </FadeUp>

            {/* Gift Preview */}
            <FadeUp delay={0.25}>
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
                  Gift Preview
                </label>
                <GiftPreviewCard
                  gramsAmount={gramsAmount}
                  inrAmount={selectedAmount}
                  occasion={occasion}
                />
              </div>
            </FadeUp>

            {/* Proceed Button */}
            <FadeUp delay={0.3}>
              <motion.button
                onClick={handleProceedToPayment}
                disabled={!isFormReady}
                className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                <Send className="size-5" />
                Continue · &#8377;{selectedAmount.toLocaleString('en-IN')}
              </motion.button>
            </FadeUp>

            {/* Disclaimer */}
            <FadeUp delay={0.35}>
              <p className="text-xs text-text-muted dark:text-[#6B7280] text-center leading-relaxed">
                Gold gifts are subject to market price fluctuations. Gift gold is not a fixed-return instrument. Platform charges and GST apply.
              </p>
            </FadeUp>
          </motion.div>
        )}

        {/* ──────── STEP 2: Payment ──────── */}
        {pageStep === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          >
            {/* Summary */}
            <FadeUp>
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
                  Gift Summary
                </label>
                <GiftPreviewCard
                  gramsAmount={gramsAmount}
                  inrAmount={selectedAmount}
                  occasion={occasion}
                />
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-text-muted dark:text-[#6B7280]">To:</span>
                  <span className="text-xs font-medium text-text-primary dark:text-[#F0F0F0]">{recipientEmail}</span>
                  {lookupResult?.found ? (
                    <span className="text-xs text-success">(existing user)</span>
                  ) : (
                    <span className="text-xs text-gold-500">(via email)</span>
                  )}
                </div>
              </div>
            </FadeUp>

            {/* Payment */}
            <PaymentStep
              xautBalanceGrams={xautBalanceGrams}
              gramsAmount={gramsAmount}
              inrAmount={selectedAmount}
              step={giftStep}
              onConfirm={handleConfirmPayment}
            />

            {/* Error */}
            {giftError && giftStep === 'error' && (
              <FadeUp>
                <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-2xl">
                  <p className="text-sm text-error">{giftError}</p>
                  <button
                    onClick={() => setPageStep('details')}
                    className="text-sm text-text-secondary dark:text-[#9CA3AF] font-medium mt-2"
                  >
                    Go back
                  </button>
                </div>
              </FadeUp>
            )}

            {/* Back button */}
            {giftStep !== 'approve' && giftStep !== 'transfer' && giftStep !== 'confirming' && (
              <FadeUp delay={0.1}>
                <button
                  onClick={() => setPageStep('details')}
                  className="w-full text-text-secondary dark:text-[#9CA3AF] text-sm font-medium py-3 mt-2"
                >
                  Back to details
                </button>
              </FadeUp>
            )}
          </motion.div>
        )}

        {/* ──────── STEP 3: Success ──────── */}
        {pageStep === 'success' && giftStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
          >
            <GiftConfirmation
              recipientEmail={recipientEmail}
              gramsAmount={gramsAmount}
              inrAmount={selectedAmount}
              recipientFound={lookupResult?.found ?? false}
              onViewGifts={() => router.push('/gift')}
              onSendAnother={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Not Found Dialog */}
      <UserNotFoundDialog
        isOpen={giftStep === 'not-found'}
        email={recipientEmail}
        onContinue={handleContinueWithEmail}
        onClose={() => resetGift()}
      />
    </div>
  );
}
