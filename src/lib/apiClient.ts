'use client';

import { getAccessToken } from '@privy-io/react-auth';

/**
 * Authenticated fetch wrapper that attaches Privy Bearer token.
 * Use this for all API calls that require authentication.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Ensure content-type is set for JSON requests
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Authenticated fetch that returns parsed JSON with typed response.
 * Automatically handles success/error structure used across the API.
 */
export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await authFetch(url, options);
  return res.json();
}
