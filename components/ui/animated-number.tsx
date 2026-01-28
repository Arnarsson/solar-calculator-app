'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  /** Spring damping - higher = less bounce */
  damping?: number;
  /** Spring stiffness - higher = faster animation */
  stiffness?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
}

export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString('da-DK'),
  className,
  damping = 30,
  stiffness = 100,
  delay = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        // Skip animation for users who prefer reduced motion
        if (ref.current) {
          ref.current.textContent = format(value);
        }
        return;
      }

      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [motionValue, value, isInView, delay, prefersReducedMotion, format]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });

    return unsubscribe;
  }, [springValue, format, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {format(prefersReducedMotion ? value : 0)}
    </span>
  );
}

// Pre-configured variants for common use cases
export function AnimatedCurrency({
  value,
  currency = 'DKK',
  className,
  ...props
}: Omit<AnimatedNumberProps, 'format'> & { currency?: string }) {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <AnimatedNumber
      value={value}
      format={formatCurrency}
      className={className}
      {...props}
    />
  );
}

export function AnimatedPercentage({
  value,
  decimals = 1,
  className,
  ...props
}: Omit<AnimatedNumberProps, 'format'> & { decimals?: number }) {
  const formatPercentage = (n: number) =>
    `${n.toFixed(decimals)}%`;

  return (
    <AnimatedNumber
      value={value}
      format={formatPercentage}
      className={className}
      {...props}
    />
  );
}

export function AnimatedKWh({
  value,
  decimals = 0,
  className,
  ...props
}: Omit<AnimatedNumberProps, 'format'> & { decimals?: number }) {
  const formatKWh = (n: number) =>
    `${n.toLocaleString('da-DK', { maximumFractionDigits: decimals })} kWh`;

  return (
    <AnimatedNumber
      value={value}
      format={formatKWh}
      className={className}
      {...props}
    />
  );
}
