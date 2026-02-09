'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { FadeUp } from '@/components/animations';
import { FrequencySelector, AmountInput } from '@/components/AutoPay';
import { SPRING } from '@/lib/animations';
import { useAutoPay } from '@/hooks/useAutoPay';
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
import type { AutoPayFrequency } from '@/types';

// Define the form schema
const autoPayFormSchema = z.object({
  name: z.string().min(1, 'AutoPay name is required').trim(),
  amount: z.number().min(100, 'Minimum amount is ₹100'),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly'] as const),
  startOption: z.enum(['immediate', 'choose'] as const),
  startDate: z.string().optional(),
});

type AutoPayFormData = FormData<typeof autoPayFormSchema>;

export default function NewAutoPayPage() {
  const router = useRouter();
  const { createAutoPay, creating } = useAutoPay();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AutoPayFormData>({
    resolver: zodResolver(autoPayFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      frequency: 'monthly',
      startOption: 'immediate',
      startDate: '',
    },
    mode: 'onChange',
  });

  // Watch values for reactive UI updates
  const frequency = watch('frequency');
  const startOption = watch('startOption');
  const amount = watch('amount');

  // Dynamic label for amount section based on frequency
  const frequencyAmountLabel: Record<AutoPayFrequency, string> = {
    daily: 'Amount Per Daily Instalment',
    weekly: 'Amount Per Weekly Instalment',
    biweekly: 'Amount Per Bi-Weekly Instalment',
    monthly: 'Amount Per Monthly Instalment',
  };

  const handleAmountChange = (newAmount: number) => {
    setValue('amount', newAmount, { shouldValidate: true });
  };

  const handleFrequencyChange = (newFrequency: AutoPayFrequency) => {
    setValue('frequency', newFrequency);
  };

  const onSubmit = async (data: AutoPayFormData) => {
    const success = await createAutoPay({
      name: data.name.trim(),
      amount: data.amount,
      frequency: data.frequency,
      startDate: data.startOption === 'immediate' ? 'immediate' : data.startDate || '',
    });

    if (success) {
      router.push('/autopay');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp delay={0}>
        <div className="flex items-center gap-3 mb-8">
          <motion.button
            onClick={() => router.push('/autopay')}
            className="size-10 rounded-full bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            transition={SPRING.snappy}
          >
            <ArrowLeft className="size-5 text-text-primary dark:text-[#F0F0F0]" />
          </motion.button>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            New Gold AutoPay
          </h1>
        </div>
      </FadeUp>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* AutoPay Name */}
        <FadeUp delay={0.06}>
          <div className="mb-8">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
              AutoPay Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Monthly Savings"
              className="w-full px-5 py-4 rounded-2xl text-base"
            />
            {errors.name && (
              <p className="text-error text-xs mt-2">{errors.name.message}</p>
            )}
          </div>
        </FadeUp>

        {/* Amount */}
        <FadeUp delay={0.12}>
          <div className="mb-8">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
              {frequencyAmountLabel[frequency]}
            </label>
            <AmountInput value={amount} onChange={handleAmountChange} />
            {errors.amount && (
              <p className="text-error text-xs mt-2">{errors.amount.message}</p>
            )}
          </div>
        </FadeUp>

        {/* Frequency */}
        <FadeUp delay={0.18}>
          <div className="mb-8">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
              Frequency
            </label>
            <div className="card-elevated p-1.5 rounded-2xl">
              <FrequencySelector value={frequency} onChange={handleFrequencyChange} />
            </div>
          </div>
        </FadeUp>

        {/* Start Date */}
        <FadeUp delay={0.24}>
          <div className="mb-10">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
              Start Date
            </label>
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => setValue('startOption', 'immediate')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium border transition-colors ${
                  startOption === 'immediate'
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                    : 'bg-surface-elevated dark:bg-[#242424] border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF]'
                }`}
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                <Sparkles className="size-4" />
                Start immediately
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setValue('startOption', 'choose')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium border transition-colors ${
                  startOption === 'choose'
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                    : 'bg-surface-elevated dark:bg-[#242424] border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF]'
                }`}
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                <Calendar className="size-4" />
                Choose date
              </motion.button>
            </div>

            {/* Date picker - shown when "Choose date" is selected */}
            {startOption === 'choose' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <input
                  type="date"
                  {...register('startDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] text-text-primary dark:text-[#F0F0F0]"
                />
              </motion.div>
            )}
          </div>
        </FadeUp>

        {/* Submit Button */}
        <FadeUp delay={0.3}>
          <motion.button
            type="submit"
            disabled={!isValid || creating}
            className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
              isValid
                ? 'bg-gold-gradient text-[#1A1A1A]'
                : 'bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280] border border-border-subtle dark:border-[#2D2D2D]'
            }`}
            whileTap={isValid ? { scale: 0.98 } : undefined}
            transition={SPRING.snappy}
          >
            {creating ? (
              <motion.div
                className="size-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <Sparkles className="size-5" />
                Start AutoPay
              </>
            )}
          </motion.button>

          {/* Disclaimer */}
          <p className="text-xs text-text-muted dark:text-[#6B7280] text-center mt-4 leading-relaxed">
            AutoPay investments are subject to market risk. Returns are not guaranteed.
            Gold.fi is regulated by applicable Indian financial authorities.
          </p>
        </FadeUp>
      </form>
    </div>
  );
}
