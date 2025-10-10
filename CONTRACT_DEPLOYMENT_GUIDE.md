# OfferHub Contract Deployment & Integration Guide

This guide explains how to deploy all OfferHub smart contracts and integrate them with the frontend using React hooks.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Contract Deployment](#contract-deployment)
- [Frontend Integration](#frontend-integration)
- [Available Hooks](#available-hooks)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

### Required Software
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/install)
- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### Environment Setup
1. Install Soroban CLI:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   cargo install --locked soroban-cli
   ```

2. Configure Soroban for your network:
   ```bash
   soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
   soroban config identity generate admin
   soroban config identity fund admin --network testnet
   ```

## 🏗️ Contract Deployment

### 1. Set Environment Variables

Create a `.env` file in the project root:

```bash
# Required
export ADMIN_ADDRESS="GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export NETWORK="testnet"

# Optional
export FEE_MANAGER_ADDRESS="GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 2. Run Deployment Script

The comprehensive deployment script will:
- Build all contracts
- Deploy them in the correct dependency order
- Initialize each contract
- Configure relationships between contracts
- Generate configuration files

```bash
# Make the script executable
chmod +x scripts/deploy-all-contracts.sh

# Run the deployment
./scripts/deploy-all-contracts.sh
```

### 3. Deployment Output

The script will create a deployment directory with:
- `deployment-summary.json` - Complete deployment information
- `.env` - Environment variables for frontend
- `contract-addresses.ts` - TypeScript constants
- Individual contract address files

### 4. Contract Deployment Order

The script deploys contracts in this order to handle dependencies:

1. **Core Contracts**
   - User Registry
   - Fee Manager
   - Stat Contract

2. **Secondary Contracts**
   - Publication Contract
   - Rating Contract
   - Reputation NFT Contract

3. **Escrow System**
   - Escrow Contract
   - Escrow Factory

4. **Dispute & Emergency**
   - Dispute Contract
   - Emergency Contract

## 🎣 Frontend Integration

### 1. Install Dependencies

```bash
npm install @stellar/stellar-sdk
```

### 2. Configure Environment

Copy the generated `.env` file to your frontend:

```bash
cp deployments/YYYYMMDD-HHMMSS/.env .env.local
```

### 3. Use the Hooks

Import and use the contract hooks in your React components:

```typescript
import { useOfferHub, useUserRegistry, useEscrow } from '@/hooks/contracts';

function MyComponent() {
  // Use the main hook for all contracts
  const { userRegistry, escrow, loading, error } = useOfferHub();
  
  // Or use individual hooks
  const userRegistryHook = useUserRegistry(contractAddress);
  
  // Example: Verify a user
  const handleVerifyUser = async () => {
    const success = await userRegistry.verifyUser(
      userAddress,
      VerificationLevel.VERIFIED,
      expirationTimestamp,
      'User verification metadata'
    );
    
    if (success) {
      console.log('User verified successfully');
    }
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleVerifyUser}>
        Verify User
      </button>
    </div>
  );
}
```

## 🎣 Available Hooks

### Main Hook: `useOfferHub`
Provides access to all contracts with combined state management.

```typescript
const {
  userRegistry,    // User management functions
  escrow,         // Escrow operations
  publication,    // Publication management
  rating,         // Rating system
  dispute,        // Dispute resolution
  loading,        // Combined loading state
  error,          // Combined error state
  refreshAll,     // Refresh all contract data
  isAnyContractPaused, // Check if any contract is paused
  getContractStatuses, // Get status of all contracts
} = useOfferHub();
```

### Individual Contract Hooks

#### `useUserRegistry`
User verification, profiles, and access control.

```typescript
const {
  verifyUser,           // Verify a user with level and expiration
  getUserProfile,       // Get user profile data
  blacklistUser,        // Add user to blacklist
  getTotalUsers,        // Get total number of users
  addModerator,         // Add a moderator
  exportUserData,       // Export user data
} = useUserRegistry(contractAddress);
```

#### `useEscrow`
Escrow transactions and milestone management.

```typescript
const {
  initContract,         // Initialize escrow contract
  depositFunds,         // Deposit funds to escrow
  releaseFunds,         // Release funds to freelancer
  addMilestone,         // Add a milestone
  approveMilestone,     // Approve a milestone
  dispute,              // Open a dispute
  resolveDispute,       // Resolve a dispute
} = useEscrow(contractAddress);
```

#### `usePublication`
Service and project publications.

```typescript
const {
  publish,              // Publish a new service/project
  getPublication,       // Get specific publication
  getPublications,      // Get user's publications
  searchPublications,   // Search publications
  getPublicationStats,  // Get publication statistics
} = usePublication(contractAddress);
```

#### `useRating`
Rating and review system.

```typescript
const {
  submitRating,         // Submit a rating
  getRatingSummary,     // Get user's rating summary
  moderateRating,       // Moderate a rating
  getPlatformRatingStats, // Get platform rating stats
  claimRatingReward,    // Claim rating rewards
} = useRating(contractAddress);
```

#### `useDispute`
Dispute resolution and arbitration.

```typescript
const {
  openDispute,          // Open a new dispute
  addEvidence,          // Add evidence to dispute
  resolveDispute,       // Resolve a dispute
  getDisputesByUser,    // Get user's disputes
  addMediator,          // Add a mediator
  getDisputeStats,      // Get dispute statistics
} = useDispute(contractAddress);
```

## ⚙️ Configuration

### Contract Configuration

The `src/config/contracts.ts` file provides:

```typescript
import { getContractConfig, validateContractConfig } from '@/config/contracts';

// Get current configuration
const config = getContractConfig();

// Validate configuration
const { valid, errors } = validateContractConfig(config);
if (!valid) {
  console.error('Configuration errors:', errors);
}
```

### Environment Variables

Required environment variables:

```bash
# Network Configuration
NEXT_PUBLIC_SOROBAN_NETWORK=testnet
NEXT_PUBLIC_ADMIN_ADDRESS=GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FEE_MANAGER_ADDRESS=GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Contract Addresses
NEXT_PUBLIC_USER_REGISTRY_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_PUBLICATION_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_RATING_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_DISPUTE_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_FEE_MANAGER_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_REPUTATION_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_ESCROW_FACTORY_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_EMERGENCY_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
NEXT_PUBLIC_STAT_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3I3F
```

## 🧪 Testing

### 1. Test Contract Deployment

```bash
# Verify contracts are deployed and initialized
soroban contract invoke --network testnet --id $USER_REGISTRY_CONTRACT_ID -- get_admin
soroban contract invoke --network testnet --id $RATING_CONTRACT_ID -- get_admin
```

### 2. Test Frontend Integration

Create a test component:

```typescript
import { useOfferHub } from '@/hooks/contracts';

function ContractTest() {
  const { userRegistry, loading, error } = useOfferHub();
  
  const testUserRegistry = async () => {
    const admin = await userRegistry.getAdmin();
    console.log('Admin address:', admin);
    
    const totalUsers = await userRegistry.getTotalUsers();
    console.log('Total users:', totalUsers);
  };
  
  return (
    <div>
      <button onClick={testUserRegistry} disabled={loading}>
        Test User Registry
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check that ADMIN_ADDRESS is set correctly
   - Ensure you have sufficient XLM for deployment
   - Verify network connectivity

2. **Hooks return null/undefined**
   - Check that contract addresses are set in environment variables
   - Verify contracts are deployed and initialized
   - Check network configuration

3. **Transaction failures**
   - Ensure user has sufficient balance
   - Check contract pause status
   - Verify user permissions

### Debug Commands

```bash
# Check contract status
soroban contract invoke --network testnet --id $CONTRACT_ID -- is_paused

# Get contract admin
soroban contract invoke --network testnet --id $CONTRACT_ID -- get_admin

# Check user verification
soroban contract invoke --network testnet --id $USER_REGISTRY_ID -- is_verified --user $USER_ADDRESS
```

### Logs and Monitoring

The deployment script generates detailed logs. Check the console output for:
- Contract deployment addresses
- Initialization status
- Configuration errors
- Network connectivity issues

## 📚 Additional Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review contract logs
3. Check Soroban network status
4. Create an issue in the repository

---

**Note**: This guide assumes you're using the testnet. For mainnet deployment, ensure you have proper security measures and sufficient XLM for deployment costs.
