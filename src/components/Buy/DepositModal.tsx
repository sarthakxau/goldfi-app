'use client';

import { X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function DepositModal({ isOpen, onClose, walletAddress }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 animate-in slide-in-from-bottom duration-300 relative">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onClose} className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0]" aria-label="Close modal">
                <X className="size-6" />
            </button>
            <div className="w-6" /> {/* Spacer for centering if needed, matches X width */}
        </div>

        <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-6">deposit USDT</h2>

            {/* Address Display */}
            <p className="text-sm font-mono text-text-secondary dark:text-[#9CA3AF] mb-3 break-all max-w-[80%]">
                {walletAddress.length > 10 
                  ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
                  : walletAddress}
            </p>

            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border dark:border-[#2D2D2D] hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors mb-8"
            >
                <span className="text-sm font-medium text-text-secondary dark:text-[#9CA3AF]">
                    {copied ? 'copied!' : 'copy address'}
                </span>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-muted dark:text-[#6B7280]" />}
            </button>

            <div className="mb-4 text-text-muted dark:text-[#6B7280] text-sm">or scan QR</div>
            
            {/* QR Code */}
            <div className="p-4 bg-white dark:bg-surface border border-border-subtle dark:border-[#2D2D2D] rounded-2xl shadow-sm mb-6">
                <QRCodeSVG value={walletAddress} size={180} />
            </div>

            <p className="text-xs text-text-muted dark:text-[#6B7280] mb-8">
                supports Arbitrum One Network
            </p>

            <button
                onClick={onClose}
                className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-text-primary dark:border-[#F0F0F0] text-text-primary dark:text-[#F0F0F0] font-bold py-4 rounded-2xl hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
            >
                i have deposited
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
