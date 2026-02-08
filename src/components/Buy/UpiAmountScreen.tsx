'use client';

import { useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { INR_QUICK_AMOUNTS } from '@/lib/constants';
import type { UpiQuote } from '@/types';
import { motion } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING } from '@/lib/animations';

interface UpiAmountScreenProps {
  inrAmount: number;
  quote: UpiQuote | null;
  goldPricePerGram: number;
  priceLoading: boolean;
  isAmountValid: boolean;
  canProceedToPayment: boolean;
  minAmount: number;
  maxAmount: number;
  onAmountChange: (amount: number) => void;
  onContinue: () => void;
  onBack: () => void;
  onFetchPrice: () => Promise<number>;
}

export function UpiAmountScreen({
  inrAmount,
  quote,
  goldPricePerGram,
  priceLoading,
  isAmountValid,
  canProceedToPayment,
  minAmount,
  maxAmount,
  onAmountChange,
  onContinue,
  onBack,
  onFetchPrice,
}: UpiAmountScreenProps) {
  const hasFetchedPrice = useRef(false);

  useEffect(() => {
    if (!hasFetchedPrice.current) {
      hasFetchedPrice.current = true;
      onFetchPrice();
    }
  }, [onFetchPrice]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const num = raw ? parseInt(raw, 10) : 0;
      onAmountChange(num);
    },
    [onAmountChange]
  );

  const formatDisplayAmount = (amount: number) => {
    if (amount === 0) return '';
    return amount.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
            Buy with UPI
          </h1>
          <div className="px-3 py-1 bg-white dark:bg-[#242424] rounded-lg border border-border-subtle dark:border-[#2D2D2D]">
            <span className="text-xs font-bold text-text-primary dark:text-[#F0F0F0]">UPI</span>
          </div>
        </div>
      </FadeUp>

      {/* You Pay Section */}
      <FadeUp delay={0.06}>
        <div className="card-gold rounded-2xl p-5 mb-3">
          <p className="text-sm text-text-muted dark:text-[#6B7280] mb-2">You Pay</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              <span className="text-3xl font-bold text-text-primary dark:text-[#F0F0F0] shrink-0">
                &#8377;
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatDisplayAmount(inrAmount)}
                onChange={handleInputChange}
                placeholder="0"
                className="text-3xl font-bold bg-transparent text-text-primary dark:text-[#F0F0F0] outline-none w-full placeholder:text-text-muted dark:placeholder:text-[#3D3D3D]"
              />
            </div>
            <span className="text-sm font-medium text-text-muted dark:text-[#6B7280] bg-surface dark:bg-[#242424] px-3 py-1.5 rounded-lg shrink-0">
              INR
            </span>
          </div>
        </div>
      </FadeUp>

      {/* Arrow Divider */}
      <FadeUp delay={0.1}>
        <div className="flex justify-center -my-1 relative z-10">
          <div className="bg-surface-card dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-full p-2">
            <ArrowDown className="size-4 text-text-muted dark:text-[#6B7280]" />
          </div>
        </div>
      </FadeUp>

      {/* You Get Section */}
      <FadeUp delay={0.12}>
        <div className="card-gold rounded-2xl p-5 mt-3 mb-6">
          <p className="text-sm text-text-muted dark:text-[#6B7280] mb-2">You Get</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-text-primary dark:text-[#F0F0F0]">
              {quote ? quote.goldGrams.toFixed(3) : '0.000'}{' '}
              <span className="text-lg font-medium text-text-muted dark:text-[#6B7280]">g</span>
            </span>
            <span className="text-sm font-bold text-gold-500 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/50 px-3 py-1.5 rounded-lg">
              Gold
            </span>
          </div>
        </div>
      </FadeUp>

      {/* Quick Amount Pills */}
      <StaggerContainer staggerDelay={0.04} delayChildren={0.16} className="flex gap-2 mb-6">
        {INR_QUICK_AMOUNTS.map((amt) => (
          <StaggerItem key={amt} className="flex-1">
            <motion.button
              onClick={() => onAmountChange(amt)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                inrAmount === amt
                  ? 'bg-gold-500 dark:bg-gold-400 text-white'
                  : 'bg-surface-card dark:bg-[#1A1A1A] text-text-secondary dark:text-[#9CA3AF] border border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500 dark:hover:border-gold-400'
              }`}
              whileTap={{ scale: 0.95 }}
              transition={SPRING.snappy}
            >
              &#8377;{amt.toLocaleString('en-IN')}
            </motion.button>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Rate & Fee Breakdown */}
      {goldPricePerGram > 0 && (
        <FadeUp delay={0.24}>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted dark:text-[#6B7280]">Rate</span>
              <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                {priceLoading ? (
                  <span className="skeleton inline-block w-24 h-4 rounded" />
                ) : (
                  `${formatINR(goldPricePerGram)}/g`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted dark:text-[#6B7280]">Fee (0%)</span>
              <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                {quote ? formatINR(quote.fee) : '---'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted dark:text-[#6B7280]">TDS (1%)</span>
              <span className="text-text-primary dark:text-[#F0F0F0] font-medium">
                {quote ? formatINR(quote.tds) : '---'}
              </span>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Validation Message */}
      {inrAmount > 0 && !isAmountValid && (
        <motion.p
          className="text-sm text-error dark:text-error mb-4 text-center"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {inrAmount < minAmount
            ? `Minimum amount is ${formatINR(minAmount)}`
            : `Maximum amount is ${formatINR(maxAmount)}`}
        </motion.p>
      )}

      {/* Continue Button */}
      <FadeUp delay={0.28}>
        <motion.button
          onClick={onContinue}
          disabled={!canProceedToPayment}
          className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          whileTap={canProceedToPayment ? { scale: 0.98 } : undefined}
          transition={SPRING.snappy}
        >
          Continue to UPI
        </motion.button>
      </FadeUp>
    </div>
  );
}
