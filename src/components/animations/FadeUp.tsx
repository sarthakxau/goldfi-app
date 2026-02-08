'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { fadeUp, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Distance to travel upward (px) */
  distance?: number;
  /** Duration override (seconds) */
  duration?: number;
  /** Animate when scrolled into view instead of on mount */
  inView?: boolean;
  /** Only animate once when scrolling into view */
  once?: boolean;
}

export function FadeUp({
  children,
  className,
  delay = 0,
  distance = 12,
  duration = DURATION.normal,
  inView = false,
  once = true,
}: FadeUpProps) {
  const variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: EASE_OUT_EXPO,
        delay,
      },
    },
  };

  if (inView) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.2 }}
        variants={variants}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/** Simplified fade-up for use inside stagger containers */
export function FadeUpItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
