'use client';

import { formatINR } from '@/lib/utils';

interface UpiProcessingScreenProps {
  totalPayable: number;
  goldGrams: number;
  countdownSeconds: number;
}

export function UpiProcessingScreen({
  totalPayable,
  goldGrams,
  countdownSeconds,
}: UpiProcessingScreenProps) {
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto flex flex-col items-center justify-center">
      {/* Spinning Loader */}
      <div className="mb-8">
        <div className="w-24 h-24 relative">
          <svg className="animate-spin w-full h-full" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-border-subtle dark:text-[#2D2D2D]"
            />
            <path
              d="M48 8a40 40 0 0130 13.4"
              stroke="url(#gold-gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4A012" />
                <stop offset="100%" stopColor="#F5B832" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Processing Text */}
      <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
        Processing Payment
      </h2>
      <p className="text-text-muted dark:text-[#6B7280] text-center mb-10">
        Complete payment in your UPI app
      </p>

      {/* Amount Summary */}
      <div className="w-full card-gold rounded-2xl p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-text-muted dark:text-[#6B7280]">Amount</span>
          <span className="text-lg font-bold text-text-primary dark:text-[#F0F0F0]">
            {formatINR(totalPayable)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted dark:text-[#6B7280]">You&apos;ll receive</span>
          <span className="text-lg font-bold text-gold-500 dark:text-gold-400">
            {goldGrams.toFixed(3)} g gold
          </span>
        </div>
      </div>

      {/* Countdown Timer */}
      <p className="text-sm text-text-muted dark:text-[#6B7280]">
        Payment times out in{' '}
        <span className="font-mono font-semibold text-text-primary dark:text-[#F0F0F0]">
          {timeString}
        </span>
      </p>
    </div>
  );
}
