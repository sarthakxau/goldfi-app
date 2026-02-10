import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Sparkles, Send, Inbox, ArrowLeft, ChevronRight, RotateCw } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams, formatDate } from '@/lib/utils';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';
import type { GiftTransaction, GiftOccasion } from '@/types';
import type { DbGift } from '@/lib/supabase';

type TabType = 'sent' | 'received';

const GOLD_500 = '#B8860B';
const GOLD_100 = '#FFF0C2';

function mapDbGiftToTransaction(gift: DbGift, type: 'sent' | 'received'): GiftTransaction {
  return {
    id: gift.id,
    type,
    recipientName: gift.recipient_name,
    recipientEmail: gift.recipient_email,
    gramsAmount: Number(gift.grams_amount),
    inrAmount: Number(gift.inr_amount),
    message: gift.message,
    occasion: gift.occasion as GiftOccasion,
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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  delivered: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  claimed: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  expired: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
};

export default function GiftScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('sent');
  const [sentGifts, setSentGifts] = useState<GiftTransaction[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const gifts = activeTab === 'sent' ? sentGifts : receivedGifts;

  const fetchGifts = useCallback(async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        authFetchJson<DbGift[]>('/api/gift/sent'),
        authFetchJson<DbGift[]>('/api/gift/received'),
      ]);

      if (sentRes.success && sentRes.data) {
        setSentGifts(sentRes.data.map((g) => mapDbGiftToTransaction(g, 'sent')));
      }
      if (receivedRes.success && receivedRes.data) {
        setReceivedGifts(receivedRes.data.map((g) => mapDbGiftToTransaction(g, 'received')));
      }
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchGifts().finally(() => setLoading(false));
  }, [fetchGifts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGifts();
    setRefreshing(false);
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
      await fetchGifts();
    } catch (err) {
      console.error('Resend error:', err);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GOLD_500}
          />
        }
      >
        {/* Header */}
        <MotiView {...FADE_UP}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </Pressable>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              Gift Gold
            </Text>
          </View>
        </MotiView>

        {/* Hero Card */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 80 }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              overflow: 'hidden',
            }}
          >
            {/* Gold gradient bar */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: GOLD_500,
              }}
            />

            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Sparkles size={24} color={GOLD_500} />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 8,
              }}
            >
              Send the gift of gold
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              Timeless, meaningful, always appreciated. Perfect for birthdays,
              weddings & festivals.
            </Text>

            <Pressable
              onPress={() => router.push('/gift/send')}
              style={{
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(184,134,11,0.2)' : 'rgba(184,134,11,0.3)',
                borderRadius: 24,
                paddingVertical: 14,
                paddingHorizontal: 28,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                alignSelf: 'flex-start',
              }}
            >
              <Send size={16} color={GOLD_500} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: GOLD_500 }}>
                Send Gold
              </Text>
            </Pressable>
          </View>
        </MotiView>

        {/* Tab Toggle */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 140 }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(['sent', 'received'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 20,
                  alignItems: 'center',
                  backgroundColor:
                    activeTab === tab
                      ? isDark
                        ? 'rgba(184,134,11,0.2)'
                        : GOLD_100
                      : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: activeTab === tab ? GOLD_500 : colors.textSecondary,
                  }}
                >
                  {tab === 'sent' ? 'Sent' : 'Received'}
                </Text>
              </Pressable>
            ))}
          </View>
        </MotiView>

        {/* Section Label */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 180 }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 12,
            }}
          >
            {activeTab === 'sent' ? 'SENT GIFTS' : 'RECEIVED GIFTS'}
          </Text>
        </MotiView>

        {/* Gift List */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={GOLD_500} />
          </View>
        ) : gifts.length === 0 ? (
          <MotiView
            {...FADE_UP}
            transition={{ type: 'timing', duration: DURATION.normal, delay: 220 }}
          >
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Inbox size={28} color={`${GOLD_500}80`} />
              </View>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>
                {activeTab === 'sent' ? 'No gifts sent yet' : 'No gifts received yet'}
              </Text>
            </View>
          </MotiView>
        ) : (
          <View style={{ gap: 12, marginBottom: 24 }}>
            {gifts.map((gift, index) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                index={index}
                isDark={isDark}
                colors={colors}
                showResend={activeTab === 'sent' && gift.status === 'delivered'}
                resending={resendingId === gift.id}
                onResend={() => handleResend(gift.id)}
              />
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 300 }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              textAlign: 'center',
              lineHeight: 16,
              marginTop: 8,
            }}
          >
            Gold gifts are subject to market price fluctuations. Gift gold is not
            a fixed-return instrument. Platform charges and GST apply.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Gift Card Component ──────────────────────────────────

function GiftCard({
  gift,
  index,
  isDark,
  colors,
  showResend,
  resending,
  onResend,
}: {
  gift: GiftTransaction;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  showResend: boolean;
  resending: boolean;
  onResend: () => void;
}) {
  const statusStyle = STATUS_COLORS[gift.status] || STATUS_COLORS.pending;

  const occasionEmojis: Record<string, string> = {
    Birthday: '🎂',
    Wedding: '💍',
    Festival: '🪔',
    'Thank You': '🙏',
    'Just Because': '💛',
    Anniversary: '🥂',
    Custom: '🎁',
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: DURATION.normal,
        delay: staggerDelay(index, 60, 200),
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        }}
      >
        {/* Top Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            {/* Occasion Emoji */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {occasionEmojis[gift.occasion] || '🎁'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
                numberOfLines={1}
              >
                {gift.type === 'sent'
                  ? gift.recipientEmail || gift.recipientName || 'Unknown'
                  : gift.occasion}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {formatDate(gift.createdAt)}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.textPrimary,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatINR(gift.inrAmount)}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontVariant: ['tabular-nums'],
                marginTop: 2,
              }}
            >
              {formatGrams(gift.gramsAmount)}
            </Text>
          </View>
        </View>

        {/* Bottom Row: Status + Resend */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <View
            style={{
              backgroundColor: statusStyle.bg,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: statusStyle.text,
                textTransform: 'capitalize',
              }}
            >
              {gift.status}
            </Text>
          </View>

          {showResend && (
            <Pressable
              onPress={onResend}
              disabled={resending}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                opacity: resending ? 0.5 : 1,
              }}
            >
              <RotateCw size={12} color={GOLD_500} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: GOLD_500 }}>
                {resending ? 'Resending...' : 'Resend'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </MotiView>
  );
}
