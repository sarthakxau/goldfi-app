'use client';

import { Sparkles, CheckCircle, Clock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GiftStatus } from '@/types';

interface GiftStatusBadgeProps {
  status: GiftStatus;
  className?: string;
}

export function GiftStatusBadge({ status, className }: GiftStatusBadgeProps) {
  const configs: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-gold-500/10 text-gold-500',
    },
    delivered: {
      icon: Clock,
      label: 'Unclaimed',
      className: 'bg-gold-500/10 text-gold-500',
    },
    claimed: {
      icon: CheckCircle,
      label: 'Claimed',
      className: 'bg-success/10 text-success',
    },
    expired: {
      icon: Clock,
      label: 'Expired',
      className: 'bg-error/10 text-error',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
        config.className,
        className
      )}
    >
      <Icon className="size-4" />
      {config.label}
    </span>
  );
}
