'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerContainer, fadeUp, STAGGER } from '@/lib/animations';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child animation (seconds) */
  staggerDelay?: number;
  /** Initial delay before the first child animates (seconds) */
  delayChildren?: number;
  /** Animate when scrolled into view instead of on mount */
  inView?: boolean;
  /** Only animate once */
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = STAGGER.normal,
  delayChildren = 0,
  inView = false,
  once = true,
}: StaggerContainerProps) {
  const variants = staggerContainer(staggerDelay, delayChildren);

  if (inView) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.15 }}
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

/** 
 * A child item that inherits stagger timing from StaggerContainer.
 * Uses the standard fadeUp variant by default. 
 */
export function StaggerItem({
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
