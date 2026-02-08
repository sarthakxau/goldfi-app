'use client';

import React, { useState } from 'react';
import { User, Shield, Info, HelpCircle, ChevronRight, LogOut, Copy, Key, Check, Sun, Moon, Monitor } from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from '@/components/CardModals';
import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'motion/react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, backdropFade, modalScale, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

export default function AccountPage() {
  const { user, logout, exportWallet } = usePrivy();
  const { theme, setTheme } = useTheme();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = user?.email?.address?.split('@')[0] || 'User';
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${userName}&backgroundColor=B8860B&textColor=ffffff`;
  const walletAddress = user?.wallet?.address;

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
    <div className="min-h-screen pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 bg-white dark:bg-[#1A1A1A] border-b border-border-subtle dark:border-[#2D2D2D] rounded-b-[2rem]">
        <FadeUp>
          <div className="relative mb-4 flex justify-center">
            <motion.div
              className="size-24 rounded-full overflow-hidden border-4 border-surface dark:border-[#0F0F0F] ring-2 ring-gold-500/30"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.gentle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Online Indicator */}
            <div className="absolute bottom-1 right-1 size-5 bg-success border-4 border-white dark:border-[#1A1A1A] rounded-full"></div>
          </div>
        </FadeUp>
        <FadeUp delay={0.08}>
          <h1 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] text-center">{userName}</h1>
          <p className="text-sm text-gold-500 font-medium text-center">Gold Member</p>
        </FadeUp>
      </div>

      {/* Settings Section */}
      <div className="p-6 max-w-md mx-auto">
        <FadeUp delay={0.14}>
          <h2 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] mb-4 px-2">Settings</h2>
        </FadeUp>

        <StaggerContainer staggerDelay={0.05} delayChildren={0.18}>
          <div className="card overflow-hidden">
            <div className="divide-y divide-border-subtle dark:divide-[#2D2D2D]">
              <StaggerItem>
                <SettingsItem
                  icon={User}
                  label="Account"
                  onClick={() => setIsAccountModalOpen(true)}
                />
              </StaggerItem>
              <StaggerItem>
                <SettingsItem
                  icon={theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Moon : Sun}
                  label="Appearance"
                  onClick={() => setIsThemeModalOpen(true)}
                  detail={theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                />
              </StaggerItem>
              <StaggerItem>
                <SettingsItem
                  icon={Shield}
                  label="Security"
                  onClick={() => {}}
                />
              </StaggerItem>
              <StaggerItem>
                <SettingsItem
                  icon={Info}
                  label="About"
                  onClick={() => {}}
                />
              </StaggerItem>
              <StaggerItem>
                <SettingsItem
                  icon={HelpCircle}
                  label="FAQ"
                  onClick={() => {}}
                />
              </StaggerItem>
              <StaggerItem>
                <SettingsItem
                  icon={LogOut}
                  label="Log Out"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  destructive
                />
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
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
              <h3 className="text-lg font-bold text-text-primary dark:text-[#F0F0F0] mb-2">Log Out</h3>
              <p className="text-text-secondary dark:text-[#9CA3AF] mb-6">Are you sure you want to log out of your account?</p>
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
                  Log Out
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

      {/* Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Account Details"
      >
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
            <label className="text-sm font-medium text-text-muted dark:text-[#6B7280] mb-2 block">Security</label>
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
      </Modal>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
  detail,
}: {
  icon: React.ElementType,
  label: string,
  onClick: () => void,
  destructive?: boolean,
  detail?: string,
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 transition-all hover:bg-surface-elevated dark:hover:bg-[#242424] active:bg-surface dark:active:bg-[#1A1A1A] group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          destructive
            ? "bg-error-light dark:bg-error/10 text-error group-hover:bg-error/20"
            : "bg-surface-elevated dark:bg-[#242424] text-text-muted dark:text-[#6B7280] group-hover:text-gold-500 group-hover:bg-gold-100 dark:group-hover:bg-gold-500/10"
        )}>
          <Icon className="size-5" />
        </div>
        <span className={cn(
          "font-semibold",
          destructive ? "text-error" : "text-text-secondary dark:text-[#9CA3AF]"
        )}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail && (
          <span className="text-xs text-text-muted dark:text-[#6B7280]">{detail}</span>
        )}
        <ChevronRight className={cn(
          "size-5 transition-colors",
          destructive ? "text-error/50 group-hover:text-error" : "text-text-muted dark:text-[#6B7280] group-hover:text-gold-500"
        )} />
      </div>
    </button>
  );
}
