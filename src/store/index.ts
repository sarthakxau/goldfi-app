import { create } from 'zustand';
import type { GoldPrice, HoldingWithValue, Transaction } from '@/types';

interface AppState {
  // Price state
  goldPrice: GoldPrice | null;
  priceLoading: boolean;
  priceError: string | null;
  setGoldPrice: (price: GoldPrice) => void;
  setPriceLoading: (loading: boolean) => void;
  setPriceError: (error: string | null) => void;

  // Holdings state
  holding: HoldingWithValue | null;
  holdingLoading: boolean;
  holdingError: string | null;
  setHolding: (holding: HoldingWithValue | null) => void;
  setHoldingLoading: (loading: boolean) => void;
  setHoldingError: (error: string | null) => void;

  // Transactions state
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setTransactionsError: (error: string | null) => void;

  // UI state
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Price state
  goldPrice: null,
  priceLoading: false,
  priceError: null,
  setGoldPrice: (price) => set({ goldPrice: price, priceError: null }),
  setPriceLoading: (loading) => set({ priceLoading: loading }),
  setPriceError: (error) => set({ priceError: error }),

  // Holdings state
  holding: null,
  holdingLoading: false,
  holdingError: null,
  setHolding: (holding) => set({ holding, holdingError: null }),
  setHoldingLoading: (loading) => set({ holdingLoading: loading }),
  setHoldingError: (error) => set({ holdingError: error }),

  // Transactions state
  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  setTransactions: (transactions) => set({ transactions, transactionsError: null }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),
  setTransactionsLoading: (loading) => set({ transactionsLoading: loading }),
  setTransactionsError: (error) => set({ transactionsError: error }),

  // UI state
  refreshing: false,
  setRefreshing: (refreshing) => set({ refreshing }),
}));
