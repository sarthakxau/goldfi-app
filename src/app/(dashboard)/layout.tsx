'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, CreditCard, ArrowLeftRight, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      window.location.href = '/login';
    }
  }, [ready, authenticated]);

  useEffect(() => {
    if (user?.wallet?.address) {
      console.log('Connected wallet:', user.wallet.address);
    }
  }, [user?.wallet?.address]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="size-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/card', label: 'Card', icon: CreditCard },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/account', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24">
      {children}

      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 bg-surface-card/95 backdrop-blur-xl border-t border-border-subtle safe-area-bottom'
      )}>
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-3 px-4 text-xs transition-all duration-300',
                  isActive
                    ? 'text-gold-400'
                    : 'text-cream-muted/40 hover:text-cream-muted/70'
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl mb-1 transition-all duration-300",
                  isActive && "bg-gold-500/10"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
