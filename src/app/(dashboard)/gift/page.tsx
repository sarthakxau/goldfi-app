'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, Send, Loader2, Inbox } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { GiftListItem, GiftDetailModal } from '@/components/Gift';
import { authFetchJson } from '@/lib/apiClient';
import { SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { GiftTransaction } from '@/types';
import type { DbGift } from '@/lib/supabase';

type TabType = 'sent' | 'received';

function mapDbGiftToTransaction(gift: DbGift, type: 'sent' | 'received'): GiftTransaction {
  return {
    id: gift.id,
    type,
    recipientName: gift.recipient_name,
    recipientEmail: gift.recipient_email,
    gramsAmount: Number(gift.grams_amount),
    inrAmount: Number(gift.inr_amount),
    message: gift.message,
    occasion: gift.occasion as GiftTransaction['occasion'],
    status: gift.status,
    paymentMethod: gift.payment_method as GiftTransaction['paymentMethod'],
    claimToken: gift.claim_token,
    escrowTxHash: gift.escrow_tx_hash,
    claimTxHash: gift.claim_tx_hash,
    expiresAt: gift.expires_at ? new Date(gift.expires_at) : null,
    createdAt: new Date(gift.created_at),
    deliveredAt: gift.delivered_at ? new Date(gift.delivered_at) : null,
    claimedAt: gift.claimed_at ? new Date(gift.claimed_at) : null,
  };
}

export default function GiftPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sent');
  const [selectedGift, setSelectedGift] = useState<GiftTransaction | null>(null);
  const [sentGifts, setSentGifts] = useState<GiftTransaction[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const gifts = activeTab === 'sent' ? sentGifts : receivedGifts;

  const fetchGifts = useCallback(async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        authFetchJson<DbGift[]>('/api/gift/sent'),
        authFetchJson<DbGift[]>('/api/gift/received'),
      ]);

      if (sentRes.success && sentRes.data) {
        setSentGifts(sentRes.data.map(g => mapDbGiftToTransaction(g, 'sent')));
      }
      if (receivedRes.success && receivedRes.data) {
        setReceivedGifts(receivedRes.data.map(g => mapDbGiftToTransaction(g, 'received')));
      }
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const handleResend = async (giftId: string) => {
    setResendingId(giftId);
    try {
      const { success, error } = await authFetchJson(`/api/gift/${giftId}/resend`, {
        method: 'POST',
      });
      if (!success) {
        console.error('Resend failed:', error);
      }
      // Refresh list
      await fetchGifts();
    } catch (err) {
      console.error('Resend error:', err);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
              Gift Gold
            </h1>
          </div>
        </div>
      </FadeUp>

      {/* Hero Card */}
      <FadeUp delay={0.1}>
        <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-6 mb-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />

          <div className="relative z-10">
            <div className="size-12 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mb-4">
              <Sparkles className="size-6 text-gold-500 dark:text-gold-400" />
            </div>

            <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
              Send the gift of gold
            </h2>

            <p className="text-text-secondary dark:text-[#9CA3AF] text-sm mb-6 leading-relaxed">
              Timeless, meaningful, always appreciated. Perfect for birthdays, weddings & festivals.
            </p>

            <Link href="/gift/send">
              <motion.button
                className="w-full sm:w-auto bg-gold-100 dark:bg-gold-500/10 text-gold-500 font-semibold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 border border-gold-200 dark:border-gold-500/20 hover:bg-gold-200 dark:hover:bg-gold-500/20 transition-colors"
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                <Send className="size-4" />
                Send Gold
              </motion.button>
            </Link>
          </div>
        </div>
      </FadeUp>

      {/* Tab Toggle */}
      <FadeUp delay={0.2}>
        <div className="relative bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-full p-1 mb-6">
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-gold-100 dark:bg-gold-500/20"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{
              left: activeTab === 'sent' ? '4px' : 'calc(50%)',
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          />

          <div className="relative flex">
            <button
              onClick={() => setActiveTab('sent')}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded-full transition-colors z-10',
                activeTab === 'sent'
                  ? 'text-gold-500'
                  : 'text-text-secondary dark:text-[#9CA3AF]'
              )}
            >
              Sent
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded-full transition-colors z-10',
                activeTab === 'received'
                  ? 'text-gold-500'
                  : 'text-text-secondary dark:text-[#9CA3AF]'
              )}
            >
              Received
            </button>
          </div>
        </div>
      </FadeUp>

      {/* Gift List */}
      <FadeUp delay={0.3}>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted dark:text-[#6B7280] mb-4">
          {activeTab === 'sent' ? 'SENT GIFTS' : 'RECEIVED GIFTS'}
        </p>
      </FadeUp>

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="size-6 text-gold-500" />
          </motion.div>
        </div>
      ) : gifts.length === 0 ? (
        <FadeUp delay={0.35}>
          <div className="flex flex-col items-center py-12">
            <div className="size-14 rounded-2xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mb-4">
              <Inbox className="size-7 text-gold-500/50" />
            </div>
            <p className="text-sm text-text-muted dark:text-[#6B7280]">
              {activeTab === 'sent' ? 'No gifts sent yet' : 'No gifts received yet'}
            </p>
          </div>
        </FadeUp>
      ) : (
        <StaggerContainer staggerDelay={0.08} delayChildren={0.35}>
          <div className="space-y-4 mb-8">
            {gifts.map((gift) => (
              <StaggerItem key={gift.id}>
                <GiftListItem
                  gift={gift}
                  onClick={() => setSelectedGift(gift)}
                  onResend={
                    activeTab === 'sent' && gift.status === 'delivered'
                      ? () => handleResend(gift.id)
                      : undefined
                  }
                  resending={resendingId === gift.id}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}

      {/* Disclaimer */}
      <FadeUp delay={0.5}>
        <p className="text-xs text-text-muted dark:text-[#6B7280] text-center leading-relaxed">
          Gold gifts are subject to market price fluctuations. Gift gold is not a fixed-return instrument. Platform charges and GST apply.
        </p>
      </FadeUp>

      {/* Gift Detail Modal */}
      <GiftDetailModal
        gift={selectedGift}
        isOpen={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
      />
    </div>
  );
}
