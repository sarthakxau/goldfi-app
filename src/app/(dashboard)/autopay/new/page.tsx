'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { FadeUp } from '@/components/animations';
import { FrequencySelector, AmountInput } from '@/components/AutoPay';
import { SPRING } from '@/lib/animations';
import { useAutoPay } from '@/hooks/useAutoPay';
import type { AutoPayFrequency } from '@/types';

export default function NewAutoPayPage() {
  const router = useRouter();
  const { createAutoPay, creating } = useAutoPay();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequency] = useState<AutoPayFrequency>('monthly');
  const [startOption, setStartOption] = useState<'immediate' | 'choose'>('immediate');
  const [startDate, setStartDate] = useState('');

  const isValid = name.trim().length > 0 && amount >= 100;

  const handleCreate = async () => {
    if (!isValid || creating) return;

    const success = await createAutoPay({
      name: name.trim(),
      amount,
      frequency,
      startDate: startOption === 'immediate' ? 'immediate' : startDate,
    });

    if (success) {
      router.push('/autopay');
    }
  };

  // Dynamic label for amount section based on frequency
  const frequencyAmountLabel: Record<AutoPayFrequency, string> = {
    daily: 'Amount Per Daily Instalment',
    weekly: 'Amount Per Weekly Instalment',
    biweekly: 'Amount Per Bi-Weekly Instalment',
    monthly: 'Amount Per Monthly Instalment',
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

      {/* AutoPay Name */}
      <FadeUp delay={0.06}>
        <div className="mb-8">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
            AutoPay Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly Savings"
            className="w-full px-5 py-4 rounded-2xl text-base"
          />
        </div>
      </FadeUp>

      {/* Amount */}
      <FadeUp delay={0.12}>
        <div className="mb-8">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
            {frequencyAmountLabel[frequency]}
          </label>
          <AmountInput value={amount} onChange={setAmount} />
        </div>
      </FadeUp>

      {/* Frequency */}
      <FadeUp delay={0.18}>
        <div className="mb-8">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold mb-3">
            Frequency
          </label>
          <div className="card-elevated p-1.5 rounded-2xl">
            <FrequencySelector value={frequency} onChange={setFrequency} />
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
              onClick={() => setStartOption('immediate')}
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
              onClick={() => setStartOption('choose')}
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
          onClick={handleCreate}
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
    </div>
  );
}
