import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Copy, CreditCard, Shield, Ban, ChevronRight } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-modalBackdrop transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div className="fixed bottom-0 left-0 right-0 z-modal bg-white rounded-t-3xl p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300 md:bottom-auto md:top-1/2 md:left-1/2 md:w-[400px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="size-6" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ isOpen, onClose }: CardDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const Field = ({ label, value, copyable = true }: { label: string, value: string, copyable?: boolean }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">{label}</p>
        <p className="text-gray-900 font-semibold text-lg">{value}</p>
      </div>
      {copyable && (
        <button 
          onClick={() => copyToClipboard(value, label)}
          className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
        >
            {copiedField === label ? (
                 <span className="text-xs font-bold text-green-600">Copied</span>
            ) : (
                <Copy className="size-5" />
            )}
        </button>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details">
      <div className="space-y-1">
        <Field label="Card Number" value="3489 2382 3023 3224" />
        <Field label="Expiry Date" value="11/32" />
        <Field label="CVV" value="234" />
        <Field label="Name on Card" value="User" />
      </div>
    </Modal>
  );
}

interface CardMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardMoreModal({ isOpen, onClose }: CardMoreModalProps) {
  const ActionButton = ({ icon: Icon, label, destructive = false }: { icon: any, label: string, destructive?: boolean }) => (
    <button className={cn(
      "w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 mb-3 transition-all active:scale-[0.98]",
      "hover:border-gold-200 hover:bg-gold-50/50",
      destructive ? "text-red-600 hover:bg-red-50 hover:border-red-100" : "text-gray-700"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", destructive ? "bg-red-100 text-red-600" : "bg-gold-100 text-gold-700")}>
            <Icon className="size-5" />
        </div>
        <span className="font-semibold">{label}</span>
      </div>
      <ChevronRight className="size-5 opacity-30" />
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Options">
        <div className="py-2">
            <ActionButton icon={CreditCard} label="Set Card PIN" />
            <ActionButton icon={Shield} label="Adjust Limits" />
            <div className="h-px bg-gray-100 my-4" />
            <ActionButton icon={Ban} label="Cancel Card" destructive />
        </div>
    </Modal>
  );
}
