'use client';

import { Check, Loader2, X, ExternalLink } from 'lucide-react';
import type { SwapStep } from '@/types';

interface SwapProgressProps {
  step: SwapStep;
  approvalTxHash: string | null;
  swapTxHash: string | null;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

const ARBISCAN_URL = 'https://arbiscan.io/tx/';

export function SwapProgress({
  step,
  approvalTxHash,
  swapTxHash,
  error,
  onClose,
  onRetry
}: SwapProgressProps) {
  const steps = [
    { key: 'approve', label: 'Approving USDT' },
    { key: 'swap', label: 'Swapping to Gold' },
    { key: 'confirming', label: 'Confirming' },
  ];

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Swap Successful!</h3>
        <p className="text-gray-500 mb-4">Your gold has been added to your holdings</p>
        {swapTxHash && (
          <a
            href={`${ARBISCAN_URL}${swapTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gold-500 hover:underline mb-6"
          >
            View on Arbiscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          onClick={onClose}
          className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-error" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Swap Failed</h3>
        <p className="text-error mb-6 text-sm">{error || 'Something went wrong'}</p>
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 font-medium py-4 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-center mb-8">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      </div>
      <div className="space-y-4">
        {steps.map((s, index) => {
          const stepIndex = steps.findIndex(x => x.key === step);
          const isActive = s.key === step;
          const isPast = stepIndex > index;

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isPast ? 'bg-success text-white' : ''}
                ${isActive ? 'bg-gold-500 text-white' : ''}
                ${!isPast && !isActive ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                {isPast ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {isActive && <Loader2 className="w-4 h-4 text-gold-500 animate-spin ml-auto" />}
            </div>
          );
        })}
      </div>

      {approvalTxHash && (
        <a
          href={`${ARBISCAN_URL}${approvalTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-gold-500 hover:underline mt-4"
        >
          View approval tx <ExternalLink className="w-3 h-3 inline" />
        </a>
      )}
    </div>
  );
}
