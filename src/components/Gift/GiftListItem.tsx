'use client';

import { motion } from 'motion/react';
import { Send, Download, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { cn, formatINR, formatGrams } from '@/lib/utils';
import type { GiftTransaction, GiftStatus } from '@/types';
import { SPRING } from '@/lib/animations';

interface GiftListItemProps {
  gift: GiftTransaction;
  onClick?: () => void;
}

function getStatusConfig(status: GiftStatus) {
  switch (status) {
    case 'delivered':
      return {
        icon: CheckCircle,
        label: 'Delivered',
        className: 'bg-success/10 text-success border-success/20',
      };
    case 'opened':
      return {
        icon: Sparkles,
        label: 'Opened',
        className: 'bg-gold-500/10 text-gold-500 border-gold-500/20',
      };
    case 'added_to_vault':
      return {
        icon: CheckCircle,
        label: 'Added to vault',
        className: 'bg-success/10 text-success border-success/20',
      };
    case 'pending':
    case 'claimed':
      return {
        icon: Clock,
        label: 'Pending claim',
        className: 'bg-gold-500/10 text-gold-500 border-gold-500/20',
      };
    case 'expired':
      return {
        icon: Clock,
        label: 'Expired',
        className: 'bg-error/10 text-error border-error/20',
      };
    default:
      return {
        icon: Clock,
        label: 'Pending',
        className: 'bg-text-muted/10 text-text-muted border-text-muted/20',
      };
  }
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  return `${day} ${month}`;
}

export function GiftListItem({ gift, onClick }: GiftListItemProps) {
  const isSent = gift.type === 'sent';
  const displayName = isSent ? gift.recipientName : gift.senderName;
  const Icon = isSent ? Send : Download;
  const statusConfig = getStatusConfig(gift.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-4 cursor-pointer"
      whileTap={{ scale: 0.98 }}
      transition={SPRING.snappy}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gold-100 dark:bg-gold-500/10 flex items-center justify-center">
            <Icon className="size-5 text-gold-500 dark:text-gold-400" />
          </div>
          <div>
            <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-[15px]">
              {isSent ? displayName : `From ${displayName}`}
            </p>
            <p className="text-xs text-text-muted dark:text-[#6B7280] mt-0.5">
              {formatGrams(gift.gramsAmount)} gold · {formatDate(gift.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-text-primary dark:text-[#F0F0F0]">
            {formatINR(gift.inrAmount)}
          </p>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 border',
              statusConfig.className
            )}
          >
            <StatusIcon className="size-3" />
            {statusConfig.label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
