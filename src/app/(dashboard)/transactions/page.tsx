'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';
import { TransactionList } from '@/components/TransactionList';
import { ClipboardList, Search, SlidersHorizontal } from 'lucide-react';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [viewMode, setViewMode] = useState<'transactions' | 'statistics'>('transactions');

  const {
    transactions,
    transactionsLoading,
    setTransactions,
    setTransactionsLoading,
    setTransactionsError,
  } = useAppStore();

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const res = await fetch('/api/transactions/history');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        setTransactionsError(data.error);
      }
    } catch {
      setTransactionsError('Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [setTransactions, setTransactionsLoading, setTransactionsError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="p-6 min-h-screen">
      {/* Header with brand */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gold-500">tola</h1>
        <div className="size-9 rounded-full overflow-hidden bg-gold-gradient">
          <div className="w-full h-full" />
        </div>
      </div>

      {/* Segmented Control */}
      <div className="segmented-control mb-6">
        <button
          onClick={() => setViewMode('transactions')}
          className={`segmented-control-item ${viewMode === 'transactions' ? 'segmented-control-item-active' : ''}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setViewMode('statistics')}
          className={`segmented-control-item ${viewMode === 'statistics' ? 'segmented-control-item-active' : ''}`}
        >
          Statistics
        </button>
      </div>

      {viewMode === 'transactions' ? (
        <>
          {/* All Transactions Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">All transactions</h2>
            <button className="p-2 text-text-muted hover:text-gold-500 rounded-lg hover:bg-surface-elevated transition-colors">
              <SlidersHorizontal className="size-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 rounded-xl"
            />
          </div>

          {transactionsLoading && transactions.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-16 skeleton rounded" />
                      <div className="h-3 w-24 skeleton rounded" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 w-20 skeleton rounded ml-auto" />
                      <div className="h-3 w-16 skeleton rounded ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-surface-elevated rounded-full">
                  <ClipboardList className="size-12 text-text-muted" />
                </div>
              </div>
              <p className="text-text-secondary font-medium">No transactions yet</p>
              <p className="text-sm text-text-muted mt-1">
                Your buy and sell history will appear here
              </p>
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              highlightId={highlightId || undefined}
            />
          )}
        </>
      ) : (
        /* Statistics View */
        <div className="text-center py-12">
          <div className="p-4 bg-surface-elevated rounded-full inline-block mb-4">
            <ClipboardList className="size-12 text-text-muted" />
          </div>
          <p className="text-text-secondary font-medium">Statistics coming soon</p>
          <p className="text-sm text-text-muted mt-1">
            View your investment analytics and insights
          </p>
        </div>
      )}
    </div>
  );
}
