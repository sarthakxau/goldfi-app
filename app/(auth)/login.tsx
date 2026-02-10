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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { FADE_UP, FADE_IN, SCALE_IN, DURATION, staggerDelay } from '@/lib/animations';
import { useAuth } from '@/lib/auth-provider';
import { Check } from 'lucide-react-native';

type LoginStep = 'email' | 'code';

const FEATURES = [
  'pure 24K gold',
  'gold yield (variable rates, risks apply)',
  'backed by Swiss reserves',
  'withdraw anytime, with zero limits',
];

// ── Privy login form (only rendered in production mode) ────

function PrivyLoginForm() {
  const { useLoginWithEmail } = require('@privy-io/expo') as {
    useLoginWithEmail: () => {
      sendCode: (args: { email: string }) => Promise<void>;
      loginWithCode: (args: { code: string; email: string }) => Promise<void>;
    };
  };
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { isReady, isAuthenticated } = useAuth();

  const [step, setStep] = useState<LoginStep>('email');
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
    setStep('email');
    setCode('');
    setError(null);
  }, []);

  return (
    <LoginUI
      step={step}
      email={email}
      setEmail={setEmail}
      code={code}
      setCode={setCode}
      loading={loading}
      error={error}
      setError={setError}
      codeInputRef={codeInputRef}
      handleSendCode={handleSendCode}
      handleLogin={handleLogin}
      handleBack={handleBack}
    />
  );
}

// ── Main export ─────────────────────────────────────────────

export default function LoginScreen() {
  const { isReady, isAuthenticated } = useAuth();

  // In dev bypass mode, immediately redirect — never render Privy hooks
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isReady, isAuthenticated]);

  if (__DEV__ && isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B8860B" />
          <Text className="text-text-muted dark:text-text-dark-muted mt-4 text-sm">
            Redirecting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return <PrivyLoginForm />;
}

// ── Shared login UI ─────────────────────────────────────────

function LoginUI({
  step,
  email,
  setEmail,
  code,
  setCode,
  loading,
  error,
  setError,
  codeInputRef,
  handleSendCode,
  handleLogin,
  handleBack,
}: {
  step: LoginStep;
  email: string;
  setEmail: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  loading: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  codeInputRef: React.RefObject<TextInput | null>;
  handleSendCode: () => void;
  handleLogin: () => void;
  handleBack: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-10">
            {/* Logo + Brand */}
            <MotiView {...SCALE_IN} className="items-center mb-2">
              <View className="w-16 h-16 rounded-2xl bg-gold-500 items-center justify-center mb-4">
                <Text className="text-white text-xl font-bold">Au</Text>
              </View>
            </MotiView>

            <MotiView {...FADE_UP} delay={100} className="items-center mb-8">
              <Text className="text-3xl font-bold text-gold-500 tracking-tight mb-1">
                gold.fi
              </Text>
              <Text className="text-sm text-text-secondary dark:text-text-dark-secondary text-center">
                Own real gold. Backed 1:1.{'\n'}Secured in Swiss vaults.
              </Text>
            </MotiView>

            {/* Features list */}
            {step === 'email' && (
              <View className="mb-8">
                {FEATURES.map((feature, i) => (
                  <MotiView
                    key={feature}
                    {...FADE_UP}
                    delay={staggerDelay(i, 80, 200)}
                    className="flex-row items-center gap-3 mb-3"
                  >
                    <View className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                      <Check size={14} color="#22C55E" />
                    </View>
                    <Text className="text-sm text-text-secondary dark:text-text-dark-secondary flex-1">
                      {feature}
                    </Text>
                  </MotiView>
                ))}
              </View>
            )}

            {/* Spacer to push form down */}
            <View className="flex-1" />

            {/* Auth form */}
            {step === 'email' ? (
              <MotiView {...FADE_UP} delay={400}>
                <Text className="text-xs text-text-muted dark:text-text-dark-muted text-center mb-4 tracking-wide">
                  signing up takes just a minute
                </Text>

                <TextInput
                  className="w-full bg-white dark:bg-neutral-800 border border-border dark:border-border-dark rounded-2xl px-4 py-4 text-base text-text-primary dark:text-text-dark-primary mb-3"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={handleSendCode}
                  editable={!loading}
                />

                {error && (
                  <Text className="text-error text-xs text-center mb-3">{error}</Text>
                )}

                <Pressable
                  className="w-full bg-gold-500 rounded-full py-4 items-center active:opacity-80"
                  onPress={handleSendCode}
                  disabled={loading || !email.trim()}
                  style={(!email.trim() || loading) ? { opacity: 0.5 } : undefined}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Continue with Email
                    </Text>
                  )}
                </Pressable>

                <Text className="text-xs text-text-muted dark:text-text-dark-muted mt-4 text-center px-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </MotiView>
            ) : (
              <MotiView {...FADE_UP}>
                <Pressable onPress={handleBack} className="mb-4">
                  <Text className="text-gold-500 text-sm font-medium">
                    {'<'} Back
                  </Text>
                </Pressable>

                <Text className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-1">
                  Enter verification code
                </Text>
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
                  We sent a code to {email}
                </Text>

                <TextInput
                  ref={codeInputRef}
                  className="w-full bg-white dark:bg-neutral-800 border border-border dark:border-border-dark rounded-2xl px-4 py-4 text-base text-text-primary dark:text-text-dark-primary mb-3 text-center tracking-[8px]"
                  placeholder="------"
                  placeholderTextColor="#9CA3AF"
                  value={code}
                  onChangeText={(t) => { setCode(t); setError(null); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="one-time-code"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />

                {error && (
                  <Text className="text-error text-xs text-center mb-3">{error}</Text>
                )}

                <Pressable
                  className="w-full bg-gold-500 rounded-full py-4 items-center active:opacity-80"
                  onPress={handleLogin}
                  disabled={loading || code.length < 6}
                  style={(code.length < 6 || loading) ? { opacity: 0.5 } : undefined}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Verify & Login
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  className="w-full py-3 items-center mt-3"
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text className="text-text-secondary dark:text-text-dark-secondary text-sm">
                    Didn&apos;t receive a code?{' '}
                    <Text className="text-gold-500 font-medium">Resend</Text>
                  </Text>
                </Pressable>
              </MotiView>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
