'use client';

import { formatINR, formatGrams, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import Decimal from 'decimal.js';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  highlightId?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function TransactionList({
  transactions,
  highlightId,
}: TransactionListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const xautGrams = tx.xautAmount
          ? new Decimal(tx.xautAmount).times(31.1035).toNumber()
          : 0;

        return (
          <div
            key={tx.id}
            className={cn(
              'bg-white rounded-xl p-4 border transition-all',
              tx.id === highlightId
                ? 'border-gold-500 ring-2 ring-gold-200'
                : 'border-gray-100'
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-8 rounded-full flex items-center justify-center',
                    tx.type === 'buy' ? 'bg-gold-100' : 'bg-green-100'
                  )}
                >
                  {tx.type === 'buy' ? (
                    <ArrowDownCircle className="size-5 text-gold-600" />
                  ) : (
                    <ArrowUpCircle className="size-5 text-green-600" />
                  )}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {tx.type} Gold
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  statusColors[tx.status as keyof typeof statusColors]
                )}
              >
                {statusLabels[tx.status as keyof typeof statusLabels]}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-semibold text-gray-900 tabular-nums">
                  {formatGrams(xautGrams)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Value</p>
                <p
                  className={cn(
                    'font-semibold tabular-nums',
                    tx.type === 'buy' ? 'text-gold-600' : 'text-green-600'
                  )}
                >
                  {tx.type === 'buy' ? '-' : '+'}
                  {formatINR(tx.inrAmount || 0)}
                </p>
              </div>
            </div>

            {tx.blockchainTxHash && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <a
                  href={`https://arbiscan.io/tx/${tx.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on Arbiscan →
                </a>
              </div>
            )}

            {tx.status === 'failed' && tx.errorMessage && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-red-600">{tx.errorMessage}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
