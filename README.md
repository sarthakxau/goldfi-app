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

Create a `.env` file and populate it with the required variables (or copy and rename `.env.example`).

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

```bash
cp .env.example .env
```

## API Endpoints

The backend is a separately deployed Next.js app. The mobile app calls it via `authFetch()` / `authFetchJson()` from `src/lib/apiClient.ts`.
