'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TolaPriceDisplay } from '@/components/TolaPrice';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  // Redirect to dashboard when user becomes authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/');
    }
  }, [ready, authenticated, router]);

  const features = [
    'pure 24K gold',
    'earn up to 15% on your gold',
    'backed by Swiss reserves',
    'withdraw anytime, with zero limits',
  ];

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-8 min-h-screen bg-surface flex flex-col gold-radial-bg">
      {/* Subtle grain overlay for luxury texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-gradient-to-b from-cream/5 to-transparent" />
      
      {/* Top Bar / Logo */}
      <div className="flex flex-col items-center pt-8 pb-6">
        {/* Decorative line */}
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-cream-muted/20 to-transparent mb-8" />
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="gold-coin">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-4xl font-serif text-gold-gradient tracking-tight">
            tola
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-cream-muted/60 text-sm tracking-wide">
          invest in gold with <span className="text-success font-semibold">ZERO</span> fees
        </p>
      </div>

      {/* Price Comparison Section */}
      <div className="py-6">
        <TolaPriceDisplay className="w-full" />
      </div>

      {/* Feature List */}
      <div className="flex-grow py-6 space-y-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <div className="size-6 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="size-4 text-success" />
            </div>
            <span className="text-cream-muted/70 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="pt-6 pb-safe safe-area-bottom">
        <p className="text-center text-cream-muted/40 text-xs mb-4 tracking-wide">
          signing up takes just a minute
        </p>
        
        <button
          onClick={login}
          className="w-full gold-shimmer text-surface font-bold py-4 px-6 rounded-full transition-all active:scale-[0.98] mb-4 text-lg tracking-wide"
        >
          get started
        </button>
        
        <button
          onClick={login}
          className="w-full bg-surface-card border border-border-subtle text-cream-muted/70 font-medium py-4 px-6 rounded-full hover:border-gold-500/30 hover:text-cream transition-all active:scale-[0.98]"
        >
          already have an account? log in
        </button>
      </div>
    </div>
  );
}
