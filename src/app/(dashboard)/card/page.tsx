'use client';

import React, { useState } from 'react';
import { TolaCard } from '@/components/TolaCard';
import { CardDetailsModal, CardMoreModal } from '@/components/CardModals';
import { Eye, MoreHorizontal, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CardPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Common button style
  const ActionButton = ({ onClick, icon: Icon, label }: { onClick: () => void, icon: any, label: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-2 py-4 px-6 rounded-2xl",
        "bg-white border border-gray-100 shadow-sm transition-all",
        "hover:shadow-md hover:border-gold-200 hover:bg-gold-50/30 active:scale-[0.98]"
      )}
    >
        <div className="p-2.5 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
            <Icon className="w-6 h-6" />
        </div>
      <span className="font-semibold text-gray-700 text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
       {/* Header */}
       <div className="p-6 pb-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User's tola card</h1>
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
                <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
            </div>
            
            {/* Empty State / Placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-8 flex flex-col items-center justify-center text-center h-64">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Receipt className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1 max-w-[200px]">
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
