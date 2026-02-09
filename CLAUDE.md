# CLAUDE.md - Bullion App

## Project Overview

Bullion is a Progressive Web App (PWA) for digital gold savings targeting Indian users. Users can buy and sell tokenized gold (XAUT0) on Arbitrum using INR. The app abstracts away all blockchain/crypto complexity and presents itself as a simple gold savings app.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS with custom gold color palette
- **Database**: PostgreSQL via Supabase
- **Cache**: Redis (in-memory mock in dev, Upstash in production)
- **Icons**: Lucide React
- **Auth/Wallet**: Privy SDK (phone/email login with embedded wallets)
- **Blockchain**: Viem v2 on Arbitrum
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion v12+) via `motion/react` + `tailwindcss-animate` Tailwind plugin
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
│   ├── animations/           # Animation system components
│   │   ├── FadeUp.tsx        # Fade-up entrance wrapper
│   │   ├── StaggerContainer.tsx # Staggered list reveal
│   │   ├── PageTransition.tsx   # Page-level entrance animation
│   │   ├── AnimatedNumber.tsx   # Smooth number morphing
│   │   └── index.ts          # Barrel exports
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
│   ├── animations.ts         # Shared animation constants & variants
│   ├── form.ts               # React Hook Form + Zod utilities
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

Note: Using `db:push` for schema sync. Migrations not configured.

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | Smart contract addresses, chain ID, decimals, swap limits |
| `src/lib/animations.ts` | Shared easings, durations, springs, motion variants |
| `src/lib/form.ts` | React Hook Form + Zod utilities, validation patterns |
| `src/components/animations/` | Reusable animation wrapper components (FadeUp, Stagger, etc.) |
| `src/lib/viem.ts` | Server-side Viem public client |
| `src/lib/clientViem.ts` | Client-side Viem + ERC20/Router ABIs for browser |
| `src/lib/auth.ts` | Server-side Privy token verification |
| `src/lib/apiClient.ts` | Client-side `authFetch()` with Bearer token |
| `src/hooks/useSwap.ts` | Buy flow: USDT → XAUT swap hook |
| `src/hooks/useSellSwap.ts` | Sell flow: XAUT → USDT swap hook |
| `src/services/dexService.ts` | Camelot V3 swap quotes and execution |
| `src/services/priceOracle.ts` | CoinGecko price fetching with Redis cache |
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

### Animation Requirements

All new client components **MUST** include entrance animations — see "Animation System" section for mandatory patterns. This is non-negotiable to maintain the premium feel of the app.

## Animation System

Bullion uses a comprehensive animation system built on **Motion** (Framer Motion v12+) to create a refined, premium feel appropriate for a financial app. All animations are subtle, purposeful, and consistent.

### Import Rule

```typescript
import { motion, AnimatePresence } from 'motion/react';
// NOT: 'motion/react-client' — that variant is not used in this codebase
```

### Design Philosophy

- **Refined & subtle** — 200-400ms duration, smooth deceleration (`EASE_OUT_EXPO`)
- **No jarring movement** — Maximum 12-16px travel distance
- **Staggered reveals** — 50-80ms between sequential items
- **Spring physics** — Use spring presets for bouncy interactions (buttons, badges)
- **Financial app appropriate** — Professional, not playful

### Shared Constants (`src/lib/animations.ts`)

#### Easing Curves

```typescript
EASE_OUT = [0.25, 0.1, 0.25, 1.0]
EASE_OUT_EXPO = [0.16, 1, 0.3, 1]  // Smooth deceleration, most common
EASE_IN_OUT = [0.42, 0, 0.58, 1]
```

#### Durations (seconds)

```typescript
DURATION.fast = 0.2    // Quick interactions, exits
DURATION.normal = 0.3  // Default for most elements
DURATION.slow = 0.4    // Hero elements, modals
DURATION.slower = 0.5  // Special emphasis
```

#### Spring Presets

```typescript
SPRING.gentle  // { damping: 30, stiffness: 300 } — card reveals
SPRING.bouncy  // { damping: 20, stiffness: 300 } — success states, badges
SPRING.snappy  // { damping: 35, stiffness: 400 } — button presses
```

#### Stagger Delays

```typescript
STAGGER.fast = 0.04    // Quick lists
STAGGER.normal = 0.06  // Default stagger
STAGGER.slow = 0.08    // Dramatic reveals
```

### Motion Variants (export from `src/lib/animations.ts`)

| Variant | Use Case | Properties |
|---------|----------|------------|
| `fadeUp` | Standard entrance | `opacity: 0→1, y: 12→0` |
| `fadeIn` | No movement fade | `opacity: 0→1` |
| `scaleIn` | Badges, icons, success | `opacity: 0→1, scale: 0.85→1` |
| `slideUp` | Modals, bottom sheets | `y: 100%→0` with exit animation |
| `backdropFade` | Modal backdrops | `opacity: 0→1` with exit |
| `modalScale` | Centered modals | `scale: 0.95→1, opacity: 0→1` |
| `pageTransition` | Page containers | Fade-up with stagger children |
| `highlightPulse` | Attention drawing | Box-shadow pulse |
| `staggerContainer()` | List wrappers | Configurable stagger timing |

### Reusable Animation Components

All located in `src/components/animations/`:

#### `FadeUp` — The workhorse
```typescript
import { FadeUp } from '@/components/animations';

<FadeUp delay={0.1} distance={12} duration={0.3}>
  <YourComponent />
</FadeUp>

// Scroll-triggered version
<FadeUp inView once delay={0.2}>
  <YourComponent />
</FadeUp>
```

#### `StaggerContainer` + `StaggerItem` — For lists
```typescript
import { StaggerContainer, StaggerItem } from '@/components/animations';

<StaggerContainer staggerDelay={0.06} delayChildren={0.2}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <ListItem {...item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

#### `PageTransition` — Page wrapper

```typescript
import { PageTransition } from '@/components/animations';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

#### `AnimatedNumber` — Financial values

```typescript
import { AnimatedNumber } from '@/components/animations';

<AnimatedNumber 
  value={price} 
  format={formatINR} 
  duration={0.5}
/>
```

### CSS Animation Classes (`src/app/globals.css`)

#### `.live-dot`
Breathing glow animation for live price indicators.
```html
<span className="live-dot w-2 h-2 rounded-full bg-success" />
```

#### `.gold-shimmer`
Subtle shimmer overlay for premium cards (holdings card, TolaCard).
```html
<div className="card-gold relative overflow-hidden">
  <div className="absolute inset-0 gold-shimmer pointer-events-none" />
  {/* card content */}
</div>
```

### Mandatory Patterns for New Components

#### 1. **Pages** — Fade-up entrance on mount
```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
>
  {/* page content */}
</motion.div>
```

#### 2. **Page Sections** — Staggered reveal
Wrap sections in `StaggerContainer`, use `FadeUp` or `StaggerItem` for children.

#### 3. **Modals** — Scale + fade with backdrop
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      variants={backdropFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-6"
        variants={modalScale}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >
        {/* modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

#### 4. **Lists/Grids** — Staggered children
```typescript
<motion.div
  initial="hidden"
  animate="visible"
  variants={staggerContainer(STAGGER.normal)}
>
  {items.map((item, i) => (
    <motion.div key={i} variants={fadeUp}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### 5. **Buttons** — Press feedback
```typescript
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={SPRING.snappy}
>
  Click me
</motion.button>
```

#### 6. **Loading Spinners** — Controlled rotation (not CSS)
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
>
  <RefreshCw className="size-4" />
</motion.div>
```

#### 7. **Financial Values** — `AnimatedNumber`
Any price, balance, or holdings value that changes should use `AnimatedNumber` for smooth morphing.

#### 8. **Tab/Filter Pills** — Animated indicator
Use `layoutId` for sliding active indicator:
```typescript
{tabs.map(tab => (
  <button key={tab} onClick={() => setActive(tab)}>
    {active === tab && (
      <motion.div
        className="absolute inset-0 bg-white rounded-full"
        layoutId="tabIndicator"
        transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
      />
    )}
    <span className="relative z-10">{tab}</span>
  </button>
))}
```

### Accessibility

- **Reduced motion**: All components respect `prefers-reduced-motion` via `useReducedMotion()` hook
- **No auto-play**: No distracting infinite animations except subtle shimmer
- **Focus states**: Maintain visibility during animations

### Examples in Existing Code

- **Dashboard layout** (`src/app/(dashboard)/layout.tsx`): Page transitions + bottom nav sliding indicator
- **Home page** (`src/app/(dashboard)/page.tsx`): Staggered sections, holdings card with shimmer, returns badge spring-in
- **Login page** (`src/app/(auth)/login/page.tsx`): Orchestrated carousel entrance with staggered features
- **Sell page** (`src/app/(dashboard)/sell/page.tsx`): Error/success state animations, quote expand/collapse
- **TolaCard** (`src/components/TolaCard.tsx`): 3D tilt entrance on mount

## Form Management

Bullion uses **React Hook Form** with **Zod** for type-safe form validation. This is the standard approach for all forms, especially important for upcoming KYC flows.

### Imports from `src/lib/form.ts`

```typescript
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
```

The `form.ts` utility file re-exports commonly used items for convenience:

- `z` — Zod schema builder
- `useForm`, `useFormContext`, `FormProvider`, `Controller` — React Hook Form hooks
- `zodResolver` — Connects Zod schemas to React Hook Form
- `FormData<T>` — Type helper to infer form types from Zod schemas

### Available Validation Patterns

Pre-built validators for Indian KYC requirements:

```typescript
import { validationPatterns } from '@/lib/form';

validationPatterns.email     // Email validation
validationPatterns.phone     // Indian 10-digit mobile (starts with 6-9)
validationPatterns.pan       // PAN card format (ABCDE1234F)
validationPatterns.aadhaar   // 12-digit Aadhaar number
validationPatterns.pincode   // 6-digit Indian pincode
validationPatterns.ifsc      // Bank IFSC code
validationPatterns.accountNumber  // 9-18 digit bank account
validationPatterns.upiId     // UPI ID format
```

### Reusable Schema Builders

```typescript
import { commonSchemas } from '@/lib/form';

// Amount in INR with min/max
commonSchemas.inrAmount(100, 100000)  // ₹100 - ₹1,00,000

// Amount in grams
commonSchemas.gramsAmount(0.01, 1000)  // 0.01g - 1000g

// Optional text with max length
commonSchemas.optionalText(100)  // Optional, max 100 chars

// Required string with custom field name in error
commonSchemas.requiredString('Full Name')  // "Full Name is required"
```

### Key Patterns

| Pattern | Usage |
|---------|-------|
| `register('fieldName')` | Spread on native inputs |
| `watch('fieldName')` | Get reactive field value |
| `setValue('fieldName', value, { shouldValidate: true })` | Programmatic update |
| `errors.fieldName?.message` | Display validation error |
| `isValid` | Form passes all validation |
| `isSubmitting` | Async submit in progress |
| `mode: 'onChange'` | Validate on every change (real-time) |
| `mode: 'onBlur'` | Validate when field loses focus |

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
