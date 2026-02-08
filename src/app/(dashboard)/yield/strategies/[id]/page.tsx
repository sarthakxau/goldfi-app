'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Landmark,
  Droplets,
  Layers,
  ExternalLink,
  Info,
  Wallet,
} from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';
import { getStrategyById } from '@/lib/yieldData';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

const RISK_TEXT_COLORS: Record<RiskLevel, string> = {
  Low: 'text-success',
  Medium: 'text-warning',
  High: 'text-error',
};

export default function StrategyDetailPage() {
  const params = useParams();
  const strategy = getStrategyById(params.id as string);
  const [amount, setAmount] = useState('');

  if (!strategy) {
    notFound();
  }

  const Icon = ICON_MAP[strategy.iconType];

  const stats = [
    { label: 'Total Value Locked', value: strategy.tvl },
    {
      label: 'Risk Level',
      value: strategy.risk,
      valueClass: RISK_TEXT_COLORS[strategy.risk],
    },
    { label: 'Min Deposit', value: strategy.minDeposit },
    { label: 'Lock Period', value: strategy.lockPeriod },
    { label: 'Liquidation Risk', value: strategy.liquidationRisk },
  ];

  function handleDeposit() {
    alert('Coming soon — deposits are not yet enabled.');
  }

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/yield/strategies"
            className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            {strategy.name}
          </h1>
        </div>
      </FadeUp>

      {/* Hero Card — APY */}
      <FadeUp delay={0.1}>
        <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-8 mb-4 text-center">
          <motion.div
            className="size-16 rounded-2xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING.bouncy, delay: 0.2 }}
          >
            <Icon className="size-8 text-gold-500 dark:text-gold-400" />
          </motion.div>
          <p className="text-sm text-text-muted dark:text-[#6B7280] mb-2">
            {strategy.protocol} · {strategy.chain}
          </p>
          <p className="text-5xl font-bold text-gold-500 dark:text-gold-400 mb-1">
            {strategy.apy}%
          </p>
          <p className="text-sm text-text-muted dark:text-[#6B7280]">
            Annual Percentage Yield
          </p>
        </div>
      </FadeUp>

      {/* Stats Table */}
      <FadeUp delay={0.15}>
        <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-5 mb-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'flex items-start justify-between py-4',
                i < stats.length - 1 &&
                  'border-b border-border-subtle dark:border-[#2D2D2D]'
              )}
            >
              <span className="text-sm text-text-secondary dark:text-[#9CA3AF] shrink-0">
                {stat.label}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold text-right ml-4',
                  stat.valueClass ||
                    'text-text-primary dark:text-[#F0F0F0]'
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* How It Works */}
      <FadeUp delay={0.2}>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-4">
          HOW IT WORKS
        </p>
      </FadeUp>

      <StaggerContainer staggerDelay={0.06} delayChildren={0.25}>
        <div className="space-y-4 mb-8">
          {strategy.steps.map((step, i) => (
            <StaggerItem key={i}>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-gold-500/10 dark:bg-gold-500/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold-500 dark:text-gold-400">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-text-secondary dark:text-[#D1D5DB] leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      {/* Required Tokens */}
      <FadeUp delay={0.3}>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-4">
          REQUIRED TOKENS
        </p>
        <div className="flex gap-3 mb-8">
          {strategy.tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-xl px-4 py-3 flex-1"
            >
              <div
                className={cn(
                  'size-10 rounded-full flex items-center justify-center text-sm font-bold',
                  token.iconType === 'gold'
                    ? 'bg-gold-100 dark:bg-gold-500/15 text-gold-500 dark:text-gold-400'
                    : 'bg-success/10 text-success'
                )}
              >
                {token.iconType === 'gold' ? 'Au' : '$'}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary dark:text-[#F0F0F0]">
                  {token.symbol}
                </p>
                <p className="text-xs text-text-muted dark:text-[#6B7280]">
                  {token.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* Enter Amount */}
      <FadeUp delay={0.35}>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-4">
          ENTER AMOUNT
        </p>

        {/* Input */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl px-5 py-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-muted dark:text-[#6B7280]">
              XAUT
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-lg font-semibold text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#4B5563] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 mb-6">
          {strategy.quickAmounts.map((qa) => (
            <motion.button
              key={qa}
              onClick={() => setAmount(qa)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                amount === qa
                  ? 'bg-gold-500/10 border-gold-500/30 text-gold-500 dark:text-gold-400'
                  : 'bg-white dark:bg-[#1A1A1A] border-border-subtle dark:border-[#2D2D2D] text-text-primary dark:text-[#D1D5DB]'
              )}
              whileTap={{ scale: 0.95 }}
              transition={SPRING.snappy}
            >
              {qa} XAUT
            </motion.button>
          ))}
        </div>

        {/* Deposit Button */}
        <motion.button
          onClick={handleDeposit}
          className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 mb-3"
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
        >
          <Wallet className="size-5" />
          Deposit
        </motion.button>

        {/* View on Protocol */}
        <a
          href={strategy.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <motion.button
            className="w-full border border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF] font-medium text-base py-4 rounded-2xl flex items-center justify-center gap-2 bg-white dark:bg-[#1A1A1A]"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            <ExternalLink className="size-5" />
            View on {strategy.protocol}
          </motion.button>
        </a>
      </FadeUp>

      {/* Disclaimer */}
      <FadeUp delay={0.4}>
        <div className="mt-6 mb-4 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-xl p-4 flex gap-3">
          <Info className="size-4 text-text-muted dark:text-[#6B7280] shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted dark:text-[#6B7280] leading-relaxed">
            DeFi strategies involve smart contract risk, liquidation risk, and
            impermanent loss. Past APYs do not guarantee future returns. Gold.fi
            acts as an interface and does not custody your funds.
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
