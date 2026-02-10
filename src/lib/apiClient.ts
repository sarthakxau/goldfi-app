import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  '';

/**
 * Token getter — will be set by the auth provider once Privy is initialised.
 * This avoids a hard dependency on @privy-io/expo at import time.
 */
let _getAccessToken: (() => Promise<string | null>) | null = null;

export function setAccessTokenGetter(fn: () => Promise<string | null>) {
  _getAccessToken = fn;
}

/**
 * Authenticated fetch wrapper that attaches Bearer token.
 * Use this for all API calls that require authentication.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = _getAccessToken ? await _getAccessToken() : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Prepend base URL for relative paths
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}

/**
 * Authenticated fetch that returns parsed JSON with typed response.
 */
export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await authFetch(url, options);
  return res.json();
}
