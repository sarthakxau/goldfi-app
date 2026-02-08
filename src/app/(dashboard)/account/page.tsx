'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, FileText, HelpCircle, ChevronRight, LogOut, Copy, Key, Check, Sun, Moon, Monitor, Palette, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, backdropFade, modalScale, slideUpSpring, EASE_OUT_EXPO, DURATION } from '@/lib/animations';
import Link from 'next/link';

interface UserProfile {
  id: string;
  privyUserId: string;
  walletAddress: string;
  email: string | null;
  phone: string | null;
  kycStatus: string;
  fullName: string;
  address: string;
  pan: string;
  aadhar: string;
}

export default function AccountPage() {
  const { user, logout, exportWallet } = usePrivy();
  const { theme, setTheme } = useTheme();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get initials from email username
  const getInitials = () => {
    const email = user?.email?.address || 'User';
    return email.slice(0, 2).toUpperCase();
  };

  const displayName = user?.email?.address?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email?.address || '';
  const walletAddress = user?.wallet?.address;

  useEffect(() => {
    // Mock fetch user profile
    // In production, this would call /api/user
    setTimeout(() => {
      setProfile({
        id: 'mock-id',
        privyUserId: user?.id || '',
        walletAddress: walletAddress || '',
        email: user?.email?.address || 'abhishek@goldfi.in',
        phone: user?.phone?.number || '+91 98765 43210',
        kycStatus: 'verified', // Mock verified for display
        fullName: 'Abhishek Vaidyanathan',
        address: 'Mumbai, Maharashtra',
        pan: 'ABCDE1234F',
        aadhar: '1234 5678 9012',
      });
      setLoading(false);
    }, 500);
  }, [user, walletAddress]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themeOptions = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
    { key: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-10 pb-8 bg-white dark:bg-[#1A1A1A] border-b border-border-subtle dark:border-[#2D2D2D] rounded-b-[2rem]">
        <FadeUp>
          <div className="relative mb-4 flex justify-center">
            <motion.div
              className="size-24 rounded-full overflow-hidden border-4 border-surface dark:border-[#0F0F0F] ring-2 ring-gold-500/30 flex items-center justify-center bg-[#2A2A2A]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.gentle}
            >
              <span className="text-3xl font-bold text-gold-400">{getInitials()}</span>
            </motion.div>
          </div>
        </FadeUp>
        <FadeUp delay={0.08}>
          <h1 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] text-center">{displayName}</h1>
        </FadeUp>
        <FadeUp delay={0.12}>
          <p className="text-sm text-text-muted dark:text-[#9CA3AF] text-center mt-1">{displayEmail}</p>
        </FadeUp>
        <FadeUp delay={0.16}>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 dark:bg-success/20 border border-success/20">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">KYC Verified</span>
          </div>
        </FadeUp>
      </div>

      {/* Settings Sections */}
      <div className="p-6 max-w-md mx-auto space-y-8">
        {/* Account Section */}
        <section>
          <FadeUp delay={0.2}>
            <h2 className="text-xs font-bold text-text-muted dark:text-[#6B7280] mb-3 px-2 uppercase tracking-wider">Account</h2>
          </FadeUp>
          <StaggerContainer staggerDelay={0.05} delayChildren={0.22}>
            <div className="card overflow-hidden">
              <div className="divide-y divide-border-subtle dark:divide-[#2D2D2D]">
                <StaggerItem>
                  <SettingsItem
                    icon={User}
                    label="Personal"
                    href="/account/personal"
                  />
                </StaggerItem>
                <StaggerItem>
                  <SettingsItem
                    icon={Shield}
                    label="KYC Status"
                    href="/account/kyc"
                    detail="Verified"
                  />
                </StaggerItem>
                <StaggerItem>
                  <SettingsItem
                    icon={Key}
                    label="Security"
                    onClick={() => setIsAccountModalOpen(true)}
                  />
                </StaggerItem>
              </div>
            </div>
          </StaggerContainer>
        </section>

        {/* Preferences Section */}
        <section>
          <FadeUp delay={0.3}>
            <h2 className="text-xs font-bold text-text-muted dark:text-[#6B7280] mb-3 px-2 uppercase tracking-wider">Preferences</h2>
          </FadeUp>
          <StaggerContainer staggerDelay={0.05} delayChildren={0.32}>
            <div className="card overflow-hidden">
              <div className="divide-y divide-border-subtle dark:divide-[#2D2D2D]">
                <StaggerItem>
                  <SettingsItem
                    icon={Palette}
                    label="Appearance"
                    onClick={() => setIsThemeModalOpen(true)}
                    detail={theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                  />
                </StaggerItem>
              </div>
            </div>
          </StaggerContainer>
        </section>

        {/* Legal Section */}
        <section>
          <FadeUp delay={0.38}>
            <h2 className="text-xs font-bold text-text-muted dark:text-[#6B7280] mb-3 px-2 uppercase tracking-wider">Legal</h2>
          </FadeUp>
          <StaggerContainer staggerDelay={0.05} delayChildren={0.4}>
            <div className="card overflow-hidden">
              <div className="divide-y divide-border-subtle dark:divide-[#2D2D2D]">
                <StaggerItem>
                  <SettingsItem
                    icon={FileText}
                    label="Terms & Conditions"
                    href="#"
                    external
                  />
                </StaggerItem>
                <StaggerItem>
                  <SettingsItem
                    icon={Shield}
                    label="Privacy Policy"
                    href="#"
                    external
                  />
                </StaggerItem>
                <StaggerItem>
                  <SettingsItem
                    icon={HelpCircle}
                    label="Help & Support"
                    href="#"
                    external
                  />
                </StaggerItem>
              </div>
            </div>
          </StaggerContainer>
        </section>

        {/* Sign Out Button */}
        <FadeUp delay={0.48}>
          <motion.button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-4 px-6 rounded-2xl border border-error/20 bg-error/5 text-error font-semibold hover:bg-error/10 transition-colors"
            whileTap={{ scale: 0.98 }}
            transition={SPRING.snappy}
          >
            Sign Out
          </motion.button>
        </FadeUp>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              variants={backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsLogoutConfirmOpen(false)}
            />
            <motion.div
              className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-6 max-w-sm w-full"
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Sign Out</h3>
              <p className="text-text-secondary dark:text-[#9CA3AF] mb-6">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF] font-medium hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsLogoutConfirmOpen(false);
                    logout();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-error text-white font-medium hover:bg-error-dark transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Theme Selection Modal */}
      <AnimatePresence>
        {isThemeModalOpen && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              variants={backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsThemeModalOpen(false)}
            />
            <motion.div
              className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-6 max-w-sm w-full"
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] mb-4">Appearance</h3>
              <div className="space-y-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.key;
                  return (
                    <motion.button
                      key={opt.key}
                      onClick={() => {
                        setTheme(opt.key);
                        setIsThemeModalOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border transition-colors',
                        isSelected
                          ? 'border-gold-500 bg-gold-100 dark:bg-gold-500/10'
                          : 'border-border-subtle dark:border-[#2D2D2D] hover:border-gold-500/30 hover:bg-surface-elevated dark:hover:bg-[#242424]'
                      )}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING.snappy}
                    >
                      <div className={cn(
                        'p-2 rounded-xl transition-colors',
                        isSelected ? 'bg-gold-500 text-white' : 'bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280]'
                      )}>
                        <Icon className="size-5" />
                      </div>
                      <span className={cn(
                        'font-semibold',
                        isSelected ? 'text-gold-500' : 'text-text-secondary dark:text-[#9CA3AF]'
                      )}>
                        {opt.label}
                      </span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            className="ml-auto"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="size-5 text-gold-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              variants={backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsAccountModalOpen(false)}
            />
            <motion.div
              className="relative bg-white dark:bg-[#1A1A1A] rounded-t-3xl sm:rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-card"
              variants={slideUpSpring}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Handle bar for mobile */}
              <div className="w-12 h-1.5 bg-border-subtle dark:bg-[#2D2D2D] rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0]">Security</h3>
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] hover:bg-surface-elevated dark:hover:bg-[#242424] rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <ArrowLeft className="size-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Wallet Address */}
                <div>
                  <label className="text-sm font-medium text-text-muted dark:text-[#6B7280] mb-2 block">Wallet Address</label>
                  <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-[#242424] rounded-xl border border-border-subtle dark:border-[#2D2D2D]">
                    <code className="text-sm font-mono text-text-primary dark:text-[#F0F0F0]">
                      {walletAddress ? truncateAddress(walletAddress) : 'No wallet connected'}
                    </code>
                    {walletAddress && (
                      <button
                        onClick={handleCopyAddress}
                        className="p-2 -mr-2 text-text-muted dark:text-[#6B7280] hover:text-gold-500 rounded-lg transition-all"
                        aria-label="Copy wallet address"
                      >
                        <AnimatePresence mode="wait">
                          {copied ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Check className="size-4 text-success" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Copy className="size-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    )}
                  </div>
                </div>

                {/* Export Private Key */}
                <div>
                  <label className="text-sm font-medium text-text-muted dark:text-[#6B7280] mb-2 block">Wallet Security</label>
                  <motion.button
                    onClick={exportWallet}
                    className="w-full flex items-center justify-between p-4 bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] rounded-xl hover:border-gold-500/30 transition-all group"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded-lg text-text-muted dark:text-[#6B7280] group-hover:bg-gold-100 dark:group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors">
                        <Key className="size-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-text-primary dark:text-[#F0F0F0]">Export Private Key</p>
                        <p className="text-xs text-text-muted dark:text-[#6B7280]">View your wallet&apos;s secret key</p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-text-muted dark:text-[#6B7280] group-hover:text-gold-500" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  detail?: string;
}

function SettingsItem({ icon: Icon, label, onClick, href, external, detail }: SettingsItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280] group-hover:text-gold-500 group-hover:bg-gold-100 dark:group-hover:bg-gold-500/10 transition-colors">
          <Icon className="size-5" />
        </div>
        <span className="font-semibold text-text-secondary dark:text-[#9CA3AF] group-hover:text-text-primary dark:group-hover:text-[#F0F0F0] transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail && (
          <span className="text-xs text-success font-medium">{detail}</span>
        )}
        <ChevronRight className="size-5 text-text-muted dark:text-[#6B7280] group-hover:text-gold-500 transition-colors" />
      </div>
    </>
  );

  const className = "w-full flex items-center justify-between p-4 transition-all hover:bg-surface-elevated dark:hover:bg-[#242424] active:bg-surface dark:active:bg-[#1A1A1A] group";

  if (href) {
    return (
      <Link href={href} className={className} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
