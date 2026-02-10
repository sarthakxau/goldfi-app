/**
 * Shared animation constants for the Bullion app (React Native).
 *
 * Uses Reanimated 3 withTiming / withSpring under the hood.
 * Moti's `from` / `animate` / `exit` props map directly to these presets.
 *
 * Usage with Moti:
 *   import { MotiView } from 'moti';
 *   import { FADE_UP } from '@/lib/animations';
 *   <MotiView {...FADE_UP} />
 */

import { Easing } from 'react-native-reanimated';

// ── Easing curves ────────────────────────────────────────
export const EASE_OUT = Easing.out(Easing.quad);
export const EASE_OUT_EXPO = Easing.out(Easing.exp);
export const EASE_IN_OUT = Easing.inOut(Easing.quad);

// ── Durations (milliseconds — Reanimated uses ms) ───────
export const DURATION = {
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 500,
} as const;

// ── Stagger delays (milliseconds) ────────────────────────
export const STAGGER = {
  fast: 40,
  normal: 60,
  slow: 80,
} as const;

// ── Spring configs (for Reanimated withSpring) ───────────
export const SPRING = {
  /** Gentle, premium feel — good for card reveals */
  gentle: { damping: 30, stiffness: 300 },
  /** Slightly bouncy — good for success states, badges */
  bouncy: { damping: 20, stiffness: 300 },
  /** Snappy — good for button presses, quick interactions */
  snappy: { damping: 35, stiffness: 400 },
} as const;

// ── Moti animation presets ───────────────────────────────
// Spread these directly on <MotiView {...FADE_UP} />

/** Standard entrance: fade + translate up 12px */
export const FADE_UP = {
  from: { opacity: 0, translateY: 12 },
  animate: { opacity: 1, translateY: 0 },
  transition: {
    type: 'timing' as const,
    duration: DURATION.normal,
    easing: EASE_OUT_EXPO,
  },
};

/** Simple fade — no movement */
export const FADE_IN = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    type: 'timing' as const,
    duration: DURATION.normal,
    easing: EASE_OUT,
  },
};

/** Scale in — for badges, icons, success states */
export const SCALE_IN = {
  from: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    type: 'spring' as const,
    ...SPRING.bouncy,
  },
};

/** Page entrance: subtle fade + small translateY */
export const PAGE_TRANSITION = {
  from: { opacity: 0, translateY: 8 },
  animate: { opacity: 1, translateY: 0 },
  transition: {
    type: 'timing' as const,
    duration: DURATION.normal,
    easing: EASE_OUT_EXPO,
  },
};

/** Modal scale + fade */
export const MODAL_SCALE = {
  from: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: {
    type: 'timing' as const,
    duration: DURATION.normal,
    easing: EASE_OUT_EXPO,
  },
};

/** Backdrop overlay fade */
export const BACKDROP_FADE = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    type: 'timing' as const,
    duration: DURATION.fast,
  },
};

// ── Helper: staggered delay for list items ───────────────

/**
 * Returns a Moti `delay` value for staggered list items.
 *
 * Usage:
 *   {items.map((item, i) => (
 *     <MotiView
 *       key={item.id}
 *       {...FADE_UP}
 *       delay={staggerDelay(i)}
 *     />
 *   ))}
 */
export function staggerDelay(
  index: number,
  interval: number = STAGGER.normal,
  baseDelay: number = 0
): number {
  return baseDelay + index * interval;
}

// ── Legacy name re-exports (for compat with existing references) ─
export const fadeUp = FADE_UP;
export const fadeIn = FADE_IN;
export const scaleIn = SCALE_IN;
export const pageTransition = PAGE_TRANSITION;
export const modalScale = MODAL_SCALE;
export const backdropFade = BACKDROP_FADE;
