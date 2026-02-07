'use client';

import { formatINR, formatGrams, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import Decimal from 'decimal.js';
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  highlightId?: string;
  variant?: 'card' | 'separated';
  showDateHeaders?: boolean;
  showInlineDate?: boolean;
}

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Success',
  failed: 'Failed',
};

const statusDotColors = {
  pending: 'bg-warning',
  processing: 'bg-warning',
  completed: 'bg-success',
  failed: 'bg-error',
};

// Group transactions by date
function groupByDate(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};
  const today = new Date().toDateString();

  transactions.forEach((tx) => {
    const txDate = new Date(tx.createdAt).toDateString();
    const label = txDate === today
      ? 'today'
      : new Date(tx.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(tx);
  });

  return groups;
}

export function TransactionList({
  transactions,
  highlightId,
  variant = 'card',
  showDateHeaders = true,
  showInlineDate = false,
}: TransactionListProps) {
  const groupedTransactions = groupByDate(transactions);
  const renderTxItem = (tx: Transaction) => {
    const xautGrams = tx.xautAmount
      ? new Decimal(tx.xautAmount).times(31.1035).toNumber()
      : 0;
    const txTime = new Date(tx.completedAt ?? tx.createdAt).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const txDate = new Date(tx.completedAt ?? tx.createdAt);
    const isToday = txDate.toDateString() === new Date().toDateString();
    const txDateLabel = isToday
      ? 'today'
      : txDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

    return (
      <div
        key={tx.id}
        className={cn(
          variant === 'card'
            ? 'card p-4 transition-all duration-300'
            : 'py-4',
          tx.id === highlightId
            ? 'border-gold-500 ring-1 ring-gold-500/30'
            : ''
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-12 rounded-2xl flex items-center justify-center',
                tx.type === 'buy'
                  ? 'bg-success/10 text-success/80'
                  : 'bg-error/10 text-error/80'
              )}
              aria-hidden="true"
            >
              {tx.type === 'buy' ? (
                <ArrowDownLeft className="size-6" />
              ) : (
                <ArrowUpRight className="size-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary dark:text-[#F0F0F0] capitalize">
                  {tx.type === 'buy' ? 'Purchased' : 'Sold'}
                </p>
                <span
                  className={cn(
                    'inline-block size-2 rounded-full',
                    statusDotColors[tx.status as keyof typeof statusDotColors]
                  )}
                  aria-label={statusLabels[tx.status as keyof typeof statusLabels]}
                />
              </div>
              <p className="text-sm text-text-muted dark:text-[#6B7280]">
                {showInlineDate ? `${txDateLabel}, ${txTime}` : txTime}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              'font-bold tabular-nums text-lg',
              tx.type === 'buy' ? 'text-text-primary dark:text-[#F0F0F0]' : 'text-success'
            )}>
              {tx.type === 'buy' ? '+' : '-'}{formatINR(tx.inrAmount || 0)}
            </p>
            <p className="text-sm text-text-muted dark:text-[#6B7280] tabular-nums">
              {formatGrams(xautGrams)}
            </p>
          </div>
        </div>

        {tx.blockchainTxHash && (
          <div className="mt-3 pt-3 border-t border-border-subtle dark:border-[#2D2D2D]">
            <a
              href={`https://arbiscan.io/tx/${tx.blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-500 hover:text-gold-400 inline-flex items-center gap-1"
            >
              View on Arbiscan <ExternalLink className="size-3" />
            </a>
          </div>
        )}

        {tx.status === 'failed' && tx.errorMessage && (
          <div className="mt-3 pt-3 border-t border-border-subtle dark:border-[#2D2D2D]">
            <p className="text-xs text-error">{tx.errorMessage}</p>
          </div>
        )}
      </div>
    );
  };

  if (!showDateHeaders) {
    return (
      <div className={cn(variant === 'card' ? 'space-y-3' : 'divide-y divide-border-subtle dark:divide-[#2D2D2D]')}>
        {transactions.map(renderTxItem)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
        <div key={dateLabel}>
          <h2 className="text-sm font-medium text-text-muted dark:text-[#6B7280] mb-3">{dateLabel}</h2>
          <div className={cn(variant === 'card' ? 'space-y-3' : 'divide-y divide-border-subtle dark:divide-[#2D2D2D]')}>
            {txs.map(renderTxItem)}
          </div>
        </div>
      ))}
    </div>
  );
}
