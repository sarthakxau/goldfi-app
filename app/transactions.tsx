
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  X,
  ExternalLink,
} from 'lucide-react-native';
import Decimal from 'decimal.js';

import { useAppStore } from '@/store';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams } from '@/lib/utils';
import { DURATION, FADE_UP, SCALE_IN, staggerDelay } from '@/lib/animations';
import { useTheme } from '@/lib/theme';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import type { Transaction } from '@/types';

const GOLD_500 = '#B8860B';

type TabMode = 'transactions' | 'statistics';

function groupByDate(txs: Transaction[]) {
  const groups: { label: string; key: string; txs: Transaction[] }[] = [];
  const map = new Map<string, Transaction[]>();
  const today = new Date().toDateString();

  for (const tx of txs) {
    const d = new Date(tx.completedAt ?? tx.createdAt);
    const key = d.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }

  for (const [key, items] of map) {
    const label =
      key === today
        ? 'Today'
        : new Date(key).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
    groups.push({ label, key, txs: items });
  }

  return groups;
}

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

  const [activeTab, setActiveTab] = useState<TabMode>('transactions');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const openDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTx(null), 300);
  };

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
            all transactions
          </Text>
        </View>
      </MotiView>

      {/* Segmented Control */}
      <MotiView {...FADE_UP}>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: isDark ? '#242424' : '#F0F0F0',
            borderRadius: 12,
            padding: 3,
          }}
        >
          {(['transactions', 'statistics'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor:
                  activeTab === tab
                    ? isDark
                      ? '#1A1A1A'
                      : '#FFFFFF'
                    : 'transparent',
                ...(activeTab === tab
                  ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color:
                    activeTab === tab
                      ? colors.textPrimary
                      : colors.textMuted,
                }}
              >
                {tab === 'transactions' ? 'Transactions' : 'Statistics'}
              </Text>
            </Pressable>
          ))}
        </View>
      </MotiView>

      {activeTab === 'transactions' ? (
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
            /* Transaction list grouped by date */
            <View style={{ marginTop: 4 }}>
              {groupByDate(transactions).map((group, gi) => (
                <View key={group.key} style={{ marginBottom: 4, marginTop: 4 }}>
                  {/* Date header */}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: colors.textMuted,
                      paddingVertical: 12,
                      paddingHorizontal: 2,
                    }}
                  >
                    {group.label}
                  </Text>

                  {/* Items in group */}
                  <View style={{ gap: 10 }}>
                  {group.txs.map((tx, ti) => (
                    <View key={tx.id}>
                      <TransactionItem
                        tx={tx}
                        index={gi * 10 + ti}
                        isDark={isDark}
                        colors={colors}
                        onPress={() => openDetail(tx)}
                      />
                      {ti < group.txs.length - 1 && (
                        <View
                          style={{
                            height: 1,
                            backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
                            marginLeft: 64,
                            marginTop: 8
                          }}
                        />
                      )}
                    </View>
                  ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        /* Statistics Tab - Coming Soon */
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
          <MotiView {...SCALE_IN}>
            <View style={{ alignItems: 'center' }}>
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
                Statistics coming soon
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: 'center',
                }}
              >
                View your investment analytics and insights
              </Text>
            </View>
          </MotiView>
        </View>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        visible={modalVisible}
        onClose={closeDetail}
        isDark={isDark}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// ── Transaction Item ──────────────────────────────────

function TransactionItem({
  tx,
  index,
  isDark,
  colors,
  onPress,
}: {
  tx: Transaction;
  index: number;
  isDark: boolean;
  colors: { textPrimary: string; textMuted: string };
  onPress: () => void;
}) {
  const xautGrams = tx.xautAmount
    ? new Decimal(tx.xautAmount).times(GRAMS_PER_OUNCE).toNumber()
    : 0;

  const txDate = new Date(tx.completedAt ?? tx.createdAt);
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          paddingVertical: 14,
          paddingHorizontal: 4,
          backgroundColor: pressed
            ? isDark
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.03)'
            : 'transparent',
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left: icon + label + date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  tx.type === 'buy'
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(239,68,68,0.12)',
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
                {txTime}
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
      </Pressable>
    </MotiView>
  );
}

// ── Transaction Detail Modal ──────────────────────────

function TransactionDetailModal({
  transaction,
  visible,
  onClose,
  isDark,
  colors,
}: {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  colors: {
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    background: string;
  };
}) {
  if (!transaction) return null;

  const xautGrams = transaction.xautAmount
    ? new Decimal(transaction.xautAmount).times(GRAMS_PER_OUNCE).toNumber()
    : 0;

  const txDate = new Date(transaction.completedAt ?? transaction.createdAt);
  const formattedDate = txDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const goldPricePerGram = transaction.goldPriceInr
    ? new Decimal(transaction.goldPriceInr).toNumber()
    : transaction.inrAmount && xautGrams > 0
      ? new Decimal(transaction.inrAmount).dividedBy(xautGrams).toNumber()
      : 0;

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#F59E0B',
    completed: '#10B981',
    failed: '#EF4444',
  };

  const statusColor = statusColors[transaction.status] || '#9CA3AF';
  const statusLabel = statusLabels[transaction.status] || transaction.status;

  const detailRows = [
    { label: 'Date', value: formattedDate },
    { label: 'Gold Price', value: `${formatINR(goldPricePerGram)}/g` },
    { label: 'Quantity', value: `${formatGrams(xautGrams).replace(' g', 'g')}` },
    { label: 'Platform Fee', value: formatINR(0) },
    { label: 'GST (18%)', value: formatINR(0) },
    {
      label: 'Transaction ID',
      value: `GF${transaction.id.slice(0, 8).toUpperCase()}`,
      mono: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          <MotiView {...FADE_UP}>
            {/* Drag Handle */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 48,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#3D3D3D' : '#D1D5DB',
                }}
              />
            </View>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                padding: 4,
                zIndex: 10,
              }}
            >
              <X size={22} color={colors.textMuted} />
            </Pressable>

            {/* Icon */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    transaction.type === 'buy'
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(239,68,68,0.1)',
                }}
              >
                {transaction.type === 'buy' ? (
                  <ArrowDownLeft size={28} color="#10B981" />
                ) : (
                  <ArrowUpRight size={28} color="#EF4444" />
                )}
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                textAlign: 'center',
                color: colors.textPrimary,
                marginBottom: 12,
              }}
            >
              {transaction.type === 'buy' ? 'Buy Gold' : 'Sell Gold'}
            </Text>

            {/* Status Badge */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor:
                    statusColor === '#10B981'
                      ? 'rgba(16,185,129,0.1)'
                      : statusColor === '#EF4444'
                        ? 'rgba(239,68,68,0.1)'
                        : 'rgba(245,158,11,0.1)',
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: statusColor,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: statusColor,
                  }}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>

            {/* Amount */}
            <Text
              style={{
                fontSize: 34,
                fontWeight: '700',
                textAlign: 'center',
                fontVariant: ['tabular-nums'],
                color:
                  transaction.type === 'sell'
                    ? '#10B981'
                    : colors.textPrimary,
                marginBottom: 4,
              }}
            >
              {transaction.type === 'buy' ? '-' : '+'}
              {formatINR(transaction.inrAmount || 0)}
            </Text>

            {/* Grams */}
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: GOLD_500,
                marginBottom: 24,
              }}
            >
              {formatGrams(xautGrams).replace(' g', 'g')} gold
            </Text>

            {/* Details Card */}
            <View
              style={{
                backgroundColor: isDark ? '#242424' : '#F5F5F5',
                borderRadius: 16,
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              {detailRows.map((row, i) => (
                <View key={row.label}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.textMuted }}>
                      {row.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.textPrimary,
                        ...(row.mono ? { fontFamily: 'monospace' } : {}),
                      }}
                    >
                      {row.value}
                    </Text>
                  </View>
                  {i < detailRows.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: isDark ? '#333333' : '#E5E7EB',
                        marginLeft: 16,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Arbiscan Link */}
            {transaction.blockchainTxHash && (
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://arbiscan.io/tx/${transaction.blockchainTxHash}`
                  )
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 13, color: GOLD_500 }}>
                  View on Arbiscan
                </Text>
                <ExternalLink size={13} color={GOLD_500} />
              </Pressable>
            )}

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              >
                Close
              </Text>
            </Pressable>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
