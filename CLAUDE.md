# CLAUDE.md - Bullion App

## Project Overview

Bullion (gold.fi) is a mobile app for digital gold savings targeting Indian users. Users can buy and sell tokenized gold (XAUT0) on Arbitrum using INR/UPI. The app abstracts away all blockchain/crypto complexity and presents itself as a simple gold savings app.

**Architecture**: Expo React Native (iOS) frontend + separately deployed Next.js API backend. The mobile app calls backend APIs via absolute URL.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5 + React 19
- **Router**: Expo Router v6 (file-based routing in `app/` directory)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native) + `react-native-css-interop`
- **Database**: PostgreSQL via Supabase (direct queries, no ORM)
- **Icons**: Lucide React Native
- **Auth/Wallet**: Privy Expo SDK (`@privy-io/expo` v0.63.4) — email/code login with embedded wallets
- **Blockchain**: Viem v2 on Arbitrum
- **State Management**: Zustand
- **Animations**: Moti v0.29 + Reanimated v4
- **Forms**: React Hook Form + Zod
- **Numbers**: decimal.js for precise financial calculations
- **Fonts**: DM Sans (via `@expo-google-fonts/dm-sans`)

## Project Structure

```
├── index.js                  # Entry point — crypto polyfills + expo-router/entry
├── app.json                  # Expo config (scheme: goldfi, typed routes)
├── babel.config.js           # Expo preset + NativeWind + Reanimated plugin
├── metro.config.js           # NativeWind integration + conditionNames
├── tailwind.config.ts        # Gold color palette, dark mode, NativeWind preset
├── global.css                # @tailwind base/components/utilities
├── eas.json                  # EAS Build profiles (dev/preview/production)
│
├── app/                      # Expo Router (file-based routes)
│   ├── _layout.tsx           # Root layout (fonts, AuthProvider, ThemeProvider, Stack)
│   ├── (auth)/
│   │   ├── _layout.tsx       # Auth group layout
│   │   └── login.tsx         # Privy email/code login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar (Home, Card, Earn, Settings) + auth guard
│   │   ├── index.tsx         # Home — holdings, price, quick actions
│   │   ├── card.tsx          # Gold card feature
│   │   ├── account/          # Settings, personal info
│   │   │   ├── index.tsx     # Account settings
│   │   │   ├── personal.tsx  # Personal info
│   │   │   └── kyc.tsx       # KYC verification
│   │   └── yield/            # Earn / yield strategies
│   │       ├── index.tsx     # Yield overview
│   │       └── strategies/   # Strategy list + detail
│   ├── buy/
│   │   ├── index.tsx         # Buy gold (USDT swap)
│   │   └── upi.tsx           # Buy gold via UPI
│   ├── sell.tsx              # Sell gold
│   ├── gift/
│   │   ├── index.tsx         # Gift history
│   │   ├── send.tsx          # Send gold gift
│   │   └── claim/[token].tsx # Claim a gift
│   ├── transactions.tsx      # Transaction history
│   ├── gold-charts.tsx       # TradingView charts
│   ├── autopay/              # Auto-pay SIP
│   │   ├── index.tsx         # AutoPay list
│   │   ├── new.tsx           # Create new plan
│   │   └── [id].tsx          # Plan detail
│   ├── redeem/               # Physical redemption
│   │   ├── index.tsx         # Redeem overview
│   │   └── jewellers.tsx     # Jeweller list
│   └── +not-found.tsx        # 404 screen
│
├── src/
│   ├── lib/                  # Core utilities (shared by app)
│   │   ├── auth-provider.tsx # AuthProvider + AuthGate (Privy wrapper)
│   │   ├── apiClient.ts      # authFetch() / authFetchJson() with Bearer token
│   │   ├── supabase.ts       # Supabase client (SecureStore auth adapter) + Db* types
│   │   ├── clientViem.ts     # Client-side Viem + ERC20/Router ABIs
│   │   ├── constants.ts      # Contract addresses, chain ID, limits
│   │   ├── utils.ts          # cn(), formatINR(), formatGrams(), etc.
│   │   ├── animations.ts     # Moti/Reanimated presets (FADE_UP, SCALE_IN, etc.)
│   │   ├── theme.tsx         # ThemeProvider (light/dark/system, AsyncStorage)
│   │   ├── form.ts           # React Hook Form + Zod re-exports, validation patterns
│   │   ├── polyfills.ts      # Crypto polyfills (used by index.js)
│   │   ├── giftData.ts       # Gift presets & occasions
│   │   ├── copy.ts           # Clipboard utility
│   │   ├── yieldData.ts      # Yield strategy mock data
│   │   ├── mock/autopay.ts   # AutoPay mock data
│   │   ├── auth.ts           # Server-side auth (reference, used by backend)
│   │   ├── redis.ts          # Redis client (reference, used by backend)
│   │   └── viem.ts           # Server-side Viem (reference, used by backend)
│   ├── components/           # Reusable React Native components
│   │   ├── animations/       # Animation wrappers
│   │   │   ├── FadeUp.tsx
│   │   │   ├── StaggerContainer.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   ├── AnimatedNumber.tsx
│   │   │   └── index.ts
│   │   ├── Buy/              # Buy flow (SwapModal, UPI flow, etc.)
│   │   ├── Gift/             # Gift flow (send, claim, preview, etc.)
│   │   ├── AutoPay/          # AutoPay components
│   │   ├── HoldingCard.tsx   # Holdings display with P&L
│   │   ├── PriceDisplay.tsx  # Current price ticker
│   │   ├── TolaCard.tsx      # Tola-based gold card
│   │   ├── TolaPrice.tsx     # Tola price display
│   │   ├── GoldChart.tsx     # Price chart
│   │   ├── CardModals.tsx    # Gold card modals
│   │   ├── TransactionList.tsx
│   │   ├── TransactionDetailModal.tsx
│   │   └── TradingViewWidget.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useSwap.ts        # Buy: USDT → XAUT swap
│   │   ├── useSellSwap.ts    # Sell: XAUT → USDT swap
│   │   ├── useUpiFlow.ts     # UPI payment flow
│   │   ├── useGiftSend.ts    # Gift sending flow
│   │   └── useAutoPay.ts     # AutoPay management
│   ├── services/             # Business logic (reference, used by backend)
│   │   ├── dexService.ts     # Camelot V3 DEX interactions
│   │   ├── priceOracle.ts    # Gold price fetching
│   │   ├── onmetaService.ts  # INR payment processing
│   │   ├── giftService.ts    # Gift sending/claiming
│   │   ├── emailService.ts   # Email notifications
│   │   └── transactionProcessor.ts
│   ├── store/
│   │   └── index.ts          # Zustand store (goldPrice, holding, transactions)
│   ├── types/
│   │   └── index.ts          # All TypeScript interfaces
│   └── _app_web/             # OLD Next.js routes (reference only, gitignored)
```

## Development Commands

```bash
# Development (MUST use Node 20 — Node 22+ breaks Expo type stripping)
nvm use 20
npx expo start --clear   # Dev server
npx expo start --tunnel --clear   # Dev server (if LAN hangs)

# Build verification
npx expo export --platform ios    # Verify production bundle
npx tsc --noEmit                  # TypeScript check

# EAS Build
eas build --profile development --platform ios
eas build --profile preview --platform ios
eas build --profile production --platform ios

# Lint
pnpm lint
```

**Critical**: Always use `--tunnel` mode for Expo Go. LAN mode hangs on "opening project..." screen.

## Key Files Reference

| File | Purpose |
|------|---------|
| `index.js` | Entry point — crypto polyfills MUST run before expo-router/entry |
| `app/_layout.tsx` | Root layout — fonts, AuthProvider, ThemeProvider, Stack |
| `app/(tabs)/_layout.tsx` | Tab bar + auth guard (redirects to login if unauthenticated) |
| `src/lib/auth-provider.tsx` | Privy wrapper — AuthProvider, AuthGate, useAuth() hook |
| `src/lib/apiClient.ts` | authFetch() / authFetchJson() with Bearer token |
| `src/lib/supabase.ts` | Supabase client (SecureStore adapter) + Db* types |
| `src/lib/constants.ts` | Contract addresses, chain ID, decimals, swap limits |
| `src/lib/animations.ts` | Moti animation presets (FADE_UP, SCALE_IN, etc.) |
| `src/lib/theme.tsx` | ThemeProvider (light/dark/system via AsyncStorage) |
| `src/lib/form.ts` | React Hook Form + Zod re-exports, validation patterns |
| `src/lib/clientViem.ts` | Client-side Viem + ERC20/Router ABIs |
| `src/lib/utils.ts` | cn(), formatINR(), formatGrams(), formatPercent() |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/store/index.ts` | Zustand store |

## Coding Conventions

### TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- All API responses use `ApiResponse<T>` wrapper type
- **Whitelist include in tsconfig** — new `src/lib/` files MUST be added to `tsconfig.json` `include` array

### Components

- React Native components (View, Text, Pressable, ScrollView — NOT div, span, button)
- PascalCase for component names, located in `src/components/`
- Use `cn()` helper from `utils.ts` for NativeWind class merging
- Use `className` prop (NativeWind) instead of `StyleSheet.create()`

### Privy SDK

- `@privy-io/expo` MUST be lazy-loaded via `require()` — top-level import crashes in dev bypass mode
- Dev bypass: `DEV_BYPASS_AUTH = __DEV__` in auth-provider.tsx skips Privy entirely
- User email: extract from `user.linked_accounts` (type 'email'), NOT `user.email`
- Token getter: `setAccessTokenGetter(getAccessToken)` wired in AuthGate
- Auth guard lives in `app/(tabs)/_layout.tsx` — redirects to login if not authenticated

### API Calls

- Backend is a separately deployed Next.js app
- Mobile app calls via `authFetch()` / `authFetchJson()` from `src/lib/apiClient.ts`
- `EXPO_PUBLIC_API_URL` env var sets the base URL
- Bearer token auto-attached from Privy

### Financial Calculations

- Always use `decimal.js` for money/token amounts
- Never use JavaScript floats for financial math
- XAUT has 6 decimals, USDT has 6 decimals

### Formatting Functions (from utils.ts)

- `formatINR()` — Currency formatting for Indian rupees
- `formatGrams()` — Gold amount display
- `formatPercent()` — Percentage display
- `ouncesToGrams()` / `gramsToOunces()` — Unit conversion
- `truncateAddress()` — Wallet address display
- `formatDate()` — Indian locale date formatting
- `calculatePnlPercent()` — P&L calculation with Decimal

## Animation System

Bullion uses **Moti** (built on Reanimated 3) for animations. All presets are in `src/lib/animations.ts`.

### Import Rule

```typescript
import { MotiView } from 'moti';
import { FADE_UP, SCALE_IN, DURATION, STAGGER } from '@/lib/animations';

// Spread preset directly on MotiView:
<MotiView {...FADE_UP}>...</MotiView>
```

### Design Philosophy

- **Refined & subtle** — 200–400ms duration, smooth deceleration
- **No jarring movement** — Maximum 12–16px travel distance
- **Staggered reveals** — 40–80ms between sequential items
- **Financial app appropriate** — Professional, not playful

### Shared Constants (`src/lib/animations.ts`)

```typescript
// Easing (Reanimated Easing objects)
EASE_OUT         // Easing.out(Easing.quad)
EASE_OUT_EXPO    // Easing.out(Easing.exp) — most common
EASE_IN_OUT      // Easing.inOut(Easing.quad)

// Durations (milliseconds — Reanimated uses ms)
DURATION.fast = 200     // Quick interactions
DURATION.normal = 300   // Default
DURATION.slow = 400     // Hero elements, modals
DURATION.slower = 500   // Special emphasis

// Spring configs
SPRING.gentle   // { damping: 30, stiffness: 300 } — card reveals
SPRING.bouncy   // { damping: 20, stiffness: 300 } — success states
SPRING.snappy   // { damping: 35, stiffness: 400 } — button presses

// Stagger delays (ms)
STAGGER.fast = 40      // Quick lists
STAGGER.normal = 60    // Default
STAGGER.slow = 80      // Dramatic reveals
```

### Moti Animation Presets

| Preset | Use Case | Properties |
|--------|----------|------------|
| `FADE_UP` | Standard entrance | `opacity: 0→1, translateY: 12→0` |
| `FADE_IN` | No movement fade | `opacity: 0→1` |
| `SCALE_IN` | Badges, icons, success | `opacity: 0→1, scale: 0.85→1` (spring) |
| `PAGE_TRANSITION` | Page containers | `opacity: 0→1, translateY: 8→0` |
| `MODAL_SCALE` | Centered modals | `scale: 0.95→1` with exit |
| `BACKDROP_FADE` | Modal backdrops | `opacity: 0→1` with exit |

### Staggered Lists

```typescript
import { MotiView } from 'moti';
import { FADE_UP, staggerDelay } from '@/lib/animations';

{items.map((item, i) => (
  <MotiView key={item.id} {...FADE_UP} delay={staggerDelay(i)}>
    <ListItem {...item} />
  </MotiView>
))}
```

### Reusable Animation Components (`src/components/animations/`)

- `FadeUp` — Fade-up entrance wrapper
- `StaggerContainer` + `StaggerItem` — Staggered list reveal
- `PageTransition` — Page-level entrance animation
- `AnimatedNumber` — Smooth number morphing for financial values

### Mandatory Patterns for New Screens

1. **Pages** — Wrap in `<MotiView {...PAGE_TRANSITION}>` or `<PageTransition>`
2. **Lists** — Use `staggerDelay(index)` with `FADE_UP`
3. **Modals** — Use `MODAL_SCALE` + `BACKDROP_FADE`
4. **Financial values** — Use `<AnimatedNumber>` for prices/balances
5. **All new components MUST include entrance animations**

## Form Management

Uses **React Hook Form** + **Zod** via `src/lib/form.ts`.

```typescript
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
```

### Validation Patterns (Indian KYC)

```typescript
validationPatterns.email       // Email
validationPatterns.phone       // Indian 10-digit mobile
validationPatterns.pan         // PAN card (ABCDE1234F)
validationPatterns.aadhaar     // 12-digit Aadhaar
validationPatterns.pincode     // 6-digit pincode
validationPatterns.ifsc        // Bank IFSC
validationPatterns.accountNumber // 9-18 digit bank account
validationPatterns.upiId       // UPI ID
```

### Schema Builders

```typescript
commonSchemas.inrAmount(100, 100000)    // ₹100 - ₹1,00,000
commonSchemas.gramsAmount(0.01, 1000)   // 0.01g - 1000g
commonSchemas.optionalText(100)         // Optional, max 100 chars
commonSchemas.requiredString('Name')    // "Name is required"
```

## Smart Contract Addresses (Arbitrum Mainnet)

```typescript
XAUT0: '0x40461291347e1eCbb09499F3371D3f17f10d7159'
USDT:  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
CAMELOT_V3_ROUTER: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18'
CAMELOT_V3_QUOTER: '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E'
```

Chain ID: 42161 (Arbitrum One)

### Constants (from constants.ts)

```typescript
XAUT_DECIMALS = 6
USDT_DECIMALS = 6
GRAMS_PER_OUNCE = 31.1035
GRAMS_PER_TOLA = 10

// Buy limits (USDT swap)
MIN_USDT_SWAP = 5
MAX_USDT_SWAP = 100000

// Buy limits (UPI)
MIN_INR_BUY = 100       // ₹100
MAX_INR_BUY = 100000    // ₹1,00,000

// Sell limits
MIN_GRAMS_SELL = 0.01
MAX_GRAMS_SELL = 1000

SLIPPAGE_TOLERANCE = 0.005  // 0.5%
QUOTE_REFRESH_INTERVAL = 15000  // 15 seconds
```

## Database

Uses Supabase directly (no Prisma/ORM). Client uses `expo-secure-store` for token storage.

- DB types: `Db*` interfaces in `src/lib/supabase.ts` (snake_case columns)
- Frontend types: camelCase in `src/types/index.ts`
- Tables: `users`, `holdings`, `transactions`, `price_history`, `gifts`

### Key Models

| Table | Purpose |
|-------|---------|
| `users` | Privy user ID → wallet address mapping |
| `holdings` | XAUT balance, avg buy price, total invested, P&L |
| `transactions` | Buy/sell records with status, amounts, tx hashes |
| `price_history` | Historical gold prices (every 5 min) |
| `gifts` | Gold gift records (send/claim/expire) |

## Environment Variables

```
EXPO_PUBLIC_API_URL            # Backend API base URL
EXPO_PUBLIC_PRIVY_APP_ID       # Privy app ID
EXPO_PUBLIC_PRIVY_CLIENT_ID    # Privy client ID
EXPO_PUBLIC_SUPABASE_URL       # Supabase URL
EXPO_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key
```

Backend (Next.js, separately deployed):
```
DATABASE_URL / REDIS_URL
PRIVY_APP_SECRET
ARBITRUM_RPC_URL
TREASURY_PRIVATE_KEY          # NEVER expose
TREASURY_WALLET_ADDRESS
COINGECKO_API_KEY
SUPABASE_SERVICE_ROLE_KEY
ONMETA_API_KEY / ONMETA_MERCHANT_ID / ONMETA_WEBHOOK_SECRET
```

## API Endpoints (Backend)

### Public
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices` | GET | Current gold price (USD, INR, per gram) |
| `/api/prices/history` | GET | 7-day price history |
| `/api/prices/tola` | GET | Gold price per tola |

### Protected (Bearer token)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sync` | POST | Sync Privy user to database |
| `/api/holdings` | GET | User's holdings with P&L |
| `/api/balance/usdt` | GET | USDT wallet balance |
| `/api/balance/xaut` | GET | XAUT wallet balance (+ grams) |
| `/api/swap/quote` | GET | USDT → XAUT quote |
| `/api/swap/record` | POST | Record completed buy swap |
| `/api/sell/quote` | GET | XAUT → USDT quote |
| `/api/sell/record` | POST | Record completed sell swap |
| `/api/transactions/history` | GET | Transaction history |
| `/api/upi/create-order` | POST | Create UPI payment order |
| `/api/upi/confirm` | POST | Confirm UPI payment |
| `/api/gift/send` | POST | Send gold gift |
| `/api/gift/claim` | POST | Claim a gift |
| `/api/gift/lookup` | GET | Lookup recipient |
| `/api/gift/sent` | GET | Sent gifts list |
| `/api/gift/received` | GET | Received gifts list |

## Transaction Flows

### Buy Flow (USDT Swap — `useSwap` hook)
`input` → `approve` → `swap` → `confirming` → `success` | `error`

### Buy Flow (UPI — `useUpiFlow` hook)
`amount` → `payment` → `processing` → `success` | `error`

### Sell Flow (`useSellSwap` hook)
`input` → `approve` → `swap` → `confirming` → `success` | `error`

### Gift Flow (`useGiftSend` hook)
`input` → `lookup` → `confirm` → `payment`/`approve` → `transfer` → `confirming` → `success`

## Authentication Pattern

### Client-Side (Expo App)

```typescript
import { useAuth } from '@/lib/auth-provider';

const { isReady, isAuthenticated, userId, walletAddress, email, logout } = useAuth();
```

```typescript
import { authFetchJson } from '@/lib/apiClient';

const { success, data, error } = await authFetchJson<HoldingData>('/api/holdings');
```

### Auth Guard

Located in `app/(tabs)/_layout.tsx`. Redirects to `/(auth)/login` if not authenticated.

## Build & Config Notes

### Babel (`babel.config.js`)
```javascript
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']
plugins: ['react-native-reanimated/plugin']  // MUST be last plugin
```

### Metro (`metro.config.js`)
- NativeWind integration via `withNativeWind(config, { input: './global.css' })`
- `unstable_conditionNames`: `['react-native', 'browser', 'require', 'import', 'default']`
- `'default'` is needed for packages like jose, @noble/hashes

### Tailwind (`tailwind.config.ts`)
- Preset: `nativewind/preset`
- Custom colors: `gold.*`, `surface.*`, `surface-dark.*`, `text.*`, `text-dark.*`, `success.*`, `error.*`, `warning.*`, `border.*`
- Font: `DMSans` (400, 500, 700)
- Dark mode: `class`

### TypeScript (`tsconfig.json`)
- Extends `expo/tsconfig.base`
- **Whitelist include** — only listed files/patterns are compiled. New `src/lib/` files MUST be added explicitly.

### Polyfills (`index.js`)
Crypto polyfills (getRandomValues, randomUUID, subtle.digest) MUST run before `expo-router/entry` — Privy, jose, and viem need them.

## Important Notes

- **Node 20 required** — Node 22+ breaks Expo type stripping
- **Tunnel mode required** — `npx expo start --tunnel --clear` (LAN mode hangs Expo Go)
- **Never expose TREASURY_PRIVATE_KEY** — only used by backend
- **No crypto jargon in UI** — users see "grams of gold", not "XAUT tokens"
- **Mobile-first design** — iOS-native feel
- **Use Indian locale** — amounts in INR, dates in IST
- **Price caching** — 60s TTL to reduce API calls
- **Swaps are client-side** — user signs via Privy embedded wallet
- **Tola unit** — 1 tola = 10 grams
- **Privy lazy-loading** — always `require('@privy-io/expo')`, never top-level import
- **`@noble/hashes/crypto.js`** exports warning is cosmetic — safe to ignore
- **`expo-crypto` is NOT a config plugin** — do NOT add to app.json plugins
- **Old web code** in `src/_app_web/` is reference-only (gitignored)

## Resources & References

- **Expo Documentation**: https://docs.expo.dev
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **NativeWind**: https://www.nativewind.dev
- **Moti**: https://moti.fyi
- **Privy Expo SDK**: https://docs.privy.io/guide/expo
- **Viem**: https://viem.sh
- **Arbitrum**: https://arbitrum.io
