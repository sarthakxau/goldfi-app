import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Landmark,
  Droplets,
  Layers,
  BarChart3,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, staggerDelay, STAGGER } from '@/lib/animations';
import type { RiskLevel, YieldStrategy } from '@/types';

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
      'Deposit XAUT (Tether Gold) as collateral on Aave V3. Borrow USDC at variable rates and deploy into yield vaults for the spread.',
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
      "Supply XAUT to Fluid's isolated gold lending market. Borrowers post ETH/stablecoins as collateral. Lenders earn interest + FLUID token incentives.",
    risk: 'Medium',
    tokens: [{ symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' }],
    iconType: 'droplets',
    minDeposit: '0.05 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: 'Isolated market — risk limited to supplied XAUT. Borrower liquidations protect lenders.',
    steps: [],
    externalUrl: 'https://fluid.instadapp.io',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
  {
    id: 'camelot-xaut-usdt',
    protocol: 'Camelot DEX',
    chain: 'Arbitrum',
    name: 'XAUT/USDT Liquidity',
    apy: 8.7,
    tvl: '$4.6M',
    description:
      'Provide concentrated liquidity to the XAUT/USDT pool on Camelot V3. Earn trading fees from every swap plus GRAIL token incentives.',
    risk: 'High',
    tokens: [
      { symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' },
      { symbol: 'USDT', name: 'Tether USD', iconType: 'dollar' },
    ],
    iconType: 'layers',
    minDeposit: '0.1 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: 'Impermanent loss risk — if XAUT price moves significantly vs USDT.',
    steps: [],
    externalUrl: 'https://app.camelot.exchange',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
];

// ── Icon mapping ──────────────────────────────────────────

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string }> = {
  Low: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  Medium: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  High: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
};

// ── Strategy Card ─────────────────────────────────────────

function StrategyCard({
  strategy,
  index,
  isDark,
  colors,
}: {
  strategy: YieldStrategy;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const Icon = ICON_MAP[strategy.iconType];
  const GOLD_500 = '#B8860B';
  const GOLD_400 = '#D4A012';
  const riskColor = RISK_COLORS[strategy.risk];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing' as const,
        duration: DURATION.normal,
        delay: staggerDelay(index, STAGGER.slow, 150),
      }}
    >
      <Pressable
        onPress={() => router.push(`/(tabs)/yield/strategies/${strategy.id}`)}
        style={{
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
          borderRadius: 16,
          padding: 24,
          marginBottom: 12,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FFF0C2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={24} color={isDark ? GOLD_400 : GOLD_500} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted }}>
                  {strategy.protocol}
                </Text>
                <Text style={{ color: isDark ? '#4B5563' : colors.textMuted }}>·</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>
                  {strategy.chain}
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  color: colors.textPrimary,
                  marginTop: 2,
                }}
              >
                {strategy.name}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={isDark ? '#4B5563' : colors.textMuted} style={{ marginTop: 4 }} />
        </View>

        {/* APY + TVL */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: isDark ? GOLD_400 : GOLD_500,
            }}
          >
            {strategy.apy}% APY
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: isDark ? '#2D2D2D' : '#F0F0F0',
            }}
          >
            <BarChart3 size={12} color={colors.textMuted} />
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              TVL {strategy.tvl}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.textSecondary,
            marginBottom: 16,
          }}
        >
          {strategy.description}
        </Text>

        {/* Risk badge + Token pills */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: riskColor.bg,
            }}
          >
            <Shield size={12} color={riskColor.text} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: riskColor.text }}>
              {strategy.risk}
            </Text>
          </View>
          {strategy.tokens.map((token) => (
            <View
              key={token.symbol}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isDark ? '#2D2D2D' : '#F0F0F0',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isDark ? '#D1D5DB' : colors.textPrimary,
                }}
              >
                {token.symbol}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────

export default function StrategiesScreen() {
  const { isDark, colors } = useTheme();

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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
              marginBottom: 32,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <ArrowLeft size={24} color={colors.textMuted} />
            </Pressable>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              DeFi Strategies
            </Text>
          </View>
        </MotiView>

        {/* Strategy Cards */}
        {MOCK_STRATEGIES.map((strategy, i) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            index={i}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
