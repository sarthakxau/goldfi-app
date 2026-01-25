'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { formatINR, formatGrams } from '@/lib/utils';
import type { SellQuote } from '@/types';
import Decimal from 'decimal.js';

export default function SellPage() {
  const router = useRouter();
  const { goldPrice, holding, setGoldPrice, setHolding, setPriceLoading, setHoldingLoading } = useAppStore();
  const [grams, setGrams] = useState('');
  const [quote, setQuote] = useState<SellQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setPriceLoading(true);
      setHoldingLoading(true);

      const [priceRes, holdingRes] = await Promise.all([
        fetch('/api/prices'),
        fetch('/api/holdings'),
      ]);

      const [priceData, holdingData] = await Promise.all([
        priceRes.json(),
        holdingRes.json(),
      ]);

      if (priceData.success) setGoldPrice(priceData.data);
      if (holdingData.success) setHolding(holdingData.data);
    } catch {
      // Silent fail
    } finally {
      setPriceLoading(false);
      setHoldingLoading(false);
    }
  }, [setGoldPrice, setHolding, setPriceLoading, setHoldingLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate quote when amount changes
  useEffect(() => {
    if (!grams || !goldPrice) {
      setQuote(null);
      return;
    }

    const gramsAmount = parseFloat(grams);
    if (isNaN(gramsAmount) || gramsAmount <= 0) {
      setQuote(null);
      return;
    }

    // Convert grams to XAUT (troy ounces)
    const xautAmount = gramsAmount / 31.1035;
    const inrAmount = xautAmount * goldPrice.priceInr;

    setQuote({
      xautAmount,
      estimatedInr: inrAmount,
      goldPriceInr: goldPrice.priceInr,
      usdInrRate: goldPrice.usdInrRate,
      validUntil: new Date(Date.now() + 60000),
    });
  }, [grams, goldPrice]);

  const handleSell = async () => {
    if (!quote) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/transactions/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xautAmount: quote.xautAmount }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/transactions?highlight=${data.data.id}`);
      } else {
        setError(data.error || 'Failed to create sell order');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxGrams = holding
    ? new Decimal(holding.xautAmount).times(31.1035).toNumber()
    : 0;

  const presetPercentages = [25, 50, 75, 100];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Sell Gold</h1>

      {/* Available Balance */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-700 font-medium">Available to sell</p>
        <p className="text-xl font-bold text-gray-900">
          {formatGrams(maxGrams)}
        </p>
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Enter amount in grams
        </label>
        <div className="relative">
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="0"
            max={maxGrams}
            step="0.001"
            className="w-full text-3xl font-bold pl-4 pr-10 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
            g
          </span>
        </div>

        {/* Preset Percentages */}
        <div className="flex gap-2 mt-4">
          {presetPercentages.map((pct) => (
            <button
              key={pct}
              onClick={() => setGrams(((maxGrams * pct) / 100).toFixed(3))}
              disabled={maxGrams === 0}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="bg-green-50 rounded-2xl p-6 mt-4 border border-green-100">
          <h3 className="text-sm font-medium text-green-800 mb-4">
            You will receive (estimated)
          </h3>
          <div className="text-3xl font-bold text-green-900 mb-2">
            {formatINR(quote.estimatedInr)}
          </div>

          <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Selling</span>
              <span className="font-medium text-green-900">
                {quote.xautAmount.toFixed(6)} XAUT
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Gold price</span>
              <span className="font-medium text-green-900">
                {formatINR(quote.goldPriceInr)}/oz
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {grams && parseFloat(grams) > maxGrams && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mt-4">
          Insufficient balance. You only have {formatGrams(maxGrams)}.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mt-4">
          {error}
        </div>
      )}

      {/* Sell Button */}
      <button
        onClick={handleSell}
        disabled={!quote || loading || parseFloat(grams) > maxGrams}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl mt-6 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          `Sell for ${quote ? formatINR(quote.estimatedInr) : '₹0'}`
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Amount will be credited to your bank account within 24 hours.
      </p>
    </div>
  );
}
