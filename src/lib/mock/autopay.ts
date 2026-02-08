import type { AutoPay, AutoPayTransaction, AutoPayStats } from '@/types';

export const mockAutoPays: AutoPay[] = [
  {
    id: '1',
    name: 'Daily Gold',
    amount: 100,
    frequency: 'daily',
    status: 'active',
    startDate: '2026-01-01',
    nextExecution: '2026-02-12',
    totalInvested: 3000,
    goldAccumulated: 0.42,
    avgPricePerGram: 7143,
  },
  {
    id: '2',
    name: 'Monthly Savings',
    amount: 5000,
    frequency: 'monthly',
    status: 'active',
    startDate: '2025-10-15',
    nextExecution: '2026-02-15',
    totalInvested: 30000,
    goldAccumulated: 4.10,
    avgPricePerGram: 7317,
  },
  {
    id: '3',
    name: 'Weekly Spare',
    amount: 500,
    frequency: 'weekly',
    status: 'paused',
    startDate: '2025-12-01',
    nextExecution: '2026-02-10',
    totalInvested: 2000,
    goldAccumulated: 0.28,
    avgPricePerGram: 7143,
  },
];

export const mockTransactions: Record<string, AutoPayTransaction[]> = {
  '1': [
    {
      id: 't1-1',
      autoPayId: '1',
      amount: 100,
      gramsPurchased: 0.014,
      pricePerGram: 7143,
      status: 'completed',
      executedAt: '2026-02-07',
    },
    {
      id: 't1-2',
      autoPayId: '1',
      amount: 100,
      gramsPurchased: 0.014,
      pricePerGram: 7132,
      status: 'completed',
      executedAt: '2026-02-06',
    },
    {
      id: 't1-3',
      autoPayId: '1',
      amount: 100,
      gramsPurchased: 0.014,
      pricePerGram: 7150,
      status: 'completed',
      executedAt: '2026-02-05',
    },
    {
      id: 't1-4',
      autoPayId: '1',
      amount: 100,
      gramsPurchased: 0.014,
      pricePerGram: 7120,
      status: 'completed',
      executedAt: '2026-02-04',
    },
  ],
  '2': [
    {
      id: 't2-1',
      autoPayId: '2',
      amount: 5000,
      gramsPurchased: 0.686,
      pricePerGram: 7284,
      status: 'completed',
      executedAt: '2026-02-07',
    },
    {
      id: 't2-2',
      autoPayId: '2',
      amount: 5000,
      gramsPurchased: 0.691,
      pricePerGram: 7234,
      status: 'completed',
      executedAt: '2026-01-15',
    },
    {
      id: 't2-3',
      autoPayId: '2',
      amount: 5000,
      gramsPurchased: 0.701,
      pricePerGram: 7132,
      status: 'completed',
      executedAt: '2025-12-15',
    },
    {
      id: 't2-4',
      autoPayId: '2',
      amount: 5000,
      gramsPurchased: 0.710,
      pricePerGram: 7042,
      status: 'completed',
      executedAt: '2025-11-15',
    },
    {
      id: 't2-5',
      autoPayId: '2',
      amount: 5000,
      gramsPurchased: 0.722,
      pricePerGram: 6925,
      status: 'completed',
      executedAt: '2025-10-15',
    },
  ],
  '3': [
    {
      id: 't3-1',
      autoPayId: '3',
      amount: 500,
      gramsPurchased: 0.070,
      pricePerGram: 7143,
      status: 'completed',
      executedAt: '2026-01-20',
    },
    {
      id: 't3-2',
      autoPayId: '3',
      amount: 500,
      gramsPurchased: 0.071,
      pricePerGram: 7042,
      status: 'completed',
      executedAt: '2026-01-13',
    },
    {
      id: 't3-3',
      autoPayId: '3',
      amount: 500,
      gramsPurchased: 0.072,
      pricePerGram: 6944,
      status: 'completed',
      executedAt: '2026-01-06',
    },
    {
      id: 't3-4',
      autoPayId: '3',
      amount: 500,
      gramsPurchased: 0.068,
      pricePerGram: 7353,
      status: 'completed',
      executedAt: '2025-12-30',
    },
  ],
};

export const mockStats: AutoPayStats = {
  monthlySavings: 5000,
  totalSaved: 35000,
  totalGoldAccumulated: 4.8,
  activePlansCount: 2,
  nextExecution: '2026-02-15',
};

/**
 * Helper to compute stats from the current autopay list.
 */
export function computeStats(autoPays: AutoPay[]): AutoPayStats {
  const active = autoPays.filter((a) => a.status === 'active');

  // Sum monthly-equivalent savings
  const monthlySavings = active.reduce((sum, a) => {
    switch (a.frequency) {
      case 'daily':
        return sum + a.amount * 30;
      case 'weekly':
        return sum + a.amount * 4;
      case 'biweekly':
        return sum + a.amount * 2;
      case 'monthly':
        return sum + a.amount;
      default:
        return sum;
    }
  }, 0);

  const totalSaved = autoPays.reduce((sum, a) => sum + a.totalInvested, 0);
  const totalGold = autoPays.reduce((sum, a) => sum + a.goldAccumulated, 0);

  // Find earliest next execution among active autopays
  const nextDates = active
    .map((a) => a.nextExecution)
    .sort();

  return {
    monthlySavings,
    totalSaved,
    totalGoldAccumulated: parseFloat(totalGold.toFixed(2)),
    activePlansCount: active.length,
    nextExecution: nextDates[0] || '',
  };
}
