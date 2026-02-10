import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useLocalSearchParams, router } from 'expo-router';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams } from '@/lib/utils';
import { DURATION, FADE_UP, SCALE_IN } from '@/lib/animations';

type ClaimState = 'loading' | 'preview' | 'claiming' | 'success' | 'error';

const GOLD_500 = '#B8860B';
const GOLD_100 = '#FFF0C2';

interface GiftInfo {
  gramsAmount: number;
  inrAmount: number;
  occasion: string;
  message?: string;
  senderEmail?: string;
}

export default function GiftClaimScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isReady } = useAuth();

  const [state, setState] = useState<ClaimState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [giftInfo, setGiftInfo] = useState<GiftInfo | null>(null);

  // Check auth and set initial state
  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      // Redirect to login, then they'll come back
      router.replace('/(auth)/login');
    } else {
      setState('preview');
    }
  }, [isReady, isAuthenticated]);

  const handleClaim = async () => {
    setState('claiming');
    setError(null);

    try {
      const { success, data, error: apiError } = await authFetchJson<{
        gift: {
          grams_amount: number;
          inr_amount: number;
          occasion: string;
          message?: string;
        };
        txHash: string;
      }>('/api/gift/claim', {
        method: 'POST',
        body: JSON.stringify({ claimToken: token }),
      });

      if (!success) {
        throw new Error(apiError || 'Failed to claim gift');
      }

      if (data?.gift) {
        setGiftInfo({
          gramsAmount: Number(data.gift.grams_amount),
          inrAmount: Number(data.gift.inr_amount),
          occasion: data.gift.occasion,
          message: data.gift.message || undefined,
        });
      }

      setState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to claim gift';
      setError(msg);
      setState('error');
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
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
        {/* Loading */}
        {state === 'loading' && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: DURATION.normal }}
          >
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={GOLD_500} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  marginTop: 16,
                }}
              >
                Loading gift...
              </Text>
            </View>
          </MotiView>
        )}

        {/* Preview - Ready to Claim */}
        {state === 'preview' && (
          <MotiView {...FADE_UP} style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Gift size={40} color={GOLD_500} />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              You've received gold!
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 20,
              }}
            >
              Someone sent you a gold gift. Claim it to add it to your vault.
            </Text>

            <Pressable
              onPress={handleClaim}
              style={{
                backgroundColor: GOLD_500,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
              }}
            >
              <Gift size={20} color="#FFFFFF" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                Claim Gold
              </Text>
            </Pressable>
          </MotiView>
        )}

        {/* Claiming */}
        {state === 'claiming' && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: DURATION.normal }}
          >
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={GOLD_500} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginTop: 16,
                }}
              >
                Claiming your gold...
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 4,
                }}
              >
                This may take a moment while we transfer it to your wallet.
              </Text>
            </View>
          </MotiView>
        )}

        {/* Success */}
        {state === 'success' && (
          <MotiView {...SCALE_IN} style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(16,185,129,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <CheckCircle size={40} color="#10B981" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 12,
              }}
            >
              Gold claimed!
            </Text>

            {giftInfo && (
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 150 }}
              >
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '700',
                      color: GOLD_500,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatGrams(giftInfo.gramsAmount)} gold
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      marginTop: 4,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    Worth {formatINR(giftInfo.inrAmount)}
                  </Text>
                  {giftInfo.message ? (
                    <View
                      style={{
                        backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                        borderRadius: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        marginTop: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}
                      >
                        "{giftInfo.message}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              </MotiView>
            )}

            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: DURATION.normal, delay: 250 }}
              style={{ width: '100%' }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 32,
                  marginTop: 8,
                }}
              >
                The gold has been added to your vault.
              </Text>

              <Pressable
                onPress={() => router.replace('/(tabs)')}
                style={{
                  backgroundColor: GOLD_500,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                  Go to Dashboard
                </Text>
              </Pressable>
            </MotiView>
          </MotiView>
        )}

        {/* Error */}
        {state === 'error' && (
          <MotiView {...FADE_UP} style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(239,68,68,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <AlertCircle size={40} color="#EF4444" />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 8,
              }}
            >
              Couldn't claim gift
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 32,
                paddingHorizontal: 12,
              }}
            >
              {error || 'Something went wrong. Please try again.'}
            </Text>

            <Pressable
              onPress={() => setState('preview')}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                Try again
              </Text>
            </Pressable>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}
