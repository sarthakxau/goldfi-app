import { useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowLeft, ArrowDown } from 'lucide-react-native';
import { formatINR } from '@/lib/utils';
import { INR_QUICK_AMOUNTS } from '@/lib/constants';
import type { UpiQuote } from '@/types';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION, staggerDelay } from '@/lib/animations';

interface UpiAmountScreenProps {
  inrAmount: number;
  quote: UpiQuote | null;
  goldPricePerGram: number;
  priceLoading: boolean;
  isAmountValid: boolean;
  canProceedToPayment: boolean;
  minAmount: number;
  maxAmount: number;
  onAmountChange: (amount: number) => void;
  onContinue: () => void;
  onBack: () => void;
  onFetchPrice: () => Promise<number>;
}

export function UpiAmountScreen({
  inrAmount,
  quote,
  goldPricePerGram,
  priceLoading,
  isAmountValid,
  canProceedToPayment,
  minAmount,
  maxAmount,
  onAmountChange,
  onContinue,
  onBack,
  onFetchPrice,
}: UpiAmountScreenProps) {
  const { colors, isDark } = useTheme();
  const hasFetchedPrice = useRef(false);
  const GOLD = '#B8860B';

  useEffect(() => {
    if (!hasFetchedPrice.current) {
      hasFetchedPrice.current = true;
      onFetchPrice();
    }
  }, [onFetchPrice]);

  const handleInputChange = useCallback(
    (text: string) => {
      const raw = text.replace(/[^0-9]/g, '');
      const num = raw ? parseInt(raw, 10) : 0;
      onAmountChange(num);
    },
    [onAmountChange]
  );

  const formatDisplayAmount = (amount: number) => {
    if (amount === 0) return '';
    return amount.toLocaleString('en-IN');
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5' }}
      edges={['top']}
    >
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Header */}
        <MotiView {...FADE_UP}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 32,
              marginTop: 8,
            }}
          >
            <Pressable onPress={onBack} hitSlop={12} style={{ padding: 8, marginLeft: -8 }}>
              <ArrowLeft size={24} color={colors.textMuted} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              Buy with UPI
            </Text>
            <View
              style={{
                backgroundColor: isDark ? '#242424' : '#FFFFFF',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>
                UPI
              </Text>
            </View>
          </View>
        </MotiView>

        {/* You Pay */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(0) }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.1)',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
              You Pay
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginRight: 8 }}>
                {'\u20B9'}
              </Text>
              <TextInput
                keyboardType="number-pad"
                value={formatDisplayAmount(inrAmount)}
                onChangeText={handleInputChange}
                placeholder="0"
                placeholderTextColor={isDark ? '#3D3D3D' : '#9CA3AF'}
                style={{
                  flex: 1,
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  padding: 0,
                }}
              />
              <View
                style={{
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted }}>
                  INR
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Arrow Divider */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(1, 40) }}
        >
          <View style={{ alignItems: 'center', marginVertical: -4, zIndex: 1 }}>
            <View
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                borderRadius: 999,
                padding: 8,
              }}
            >
              <ArrowDown size={16} color={colors.textMuted} />
            </View>
          </View>
        </MotiView>

        {/* You Get */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(2, 40) }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.1)',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
              You Get
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
                {quote ? quote.goldGrams.toFixed(3) : '0.000'}
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>
                  {' '}g
                </Text>
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.08)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: GOLD }}>Gold</Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Quick Amount Pills */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(3, 40) }}
        >
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {INR_QUICK_AMOUNTS.map((amt) => {
              const selected = inrAmount === amt;
              return (
                <Pressable
                  key={amt}
                  onPress={() => onAmountChange(amt)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: selected
                      ? GOLD
                      : isDark
                        ? '#1A1A1A'
                        : '#FFFFFF',
                    borderWidth: selected ? 0 : 1,
                    borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: selected ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {'\u20B9'}{amt >= 1000 ? `${amt / 1000}K` : amt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </MotiView>

        {/* Rate & Fee Breakdown */}
        {goldPricePerGram > 0 && (
          <MotiView
            {...FADE_UP}
            transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(4, 40) }}
          >
            <View style={{ gap: 12, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Rate</Text>
                {priceLoading ? (
                  <ActivityIndicator size="small" color={GOLD} />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                    {formatINR(goldPricePerGram)}/g
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Fee (0%)</Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                  {quote ? formatINR(quote.fee) : '---'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>TDS (1%)</Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                  {quote ? formatINR(quote.tds) : '---'}
                </Text>
              </View>
            </View>
          </MotiView>
        )}

        {/* Validation Message */}
        {inrAmount > 0 && !isAmountValid && (
          <MotiView
            from={{ opacity: 0, translateY: -4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing' as const, duration: 200 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: '#EF4444',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              {inrAmount < minAmount
                ? `Minimum amount is ${formatINR(minAmount)}`
                : `Maximum amount is ${formatINR(maxAmount)}`}
            </Text>
          </MotiView>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue Button */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 200 }}
        >
          <Pressable
            onPress={onContinue}
            disabled={!canProceedToPayment}
            style={{
              backgroundColor: GOLD,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              opacity: canProceedToPayment ? 1 : 0.4,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>
              Continue to UPI
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
