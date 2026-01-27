'use client';

import { formatINR, formatGrams, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import Decimal from 'decimal.js';
import { ExternalLink } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  highlightId?: string;
}

const statusColors = {
  pending: 'badge-warning',
  processing: 'badge-warning',
  completed: 'badge-success',
  failed: 'badge-error',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Success',
  failed: 'Failed',
};

// Group transactions by date
function groupByDate(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  transactions.forEach((tx) => {
    const txDate = new Date(tx.createdAt).toDateString();
    let label: string;
    
    if (txDate === today) {
      label = 'Today';
    } else if (txDate === yesterday) {
      label = 'Yesterday';
    } else {
      label = new Date(tx.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

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
}: TransactionListProps) {
  const groupedTransactions = groupByDate(transactions);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
        <div key={dateLabel}>
          <h3 className="text-sm font-medium text-cream-muted/40 mb-3 font-serif">{dateLabel}</h3>
          <div className="space-y-3">
            {txs.map((tx) => {
              const xautGrams = tx.xautAmount
                ? new Decimal(tx.xautAmount).times(31.1035).toNumber()
                : 0;

              return (
                <div
                  key={tx.id}
                  className={cn(
                    'card p-4 transition-all duration-300',
                    tx.id === highlightId
                      ? 'border-gold-500 ring-1 ring-gold-500/30 shadow-gold-glow'
                      : ''
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Gold Coin Icon */}
                      <div className="gold-coin">
                        <span className="text-sm font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-semibold text-cream capitalize">
                          {tx.type === 'buy' ? 'Purchased' : 'Sold'}
                        </p>
                        <span className={cn('badge', statusColors[tx.status as keyof typeof statusColors])}>
                          • {statusLabels[tx.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-serif tabular-nums text-lg',
                        tx.type === 'buy' ? 'text-cream' : 'text-success'
                      )}>
                        {tx.type === 'buy' ? '+' : '-'}{formatINR(tx.inrAmount || 0)}
                      </p>
                      <p className="text-sm text-cream-muted/40 tabular-nums">
                        {formatGrams(xautGrams)}
                      </p>
                    </div>
                  </div>

                  {tx.blockchainTxHash && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <a
                        href={`https://arbiscan.io/tx/${tx.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gold-400 hover:text-gold-300 inline-flex items-center gap-1"
                      >
                        View on Arbiscan <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}

                  {tx.status === 'failed' && tx.errorMessage && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-xs text-error">{tx.errorMessage}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
