import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import * as Clipboard from 'expo-clipboard';
import { X, ArrowDown, AlertCircle, Copy, Check } from 'lucide-react-native';
import { useSwap } from '@/hooks/useSwap';
import { BalanceDisplay } from './BalanceDisplay';
import { SwapQuoteDisplay } from './SwapQuote';
import { SwapProgress } from './SwapProgress';
import { MIN_USDT_SWAP, MAX_USDT_SWAP, QUOTE_REFRESH_INTERVAL } from '@/lib/constants';
import { debounce, truncateAddress } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION } from '@/lib/animations';

interface SwapModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SwapModal({ visible, onClose }: SwapModalProps) {
  const { colors, isDark } = useTheme();
  const [inputAmount, setInputAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const GOLD = '#D4A012';

  const {
    walletAddress,
    usdtBalance,
    balanceLoading,
    quote,
    quoteLoading,
    step,
    error,
    approvalTxHash,
    swapTxHash,
    fetchBalance,
    fetchQuote,
    executeSwap,
    reset,
  } = useSwap();

  const handleCopyAddress = useCallback(async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletAddress]);

  // Debounced quote fetch
  const debouncedFetchQuote = useMemo(
    () => debounce((amount: string) => fetchQuote(amount), 500),
    [fetchQuote]
  );

  // Fetch quote when input changes
  useEffect(() => {
    if (inputAmount && Number(inputAmount) >= MIN_USDT_SWAP) {
      debouncedFetchQuote(inputAmount);
    }
  }, [inputAmount, debouncedFetchQuote]);

  // Auto-refresh quote
  useEffect(() => {
    if (!visible || step !== 'input' || !inputAmount) return;
    const interval = setInterval(() => {
      if (Number(inputAmount) >= MIN_USDT_SWAP) {
        fetchQuote(inputAmount);
      }
    }, QUOTE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [visible, step, inputAmount, fetchQuote]);

  const handleClose = useCallback(() => {
    reset();
    setInputAmount('');
    onClose();
  }, [reset, onClose]);

  const handleMaxClick = useCallback(() => {
    if (usdtBalance) {
      const maxAmount = Math.min(parseFloat(usdtBalance), MAX_USDT_SWAP);
      setInputAmount(maxAmount.toString());
    }
  }, [usdtBalance]);

  const handleSwap = useCallback(() => {
    if (!inputAmount) return;
    executeSwap(inputAmount);
  }, [inputAmount, executeSwap]);

  const inputError = useMemo(() => {
    if (!inputAmount) return null;
    const amount = Number(inputAmount);
    if (amount < MIN_USDT_SWAP) return `Minimum ${MIN_USDT_SWAP} USDT`;
    if (amount > MAX_USDT_SWAP) return `Maximum ${MAX_USDT_SWAP} USDT`;
    if (usdtBalance && amount > Number(usdtBalance)) return 'Insufficient balance';
    return null;
  }, [inputAmount, usdtBalance]);

  const canSwap = inputAmount && !inputError && !quoteLoading && step === 'input';

  const showProgress = ['approve', 'swap', 'confirming', 'success', 'error'].includes(step);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={step === 'input' ? handleClose : undefined}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        {/* Backdrop tap to close (only when input step) */}
        {step === 'input' && (
          <Pressable
            style={{ flex: 1 }}
            onPress={handleClose}
          />
        )}

        {/* Modal Content */}
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
              maxHeight: '90%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={handleClose}
                disabled={showProgress && step !== 'success' && step !== 'error'}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <X size={24} color={colors.textMuted} />
              </Pressable>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                }}
              >
                Swap USDT to Gold
              </Text>
              <View style={{ width: 32 }} />
            </View>

            {showProgress ? (
              <SwapProgress
                step={step}
                approvalTxHash={approvalTxHash}
                swapTxHash={swapTxHash}
                error={error}
                onClose={handleClose}
                onRetry={() => {
                  reset();
                  handleSwap();
                }}
              />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Wallet Address */}
                {walletAddress && (
                  <MotiView {...FADE_UP}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isDark
                          ? 'rgba(212,160,18,0.05)'
                          : 'rgba(184,134,11,0.04)',
                        borderWidth: 1,
                        borderColor: isDark
                          ? 'rgba(212,160,18,0.15)'
                          : 'rgba(184,134,11,0.12)',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 11, color: GOLD, marginBottom: 2 }}>
                          Your wallet (Arbitrum)
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: colors.textPrimary,
                          }}
                        >
                          {truncateAddress(walletAddress)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={handleCopyAddress}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: isDark ? '#242424' : '#FFFFFF',
                          borderWidth: 1,
                          borderColor: isDark
                            ? 'rgba(212,160,18,0.15)'
                            : 'rgba(184,134,11,0.12)',
                        }}
                      >
                        {copied ? (
                          <>
                            <Check size={14} color="#10B981" />
                            <Text style={{ fontSize: 11, fontWeight: '500', color: '#10B981' }}>
                              Copied!
                            </Text>
                          </>
                        ) : (
                          <>
                            <Copy size={14} color={GOLD} />
                            <Text style={{ fontSize: 11, fontWeight: '500', color: GOLD }}>
                              Copy
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </MotiView>
                )}

                {/* Balance */}
                <BalanceDisplay
                  balance={usdtBalance}
                  loading={balanceLoading}
                  onRefresh={fetchBalance}
                />

                {/* Input */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
                    You pay
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TextInput
                      keyboardType="decimal-pad"
                      value={inputAmount}
                      onChangeText={setInputAmount}
                      placeholder="0.00"
                      placeholderTextColor={isDark ? '#3D3D3D' : '#9CA3AF'}
                      style={{
                        flex: 1,
                        fontSize: 24,
                        fontWeight: '700',
                        color: colors.textPrimary,
                        padding: 0,
                      }}
                    />
                    <Pressable onPress={handleMaxClick} style={{ marginRight: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: GOLD }}>MAX</Text>
                    </Pressable>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textMuted }}>
                      USDT
                    </Text>
                  </View>
                  {inputError && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 8,
                      }}
                    >
                      <AlertCircle size={12} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: '#EF4444' }}>{inputError}</Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowDown size={20} color={colors.textMuted} />
                  </View>
                </View>

                {/* Quote */}
                <SwapQuoteDisplay quote={quote} loading={quoteLoading} />

                {/* Swap Button */}
                <Pressable
                  onPress={handleSwap}
                  disabled={!canSwap}
                  style={{
                    backgroundColor: '#10B981',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: canSwap ? 1 : 0.5,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                    {quoteLoading ? 'Getting quote...' : 'Swap to Gold'}
                  </Text>
                </Pressable>

                {/* Info */}
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    textAlign: 'center',
                    marginTop: 16,
                  }}
                >
                  Swap powered by Camelot DEX on Arbitrum
                </Text>
              </ScrollView>
            )}
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
