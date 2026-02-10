import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Pause,
  Play,
  Target,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { formatINR } from '@/lib/utils';
import { DURATION, staggerDelay, STAGGER } from '@/lib/animations';
import type { AutoPay, AutoPayTransaction } from '@/types';

// ── Mock data ─────────────────────────────────────────────

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

const MOCK_TRANSACTIONS: Record<string, AutoPayTransaction[]> = {
  'ap-1': [
    {
      id: 'tx-1',
      autoPayId: 'ap-1',
      amount: 3000,
      gramsPurchased: 0.39,
      pricePerGram: 7692,
      status: 'completed',
      executedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'tx-2',
      autoPayId: 'ap-1',
      amount: 3000,
      gramsPurchased: 0.41,
      pricePerGram: 7317,
      status: 'completed',
      executedAt: '2025-12-15T10:00:00Z',
    },
    {
      id: 'tx-3',
      autoPayId: 'ap-1',
      amount: 3000,
      gramsPurchased: 0.38,
      pricePerGram: 7894,
      status: 'completed',
      executedAt: '2025-11-15T10:00:00Z',
    },
  ],
  'ap-2': [
    {
      id: 'tx-4',
      autoPayId: 'ap-2',
      amount: 500,
      gramsPurchased: 0.065,
      pricePerGram: 7692,
      status: 'completed',
      executedAt: '2026-02-05T10:00:00Z',
    },
    {
      id: 'tx-5',
      autoPayId: 'ap-2',
      amount: 500,
      gramsPurchased: 0.067,
      pricePerGram: 7462,
      status: 'completed',
      executedAt: '2026-01-29T10:00:00Z',
    },
  ],
  'ap-3': [],
};

// ── Helpers ───────────────────────────────────────────────

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  biweekly: 'bi-weekly',
  monthly: 'monthly',
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Transaction Item ──────────────────────────────────────

function TransactionItem({
  tx,
  index,
  isDark,
  colors,
}: {
  tx: AutoPayTransaction;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const statusColors: Record<string, string> = {
    completed: '#10B981',
    failed: '#EF4444',
    pending: '#F59E0B',
  };

  const d = new Date(tx.executedAt);
  const dateLabel = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing' as const,
        duration: DURATION.normal,
        delay: staggerDelay(index, STAGGER.fast, 220),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB',
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.textPrimary,
              }}
            >
              {formatINR(tx.amount)}
            </Text>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColors[tx.status] || '#9CA3AF',
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {dateLabel}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#B8860B',
              fontVariant: ['tabular-nums'],
            }}
          >
            +{tx.gramsPurchased.toFixed(3)}g
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatINR(tx.pricePerGram)}/g
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────

export default function AutoPayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useTheme();
  const GOLD_500 = '#B8860B';

  const [toggling, setToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localStatus, setLocalStatus] = useState<'active' | 'paused' | null>(null);

  const autoPay = useMemo(() => MOCK_AUTOPAYS.find((a) => a.id === id), [id]);
  const transactions = useMemo(() => MOCK_TRANSACTIONS[id ?? ''] || [], [id]);

  if (!autoPay) {
    return (
      <SafeAreaView
        className="flex-1 bg-surface dark:bg-surface-dark"
        edges={['top']}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={GOLD_500} />
        </View>
      </SafeAreaView>
    );
  }

  const isActive = (localStatus ?? autoPay.status) === 'active';

  async function handleToggle() {
    setToggling(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLocalStatus(isActive ? 'paused' : 'active');
    setToggling(false);
  }

  async function handleDelete() {
    setDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowDeleteConfirm(false);
    setDeleting(false);
    router.back();
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
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
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
              {autoPay.name}
            </Text>
          </View>
        </MotiView>

        {/* Amount Card */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 60,
          }}
        >
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
            {/* Top row: amount + status */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '500',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: colors.textMuted,
                    marginBottom: 8,
                  }}
                >
                  AutoPay Amount
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
                    {'\u20B9'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 36,
                      fontWeight: '700',
                      color: colors.textPrimary,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {autoPay.amount.toLocaleString('en-IN')}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      marginLeft: 4,
                    }}
                  >
                    /{FREQUENCY_LABELS[autoPay.frequency]}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
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
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    color: isActive ? '#10B981' : '#F59E0B',
                    textTransform: 'uppercase',
                  }}
                >
                  {isActive ? 'ACTIVE' : 'PAUSED'}
                </Text>
              </View>
            </View>

            {/* Gold Accumulated */}
            <View
              style={{
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '500',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: colors.textMuted,
                  marginBottom: 8,
                }}
              >
                Gold Accumulated
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '700',
                  color: GOLD_500,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {autoPay.goldAccumulated.toFixed(2)}g
              </Text>
            </View>

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
                  Total Invested
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatINR(autoPay.totalInvested)}
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
                  Avg. Price
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {autoPay.avgPricePerGram > 0
                    ? `${formatINR(autoPay.avgPricePerGram)}/g`
                    : '--'}
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
                  Since
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.textSecondary,
                  }}
                >
                  {formatShortDate(autoPay.startDate)}
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* AutoPay Status Toggle */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 120,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                AutoPay Status
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                {isActive ? 'Deductions are active' : 'Deductions are paused'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggle}
              disabled={toggling}
              trackColor={{
                false: isDark ? '#3D3D3D' : '#D1D5DB',
                true: 'rgba(184,134,11,0.3)',
              }}
              thumbColor={isActive ? GOLD_500 : isDark ? '#9CA3AF' : '#FFFFFF'}
            />
          </View>
        </MotiView>

        {/* Transaction History */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 180,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 12,
            }}
          >
            Transaction History
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 200,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              paddingHorizontal: 16,
              marginBottom: 24,
            }}
          >
            {transactions.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              transactions.map((tx, i) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  index={i}
                  isDark={isDark}
                  colors={colors}
                />
              ))
            )}
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 300,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {/* Pause/Resume */}
            <Pressable
              onPress={handleToggle}
              disabled={toggling}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FFF0C2',
                borderWidth: 1,
                borderColor: 'rgba(184,134,11,0.2)',
              }}
            >
              {isActive ? (
                <>
                  <Pause size={16} color={isDark ? '#D4A012' : '#956B08'} />
                  <Text
                    style={{
                      fontWeight: '600',
                      color: isDark ? '#D4A012' : '#956B08',
                    }}
                  >
                    Pause
                  </Text>
                </>
              ) : (
                <>
                  <Play size={16} color={isDark ? '#D4A012' : '#956B08'} />
                  <Text
                    style={{
                      fontWeight: '600',
                      color: isDark ? '#D4A012' : '#956B08',
                    }}
                  >
                    Resume
                  </Text>
                </>
              )}
            </Pressable>

            {/* Edit Amount */}
            <Pressable
              onPress={() =>
                Alert.alert('Coming Soon', 'Edit amount is not yet available.')
              }
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              }}
            >
              <Target size={16} color={colors.textPrimary} />
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
                Edit Amount
              </Text>
            </Pressable>

            {/* Delete */}
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={{
                width: 56,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <Trash2 size={20} color="#EF4444" />
            </Pressable>
          </View>

          {/* Disclaimer */}
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            AutoPay investments are subject to market risk. Returns are not guaranteed.
            Gold.fi is regulated by applicable Indian financial authorities.
          </Text>
        </MotiView>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable
          onPress={() => setShowDeleteConfirm(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 360,
            }}
          >
            {/* Icon */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring' as const,
                  damping: 20,
                  stiffness: 300,
                  delay: 100,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Trash2 size={24} color="#EF4444" />
                </View>
              </MotiView>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Delete AutoPay?
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                This will permanently delete "{autoPay.name}". Your accumulated
                gold will remain in your vault.
              </Text>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    color: colors.textPrimary,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#EF4444',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                <Text style={{ fontWeight: '500', color: '#FFFFFF' }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
