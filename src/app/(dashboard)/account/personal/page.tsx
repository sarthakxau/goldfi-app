'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, FileText, Shield, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, EASE_OUT_EXPO } from '@/lib/animations';

interface UserProfile {
  fullName: string;
  email: string;
  pan: string;
  aadhar: string;
}

export default function PersonalDetailsPage() {
  const { user } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPan, setShowPan] = useState(false);
  const [showAadhar, setShowAadhar] = useState(false);

  // Get real user data
  const userEmail = user?.email?.address || '';
  const userName = userEmail.split('@')[0] || 'User';

  useEffect(() => {
    // Mock fetch user profile - using real email, mock KYC data
    setTimeout(() => {
      setProfile({
        fullName: userName,
        email: userEmail,
        pan: 'ABCDE1234F',
        aadhar: '1234 5678 9012',
      });
      setLoading(false);
    }, 300);
  }, [userEmail, userName]);

  const maskPan = (pan: string) => {
    if (!pan) return '';
    return '****' + pan.slice(-4);
  };

  const maskAadhar = (aadhar: string) => {
    if (!aadhar) return '';
    const parts = aadhar.split(' ');
    return '**** **** ' + parts[parts.length - 1];
  };

  const detailItems = profile ? [
    { icon: User, label: 'Full Name', value: profile.fullName, isMasked: false },
    { icon: Mail, label: 'Email', value: profile.email, isMasked: false },
    { icon: FileText, label: 'PAN', value: profile.pan, isMasked: true, show: showPan, setShow: setShowPan },
    { icon: Shield, label: 'Aadhaar', value: profile.aadhar, isMasked: true, show: showAadhar, setShow: setShowAadhar },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-subtle dark:border-[#2D2D2D]">
        <div className="flex items-center gap-4 p-4 max-w-md mx-auto">
          <Link href="/account">
            <motion.button
              className="p-2 -ml-2 rounded-xl hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="size-5 text-text-primary dark:text-[#F0F0F0]" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">Personal Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated dark:bg-[#242424]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 rounded bg-surface-elevated dark:bg-[#242424]" />
                    <div className="h-5 w-32 rounded bg-surface-elevated dark:bg-[#242424]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <StaggerContainer staggerDelay={0.06} delayChildren={0.1}>
              {detailItems.map((item, index) => (
                <StaggerItem key={item.label}>
                  <motion.div
                    className="card p-4 mb-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06, ease: EASE_OUT_EXPO }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-surface-elevated dark:bg-[#242424] text-gold-500">
                        <item.icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-muted dark:text-[#6B7280] mb-0.5">{item.label}</p>
                        <p className="text-base font-semibold text-text-primary dark:text-[#F0F0F0] truncate">
                          {item.isMasked
                            ? item.show
                              ? item.value
                              : item.label === 'PAN'
                                ? maskPan(item.value)
                                : maskAadhar(item.value)
                            : item.value}
                        </p>
                      </div>
                      {item.isMasked && (
                        <button
                          onClick={() => item.setShow && item.setShow(!item.show)}
                          className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-gold-500 transition-colors"
                        >
                          {item.show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Edit Profile Button */}
            <FadeUp delay={0.4}>
              <motion.button
                className="w-full py-4 px-6 mt-4 rounded-2xl bg-gold-500 text-white font-semibold hover:bg-gold-600 transition-colors"
                whileTap={{ scale: 0.98 }}
                transition={SPRING.snappy}
              >
                Edit Profile
              </motion.button>
            </FadeUp>

            {/* KYC Notice */}
            <FadeUp delay={0.48}>
              <div className="mt-4 p-4 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex items-start gap-3">
                <AlertTriangle className="size-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                  KYC details cannot be modified. Contact support for changes.
                </p>
              </div>
            </FadeUp>
          </>
        )}
      </div>
    </div>
  );
}
