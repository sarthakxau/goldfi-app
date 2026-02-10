═══════════════════════════════════════════════════════════════
IMPLEMENTATION PLAN: Next.js PWA → Expo React Native (iOS)
═══════════════════════════════════════════════════════════════

## 1. Requirements Analysis

**Goal:** Migrate the Bullion gold savings PWA (Next.js 14) to a native iOS app
using Expo (React Native), preserving all functionality: auth, blockchain swaps,
gifting, price tracking, charts, UPI payments, and animations.

**Acceptance Criteria:**
- [ ] Expo project boots on iOS simulator and physical device
- [ ] All screens replicated with native UI (no WebView hacks)
- [ ] Privy auth works (login, embedded wallet, tx signing)
- [ ] Buy/sell swap flows functional end-to-end
- [ ] Gift send/claim flows functional
- [ ] UPI payment flow functional
- [ ] Gold price charts render natively
- [ ] Animations feel premium (Reanimated 3)
- [ ] Theme (light/dark) works with native system setting
- [ ] Deep linking for gift claim tokens
- [ ] Push notifications replace email-only notifications
- [ ] App builds and submits to TestFlight

═══════════════════════════════════════════════════════════════

## 2. Migration Strategy: Incremental, Not Big-Bang

We'll keep the existing `src/` intact on `main` and build the Expo app
on the `expo-migration` branch. The migration follows this order:

1. **Scaffold** — Expo project setup, navigation, theme
2. **Shared logic** — Copy over types, utils, constants, Zustand store
3. **Backend stays** — API routes remain as a separate Next.js deployment
4. **Screens** — Rebuild each page as a native screen
5. **Hooks** — Adapt useSwap, useSellSwap, useGiftSend for RN
6. **Polish** — Animations, haptics, deep links, push notifications

───────────────────────────────────────────────────────────────

## 3. Architecture Decisions

### 3a. What STAYS the same
| Layer            | Library              | Notes                          |
|------------------|----------------------|--------------------------------|
| Types            | TypeScript           | Copy `src/types/index.ts` as-is |
| State            | Zustand 5            | Works in RN unchanged          |
| Forms            | React Hook Form + Zod| Works in RN, swap UI inputs    |
| Financial math   | decimal.js           | Works in RN unchanged          |
| API client       | fetch + authFetch    | Works in RN unchanged          |
| DB client        | @supabase/supabase-js| Works in RN (use AsyncStorage) |
| Constants        | constants.ts         | Copy as-is                     |
| Utils            | utils.ts             | Copy as-is (no DOM deps)       |

### 3b. What CHANGES
| Web Layer              | → Native Replacement                    |
|------------------------|-----------------------------------------|
| Next.js App Router     | Expo Router (file-based, same mental model) |
| Tailwind CSS           | NativeWind v4 (Tailwind for RN)         |
| motion/react (Framer)  | react-native-reanimated 3 + Moti        |
| Recharts               | Victory Native (or react-native-wagmi-charts) |
| lucide-react           | lucide-react-native                     |
| react-dom              | react-native                            |
| next-pwa               | Native app (no PWA needed)              |
| HTML `<img>`           | `<Image>` from expo-image               |
| Privy react-auth       | @privy-io/expo                          |
| viem (client-side)     | viem works in RN (with polyfills)       |
| CSS variables / theme  | Zustand/Context + RN StyleSheet         |
| QR code (qrcode.react) | react-native-qrcode-svg                 |
| Resend (email)         | Keep server-side, add expo-notifications|

### 3c. Backend Strategy
The API routes (`src/app/api/`) will remain deployed as a Next.js app
(or migrate to standalone Express/Hono later). The mobile app calls the
same endpoints via `authFetch`. This means:
- No API code needs rewriting now
- Services (dexService, priceOracle, giftService) stay server-side
- Only client code migrates to React Native

═══════════════════════════════════════════════════════════════

## 4. Step-by-Step Implementation

═══════════════════════════════════════════════════════════════

### PHASE 1: Project Scaffold & Foundation
**Estimated scope: ~15 files**

───────────────────────────────────────────────────────────────

#### Step 1.1: Initialize Expo Project

**Actions:**
- Remove Next.js config files from expo-migration branch (keep src/ for
  reference during migration)
- Run `npx create-expo-app@latest . --template tabs` or manually set up
  Expo SDK 52+ with Expo Router
- Configure `app.json` / `app.config.ts`:
  ```
  name: "gold.fi"
  slug: "goldfi"
  scheme: "goldfi" (for deep links)
  ios.bundleIdentifier: "com.goldfi.app"
  ios.supportsTablet: false
  orientation: "portrait"
  icon: existing PWA icon
  splash: gold-themed splash screen
  ```
- Install core deps:
  ```
  expo-router, expo-linking, expo-status-bar, expo-image,
  expo-secure-store, expo-haptics, expo-constants,
  react-native-safe-area-context, react-native-screens,
  react-native-gesture-handler
  ```

**Files to create:**
| File | Purpose |
|------|---------|
| `app.json` | Expo config |
| `babel.config.js` | Babel + NativeWind + Reanimated plugins |
| `metro.config.js` | Metro bundler config |
| `tsconfig.json` | Updated path aliases |
| `index.ts` | Expo entry point |

───────────────────────────────────────────────────────────────

#### Step 1.2: NativeWind (Tailwind for RN) Setup

**Actions:**
- Install `nativewind@4` + `tailwindcss@3.4`
- Create `tailwind.config.ts` targeting RN content paths
- Create `global.css` with Tailwind directives
- Configure Metro + Babel for NativeWind
- Port custom theme colors from CSS variables to tailwind.config.ts:
  ```ts
  colors: {
    gold: { primary: '#B8860B', light: '#D4A012', dark: '#8B6914' },
    surface: { card: '#FFFFFF', elevated: '#F0F0F0' },
    // ... dark mode variants via nativewind dark: prefix
  }
  ```

**Why NativeWind:** It preserves ~80% of existing Tailwind class names, so
component markup translates almost 1:1. Much faster migration than
StyleSheet.create() for 60+ components.

───────────────────────────────────────────────────────────────

#### Step 1.3: Navigation Structure (Expo Router)

**Actions:**
- Create file-based routing structure mirroring Next.js:

```
app/
├── _layout.tsx            # Root layout (providers, fonts)
├── (auth)/
│   ├── _layout.tsx        # Auth layout (no bottom nav)
│   └── login.tsx          # Login screen
├── (tabs)/
│   ├── _layout.tsx        # Tab navigator (Home, Buy, Gift, Account)
│   ├── index.tsx          # Dashboard/Home
│   ├── buy/
│   │   ├── index.tsx      # Buy screen
│   │   └── upi.tsx        # UPI payment flow
│   ├── sell.tsx           # Sell screen
│   ├── gift/
│   │   ├── index.tsx      # Gift hub
│   │   ├── send.tsx       # Send gift
│   │   └── claim/[token].tsx  # Claim gift (deep link)
│   ├── transactions.tsx   # Transaction history
│   ├── account/
│   │   ├── index.tsx      # Account settings
│   │   ├── personal.tsx   # Profile info
│   │   └── kyc.tsx        # KYC form
│   ├── card.tsx           # Gold card
│   ├── gold-charts.tsx    # Charts screen
│   ├── autopay/
│   │   ├── index.tsx      # AutoPay hub
│   │   ├── new.tsx        # Create plan
│   │   └── [id].tsx       # Plan details
│   ├── yield/
│   │   ├── index.tsx
│   │   └── strategies/
│   │       ├── index.tsx
│   │       └── [id].tsx
│   └── redeem/
│       ├── index.tsx
│       └── jewellers.tsx
└── +not-found.tsx         # 404 screen
```

**Tab bar:** 4 tabs — Home, Buy, Gift, Account (matching current bottom nav)

───────────────────────────────────────────────────────────────

#### Step 1.4: Theme System

**Actions:**
- Create `src/lib/theme.ts` using `useColorScheme()` from RN
- Map CSS variables to a theme object:
  ```ts
  const themes = {
    light: { background: '#F5F5F5', card: '#FFFFFF', gold: '#B8860B', ... },
    dark:  { background: '#0F0F0F', card: '#1A1A1A', gold: '#D4A012', ... },
  }
  ```
- NativeWind handles `dark:` prefix classes automatically
- Create `ThemeProvider` context if needed beyond NativeWind

───────────────────────────────────────────────────────────────

#### Step 1.5: Font Loading

**Actions:**
- Install `expo-font` + `@expo-google-fonts/dm-sans`
- Load in root `_layout.tsx` with `useFonts()`
- Show splash screen until fonts loaded

═══════════════════════════════════════════════════════════════

### PHASE 2: Shared Logic Migration
**Estimated scope: ~10 files (mostly copy + minor edits)**

───────────────────────────────────────────────────────────────

#### Step 2.1: Copy Shared Modules (Zero Changes)

These files work in RN with zero changes:

| Source File | Changes Needed |
|-------------|----------------|
| `src/types/index.ts` | None — pure TS interfaces |
| `src/lib/constants.ts` | None — pure TS values |
| `src/lib/utils.ts` | None — no DOM APIs used |
| `src/lib/form.ts` | None — RHF + Zod work in RN |
| `src/store/index.ts` | None — Zustand works in RN |

───────────────────────────────────────────────────────────────

#### Step 2.2: Adapt API Client

**File:** `src/lib/apiClient.ts`

**Changes:**
- Replace `getAccessToken()` from `@privy-io/react-auth`
  with `@privy-io/expo` equivalent
- Base URL: add `EXPO_PUBLIC_API_URL` env var pointing to
  the deployed Next.js backend
- `fetch` works natively in RN (no polyfill needed)

```ts
// Before (web)
const BASE_URL = ''; // relative URLs

// After (native)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL; // https://goldfi.vercel.app
```

───────────────────────────────────────────────────────────────

#### Step 2.3: Adapt Supabase Client

**File:** `src/lib/supabase.ts`

**Changes:**
- Replace localStorage with `expo-secure-store` for auth persistence:
  ```ts
  import * as SecureStore from 'expo-secure-store';
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(url, key, {
    auth: {
      storage: {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      },
    },
  });
  ```

───────────────────────────────────────────────────────────────

#### Step 2.4: Adapt Viem Client (Client-Side)

**File:** `src/lib/clientViem.ts`

**Changes:**
- Install RN polyfills for viem: `react-native-get-random-values`,
  `@ethersproject/shims`, or viem's recommended RN setup
- viem v2 works in RN with proper polyfills
- Import polyfills at app entry point (`index.ts`):
  ```ts
  import 'react-native-get-random-values';
  import '@ethersproject/shims';
  ```

═══════════════════════════════════════════════════════════════

### PHASE 3: Authentication
**Estimated scope: ~5 files**

───────────────────────────────────────────────────────────────

#### Step 3.1: Privy Expo SDK Setup

**Actions:**
- Install `@privy-io/expo` (Privy's React Native SDK)
- Replace `PrivyProvider` from `@privy-io/react-auth` with
  `PrivyProvider` from `@privy-io/expo` in root layout
- Configure login methods: email (matching current web config)
- Privy Expo SDK handles embedded wallets natively

**Files:**
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | PrivyProvider wrapping entire app |
| `app/(auth)/login.tsx` | Login screen using Privy Expo hooks |

**Key API differences (web → native):**
```ts
// Web
import { usePrivy } from '@privy-io/react-auth';
const { login, authenticated, user, getAccessToken } = usePrivy();

// Expo
import { usePrivy, useLoginWithEmail } from '@privy-io/expo';
const { isReady, user } = usePrivy();
const { loginWithCode, sendCode } = useLoginWithEmail();
```

───────────────────────────────────────────────────────────────

#### Step 3.2: Embedded Wallet Adaptation

**Actions:**
- Privy Expo SDK provides `useEmbeddedWallet()` hook
- Wallet signing works differently — no browser popup, native modal
- Update `useSwap.ts` and `useSellSwap.ts` to use Expo wallet provider
- The `getEthereumProvider()` pattern needs to be replaced with
  Privy Expo's provider mechanism

```ts
// Web
const provider = await embeddedWallet.getEthereumProvider();
const walletClient = createWalletClient({ transport: custom(provider) });

// Expo — Privy provides a viem-compatible provider
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
const { provider } = useEmbeddedEthereumWallet();
```

═══════════════════════════════════════════════════════════════

### PHASE 4: Screen-by-Screen Migration
**Estimated scope: ~30 screen files + ~40 component files**

The order below prioritizes core user journeys first.

───────────────────────────────────────────────────────────────

#### Step 4.1: Login Screen

**Web:** `src/app/(auth)/login/page.tsx`
**Native:** `app/(auth)/login.tsx`

**Changes:**
- Replace HTML elements with RN: `<View>`, `<Text>`, `<Pressable>`,
  `<Image>` from expo-image
- Replace Framer Motion carousel with Reanimated carousel
  (or `react-native-reanimated-carousel`)
- Privy login button → `sendCode()` + OTP input flow
- NativeWind classes stay largely the same

───────────────────────────────────────────────────────────────

#### Step 4.2: Dashboard (Home) Screen

**Web:** `src/app/(dashboard)/page.tsx`
**Native:** `app/(tabs)/index.tsx`

**Components to migrate:**
| Web Component | Native Equivalent |
|---------------|-------------------|
| `HoldingCard.tsx` | Same logic, RN Views + NativeWind |
| `PriceDisplay.tsx` | Same logic, RN Text |
| `TolaPrice.tsx` | Same logic |
| `TolaCard.tsx` | Remove CSS 3D tilt → Reanimated gesture tilt |
| `GoldChart.tsx` | Recharts → Victory Native or wagmi-charts |
| `TransactionList.tsx` | FlatList instead of div map |

**Key changes:**
- `<div>` → `<View>`, `<span>/<p>` → `<Text>`, `<a>` → `<Link>`
- `onClick` → `onPress`
- ScrollView or FlatList for scrollable content
- Pull-to-refresh via `RefreshControl`

───────────────────────────────────────────────────────────────

#### Step 4.3: Buy Screen + Swap Flow

**Web:** `src/app/(dashboard)/buy/page.tsx` + `src/components/Buy/*`
**Native:** `app/(tabs)/buy/index.tsx` + `src/components/Buy/*`

**Components to migrate:**
| Component | Notes |
|-----------|-------|
| `SwapModal.tsx` | → Full-screen or bottom sheet (react-native-bottom-sheet) |
| `SwapProgress.tsx` | Step indicator with Reanimated |
| `SwapQuote.tsx` | Text display, straightforward |
| `BalanceDisplay.tsx` | Straightforward |
| `DepositModal.tsx` | Bottom sheet with QR (react-native-qrcode-svg) |
| `HistoryModal.tsx` | FlatList in bottom sheet |

**Hook:** `useSwap.ts` — adapt wallet provider (Step 3.2), rest stays.

───────────────────────────────────────────────────────────────

#### Step 4.4: UPI Buy Flow

**Web:** `src/components/Buy/UpiPaymentFlow.tsx` + `useUpiFlow.ts`
**Native:** `app/(tabs)/buy/upi.tsx`

**Changes:**
- Onmeta integration: may need WebView for payment page, or
  replace with native UPI intent (`expo-linking` to UPI apps)
- Timer/countdown logic stays the same
- Amount input with INR formatting

───────────────────────────────────────────────────────────────

#### Step 4.5: Sell Screen

**Web:** `src/app/(dashboard)/sell/page.tsx`
**Native:** `app/(tabs)/sell.tsx`

**Hook:** `useSellSwap.ts` — same adaptation as useSwap.

───────────────────────────────────────────────────────────────

#### Step 4.6: Gift Flow

**Web:** `src/app/(dashboard)/gift/*` + `src/components/Gift/*`
**Native:** `app/(tabs)/gift/*`

**Components to migrate:**
| Component | Notes |
|-----------|-------|
| `RecipientLookup.tsx` | TextInput + search |
| `UserNotFoundDialog.tsx` | Modal/Alert |
| `PaymentStep.tsx` | Amount input + balance |
| `GiftConfirmation.tsx` | Summary view |
| `GiftSentList.tsx` | FlatList |
| `GiftReceivedList.tsx` | FlatList |

**Hook:** `useGiftSend.ts` — adapt wallet provider, rest stays.

**Deep link:** `goldfi://gift/claim/[token]` for gift claims.

───────────────────────────────────────────────────────────────

#### Step 4.7: Transaction History

**Web:** `src/app/(dashboard)/transactions/page.tsx`
**Native:** `app/(tabs)/transactions.tsx`

**Changes:**
- Use `FlatList` with `renderItem` for performance
- Pull-to-refresh
- Same data fetching via `authFetchJson`

───────────────────────────────────────────────────────────────

#### Step 4.8: Account & KYC Screens

**Web:** `src/app/(dashboard)/account/*`
**Native:** `app/(tabs)/account/*`

**Changes:**
- Profile form → RN TextInputs with React Hook Form
- KYC form → Camera for document capture (`expo-camera`)
- Settings → RN Switch components for toggles

───────────────────────────────────────────────────────────────

#### Step 4.9: Gold Charts

**Web:** `src/app/(dashboard)/gold-charts/page.tsx` (TradingView widget)
**Native:** `app/(tabs)/gold-charts.tsx`

**Options:**
1. **WebView** — Embed TradingView widget in a WebView (quickest)
2. **Victory Native** — Native chart with price history data
3. **react-native-wagmi-charts** — Candle/line charts for financial data

Recommendation: Use WebView for TradingView initially, add native
chart for the 7-day overview on dashboard.

───────────────────────────────────────────────────────────────

#### Step 4.10: AutoPay, Yield, Redeem, Card Screens

These are less critical and can be migrated last. They follow
the same patterns as above:
- AutoPay: forms + FlatList
- Yield: read-only display
- Redeem: display + partner list
- Card: visual card component

═══════════════════════════════════════════════════════════════

### PHASE 5: Animation System Migration
**Estimated scope: ~10 files**

───────────────────────────────────────────────────────────────

#### Step 5.1: Install Animation Libraries

```
react-native-reanimated (v3)
moti (declarative animations for RN, built on Reanimated)
react-native-gesture-handler
```

**Why Moti:** It provides a `<MotiView>` API similar to Framer Motion's
`<motion.div>`, making the migration much more direct.

───────────────────────────────────────────────────────────────

#### Step 5.2: Animation Constants Migration

**Web:** `src/lib/animations.ts`
**Native:** `src/lib/animations.ts` (rewritten)

| Web (Framer) | Native (Reanimated/Moti) |
|--------------|--------------------------|
| `EASE_OUT_EXPO` cubic-bezier | `Easing.out(Easing.exp)` |
| `DURATION.normal = 0.3` | Same (300ms) |
| `SPRING.gentle` | `withSpring({ damping: 30, stiffness: 300 })` |
| `motion.div` variants | `MotiView` from/animate/transition |
| `AnimatePresence` | `AnimatePresence` from moti |
| `layoutId` | `LayoutAnimation` or shared element transitions |

───────────────────────────────────────────────────────────────

#### Step 5.3: Animation Components Migration

| Web Component | Native Replacement |
|---------------|-------------------|
| `FadeUp` | `MotiView` with translateY + opacity |
| `StaggerContainer` | Moti's stagger or manual delay |
| `PageTransition` | Screen transition config in Expo Router |
| `AnimatedNumber` | Reanimated `useAnimatedStyle` + `withTiming` |

Example FadeUp migration:
```tsx
// Web
<FadeUp delay={0.1} distance={12}>
  <Card />
</FadeUp>

// Native (Moti)
<MotiView
  from={{ opacity: 0, translateY: 12 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'timing', duration: 300, delay: 100 }}
>
  <Card />
</MotiView>
```

───────────────────────────────────────────────────────────────

#### Step 5.4: Haptic Feedback

**New for native:**
- Add `expo-haptics` for button presses, swap confirmations,
  success states
- Replace `whileTap={{ scale: 0.97 }}` with:
  ```ts
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  ```

═══════════════════════════════════════════════════════════════

### PHASE 6: Native-Only Features
**Estimated scope: ~8 files**

───────────────────────────────────────────────────────────────

#### Step 6.1: Push Notifications

- Install `expo-notifications`
- Register for push tokens on login
- Store push token in users table (new column)
- Server sends push notifications for:
  - Gift received
  - Transaction completed
  - Price alerts
  - AutoPay execution

───────────────────────────────────────────────────────────────

#### Step 6.2: Deep Linking

- Configure `app.json` scheme: `goldfi`
- Universal links: `https://goldfi.app/gift/claim/[token]`
- Handle in Expo Router via `app/(tabs)/gift/claim/[token].tsx`
- Add Associated Domains for iOS

───────────────────────────────────────────────────────────────

#### Step 6.3: Biometric Auth

- Install `expo-local-authentication`
- Add Face ID / Touch ID for app unlock
- Optional: require biometric for transactions > threshold

───────────────────────────────────────────────────────────────

#### Step 6.4: Secure Storage

- `expo-secure-store` for:
  - Auth tokens
  - Wallet keys (if any client-side caching)
  - User preferences
- Replace `localStorage` usage throughout

───────────────────────────────────────────────────────────────

#### Step 6.5: Offline Support

- Cache last-known prices in AsyncStorage
- Show stale data with "Last updated X ago" indicator
- Queue transactions for retry when back online
- Use `@react-native-community/netinfo` for connectivity detection

═══════════════════════════════════════════════════════════════

### PHASE 7: Testing & Deployment
**Estimated scope: ~5 config files**

───────────────────────────────────────────────────────────────

#### Step 7.1: Development Testing

- iOS Simulator testing via `npx expo run:ios`
- Physical device via Expo Go (limited) or dev build
- Test all swap flows on Arbitrum testnet first

───────────────────────────────────────────────────────────────

#### Step 7.2: EAS Build Setup

- Install `eas-cli`
- Configure `eas.json`:
  ```json
  {
    "build": {
      "development": { "distribution": "internal" },
      "preview": { "distribution": "internal" },
      "production": { "distribution": "store" }
    }
  }
  ```
- Set up environment variables in EAS secrets

───────────────────────────────────────────────────────────────

#### Step 7.3: App Store Preparation

- App Store Connect account setup
- Privacy policy & terms of service URLs
- App Store screenshots (6.7", 6.1", iPad if needed)
- App review notes (explain gold trading, crypto aspects)
- Crypto compliance: may need to declare encryption usage

═══════════════════════════════════════════════════════════════

## 5. Dependency Mapping

### Remove (Web-only)
```
next, next-pwa, react-dom, eslint-config-next,
postcss, autoprefixer, motion (replaced by reanimated),
recharts (replaced by victory-native), qrcode.react,
lucide-react (replaced by lucide-react-native)
```

### Keep (Works in RN)
```
zustand, react-hook-form, @hookform/resolvers, zod,
decimal.js, @supabase/supabase-js, viem, jose, clsx,
tailwind-merge
```

### Add (Native)
```
expo, expo-router, expo-linking, expo-status-bar,
expo-image, expo-font, expo-secure-store, expo-haptics,
expo-notifications, expo-local-authentication, expo-camera,
expo-constants, expo-splash-screen,
react-native, react-native-screens, react-native-safe-area-context,
react-native-gesture-handler, react-native-reanimated,
react-native-svg, react-native-qrcode-svg,
nativewind, moti,
@privy-io/expo,
victory-native (or react-native-wagmi-charts),
lucide-react-native,
@react-native-async-storage/async-storage,
@react-native-community/netinfo,
react-native-bottom-sheet,
react-native-webview (for TradingView),
react-native-get-random-values (viem polyfill)
```

═══════════════════════════════════════════════════════════════

## 6. File-by-File Migration Reference

### Files to CREATE (new native structure)
| File | Purpose |
|------|---------|
| `app.json` | Expo app config |
| `app/_layout.tsx` | Root layout (providers, fonts, splash) |
| `app/(auth)/_layout.tsx` | Auth layout |
| `app/(auth)/login.tsx` | Login screen |
| `app/(tabs)/_layout.tsx` | Tab navigator |
| `app/(tabs)/index.tsx` | Dashboard |
| `app/(tabs)/buy/index.tsx` | Buy screen |
| `app/(tabs)/buy/upi.tsx` | UPI flow |
| `app/(tabs)/sell.tsx` | Sell screen |
| `app/(tabs)/gift/index.tsx` | Gift hub |
| `app/(tabs)/gift/send.tsx` | Send gift |
| `app/(tabs)/gift/claim/[token].tsx` | Claim gift |
| `app/(tabs)/transactions.tsx` | History |
| `app/(tabs)/account/index.tsx` | Account |
| `app/(tabs)/account/personal.tsx` | Profile |
| `app/(tabs)/account/kyc.tsx` | KYC form |
| `app/(tabs)/card.tsx` | Gold card |
| `app/(tabs)/gold-charts.tsx` | Charts |
| `app/(tabs)/autopay/index.tsx` | AutoPay |
| `app/(tabs)/autopay/new.tsx` | New plan |
| `app/(tabs)/autopay/[id].tsx` | Plan detail |
| `app/(tabs)/yield/index.tsx` | Yield |
| `app/(tabs)/redeem/index.tsx` | Redeem |
| `babel.config.js` | Babel config |
| `metro.config.js` | Metro bundler |
| `eas.json` | EAS Build config |
| `global.css` | NativeWind globals |
| `nativewind-env.d.ts` | NativeWind types |

### Files to COPY (minimal or zero changes)
| File | Changes |
|------|---------|
| `src/types/index.ts` | None |
| `src/lib/constants.ts` | None |
| `src/lib/utils.ts` | None |
| `src/lib/form.ts` | None |
| `src/store/index.ts` | None |

### Files to REWRITE (significant changes)
| File | Reason |
|------|--------|
| `src/lib/apiClient.ts` | Base URL + Privy Expo token |
| `src/lib/supabase.ts` | SecureStore adapter |
| `src/lib/clientViem.ts` | RN polyfills |
| `src/lib/theme.ts` | RN useColorScheme |
| `src/lib/animations.ts` | Reanimated/Moti constants |
| `src/hooks/useSwap.ts` | Privy Expo wallet provider |
| `src/hooks/useSellSwap.ts` | Privy Expo wallet provider |
| `src/hooks/useGiftSend.ts` | Privy Expo wallet provider |
| `src/hooks/useUpiFlow.ts` | Native payment intent |
| All components in `src/components/` | HTML → RN elements |

═══════════════════════════════════════════════════════════════

## 7. Component Migration Cheat Sheet

Quick reference for converting web patterns to RN:

### HTML → React Native
```
<div>          → <View>
<span>/<p>     → <Text>
<img>          → <Image> (expo-image)
<input>        → <TextInput>
<button>       → <Pressable> or <TouchableOpacity>
<a href>       → <Link> (expo-router) or Linking.openURL()
<ul>/<li>      → <FlatList> or <View>
<select>       → Custom picker or react-native-picker
<textarea>     → <TextInput multiline>
<form>         → <View> (RHF handles state, no form element needed)
```

### Events
```
onClick        → onPress
onChange       → onChangeText (TextInput)
onSubmit       → handleSubmit() from RHF
onScroll       → onScroll (ScrollView/FlatList)
onBlur/onFocus → onBlur/onFocus (TextInput)
```

### Layout
```
display: flex  → Default in RN (all Views are flex)
flex-direction → Default is column in RN (not row like web)
gap            → gap (RN 0.71+) or marginBottom on children
position: fixed → position: 'absolute' (no fixed in RN)
overflow: scroll → <ScrollView> or <FlatList>
z-index        → zIndex (works same)
```

### CSS → NativeWind
```
className="..."  → className="..." (NativeWind, same syntax)
style={{ }}      → style={{ }} (RN StyleSheet values)
:hover           → Not available (use Pressable states)
:focus           → onFocus handler
@media           → Use useWindowDimensions() or Tailwind responsive
```

═══════════════════════════════════════════════════════════════

## 8. Risks & Unknowns

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privy Expo SDK maturity / API gaps | Medium | High | Check @privy-io/expo docs; fallback: WebView for auth |
| viem RN polyfill issues (crypto) | Medium | High | Test early; fallback: ethers.js has better RN support |
| NativeWind v4 class compatibility | Low | Medium | Well-documented; escape hatch: StyleSheet for edge cases |
| TradingView in WebView performance | Low | Low | Acceptable; native chart for dashboard overview |
| App Store rejection (crypto/finance) | Medium | High | Prepare compliance docs, clear descriptions |
| UPI payment flow on native | Medium | Medium | May need WebView for Onmeta; or switch to Razorpay SDK |
| Reanimated + Moti learning curve | Low | Low | API similar to Framer Motion; Moti is almost 1:1 |
| iOS Keychain for wallet security | Low | Medium | Privy Expo handles this; expo-secure-store as backup |

═══════════════════════════════════════════════════════════════

## 9. Recommended Execution Order

```
Week 1:  Phase 1 (Scaffold) + Phase 2 (Shared logic)
         → App boots, navigation works, theme applied

Week 2:  Phase 3 (Auth) + Step 4.1 (Login) + Step 4.2 (Dashboard)
         → User can log in and see holdings

Week 3:  Steps 4.3-4.5 (Buy + Sell flows)
         → Core transaction flows working

Week 4:  Steps 4.6-4.7 (Gift + Transactions)
         → Gift feature + history working

Week 5:  Steps 4.8-4.10 (Account, Charts, AutoPay, etc.)
         → All screens migrated

Week 6:  Phase 5 (Animations) + Phase 6 (Native features)
         → Polish, haptics, push notifications, biometrics

Week 7:  Phase 7 (Testing + Deployment)
         → TestFlight build, QA, App Store submission
```

═══════════════════════════════════════════════════════════════

## 10. Post-Migration Cleanup

After the Expo app is stable:
1. **Split repo** — Move API routes to standalone backend (Express/Hono)
   so the Next.js dependency can be fully removed
2. **Android** — Expo supports Android with minimal additional work;
   add `android.package` to app.json and build
3. **CI/CD** — Set up EAS Build + EAS Submit in GitHub Actions
4. **Analytics** — Add expo-analytics or Mixpanel RN SDK
5. **Crash reporting** — Sentry RN SDK via `@sentry/react-native`
6. **Code signing** — Set up Apple certificates and provisioning profiles
   in EAS for automated builds

═══════════════════════════════════════════════════════════════
