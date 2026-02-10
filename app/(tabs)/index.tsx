import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Gift,
  RefreshCw,
  Sprout,
} from 'lucide-react-native';
import Decimal from 'decimal.js';

import { useAppStore } from '@/store';
import { useAuth } from '@/lib/auth-provider';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams } from '@/lib/utils';
import { DURATION } from '@/lib/animations';
import { useTheme } from '@/lib/theme';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import type { Transaction, GoldPrice, HoldingWithValue } from '@/types';

type ViewMode = 'inr' | 'usd' | 'grams' | 'scudo';

const GOLD_500 = '#B8860B';

export default function HomeScreen() {
  const { walletAddress, email } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    goldPrice,
    holding,
    priceLoading,
    setGoldPrice,
    setHolding,
    setPriceLoading,
    setHoldingLoading,
    setPriceError,
    setHoldingError,
    transactions,
    transactionsLoading,
    setTransactions,
    setTransactionsLoading,
    setTransactionsError,
    refreshing,
    setRefreshing,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('inr');

  // ── Data Fetching ─────────────────────────────────────

  const fetchPrice = useCallback(async () => {
    try {
      setPriceLoading(true);
      const data = await authFetchJson<GoldPrice>('/api/prices');
      if (data.success && data.data) {
        setGoldPrice(data.data);
      } else {
        setPriceError(data.error || 'Failed to fetch price');
      }
    } catch {
      setPriceError('Failed to fetch price');
    } finally {
      setPriceLoading(false);
    }
  }, [setGoldPrice, setPriceLoading, setPriceError]);

  const fetchHoldings = useCallback(async () => {
    try {
      setHoldingLoading(true);
      const url = walletAddress
        ? `/api/holdings?walletAddress=${encodeURIComponent(walletAddress)}`
        : '/api/holdings';
      const data = await authFetchJson<HoldingWithValue>(url);
      if (data.success) {
        setHolding(data.data ?? null);
      } else {
        setHoldingError(data.error || 'Failed to fetch holdings');
      }
    } catch {
      setHoldingError('Failed to fetch holdings');
    } finally {
      setHoldingLoading(false);
    }
  }, [walletAddress, setHolding, setHoldingLoading, setHoldingError]);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const data = await authFetchJson<Transaction[]>('/api/transactions/history');
      if (data.success && data.data) {
        setTransactions(data.data);
      } else {
        setTransactionsError(data.error || 'Failed to fetch transactions');
      }
    } catch {
      setTransactionsError('Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [setTransactions, setTransactionsLoading, setTransactionsError]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPrice(), fetchHoldings(), fetchTransactions()]);
    setRefreshing(false);
  }, [fetchPrice, fetchHoldings, fetchTransactions, setRefreshing]);

  useEffect(() => {
    fetchPrice();
    fetchHoldings();
    fetchTransactions();

    const priceInterval = setInterval(fetchPrice, 60000);
    return () => clearInterval(priceInterval);
  }, [fetchPrice, fetchHoldings, fetchTransactions]);

  // ── Derived State ─────────────────────────────────────

  const xautAmount = holding ? new Decimal(holding.xautAmount) : new Decimal(0);
  const xautAmountGrams =
    holding?.xautAmountGrams ?? xautAmount.times(GRAMS_PER_OUNCE).toNumber();
  const buyingPricePerGram = goldPrice ? goldPrice.pricePerGramInr : 0;
  const buyingPricePer10g = buyingPricePerGram * 10;
  const currentValueInr =
    holding?.currentValueInr ??
    xautAmount.times(goldPrice?.priceInr || 0).toNumber();
  const totalInvested = holding
    ? new Decimal(holding.totalInvestedInr)
    : new Decimal(0);
  const profitLossInr =
    holding?.profitLossInr ?? currentValueInr - totalInvested.toNumber();
  const profitLossGrams =
    buyingPricePerGram > 0 ? profitLossInr / buyingPricePerGram : 0;
  const hasHoldings = xautAmount.greaterThan(0);

  const getDisplayValue = () => {
    if (!hasHoldings) {
      if (viewMode === 'grams') return '0.00 g';
      if (viewMode === 'inr') return '₹0.00';
      if (viewMode === 'usd') return '$0.00';
      return '0.00 scudo';
    }
    switch (viewMode) {
      case 'grams':
        return formatGrams(xautAmountGrams);
      case 'inr':
        return formatINR(currentValueInr);
      case 'usd': {
        const usdValue = xautAmount
          .times(goldPrice?.priceUsd || 0)
          .toNumber();
        return `$${usdValue.toFixed(2)}`;
      }
      case 'scudo':
        return `${xautAmount.times(1000).toFixed(2)} scudo`;
    }
  };

  const goldHoldingUnits: { key: ViewMode; label: string }[] = [
    { key: 'inr', label: '₹' },
    { key: 'usd', label: '$' },
    { key: 'grams', label: 'grams' },
    { key: 'scudo', label: 'scudo' },
  ];

  const recentTransactions = transactions.slice(0, 2);
  const userInitial = email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GOLD_500}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header / Price Strip ──────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <View className="flex-row items-center justify-between py-4 mb-4">
            {/* Live Price - Left */}
            <Pressable onPress={() => router.push('/gold-charts')}>
              <Text className="text-[10px] tracking-widest text-text-muted dark:text-text-dark-muted font-medium uppercase">
                Live Price
              </Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                {priceLoading ? (
                  <View className="h-6 w-28 bg-surface-elevated dark:bg-surface-dark-elevated rounded" />
                ) : (
                  <View className="flex-row items-baseline">
                    <Text
                      className="text-xl font-bold text-gold-500"
                      style={{ fontVariant: ['tabular-nums'] }}
                    >
                      {formatINR(buyingPricePer10g)}
                    </Text>
                    <Text className="text-sm text-text-muted dark:text-text-dark-muted font-normal">
                      /10g
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={handleRefresh}
                  disabled={refreshing}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <RefreshCw size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            </Pressable>

            {/* User Avatar - Right */}
            <Pressable onPress={() => router.push('/(tabs)/account')}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: GOLD_500,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-base">
                  {userInitial}
                </Text>
              </View>
            </Pressable>
          </View>
        </MotiView>

        {/* ── Holdings Card ─────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 80,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              padding: 24,
              marginBottom: 8,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(184,134,11,0.2)'
                : 'rgba(184,134,11,0.12)',
            }}
          >
            {/* Value Display */}
            <Text
              className="text-4xl font-bold text-text-primary dark:text-text-dark-primary"
              style={{ fontVariant: ['tabular-nums'], marginBottom: 8 }}
            >
              {getDisplayValue()}
            </Text>

            {/* Label + Unit Selector */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gold-500">
                my holdings
              </Text>

              <View
                className="flex-row"
                style={{
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  borderRadius: 20,
                  padding: 2,
                }}
              >
                {goldHoldingUnits.map(({ key, label }) => (
                  <Pressable
                    key={key}
                    onPress={() => setViewMode(key)}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 18,
                      },
                      viewMode === key
                        ? {
                            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.08,
                            shadowRadius: 2,
                            elevation: 1,
                          }
                        : {},
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color:
                          viewMode === key
                            ? colors.textPrimary
                            : colors.textMuted,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </MotiView>

        {/* ── Returns Badge ─────────────────────────────── */}
        <AnimatePresence>
          {hasHoldings && (
            <MotiView
              key="returns-badge"
              from={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring' as const, damping: 20, stiffness: 300 }}
            >
              <View style={{ alignItems: 'center', marginTop: -12, marginBottom: 16, zIndex: 10 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor:
                      profitLossInr >= 0
                        ? isDark
                          ? 'rgba(16,185,129,0.1)'
                          : '#D1FAE5'
                        : isDark
                          ? 'rgba(239,68,68,0.1)'
                          : '#FEE2E2',
                    borderWidth: 1,
                    borderColor:
                      profitLossInr >= 0
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(239,68,68,0.2)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      fontVariant: ['tabular-nums'],
                      color: profitLossInr >= 0 ? '#10B981' : '#EF4444',
                    }}
                  >
                    7d returns: {profitLossInr > 0 ? '+' : ''}
                    {formatGrams(profitLossGrams)} ({formatINR(profitLossInr)})
                  </Text>
                </View>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* ── First-Time User CTA ───────────────────────── */}
        {!hasHoldings && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: 160,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 8 }}>
              <Pressable
                onPress={() => router.push('/buy')}
                style={{
                  backgroundColor: GOLD_500,
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  borderRadius: 8,
                }}
              >
                <Text className="text-white font-bold text-sm">
                  buy your first gold
                </Text>
              </Pressable>
            </View>
          </MotiView>
        )}

        {/* ── Buy / Sell Buttons ────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 140,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <Pressable
              onPress={() => router.push('/buy')}
              style={{
                flex: 1,
                backgroundColor: GOLD_500,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-white font-bold text-base">buy</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/sell')}
              style={{
                flex: 1,
                backgroundColor: isDark
                  ? 'rgba(184,134,11,0.1)'
                  : '#FFF9E6',
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(184,134,11,0.2)'
                  : 'rgba(184,134,11,0.3)',
              }}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: GOLD_500 }}
              >
                sell
              </Text>
            </Pressable>
          </View>
        </MotiView>

        {/* ── Feature Icons ─────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 180,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 32,
              marginBottom: 24,
            }}
          >
            {(
              [
                { icon: Sprout, label: 'earn', route: '/(tabs)/yield' },
                { icon: Calendar, label: 'save', route: '/autopay' },
                { icon: Gift, label: 'gift', route: '/gift' },
              ] as const
            ).map(({ icon: Icon, label, route }) => (
              <Pressable
                key={label}
                onPress={() => router.push(route)}
                style={{ alignItems: 'center', gap: 8 }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0',
                    borderWidth: 1,
                    borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  }}
                >
                  <Icon size={24} color={GOLD_500} />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.textSecondary,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </MotiView>

        {/* ── Recent Activity ───────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 280,
          }}
        >
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text
                className="text-lg font-bold text-text-primary dark:text-text-dark-primary"
              >
                recent activity
              </Text>
              <Pressable onPress={() => router.push('/transactions')}>
                <Text
                  style={{ fontSize: 12, fontWeight: '500', color: GOLD_500 }}
                >
                  see more
                </Text>
              </Pressable>
            </View>

            {transactionsLoading && recentTransactions.length === 0 ? (
              <View style={{ gap: 12 }}>
                {[1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ gap: 8 }}>
                        <View
                          style={{
                            height: 16,
                            width: 80,
                            backgroundColor: isDark ? '#242424' : '#F0F0F0',
                            borderRadius: 4,
                          }}
                        />
                        <View
                          style={{
                            height: 12,
                            width: 64,
                            backgroundColor: isDark ? '#242424' : '#F0F0F0',
                            borderRadius: 4,
                          }}
                        />
                      </View>
                      <View style={{ gap: 8, alignItems: 'flex-end' }}>
                        <View
                          style={{
                            height: 16,
                            width: 80,
                            backgroundColor: isDark ? '#242424' : '#F0F0F0',
                            borderRadius: 4,
                          }}
                        />
                        <View
                          style={{
                            height: 12,
                            width: 56,
                            backgroundColor: isDark ? '#242424' : '#F0F0F0',
                            borderRadius: 4,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : recentTransactions.length === 0 ? (
              <View
                style={{
                  borderRadius: 16,
                  padding: 32,
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textMuted }}>
                  No recent transactions
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {recentTransactions.map((tx, index) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    index={index}
                    isDark={isDark}
                    colors={colors}
                  />
                ))}
              </View>
            )}
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Transaction Item ──────────────────────────────────

function TransactionItem({
  tx,
  index,
  isDark,
  colors,
}: {
  tx: Transaction;
  index: number;
  isDark: boolean;
  colors: { textPrimary: string; textMuted: string };
}) {
  const xautGrams = tx.xautAmount
    ? new Decimal(tx.xautAmount).times(GRAMS_PER_OUNCE).toNumber()
    : 0;

  const txDate = new Date(tx.completedAt ?? tx.createdAt);
  const isToday = txDate.toDateString() === new Date().toDateString();
  const txDateLabel = isToday
    ? 'today'
    : txDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
  const txTime = txDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const statusDotColors: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#F59E0B',
    completed: '#10B981',
    failed: '#EF4444',
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing' as const,
        duration: DURATION.normal,
        delay: index * 50,
      }}
    >
      <View
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  tx.type === 'buy'
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(239,68,68,0.1)',
              }}
            >
              {tx.type === 'buy' ? (
                <ArrowDownLeft size={24} color="rgba(16,185,129,0.8)" />
              ) : (
                <ArrowUpRight size={24} color="rgba(239,68,68,0.8)" />
              )}
            </View>
            <View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  {tx.type === 'buy' ? 'Purchased' : 'Sold'}
                </Text>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      statusDotColors[tx.status] || '#9CA3AF',
                  }}
                />
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                {txDateLabel}, {txTime}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 17,
                fontVariant: ['tabular-nums'],
                color:
                  tx.type === 'sell' ? '#10B981' : colors.textPrimary,
              }}
            >
              {tx.type === 'buy' ? '-' : '+'}
              {formatINR(tx.inrAmount || 0)}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatGrams(xautGrams)}
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
