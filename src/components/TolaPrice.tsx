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
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-3">
          <div className="h-6 w-40 skeleton rounded" />
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-2">
          <div className="h-5 w-36 skeleton rounded" />
          <div className="h-5 w-36 skeleton rounded" />
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
      {/* Tola price - highlighted in green with gold accent */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success/5 to-transparent" />
        <span className="relative text-success font-serif text-xl">
          tola: {formatINR(tolaPrice)}
        </span>
      </div>

      {/* Competitor prices - shown greyed out/struck */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-2">
        <div className="text-cream-muted/40 text-sm line-through">
          jar: {formatINR(jarPrice)}
        </div>
        <div className="text-cream-muted/40 text-sm line-through">
          gullak: {formatINR(gullakPrice)}
        </div>
      </div>
    </div>
  );
}
