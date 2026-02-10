import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Landmark,
  Droplets,
  Layers,
  ExternalLink,
  Info,
  Wallet,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, SPRING, staggerDelay, STAGGER } from '@/lib/animations';
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
    steps: [
      'Deposit XAUT as collateral on Aave V3 (1 XAUT = 1 troy oz gold)',
      'Borrow USDC at variable rate (~2.8% APR)',
      'Deploy borrowed USDC to Aave stablecoin supply for ~4.5% APY',
      'Net yield = stablecoin APY - borrow cost + AAVE token incentives',
    ],
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
      "Supply XAUT to Fluid's isolated gold lending market. Lenders earn interest + FLUID token incentives.",
    risk: 'Medium',
    tokens: [{ symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' }],
    iconType: 'droplets',
    minDeposit: '0.05 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: 'Isolated market — risk limited to supplied XAUT. Borrower liquidations protect lenders.',
    steps: [
      'Supply XAUT to the Fluid isolated lending pool',
      'Borrowers deposit ETH/USDC as collateral and borrow your XAUT',
      'Earn variable interest from borrowers + FLUID token rewards',
    ],
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
      'Provide concentrated liquidity to the XAUT/USDT pool on Camelot V3. Earn trading fees plus GRAIL token incentives.',
    risk: 'High',
    tokens: [
      { symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' },
      { symbol: 'USDT', name: 'Tether USD', iconType: 'dollar' },
    ],
    iconType: 'layers',
    minDeposit: '0.1 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk: 'Impermanent loss risk — if XAUT price moves significantly vs USDT.',
    steps: [
      'Deposit XAUT + USDT in a concentrated price range on Camelot V3',
      'Earn swap fees from every trade that crosses your range',
      'Collect GRAIL token incentives as bonus yield',
    ],
    externalUrl: 'https://app.camelot.exchange',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
];

function getStrategyById(id: string): YieldStrategy | undefined {
  return MOCK_STRATEGIES.find((s) => s.id === id);
}

// ── Icon mapping ──────────────────────────────────────────

const ICON_MAP = {
  landmark: Landmark,
  droplets: Droplets,
  layers: Layers,
} as const;

const RISK_TEXT_COLORS: Record<RiskLevel, string> = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

// ── Main Screen ───────────────────────────────────────────

export default function StrategyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useTheme();
  const [amount, setAmount] = useState('');

  const strategy = getStrategyById(id ?? '');

  if (!strategy) {
    return (
      <SafeAreaView
        className="flex-1 bg-surface dark:bg-surface-dark"
        edges={['top']}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Strategy not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const Icon = ICON_MAP[strategy.iconType];
  const GOLD_500 = '#B8860B';
  const GOLD_400 = '#D4A012';

  const stats = [
    { label: 'Total Value Locked', value: strategy.tvl },
    {
      label: 'Risk Level',
      value: strategy.risk,
      valueColor: RISK_TEXT_COLORS[strategy.risk],
    },
    { label: 'Min Deposit', value: strategy.minDeposit },
    { label: 'Lock Period', value: strategy.lockPeriod },
    { label: 'Liquidation Risk', value: strategy.liquidationRisk },
  ];

  function handleDeposit() {
    Alert.alert('Coming Soon', 'Deposits are not yet enabled.');
  }

  function handleOpenProtocol() {
    if (strategy) Linking.openURL(strategy.externalUrl);
  }

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
                flex: 1,
              }}
              numberOfLines={1}
            >
              {strategy.name}
            </Text>
          </View>
        </MotiView>

        {/* Hero Card -- APY */}
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
              padding: 32,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <MotiView
              from={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring' as const,
                ...SPRING.bouncy,
                delay: 200,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FFF0C2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon size={32} color={isDark ? GOLD_400 : GOLD_500} />
              </View>
            </MotiView>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
              {strategy.protocol} · {strategy.chain}
            </Text>
            <Text
              style={{
                fontSize: 48,
                fontWeight: '700',
                color: isDark ? GOLD_400 : GOLD_500,
                marginBottom: 4,
              }}
            >
              {strategy.apy}%
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              Annual Percentage Yield
            </Text>
          </View>
        </MotiView>

        {/* Stats Table */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 150,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
            }}
          >
            {stats.map((stat, i) => (
              <View
                key={stat.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  borderBottomWidth: i < stats.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    flexShrink: 0,
                  }}
                >
                  {stat.label}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    textAlign: 'right',
                    marginLeft: 16,
                    flex: 1,
                    color: stat.valueColor || colors.textPrimary,
                  }}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* How It Works */}
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
            HOW IT WORKS
          </Text>
        </MotiView>

        {strategy.steps.map((step, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(i, STAGGER.normal, 250),
            }}
          >
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: isDark ? GOLD_400 : GOLD_500,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: isDark ? '#D1D5DB' : colors.textSecondary,
                  paddingTop: 4,
                  flex: 1,
                }}
              >
                {step}
              </Text>
            </View>
          </MotiView>
        ))}

        {/* Required Tokens */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 300,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            REQUIRED TOKENS
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            {strategy.tokens.map((token) => (
              <View
                key={token.symbol}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      token.iconType === 'gold'
                        ? isDark
                          ? 'rgba(184,134,11,0.15)'
                          : '#FFF0C2'
                        : 'rgba(16,185,129,0.1)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color:
                        token.iconType === 'gold'
                          ? isDark
                            ? GOLD_400
                            : GOLD_500
                          : '#10B981',
                    }}
                  >
                    {token.iconType === 'gold' ? 'Au' : '$'}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {token.symbol}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {token.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Enter Amount */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 350,
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
            ENTER AMOUNT
          </Text>

          {/* Input */}
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textMuted,
              }}
            >
              XAUT
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={isDark ? '#4B5563' : colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary,
              }}
            />
          </View>

          {/* Quick amounts */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
            {strategy.quickAmounts.map((qa) => (
              <Pressable
                key={qa}
                onPress={() => setAmount(qa)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  backgroundColor:
                    amount === qa
                      ? 'rgba(184,134,11,0.1)'
                      : isDark
                        ? '#1A1A1A'
                        : '#FFFFFF',
                  borderColor:
                    amount === qa
                      ? 'rgba(184,134,11,0.3)'
                      : isDark
                        ? '#2D2D2D'
                        : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color:
                      amount === qa
                        ? isDark
                          ? GOLD_400
                          : GOLD_500
                        : isDark
                          ? '#D1D5DB'
                          : colors.textPrimary,
                  }}
                >
                  {qa} XAUT
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Deposit Button */}
          <Pressable
            onPress={handleDeposit}
            style={{
              backgroundColor: GOLD_500,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Wallet size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
              Deposit
            </Text>
          </Pressable>

          {/* View on Protocol */}
          <Pressable
            onPress={handleOpenProtocol}
            style={{
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <ExternalLink size={20} color={colors.textSecondary} />
            <Text
              style={{
                color: colors.textSecondary,
                fontWeight: '500',
                fontSize: 16,
              }}
            >
              View on {strategy.protocol}
            </Text>
          </Pressable>
        </MotiView>

        {/* Disclaimer */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 400,
          }}
        >
          <View
            style={{
              marginTop: 24,
              marginBottom: 16,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <Info size={16} color={colors.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
            <Text
              style={{
                fontSize: 12,
                lineHeight: 18,
                color: colors.textMuted,
                flex: 1,
              }}
            >
              DeFi strategies involve smart contract risk, liquidation risk, and
              impermanent loss. Past APYs do not guarantee future returns. Gold.fi
              acts as an interface and does not custody your funds.
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
