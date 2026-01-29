'use client';

import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

const jewellers = [
  {
    name: 'Tanishq - Connaught Place',
    distance: '1.2 km',
    address: 'Block N, Connaught Place, New Delhi 110001',
    rate: '8% p.a.',
  },
  {
    name: 'Kalyan Jewellers - Karol Bagh',
    distance: '2.8 km',
    address: '14/2, Ajmal Khan Road, Karol Bagh, New Delhi 110005',
    rate: '7.5% p.a.',
  },
  {
    name: 'Malabar Gold - Rajouri Garden',
    distance: '4.1 km',
    address: 'J-1/47, Rajouri Garden, New Delhi 110027',
    rate: '7% p.a.',
  },
  {
    name: 'PC Jeweller - Lajpat Nagar',
    distance: '5.5 km',
    address: '5, Central Market, Lajpat Nagar II, New Delhi 110024',
    rate: '8% p.a.',
  },
  {
    name: 'Joyalukkas - South Extension',
    distance: '6.3 km',
    address: 'K-18, South Extension Part II, New Delhi 110049',
    rate: '7.5% p.a.',
  },
];

export default function JewellersPage() {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen gold-radial-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/yield" className="p-2 -ml-2 text-cream-muted/50 hover:text-cream transition-colors">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-serif text-cream">nearby jewellers</h1>
        <div className="size-10" />
      </div>

      {/* Map Placeholder */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-surface-card border border-border-subtle">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,160,18,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <MapPin className="size-8 text-gold-400" />
          <span className="text-cream-muted/50 text-sm font-medium">New Delhi, India</span>
          <span className="text-cream-muted/30 text-xs">showing jewellers within 10 km</span>
        </div>
        {/* Decorative dots to suggest map pins */}
        <div className="absolute top-8 left-12 size-2 rounded-full bg-gold-500/40" />
        <div className="absolute top-16 right-20 size-2 rounded-full bg-gold-500/30" />
        <div className="absolute bottom-12 left-24 size-2 rounded-full bg-gold-500/25" />
        <div className="absolute top-20 left-1/2 size-2 rounded-full bg-gold-500/35" />
        <div className="absolute bottom-16 right-16 size-2 rounded-full bg-gold-500/20" />
      </div>

      {/* Jewellers List */}
      <div className="space-y-3">
        {jewellers.map((jeweller) => (
          <div
            key={jeweller.name}
            className="bg-surface-card border border-border-subtle rounded-2xl p-4 hover:border-gold-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gold-400 shrink-0 mt-0.5" />
                <h3 className="text-cream font-semibold text-sm">{jeweller.name}</h3>
              </div>
              <span className="text-gold-400 font-bold text-sm whitespace-nowrap ml-2">{jeweller.rate}</span>
            </div>
            <div className="ml-6">
              <p className="text-cream-muted/40 text-xs">{jeweller.address}</p>
              <p className="text-cream-muted/50 text-xs mt-1 font-medium">{jeweller.distance} away</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
