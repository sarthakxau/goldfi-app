'use client';

import React, { useState } from 'react';
import { TolaCard } from '@/components/TolaCard';
import { CardDetailsModal, CardMoreModal } from '@/components/CardModals';
import { Eye, MoreHorizontal, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CardPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const ActionButton = ({ onClick, icon: Icon, label }: { onClick: () => void, icon: React.ElementType, label: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-2 py-4 px-6 rounded-2xl",
        "card transition-all duration-300",
        "hover:border-gold-500/30 hover:shadow-gold-glow active:scale-[0.98]"
      )}
    >
      <div className="p-2.5 rounded-full bg-surface-elevated text-cream-muted/50 group-hover:bg-gold-500/15 group-hover:text-gold-400 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-semibold text-cream-muted/70 text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 gold-radial-bg">
      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-serif text-cream tracking-tight">Your tola card</h1>
      </div>

      <div className="p-6 pt-2 space-y-8 max-w-md mx-auto">
        {/* Card Component */}
        <div className="relative z-10">
          <TolaCard />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <ActionButton 
            onClick={() => setShowDetails(true)} 
            icon={Eye} 
            label="Details" 
          />
          <ActionButton 
            onClick={() => setShowMore(true)} 
            icon={MoreHorizontal} 
            label="More" 
          />
        </div>

        {/* Transactions Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-cream">Transactions</h2>
          </div>
          
          {/* Empty State / Placeholder */}
          <div className="card border-dashed p-8 flex flex-col items-center justify-center text-center h-64">
            <div className="p-4 bg-surface-elevated rounded-full mb-4">
              <Receipt className="w-8 h-8 text-cream-muted/30" />
            </div>
            <p className="text-cream-muted/70 font-medium">No transactions yet</p>
            <p className="text-sm text-cream-muted/40 mt-1 max-w-[200px]">
              Your card transactions will appear here once you start using your card.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CardDetailsModal 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
      />
      <CardMoreModal 
        isOpen={showMore} 
        onClose={() => setShowMore(false)} 
      />
    </div>
  );
}
