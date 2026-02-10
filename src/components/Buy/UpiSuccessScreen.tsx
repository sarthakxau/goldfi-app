import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { formatINR } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { SPRING, FADE_UP, DURATION, staggerDelay } from '@/lib/animations';

interface UpiSuccessScreenProps {
  goldGrams: number;
  totalPayable: number;
  ratePerGram: number;
  tds: number;
  inrAmount: number;
  onBuyMore: () => void;
}

export function UpiSuccessScreen({
  goldGrams,
  totalPayable,
  ratePerGram,
  tds,
  inrAmount,
  onBuyMore,
}: UpiSuccessScreenProps) {
  const { colors, isDark } = useTheme();
  const GOLD = '#D4A012';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5' }}
      edges={['top']}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        {/* Success Checkmark */}
        <MotiView
          from={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', ...SPRING.bouncy }}
          style={{ marginBottom: 24 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(16,185,129,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#10B981',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={32} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        </MotiView>

        {/* Heading */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(0) }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Gold Purchased!
          </Text>
        </MotiView>

        {/* Gold Amount */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(1) }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: '700',
              color: GOLD,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            +{goldGrams.toFixed(3)} g
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Added to your holdings
          </Text>
        </MotiView>

        {/* Summary Card */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(2) }}
          style={{ width: '100%' }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.1)',
              gap: 12,
              marginBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Paid</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                {formatINR(totalPayable)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Rate</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                {formatINR(ratePerGram)}/g
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>TDS Deducted</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                {formatINR(tds)}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Actions */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(3) }}
          style={{ width: '100%' }}
        >
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={{
              backgroundColor: '#B8860B',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>
              View Holdings
            </Text>
          </Pressable>
          <Pressable
            onPress={onBuyMore}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ color: colors.textMuted, fontWeight: '500', fontSize: 15 }}>
              Buy More
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
