import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ClipboardList } from 'lucide-react-native';
import Decimal from 'decimal.js';

import { useAppStore } from '@/store';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams } from '@/lib/utils';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';
import { useTheme } from '@/lib/theme';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import type { Transaction } from '@/types';

const GOLD_500 = '#B8860B';

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const {
    transactions,
    transactionsLoading,
    setTransactions,
    setTransactionsLoading,
    setTransactionsError,
    refreshing,
    setRefreshing,
  } = useAppStore();

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
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions, setRefreshing]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      {/* Header */}
      <MotiView {...FADE_UP}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ marginRight: 16 }}
          >
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
            }}
          >
            transactions
          </Text>
        </View>
      </MotiView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GOLD_500}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Loading skeletons */}
        {transactionsLoading && transactions.length === 0 ? (
          <View style={{ gap: 12, marginTop: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.normal,
                  delay: staggerDelay(i),
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
                          backgroundColor: isDark ? '#242424' : '#F0F0F0',
                        }}
                      />
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
                            width: 120,
                            backgroundColor: isDark ? '#242424' : '#F0F0F0',
                            borderRadius: 4,
                          }}
                        />
                      </View>
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
              </MotiView>
            ))}
          </View>
        ) : transactions.length === 0 ? (
          /* Empty state */
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: 100,
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <ClipboardList size={40} color={colors.textMuted} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                No transactions yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: 'center',
                }}
              >
                Your buy and sell history will appear here
              </Text>
            </View>
          </MotiView>
        ) : (
          /* Transaction list */
          <View style={{ gap: 12, marginTop: 8 }}>
            {transactions.map((tx, index) => (
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
        delay: staggerDelay(index, 50),
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
          {/* Left: icon + label + date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
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
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 15,
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
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {txDateLabel}, {txTime}
              </Text>
            </View>
          </View>

          {/* Right: amounts */}
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
                marginTop: 2,
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
