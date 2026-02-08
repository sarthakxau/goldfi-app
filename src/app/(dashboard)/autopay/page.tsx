'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { AutoPayStatsCard, AutoPayCard } from '@/components/AutoPay';
import { SPRING } from '@/lib/animations';
import { useAutoPay } from '@/hooks/useAutoPay';

export default function AutoPayPage() {
  const router = useRouter();
  const { autoPays, stats } = useAutoPay();

  const activePlans = autoPays.filter((a) => a.status === 'active');
  const pausedPlans = autoPays.filter((a) => a.status === 'paused');
  const allPlans = [...activePlans, ...pausedPlans];

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp delay={0}>
        <h1 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] text-center mb-6">
          Autopay
        </h1>
      </FadeUp>

      {/* Monthly Savings Summary Card */}
      <FadeUp delay={0.06}>
        <div className="mb-8">
          <AutoPayStatsCard stats={stats} />
        </div>
      </FadeUp>

      {/* Active AutoPays Section */}
      <FadeUp delay={0.12}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-text-muted dark:text-[#6B7280] font-semibold">
            Active AutoPays
          </h2>
          <span className="text-sm text-text-secondary dark:text-[#9CA3AF]">
            {allPlans.length} {allPlans.length === 1 ? 'plan' : 'plans'}
          </span>
        </div>
      </FadeUp>

      {/* AutoPay Cards List */}
      <StaggerContainer staggerDelay={0.06} delayChildren={0.16} className="space-y-3 mb-8">
        {allPlans.map((autoPay) => (
          <StaggerItem key={autoPay.id}>
            <AutoPayCard
              autoPay={autoPay}
              onPress={(id) => router.push(`/autopay/${id}`)}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Start New AutoPay Button */}
      <FadeUp delay={0.3}>
        <motion.button
          onClick={() => router.push('/autopay/new')}
          className="w-full bg-gold-gradient text-[#1A1A1A] font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
          transition={SPRING.snappy}
        >
          <Plus className="size-5" />
          Start New AutoPay
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
