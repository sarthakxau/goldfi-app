/**
 * Polyfills for React Native / Expo Go.
 * MUST be imported at the very top of app/_layout.tsx, before any other imports.
 */

import { getRandomValues, randomUUID, digest } from 'expo-crypto';
import { CryptoDigestAlgorithm } from 'expo-crypto';

// Polyfill globalThis.crypto for libraries like jose, viem, @privy-io/expo
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error -- partial Web Crypto API polyfill
  globalThis.crypto = {};
}

if (!globalThis.crypto.getRandomValues) {
  // @ts-expect-error -- expo-crypto compatible polyfill
  globalThis.crypto.getRandomValues = getRandomValues;
}

if (!globalThis.crypto.randomUUID) {
  // @ts-expect-error -- return type mismatch (string vs template literal)
  globalThis.crypto.randomUUID = randomUUID;
}

// Polyfill crypto.subtle.digest (needed by jose for JWT verification)
if (!globalThis.crypto.subtle) {
  const algorithmMap: Record<string, CryptoDigestAlgorithm> = {
    'SHA-1': CryptoDigestAlgorithm.SHA1,
    'SHA-256': CryptoDigestAlgorithm.SHA256,
    'SHA-384': CryptoDigestAlgorithm.SHA384,
    'SHA-512': CryptoDigestAlgorithm.SHA512,
  };

  // @ts-expect-error -- partial SubtleCrypto polyfill
  globalThis.crypto.subtle = {
    async digest(
      algorithm: string | { name: string },
      data: ArrayBuffer
    ): Promise<ArrayBuffer> {
      const algoName = typeof algorithm === 'string' ? algorithm : algorithm.name;
      const mapped = algorithmMap[algoName];
      if (!mapped) {
        throw new Error(`Unsupported digest algorithm: ${algoName}`);
      }
      const hex = await digest(mapped, data);
      // expo-crypto digest returns a hex string; convert to ArrayBuffer
      const hexStr = String(hex);
      const bytes = new Uint8Array(hexStr.length / 2);
      for (let i = 0; i < hexStr.length; i += 2) {
        bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
      }
      return bytes.buffer;
    },
  };
}
