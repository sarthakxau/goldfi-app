import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import { formatINR } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION, staggerDelay } from '@/lib/animations';

interface UpiPaymentScreenProps {
  totalPayable: number;
  selectedApp: 'gpay' | 'manual' | null;
  upiId: string;
  canPay: boolean;
  confirmLoading: boolean;
  onSelectApp: (app: 'gpay' | 'manual') => void;
  onUpiIdChange: (id: string) => void;
  onPay: () => void;
  onBack: () => void;
}

export function UpiPaymentScreen({
  totalPayable,
  selectedApp,
  upiId,
  canPay,
  confirmLoading,
  onSelectApp,
  onUpiIdChange,
  onPay,
  onBack,
}: UpiPaymentScreenProps) {
  const { colors, isDark } = useTheme();
  const [showManualInput, setShowManualInput] = useState(false);
  const GOLD = '#B8860B';

  const handleGpayClick = () => {
    onSelectApp('gpay');
    setShowManualInput(false);
  };

  const handleManualClick = () => {
    onSelectApp('manual');
    setShowManualInput(true);
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
              gap: 16,
              marginBottom: 32,
              marginTop: 8,
            }}
          >
            <Pressable onPress={onBack} hitSlop={12} style={{ padding: 8, marginLeft: -8 }}>
              <ArrowLeft size={24} color={colors.textMuted} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              Pay {formatINR(totalPayable)}
            </Text>
          </View>
        </MotiView>

        {/* Powered by */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(0) }}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
              Powered by
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: GOLD }}>onmeta</Text>
          </View>
        </MotiView>

        {/* Google Pay */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(1) }}
        >
          <Pressable
            onPress={handleGpayClick}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor:
                selectedApp === 'gpay'
                  ? GOLD
                  : isDark
                    ? '#2D2D2D'
                    : '#E5E7EB',
              backgroundColor:
                selectedApp === 'gpay'
                  ? isDark
                    ? 'rgba(184,134,11,0.08)'
                    : 'rgba(184,134,11,0.05)'
                  : isDark
                    ? '#1A1A1A'
                    : '#FFFFFF',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#10B981',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>G Pay</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
              Google Pay
            </Text>
          </Pressable>
        </MotiView>

        {/* Other UPI App */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: staggerDelay(2) }}
        >
          <Pressable
            onPress={handleManualClick}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor:
                selectedApp === 'manual'
                  ? GOLD
                  : isDark
                    ? '#2D2D2D'
                    : '#E5E7EB',
              backgroundColor:
                selectedApp === 'manual'
                  ? isDark
                    ? 'rgba(184,134,11,0.08)'
                    : 'rgba(184,134,11,0.05)'
                  : isDark
                    ? '#1A1A1A'
                    : '#FFFFFF',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>{'\uD83D\uDCB3'}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                Other UPI App
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Enter UPI ID manually
              </Text>
            </View>
          </Pressable>
        </MotiView>

        {/* Manual UPI ID Input */}
        {showManualInput && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing' as const, duration: DURATION.normal }}
            style={{ marginBottom: 20 }}
          >
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
              Enter UPI ID
            </Text>
            <TextInput
              value={upiId}
              onChangeText={onUpiIdChange}
              placeholder="yourname@upi"
              placeholderTextColor={isDark ? '#3D3D3D' : '#9CA3AF'}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.textPrimary,
              }}
            />
          </MotiView>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Pay Button */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 150 }}
        >
          <Pressable
            onPress={onPay}
            disabled={!canPay || confirmLoading}
            style={{
              backgroundColor: GOLD,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              opacity: canPay && !confirmLoading ? 1 : 0.4,
              marginBottom: 16,
            }}
          >
            {confirmLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>
                Pay {formatINR(totalPayable)}
              </Text>
            )}
          </Pressable>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
