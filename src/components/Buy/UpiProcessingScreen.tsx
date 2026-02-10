import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { formatINR } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION, staggerDelay } from '@/lib/animations';

interface UpiProcessingScreenProps {
  totalPayable: number;
  goldGrams: number;
  countdownSeconds: number;
}

export function UpiProcessingScreen({
  totalPayable,
  goldGrams,
  countdownSeconds,
}: UpiProcessingScreenProps) {
  const { colors, isDark } = useTheme();
  const GOLD = '#D4A012';

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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
        {/* Loading Spinner */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
          style={{ marginBottom: 32 }}
        >
          <ActivityIndicator size="large" color={GOLD} />
        </MotiView>

        {/* Processing Text */}
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
            Processing Payment
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Complete payment in your UPI app
          </Text>
        </MotiView>

        {/* Amount Summary Card */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(1) }}
          style={{ width: '100%' }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.1)',
              marginBottom: 32,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Amount</Text>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                {formatINR(totalPayable)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textMuted }}>You'll receive</Text>
              <Text style={{ fontSize: 17, fontWeight: '700', color: GOLD }}>
                {goldGrams.toFixed(3)} g gold
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Countdown */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(2) }}
        >
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
            Payment times out in{' '}
            <Text
              style={{
                fontWeight: '600',
                fontFamily: 'monospace',
                color: colors.textPrimary,
              }}
            >
              {timeString}
            </Text>
          </Text>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
