'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatINR } from '@/lib/utils';

interface PricePoint {
  date: string;
  price: number;
}

export function GoldChart() {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/prices/history');
        const result = await res.json();
        if (result.success && result.data) {
          setData(
            result.data.map((p: { timestamp: string; goldPriceInr: number }) => ({
              date: new Date(p.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              }),
              price: p.goldPriceInr / 31.1035, // Convert to per gram
            }))
          );
        }
      } catch {
        // Use mock data if API fails
        const mockData: PricePoint[] = [];
        const basePrice = 7500;
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            }),
            price: basePrice + Math.random() * 200 - 100,
          });
        }
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 h-48">
        <div className="h-full skeleton" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm">No price history available</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.99;
  const maxPrice = Math.max(...data.map((d) => d.price)) * 1.01;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            hide
          />
          <Tooltip
            formatter={(value: number) => [formatINR(value), 'Price/gram']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#F59E0B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
