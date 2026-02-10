import React, { useEffect, useCallback, createContext, useContext, useState } from 'react';
import { PrivyProvider, usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { setAccessTokenGetter } from '@/lib/apiClient';
import { authFetchJson } from '@/lib/apiClient';

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

// ── Inner component (inside PrivyProvider) ───────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isReady, logout, getAccessToken } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const isAuthenticated = isReady && !!user;
  const wallet = wallets[0];
  const walletAddress = wallet?.address ?? null;
  const userId = user?.id ?? null;

  // Extract email from linked_accounts
  const emailAccount = user?.linked_accounts?.find((a) => a.type === 'email');
  const email = emailAccount && 'address' in emailAccount
    ? (emailAccount as { address: string }).address
    : null;

  // Wire up the access token getter for apiClient
  useEffect(() => {
    if (getAccessToken) {
      setAccessTokenGetter(getAccessToken);
    }
  }, [getAccessToken]);

  // Sync user to backend after login
  useEffect(() => {
    if (!isAuthenticated || !walletAddress || synced || syncing) return;

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
  }, [isAuthenticated, walletAddress, email, synced, syncing]);

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
