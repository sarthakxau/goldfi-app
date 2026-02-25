# Bullion (gold.fi)

Bullion is a mobile app for digital gold savings targeting Indian users. Buy and sell tokenized gold (XAUT0) on Arbitrum using INR/UPI. The app abstracts away all blockchain complexity and presents a simple gold savings experience.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5 + React 19
- **Router**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Auth/Wallet**: Privy Expo SDK (`@privy-io/expo`) — email/code login with embedded wallets
- **Blockchain**: Viem v2 on Arbitrum
- **Database**: PostgreSQL via Supabase
- **State**: Zustand
- **Animations**: Moti + Reanimated v4

## Getting Started

### Prerequisites

- Node.js 20 (required — Node 22+ breaks Expo type stripping)
- pnpm package manager
- Expo Go app on your iOS device

### Installation

```bash
git clone git@github.com:sarthakxau/goldfi-app.git
cd goldfi-app
pnpm install
```

Create a `.env` file and populate it with the required variables (see Environment Variables below).

### Development

```bash
nvm use 20
npx expo start --tunnel --clear
```

> **Important**: Always use `--tunnel` mode. LAN mode hangs on "opening project..." screen.

### Other Commands

```bash
npx expo export --platform ios   # Verify production bundle
npx tsc --noEmit                 # TypeScript check
pnpm lint                        # Run ESLint
```

### EAS Builds

```bash
eas build --profile development --platform ios
eas build --profile preview --platform ios
eas build --profile production --platform ios
```

## Environment Variables

```env
# Expo App
EXPO_PUBLIC_API_URL=             # Backend API base URL
EXPO_PUBLIC_PRIVY_APP_ID=        # Privy app ID
EXPO_PUBLIC_PRIVY_CLIENT_ID=     # Privy client ID
EXPO_PUBLIC_SUPABASE_URL=        # Supabase URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key

# Backend (Next.js, separately deployed)
DATABASE_URL=
REDIS_URL=
PRIVY_APP_SECRET=
ARBITRUM_RPC_URL=
TREASURY_PRIVATE_KEY=            # Keep this secret — never expose
TREASURY_WALLET_ADDRESS=
COINGECKO_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ONMETA_API_KEY=
ONMETA_MERCHANT_ID=
ONMETA_WEBHOOK_SECRET=
```

## API Endpoints

The backend is a separately deployed Next.js app. The mobile app calls it via `authFetch()` / `authFetchJson()` from `src/lib/apiClient.ts`.

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

## Smart Contracts (Arbitrum Mainnet)

| Token/Contract | Address |
|----------------|---------|
| XAUT0 | `0x40461291347e1eCbb09499F3371D3f17f10d7159` |
| USDT | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| Camelot V3 Router | `0x1F721E2E82F6676FCE4eA07A5958cF098D339e18` |
