import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import Svg, {
  Path,
  Line,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import Constants from 'expo-constants';
import {
  FADE_UP,
  SCALE_IN,
  DURATION,
} from '@/lib/animations';
import { TERMS_AND_CONDITIONS } from '@/lib/copy';
import { useAuth } from '@/lib/auth-provider';
import { useTheme } from '@/lib/theme';
import { formatINR } from '@/lib/utils';
import { APP } from '@/lib/constants';
import { Check, CheckCircle } from 'lucide-react-native';

type LoginStep = 'onboarding' | 'email' | 'code';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_ADVANCE_MS = 5000;
const SLIDE_COUNT = 4;

const API_BASE =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  '';

const GOLD = '#B8860B';
const GOLD_LIGHT = '#D4A012';
const SUCCESS = '#10B981';

const FEATURES = [
  'pure 24K gold',
  'gold yield (variable rates, risks apply)',
  'backed by Swiss reserves',
  'withdraw anytime, with zero limits',
];

// ── SVG Illustrations ─────────────────────────────────────────

function ChartIllustration({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
        borderRadius: 16,
        padding: 20,
        width: '100%',
      }}
    >
      <Text style={{ fontSize: 12, color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: 4 }}>
        1 year gold price performance
      </Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: SUCCESS, marginBottom: 2 }}>
        gold yield
      </Text>
      <Text style={{ fontSize: 14, color: GOLD }}>
        variable rates, risks apply
      </Text>
      <Svg viewBox="0 0 300 120" width="100%" height={100} style={{ marginTop: 16 }}>
        <Line x1="0" y1="30" x2="300" y2="30" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        <Line x1="0" y1="60" x2="300" y2="60" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        <Line x1="0" y1="90" x2="300" y2="90" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        <Defs>
          <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={GOLD} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path
          d="M0,95 C30,90 50,85 80,78 C110,71 130,60 160,45 C190,30 210,35 230,25 C250,15 270,18 300,10 L300,120 L0,120 Z"
          fill="url(#chartFill)"
        />
        <Path
          d="M0,95 C30,90 50,85 80,78 C110,71 130,60 160,45 C190,30 210,35 230,25 C250,15 270,18 300,10"
          stroke={GOLD}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="300" cy="10" r="4" fill={GOLD} />
        <Circle cx="300" cy="10" r="7" fill={GOLD} fillOpacity={0.2} />
      </Svg>
    </View>
  );
}

function ChatIllustration({ isDark }: { isDark: boolean }) {
  return (
    <View style={{ width: '100%', gap: 12, paddingHorizontal: 8 }}>
      {/* Sent bubble */}
      <View style={{ alignItems: 'flex-start' }}>
        <View
          style={{
            backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FEF3C7',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(184,134,11,0.3)' : 'rgba(184,134,11,0.2)',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxWidth: '75%',
          }}
        >
          <Text style={{ color: isDark ? GOLD_LIGHT : '#92400E', fontSize: 14, fontWeight: '500' }}>
            happy birthday beta!
          </Text>
        </View>
      </View>
      {/* Notification bubble */}
      <View style={{ alignItems: 'flex-start' }}>
        <View
          style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxWidth: '80%',
          }}
        >
          <Text style={{ color: SUCCESS, fontSize: 14, fontWeight: '500' }}>
            sent you 0.3g gold{'\n'}(INR 4878.6) on gold.fi
          </Text>
        </View>
      </View>
      {/* Reply bubble */}
      <View style={{ alignItems: 'flex-end' }}>
        <View
          style={{
            backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE',
            borderRadius: 16,
            borderTopRightRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxWidth: '75%',
          }}
        >
          <Text style={{ color: isDark ? '#60A5FA' : '#2563EB', fontSize: 14, fontWeight: '500' }}>
            omggg thanku appa
          </Text>
        </View>
      </View>
    </View>
  );
}

function MapIllustration({ isDark }: { isDark: boolean }) {
  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          backgroundColor: isDark ? '#3A6B8A' : '#7DB4D8',
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: 4 / 3,
          position: 'relative',
        }}
      >
        <Svg viewBox="0 0 300 225" width="100%" height="100%" style={{ position: 'absolute' }}>
          <Rect x="20" y="20" width="60" height="80" rx="6" fill={GOLD} fillOpacity={0.25} />
          <Rect x="100" y="15" width="50" height="90" rx="6" fill={GOLD} fillOpacity={0.2} />
          <Rect x="170" y="25" width="55" height="75" rx="6" fill={GOLD} fillOpacity={0.22} />
          <Rect x="245" y="20" width="40" height="85" rx="6" fill={GOLD} fillOpacity={0.15} />
          <Rect x="30" y="130" width="70" height="70" rx="6" fill={GOLD} fillOpacity={0.22} />
          <Rect x="120" y="125" width="60" height="75" rx="6" fill={GOLD} fillOpacity={0.2} />
          <Rect x="200" y="135" width="50" height="65" rx="6" fill={GOLD} fillOpacity={0.25} />
          <Rect x="0" y="105" width="300" height="18" fill="rgba(255,255,255,0.12)" />
          <Rect x="155" y="0" width="12" height="225" fill="rgba(255,255,255,0.08)" />
          <G transform="translate(140, 85)">
            <Circle cx="10" cy="0" r="14" fill="#EF4444" fillOpacity={0.3} />
            <Circle cx="10" cy="0" r="8" fill="#EF4444" />
            <Circle cx="10" cy="0" r="3" fill="white" />
          </G>
        </Svg>
        {/* Jeweller card overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            backgroundColor: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
          }}
        >
          <Text
            style={{
              color: isDark ? '#F0F0F0' : '#1F2937',
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
            }}
          >
            manohar lal jewellers
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: GOLD }}>{'★★★★'}</Text>
            <Text style={{ fontSize: 12, color: isDark ? '#6B7280' : '#9CA3AF' }}>{'☆'}</Text>
            <Text style={{ fontSize: 11, color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: 4 }}>
              1.3km away
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : '#FEF3C7',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(184,134,11,0.3)' : 'rgba(184,134,11,0.2)',
                borderRadius: 8,
                paddingVertical: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: GOLD }}>redeem</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                borderRadius: 8,
                paddingVertical: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                directions
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Native Tola Price Display ────────────────────────────────

const COMPETITOR_MARKUPS = {
  jar: 0.0283,
  gullak: 0.0284,
};

function NativeTolaPriceDisplay({ isDark }: { isDark: boolean }) {
  const [tolaPrice, setTolaPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(`${API_BASE}/api/prices/tola`);
        const data = await res.json();
        if (data.success && data.data) {
          setTolaPrice(data.data.priceInrPerTola);
        }
      } catch {
        // silently fail
      }
    }
    fetchPrice();
  }, []);

  if (!tolaPrice) {
    return (
      <View style={{ gap: 12 }}>
        <View
          style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <View
            style={{
              width: 160,
              height: 24,
              borderRadius: 6,
              backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
            }}
          />
        </View>
        <View
          style={{
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
            borderRadius: 12,
            padding: 16,
            gap: 8,
          }}
        >
          <View
            style={{
              width: 144,
              height: 20,
              borderRadius: 4,
              backgroundColor: isDark ? '#242424' : '#F0F0F0',
            }}
          />
          <View
            style={{
              width: 144,
              height: 20,
              borderRadius: 4,
              backgroundColor: isDark ? '#242424' : '#F0F0F0',
            }}
          />
        </View>
      </View>
    );
  }

  const jarPrice = tolaPrice * (1 + COMPETITOR_MARKUPS.jar);
  const gullakPrice = tolaPrice * (1 + COMPETITOR_MARKUPS.gullak);

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text style={{ color: SUCCESS, fontWeight: '700', fontSize: 20 }}>
          {APP.NAME}: {formatINR(tolaPrice)}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
          borderRadius: 12,
          padding: 16,
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: isDark ? '#6B7280' : '#9CA3AF',
            textDecorationLine: 'line-through',
          }}
        >
          jar: {formatINR(jarPrice)}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark ? '#6B7280' : '#9CA3AF',
            textDecorationLine: 'line-through',
          }}
        >
          gullak: {formatINR(gullakPrice)}
        </Text>
      </View>
    </View>
  );
}

// ── T&C Modal ────────────────────────────────────────────────

function TermsModal({
  visible,
  onClose,
  onAccept,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  isDark: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  const handleClose = useCallback(() => {
    setAgreed(false);
    onClose();
  }, [onClose]);

  const handleAccept = useCallback(() => {
    if (agreed) {
      setAgreed(false);
      onAccept();
    }
  }, [agreed, onAccept]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
        onPress={handleClose}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
              padding: 24,
              maxWidth: 400,
              width: SCREEN_WIDTH - 32,
              maxHeight: '80%',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: isDark ? '#F0F0F0' : '#1F2937',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Terms & Conditions
            </Text>

            <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  lineHeight: 20,
                }}
              >
                {TERMS_AND_CONDITIONS}
              </Text>
            </ScrollView>

            {/* Checkbox */}
            <Pressable
              onPress={() => setAgreed(!agreed)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: agreed ? GOLD : (isDark ? '#3D3D3D' : '#D1D5DB'),
                  backgroundColor: agreed ? GOLD : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                {agreed && <Check size={14} color="#FFFFFF" />}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  lineHeight: 18,
                }}
              >
                I agree to the{' '}
                <Text style={{ color: GOLD }}>Terms & Conditions</Text>,{' '}
                Marketing Communications, and{' '}
                <Text style={{ color: GOLD }}>Privacy Policy</Text>.
              </Text>
            </Pressable>

            {/* Create Account Button */}
            <Pressable
              onPress={handleAccept}
              disabled={!agreed}
              style={{
                backgroundColor: GOLD,
                paddingVertical: 16,
                borderRadius: 999,
                alignItems: 'center',
                marginBottom: 12,
                opacity: agreed ? 1 : 0.5,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                create account
              </Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={handleClose}
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                paddingVertical: 12,
                borderRadius: 999,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  fontWeight: '500',
                  fontSize: 15,
                }}
              >
                cancel
              </Text>
            </Pressable>
          </Pressable>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

// ── Privy Login Form ─────────────────────────────────────────

function PrivyLoginForm({
  onBack,
  isDark,
  colors,
}: {
  onBack: () => void;
  isDark: boolean;
  colors: { textPrimary: string; textSecondary: string; textMuted: string; borderSubtle: string; card: string; elevated: string };
}) {
  const { useLoginWithEmail } = require('@privy-io/expo') as {
    useLoginWithEmail: () => {
      sendCode: (args: { email: string }) => Promise<void>;
      loginWithCode: (args: { code: string; email: string }) => Promise<void>;
    };
  };
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { isReady, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isReady, isAuthenticated]);

  const handleSendCode = useCallback(async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendCode({ email: email.trim() });
      setStep('code');
      setTimeout(() => codeInputRef.current?.focus(), 300);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, sendCode]);

  const handleLogin = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await loginWithCode({ code: code.trim(), email: email.trim() });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [code, email, loginWithCode]);

  const handleBack = useCallback(() => {
    if (step === 'code') {
      setStep('email');
      setCode('');
      setError(null);
    } else {
      onBack();
    }
  }, [step, onBack]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}>
          {/* Logo */}
          <MotiView {...SCALE_IN} style={{ alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: GOLD,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Au</Text>
            </View>
          </MotiView>

          <MotiView
            {...FADE_UP}
            transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 100 }}
            style={{ alignItems: 'center', marginBottom: 32 }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: '700',
                color: GOLD,
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              gold.fi
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              Own real gold. Backed 1:1.{'\n'}Secured in Swiss vaults.
            </Text>
          </MotiView>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {step === 'email' ? (
            <MotiView {...FADE_UP} transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 200 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginBottom: 16,
                  letterSpacing: 0.5,
                }}
              >
                signing up takes just a minute
              </Text>

              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: colors.textPrimary,
                  marginBottom: 12,
                }}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#3D3D3D' : '#9CA3AF'}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={handleSendCode}
                editable={!loading}
              />

              {error && (
                <Text
                  style={{
                    color: '#EF4444',
                    fontSize: 12,
                    textAlign: 'center',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Text>
              )}

              <Pressable
                onPress={handleSendCode}
                disabled={loading || !email.trim()}
                style={{
                  width: '100%',
                  backgroundColor: GOLD,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: !email.trim() || loading ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Continue with Email
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={handleBack} style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Back to onboarding
                </Text>
              </Pressable>

              <Text
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  textAlign: 'center',
                  paddingHorizontal: 16,
                }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </MotiView>
          ) : (
            <MotiView {...FADE_UP}>
              <Pressable onPress={handleBack} style={{ marginBottom: 16 }}>
                <Text style={{ color: GOLD, fontSize: 14, fontWeight: '500' }}>
                  {'< Back'}
                </Text>
              </Pressable>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}
              >
                Enter verification code
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 24,
                }}
              >
                We sent a code to {email}
              </Text>

              <TextInput
                ref={codeInputRef}
                style={{
                  width: '100%',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: colors.textPrimary,
                  marginBottom: 12,
                  textAlign: 'center',
                  letterSpacing: 8,
                }}
                placeholder="------"
                placeholderTextColor={isDark ? '#3D3D3D' : '#9CA3AF'}
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setError(null);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />

              {error && (
                <Text
                  style={{
                    color: '#EF4444',
                    fontSize: 12,
                    textAlign: 'center',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Text>
              )}

              <Pressable
                onPress={handleLogin}
                disabled={loading || code.length < 6}
                style={{
                  width: '100%',
                  backgroundColor: GOLD,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: code.length < 6 || loading ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Verify & Login
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleSendCode}
                disabled={loading}
                style={{ paddingVertical: 12, alignItems: 'center', marginTop: 12 }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Didn't receive a code?{' '}
                  <Text style={{ color: GOLD, fontWeight: '500' }}>Resend</Text>
                </Text>
              </Pressable>
            </MotiView>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function LoginScreen() {
  const { isReady, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const [loginStep, setLoginStep] = useState<LoginStep>('onboarding');
  const [activeSlide, setActiveSlide] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isReady, isAuthenticated]);

  // Auto-advance carousel
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDE_COUNT;
        scrollViewRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    if (loginStep === 'onboarding') {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loginStep, resetTimer]);

  const goToSlide = useCallback(
    (index: number) => {
      setActiveSlide(index);
      scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      resetTimer();
    },
    [resetTimer]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== activeSlide && index >= 0 && index < SLIDE_COUNT) {
        setActiveSlide(index);
        resetTimer();
      }
    },
    [activeSlide, resetTimer]
  );

  const handleGetStarted = useCallback(() => {
    setShowTermsModal(true);
  }, []);

  const handleTermsAccepted = useCallback(() => {
    setShowTermsModal(false);
    setLoginStep('email');
  }, []);

  const handleLogIn = useCallback(() => {
    setLoginStep('email');
  }, []);

  const handleBackToOnboarding = useCallback(() => {
    setLoginStep('onboarding');
  }, []);

  // Show login form (email/code)
  if (loginStep === 'email' || loginStep === 'code') {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5' }}
        edges={['top', 'bottom']}
      >
        <PrivyLoginForm onBack={handleBackToOnboarding} isDark={isDark} colors={colors} />
      </SafeAreaView>
    );
  }

  // Onboarding carousel
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5' }}
      edges={['top', 'bottom']}
    >
      <View style={{ flex: 1 }}>
        {/* Slide Indicators */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 100 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <Pressable
                key={i}
                onPress={() => goToSlide(i)}
                style={{
                  height: 4,
                  width: i === activeSlide ? 32 : 16,
                  borderRadius: 2,
                  backgroundColor: i === activeSlide ? GOLD : (isDark ? '#2D2D2D' : '#D1D5DB'),
                  overflow: 'hidden',
                }}
              />
            ))}
          </View>
        </MotiView>

        {/* Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={{ flex: 1 }}
          contentContainerStyle={{ width: SCREEN_WIDTH * SLIDE_COUNT }}
        >
          {/* Slide 1: Invest in Gold */}
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24 }}>
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing' as const, duration: DURATION.slow, delay: 200 }}
            >
              <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring' as const, damping: 30, stiffness: 300, delay: 300 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: GOLD,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Au</Text>
                    </View>
                    <Text style={{ fontSize: 36, fontWeight: '700', color: GOLD, letterSpacing: -1 }}>
                      gold.fi
                    </Text>
                  </View>
                </MotiView>

                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.textSecondary,
                    fontSize: 14,
                    letterSpacing: 0.3,
                  }}
                >
                  Own real gold. Backed 1:1.{'\n'}Secured in Swiss vaults.
                </Text>
              </View>
            </MotiView>

            {/* Tola Price */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing' as const, duration: DURATION.normal, delay: 550 }}
              style={{ paddingVertical: 16 }}
            >
              <NativeTolaPriceDisplay isDark={isDark} />
            </MotiView>

            {/* Features */}
            <View style={{ paddingVertical: 16, gap: 12 }}>
              {FEATURES.map((feature, i) => (
                <MotiView
                  key={feature}
                  from={{ opacity: 0, translateX: -12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: 650 + i * 80,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle size={16} color={SUCCESS} />
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                      {feature}
                    </Text>
                  </View>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Slide 2: Earn Returns */}
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24 }}>
            <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: GOLD,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Au</Text>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '700', color: GOLD, letterSpacing: -1 }}>
                  gold.fi
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                gold yield{'\n'}(variable rates, risks apply)
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 8 }}>
              <ChartIllustration isDark={isDark} />
            </View>
          </View>

          {/* Slide 3: Send & Receive */}
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24 }}>
            <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: GOLD,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Au</Text>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '700', color: GOLD, letterSpacing: -1 }}>
                  gold.fi
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                send and receive gold{'\n'}from anyone
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 16 }}>
              <ChatIllustration isDark={isDark} />
            </View>
          </View>

          {/* Slide 4: Redeem at Jewellers */}
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24 }}>
            <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: GOLD,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Au</Text>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '700', color: GOLD, letterSpacing: -1 }}>
                  gold.fi
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                redeem your gold{'\n'}at 1000+ jewellers across india
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 8 }}>
              <MapIllustration isDark={isDark} />
            </View>
          </View>
        </ScrollView>

        {/* CTA Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.slow, delay: 900 }}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <Text
              style={{
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: 12,
                marginBottom: 16,
                letterSpacing: 0.5,
              }}
            >
              signing up takes just a minute
            </Text>

            <Pressable
              onPress={handleGetStarted}
              style={{
                width: '100%',
                backgroundColor: GOLD,
                paddingVertical: 16,
                borderRadius: 999,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18, letterSpacing: 0.3 }}>
                get started
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogIn}
              style={{
                width: '100%',
                paddingVertical: 16,
                borderRadius: 999,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontWeight: '500',
                  fontSize: 15,
                }}
              >
                already have an account? log in
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </View>

      {/* T&C Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
