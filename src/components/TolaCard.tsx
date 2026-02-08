'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'motion/react';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface TolaCardProps {
  className?: string;
  cardHolderName?: string;
}

export function TolaCard({ className, cardHolderName = 'User' }: TolaCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-full aspect-[1.586] rounded-3xl p-6 overflow-hidden',
        'shadow-card-hover',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #D4A012 0%, #F5B832 30%, #D4A012 60%, #B8860B 100%)',
      }}
      initial={{ opacity: 0, rotateX: 8, y: 20 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -2, transition: { duration: DURATION.fast } }}
    >
      {/* Luxury texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 gold-shimmer pointer-events-none" />

      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      <div className="relative z-10 flex flex-col justify-between h-full text-white cursor-default">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <motion.span
            className="text-2xl font-bold tracking-tight drop-shadow-sm"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.15 }}
          >
            gold.fi
          </motion.span>
          {/* Gold Coins Illustration (SVG) */}
          <motion.div
            className="absolute right-4 top-4 opacity-90"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ ...SPRING.gentle, delay: 0.2 }}
          >
            <GoldCoinsIcon className="w-20 h-20 drop-shadow-lg" />
          </motion.div>
        </div>

        {/* Middle/Bottom Card Info */}
        <motion.div
          className="mt-auto space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.25 }}
        >
          <div className="text-lg font-medium flex items-center gap-2 text-white/90 drop-shadow-md font-mono">
            <span>****</span>
            <span>****</span>
            <span>****</span>
            <span>3224</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded border border-white/30 ml-2 not-italic font-sans">virtual</span>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-sm font-medium text-white/70">
              {cardHolderName}
            </div>
            <VisaLogo className="w-14 h-auto text-white drop-shadow-md" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Simple illustrative SVG for stacked gold coins
function GoldCoinsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        {/* Bottom Coin */}
        <ellipse cx="50" cy="75" rx="25" ry="12" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>
        <path d="M25 75 v10 c0 6.6 11.2 12 25 12 s25 -5.4 25 -12 v-10" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>

        {/* Middle Coin */}
        <ellipse cx="50" cy="65" rx="25" ry="12" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>
        <path d="M25 65 v10 c0 6.6 11.2 12 25 12 s25 -5.4 25 -12 v-10" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>

        {/* Top Coin */}
        <ellipse cx="54" cy="50" rx="25" ry="12" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>
        <path d="M29 50 v10 c0 6.6 11.2 12 25 12 s25 -5.4 25 -12 v-10" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="1"/>
        <ellipse cx="54" cy="50" rx="25" ry="12" fill="#FCD34D" stroke="#92400E" strokeWidth="1"/>
      </g>
    </svg>
  );
}

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 32" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="30" fontWeight="bold" fontStyle="italic" fontFamily="sans-serif">VISA</text>
    </svg>
  )
}
