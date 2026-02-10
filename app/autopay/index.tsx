import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Plus, ChevronRight, Calendar, TrendingUp, Coins } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { formatINR } from '@/lib/utils';
import { DURATION, staggerDelay, STAGGER } from '@/lib/animations';
import type { AutoPay, AutoPayStats } from '@/types';

// ── Mock data ─────────────────────────────────────────────

const MOCK_STATS: AutoPayStats = {
  monthlySavings: 5000,
  totalSaved: 32500,
  totalGoldAccumulated: 4.23,
  activePlansCount: 2,
  nextExecution: '2026-02-15',
};

const MOCK_AUTOPAYS: AutoPay[] = [
  {
    id: 'ap-1',
    name: 'Monthly Savings',
    amount: 3000,
    frequency: 'monthly',
    status: 'active',
    startDate: '2025-09-01',
    nextExecution: '2026-02-15',
    totalInvested: 21000,
    goldAccumulated: 2.78,
    avgPricePerGram: 7554,
  },
  {
    id: 'ap-2',
    name: 'Weekly DCA',
    amount: 500,
    frequency: 'weekly',
    status: 'active',
    startDate: '2025-11-01',
    nextExecution: '2026-02-12',
    totalInvested: 7000,
    goldAccumulated: 0.91,
    avgPricePerGram: 7692,
  },
  {
    id: 'ap-3',
    name: 'Festival Fund',
    amount: 2000,
    frequency: 'biweekly',
    status: 'paused',
    startDate: '2025-10-01',
    nextExecution: '2026-02-20',
    totalInvested: 4500,
    goldAccumulated: 0.54,
    avgPricePerGram: 8333,
  },
];

// ── Frequency labels ──────────────────────────────────────

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};

// ── Components ────────────────────────────────────────────

function StatsCard({
  stats,
  isDark,
  colors,
}: {
  stats: AutoPayStats;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const GOLD_500 = '#B8860B';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(184,134,11,0.2)'
          : 'rgba(184,134,11,0.12)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
      }}
    >
      {/* Total Saved */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.textMuted,
        }}
      >
        TOTAL SAVED
      </Text>
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: colors.textPrimary,
          fontVariant: ['tabular-nums'],
          marginTop: 4,
          marginBottom: 16,
        }}
      >
        {formatINR(stats.totalSaved)}
      </Text>

      {/* Stats row */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '500',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 4,
            }}
          >
            GOLD
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: GOLD_500,
              fontVariant: ['tabular-nums'],
            }}
          >
            {stats.totalGoldAccumulated.toFixed(2)}g
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
          }}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '500',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 4,
            }}
          >
            MONTHLY
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatINR(stats.monthlySavings)}
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
          }}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '500',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 4,
            }}
          >
            PLANS
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            {stats.activePlansCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AutoPayCard({
  autoPay,
  index,
  isDark,
  colors,
}: {
  autoPay: AutoPay;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const GOLD_500 = '#B8860B';
  const isActive = autoPay.status === 'active';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing' as const,
        duration: DURATION.normal,
        delay: staggerDelay(index, STAGGER.normal, 200),
      }}
    >
      <Pressable
        onPress={() => router.push(`/autopay/${autoPay.id}`)}
        style={{
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FFF0C2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} color={GOLD_500} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 15,
                    color: colors.textPrimary,
                  }}
                  numberOfLines={1}
                >
                  {autoPay.name}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    backgroundColor: isActive
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(245,158,11,0.1)',
                    borderWidth: 1,
                    borderColor: isActive
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(245,158,11,0.2)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: isActive ? '#10B981' : '#F59E0B',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {autoPay.status}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                {formatINR(autoPay.amount)} / {FREQUENCY_LABELS[autoPay.frequency]}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: GOLD_500,
                fontVariant: ['tabular-nums'],
              }}
            >
              {autoPay.goldAccumulated.toFixed(2)}g
            </Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────

export default function AutoPayScreen() {
  const { isDark, colors } = useTheme();
  const GOLD_500 = '#B8860B';

  const activePlans = MOCK_AUTOPAYS.filter((a) => a.status === 'active');
  const pausedPlans = MOCK_AUTOPAYS.filter((a) => a.status === 'paused');
  const allPlans = [...activePlans, ...pausedPlans];

  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.textPrimary,
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            AutoPay
          </Text>
        </MotiView>

        {/* Stats Card */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 100,
          }}
        >
          <StatsCard stats={MOCK_STATS} isDark={isDark} colors={colors} />
        </MotiView>

        {/* New AutoPay Button */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 120,
          }}
        >
          <Pressable
            onPress={() => router.push('/autopay/new')}
            style={{
              backgroundColor: GOLD_500,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            <Plus size={20} color="#1A1A1A" />
            <Text
              style={{
                color: '#1A1A1A',
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              Start New AutoPay
            </Text>
          </Pressable>
        </MotiView>

        {/* Section Label */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 160,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.textMuted,
              }}
            >
              Active AutoPays
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {allPlans.length} {allPlans.length === 1 ? 'plan' : 'plans'}
            </Text>
          </View>
        </MotiView>

        {/* AutoPay Cards */}
        {allPlans.map((autoPay, i) => (
          <AutoPayCard
            key={autoPay.id}
            autoPay={autoPay}
            index={i}
            isDark={isDark}
            colors={colors}
          />
        ))}

        {/* Disclaimer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 400,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 18,
            }}
          >
            AutoPay investments are subject to market risk. Returns are not guaranteed.
            Gold.fi is regulated by applicable Indian financial authorities.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
