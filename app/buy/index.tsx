import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';

const GOLD_500 = '#B8860B';
const SUCCESS_COLOR = '#10B981';

export default function BuyScreen() {
  const { colors, isDark } = useTheme();
  const [showSwapModal, setShowSwapModal] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* ── Header ────────────────────────────────── */}
        <MotiView {...FADE_UP}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 48,
              marginTop: 8,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <ArrowLeft size={24} color={colors.textMuted} />
            </Pressable>

            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              Buy Gold
            </Text>

            <Pressable
              onPress={() => router.push('/transactions')}
              hitSlop={12}
              style={{ padding: 8, marginRight: -8 }}
            >
              <Clock size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </MotiView>

        {/* ── Payment Methods ───────────────────────── */}
        <View style={{ gap: 12 }}>
          {/* Pay with UPI - Recommended */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(0, 60, 80),
            }}
          >
            <Pressable
              onPress={() => router.push('/buy/upi')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 16,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(184,134,11,0.2)'
                  : 'rgba(184,134,11,0.12)',
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: GOLD_500,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>
                  {'\u20B9'}
                </Text>
              </View>

              {/* Label */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Text style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 15 }}>
                    Pay with UPI
                  </Text>
                  <View
                    style={{
                      backgroundColor: GOLD_500,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}>
                      Recommended
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Instant {'\u00B7'} Powered by Onmeta
                </Text>
              </View>

              <ChevronRight size={20} color={colors.textMuted} />
            </Pressable>
          </MotiView>

          {/* Pay with USDT */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(1, 60, 80),
            }}
          >
            <Pressable
              onPress={() => {
                // TODO: Open swap modal / USDT flow
                setShowSwapModal(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 16,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: SUCCESS_COLOR,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                  $
                </Text>
              </View>

              {/* Label */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                >
                  Pay with USDT
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Via Camelot DEX {'\u00B7'} No TDS
                </Text>
              </View>

              <ChevronRight size={20} color={colors.textMuted} />
            </Pressable>
          </MotiView>

          {/* Bank Transfer - Coming Soon */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(2, 60, 80),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 16,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                opacity: 0.5,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 18 }}>
                  {'\uD83C\uDFE6'}
                </Text>
              </View>

              {/* Label */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Text style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 15 }}>
                    Bank Transfer
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(184,134,11,0.3)'
                        : 'rgba(184,134,11,0.15)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? '#D4A012' : GOLD_500,
                        fontWeight: '700',
                        fontSize: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      Soon
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  NEFT/RTGS
                </Text>
              </View>
            </View>
          </MotiView>
        </View>

        {/* ── Disclaimers ───────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 300,
          }}
        >
          <View style={{ gap: 12, marginTop: 32 }}>
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(184,134,11,0.08)'
                  : '#FFFBEB',
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(184,134,11,0.15)'
                  : 'rgba(184,134,11,0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#D4A012' : '#92400E',
                  lineHeight: 16,
                }}
              >
                1% TDS deducted on VDA purchases per Section 194S.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(184,134,11,0.08)'
                  : '#FFFBEB',
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(184,134,11,0.15)'
                  : 'rgba(184,134,11,0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#D4A012' : '#92400E',
                  lineHeight: 16,
                }}
              >
                Crypto products are unregulated and risky.
              </Text>
            </View>
          </View>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
