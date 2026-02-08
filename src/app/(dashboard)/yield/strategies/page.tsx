'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Shield, Landmark, Droplets, Layers, BarChart3 } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING } from '@/lib/animations';
import { MOCK_STRATEGIES } from '@/lib/yieldData';
import { cn } from '@/lib/utils';
import type { RiskLevel, YieldStrategy } from '@/types';

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning dark:text-warning',
  High: 'bg-error/10 text-error',
};

function StrategyCard({ strategy }: { strategy: YieldStrategy }) {
  const Icon = ICON_MAP[strategy.iconType];

  return (
    <StaggerItem>
      <Link href={`/yield/strategies/${strategy.id}`}>
        <motion.div
          className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-6 relative"
          whileTap={{ scale: 0.98 }}
          transition={SPRING.snappy}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center">
                <Icon className="size-6 text-gold-500 dark:text-gold-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-muted dark:text-[#6B7280]">
                    {strategy.protocol}
                  </span>
                  <span className="text-text-muted dark:text-[#4B5563]">·</span>
                  <span className="text-sm text-text-muted dark:text-[#6B7280]">
                    {strategy.chain}
                  </span>
                </div>
                <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-base mt-0.5">
                  {strategy.name}
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-text-muted dark:text-[#4B5563] mt-1 flex-shrink-0" />
          </div>

          {/* APY + TVL */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gold-500 dark:text-gold-400">
              {strategy.apy}% APY
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated dark:bg-[#2D2D2D] text-xs text-text-muted dark:text-[#6B7280]">
              <BarChart3 className="size-3" />
              TVL {strategy.tvl}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary dark:text-[#9CA3AF] leading-relaxed mb-4">
            {strategy.description}
          </p>

          {/* Risk badge + Token pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                RISK_COLORS[strategy.risk]
              )}
            >
              <Shield className="size-3" />
              {strategy.risk}
            </span>
            {strategy.tokens.map((token) => (
              <span
                key={token.symbol}
                className="px-3 py-1.5 rounded-full bg-surface-elevated dark:bg-[#2D2D2D] text-xs font-medium text-text-primary dark:text-[#D1D5DB]"
              >
                {token.symbol}
              </span>
            ))}
          </div>
        </motion.div>
      </Link>
    </StaggerItem>
  );
}

export default function StrategiesPage() {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/yield"
            className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            DeFi Strategies
          </h1>
        </div>
      </FadeUp>

      {/* Strategy Cards */}
      <StaggerContainer staggerDelay={0.08} delayChildren={0.15}>
        <div className="space-y-4">
          {MOCK_STRATEGIES.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      </StaggerContainer>
    </div>
  );
}
