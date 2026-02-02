'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatINR } from '@/lib/utils'; // You might need new formatters

interface Transaction {
  id: string;
  type: string;
  status: string;
  usdtAmount?: string | null;
  createdAt: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/transactions/history')
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setTransactions(data.data);
            }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
       {/* Backdrop */}
       <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

       {/* Modal Content */}
       <div className="relative bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-[2rem] p-6 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
                <button onClick={onClose} className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0]" aria-label="Close modal">
                    <X className="size-6" />
                </button>
                <div className="w-6" />
            </div>

            <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] text-center mb-8">deposit history</h2>

            {/* Header Row */}
            <div className="grid grid-cols-3 text-xs text-text-muted dark:text-[#6B7280] font-medium px-2 mb-4">
                <div>amount</div>
                <div className="text-center">status</div>
                <div className="text-right">date</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2">
                {loading ? (
                    <div className="text-center text-text-muted dark:text-[#6B7280] py-8">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-text-muted dark:text-[#6B7280] py-8">No history yet</div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-3 text-sm py-2 border-b border-border-subtle dark:border-[#2D2D2D] last:border-0">
                            <div className="font-medium text-text-primary dark:text-[#F0F0F0]">
                                {tx.usdtAmount ? `${parseFloat(tx.usdtAmount).toFixed(2)} USDT` : '-'}
                            </div>
                            <div className="text-center">
                                <span className={`
                                    px-2 py-1 rounded-full text-xs
                                    ${tx.status === 'completed' || tx.status === 'received' ? 'bg-success-light dark:bg-success/10 text-success' : ''}
                                    ${tx.status === 'processing' || tx.status === 'pending' ? 'bg-warning-light dark:bg-warning/10 text-warning-dark dark:text-warning' : ''}
                                    ${tx.status === 'failed' ? 'bg-error-light dark:bg-error/10 text-error' : ''}
                                `}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="text-right text-text-secondary dark:text-[#9CA3AF]">
                                {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <a href="#" className="block text-center text-sm text-text-muted dark:text-[#6B7280] mt-6 hover:text-text-secondary dark:hover:text-[#9CA3AF]">view more</a>

            <div className="mt-8 space-y-2 text-sm text-text-secondary dark:text-[#9CA3AF]">
                <a href="#" className="block hover:text-text-primary dark:hover:text-[#F0F0F0]">get support</a>
                <a href="#" className="block hover:text-text-primary dark:hover:text-[#F0F0F0]">why can't i see my deposit?</a>
                <a href="#" className="block hover:text-text-primary dark:hover:text-[#F0F0F0]">see FAQs</a>
            </div>
       </div>
    </div>,
    document.body
  );
}
