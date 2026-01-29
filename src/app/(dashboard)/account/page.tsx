'use client';

import React, { useState } from 'react';
import { User, Shield, Info, HelpCircle, ChevronRight, LogOut, Copy, Key, Check } from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from '@/components/CardModals';

export default function AccountPage() {
  const { user, logout, exportWallet } = usePrivy();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = user?.email?.address?.split('@')[0] || 'User';
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${userName}&backgroundColor=D4A012&textColor=ffffff`;
  const walletAddress = user?.wallet?.address;

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-24 gold-radial-bg">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 bg-surface-card border-b border-border-subtle rounded-b-[2rem]">
        <div className="relative mb-4">
          <div className="size-24 rounded-full overflow-hidden border-4 border-surface ring-2 ring-gold-500/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online Indicator */}
          <div className="absolute bottom-1 right-1 size-5 bg-success border-4 border-surface rounded-full"></div>
        </div>
        <h1 className="text-2xl font-serif text-cream">{userName}</h1>
        <p className="text-sm text-gold-400 font-medium">Gold Member</p>
      </div>

      {/* Settings Section */}
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-lg font-serif text-cream mb-4 px-2">Settings</h2>
        
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-subtle">
            <SettingsItem 
              icon={User} 
              label="Account" 
              onClick={() => setIsAccountModalOpen(true)} 
            />
            <SettingsItem 
              icon={Shield} 
              label="Security" 
              onClick={() => {}} 
            />
            <SettingsItem 
              icon={Info} 
              label="About" 
              onClick={() => {}} 
            />
            <SettingsItem 
              icon={HelpCircle} 
              label="FAQ" 
              onClick={() => {}} 
            />
            <SettingsItem
              icon={LogOut}
              label="Log Out"
              onClick={() => setIsLogoutConfirmOpen(true)}
              destructive
            />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsLogoutConfirmOpen(false)}
          />
          <div className="relative card-elevated p-6 max-w-sm w-full">
            <h3 className="text-lg font-serif text-cream mb-2">Log Out</h3>
            <p className="text-cream-muted/60 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-cream-muted/70 font-medium hover:bg-surface-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-error text-white font-medium hover:bg-error-dark transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Account Details"
      >
        <div className="space-y-6">
          {/* Wallet Address */}
          <div>
            <label className="text-sm font-medium text-cream-muted/50 mb-2 block">Wallet Address</label>
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-subtle">
              <code className="text-sm font-mono text-cream">
                {walletAddress ? truncateAddress(walletAddress) : 'No wallet connected'}
              </code>
              {walletAddress && (
                <button
                  onClick={handleCopyAddress}
                  className="p-2 -mr-2 text-cream-muted/50 hover:text-gold-400 rounded-lg transition-all"
                  aria-label="Copy wallet address"
                >
                  {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Export Private Key */}
          <div>
            <label className="text-sm font-medium text-cream-muted/50 mb-2 block">Security</label>
            <button
              onClick={exportWallet}
              className="w-full flex items-center justify-between p-4 bg-surface border border-border-subtle rounded-xl hover:border-gold-500/30 hover:bg-surface-elevated transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-elevated rounded-lg text-cream-muted/50 group-hover:bg-gold-500/15 group-hover:text-gold-400 transition-colors">
                  <Key className="size-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-cream">Export Private Key</p>
                  <p className="text-xs text-cream-muted/40">View your wallet&apos;s secret key</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-cream-muted/30 group-hover:text-gold-400" />
            </button>
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
  destructive = false
}: { 
  icon: React.ElementType, 
  label: string, 
  onClick: () => void,
  destructive?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 transition-all hover:bg-surface-elevated active:bg-surface group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          destructive 
            ? "bg-error/10 text-error group-hover:bg-error/20"
            : "bg-surface-elevated text-cream-muted/50 group-hover:text-gold-400 group-hover:bg-gold-500/10"
        )}>
          <Icon className="size-5" />
        </div>
        <span className={cn(
          "font-semibold",
          destructive ? "text-error" : "text-cream-muted/80"
        )}>{label}</span>
      </div>
      <ChevronRight className={cn(
        "size-5 transition-colors",
        destructive ? "text-error/50 group-hover:text-error" : "text-cream-muted/30 group-hover:text-gold-400"
      )} />
    </button>
  );
}
