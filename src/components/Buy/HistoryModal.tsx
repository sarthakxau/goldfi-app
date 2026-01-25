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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       {/* Backdrop */}
       <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

       {/* Modal Content */}
       <div className="relative bg-white w-full max-w-lg rounded-[2rem] p-6 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
                    <X className="w-6 h-6" />
                </button>
                <div className="w-6" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">deposit history</h2>

            {/* Header Row */}
            <div className="grid grid-cols-3 text-xs text-gray-400 font-medium px-2 mb-4">
                <div>amount</div>
                <div className="text-center">status</div>
                <div className="text-right">date</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No history yet</div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-3 text-sm py-2 border-b border-gray-50 last:border-0">
                            <div className="font-medium text-gray-900">
                                {tx.usdtAmount ? `${parseFloat(tx.usdtAmount).toFixed(2)} USDT` : '-'}
                            </div>
                            <div className="text-center">
                                <span className={`
                                    px-2 py-1 rounded-full text-xs
                                    ${tx.status === 'completed' || tx.status === 'received' ? 'bg-green-100 text-green-700' : ''}
                                    ${tx.status === 'processing' || tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                    ${tx.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                                `}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="text-right text-gray-500">
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

            <a href="#" className="block text-center text-sm text-gray-400 mt-6 hover:text-gray-600">view more</a>

            <div className="mt-8 space-y-2 text-sm text-gray-500">
                <a href="#" className="block hover:text-gray-900">get support</a>
                <a href="#" className="block hover:text-gray-900">why can't i see my deposit?</a>
                <a href="#" className="block hover:text-gray-900">see FAQs</a>
            </div>
       </div>
    </div>,
    document.body
  );
}
