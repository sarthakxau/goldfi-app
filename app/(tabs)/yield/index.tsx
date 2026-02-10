import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { TrendingUp, Landmark, Droplets, Layers } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, FADE_UP, staggerDelay, STAGGER } from '@/lib/animations';
import type { YieldPosition, YieldStrategy } from '@/types';

// ── Inline mock data ──────────────────────────────────────

const MOCK_STRATEGIES: YieldStrategy[] = [
  {
    id: 'aave-xaut-collateral',
    protocol: 'Aave V3',
    chain: 'Ethereum',
    name: 'XAUT Collateral Yield',
    apy: 3.1,
    tvl: '$18.7M',
    description:
      'Deposit XAUT as collateral on Aave V3. Borrow USDC at variable rates and deploy into yield vaults for the spread.',
    risk: 'Low',
    tokens: [
      { symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' },
      { symbol: 'USDC', name: 'USD Coin', iconType: 'dollar' },
    ],
    iconType: 'landmark',
    minDeposit: '0.1 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: '75% LTV — liquidation if XAUT price drops 25%+ relative to borrow',
    steps: [],
    externalUrl: 'https://app.aave.com',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
  {
    id: 'fluid-gold-lending',
    protocol: 'Fluid',
    chain: 'Ethereum',
    name: 'Fluid Gold Lending',
    apy: 5.4,
    tvl: '$8.3M',
    description:
      "Supply XAUT to Fluid's isolated gold lending market. Earn interest + FLUID token incentives.",
    risk: 'Medium',
    tokens: [{ symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' }],
    iconType: 'droplets',
    minDeposit: '0.05 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: 'Isolated market — risk limited to supplied XAUT.',
    steps: [],
    externalUrl: 'https://fluid.instadapp.io',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
];

const MOCK_POSITIONS: YieldPosition[] = [
  {
    strategyId: 'aave-xaut-collateral',
    deposited: 0.5,
    depositToken: 'XAUT',
    earned: 98.4,
    apy: 3.1,
    days: 45,
    status: 'Active',
  },
  {
    strategyId: 'fluid-gold-lending',
    deposited: 0.3,
    depositToken: 'XAUT',
    earned: 67.3,
    apy: 5.4,
    days: 22,
    status: 'Active',
  },
];

const TOTAL_EARNINGS = MOCK_POSITIONS.reduce((sum, p) => sum + p.earned, 0);

// ── Icon mapping ──────────────────────────────────────────

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

function getStrategyForPosition(position: YieldPosition) {
  return MOCK_STRATEGIES.find((s) => s.id === position.strategyId);
}

// ── Components ────────────────────────────────────────────

function EarningsBreakdown({ isDark, colors }: { isDark: boolean; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
      {MOCK_POSITIONS.map((position) => {
        const strategy = getStrategyForPosition(position);
        if (!strategy) return null;
        const label =
          strategy.id === 'aave-xaut-collateral'
            ? 'XAUT COLLATERAL'
            : 'FLUID VAULT';
        return (
          <View key={position.strategyId}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: colors.textMuted,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#10B981',
                marginTop: 2,
              }}
            >
              +${position.earned.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PositionCard({
  position,
  index,
  isDark,
  colors,
}: {
  position: YieldPosition;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const strategy = getStrategyForPosition(position);
  if (!strategy) return null;

  const Icon = ICON_MAP[strategy.iconType];
  const GOLD_500 = '#B8860B';
  const GOLD_400 = '#D4A012';

  const stats = [
    { label: 'DEPOSITED', value: `${position.deposited} ${position.depositToken}` },
    { label: 'EARNED', value: `$${position.earned.toFixed(2)}`, isGreen: true },
    { label: 'APY', value: `${position.apy}%`, isGold: true },
    { label: 'DAYS', value: `${position.days}` },
  ];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing' as const,
        duration: DURATION.normal,
        delay: staggerDelay(index, STAGGER.slow, 250),
      }}
    >
      <Pressable
        style={{
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
        }}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
              <Icon size={20} color={isDark ? GOLD_400 : GOLD_500} />
            </View>
            <View>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 15,
                  color: colors.textPrimary,
                }}
              >
                {strategy.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                {strategy.protocol} · {strategy.chain}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: 'rgba(16,185,129,0.1)',
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#10B981',
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#10B981' }}>
              {position.status}
            </Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row' }}>
          {stats.map((stat) => (
            <View key={stat.label} style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '500',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.textMuted,
                }}
              >
                {stat.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: 2,
                  color: stat.isGreen
                    ? '#10B981'
                    : stat.isGold
                      ? isDark
                        ? GOLD_400
                        : GOLD_500
                      : colors.textPrimary,
                }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────

export default function EarnScreen() {
  const { isDark, colors } = useTheme();
  const GOLD_500 = '#B8860B';

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
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            Earn
          </Text>
        </MotiView>

        {/* Total Earnings Card */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 100,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
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
              TOTAL EARNINGS
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>$</Text>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {TOTAL_EARNINGS.toFixed(2)}
              </Text>
            </View>
            <EarningsBreakdown isDark={isDark} colors={colors} />
          </View>
        </MotiView>

        {/* Active Positions Label */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 200,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 16,
            }}
          >
            ACTIVE POSITIONS
          </Text>
        </MotiView>

        {/* Position Cards */}
        {MOCK_POSITIONS.map((position, i) => (
          <PositionCard
            key={position.strategyId}
            position={position}
            index={i}
            isDark={isDark}
            colors={colors}
          />
        ))}

        {/* Explore Strategies Button */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 400,
          }}
        >
          <Pressable
            onPress={() => router.push('/(tabs)/yield/strategies')}
            style={{
              backgroundColor: GOLD_500,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
              Explore Strategies
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
