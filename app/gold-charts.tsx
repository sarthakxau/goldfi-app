import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Globe,
} from 'lucide-react-native';

import { useAppStore } from '@/store';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR } from '@/lib/utils';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';
import { useTheme } from '@/lib/theme';
import { GRAMS_PER_OUNCE, GRAMS_PER_TOLA } from '@/lib/constants';
import type { GoldPrice } from '@/types';

const GOLD_500 = '#B8860B';

const TRADINGVIEW_URL = 'https://www.tradingview.com/chart/?symbol=XAUTUSD';

interface PriceCard {
  label: string;
  sublabel: string;
  value: string;
  icon: typeof TrendingUp;
}

export default function GoldChartsScreen() {
  const { colors, isDark } = useTheme();
  const {
    goldPrice,
    priceLoading,
    setGoldPrice,
    setPriceLoading,
    setPriceError,
    refreshing,
    setRefreshing,
  } = useAppStore();

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPrice();
    setRefreshing(false);
  }, [fetchPrice, setRefreshing]);

  useEffect(() => {
    if (!goldPrice) {
      fetchPrice();
    }
  }, [goldPrice, fetchPrice]);

  // Derived prices
  const pricePerGramInr = goldPrice?.pricePerGramInr ?? 0;
  const pricePerOunceInr = goldPrice?.priceInr ?? 0;
  const pricePerTolaInr = pricePerGramInr * GRAMS_PER_TOLA;
  const pricePerGramUsd = goldPrice?.pricePerGramUsd ?? 0;
  const pricePerOunceUsd = goldPrice?.priceUsd ?? 0;

  const priceCards: PriceCard[] = [
    {
      label: 'per gram',
      sublabel: '1 gram',
      value: formatINR(pricePerGramInr),
      icon: TrendingUp,
    },
    {
      label: 'per 10 grams',
      sublabel: '10 grams',
      value: formatINR(pricePerGramInr * 10),
      icon: BarChart3,
    },
    {
      label: 'per tola',
      sublabel: '1 tola (10g)',
      value: formatINR(pricePerTolaInr),
      icon: TrendingUp,
    },
    {
      label: 'per troy ounce',
      sublabel: `1 oz (${GRAMS_PER_OUNCE}g)`,
      value: formatINR(pricePerOunceInr),
      icon: BarChart3,
    },
  ];

  const handleOpenTradingView = () => {
    Linking.openURL(TRADINGVIEW_URL);
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
            gold charts
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
        {/* Current Price Hero */}
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
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(184,134,11,0.2)'
                : 'rgba(184,134,11,0.12)',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 1.5,
                color: colors.textMuted,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Live Gold Price
            </Text>
            {priceLoading && !goldPrice ? (
              <View
                style={{
                  height: 40,
                  width: 200,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '700',
                    color: GOLD_500,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatINR(pricePerGramInr * 10)}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  per 10 grams
                </Text>
              </>
            )}

            {/* USD price subtitle */}
            {goldPrice && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <Globe size={16} color={colors.textMuted} />
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  ${pricePerOunceUsd.toFixed(2)} / oz (USD)
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  ${pricePerGramUsd.toFixed(2)} / g
                </Text>
              </View>
            )}
          </View>
        </MotiView>

        {/* Price breakdown cards */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 120,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            price breakdown
          </Text>
        </MotiView>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {priceCards.map((card, index) => (
            <MotiView
              key={card.label}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: staggerDelay(index, 60, 160),
              }}
            >
              <View
                style={{
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDark
                        ? 'rgba(184,134,11,0.1)'
                        : 'rgba(184,134,11,0.08)',
                    }}
                  >
                    <card.icon size={20} color={GOLD_500} />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: colors.textPrimary,
                      }}
                    >
                      {card.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {card.sublabel}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    fontVariant: ['tabular-nums'],
                    color: colors.textPrimary,
                  }}
                >
                  {priceLoading && !goldPrice ? '---' : card.value}
                </Text>
              </View>
            </MotiView>
          ))}
        </View>

        {/* TradingView CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 420,
          }}
        >
          <Pressable onPress={handleOpenTradingView}>
            <View
              style={{
                borderRadius: 16,
                padding: 20,
                backgroundColor: isDark
                  ? 'rgba(184,134,11,0.1)'
                  : '#FFF9E6',
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(184,134,11,0.2)'
                  : 'rgba(184,134,11,0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: GOLD_500,
                    marginBottom: 4,
                  }}
                >
                  View Live Charts
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  Open interactive TradingView charts in your browser
                </Text>
              </View>
              <ExternalLink size={24} color={GOLD_500} style={{ marginLeft: 12 }} />
            </View>
          </Pressable>
        </MotiView>

        {/* Footer */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: colors.textMuted,
            marginTop: 24,
          }}
        >
          Prices sourced from CoinGecko. Refreshes every 60s.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
