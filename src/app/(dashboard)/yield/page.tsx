'use client';

import { ArrowLeft, Link2, Store } from 'lucide-react';
import Link from 'next/link';

export default function YieldPage() {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">earn yield</h1>
        <div className="size-10" />
      </div>

      <div className="space-y-6 flex flex-col items-center">
        {/* Lend On-Chain */}
        <div className="w-full">
          <button
            disabled
            className="w-full bg-gold-gradient text-white font-bold text-lg py-5 rounded-2xl relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Link2 className="size-5" />
              lend on-chain
            </span>
            <span className="absolute top-2 right-3 text-xs bg-white/20 px-2 py-0.5 rounded-full">coming soon</span>
          </button>
          <p className="text-center text-sm text-gold-500/70 mt-2 font-medium">13% p.a.</p>
        </div>

        {/* Lend to Jewellers */}
        <div className="w-full">
          <Link
            href="/yield/jewellers"
            className="w-full block bg-white border border-border-subtle text-text-primary font-bold text-lg py-5 rounded-2xl text-center hover:border-gold-500/30 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Store className="size-5" />
              lend to jewellers
            </span>
          </Link>
          <p className="text-center text-sm text-text-muted mt-2 font-medium">8% p.a.</p>
        </div>
      </div>
    </div>
  );
}
