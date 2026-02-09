'use client';

import { motion } from 'motion/react';
import { Send, Download, Sparkles, CheckCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { cn, formatINR, formatGrams } from '@/lib/utils';
import type { GiftTransaction, GiftStatus } from '@/types';
import { SPRING } from '@/lib/animations';

interface GiftListItemProps {
  gift: GiftTransaction;
  onClick?: () => void;
  onResend?: () => void;
  resending?: boolean;
}

function getStatusConfig(status: GiftStatus) {
  switch (status) {
    case 'delivered':
      return {
        icon: Clock,
        label: 'Unclaimed',
        className: 'bg-gold-500/10 text-gold-500 border-gold-500/20',
      };
    case 'claimed':
      return {
        icon: CheckCircle,
        label: 'Claimed',
        className: 'bg-success/10 text-success border-success/20',
      };
    case 'pending':
      return {
        icon: Clock,
        label: 'Pending',
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

export function GiftListItem({ gift, onClick, onResend, resending }: GiftListItemProps) {
  const isSent = gift.type === 'sent';
  const displayName = isSent
    ? (gift.recipientName || gift.recipientEmail || 'Unknown')
    : (gift.senderName || 'Someone');
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
          <div className="flex-1 min-w-0">
            <div className="flex justify-between w-full">
              <p className="font-bold text-lg text-text-primary dark:text-[#F0F0F0]">
                {formatINR(gift.inrAmount)}
              </p>
              <div className="text-right ml-3">
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-0 border',
                    statusConfig.className
                  )}
                >
                  <StatusIcon className="size-3" />
                  {statusConfig.label}
                </div>
            </div>
            </div>
            <p className="font-semibold text-text-primary dark:text-[#F0F0F0] text-[15px]">
              {isSent ? displayName : `From ${displayName}`}
            </p>
            <p className="text-xs text-text-muted dark:text-[#6B7280] mt-0.5">
              {formatGrams(gift.gramsAmount)} gold · {formatDate(gift.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Resend button for unclaimed sent gifts */}
      {onResend && (
        <div className="mt-3 pt-3 border-t border-border-subtle dark:border-[#2D2D2D]">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onResend();
            }}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-gold-500 py-2 rounded-xl hover:bg-gold-500/5 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
            transition={SPRING.snappy}
          >
            {resending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="size-3.5" />
              </motion.div>
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            {resending ? 'Resending...' : 'Resend claim link'}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
