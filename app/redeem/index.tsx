import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRightLeft,
  Store,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';

const GOLD_500 = '#B8860B';
const GOLD_100 = '#FFF0C2';

export default function RedeemScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <MotiView {...FADE_UP}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
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
              Redeem
            </Text>
          </View>
        </MotiView>

        {/* Description */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 60 }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 20,
              marginBottom: 32,
            }}
          >
            Cash out your gold holdings. Convert to USDT instantly or sell to a
            partner jeweller near you.
          </Text>
        </MotiView>

        {/* Swap to USDT */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: DURATION.normal, delay: staggerDelay(0, 80, 100) }}
        >
          <Pressable
            onPress={() => router.push('/sell')}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <ArrowRightLeft size={24} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginBottom: 4,
                }}
              >
                Swap to USDT
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 18,
                }}
              >
                Instant conversion at market rate
              </Text>
            </View>

            <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </MotiView>

        {/* Sell to Jewellers */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: DURATION.normal, delay: staggerDelay(1, 80, 100) }}
        >
          <Pressable
            onPress={() => router.push('/redeem/jewellers')}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Store size={24} color={GOLD_500} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}
              >
                Sell to Jewellers
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Find partner jewellers near you
              </Text>
            </View>

            <ChevronRight size={20} color={colors.textMuted} />
          </Pressable>
        </MotiView>

        {/* Info note */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 300 }}
        >
          <View
            style={{
              backgroundColor: isDark ? 'rgba(184,134,11,0.08)' : '#FFF9E6',
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(184,134,11,0.15)' : 'rgba(184,134,11,0.12)',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 18,
              }}
            >
              Gold redemption is subject to market rates and applicable charges.
              Jeweller rates may vary based on purity and making charges. All
              transactions are recorded on-chain for transparency.
            </Text>
          </View>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
