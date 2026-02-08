'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useMotionValue,
  useTransform,
  animate as motionAnimate,
  useReducedMotion,
} from 'motion/react';

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Format function applied to the animated number for display */
  format?: (n: number) => string;
  /** Animation duration in seconds */
  duration?: number;
  /** CSS class for the wrapper span */
  className?: string;
}

/**
 * Smoothly morphs from one number to another.
 * Great for financial values (holdings, prices, balances).
 */
export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString('en-IN'),
  duration = 0.6,
  className,
}: AnimatedNumberProps) {
  const shouldReduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const displayed = useTransform(motionValue, (v) => format(v));
  const [text, setText] = useState(format(value));
  const prevValue = useRef(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render — just show the value immediately
    if (isFirstRender.current) {
      isFirstRender.current = false;
      motionValue.set(value);
      setText(format(value));
      prevValue.current = value;
      return;
    }

    if (shouldReduce || prevValue.current === value) {
      motionValue.set(value);
      setText(format(value));
      prevValue.current = value;
      return;
    }

    const controls = motionAnimate(motionValue, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1.0],
    });

    const unsubscribe = displayed.on('change', (v) => setText(v));

    prevValue.current = value;

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, format, shouldReduce, motionValue, displayed]);

  return <span className={className}>{text}</span>;
}
