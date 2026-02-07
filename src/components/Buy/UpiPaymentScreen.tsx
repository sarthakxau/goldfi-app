'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface UpiPaymentScreenProps {
  totalPayable: number;
  selectedApp: 'gpay' | 'manual' | null;
  upiId: string;
  canPay: boolean;
  confirmLoading: boolean;
  onSelectApp: (app: 'gpay' | 'manual') => void;
  onUpiIdChange: (id: string) => void;
  onPay: () => void;
  onBack: () => void;
}

export function UpiPaymentScreen({
  totalPayable,
  selectedApp,
  upiId,
  canPay,
  confirmLoading,
  onSelectApp,
  onUpiIdChange,
  onPay,
  onBack,
}: UpiPaymentScreenProps) {
  const [showManualInput, setShowManualInput] = useState(false);

  const handleGpayClick = () => {
    onSelectApp('gpay');
    setShowManualInput(false);
    // Auto-proceed with GPay
  };

  const handleManualClick = () => {
    onSelectApp('manual');
    setShowManualInput(true);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">
          Pay {formatINR(totalPayable)}
        </h1>
      </div>

      {/* Powered by Onmeta */}
      <div className="text-center mb-8">
        <p className="text-xs text-text-muted dark:text-[#6B7280] mb-1">Powered by</p>
        <p className="text-2xl font-bold text-gold-500 dark:text-gold-400">onmeta</p>
      </div>

      {/* Google Pay Option */}
      <button
        onClick={handleGpayClick}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl mb-3 transition-all border ${
          selectedApp === 'gpay'
            ? 'border-gold-500 dark:border-gold-400 bg-gold-50 dark:bg-gold-900/20'
            : 'border-border-subtle dark:border-[#2D2D2D] bg-surface-card dark:bg-[#1A1A1A] hover:border-gold-500/50 dark:hover:border-gold-400/50'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">G Pay</span>
        </div>
        <span className="text-base font-semibold text-text-primary dark:text-[#F0F0F0]">
          Google Pay
        </span>
      </button>

      {/* Other UPI App Option */}
      <button
        onClick={handleManualClick}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl mb-6 transition-all border ${
          selectedApp === 'manual'
            ? 'border-gold-500 dark:border-gold-400 bg-gold-50 dark:bg-gold-900/20'
            : 'border-border-subtle dark:border-[#2D2D2D] bg-surface-card dark:bg-[#1A1A1A] hover:border-gold-500/50 dark:hover:border-gold-400/50'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-surface dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] flex items-center justify-center shrink-0">
          <span className="text-lg">&#128179;</span>
        </div>
        <div className="text-left">
          <span className="text-base font-semibold text-text-primary dark:text-[#F0F0F0] block">
            Other UPI App
          </span>
          <span className="text-xs text-text-muted dark:text-[#6B7280]">
            Enter UPI ID manually
          </span>
        </div>
      </button>

      {/* Manual UPI ID Input */}
      {showManualInput && (
        <div className="mb-6">
          <label className="text-sm text-text-muted dark:text-[#6B7280] mb-2 block">
            Or enter UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => onUpiIdChange(e.target.value)}
            placeholder="yourname@upi"
            className="w-full bg-surface-card dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-xl px-4 py-3.5 text-text-primary dark:text-[#F0F0F0] placeholder:text-text-muted dark:placeholder:text-[#3D3D3D] outline-none focus:border-gold-500 dark:focus:border-gold-400 transition-colors text-base"
          />
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pay Button */}
      <button
        onClick={onPay}
        disabled={!canPay || confirmLoading}
        className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
      >
        {confirmLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${formatINR(totalPayable)}`
        )}
      </button>
    </div>
  );
}
