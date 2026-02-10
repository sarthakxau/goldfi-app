import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Client-side Supabase client with secure storage for RN
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    },
  },
});

// ── Database types ──────────────────────────────────────

export interface DbUser {
  id: string;
  privy_user_id: string;
  wallet_address: string;
  phone: string | null;
  email: string | null;
  kyc_status: string;
  created_at: string;
  updated_at: string;
}

export interface DbHolding {
  id: string;
  user_id: string;
  xaut_amount: number;
  avg_buy_price_inr: number | null;
  total_invested_inr: number;
  unrealized_pnl_inr: number | null;
  updated_at: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  xaut_amount: number | null;
  usdt_amount: number | null;
  inr_amount: number | null;
  gold_price_usd: number | null;
  usd_inr_rate: number | null;
  gold_price_inr: number | null;
  blockchain_tx_hash: string | null;
  from_address: string | null;
  to_address: string | null;
  onmeta_order_id: string | null;
  dex_swap_tx_hash: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DbPriceHistory {
  id: string;
  gold_price_usd: number;
  usd_inr_rate: number;
  gold_price_inr: number;
  source: string;
  timestamp: string;
}

export interface DbGift {
  id: string;
  sender_user_id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  recipient_user_id: string | null;
  xaut_amount: number;
  inr_amount: number;
  gold_price_inr: number;
  grams_amount: number;
  message: string | null;
  occasion: string;
  status: 'pending' | 'delivered' | 'claimed' | 'expired';
  payment_method: string | null;
  escrow_tx_hash: string | null;
  claim_tx_hash: string | null;
  claim_token: string | null;
  expires_at: string | null;
  created_at: string;
  delivered_at: string | null;
  claimed_at: string | null;
}

export default supabase;
