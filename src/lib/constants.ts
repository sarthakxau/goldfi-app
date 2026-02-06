// App Metadata
export const APP = {
  NAME: 'gold.fi',
  TITLE: 'gold.fi - Own Real Gold',
  DESCRIPTION: 'Own real gold. Backed 1:1. Secured in Swiss vaults.',
  DOMAIN: 'https://goldfi.vercel.app/',
  LOCALE: 'en_IN',
  THEME: {
    LIGHT: '#B8860B',
    DARK: '#0F0F0F',
    STORAGE_KEY: 'goldfi-theme',
  },
} as const;

// Arbitrum Contract Addresses
export const CONTRACTS = {
  XAUT0: '0x40461291347e1eCbb09499F3371D3f17f10d7159' as const,
  USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as const,
  CAMELOT_V3_ROUTER: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18' as const,
  CAMELOT_V3_QUOTER: '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E' as const,
} as const;


// Chain Configuration
export const ARBITRUM_CHAIN_ID = 42161;

// Transaction Constants
export const SLIPPAGE_TOLERANCE = 0.005; // 0.5%
export const MAX_GAS_ETH = 0.01; // Max gas in ETH

// Price Cache Duration (seconds)
export const PRICE_CACHE_DURATION = 60;
export const PRICE_HISTORY_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

// Gold Constants
export const XAUT_DECIMALS = 6;
export const USDT_DECIMALS = 6;
export const GRAMS_PER_OUNCE = 31.1035;
export const GRAMS_PER_TOLA = 10;

// Transaction Statuses
export const TX_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// KYC Statuses
export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

// Swap Constants (Buy - USDT to XAUT)
export const MIN_USDT_SWAP = 5; // Minimum USDT to swap
export const MAX_USDT_SWAP = 100000; // Maximum USDT per swap
export const QUOTE_REFRESH_INTERVAL = 15000; // 15 seconds
export const QUOTE_VALIDITY_SECONDS = 60; // Quote valid for 60 seconds
export const SWAP_DEADLINE_MINUTES = 5; // Transaction deadline

// Sell Constants (XAUT to USDT)
export const MIN_GRAMS_SELL = 0.01; // Minimum grams to sell
export const MAX_GRAMS_SELL = 1000; // Maximum grams per sell
