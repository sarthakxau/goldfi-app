'use client';

import React, { useState } from 'react';
import { User, Shield, Info, HelpCircle, ChevronRight, LogOut, Copy, Key, Check } from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from '@/components/CardModals';

export default function AccountPage() {
  const { user, logout, exportWallet } = usePrivy();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = user?.email?.address?.split('@')[0] || 'User';
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${userName}&backgroundColor=F59E0B&textColor=ffffff`;
  const walletAddress = user?.wallet?.address;

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 bg-white border-b border-gray-100 rounded-b-[2rem] shadow-sm">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={avatarUrl} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online/Status Indicator (Optional visual flair) */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{userName}</h1>
        <p className="text-sm text-gray-500 font-medium">Gold Member</p>
      </div>

      {/* Settings Section */}
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Settings</h2>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
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
              onClick={logout}
              destructive
            />
          </div>
        </div>
      </div>

      {/* Account Modal */}
      <Modal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)}
        title="Account Details"
      >
        <div className="space-y-6">
          {/* Wallet Address */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Wallet Address</label>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <code className="text-sm font-mono text-gray-900">
                {walletAddress ? truncateAddress(walletAddress) : 'No wallet connected'}
              </code>
              {walletAddress && (
                <button 
                  onClick={handleCopyAddress}
                  className="p-2 -mr-2 text-gray-500 hover:bg-white hover:text-gold-600 rounded-lg transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Export Private Key */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Security</label>
            <button
              onClick={exportWallet}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gold-300 hover:bg-gold-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
                  <Key className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Export Private Key</p>
                  <p className="text-xs text-gray-500">View your wallet's secret key</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gold-400" />
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
  icon: any, 
  label: string, 
  onClick: () => void,
  destructive?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 transition-all hover:bg-gold-50/50 active:bg-gray-50 group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          destructive 
            ? "bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600"
            : "bg-gray-50 text-gray-500 group-hover:text-gold-600 group-hover:bg-gold-100"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
          "font-semibold",
          destructive ? "text-red-600" : "text-gray-700"
        )}>{label}</span>
      </div>
      <ChevronRight className={cn(
        "w-5 h-5 transition-colors",
        destructive ? "text-red-200 group-hover:text-red-400" : "text-gray-300 group-hover:text-gold-400"
      )} />
    </button>
  );
}
