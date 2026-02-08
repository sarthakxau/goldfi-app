'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { pageTransition } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with a subtle fade-up entrance animation.
 * Also acts as a stagger container — direct motion children
 * with `variants` will animate in sequence.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
}
