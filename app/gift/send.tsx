import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Gift,
  CheckCircle,
  AlertCircle,
  Search,
  User,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams } from '@/lib/utils';
import { DURATION, FADE_UP, SCALE_IN, staggerDelay } from '@/lib/animations';
import { GIFT_PRESET_INR, calculateGramsFromInr } from '@/lib/giftData';
import type { GiftOccasion, GiftLookupResult, GoldPrice } from '@/types';

type PageStep = 'details' | 'confirm' | 'sending' | 'success' | 'error';

const GOLD_500 = '#B8860B';
const GOLD_100 = '#FFF0C2';

const OCCASIONS: { label: GiftOccasion; emoji: string }[] = [
  { label: 'Birthday', emoji: '🎂' },
  { label: 'Wedding', emoji: '💍' },
  { label: 'Festival', emoji: '🪔' },
  { label: 'Thank You', emoji: '🙏' },
  { label: 'Just Because', emoji: '💛' },
  { label: 'Anniversary', emoji: '🥂' },
];

export default function GiftSendScreen() {
  const { colors, isDark } = useTheme();
  const { walletAddress } = useAuth();

  const [pageStep, setPageStep] = useState<PageStep>('details');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [occasion, setOccasion] = useState<GiftOccasion>('Birthday');
  const [message, setMessage] = useState('');

  // Lookup state
  const [lookupResult, setLookupResult] = useState<GiftLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [recipientResolved, setRecipientResolved] = useState(false);

  // Price state
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const pricePerGram = goldPrice?.pricePerGramInr ?? 7500;
  const gramsAmount = calculateGramsFromInr(selectedAmount, pricePerGram);

  // Fetch gold price on mount
  useEffect(() => {
    authFetchJson<GoldPrice>('/api/prices').then((res) => {
      if (res.success && res.data) {
        setGoldPrice(res.data);
      }
    });
  }, []);

  // Email validation
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
  const isFormReady = recipientResolved && selectedAmount >= 100 && isValidEmail;

  // Lookup recipient
  const handleLookup = useCallback(async () => {
    if (!isValidEmail) return;

    setLookupLoading(true);
    setError(null);
    try {
      const { success, data, error: apiError } = await authFetchJson<GiftLookupResult>(
        `/api/gift/lookup?email=${encodeURIComponent(recipientEmail)}`
      );

      if (!success || !data) {
        throw new Error(apiError || 'Lookup failed');
      }

      setLookupResult(data);

      if (data.found) {
        setRecipientResolved(true);
      } else {
        // Show alert for non-user flow
        Alert.alert(
          'User not found',
          `${recipientEmail} is not on Bullion yet. They will receive an email to claim the gift.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send anyway',
              onPress: () => setRecipientResolved(true),
            },
          ]
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lookup failed';
      setError(msg);
    } finally {
      setLookupLoading(false);
    }
  }, [recipientEmail, isValidEmail]);

  // Amount selection
  const handleAmountSelect = (inr: number) => {
    setSelectedAmount(inr);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const num = Number(value);
    if (num > 0) {
      setSelectedAmount(num);
    }
  };

  // Send gift
  const handleSend = async () => {
    setPageStep('sending');
    setError(null);

    try {
      const xautOunces = gramsAmount / 31.1035;

      const { success, error: apiError } = await authFetchJson<{
        gift: { id: string };
        claimUrl?: string;
      }>('/api/gift/send', {
        method: 'POST',
        body: JSON.stringify({
          recipientEmail,
          recipientFound: lookupResult?.found ?? false,
          recipientUserId: lookupResult?.user?.id || null,
          inrAmount: selectedAmount,
          gramsAmount,
          xautAmount: xautOunces,
          goldPriceInr: pricePerGram,
          occasion,
          message: message || undefined,
          paymentMethod: 'wallet',
          txHash: '', // Server handles escrow for mobile flow
        }),
      });

      if (!success) {
        throw new Error(apiError || 'Failed to send gift');
      }

      setPageStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gift sending failed';
      setError(msg);
      setPageStep('error');
    }
  };

  // Reset
  const handleReset = () => {
    setPageStep('details');
    setRecipientEmail('');
    setSelectedAmount(500);
    setCustomAmount('');
    setOccasion('Birthday');
    setMessage('');
    setLookupResult(null);
    setRecipientResolved(false);
    setError(null);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView {...FADE_UP}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
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
                Send Gold Gift
              </Text>
            </View>
          </MotiView>

          {/* ──────── STEP 1: Gift Details ──────── */}
          {pageStep === 'details' && (
            <>
              {/* Recipient Email */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 60 }}
              >
                <Text style={sectionLabel(colors)}>Recipient</Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: recipientResolved
                      ? 'rgba(16,185,129,0.3)'
                      : colors.borderSubtle,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <TextInput
                    placeholder="friend@example.com"
                    placeholderTextColor={colors.textMuted}
                    value={recipientEmail}
                    onChangeText={(val) => {
                      setRecipientEmail(val);
                      setRecipientResolved(false);
                      setLookupResult(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 15,
                      color: colors.textPrimary,
                    }}
                  />
                  {recipientResolved ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Pressable
                      onPress={handleLookup}
                      disabled={!isValidEmail || lookupLoading}
                      hitSlop={8}
                      style={{ opacity: isValidEmail ? 1 : 0.4 }}
                    >
                      {lookupLoading ? (
                        <ActivityIndicator size="small" color={GOLD_500} />
                      ) : (
                        <Search size={20} color={GOLD_500} />
                      )}
                    </Pressable>
                  )}
                </View>

                {recipientResolved && lookupResult && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <User size={12} color={lookupResult.found ? '#10B981' : GOLD_500} />
                    <Text
                      style={{
                        fontSize: 12,
                        color: lookupResult.found ? '#10B981' : GOLD_500,
                      }}
                    >
                      {lookupResult.found ? 'Existing user' : 'Will receive via email'}
                    </Text>
                  </View>
                )}

                {error && pageStep === 'details' && (
                  <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>
                    {error}
                  </Text>
                )}
              </MotiView>

              {/* Amount Selection */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 120 }}
              >
                <Text style={[sectionLabel(colors), { marginTop: 20 }]}>Amount</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  {GIFT_PRESET_INR.map((inr) => {
                    const isSelected = selectedAmount === inr && !customAmount;
                    return (
                      <Pressable
                        key={inr}
                        onPress={() => handleAmountSelect(inr)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? GOLD_500
                            : colors.borderSubtle,
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(184,134,11,0.15)'
                              : GOLD_100
                            : colors.card,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: isSelected ? GOLD_500 : colors.textPrimary,
                          }}
                        >
                          {formatINR(inr)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  placeholder="Or enter custom amount"
                  placeholderTextColor={colors.textMuted}
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    fontSize: 15,
                    color: colors.textPrimary,
                    marginBottom: 4,
                  }}
                />

                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginTop: 4,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatGrams(gramsAmount)} of gold
                </Text>
              </MotiView>

              {/* Occasion */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 180 }}
              >
                <Text style={[sectionLabel(colors), { marginTop: 20 }]}>Occasion</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {OCCASIONS.map(({ label, emoji }) => {
                    const isSelected = occasion === label;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => setOccasion(label)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: isSelected ? GOLD_500 : colors.borderSubtle,
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(184,134,11,0.15)'
                              : GOLD_100
                            : colors.card,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{emoji}</Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: isSelected ? GOLD_500 : colors.textSecondary,
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </MotiView>

              {/* Personal Message */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 240 }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                >
                  <Text style={sectionLabel(colors)}>Personal Message</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {message.length}/100
                  </Text>
                </View>

                <TextInput
                  placeholder="Add a personal note (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={(val) => setMessage(val.slice(0, 100))}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    fontSize: 15,
                    color: colors.textPrimary,
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                />
              </MotiView>

              {/* Gift Preview Card */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 300 }}
              >
                <Text style={[sectionLabel(colors), { marginTop: 20 }]}>
                  Gift Preview
                </Text>

                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: isDark
                      ? 'rgba(184,134,11,0.2)'
                      : 'rgba(184,134,11,0.15)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>
                    {OCCASIONS.find((o) => o.label === occasion)?.emoji || '🎁'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '700',
                      color: GOLD_500,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatGrams(gramsAmount)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginTop: 4,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    Worth {formatINR(selectedAmount)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {occasion}
                  </Text>
                </View>
              </MotiView>

              {/* Continue Button */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 360 }}
              >
                <Pressable
                  onPress={() => setPageStep('confirm')}
                  disabled={!isFormReady}
                  style={{
                    backgroundColor: GOLD_500,
                    borderRadius: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 24,
                    opacity: isFormReady ? 1 : 0.5,
                  }}
                >
                  <Send size={18} color="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                    Continue {'\u00B7'} {formatINR(selectedAmount)}
                  </Text>
                </Pressable>
              </MotiView>

              {/* Disclaimer */}
              <MotiView
                {...FADE_UP}
                transition={{ type: 'timing', duration: DURATION.normal, delay: 400 }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    textAlign: 'center',
                    lineHeight: 16,
                    marginTop: 16,
                  }}
                >
                  Gold gifts are subject to market price fluctuations. Gift gold
                  is not a fixed-return instrument. Platform charges and GST apply.
                </Text>
              </MotiView>
            </>
          )}

          {/* ──────── STEP 2: Confirm ──────── */}
          {pageStep === 'confirm' && (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: DURATION.normal }}
            >
              <Text style={[sectionLabel(colors), { marginTop: 8 }]}>
                Gift Summary
              </Text>

              {/* Summary Card */}
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  marginBottom: 16,
                }}
              >
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>
                    {OCCASIONS.find((o) => o.label === occasion)?.emoji || '🎁'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '700',
                      color: GOLD_500,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatGrams(gramsAmount)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    Worth {formatINR(selectedAmount)}
                  </Text>
                </View>

                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSubtle,
                    paddingTop: 16,
                    gap: 10,
                  }}
                >
                  <SummaryRow label="To" value={recipientEmail} colors={colors} />
                  <SummaryRow label="Occasion" value={occasion} colors={colors} />
                  {message ? (
                    <SummaryRow label="Message" value={message} colors={colors} />
                  ) : null}
                  <SummaryRow
                    label="Recipient status"
                    value={lookupResult?.found ? 'Existing user' : 'Via email'}
                    colors={colors}
                    valueColor={lookupResult?.found ? '#10B981' : GOLD_500}
                  />
                </View>
              </View>

              {/* Confirm Button */}
              <Pressable
                onPress={handleSend}
                style={{
                  backgroundColor: GOLD_500,
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Gift size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                  Send Gift
                </Text>
              </Pressable>

              {/* Back */}
              <Pressable
                onPress={() => setPageStep('details')}
                style={{
                  alignItems: 'center',
                  paddingVertical: 14,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
                  Back to details
                </Text>
              </Pressable>
            </MotiView>
          )}

          {/* ──────── Sending ──────── */}
          {pageStep === 'sending' && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: DURATION.normal }}
            >
              <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                <ActivityIndicator size="large" color={GOLD_500} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginTop: 16,
                  }}
                >
                  Sending your gift...
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  This may take a moment
                </Text>
              </View>
            </MotiView>
          )}

          {/* ──────── Success ──────── */}
          {pageStep === 'success' && (
            <MotiView {...SCALE_IN}>
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <CheckCircle size={40} color="#10B981" />
                </View>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  Gift sent!
                </Text>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: GOLD_500,
                    fontVariant: ['tabular-nums'],
                    marginBottom: 4,
                  }}
                >
                  {formatGrams(gramsAmount)} gold
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Worth {formatINR(selectedAmount)}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    marginBottom: 32,
                  }}
                >
                  Sent to {recipientEmail}
                </Text>

                <Pressable
                  onPress={() => router.push('/gift')}
                  style={{
                    backgroundColor: GOLD_500,
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 40,
                    marginBottom: 12,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                    View Gifts
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleReset}
                  style={{ paddingVertical: 12 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: GOLD_500 }}>
                    Send another gift
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          )}

          {/* ──────── Error ──────── */}
          {pageStep === 'error' && (
            <MotiView {...FADE_UP}>
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
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
                  Couldn't send gift
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginBottom: 32,
                    paddingHorizontal: 20,
                  }}
                >
                  {error || 'Something went wrong. Please try again.'}
                </Text>

                <Pressable
                  onPress={() => setPageStep('confirm')}
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
              </View>
            </MotiView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Helpers ──────────────────────────────────────────────

function sectionLabel(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    fontSize: 11 as const,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
    marginBottom: 10,
  };
}

function SummaryRow({
  label,
  value,
  colors,
  valueColor,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: colors.textMuted }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: valueColor || colors.textPrimary,
          flexShrink: 1,
          textAlign: 'right',
          maxWidth: '60%',
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
