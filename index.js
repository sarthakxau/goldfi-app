// Crypto polyfill — MUST run before any module that touches globalThis.crypto
// (e.g. @privy-io/expo, jose, viem). Expo Router evaluates route files in
// parallel, so putting this in _layout.tsx is too late.

import { getRandomValues, randomUUID, digest } from 'expo-crypto';
import { CryptoDigestAlgorithm } from 'expo-crypto';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = /** @type {any} */ ({});
}

if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = /** @type {any} */ (getRandomValues);
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = /** @type {any} */ (randomUUID);
}

if (!globalThis.crypto.subtle) {
  const algorithmMap = {
    'SHA-1': CryptoDigestAlgorithm.SHA1,
    'SHA-256': CryptoDigestAlgorithm.SHA256,
    'SHA-384': CryptoDigestAlgorithm.SHA384,
    'SHA-512': CryptoDigestAlgorithm.SHA512,
  };

  globalThis.crypto.subtle = /** @type {any} */ ({
    async digest(algorithm, data) {
      const algoName = typeof algorithm === 'string' ? algorithm : algorithm.name;
      const mapped = algorithmMap[algoName];
      if (!mapped) throw new Error(`Unsupported digest algorithm: ${algoName}`);
      const hex = String(await digest(mapped, data));
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes.buffer;
    },
  });
}

// NOW load Expo Router (which will evaluate all route files)
import 'expo-router/entry';
