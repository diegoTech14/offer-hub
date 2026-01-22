# Instructions for Executing the Project Publication Contract

These instructions guide you step by step to compile, deploy, and initialize the contract using **only `stellar-cli` commands**.

## Prerequisites

1. **Install Stellar CLI:**
```bash
cargo install --locked stellar-cli
```

2. **Verify installation:**
```bash
stellar --version
```

## Step 1: Configure Testnet Network

Configure the connection to Stellar's testnet network:

```bash
stellar config network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443/soroban/rpc \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Step 2: Create and Configure Admin Account

1. **Generate admin identity:**
```bash
stellar config identity generate --global admin
```

2. **Get admin account address:**
```bash
stellar config identity address admin
```

Save this address, you will need it to initialize the contract.

3. **Fund account from friendbot:**
```bash
curl "https://friendbot.stellar.org/?addr=$(stellar config identity address admin)"
```

Wait a few seconds for the transaction to process.

## Step 3: Compile the Contract

Navigate to the contract directory and compile using Stellar CLI:

```bash
cd contracts-offerhub/contracts/project-publication-contract
stellar contract build
```

This will compile the contract and generate the WASM file at:
`target/wasm32-unknown-unknown/release/project_publication_contract.wasm`

## Step 4: Deploy the Contract

Deploy the compiled contract to the testnet network:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/project_publication_contract.wasm \
  --source admin \
  --network testnet
```

**Save the CONTRACT_ID shown in the output.** You will need it for all future operations.

Example output:
```
Contract ID: C1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCD
```

## Step 5: Initialize the Contract

Initialize the contract with the admin address:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar config identity address admin)
```

Replace `<CONTRACT_ID>` with the ID you obtained in the previous step.

If everything goes well, you will see a successful output without errors.

## Step 6: Verify Contract Functionality

### Test 1: Record a Project

Record a test project publication:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  record_project \
  --caller $(stellar config identity address admin) \
  --client_id $(stellar config identity address admin) \
  --project_id "test-project-001" \
  --timestamp $(date +%s)
```

This will record a project with:
- `client_id`: Your admin address (you can use any valid Stellar address)
- `project_id`: "test-project-001"
- `timestamp`: Current timestamp in seconds

### Test 2: Get Project Record

Query the record you just created:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  get_project_record \
  --project_id "test-project-001"
```

You should see the registered project data:
- `client_id`: The client address
- `project_id`: "test-project-001"
- `timestamp`: The timestamp you provided
- `recorded_at`: The ledger timestamp when it was recorded

## Troubleshooting

### Error: "Contract not found"
- Verify that the CONTRACT_ID is correct
- Make sure you deployed the contract correctly

### Error: "Not initialized"
- Run step 5 (initialization) first

### Error: "Already initialized"
- The contract has already been initialized. You cannot initialize it twice.

### Error: "Unauthorized"
- Only the admin can record projects
- Verify you are using `--source admin` and the admin address is correct

### Error: "Project already recorded"
- The `project_id` you are trying to use already exists
- Use a different `project_id`

## Environment Variables for Backend

Once you have the CONTRACT_ID, add these variables to your backend's `.env` file:

```bash
PROJECT_PUBLICATION_CONTRACT_ID=<YOUR_CONTRACT_ID>
STELLAR_ADMIN_SECRET_KEY=<YOUR_ADMIN_SECRET_KEY>
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

To get your admin secret key:
```bash
stellar config identity show admin
```

## Useful Commands

**View all configured identities:**
```bash
stellar config identity list
```

**View network configuration:**
```bash
stellar config network list
```

**View identity details:**
```bash
stellar config identity show admin
```

**Get only the address:**
```bash
stellar config identity address admin
```

---

Ready! Your contract is now deployed and working on Stellar's testnet network.
