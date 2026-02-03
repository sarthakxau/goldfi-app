import { verifyAccessToken } from '@privy-io/node';
import { createRemoteJWKSet } from 'jose';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

// Create JWKS key fetcher for Privy (caches keys automatically)
const privyJWKS = createRemoteJWKSet(
  new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/.well-known/jwks.json`)
);

export interface AuthUser {
  privyUserId: string;
}

/**
 * Verifies the Privy access token from the request.
 * Checks Authorization header first, then falls back to privy-token cookie.
 * 
 * @returns The authenticated user's Privy DID, or null if not authenticated
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    // Try Authorization header first (for fetch calls with Bearer token)
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    let accessToken = authHeader?.replace('Bearer ', '') || null;

    // Fallback to privy-token cookie
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('privy-token')?.value || null;
    }

    if (!accessToken) {
      return null;
    }

    const verifiedClaims = await verifyAccessToken({
      access_token: accessToken,
      app_id: PRIVY_APP_ID,
      verification_key: privyJWKS,
    });

    return { privyUserId: verifiedClaims.user_id };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
