'use client';

import { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';
import type { TolaPrice as TolaPriceType } from '@/types';

// Competitor markup percentages (approximate)
const COMPETITOR_MARKUPS = {
  jar: 0.0283, // ~2.83% markup
  gullak: 0.0284, // ~2.84% markup
};

interface TolaPriceDisplayProps {
  className?: string;
}

export function TolaPriceDisplay({ className }: TolaPriceDisplayProps) {
  const [price, setPrice] = useState<TolaPriceType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('/api/prices/tola');
        const data = await res.json();
        if (data.success) {
          setPrice(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch tola price:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-2">
          <div className="h-6 w-40 bg-green-200 rounded animate-pulse" />
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
          <div className="h-5 w-36 bg-red-100 rounded animate-pulse" />
          <div className="h-5 w-36 bg-red-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!price) {
    return null;
  }

  const tolaPrice = price.priceInrPerTola;
  const jarPrice = tolaPrice * (1 + COMPETITOR_MARKUPS.jar);
  const gullakPrice = tolaPrice * (1 + COMPETITOR_MARKUPS.gullak);

  return (
    <div className={className}>
      {/* Tola price - highlighted in green */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-2">
        <span className="text-green-800 font-semibold">
          tola: {formatINR(tolaPrice)}
        </span>
      </div>

      {/* Competitor prices - shown in red/pink */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
        <div className="text-red-700 text-sm">
          jar: {formatINR(jarPrice)}
        </div>
        <div className="text-red-700 text-sm">
          gullak: {formatINR(gullakPrice)}
        </div>
      </div>
    </div>
  );
}
