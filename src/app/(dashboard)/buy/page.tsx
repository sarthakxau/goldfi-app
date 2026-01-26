'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { SwapModal } from '@/components/Buy/SwapModal';
import { HistoryModal } from '@/components/Buy/HistoryModal';

export default function BuyPage() {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen bg-white relative">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl font-semibold text-gray-900 mx-auto pl-6">buy gold</h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
            <Clock className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6 flex flex-col items-center">
        {/* Buy with INR */}
        <div className="w-full">
            <button
                disabled
                className="w-full bg-[#FFE587] text-gray-900 font-medium text-lg py-6 rounded-[2rem] border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-80 disabled:cursor-not-allowed relative"
            >
                buy with INR (onramp)
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">1% TDS applicable</p>
        </div>

        {/* Buy with USDT */}
        <div className="w-full">
            <button
                onClick={() => setShowSwapModal(true)}
                className="w-full bg-[#A3F4B5] text-gray-900 font-medium text-lg py-6 rounded-[2rem] border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
                buy with USDT
            </button>
            <a
              href="https://www.investopedia.com/terms/t/tether-usdt.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-gray-500 mt-2 underline underline-offset-2"
            >
                what is USDT?
            </a>
        </div>
      </div>

      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
