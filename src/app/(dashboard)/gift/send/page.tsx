'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { FadeUp } from '@/components/animations';
import { AmountSelector, OccasionPills, GiftPreviewCard } from '@/components/Gift';
import { GIFT_PRESET_AMOUNTS, calculateGramsFromInr } from '@/lib/giftData';
import { SPRING } from '@/lib/animations';
import type { GiftOccasion } from '@/types';

export default function SendGiftPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [gramsAmount, setGramsAmount] = useState(0.07);
  const [customAmount, setCustomAmount] = useState('');
  const [occasion, setOccasion] = useState<GiftOccasion>('Birthday');
  const [message, setMessage] = useState('');

  const handleAmountSelect = (inr: number, grams: number) => {
    setSelectedAmount(inr);
    setGramsAmount(grams);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      const inr = Number(value);
      setSelectedAmount(inr);
      setGramsAmount(calculateGramsFromInr(inr));
    }
  };

  const handleSendGift = () => {
    // In a real app, this would submit the gift
    // For now, we'll just navigate back to the gift page
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

      {/* Recipient Input */}
      <FadeUp delay={0.05}>
        <div className="mb-6">
          <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
            Recipient
          </label>
          <input
            type="text"
            placeholder="Name, phone or email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full py-4 px-4 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#6B7280] outline-none focus:border-gold-500/50 transition-colors"
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
            presets={GIFT_PRESET_AMOUNTS}
            selectedAmount={selectedAmount}
            onSelect={handleAmountSelect}
            customAmount={customAmount}
            onCustomAmountChange={handleCustomAmountChange}
          />
        </div>
      </FadeUp>

      {/* Occasion Selection */}
      <FadeUp delay={0.15}>
        <div className="mb-6">
          <label className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-3 block">
            Occasion
          </label>
          <OccasionPills selected={occasion} onSelect={setOccasion} />
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
            onChange={(e) => setMessage(e.target.value.slice(0, 100))}
            rows={3}
            className="w-full py-4 px-4 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#6B7280] outline-none focus:border-gold-500/50 transition-colors resize-none"
          />
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
          onClick={handleSendGift}
          className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 mb-6"
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
        >
          <Send className="size-5" />
          Send Gift · ₹{selectedAmount.toLocaleString('en-IN')}
        </motion.button>
      </FadeUp>

      {/* Disclaimer */}
      <FadeUp delay={0.35}>
        <p className="text-xs text-text-muted dark:text-[#6B7280] text-center leading-relaxed">
          Gold gifts are subject to market price fluctuations. Gift gold is not a fixed-return instrument. Platform charges and GST apply. Bullion is not a deposit-taking NBFC.
        </p>
      </FadeUp>
    </div>
  );
}
