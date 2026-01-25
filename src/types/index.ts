import { Decimal } from 'decimal.js';

// User types
export interface User {
  id: string;
  privyUserId: string;
  walletAddress: string;
  phone?: string | null;
  email?: string | null;
  kycStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

// Holding types
export interface Holding {
  id: string;
  userId: string;
  xautAmount: Decimal | number | string;
  avgBuyPriceInr?: Decimal | number | string | null;
  totalInvestedInr: Decimal | number | string;
  unrealizedPnlInr?: Decimal | number | string | null;
  updatedAt: Date;
}

// Transaction types
export type TransactionType = 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  xautAmount?: Decimal | number | string | null;
  usdtAmount?: Decimal | number | string | null;
  inrAmount?: Decimal | number | string | null;
  goldPriceUsd?: Decimal | number | string | null;
  usdInrRate?: Decimal | number | string | null;
  goldPriceInr?: Decimal | number | string | null;
  blockchainTxHash?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  onmetaOrderId?: string | null;
  dexSwapTxHash?: string | null;
  errorMessage?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

// Price types
export interface GoldPrice {
  priceUsd: number;
  priceInr: number;
  pricePerGramUsd: number;
  pricePerGramInr: number;
  usdInrRate: number;
  timestamp: Date;
}

export interface PriceHistory {
  id: string;
  goldPriceUsd: Decimal | number | string;
  usdInrRate: Decimal | number | string;
  goldPriceInr: Decimal | number | string;
  source: string;
  timestamp: Date;
}

export interface TolaPrice {
  priceInrPerTola: number;
  priceUsd: number;
  usdInrRate: number;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Holdings with calculated values
export interface HoldingWithValue extends Holding {
  currentValueInr: number;
  profitLossInr: number;
  profitLossPercent: number;
  xautAmountGrams: number;
}

// Buy/Sell request types
export interface BuyRequest {
  inrAmount: number;
}

export interface SellRequest {
  xautAmount: number;
}

// Quote types
export interface BuyQuote {
  inrAmount: number;
  estimatedXaut: number;
  estimatedGrams: number;
  goldPriceInr: number;
  usdInrRate: number;
  validUntil: Date;
}

export interface SellQuote {
  xautAmount: number;
  estimatedInr: number;
  goldPriceInr: number;
  usdInrRate: number;
  validUntil: Date;
}
