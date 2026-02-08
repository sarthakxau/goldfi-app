'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { TrendingUp, Landmark, Droplets, Layers } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { AnimatedNumber } from '@/components/animations';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';
import { MOCK_STRATEGIES, MOCK_POSITIONS, TOTAL_EARNINGS } from '@/lib/yieldData';
import { cn } from '@/lib/utils';
import type { YieldPosition } from '@/types';

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

function getStrategyForPosition(position: YieldPosition) {
  return MOCK_STRATEGIES.find((s) => s.id === position.strategyId);
}

function EarningsBreakdown() {
  return (
    <div className="flex gap-6 mt-4">
      {MOCK_POSITIONS.map((position) => {
        const strategy = getStrategyForPosition(position);
        if (!strategy) return null;
        const label =
          strategy.id === 'aave-xaut-collateral'
            ? 'XAUT COLLATERAL'
            : 'FLUID VAULT';
        return (
          <div key={position.strategyId}>
            <p className="text-xs font-medium tracking-wider text-text-muted dark:text-[#6B7280] uppercase">
              {label}
            </p>
            <p className="text-sm font-semibold text-success mt-0.5">
              +${position.earned.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PositionCard({ position, index }: { position: YieldPosition; index: number }) {
  const strategy = getStrategyForPosition(position);
  if (!strategy) return null;

  const Icon = ICON_MAP[strategy.iconType];

  return (
    <StaggerItem key={position.strategyId}>
      <motion.div
        className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-5"
        whileTap={{ scale: 0.98 }}
        transition={SPRING.snappy}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center">
              <Icon className="size-5 text-gold-500 dark:text-gold-400" />
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-[15px]">
                {strategy.name}
              </p>
              <p className="text-xs text-text-muted dark:text-[#6B7280] mt-0.5">
                {strategy.protocol} · {strategy.chain}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
            <span className="size-1.5 rounded-full bg-success" />
            {position.status}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'DEPOSITED', value: `${position.deposited} ${position.depositToken}` },
            { label: 'EARNED', value: `$${position.earned.toFixed(2)}`, isGreen: true },
            { label: 'APY', value: `${position.apy}%`, isGold: true },
            { label: 'DAYS', value: `${position.days}` },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[10px] font-medium tracking-wider text-text-muted dark:text-[#6B7280] uppercase">
                {stat.label}
              </p>
              <p
                className={cn(
                  'text-sm font-semibold mt-0.5',
                  stat.isGreen
                    ? 'text-success'
                    : stat.isGold
                    ? 'text-gold-500 dark:text-gold-400'
                    : 'text-text-primary dark:text-[#F0F0F0]'
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </StaggerItem>
  );
}

export default function EarnPage() {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] text-center mb-6">
          Earn
        </h1>
      </FadeUp>

      {/* Total Earnings Card */}
      <FadeUp delay={0.1}>
        <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-6 mb-8">
          <div className="absolute inset-0 gold-shimmer pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280]">
              TOTAL EARNINGS
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-sm text-text-muted dark:text-[#6B7280]">$</span>
              <AnimatedNumber
                value={TOTAL_EARNINGS}
                format={(v) => v.toFixed(2)}
                duration={0.6}
                className="text-4xl font-bold text-text-primary dark:text-[#F0F0F0]"
              />
            </div>
            <EarningsBreakdown />
          </div>
        </div>
      </FadeUp>

      {/* Active Positions */}
      <FadeUp delay={0.2}>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-4">
          ACTIVE POSITIONS
        </p>
      </FadeUp>

      <StaggerContainer staggerDelay={0.08} delayChildren={0.25}>
        <div className="space-y-4 mb-8">
          {MOCK_POSITIONS.map((position, i) => (
            <PositionCard key={position.strategyId} position={position} index={i} />
          ))}
        </div>
      </StaggerContainer>

      {/* Explore Strategies Button */}
      <FadeUp delay={0.4}>
        <Link href="/yield/strategies">
          <motion.button
            className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            <TrendingUp className="size-5" />
            Explore Strategies
          </motion.button>
        </Link>
      </FadeUp>
    </div>
  );
}
