import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { router } from 'expo-router';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { authFetchJson } from '@/lib/apiClient';
import { formatINR, formatGrams, debounce } from '@/lib/utils';
import {
  MIN_GRAMS_SELL,
  MAX_GRAMS_SELL,
  QUOTE_REFRESH_INTERVAL,
  GRAMS_PER_OUNCE,
} from '@/lib/constants';
import {
  DURATION,
  FADE_UP,
  SPRING,
} from '@/lib/animations';
import type { SwapStep } from '@/types';

// ── Types ──────────────────────────────────────────────

interface SellQuote {
  xautAmount: string;
  expectedUsdt: string;
  minAmountOut: string;
  slippage: number;
  gasEstimate: string;
  validUntil: string;
}

// ── Constants ──────────────────────────────────────────

const GOLD_500 = '#B8860B';
const SUCCESS_COLOR = '#10B981';
const ERROR_COLOR = '#EF4444';

const PRESET_PERCENTAGES = [25, 50, 75, 100];

// ── Component ──────────────────────────────────────────

export default function SellScreen() {
  const { colors, isDark } = useTheme();
  const { walletAddress } = useAuth();

  // ── Local sell state (replaces useSellSwap for RN) ──
  const [grams, setGrams] = useState('');
  const [xautBalance, setXautBalance] = useState<string | null>(null);
  const [xautBalanceGrams, setXautBalanceGrams] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [quote, setQuote] = useState<SellQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [step, setStep] = useState<SwapStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  // ── Fetch balance ───────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;
    setBalanceLoading(true);
    try {
      const data = await authFetchJson<{ balance: string; balanceGrams: number }>(
        `/api/balance/xaut?address=${walletAddress}`
      );
      if (data.success && data.data) {
        setXautBalance(data.data.balance);
        setXautBalanceGrams(data.data.balanceGrams);
      }
    } catch {
      // Balance fetch failure is non-fatal
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // ── Fetch quote ─────────────────────────────────────
  const fetchQuote = useCallback(async (gramsAmount: string) => {
    if (!gramsAmount || Number(gramsAmount) <= 0) {
      setQuote(null);
      return;
    }
    const xautAmount = (parseFloat(gramsAmount) / GRAMS_PER_OUNCE).toFixed(6);
    setQuoteLoading(true);
    try {
      const data = await authFetchJson<SellQuote>(
        `/api/sell/quote?xautAmount=${xautAmount}`
      );
      if (data.success && data.data) {
        setQuote(data.data);
      } else {
        setError(data.error ?? 'Failed to fetch quote');
      }
    } catch {
      setError('Failed to fetch quote');
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // ── Execute sell (stub -- full Privy embedded wallet swap) ─
  const executeSell = useCallback(async (gramsAmount: string) => {
    if (!walletAddress || !quote) {
      setError('Wallet or quote not available');
      setStep('error');
      return;
    }

    try {
      setError(null);
      setStep('approve');

      // TODO: Integrate Privy Expo embedded wallet for client-side swap
      // For now, simulate the swap flow
      const xautAmount = (parseFloat(gramsAmount) / GRAMS_PER_OUNCE).toFixed(6);

      // Step 1: Approval (stub)
      await new Promise((r) => setTimeout(r, 1500));
      setStep('swap');

      // Step 2: Swap execution (stub)
      await new Promise((r) => setTimeout(r, 1500));
      setStep('confirming');

      // Step 3: Confirming (stub)
      await new Promise((r) => setTimeout(r, 2000));

      // Record transaction
      await authFetchJson('/api/sell/record', {
        method: 'POST',
        body: JSON.stringify({
          xautAmount,
          usdtAmount: quote.expectedUsdt,
          swapTxHash: '0x_stub',
          fromAddress: walletAddress,
        }),
      });

      setStep('success');
      fetchBalance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sell failed';
      setError(msg);
      setStep('error');
    }
  }, [walletAddress, quote, fetchBalance]);

  // ── Reset ───────────────────────────────────────────
  const reset = useCallback(() => {
    setStep('input');
    setQuote(null);
    setError(null);
    setApprovalTxHash(null);
    setSwapTxHash(null);
  }, []);

  // ── Fetch balance on mount ──────────────────────────
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ── Debounced quote fetching ────────────────────────
  const debouncedFetchQuote = useMemo(
    () => debounce((amount: string) => fetchQuote(amount), 500),
    [fetchQuote]
  );

  useEffect(() => {
    if (grams && Number(grams) >= MIN_GRAMS_SELL) {
      debouncedFetchQuote(grams);
    }
  }, [grams, debouncedFetchQuote]);

  // ── Quote refresh interval ──────────────────────────
  useEffect(() => {
    if (step !== 'input' || !grams) return;
    const interval = setInterval(() => {
      if (Number(grams) >= MIN_GRAMS_SELL) {
        fetchQuote(grams);
      }
    }, QUOTE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [step, grams, fetchQuote]);

  // ── Derived state ───────────────────────────────────
  const maxGrams = xautBalanceGrams ?? 0;

  const inputError = useMemo(() => {
    if (!grams) return null;
    const amount = Number(grams);
    if (amount < MIN_GRAMS_SELL) return `Minimum ${MIN_GRAMS_SELL} grams`;
    if (amount > MAX_GRAMS_SELL) return `Maximum ${MAX_GRAMS_SELL} grams`;
    if (amount > maxGrams) return 'Insufficient balance';
    return null;
  }, [grams, maxGrams]);

  const canSell =
    !!grams &&
    Number(grams) >= MIN_GRAMS_SELL &&
    Number(grams) <= maxGrams &&
    !inputError &&
    !quoteLoading &&
    !!quote &&
    step === 'input';

  const handleSell = useCallback(() => {
    if (!grams) return;
    executeSell(grams);
  }, [grams, executeSell]);

  const handleDone = useCallback(() => {
    reset();
    setGrams('');
    router.back();
  }, [reset]);

  const handleRetry = useCallback(() => {
    reset();
    if (grams) executeSell(grams);
  }, [reset, grams, executeSell]);

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  // ── Progress / Success / Error Screen ───────────────
  if (showProgress) {
    return (
      <SafeAreaView
        className="flex-1 bg-surface dark:bg-surface-dark"
        edges={['top']}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Header */}
          <MotiView {...FADE_UP}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 32,
                marginTop: 8,
              }}
            >
              <Pressable
                onPress={() =>
                  step === 'success' || step === 'error'
                    ? handleDone()
                    : undefined
                }
                disabled={step !== 'success' && step !== 'error'}
                hitSlop={12}
                style={{ padding: 8, marginLeft: -8, opacity: step === 'success' || step === 'error' ? 1 : 0.5 }}
              >
                <ArrowLeft size={24} color={colors.textMuted} />
              </Pressable>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginLeft: 8,
                }}
              >
                Selling Gold
              </Text>
            </View>
          </MotiView>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {/* ── Success State ── */}
            {step === 'success' && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <MotiView
                  from={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, ...SPRING.bouncy }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: isDark
                        ? 'rgba(16,185,129,0.1)'
                        : '#D1FAE5',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(16,185,129,0.2)',
                      marginBottom: 24,
                    }}
                  >
                    <CheckCircle size={40} color={SUCCESS_COLOR} />
                  </View>
                </MotiView>

                <MotiView
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: 150,
                  }}
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
                    Sell Successful!
                  </Text>
                </MotiView>

                <MotiView
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: 200,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.textSecondary,
                      marginBottom: 24,
                      textAlign: 'center',
                    }}
                  >
                    You sold {formatGrams(parseFloat(grams))} for ~$
                    {quote?.expectedUsdt} USDT
                  </Text>
                </MotiView>

                {swapTxHash && (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(`https://arbiscan.io/tx/${swapTxHash}`)
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 32,
                    }}
                  >
                    <Text style={{ color: GOLD_500, fontSize: 14 }}>
                      View on Arbiscan
                    </Text>
                    <ExternalLink size={16} color={GOLD_500} />
                  </Pressable>
                )}

                <MotiView
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: 250,
                  }}
                  style={{ width: '100%' }}
                >
                  <Pressable
                    onPress={handleDone}
                    style={{
                      backgroundColor: SUCCESS_COLOR,
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                      Done
                    </Text>
                  </Pressable>
                </MotiView>
              </View>
            )}

            {/* ── Error State ── */}
            {step === 'error' && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <MotiView
                  from={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, ...SPRING.bouncy }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: isDark
                        ? 'rgba(239,68,68,0.1)'
                        : '#FEE2E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(239,68,68,0.2)',
                      marginBottom: 24,
                    }}
                  >
                    <AlertCircle size={40} color={ERROR_COLOR} />
                  </View>
                </MotiView>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Sell Failed
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: ERROR_COLOR,
                    marginBottom: 24,
                    textAlign: 'center',
                  }}
                >
                  {error || 'Something went wrong'}
                </Text>

                <View style={{ gap: 12, width: '100%' }}>
                  <Pressable
                    onPress={handleRetry}
                    style={{
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      Try Again
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleDone}
                    style={{
                      backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      Go Back
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ── Processing States ── */}
            {['approve', 'swap', 'confirming'].includes(step) && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, ...SPRING.gentle }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: isDark
                        ? 'rgba(184,134,11,0.1)'
                        : '#FEF3C7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(184,134,11,0.2)',
                      marginBottom: 24,
                    }}
                  >
                    <ActivityIndicator size="large" color={GOLD_500} />
                  </View>
                </MotiView>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  {step === 'approve' && 'Approving XAUT...'}
                  {step === 'swap' && 'Executing Sell...'}
                  {step === 'confirming' && 'Confirming Transaction...'}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 24,
                    textAlign: 'center',
                  }}
                >
                  {step === 'approve' && 'Please confirm the approval in your wallet'}
                  {step === 'swap' && 'Please confirm the swap in your wallet'}
                  {step === 'confirming' && 'Waiting for blockchain confirmation'}
                </Text>

                {/* Transaction links */}
                <View style={{ gap: 8 }}>
                  {approvalTxHash && (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(
                          `https://arbiscan.io/tx/${approvalTxHash}`
                        )
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text style={{ color: GOLD_500, fontSize: 13 }}>
                        Approval tx
                      </Text>
                      <ExternalLink size={12} color={GOLD_500} />
                    </Pressable>
                  )}
                  {swapTxHash && (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`https://arbiscan.io/tx/${swapTxHash}`)
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text style={{ color: GOLD_500, fontSize: 13 }}>
                        Swap tx
                      </Text>
                      <ExternalLink size={12} color={GOLD_500} />
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Input Screen ───────────────────────────────
  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <MotiView {...FADE_UP}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
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
                marginLeft: 8,
              }}
            >
              Sell Gold
            </Text>
          </View>
        </MotiView>

        {/* ── Available Balance ── */}
        <MotiView
          {...FADE_UP}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 60,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  Available to sell
                </Text>
                {balanceLoading ? (
                  <View
                    style={{
                      width: 96,
                      height: 24,
                      borderRadius: 4,
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: colors.textPrimary,
                    }}
                  >
                    {formatGrams(maxGrams)}
                  </Text>
                )}
                {xautBalance && (
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {parseFloat(xautBalance).toFixed(6)} XAUT
                  </Text>
                )}
              </View>

              <Pressable
                onPress={fetchBalance}
                disabled={balanceLoading}
                hitSlop={8}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                }}
              >
                <RefreshCw
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </View>
        </MotiView>

        {/* ── Amount Input ── */}
        <MotiView
          {...FADE_UP}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 120,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              padding: 24,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: colors.textMuted,
                marginBottom: 8,
              }}
            >
              Enter amount in grams
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={grams}
                onChangeText={setGrams}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={{
                  flex: 1,
                  fontSize: 32,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  paddingVertical: 12,
                  paddingHorizontal: 0,
                }}
              />
              <Text
                style={{
                  fontSize: 20,
                  color: colors.textMuted,
                  marginLeft: 8,
                }}
              >
                g
              </Text>
            </View>

            {/* Input Error */}
            <AnimatePresence>
              {inputError && (
                <MotiView
                  from={{ opacity: 0, translateY: -4 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -4 }}
                  transition={{ type: 'timing' as const, duration: 200 }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 8,
                    }}
                  >
                    <AlertCircle size={12} color={ERROR_COLOR} />
                    <Text style={{ fontSize: 12, color: ERROR_COLOR }}>
                      {inputError}
                    </Text>
                  </View>
                </MotiView>
              )}
            </AnimatePresence>

            {/* Preset Percentages */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {PRESET_PERCENTAGES.map((pct) => (
                <Pressable
                  key={pct}
                  onPress={() => {
                    if (maxGrams === 0) return;
                    const calculated = (maxGrams * pct) / 100;
                    const value =
                      pct === 100
                        ? maxGrams
                        : Math.min(calculated, maxGrams);
                    setGrams(value.toString());
                  }}
                  disabled={maxGrams === 0}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: isDark ? '#0F0F0F' : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                    opacity: maxGrams === 0 ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: colors.textSecondary,
                    }}
                  >
                    {pct}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </MotiView>

        {/* ── Quote Display ── */}
        <AnimatePresence>
          {(quote || quoteLoading) && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 8 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
              }}
            >
              <View
                style={{
                  marginTop: 16,
                  borderRadius: 16,
                  padding: 24,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(184,134,11,0.2)'
                    : 'rgba(184,134,11,0.12)',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: SUCCESS_COLOR,
                    marginBottom: 16,
                  }}
                >
                  You will receive (estimated)
                </Text>

                {quoteLoading ? (
                  <View>
                    <View
                      style={{
                        height: 32,
                        width: 128,
                        backgroundColor: isDark ? '#242424' : '#F0F0F0',
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <View
                      style={{
                        height: 16,
                        width: 96,
                        backgroundColor: isDark ? '#242424' : '#F0F0F0',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                ) : quote ? (
                  <View>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: colors.textPrimary,
                        marginBottom: 4,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      ${quote.expectedUsdt}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textMuted,
                      }}
                    >
                      Min: ${quote.minAmountOut} (with {quote.slippage}%
                      slippage)
                    </Text>

                    {/* Quote details */}
                    <View
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: isDark ? '#2D2D2D' : '#E5E7EB',
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.textMuted }}>
                          Selling
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: colors.textPrimary,
                          }}
                        >
                          {quote.xautAmount} XAUT (
                          {formatGrams(parseFloat(grams))})
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.textMuted }}>
                          Network
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: colors.textPrimary,
                          }}
                        >
                          Arbitrum
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.textMuted }}>
                          Est. Gas
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: colors.textPrimary,
                          }}
                        >
                          {quote.gasEstimate} ETH
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* ── Error Message (input step) ── */}
        <AnimatePresence>
          {error && step === 'input' && (
            <MotiView
              from={{ opacity: 0, translateY: -4 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -4 }}
              transition={{ type: 'timing' as const, duration: 200 }}
            >
              <View
                style={{
                  marginTop: 16,
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: isDark
                    ? 'rgba(239,68,68,0.1)'
                    : '#FEE2E2',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <AlertCircle size={20} color={ERROR_COLOR} style={{ marginTop: 2 }} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: ERROR_COLOR,
                    lineHeight: 18,
                  }}
                >
                  {error}
                </Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* ── Sell Button ── */}
        <MotiView
          {...FADE_UP}
          transition={{
            type: 'timing' as const,
            duration: DURATION.normal,
            delay: 180,
          }}
        >
          <Pressable
            onPress={handleSell}
            disabled={!canSell}
            style={{
              marginTop: 24,
              backgroundColor: canSell
                ? SUCCESS_COLOR
                : isDark
                  ? '#242424'
                  : '#F0F0F0',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {quoteLoading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                  Getting quote...
                </Text>
              </>
            ) : (
              <Text
                style={{
                  color: canSell ? '#FFFFFF' : colors.textMuted,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                Sell for ${quote?.expectedUsdt || '0'} USDT
              </Text>
            )}
          </Pressable>
        </MotiView>

        {/* ── Info ── */}
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 16,
          }}
        >
          Swap powered by Camelot DEX on Arbitrum. USDT will be sent to your
          wallet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
