'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  date: string;
  price: number;
}

// Generate mock data for demo purposes when no API data
const generateMockData = (days: number = 30) => {
  const data: ChartData[] = [];
  let basePrice = 8500; // Base price per gram in INR
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Add some random variation
    const variation = (Math.random() - 0.5) * 100;
    basePrice += variation;
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice * 100) / 100,
    });
  }
  return data;
};

const timeRanges = ['1d', '1w', '1m', '3m', '1y', 'all'] as const;
type TimeRange = typeof timeRanges[number];

export function GoldChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/prices/history');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setData(json.data);
        } else {
          // Use mock data if API doesn't return data
          setData(generateMockData(30));
        }
      } catch {
        // Use mock data on error
        setData(generateMockData(30));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-48 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8860B" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#B8860B" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#B8860B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#E5E7EB"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              stroke="#E5E7EB"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
              domain={['dataMin - 50', 'dataMax + 50']}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                color: '#1F2937',
                fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#6B7280', fontWeight: 500 }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#B8860B"
              strokeWidth={2.5}
              fill="url(#goldGradient)"
              activeDot={{
                r: 6,
                fill: '#B8860B',
                stroke: '#FFFFFF',
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center gap-1 mt-4">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300',
              timeRange === range
                ? 'bg-white text-text-primary border border-border-subtle shadow-card'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
