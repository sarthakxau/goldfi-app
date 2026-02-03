import { PrivyClient } from '@privy-io/node';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;

// Create a singleton PrivyClient instance
const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
});

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

    // Use PrivyClient to verify the access token
    const verifiedClaims = await privy.utils().auth().verifyAccessToken(accessToken);

    return { privyUserId: verifiedClaims.user_id };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
