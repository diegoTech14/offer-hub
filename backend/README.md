# 💼 OFFER-HUB Backend

Backend API for OFFER-HUB, built with Node.js, Express, and Supabase.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Supabase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OFFER-HUB/offer-hub.git
   cd offer-hub/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and other required variables.
   
   📖 **Need help setting up Supabase?** See [Supabase Setup Guide](docs/SUPABASE_SETUP.md)

4. Run Migrations:
   Ensure your Supabase instance is up to date with the migrations in `supabase/migrations`.

5. Start the Development Server:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:4000`.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # App configuration
│   ├── controllers/    # Route controllers (Auth, User)
│   ├── middlewares/    # Express middlewares
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── supabase/
│   └── migrations/     # Database migrations
└── docs/               # Project documentation & standards
```

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT & Supabase Auth
- **Blockchain**: Stellar SDK
- **Language**: TypeScript

## 📚 Documentation

For detailed documentation on standards, error handling, and API formats, please check the `docs/` directory:

- [Supabase Setup](docs/SUPABASE_SETUP.md) - Quick guide to configure Supabase for local development
- [Generate Bindings](../docs/GENERATE_BINDINGS.md) - **START HERE** - How to generate TypeScript bindings for Stellar contracts
- [Error Handling & Validation](docs/ERROR_HANDLING_AND_VALIDATION.md)
- [API Response Format](docs/API_RESPONSE_FORMAT.md)

## 🔐 Key Features (Current)

- **Authentication**: Email/Password & Wallet-based registration/login.
- **User Management**: Profile management.
- **Wallets**: Stellar wallet integration (Invisible & External).
- **Smart Contracts**: TypeScript bindings for Stellar smart contracts (Escrow Factory, Fee Manager, User Registry).

## 🌟 Working with Smart Contracts

The backend uses TypeScript bindings for type-safe smart contract interactions.

### Quick Start

1. **Add your contract IDs** to `backend/.env`:
   ```bash
   ESCROW_FACTORY_CONTRACT_ID=CXXXXXX...
   FEE_MANAGER_CONTRACT_ID=CXXXXXX...
   USER_REGISTRY_CONTRACT_ID=CXXXXXX...
   ```

2. **Generate bindings**:
   ```bash
   pnpm run bindings:generate
   ```

3. **Use in your code**:
   ```typescript
   import { getStellarClientFactory } from "@/services/stellar";
   
   const factory = getStellarClientFactory();
   const client = await factory.getEscrowFactory();
   ```

📖 **See full guide**: [Generate Bindings Documentation](../docs/GENERATE_BINDINGS.md)

**Commands:**
```bash
# Generate all bindings
pnpm run bindings:generate

# Generate specific contract
pnpm run bindings:generate -- --contract escrow-factory

# Test setup
cd backend && ./test-contracts.sh
```

## 🤝 Contributing

Please follow the coding standards defined in the documentation. Ensure all new features include appropriate tests and types.
