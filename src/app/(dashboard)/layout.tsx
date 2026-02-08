'use client';

import React, { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePrivy, getAccessToken } from '@privy-io/react-auth';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, CreditCard, Sprout, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { ready, authenticated, user } = usePrivy();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (ready && !authenticated) {
      window.location.href = '/login';
    }
  }, [ready, authenticated]);

  // Sync user to database when authenticated
  useEffect(() => {
    async function syncUser() {
      if (!ready || !authenticated || !user?.wallet?.address || hasSyncedRef.current) {
        return;
      }

      try {
        hasSyncedRef.current = true;
        const token = await getAccessToken();
        
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            walletAddress: user.wallet.address,
            email: user.email?.address || null,
          }),
        });

        const data = await res.json();
        if (data.success) {
          console.log('User synced to database:', data.data);
        } else {
          console.error('Failed to sync user:', data.error);
          // Reset flag to allow retry on next mount
          hasSyncedRef.current = false;
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        hasSyncedRef.current = false;
      }
    }

    syncUser();
  }, [ready, authenticated, user?.wallet?.address, user?.email?.address]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] flex items-center justify-center">
        <motion.div
          className="size-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/card', label: 'Card', icon: CreditCard },
    { href: '/yield', label: 'Earn', icon: Sprout },
    { href: '/account', label: 'Settings', icon: Settings },
  ];

  const activeIndex = navItems.findIndex((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] pb-36">
      {/* Page content with fade-up entrance */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>

      {/* Disclaimer */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-border-subtle dark:border-[#2D2D2D] z-10">
        <div className="max-w-lg mx-auto py-3 px-4 text-center">
          <p className="text-xs text-text-muted dark:text-[#6B7280]">
            Crypto products are unregulated and risky.{" "}
            <a
              href="#"
              className="text-gold-500 hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300 underline transition-colors"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] shadow-nav dark:shadow-none dark:border-t dark:border-[#2D2D2D] safe-area-bottom">
        <div className="max-w-lg mx-auto flex justify-around relative">
          {/* Sliding active indicator */}
          {activeIndex >= 0 && (
            <motion.div
              className="absolute top-0 h-0.5 bg-gold-500 rounded-full"
              style={{ width: `${100 / navItems.length}%` }}
              animate={{ left: `${(activeIndex / navItems.length) * 100}%` }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            />
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-3 px-4 text-xs transition-colors duration-200',
                  isActive
                    ? 'text-gold-500'
                    : 'text-text-muted hover:text-text-secondary dark:text-[#6B7280] dark:hover:text-[#9CA3AF]'
                )}
              >
                <motion.div
                  className={cn(
                    "p-2 rounded-xl mb-1",
                    isActive && "bg-gold-100 dark:bg-gold-500/10"
                  )}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                </motion.div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
