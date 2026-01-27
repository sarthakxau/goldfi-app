'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';
import { TransactionList } from '@/components/TransactionList';
import { ClipboardList } from 'lucide-react';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

      {transactionsLoading && transactions.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-16 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-20 skeleton ml-auto" />
                  <div className="h-3 w-16 skeleton ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ClipboardList className="size-12 text-gray-300" />
          </div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your buy and sell history will appear here
          </p>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          highlightId={highlightId || undefined}
        />
      )}
    </div>
  );
}
