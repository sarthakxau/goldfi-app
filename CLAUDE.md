# CLAUDE.md - Bullion App

## Project Overview

Bullion is a Progressive Web App (PWA) for digital gold savings targeting Indian users. Users can buy and sell tokenized gold (XAUT0) on Arbitrum using INR. The app abstracts away all blockchain/crypto complexity and presents itself as a simple gold savings app.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS with custom gold color palette
- **Database**: PostgreSQL via Supabase (Prisma schema for reference)
- **Cache**: Redis (in-memory mock in dev, Upstash in production)
- **Icons**: Lucide React
- **Auth/Wallet**: Privy SDK (phone/email login with embedded wallets)
- **Blockchain**: Viem v2 on Arbitrum
- **State Management**: Zustand
- **Charts**: Recharts
- **PWA**: next-pwa
- **Numbers**: decimal.js for precise financial calculations

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth route group (login)
│   ├── (dashboard)/          # Protected routes
│   │   ├── page.tsx          # Home/holdings dashboard
│   │   ├── buy/              # Buy gold page
│   │   ├── sell/             # Sell gold page
│   │   ├── transactions/     # Transaction history
│   │   ├── account/          # User account settings
│   │   ├── card/             # Gold card feature
│   │   ├── gold-charts/      # TradingView charts
│   │   └── yield/            # Yield/jewellers features
│   ├── api/                  # Backend API routes
│   │   ├── auth/sync/        # Sync Privy user to DB
│   │   ├── prices/           # Gold price endpoints (/, /history, /tola)
│   │   ├── holdings/         # User holdings
│   │   ├── balance/          # Wallet balances (usdt, xaut)
│   │   ├── swap/             # Buy swap (quote, record)
│   │   ├── sell/             # Sell swap (quote, record)
│   │   ├── transactions/     # Buy/sell/history
│   │   └── webhooks/         # Onmeta payment webhooks
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # Privy provider setup
│   └── manifest.ts           # PWA manifest
├── components/               # Reusable React components
│   ├── Buy/                  # Buy flow components
│   │   ├── SwapModal.tsx     # Main swap modal
│   │   ├── SwapProgress.tsx  # Step progress indicator
│   │   ├── SwapQuote.tsx     # Quote display
│   │   ├── BalanceDisplay.tsx
│   │   ├── DepositModal.tsx  # USDT deposit instructions
│   │   └── HistoryModal.tsx  # Transaction history in modal
│   ├── HoldingCard.tsx       # Holdings display with P&L
│   ├── PriceDisplay.tsx      # Current price ticker
│   ├── TolaPrice.tsx         # Tola price display
│   ├── TolaCard.tsx          # Tola-based gold card
│   ├── GoldChart.tsx         # 7-day price chart (Recharts)
│   ├── TradingViewWidget.tsx # TradingView embed
│   ├── CardModals.tsx        # Gold card modals
│   └── TransactionList.tsx   # Transaction history list
├── hooks/                    # Custom React hooks
│   ├── useSwap.ts            # Buy swap logic (USDT → XAUT)
│   └── useSellSwap.ts        # Sell swap logic (XAUT → USDT)
├── lib/                      # Core utilities
│   ├── prisma.ts             # Prisma client singleton
│   ├── redis.ts              # Redis client
│   ├── viem.ts               # Server-side Viem clients
│   ├── clientViem.ts         # Client-side Viem (browser)
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # Server-side auth verification
│   ├── apiClient.ts          # Client-side authenticated fetch
│   ├── constants.ts          # Smart contracts, config values
│   ├── theme.tsx             # Theme provider
│   └── utils.ts              # Helper functions
├── services/                 # Business logic
│   ├── priceOracle.ts        # Gold price fetching & caching
│   ├── dexService.ts         # Camelot V3 DEX interactions
│   ├── onmetaService.ts      # INR payment processing
│   └── transactionProcessor.ts
├── store/                    # Zustand state
│   └── index.ts              # Global app state
└── types/                    # TypeScript interfaces
    └── index.ts              # All type definitions
```

## Development Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database Commands

```bash
pnpm db:push      # Push schema changes to database (primary method)
pnpm db:generate  # Generate Prisma client
pnpm db:studio    # Open Prisma Studio GUI
```

Note: Using `db:push` for schema sync. Migrations not configured.

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | Smart contract addresses, chain ID, decimals, swap limits |
| `src/lib/viem.ts` | Server-side Viem public client |
| `src/lib/clientViem.ts` | Client-side Viem + ERC20/Router ABIs for browser |
| `src/lib/auth.ts` | Server-side Privy token verification |
| `src/lib/apiClient.ts` | Client-side `authFetch()` with Bearer token |
| `src/hooks/useSwap.ts` | Buy flow: USDT → XAUT swap hook |
| `src/hooks/useSellSwap.ts` | Sell flow: XAUT → USDT swap hook |
| `src/services/dexService.ts` | Camelot V3 swap quotes and execution |
| `src/services/priceOracle.ts` | CoinGecko price fetching with Redis cache |
| `prisma/schema.prisma` | Database schema (User, Holding, Transaction, PriceHistory) |
| `src/types/index.ts` | All TypeScript interfaces and types |

## Coding Conventions

### TypeScript
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- All API responses use `ApiResponse<T>` wrapper type

### Components
- PascalCase for component names
- Located in `src/components/`
- Use `cn()` helper from `utils.ts` for Tailwind class merging

### API Routes
- Located in `src/app/api/`
- Return JSON with `ApiResponse<T>` structure
- Protected routes use `verifyAuth()` from `src/lib/auth.ts`
- Client calls use `authFetch()` from `src/lib/apiClient.ts` to attach Bearer token

### Financial Calculations
- Always use `decimal.js` for money/token amounts
- Never use JavaScript floats for financial math
- XAUT has 6 decimals, USDT has 6 decimals

### Formatting Functions (from utils.ts)
- `formatINR()` - Currency formatting for Indian rupees
- `formatGrams()` - Gold amount display
- `formatPercent()` - Percentage display
- `ouncesToGrams()` / `gramsToOunces()` - Unit conversion

## Smart Contract Addresses (Arbitrum Mainnet)

```typescript
XAUT0: '0x40461291347e1eCbb09499F3371D3f17f10d7159'
USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
CAMELOT_V3_ROUTER: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18'
CAMELOT_V3_QUOTER: '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E'
```

Chain ID: 42161 (Arbitrum One)

### Constants (from constants.ts)

```typescript
// Token decimals
XAUT_DECIMALS = 6
USDT_DECIMALS = 6

// Unit conversions
GRAMS_PER_OUNCE = 31.1035
GRAMS_PER_TOLA = 10

// Swap limits (Buy)
MIN_USDT_SWAP = 5
MAX_USDT_SWAP = 100000
QUOTE_REFRESH_INTERVAL = 15000  // 15 seconds
QUOTE_VALIDITY_SECONDS = 60
SWAP_DEADLINE_MINUTES = 5

// Swap limits (Sell)
MIN_GRAMS_SELL = 0.01
MAX_GRAMS_SELL = 1000

// Slippage
SLIPPAGE_TOLERANCE = 0.005  // 0.5%
```

## Database Models

### User
- Links Privy user ID to wallet address
- One-to-one relation with Holding
- One-to-many relation with Transactions

### Holding
- User's XAUT balance, average buy price, total invested
- Auto-created when user signs up
- Updated after each buy/sell

### Transaction
- Records buy/sell operations
- Status: pending → processing → completed/failed
- Stores prices, amounts, blockchain tx hashes

### PriceHistory
- Historical gold prices for charts
- Stored every 5 minutes

## Environment Variables

Required environment variables (see `.env` file):

```
DATABASE_URL               # PostgreSQL connection string
REDIS_URL                  # Redis/Upstash URL

NEXT_PUBLIC_PRIVY_APP_ID   # Privy app ID (public)
PRIVY_APP_SECRET           # Privy secret (server-only)

ARBITRUM_RPC_URL           # Arbitrum RPC endpoint
TREASURY_PRIVATE_KEY       # Server wallet private key (NEVER expose)
TREASURY_WALLET_ADDRESS    # Treasury wallet address

COINGECKO_API_KEY          # For gold price feed

NEXT_PUBLIC_SUPABASE_URL   # Supabase URL
SUPABASE_SERVICE_ROLE_KEY  # Supabase service key

ONMETA_API_KEY             # Payment integration
ONMETA_MERCHANT_ID         # Payment integration
ONMETA_WEBHOOK_SECRET      # Payment integration
```

## API Endpoints

### Public Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices` | GET | Current gold price (USD, INR, per gram) |
| `/api/prices/history` | GET | 7-day price history for charts |
| `/api/prices/tola` | GET | Gold price per tola |

### Protected Endpoints (require Bearer token)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sync` | POST | Sync Privy user to database |
| `/api/holdings` | GET | User's holdings with P&L |
| `/api/balance/usdt` | GET | User's USDT wallet balance |
| `/api/balance/xaut` | GET | User's XAUT wallet balance (+ grams) |
| `/api/swap/quote` | GET | Get quote for USDT → XAUT swap |
| `/api/swap/record` | POST | Record completed buy swap |
| `/api/sell/quote` | GET | Get quote for XAUT → USDT swap |
| `/api/sell/record` | POST | Record completed sell swap |
| `/api/transactions/buy` | POST | Initiate buy transaction |
| `/api/transactions/sell` | POST | Initiate sell transaction |
| `/api/transactions/history` | GET | User's transaction history |
| `/api/webhooks/onmeta` | POST | Payment confirmation webhook |

## Transaction Flows

### Buy Flow (Client-Side Swap via useSwap hook)
1. User enters USDT amount on buy page
2. Fetch quote from `/api/swap/quote`
3. Check USDT allowance for Camelot Router
4. If insufficient, send approval tx (user signs via Privy)
5. Execute swap tx: USDT → XAUT on Camelot
6. Wait for tx confirmation
7. Record transaction via `/api/swap/record`
8. Refresh balances

### Sell Flow (Client-Side Swap via useSellSwap hook)
1. User enters grams amount on sell page
2. Convert grams to XAUT (÷ 31.1035)
3. Fetch quote from `/api/sell/quote`
4. Check XAUT allowance for Camelot Router
5. If insufficient, send approval tx
6. Execute swap tx: XAUT → USDT on Camelot
7. Wait for tx confirmation
8. Record transaction via `/api/sell/record`
9. Refresh balances

### Swap Step States (SwapStep type)
`input` → `approve` → `swap` → `confirming` → `success` | `error`

## Custom Hooks

### useSwap (Buy)
Located in `src/hooks/useSwap.ts`. Manages the USDT → XAUT buy flow.

**Returns:**
- `walletAddress`, `usdtBalance`, `balanceLoading`
- `quote`, `quoteLoading`
- `step` (SwapStep), `error`
- `approvalTxHash`, `swapTxHash`
- `fetchBalance()`, `fetchQuote(amount)`, `executeSwap(usdtAmount)`, `reset()`

### useSellSwap (Sell)
Located in `src/hooks/useSellSwap.ts`. Manages the XAUT → USDT sell flow.

**Returns:**
- `walletAddress`, `xautBalance`, `xautBalanceGrams`, `balanceLoading`
- `quote`, `quoteLoading`
- `step` (SwapStep), `error`
- `approvalTxHash`, `swapTxHash`
- `fetchBalance()`, `fetchQuote(gramsAmount)`, `executeSell(gramsAmount)`, `reset()`

## Authentication Pattern

### Server-Side (`src/lib/auth.ts`)
```typescript
import { verifyAuth } from '@/lib/auth';

const auth = await verifyAuth();
if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// auth.privyUserId available
```

### Client-Side (`src/lib/apiClient.ts`)
```typescript
import { authFetch, authFetchJson } from '@/lib/apiClient';

// Automatically attaches Bearer token from Privy
const res = await authFetch('/api/holdings');
const { success, data, error } = await authFetchJson<HoldingData>('/api/holdings');
```

## Testing & Verification

After making changes:
1. Run `pnpm build` to check for TypeScript errors
2. Run `pnpm lint` to check code style
3. Start dev server with `pnpm dev` and test manually
4. For schema changes: `pnpm db:push` to sync database

## Important Notes

- **Never expose TREASURY_PRIVATE_KEY** - only use server-side
- **No crypto jargon in UI** - users see "grams of gold", not "XAUT tokens"
- **Mobile-first design** - all UI optimized for phone screens
- **Use Indian locale** - amounts in INR, dates in IST
- **Price caching** - 60 second TTL to reduce API calls
- **Client vs Server Viem** - use `clientViem.ts` in browser (hooks/components), `viem.ts` on server (API routes)
- **Swaps are client-side** - user signs transactions via Privy embedded wallet, not server treasury
- **Tola unit** - 1 tola = 10 grams (common in India for gold pricing)
