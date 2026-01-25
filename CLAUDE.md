# CLAUDE.md - Bullion App

## Project Overview

Bullion is a Progressive Web App (PWA) for digital gold savings targeting Indian users. Users can buy and sell tokenized gold (XAUT0) on Arbitrum using INR. The app abstracts away all blockchain/crypto complexity and presents itself as a simple gold savings app.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS with custom gold color palette
- **Database**: PostgreSQL via Prisma ORM
- **Cache**: Redis (in-memory mock in dev, Upstash in production)
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
│   ├── (dashboard)/          # Protected routes (holdings, buy, sell, transactions)
│   ├── api/                  # Backend API routes
│   │   ├── prices/           # Gold price endpoints
│   │   ├── holdings/         # User holdings
│   │   ├── transactions/     # Buy/sell/history
│   │   └── webhooks/         # Onmeta payment webhooks
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # Privy provider setup
│   └── manifest.ts           # PWA manifest
├── components/               # Reusable React components
│   ├── HoldingCard.tsx       # Holdings display with P&L
│   ├── PriceDisplay.tsx      # Current price ticker
│   ├── GoldChart.tsx         # 7-day price chart
│   └── TransactionList.tsx   # Transaction history list
├── lib/                      # Core utilities
│   ├── prisma.ts             # Prisma client singleton
│   ├── redis.ts              # Redis client
│   ├── viem.ts               # Viem blockchain clients
│   ├── supabase.ts           # Supabase client
│   ├── constants.ts          # Smart contracts, config values
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
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate Prisma client
pnpm db:studio    # Open Prisma Studio GUI
pnpm db:migrate   # Run migrations (if configured)
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | Smart contract addresses, chain ID, decimals, cache durations |
| `src/lib/prisma.ts` | Database client singleton |
| `src/lib/viem.ts` | Public and wallet clients for Arbitrum |
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
- Use Prisma for all database operations

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

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices` | GET | Current gold price (USD, INR, per gram) |
| `/api/prices/history` | GET | 7-day price history for charts |
| `/api/holdings` | GET | User's holdings with P&L |
| `/api/transactions/buy` | POST | Initiate buy transaction |
| `/api/transactions/sell` | POST | Initiate sell transaction |
| `/api/transactions/history` | GET | User's transaction history |
| `/api/webhooks/onmeta` | POST | Payment confirmation webhook |

## Transaction Flows

### Buy Flow
1. User enters INR amount
2. Create transaction record (status: pending)
3. Create Onmeta order (INR → USDT)
4. User completes payment
5. Webhook confirms USDT received
6. Swap USDT → XAUT on Camelot
7. Transfer XAUT to user wallet
8. Update holdings (status: completed)

### Sell Flow
1. User enters XAUT amount
2. Create transaction record (status: pending)
3. Transfer XAUT from user to treasury
4. Swap XAUT → USDT on Camelot
5. Create Onmeta payout (USDT → INR)
6. Update holdings (status: completed)

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
