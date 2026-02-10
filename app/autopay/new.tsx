import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { formatINR } from '@/lib/utils';
import { DURATION } from '@/lib/animations';
import type { AutoPayFrequency } from '@/types';

// ── Constants ─────────────────────────────────────────────

const FREQUENCIES: { key: AutoPayFrequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const FREQUENCY_AMOUNT_LABELS: Record<AutoPayFrequency, string> = {
  daily: 'Amount Per Daily Instalment',
  weekly: 'Amount Per Weekly Instalment',
  biweekly: 'Amount Per Bi-Weekly Instalment',
  monthly: 'Amount Per Monthly Instalment',
};

// ── Main Screen ───────────────────────────────────────────

export default function NewAutoPayScreen() {
  const { isDark, colors } = useTheme();
  const GOLD_500 = '#B8860B';
  const GOLD_400 = '#D4A012';

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [amountText, setAmountText] = useState('');
  const [frequency, setFrequency] = useState<AutoPayFrequency>('monthly');
  const [startOption, setStartOption] = useState<'immediate' | 'choose'>('immediate');
  const [creating, setCreating] = useState(false);

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const isValid = name.trim().length > 0 && amount >= 100;

  function handleAmountChange(text: string) {
    setAmountText(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      setAmount(parsed);
      if (parsed < 100) {
        setAmountError('Minimum amount is \u20B9100');
      } else {
        setAmountError('');
      }
    } else if (text === '') {
      setAmount(0);
      setAmountError('');
    }
  }

  function handleQuickAmount(value: number) {
    setAmount(value);
    setAmountText(value.toString());
    setAmountError('');
  }

  function handleNameChange(text: string) {
    setName(text);
    if (text.trim().length === 0 && text.length > 0) {
      setNameError('AutoPay name is required');
    } else {
      setNameError('');
    }
  }

  async function handleSubmit() {
    if (!isValid) return;

    // Validate
    if (!name.trim()) {
      setNameError('AutoPay name is required');
      return;
    }
    if (amount < 100) {
      setAmountError('Minimum amount is \u20B9100');
      return;
    }

    setCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setCreating(false);
    Alert.alert('AutoPay Created', `"${name.trim()}" has been set up successfully.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
              marginBottom: 32,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
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
              New Gold AutoPay
            </Text>
          </View>
        </MotiView>

        {/* AutoPay Name */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 60,
          }}
        >
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.textMuted,
                marginBottom: 12,
              }}
            >
              AutoPay Name
            </Text>
            <TextInput
              placeholder="e.g. Monthly Savings"
              placeholderTextColor={isDark ? '#4B5563' : colors.textMuted}
              value={name}
              onChangeText={handleNameChange}
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: nameError
                  ? '#EF4444'
                  : isDark
                    ? '#2D2D2D'
                    : '#E5E7EB',
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.textPrimary,
              }}
            />
            {nameError ? (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                {nameError}
              </Text>
            ) : null}
          </View>
        </MotiView>

        {/* Amount */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 120,
          }}
        >
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.textMuted,
                marginBottom: 12,
              }}
            >
              {FREQUENCY_AMOUNT_LABELS[frequency]}
            </Text>

            {/* Amount Input */}
            <View
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: amountError
                  ? '#EF4444'
                  : isDark
                    ? '#2D2D2D'
                    : '#E5E7EB',
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: colors.textMuted,
                }}
              >
                {'\u20B9'}
              </Text>
              <TextInput
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={isDark ? '#4B5563' : colors.textMuted}
                value={amountText}
                onChangeText={handleAmountChange}
                style={{
                  flex: 1,
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.textPrimary,
                }}
              />
            </View>

            {amountError ? (
              <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 8 }}>
                {amountError}
              </Text>
            ) : null}

            {/* Quick amounts */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {QUICK_AMOUNTS.map((qa) => (
                <Pressable
                  key={qa}
                  onPress={() => handleQuickAmount(qa)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    backgroundColor:
                      amount === qa
                        ? 'rgba(184,134,11,0.1)'
                        : isDark
                          ? '#1A1A1A'
                          : '#FFFFFF',
                    borderColor:
                      amount === qa
                        ? 'rgba(184,134,11,0.3)'
                        : isDark
                          ? '#2D2D2D'
                          : '#E5E7EB',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color:
                        amount === qa
                          ? isDark
                            ? GOLD_400
                            : GOLD_500
                          : isDark
                            ? '#D1D5DB'
                            : colors.textPrimary,
                    }}
                  >
                    {'\u20B9'}{qa.toLocaleString('en-IN')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Frequency */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 180,
          }}
        >
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.textMuted,
                marginBottom: 12,
              }}
            >
              Frequency
            </Text>
            <View
              style={{
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderRadius: 16,
                padding: 4,
                flexDirection: 'row',
              }}
            >
              {FREQUENCIES.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setFrequency(key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor:
                      frequency === key
                        ? isDark
                          ? '#1A1A1A'
                          : '#FFFFFF'
                        : 'transparent',
                    ...(frequency === key
                      ? {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.08,
                          shadowRadius: 2,
                          elevation: 1,
                        }
                      : {}),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color:
                        frequency === key
                          ? colors.textPrimary
                          : colors.textMuted,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Start Date */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 240,
          }}
        >
          <View style={{ marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.textMuted,
                marginBottom: 12,
              }}
            >
              Start Date
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setStartOption('immediate')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor:
                    startOption === 'immediate'
                      ? 'rgba(184,134,11,0.1)'
                      : isDark
                        ? '#242424'
                        : '#F0F0F0',
                  borderColor:
                    startOption === 'immediate'
                      ? 'rgba(184,134,11,0.3)'
                      : isDark
                        ? '#2D2D2D'
                        : '#E5E7EB',
                }}
              >
                <Sparkles
                  size={16}
                  color={
                    startOption === 'immediate'
                      ? GOLD_500
                      : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color:
                      startOption === 'immediate'
                        ? GOLD_500
                        : colors.textSecondary,
                  }}
                >
                  Start immediately
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setStartOption('choose')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor:
                    startOption === 'choose'
                      ? 'rgba(184,134,11,0.1)'
                      : isDark
                        ? '#242424'
                        : '#F0F0F0',
                  borderColor:
                    startOption === 'choose'
                      ? 'rgba(184,134,11,0.3)'
                      : isDark
                        ? '#2D2D2D'
                        : '#E5E7EB',
                }}
              >
                <Calendar
                  size={16}
                  color={
                    startOption === 'choose'
                      ? GOLD_500
                      : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color:
                      startOption === 'choose'
                        ? GOLD_500
                        : colors.textSecondary,
                  }}
                >
                  Choose date
                </Text>
              </Pressable>
            </View>

            {startOption === 'choose' && (
              <MotiView
                from={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.fast,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginTop: 12,
                    textAlign: 'center',
                  }}
                >
                  Date picker coming soon. Starts immediately for now.
                </Text>
              </MotiView>
            )}
          </View>
        </MotiView>

        {/* Submit Button */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 300,
          }}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || creating}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: isValid ? GOLD_500 : isDark ? '#242424' : '#F0F0F0',
              borderWidth: isValid ? 0 : 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? (
              <ActivityIndicator size="small" color={isValid ? '#1A1A1A' : colors.textMuted} />
            ) : (
              <>
                <Sparkles size={20} color={isValid ? '#1A1A1A' : colors.textMuted} />
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 16,
                    color: isValid ? '#1A1A1A' : colors.textMuted,
                  }}
                >
                  Start AutoPay
                </Text>
              </>
            )}
          </Pressable>

          {/* Disclaimer */}
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 18,
            }}
          >
            AutoPay investments are subject to market risk. Returns are not guaranteed.
            Gold.fi is regulated by applicable Indian financial authorities.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
