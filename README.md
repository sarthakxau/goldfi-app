# Bullion App

Bullion is a Progressive Web App (PWA) for digital gold savings. Users can buy and sell tokenized gold using on/offramping or onchain on Arbitrum Network using Indian Rupees (INR). Tola aims to provide a simple and intuitive interface for a gold savings application.

## Getting Started

### Prerequisites

- Node.js (version >= 18)
- pnpm package manager
- PostgreSQL database

### Installation

    git clone <repository-url>
    
2. **Install dependencies:**

    ```bash
    pnpm install
    ```

    Create a `.env` file in the root of the project and populate it with the required variables. See the "Environment Variables" section below for details.

4.  **Database setup:**

    Ensure your PostgreSQL database is running and the `DATABASE_URL` in your `.env` file is correct. Then, push the schema to your database:
    ```bash
    pnpm db:push
    ```

### Development

To start the development server:
    ```bash
        pnpm dev
    ```

The application will be available at `http://localhost:3000`.

### Other useful commands:
    pnpm build        # Build for production
    pnpm start        # Start production server
    pnpm lint         # Run ESLint
    pnpm db:generate  # Generate Prisma client after schema changes
    pnpm db:studio    # Open Prisma Studio GUI

## Environment Variables

The application requires the following environment variables to be set in a `.env` file.

    # Database
    DATABASE_URL="postgresql://..."

    # Caching
    REDIS_URL="redis://..."

    # Privy Auth
    NEXT_PUBLIC_PRIVY_APP_ID="..."
    PRIVY_APP_SECRET="..."

    # Blockchain
    ARBITRUM_RPC_URL="..."
    TREASURY_PRIVATE_KEY="..." # Important: Keep this secret
    TREASURY_WALLET_ADDRESS="..."

    # Services
    COINGECKO_API_KEY="..."
    NEXT_PUBLIC_SUPABASE_URL="..."
    SUPABASE_SERVICE_ROLE_KEY="..."
    ONMETA_API_KEY="..."
    ONMETA_MERCHANT_ID="..."
    ONMETA_WEBHOOK_SECRET="..."

## API Endpoints

The core API endpoints are located in `src/app/api/`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices` | GET | Get the current gold price (USD, INR, per gram). |
| `/api/prices/history` | GET | Get 7-day price history for charts. |
| `/api/holdings` | GET | Get the current user's holdings and profit/loss. |
| `/api/transactions/buy` | POST | Initiate a buy transaction. |
| `/api/transactions/sell`| POST | Initiate a sell transaction. |
| `/api/transactions/history` | GET | Get the user's transaction history. |
| `/api/webhooks/onmeta`| POST | Webhook for payment confirmations from Onmeta. |