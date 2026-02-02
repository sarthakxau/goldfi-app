'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { arbitrum } from 'viem/chains';
import { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from '@/lib/theme';

function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
          accentColor: '#B8860B',
          logo: '/icon-192x192.png',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: arbitrum,
        supportedChains: [arbitrum],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render Privy until we're on the client to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-gold-500 border-t-transparent border-4 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <PrivyWrapper>{children}</PrivyWrapper>
    </ThemeProvider>
  );
}
