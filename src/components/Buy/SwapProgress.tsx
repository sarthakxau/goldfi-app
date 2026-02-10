import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, ExternalLink } from 'lucide-react-native';
import type { SwapStep } from '@/types';
import { useTheme } from '@/lib/theme';
import { SPRING, FADE_UP, DURATION, staggerDelay } from '@/lib/animations';

interface SwapProgressProps {
  step: SwapStep;
  approvalTxHash: string | null;
  swapTxHash: string | null;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

const ARBISCAN_URL = 'https://arbiscan.io/tx/';

export function SwapProgress({
  step,
  approvalTxHash,
  swapTxHash,
  error,
  onClose,
  onRetry,
}: SwapProgressProps) {
  const { colors, isDark } = useTheme();
  const GOLD = '#D4A012';
  const SUCCESS = '#10B981';
  const ERROR = '#EF4444';

  const steps = [
    { key: 'approve', label: 'Approving USDT' },
    { key: 'swap', label: 'Swapping to Gold' },
    { key: 'confirming', label: 'Confirming' },
  ];

  if (step === 'success') {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', ...SPRING.bouncy }}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={32} color={SUCCESS} />
          </View>
        </MotiView>

        <MotiView {...FADE_UP}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Swap Successful!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Your gold has been added to your holdings
          </Text>
        </MotiView>

        {swapTxHash && (
          <Pressable
            onPress={() => Linking.openURL(`${ARBISCAN_URL}${swapTxHash}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 13, color: GOLD }}>View on Arbiscan</Text>
            <ExternalLink size={12} color={GOLD} />
          </Pressable>
        )}

        <Pressable
          onPress={onClose}
          style={{
            width: '100%',
            backgroundColor: colors.textPrimary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 15,
              color: isDark ? '#0F0F0F' : '#FFFFFF',
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'error') {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', ...SPRING.bouncy }}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={32} color={ERROR} />
          </View>
        </MotiView>

        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Swap Failed
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: ERROR,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {error || 'Something went wrong'}
        </Text>

        <View style={{ width: '100%', gap: 12 }}>
          <Pressable
            onPress={onRetry}
            style={{
              backgroundColor: colors.textPrimary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? '#0F0F0F' : '#FFFFFF',
              }}
            >
              Try Again
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={{
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 15,
                color: colors.textSecondary,
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // In-progress steps
  return (
    <View style={{ paddingVertical: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>

      <View style={{ gap: 16 }}>
        {steps.map((s, index) => {
          const stepIndex = steps.findIndex((x) => x.key === step);
          const isActive = s.key === step;
          const isPast = stepIndex > index;

          return (
            <MotiView
              key={s.key}
              from={{ opacity: 0, translateX: -8 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: staggerDelay(index, 80),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPast
                      ? SUCCESS
                      : isActive
                        ? GOLD
                        : isDark
                          ? '#242424'
                          : '#F0F0F0',
                  }}
                >
                  {isPast ? (
                    <Check size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: isActive ? '#FFFFFF' : colors.textMuted,
                      }}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? colors.textPrimary : colors.textMuted,
                  }}
                >
                  {s.label}
                </Text>
                {isActive && <ActivityIndicator size="small" color={GOLD} />}
              </View>
            </MotiView>
          );
        })}
      </View>

      {approvalTxHash && (
        <Pressable
          onPress={() => Linking.openURL(`${ARBISCAN_URL}${approvalTxHash}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 16,
          }}
        >
          <Text style={{ fontSize: 12, color: GOLD }}>View approval tx</Text>
          <ExternalLink size={12} color={GOLD} />
        </Pressable>
      )}
    </View>
  );
}
