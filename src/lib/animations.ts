/**
 * Shared animation constants for the Bullion PWA.
 * All motion variants, durations, and easings live here
 * to ensure consistency across the entire app.
 */

// ── Easing curves ────────────────────────────────────────
export const EASE_OUT = [0.25, 0.1, 0.25, 1.0] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.42, 0, 0.58, 1] as const;

// ── Durations (seconds) ─────────────────────────────────
export const DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.4,
  slower: 0.5,
} as const;

// ── Stagger delays (seconds) ────────────────────────────
export const STAGGER = {
  fast: 0.04,
  normal: 0.06,
  slow: 0.08,
} as const;

// ── Spring presets ──────────────────────────────────────
export const SPRING = {
  /** Gentle, premium feel — good for card reveals */
  gentle: { type: 'spring' as const, damping: 30, stiffness: 300 },
  /** Slightly bouncy — good for success states, badges */
  bouncy: { type: 'spring' as const, damping: 20, stiffness: 300 },
  /** Snappy — good for button presses, quick interactions */
  snappy: { type: 'spring' as const, damping: 35, stiffness: 400 },
} as const;

// ── Fade-up variant (the workhorse) ────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.normal,
      ease: EASE_OUT_EXPO,
    },
  },
} as const;

// ── Fade-in (no movement) ──────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASE_OUT,
    },
  },
} as const;

// ── Scale-in (for badges, icons, success states) ───────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.bouncy,
  },
} as const;

// ── Slide up from bottom (for modals, bottom sheets) ───
export const slideUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_OUT_EXPO,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: DURATION.normal,
      ease: EASE_IN_OUT,
    },
  },
} as const;

// ── Backdrop fade ──────────────────────────────────────
export const backdropFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast },
  },
} as const;

// ── Stagger container ──────────────────────────────────
export const staggerContainer = (
  staggerDelay: number = STAGGER.normal,
  delayChildren: number = 0
) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ── Page transition ────────────────────────────────────
export const pageTransition = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.normal,
      ease: EASE_OUT_EXPO,
      staggerChildren: STAGGER.normal,
      delayChildren: 0.05,
    },
  },
} as const;

// ── Slide up from bottom with spring physics ───────────
export const slideUpSpring = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 280,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: DURATION.normal,
      ease: EASE_IN_OUT,
    },
  },
} as const;

// ── Modal scale + fade (for centered modals) ──────────
export const modalScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASE_OUT_EXPO,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATION.fast,
      ease: EASE_IN_OUT,
    },
  },
} as const;

// ── Highlight pulse (for drawing attention) ────────────
export const highlightPulse = {
  initial: { boxShadow: '0 0 0 0 rgba(184, 134, 11, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(184, 134, 11, 0)',
      '0 0 0 6px rgba(184, 134, 11, 0.2)',
      '0 0 0 0 rgba(184, 134, 11, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: 2,
      ease: EASE_IN_OUT,
    },
  },
} as const;
