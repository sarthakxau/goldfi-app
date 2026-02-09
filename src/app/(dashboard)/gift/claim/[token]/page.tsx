'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Gift, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { FadeUp } from '@/components/animations';
import { authFetchJson } from '@/lib/apiClient';
import { SPRING, DURATION, EASE_OUT_EXPO } from '@/lib/animations';

type ClaimState = 'loading' | 'preview' | 'claiming' | 'success' | 'error' | 'login-required';

export default function ClaimGiftPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  const [state, setState] = useState<ClaimState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [giftInfo, setGiftInfo] = useState<{
    gramsAmount: number;
    inrAmount: number;
    occasion: string;
    message?: string;
    senderEmail?: string;
  } | null>(null);

  // Check auth state
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      setState('login-required');
    } else {
      setState('preview');
    }
  }, [ready, authenticated]);

  const handleClaim = async () => {
    setState('claiming');
    setError(null);

    try {
      const { success, data, error: apiError } = await authFetchJson<{
        gift: { grams_amount: number; inr_amount: number; occasion: string; message?: string };
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
      const message = err instanceof Error ? err.message : 'Failed to claim gift';
      setError(message);
      setState('error');
    }
  };

  const handleLogin = () => {
    login();
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center">
      {/* Loading */}
      {state === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="size-8 text-gold-500" />
          </motion.div>
          <p className="text-sm text-text-muted dark:text-[#6B7280] mt-4">Loading gift...</p>
        </motion.div>
      )}

      {/* Login Required */}
      {state === 'login-required' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          className="text-center w-full"
        >
          <div className="size-20 rounded-full bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
            <Gift className="size-10 text-gold-500" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
            You&apos;ve received gold!
          </h2>
          <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mb-8">
            Sign up or log in to claim your gold gift and add it to your vault.
          </p>

          <motion.button
            onClick={handleLogin}
            className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            Sign up to claim
          </motion.button>
        </motion.div>
      )}

      {/* Preview — ready to claim */}
      {state === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          className="text-center w-full"
        >
          <div className="size-20 rounded-full bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
            <Gift className="size-10 text-gold-500" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
            You&apos;ve received gold!
          </h2>
          <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mb-8">
            Someone sent you a gold gift. Claim it to add it to your vault.
          </p>

          <motion.button
            onClick={handleClaim}
            className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            <Gift className="size-5" />
            Claim Gold
          </motion.button>
        </motion.div>
      )}

      {/* Claiming */}
      {state === 'claiming' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="size-8 text-gold-500" />
          </motion.div>
          <p className="text-sm text-text-primary dark:text-[#F0F0F0] font-medium mt-4">
            Claiming your gold...
          </p>
          <p className="text-xs text-text-muted dark:text-[#6B7280] mt-1">
            This may take a moment while we transfer it to your wallet.
          </p>
        </motion.div>
      )}

      {/* Success */}
      {state === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
          className="text-center w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
            className="size-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="size-10 text-success" />
          </motion.div>

          <FadeUp delay={0.2}>
            <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
              Gold claimed!
            </h2>
          </FadeUp>

          {giftInfo && (
            <FadeUp delay={0.25}>
              <p className="text-3xl font-bold text-gold-500 mb-1">
                {giftInfo.gramsAmount.toFixed(2)}g gold
              </p>
              <p className="text-sm text-text-muted dark:text-[#6B7280] mb-6">
                Worth &#8377;{giftInfo.inrAmount.toLocaleString('en-IN')}
              </p>
            </FadeUp>
          )}

          <FadeUp delay={0.3}>
            <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mb-8">
              The gold has been added to your vault.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <motion.button
              onClick={() => router.push('/')}
              className="w-full bg-gold-gradient text-white font-bold text-base py-4 rounded-2xl"
              whileTap={{ scale: 0.97 }}
              transition={SPRING.snappy}
            >
              Go to Dashboard
            </motion.button>
          </FadeUp>
        </motion.div>
      )}

      {/* Error */}
      {state === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
          className="text-center w-full"
        >
          <div className="size-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="size-10 text-error" />
          </div>

          <h2 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
            Couldn&apos;t claim gift
          </h2>
          <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mb-8">
            {error || 'Something went wrong. Please try again.'}
          </p>

          <motion.button
            onClick={() => setState('preview')}
            className="w-full bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] text-text-primary dark:text-[#F0F0F0] font-semibold py-3.5 rounded-full"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            Try again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
