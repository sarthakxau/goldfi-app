# Bullion App — Agent Documentation

> **gold.fi** — A mobile app for digital gold savings targeting Indian users. Users can buy and sell tokenized gold (XAUT0) on Arbitrum using INR/UPI. The app abstracts away all blockchain complexity and presents itself as a simple gold savings app.

---

## Project Overview

**Architecture**: Expo React Native (iOS) frontend + separately deployed Next.js API backend. The mobile app calls backend APIs via absolute URL.

**Target Platform**: iOS (primary), built with Expo SDK

**Key Domain Concepts**:
- **XAUT0**: Tether Gold token on Arbitrum (6 decimals, backed 1:1 by physical gold)
- **Tola**: Traditional Indian gold unit (1 tola = 10 grams)
- **UPI**: Unified Payments Interface for INR payments (India's instant payment system)
- **Swap**: USDT → XAUT (buy) or XAUT → USDT (sell) via Camelot V3 DEX

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Expo SDK | ~54.0.33 |
| React Native | react-native | 0.81.5 |
| React | react | 19.1.0 |
| Router | expo-router | ~6.0.23 (file-based) |
| Styling | NativeWind | v4 (Tailwind for RN) |
| Animation | Moti + Reanimated | v0.29 + v4.1.6 |
| State | Zustand | v5.0.3 |
| Forms | React Hook Form + Zod | v7.71.1 + v3.23.8 |
| Auth/Wallet | Privy Expo SDK | v0.63.4 |
| Blockchain | Viem | v2.22.8 |
| Database | Supabase (PostgreSQL) | via @supabase/supabase-js |
| Icons | Lucide React Native | v0.563.0 |
| Math | decimal.js | v10.4.3 |

---

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
│   │   ├── account/          # Settings, personal info, KYC
│   │   └── yield/            # Earn / yield strategies
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
│   ├── autopay/              # Auto-pay SIP (Systematic Investment Plan)
│   ├── redeem/               # Physical gold redemption
│   └── +not-found.tsx        # 404 screen
│
├── src/
│   ├── lib/                  # Core utilities
│   │   ├── auth-provider.tsx # AuthProvider + AuthGate (Privy wrapper)
│   │   ├── apiClient.ts      # authFetch() / authFetchJson() with Bearer token
│   │   ├── supabase.ts       # Supabase client (SecureStore adapter) + Db* types
│   │   ├── clientViem.ts     # Client-side Viem + ERC20/Router ABIs
│   │   ├── constants.ts      # Contract addresses, chain ID, limits
│   │   ├── utils.ts          # cn(), formatINR(), formatGrams(), etc.
│   │   ├── animations.ts     # Moti/Reanimated presets (FADE_UP, SCALE_IN, etc.)
│   │   ├── theme.tsx         # ThemeProvider (light/dark/system, AsyncStorage)
│   │   ├── form.ts           # React Hook Form + Zod re-exports, validation patterns
│   │   ├── polyfills.ts      # Crypto polyfills (used by index.js)
│   │   ├── giftData.ts       # Gift presets & occasions
│   │   ├── yieldData.ts      # Yield strategy mock data
│   │   └── mock/             # Mock data for development
│   ├── components/           # Reusable React Native components
│   │   ├── animations/       # Animation wrapper components
│   │   ├── Buy/              # Buy flow components (SwapModal, UPI flow)
│   │   ├── Gift/             # Gift flow components
│   │   ├── AutoPay/          # AutoPay components
│   │   └── [various].tsx     # HoldingCard, PriceDisplay, etc.
│   ├── hooks/                # Custom React hooks
│   │   ├── useSwap.ts        # Buy: USDT → XAUT swap
│   │   ├── useSellSwap.ts    # Sell: XAUT → USDT swap
│   │   ├── useUpiFlow.ts     # UPI payment flow
│   │   ├── useGiftSend.ts    # Gift sending flow
│   │   └── useAutoPay.ts     # AutoPay management
│   ├── services/             # Business logic (client-side)
│   ├── store/                # Zustand store
│   ├── types/                # TypeScript interfaces
│   └── _app_web/             # Legacy Next.js routes (reference only)
│
├── assets/                   # App icons, splash screen
├── supabase/                 # Supabase migrations/config (if any)
└── plans/                    # Planning documents
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (REQUIRED: Node 20 — Node 22+ breaks Expo type stripping)
nvm use 20
npx expo start --tunnel --clear

# Build verification
npx expo export --platform ios    # Verify production bundle
npx tsc --noEmit                  # TypeScript check

# EAS Build (requires eas-cli)
eas build --profile development --platform ios
eas build --profile preview --platform ios
eas build --profile production --platform ios

# Lint
pnpm lint
```

**Critical Notes**:
- If LAN mode hangs on "opening project..." screen, **use `--tunnel` mode** for Expo Go.
- **Node 20 required** — Node 22+ breaks Expo type stripping.
- Crypto polyfills in `index.js` MUST run before `expo-router/entry`.

---

## Build & Deployment Process

### Build Profiles (eas.json)

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | Development client | Internal (simulator) |
| `preview` | TestFlight testing | Internal |
| `production` | App Store release | Store |

### Deployment Flow

1. **Development**: Run locally with `npx expo start --tunnel --clear`
2. **Preview**: `eas build --profile preview --platform ios` → TestFlight
3. **Production**: `eas build --profile production --platform ios` → App Store

### Backend (Separately Deployed)

The Next.js API backend is deployed separately (Vercel). The mobile app calls it via `EXPO_PUBLIC_API_URL`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Backend API
EXPO_PUBLIC_API_URL=https://goldfi.vercel.app

# Authentication (Privy)
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id

# Database (Supabase)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Backend-only variables** (never expose to frontend):
```bash
DATABASE_URL=
REDIS_URL=
PRIVY_APP_SECRET=
ARBITRUM_RPC_URL=
TREASURY_PRIVATE_KEY=       # NEVER expose this
TREASURY_WALLET_ADDRESS=
COINGECKO_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ONMETA_API_KEY=
ONMETA_MERCHANT_ID=
ONMETA_WEBHOOK_SECRET=
```

---

## Coding Conventions

### TypeScript

- **Strict mode enabled**
- Path alias: `@/*` maps to `./src/*`
- All API responses use `ApiResponse<T>` wrapper type
- **Whitelist include in tsconfig** — new `src/lib/` files MUST be added to `tsconfig.json` `include` array

### Component Guidelines

- Use **React Native components** (`View`, `Text`, `Pressable`, `ScrollView`) — NOT `div`, `span`, `button`
- PascalCase for component names
- Use `cn()` helper from `utils.ts` for NativeWind class merging
- Use `className` prop (NativeWind) instead of `StyleSheet.create()`

### Privy SDK Pattern

```typescript
// CORRECT: Lazy-load via require()
const { usePrivy, useEmbeddedEthereumWallet } = require('@privy-io/expo');

// WRONG: Top-level import crashes in dev bypass mode
import { usePrivy } from '@privy-io/expo';
```

- User email: extract from `user.linked_accounts` (type 'email'), NOT `user.email`
- Token getter: `setAccessTokenGetter(getAccessToken)` wired in AuthGate
- Auth guard lives in `app/(tabs)/_layout.tsx`

### Financial Calculations

- **Always use `decimal.js`** for money/token amounts
- Never use JavaScript floats for financial math
- XAUT has 6 decimals, USDT has 6 decimals

### Formatting Functions (from `src/lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `formatINR(amount)` | Currency formatting for Indian rupees |
| `formatGrams(grams)` | Gold amount display |
| `formatPercent(value)` | Percentage display with +/– sign |
| `truncateAddress(addr)` | Wallet address display (0x1234...5678) |
| `formatDate(date)` | Indian locale date formatting |
| `calculatePnlPercent()` | P&L calculation with Decimal |
| `cn(...inputs)` | Tailwind class merging |

---

## Animation System

Uses **Moti** (built on Reanimated 3) for animations. All presets are in `src/lib/animations.ts`.

### Import Pattern

```typescript
import { MotiView } from 'moti';
import { FADE_UP, SCALE_IN, DURATION, STAGGER } from '@/lib/animations';

// Spread preset directly on MotiView:
<MotiView {...FADE_UP}>...</MotiView>
```

### Animation Presets

| Preset | Use Case | Properties |
|--------|----------|------------|
| `FADE_UP` | Standard entrance | `opacity: 0→1, translateY: 12→0` |
| `FADE_IN` | No movement fade | `opacity: 0→1` |
| `SCALE_IN` | Badges, icons, success | `opacity: 0→1, scale: 0.85→1` |
| `PAGE_TRANSITION` | Page containers | `opacity: 0→1, translateY: 8→0` |
| `MODAL_SCALE` | Centered modals | `scale: 0.95→1` with exit |
| `BACKDROP_FADE` | Modal backdrops | `opacity: 0→1` with exit |

### Design Philosophy

- **Refined & subtle** — 200–400ms duration, smooth deceleration
- **No jarring movement** — Maximum 12–16px travel distance
- **Staggered reveals** — 40–80ms between sequential items
- **Financial app appropriate** — Professional, not playful

### Mandatory Patterns for New Screens

1. **Pages** — Wrap in `<MotiView {...PAGE_TRANSITION}>` or `<PageTransition>`
2. **Lists** — Use `staggerDelay(index)` with `FADE_UP`
3. **Modals** — Use `MODAL_SCALE` + `BACKDROP_FADE`
4. **Financial values** — Use `<AnimatedNumber>` for prices/balances
5. **All new components MUST include entrance animations**

---

## Form Management

Uses **React Hook Form** + **Zod** via `src/lib/form.ts`.

```typescript
import { z, useForm, zodResolver, type FormData } from '@/lib/form';
```

### Validation Patterns (Indian KYC)

```typescript
validationPatterns.email       // Email
validationPatterns.phone       // Indian 10-digit mobile (starts with 6-9)
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

---

## Smart Contract Addresses

**Arbitrum Mainnet (Chain ID: 42161)**

```typescript
XAUT0: '0x40461291347e1eCbb09499F3371D3f17f10d7159'  // Tether Gold
USDT:  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'  // Tether USD
CAMELOT_V3_ROUTER: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18'
CAMELOT_V3_QUOTER: '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E'
```

### Constants (from `src/lib/constants.ts`)

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

---

## Database (Supabase)

Uses Supabase directly (no ORM). Client uses `expo-secure-store` for token storage.

- DB types: `Db*` interfaces in `src/lib/supabase.ts` (snake_case columns)
- Frontend types: camelCase in `src/types/index.ts`

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | Privy user ID → wallet address mapping |
| `holdings` | XAUT balance, avg buy price, total invested, P&L |
| `transactions` | Buy/sell records with status, amounts, tx hashes |
| `price_history` | Historical gold prices (every 5 min) |
| `gifts` | Gold gift records (send/claim/expire) |
| `autopay` | SIP/recurring investment plans |

---

## API Endpoints (Backend)

### Public Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices` | GET | Current gold price (USD, INR, per gram) |
| `/api/prices/history` | GET | 7-day price history |
| `/api/prices/tola` | GET | Gold price per tola |

### Protected Endpoints (Bearer token required)

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

---

## Transaction Flows

### Buy Flow (USDT Swap — `useSwap` hook)

```
input → approve → swap → confirming → success | error
```

1. User enters USDT amount
2. Fetch quote from `/api/swap/quote`
3. Approve USDT spending (if needed)
4. Execute swap via Camelot V3 Router
5. Wait for confirmation
6. Record transaction via `/api/swap/record`

### Buy Flow (UPI — `useUpiFlow` hook)

```
amount → payment → processing → success | error
```

1. User enters INR amount
2. Create order via `/api/upi/create-order`
3. Open UPI payment URL
4. Webhook confirms payment
5. Backend credits XAUT to user's wallet

### Sell Flow (`useSellSwap` hook)

```
input → approve → swap → confirming → success | error
```

1. User enters grams to sell
2. Fetch quote from `/api/sell/quote`
3. Approve XAUT spending
4. Execute swap via Camelot V3 Router
5. Wait for confirmation
6. Record transaction

### Gift Flow (`useGiftSend` hook)

```
input → lookup → confirm → payment/approve → transfer → confirming → success
```

1. User enters recipient email and amount
2. Lookup recipient via `/api/gift/lookup`
3. Confirm gift details
4. Pay via UPI or wallet (USDT swap)
5. Transfer XAUT to escrow
6. Send email to recipient with claim token

---

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

### Dev Bypass

Set `DEV_BYPASS_AUTH = true` in `src/lib/auth-provider.tsx` to skip Privy entirely during development.

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Login flow (email OTP)
- [ ] Home screen: price display, holdings, P&L
- [ ] Buy flow: USDT swap + UPI
- [ ] Sell flow: XAUT → USDT
- [ ] Gift flow: send + claim
- [ ] Transaction history
- [ ] Dark/light theme toggle
- [ ] Pull-to-refresh on all screens

### Build Verification

```bash
# TypeScript check
npx tsc --noEmit

# Production bundle verification
npx expo export --platform ios

# Lint
pnpm lint
```

---

## Security Considerations

### Critical Security Rules

1. **Never expose `TREASURY_PRIVATE_KEY`** — only used by backend
2. **Never log private keys, mnemonics, or raw transaction data**
3. **All API calls use Bearer token authentication** via Privy
4. **SecureStore** used for Supabase auth tokens (encrypted on device)
5. **Face ID/Touch ID** can be enabled for app access (configured in `app.json`)

### Blockchain Security

- All swaps require user signature via Privy embedded wallet
- Slippage tolerance: 0.5%
- Transaction deadline: 5 minutes
- Approval amounts: 2x the swap amount (to minimize approval transactions)

---

## Important Implementation Notes

### Crypto Polyfills (`index.js`)

Crypto polyfills (getRandomValues, randomUUID, subtle.digest) MUST run before `expo-router/entry` — Privy, jose, and viem need them.

### Metro Configuration

```javascript
// metro.config.js
config.resolver.unstable_conditionNames = [
  'react-native', 'browser', 'require', 'import', 'default'
];
```

The `'default'` condition is needed for packages like `jose`, `@noble/hashes`.

### Babel Configuration

```javascript
// babel.config.js
plugins: ['react-native-reanimated/plugin']  // MUST be last plugin
```

### Tailwind + NativeWind

- Uses `nativewind/preset` in `tailwind.config.ts`
- Custom gold palette: `gold.50` through `gold.900`
- Dark mode: `class` strategy with `dark:` prefixes

### Known Issues / Warnings

- `@noble/hashes/crypto.js` exports warning is cosmetic — safe to ignore
- `expo-crypto` is NOT a config plugin — do NOT add to `app.json` plugins
- Old web code in `src/_app_web/` is reference-only

---

## Common Tasks for Agents

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/new-feature.tsx`)
2. Add route to `app/_layout.tsx` Stack
3. Wrap content in `<MotiView {...PAGE_TRANSITION}>`
4. Use `useAuth()` if authentication required
5. Use `authFetchJson()` for API calls

### Adding a New Component

1. Create file in `src/components/` (or appropriate subdirectory)
2. Use React Native components (`View`, `Text`, etc.)
3. Use `cn()` for className merging
4. Add entrance animation with Moti
5. Export from `index.ts` if in subdirectory

### Adding a New Hook

1. Create file in `src/hooks/`
2. Follow existing patterns (useSwap, useGiftSend)
3. Use `useAuth()` for wallet access
4. Use `authFetchJson()` for API calls
5. Return clear state machine (step, error, loading, etc.)

### Adding a New API Endpoint

1. Add to backend (separate Next.js deployment)
2. Use `authFetch()` or `authFetchJson()` in frontend
3. Add response type to `src/types/index.ts`

---

## Resources & References

- **Expo Documentation**: https://docs.expo.dev
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **NativeWind**: https://www.nativewind.dev
- **Moti**: https://moti.fyi
- **Privy Expo SDK**: https://docs.privy.io/guide/expo
- **Viem**: https://viem.sh
- **Arbitrum**: https://arbitrum.io
