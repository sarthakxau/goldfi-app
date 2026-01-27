import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Copy, CreditCard, Shield, Ban, ChevronRight, Check } from 'lucide-react';

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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-modalBackdrop transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div className="fixed bottom-0 left-0 right-0 z-modal bg-surface-card rounded-t-3xl p-6 shadow-luxury animate-in slide-in-from-bottom duration-300 md:bottom-auto md:top-1/2 md:left-1/2 md:w-[400px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl border-t border-border-subtle md:border">
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif text-cream">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-cream-muted/50 hover:text-cream hover:bg-surface-elevated rounded-full transition-colors"
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
    <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
      <div>
        <p className="text-xs text-cream-muted/40 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-cream font-serif text-lg">{value}</p>
      </div>
      {copyable && (
        <button 
          onClick={() => copyToClipboard(value, label)}
          className="p-2 text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors"
        >
          {copiedField === label ? (
            <Check className="size-5 text-success" />
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
  const ActionButton = ({ icon: Icon, label, destructive = false }: { icon: React.ElementType, label: string, destructive?: boolean }) => (
    <button className={cn(
      "w-full flex items-center justify-between p-4 rounded-xl border border-border-subtle mb-3 transition-all duration-300 active:scale-[0.98]",
      "hover:border-gold-500/30 hover:bg-surface-elevated",
      destructive && "hover:border-error/30 hover:bg-error/10"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          destructive ? "bg-error/10 text-error" : "bg-gold-500/10 text-gold-400"
        )}>
          <Icon className="size-5" />
        </div>
        <span className={cn(
          "font-semibold",
          destructive ? "text-error" : "text-cream-muted/80"
        )}>{label}</span>
      </div>
      <ChevronRight className={cn(
        "size-5",
        destructive ? "text-error/50" : "text-cream-muted/30"
      )} />
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Options">
      <div className="py-2">
        <ActionButton icon={CreditCard} label="Set Card PIN" />
        <ActionButton icon={Shield} label="Adjust Limits" />
        <div className="h-px bg-border-subtle my-4" />
        <ActionButton icon={Ban} label="Cancel Card" destructive />
      </div>
    </Modal>
  );
}
