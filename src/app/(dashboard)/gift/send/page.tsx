'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { FadeUp } from '@/components/animations';
import { AmountSelector, OccasionPills, GiftPreviewCard } from '@/components/Gift';
import { GIFT_PRESET_AMOUNTS, calculateGramsFromInr } from '@/lib/giftData';
import { SPRING } from '@/lib/animations';
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
import type { GiftOccasion } from '@/types';

// Define the form schema with Zod
const giftFormSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required').trim(),
  selectedAmount: z.number().min(100, 'Minimum gift amount is ₹100'),
  gramsAmount: z.number().min(0),
  customAmount: z.string().optional(),
  occasion: z.enum(['Birthday', 'Wedding', 'Festival', 'Thank You', 'Just Because', 'Anniversary', 'Custom'] as const),
  message: z.string().max(100, 'Message must be 100 characters or less').optional(),
});

type GiftFormData = FormData<typeof giftFormSchema>;


export default function SendGiftPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GiftFormData>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      recipient: '',
      selectedAmount: 500,
      gramsAmount: 0.07,
      customAmount: '',
      occasion: 'Birthday',
      message: '',
    },
    mode: 'onChange', // Validate on change for real-time feedback
  });

  // Watch values for reactive UI updates
  const selectedAmount = watch('selectedAmount');
  const gramsAmount = watch('gramsAmount');
  const occasion = watch('occasion');
  const message = watch('message') || '';

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
      setValue('gramsAmount', calculateGramsFromInr(inr));
    }
  };

  const handleOccasionSelect = (newOccasion: GiftOccasion) => {
    setValue('occasion', newOccasion);
  };

  const onSubmit = async (data: GiftFormData) => {
    // In a real app, this would submit the gift
    console.log('Gift form submitted:', data);
    router.push('/gift');
  };

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

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Recipient Input */}
        <FadeUp delay={0.05}>
          <div className="mb-6">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
              Recipient
            </label>
            <input
              type="text"
              placeholder="Name, phone or email"
              {...register('recipient')}
              className="w-full py-4 px-4 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#6B7280] outline-none focus:border-gold-500/50 transition-colors"
            />
            {errors.recipient && (
              <p className="text-error text-xs mt-2">{errors.recipient.message}</p>
            )}
          </div>
        </FadeUp>

        {/* Amount Selection */}
        <FadeUp delay={0.1}>
          <div className="mb-6">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
              Amount
            </label>
            <AmountSelector
              presets={GIFT_PRESET_AMOUNTS}
              selectedAmount={selectedAmount}
              onSelect={handleAmountSelect}
              customAmount={watch('customAmount') || ''}
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
              {...register('message')}
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

        {/* Send Button */}
        <FadeUp delay={0.3}>
          <motion.button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            {isSubmitting ? (
              <motion.div
                className="size-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <Send className="size-5" />
                Send Gift · ₹{selectedAmount.toLocaleString('en-IN')}
              </>
            )}
          </motion.button>
        </FadeUp>

        {/* Disclaimer */}
        <FadeUp delay={0.35}>
          <p className="text-xs text-text-muted dark:text-[#6B7280] text-center leading-relaxed">
            Gold gifts are subject to market price fluctuations. Gift gold is not a fixed-return instrument. Platform charges and GST apply. Bullion is not a deposit-taking NBFC.
          </p>
        </FadeUp>
      </form>
    </div>
  );
}
