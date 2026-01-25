'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TolaPriceDisplay } from '@/components/TolaPrice';
import { Check } from 'lucide-react';

const FEATURES = [
  'pure 24K gold',
  'earn up to 15% on your gold',
  'backed by Swiss reserves',
  'withdraw anytime, with zero limits',
];

export default function LoginPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-8">
      {/* Phone notch indicator */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Brand */}
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
        tola
      </h1>

      {/* Value proposition */}
      <p className="text-center text-gray-700 text-lg mb-6">
        invest in gold with{' '}
        <span className="font-bold text-green-600">ZERO</span> fees
      </p>

      {/* Price comparison */}
      <TolaPriceDisplay className="mb-6" />

      {/* Feature list */}
      <div className="space-y-3 mb-8">
        {FEATURES.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA section */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-4">
          signing up takes just a minute
        </p>

        {/* Primary button */}
        <button
          onClick={login}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl border-2 border-gray-900 transition-colors mb-4"
        >
          get started
        </button>

        {/* Secondary link */}
        <button
          onClick={login}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl border border-gray-300 transition-colors text-sm"
        >
          already have an account? log in
        </button>
      </div>
    </div>
  );
}
