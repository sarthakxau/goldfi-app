'use client';

import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { FadeUp } from '@/components/animations';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations';

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
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-between mb-8">
          <Link href="/redeem" className="p-2 -ml-2 text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] transition-colors">
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">nearby jewellers</h1>
          <div className="size-10" />
        </div>
      </FadeUp>

      {/* Map Placeholder */}
      <FadeUp delay={0.06}>
        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,134,11,0.06)_0%,transparent_70%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <MapPin className="size-8 text-gold-500" />
            <span className="text-text-muted dark:text-[#6B7280] text-sm font-medium">New Delhi, India</span>
            <span className="text-text-muted dark:text-[#6B7280] text-xs">showing jewellers within 10 km</span>
          </div>
          {/* Decorative dots to suggest map pins */}
          <div className="absolute top-8 left-12 size-2 rounded-full bg-gold-500/40" />
          <div className="absolute top-16 right-20 size-2 rounded-full bg-gold-500/30" />
          <div className="absolute bottom-12 left-24 size-2 rounded-full bg-gold-500/25" />
          <div className="absolute top-20 left-1/2 size-2 rounded-full bg-gold-500/35" />
          <div className="absolute bottom-16 right-16 size-2 rounded-full bg-gold-500/20" />
        </div>
      </FadeUp>

      {/* Jewellers List */}
      <div className="space-y-3">
        {jewellers.map((jeweller, index) => (
          <motion.div
            key={jeweller.name}
            className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-4 hover:border-gold-500/30 transition-all"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: DURATION.normal, delay: index * 0.06, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gold-500 shrink-0 mt-0.5" />
                <h3 className="text-text-primary dark:text-[#F0F0F0] font-semibold text-sm">{jeweller.name}</h3>
              </div>
              <span className="text-gold-500 font-bold text-sm whitespace-nowrap ml-2">{jeweller.rate}</span>
            </div>
            <div className="ml-6">
              <p className="text-text-muted dark:text-[#6B7280] text-xs">{jeweller.address}</p>
              <p className="text-text-secondary dark:text-[#9CA3AF] text-xs mt-1 font-medium">{jeweller.distance} away</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
