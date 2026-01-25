# MVP Prompt for Claude Code: Bullion - XAUT Gold Savings PWA

## Project Overview
Build a Progressive Web App (PWA) that allows Indian users to buy and sell tokenized gold (XAUT0) on Arbitrum using INR. The app abstracts away all crypto complexity and presents itself as a simple gold savings app.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, next-pwa
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis (via Upstash)
- **Blockchain**: Arbitrum, Viem v2
- **Auth/Wallet**: Privy SDK
- **State**: Zustand
- **Blockchain Interaction**: Viem

## Core Features to Build

### 1. Authentication & Wallet Setup
- Privy integration for phone/email login
- Embedded wallet creation (MPC)
- User sees wallet address in settings but doesn't need to manage seed phrases

### 2. Buy Flow
- User enters INR amount
- Shows estimated grams of gold they'll receive
- Integrates with Onmeta for INR → USDT on Arbitrum
- Backend swaps USDT → XAUT0 on Camelot DEX
- Transfers XAUT0 to user's Privy wallet
- Updates user holdings in database

### 3. Holdings Dashboard
- Display gold holdings in grams and INR value
- Show profit/loss vs invested amount
- Live gold price ticker (updates every 60 seconds)
- Simple chart showing price history (last 7 days)

### 4. Sell Flow
- User enters XAUT amount or INR equivalent
- Transfers XAUT from user wallet to treasury wallet
- Backend swaps XAUT0 → USDT on Camelot
- Onmeta handles USDT → INR to user's bank account
- Updates holdings

### 5. Transaction History
- List of all buy/sell transactions
- Status indicators (pending, processing, completed, failed)
- Transaction details with blockchain explorer links

## Smart Contract Addresses (Arbitrum)
```typescript
XAUT0: '0x40461291347e1eCbb09499F3371D3f17f10d7159'
USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
CAMELOT_V3_ROUTER: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18' // Verify this
CAMELOT_V3_QUOTER: '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E' // Verify this
```

## Database Schema (Prisma)
```prisma
model User {
  id            String    @id @default(uuid())
  privyUserId   String    @unique
  walletAddress String    @unique
  phone         String?
  email         String?
  kycStatus     String    @default("pending")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  holdings      Holding?
  transactions  Transaction[]
}

model Holding {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  xautAmount        Decimal  @default(0) @db.Decimal(18, 6)
  avgBuyPriceInr    Decimal? @db.Decimal(18, 2)
  totalInvestedInr  Decimal  @default(0) @db.Decimal(18, 2)
  unrealizedPnlInr  Decimal? @db.Decimal(18, 2)
  updatedAt         DateTime @updatedAt
}

model Transaction {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  type            String    // 'buy' | 'sell'
  status          String    // 'pending' | 'processing' | 'completed' | 'failed'
  
  xautAmount      Decimal?  @db.Decimal(18, 6)
  usdtAmount      Decimal?  @db.Decimal(18, 6)
  inrAmount       Decimal?  @db.Decimal(18, 2)
  
  goldPriceUsd    Decimal?  @db.Decimal(18, 2)
  usdInrRate      Decimal?  @db.Decimal(10, 4)
  goldPriceInr    Decimal?  @db.Decimal(18, 2)
  
  blockchainTxHash String?
  fromAddress      String?
  toAddress        String?
  
  onmetaOrderId    String?
  dexSwapTxHash    String?
  errorMessage     String?
  
  createdAt        DateTime  @default(now())
  completedAt      DateTime?
  
  @@index([userId, status])
  @@index([createdAt])
}

model PriceHistory {
  id            String   @id @default(uuid())
  goldPriceUsd  Decimal  @db.Decimal(18, 2)
  usdInrRate    Decimal  @db.Decimal(10, 4)
  goldPriceInr  Decimal  @db.Decimal(18, 2)
  source        String   // 'coingecko' | 'pool'
  timestamp     DateTime @default(now())
  
  @@index([timestamp])
}
```

## Project Structure
```
bullion-mvp/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Protected with Privy
│   │   │   ├── page.tsx            # Holdings dashboard
│   │   │   ├── buy/page.tsx
│   │   │   ├── sell/page.tsx
│   │   │   └── transactions/page.tsx
│   │   ├── api/
│   │   │   ├── auth/privy/[...privy]/route.ts
│   │   │   ├── holdings/route.ts
│   │   │   ├── prices/route.ts
│   │   │   ├── transactions/
│   │   │   │   ├── buy/route.ts
│   │   │   │   ├── sell/route.ts
│   │   │   │   └── history/route.ts
│   │   │   └── webhooks/
│   │   │       └── onmeta/route.ts
│   │   ├── layout.tsx
│   │   └── manifest.ts
│   ├── components/
│   │   ├── HoldingCard.tsx
│   │   ├── GoldChart.tsx
│   │   ├── TransactionList.tsx
│   │   └── PriceDisplay.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── viem.ts
│   │   └── constants.ts
│   ├── services/
│   │   ├── priceOracle.ts
│   │   ├── dexService.ts
│   │   ├── onmetaService.ts
│   │   └── transactionProcessor.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

## Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Blockchain (Arbitrum)
NEXT_PUBLIC_ARBITRUM_CHAIN_ID=42161
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
TREASURY_PRIVATE_KEY=0x...
TREASURY_WALLET_ADDRESS=0x...

# Onmeta (placeholders - integration TBD)
ONMETA_API_KEY=
ONMETA_MERCHANT_ID=
ONMETA_WEBHOOK_SECRET=

# Price Feeds
COINGECKO_API_KEY=
```

## Critical Implementation Details

### 1. Price Oracle Service
Must fetch gold price from:
- CoinGecko API (tether-gold)
- Backup: Query XAUT0/USDT pool on Camelot
- USD/INR rate from forex API
- Cache in Redis for 60 seconds
- Store in PriceHistory table every 5 minutes

### 2. DEX Integration (Camelot V3)
- Use Viem to interact with Camelot V3 Router
- Get quotes before executing swaps
- Handle approvals (ERC20 approve USDT/XAUT for router)
- Apply 0.5% slippage tolerance
- Monitor gas prices, fail if >0.01 ETH

### 3. Transaction Flow
**Buy:**
1. Create transaction record (status: pending)
2. Calculate XAUT amount based on current price
3. Create Onmeta order (INR → USDT)
4. User completes payment on Onmeta
5. Webhook receives USDT in treasury
6. Swap USDT → XAUT on Camelot
7. Transfer XAUT to user wallet
8. Update holdings and transaction (status: completed)

**Sell:**
1. Create transaction record (status: pending)
2. Request user signature to transfer XAUT to treasury
3. Wait for XAUT transfer confirmation
4. Swap XAUT → USDT on Camelot
5. Create Onmeta payout order (USDT → INR)
6. Update holdings and transaction (status: completed)

### 4. PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```
```typescript
// app/manifest.ts
export default function manifest() {
  return {
    name: 'Bullion - Digital Gold Savings',
    short_name: 'Bullion',
    description: 'Save in digital gold with zero storage fees',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#F59E0B',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

### 5. Privy Integration
```typescript
// app/layout.tsx
import { PrivyProvider } from '@privy-io/react-auth';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            loginMethods: ['email', 'sms'],
            appearance: {
              theme: 'light',
              accentColor: '#F59E0B',
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
```

## API Endpoints to Build

### GET /api/holdings
Returns user's current holdings

### GET /api/prices
Returns current gold prices (USD, INR, per gram)

### POST /api/transactions/buy
Body: `{ inrAmount: number }`
Creates buy transaction and Onmeta order

### POST /api/transactions/sell
Body: `{ xautAmount: number }`
Creates sell transaction and initiates swap

### GET /api/transactions/history
Returns user's transaction history

### POST /api/webhooks/onmeta
Handles Onmeta payment confirmations

## UI/UX Requirements
- Mobile-first design
- Show amounts in grams (familiar to Indian users)
- Always show both INR and grams
- Clear loading states during multi-step transactions
- Error messages in simple language (no crypto jargon)
- Smooth animations for price updates
- Pull-to-refresh on dashboard

## Testing Checklist
- [ ] Privy login flow works
- [ ] Price oracle fetches correctly
- [ ] Buy transaction creates record
- [ ] DEX swap executes successfully
- [ ] Holdings update after buy
- [ ] Transaction history displays
- [ ] PWA installs on mobile
- [ ] Manifest and icons load correctly

## Important Notes
1. **Never expose treasury private key** - only use server-side
2. **Validate all user inputs** - especially amounts
3. **Handle errors gracefully** - blockchain operations can fail
4. **Add transaction retry logic** - for failed swaps
5. **Log everything** - for debugging Onmeta webhooks
6. **Test on Arbitrum Sepolia first** - before mainnet

## MVP Exclusions (Don't Build)
- SIP/Auto-invest
- Yield farming integration
- Jeweler redemption
- Tax reporting
- Referral system
- Advanced charts
- Multiple fiat currencies

## Success Criteria
- User can sign up in <30 seconds
- Buy flow completes in <3 minutes
- Holdings display real-time prices
- App works offline (PWA)
- Works on both iOS and Android
- No crypto jargon anywhere in UI

## Build Priority
1. Database setup + Prisma
2. Privy auth + wallet
3. Price oracle service
4. Holdings dashboard (read-only)
5. DEX service (Camelot swaps)
6. Buy flow (without Onmeta first - use mock)
7. Sell flow
8. Transaction history
9. PWA configuration
10. Onmeta integration

Start with Step 1 and ask me to confirm before proceeding to the next step.