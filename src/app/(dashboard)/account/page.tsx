'use client';

import React from 'react';
import { User, Shield, Info, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const userName = 'user'; // This would come from auth context in reality
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${userName}&backgroundColor=F59E0B&textColor=ffffff`;

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
              onClick={() => {}} 
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
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 transition-all hover:bg-gold-50/50 active:bg-gray-50 group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-gray-50 text-gray-500 group-hover:text-gold-600 group-hover:bg-gold-100 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gold-400 transition-colors" />
    </button>
  );
}
