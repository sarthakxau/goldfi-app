'use client';

import { useState, useCallback } from 'react';
import type {
  AutoPay,
  AutoPayTransaction,
  AutoPayStats,
  CreateAutoPayInput,
} from '@/types';
import {
  mockAutoPays,
  mockTransactions,
  computeStats,
} from '@/lib/mock/autopay';

// Simulate async latency
function delay(ms: number = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAutoPay() {
  const [autoPays, setAutoPays] = useState<AutoPay[]>(mockAutoPays);
  const [stats, setStats] = useState<AutoPayStats>(computeStats(mockAutoPays));
  const [selectedAutoPay, setSelectedAutoPay] = useState<AutoPay | null>(null);
  const [transactions, setTransactions] = useState<AutoPayTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchAutoPays = useCallback(async () => {
    setLoading(true);
    await delay();
    setAutoPays(mockAutoPays);
    setStats(computeStats(mockAutoPays));
    setLoading(false);
  }, []);

  const fetchAutoPay = useCallback(
    async (id: string) => {
      setLoading(true);
      await delay(200);
      const found = autoPays.find((a) => a.id === id) || null;
      setSelectedAutoPay(found);
      setLoading(false);
      return found;
    },
    [autoPays]
  );

  const fetchTransactions = useCallback(async (id: string) => {
    setLoading(true);
    await delay(200);
    setTransactions(mockTransactions[id] || []);
    setLoading(false);
  }, []);

  const createAutoPay = useCallback(
    async (input: CreateAutoPayInput): Promise<boolean> => {
      setCreating(true);
      await delay(500);

      const newAutoPay: AutoPay = {
        id: `${Date.now()}`,
        name: input.name,
        amount: input.amount,
        frequency: input.frequency,
        status: 'active',
        startDate:
          input.startDate === 'immediate'
            ? new Date().toISOString().split('T')[0]
            : input.startDate,
        nextExecution:
          input.startDate === 'immediate'
            ? new Date().toISOString().split('T')[0]
            : input.startDate,
        totalInvested: 0,
        goldAccumulated: 0,
        avgPricePerGram: 0,
      };

      const updated = [...autoPays, newAutoPay];
      setAutoPays(updated);
      setStats(computeStats(updated));
      setCreating(false);
      return true;
    },
    [autoPays]
  );

  const toggleAutoPay = useCallback(
    async (id: string): Promise<boolean> => {
      await delay(300);
      const updated = autoPays.map((a) =>
        a.id === id
          ? { ...a, status: (a.status === 'active' ? 'paused' : 'active') as AutoPay['status'] }
          : a
      );
      setAutoPays(updated);
      setStats(computeStats(updated));

      // Also update selectedAutoPay if it's the one being toggled
      if (selectedAutoPay?.id === id) {
        const toggled = updated.find((a) => a.id === id) || null;
        setSelectedAutoPay(toggled);
      }

      return true;
    },
    [autoPays, selectedAutoPay]
  );

  const deleteAutoPay = useCallback(
    async (id: string): Promise<boolean> => {
      await delay(300);
      const updated = autoPays.filter((a) => a.id !== id);
      setAutoPays(updated);
      setStats(computeStats(updated));
      setSelectedAutoPay(null);
      return true;
    },
    [autoPays]
  );

  const resetSelection = useCallback(() => {
    setSelectedAutoPay(null);
    setTransactions([]);
  }, []);

  return {
    autoPays,
    stats,
    selectedAutoPay,
    transactions,
    loading,
    creating,
    fetchAutoPays,
    fetchAutoPay,
    fetchTransactions,
    createAutoPay,
    toggleAutoPay,
    deleteAutoPay,
    resetSelection,
  };
}
