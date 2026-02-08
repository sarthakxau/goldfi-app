'use client';

import { X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { slideUp, backdropFade, SPRING } from '@/lib/animations';

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

  if (!mounted) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 relative"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-6">
              <button onClick={onClose} className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0]" aria-label="Close modal">
                <X className="size-6" />
              </button>
              <div className="w-6" />
            </div>

            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-6">deposit USDT</h2>

              {/* Address Display */}
              <p className="text-sm font-mono text-text-secondary dark:text-[#9CA3AF] mb-3 break-all max-w-[80%]">
                {walletAddress.length > 10 
                  ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
                  : walletAddress}
              </p>

              <motion.button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border dark:border-[#2D2D2D] hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors mb-8"
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="text-sm font-medium text-success">copied!</span>
                      <Check className="w-4 h-4 text-success" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="text-sm font-medium text-text-secondary dark:text-[#9CA3AF]">copy address</span>
                      <Copy className="w-4 h-4 text-text-muted dark:text-[#6B7280]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="mb-4 text-text-muted dark:text-[#6B7280] text-sm">or scan QR</div>
              
              {/* QR Code */}
              <div className="p-4 bg-white dark:bg-surface border border-border-subtle dark:border-[#2D2D2D] rounded-2xl shadow-sm mb-6">
                <QRCodeSVG value={walletAddress} size={180} />
              </div>

              <p className="text-xs text-text-muted dark:text-[#6B7280] mb-8">
                supports Arbitrum One Network
              </p>

              <motion.button
                onClick={onClose}
                className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-text-primary dark:border-[#F0F0F0] text-text-primary dark:text-[#F0F0F0] font-bold py-4 rounded-2xl hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                i have deposited
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
