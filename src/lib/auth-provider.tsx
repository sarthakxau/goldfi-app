import React, { useEffect, useCallback, createContext, useContext, useState } from 'react';
import { setAccessTokenGetter } from '@/lib/apiClient';
import { authFetchJson } from '@/lib/apiClient';

// ── Dev bypass (flip to false to require real login) ─────
const DEV_BYPASS_AUTH = false;
const DEV_EMAIL = 'sarthak@bulliondigital.io';

// ── Privy config ─────────────────────────────────────────

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? '';
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? '';

// ── Auth context ─────────────────────────────────────────

interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  walletAddress: string | null;
  email: string | null;
  logout: () => Promise<void>;
  syncing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isReady: false,
  isAuthenticated: false,
  userId: null,
  walletAddress: null,
  email: null,
  logout: async () => {},
  syncing: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Dev-only provider (skips Privy entirely) ─────────────

function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextValue = {
    isReady: true,
    isAuthenticated: true,
    userId: 'dev-user',
    walletAddress: null,
    email: DEV_EMAIL,
    logout: async () => {},
    syncing: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Inner component (inside PrivyProvider) ───────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  // Lazy-import Privy hooks only when actually needed (not in dev bypass)
  const { usePrivy, useEmbeddedEthereumWallet } = require('@privy-io/expo');
  const { user, isReady, logout, getAccessToken } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const privyAuthenticated = isReady && !!user;
  const wallet = wallets[0];
  const privyWallet = wallet?.address ?? null;
  const privyUserId = user?.id ?? null;

  // Extract email from linked_accounts
  const emailAccount = user?.linked_accounts?.find((a: { type: string }) => a.type === 'email');
  const privyEmail = emailAccount && 'address' in emailAccount
    ? (emailAccount as { address: string }).address
    : null;

  const isAuthenticated = privyAuthenticated;
  const walletAddress = privyWallet;
  const userId = privyUserId;
  const email = privyEmail;

  // Wire up the access token getter for apiClient
  useEffect(() => {
    if (getAccessToken) {
      setAccessTokenGetter(getAccessToken);
    }
  }, [getAccessToken]);

  // Sync user to backend after login
  useEffect(() => {
    if (!privyAuthenticated || !walletAddress || synced || syncing) return;

    let cancelled = false;

    async function syncUser() {
      setSyncing(true);
      try {
        await authFetchJson('/api/auth/sync', {
          method: 'POST',
          body: JSON.stringify({
            walletAddress,
            email,
          }),
        });
        if (!cancelled) setSynced(true);
      } catch {
        // Sync failure is non-fatal — will retry next app launch
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    syncUser();
    return () => { cancelled = true; };
  }, [privyAuthenticated, walletAddress, email, synced, syncing]);

  // Reset synced state on logout
  const handleLogout = useCallback(async () => {
    await logout();
    setSynced(false);
  }, [logout]);

  const value: AuthContextValue = {
    isReady,
    isAuthenticated,
    userId,
    walletAddress,
    email,
    logout: handleLogout,
    syncing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Exported provider (wraps PrivyProvider + AuthGate) ───

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In dev mode, skip Privy entirely to avoid SDK initialization delays/crashes
  if (DEV_BYPASS_AUTH) {
    return <DevAuthProvider>{children}</DevAuthProvider>;
  }

  const { PrivyProvider } = require('@privy-io/expo');

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <AuthGate>{children}</AuthGate>
    </PrivyProvider>
  );
}
