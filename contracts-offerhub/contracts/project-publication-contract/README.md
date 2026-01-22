# Project Publication Smart Contract

This contract implements an immutable registry for project publications on the Stellar blockchain using Soroban. It provides proof of when a project was published and by whom.

### Contract Deployed

The contract has been successfully deployed to Stellar testnet with the following details:

- **Contract ID**: `CC6EIP4CLZW4CY5W6T2AJB53QP67CXLKLZBUCYEMZPFGPW5AW5QVCT2M`
- **Network**: Stellar Testnet
- **Status**: Deployed and initialized

The admin used for intializing the contract it's a cli generated wallet.

## Features

- **Admin Initialization**: Contract must be initialized with an admin address before use
- **Project Recording**: Record project publications with client_id, project_id, and timestamp
- **Immutable Records**: Once recorded, project records cannot be modified or deleted
- **Query Interface**: Retrieve project records by project_id
- **Events**: Emits events for external tracking (project_recorded, admin_initialized)
- **Access Control**: Only admin can record projects

## Project Structure

The contract is organized into modules:

- `lib.rs`: Contract entry point and public interface definition
- `contract.rs`: Main implementation of project publication functionality
- `storage.rs`: Data storage management
- `events.rs`: Event emission
- `types.rs`: Definition of data types
- `error.rs`: Error definitions
- `validation.rs`: Input validation
- `test.rs`: Tests to verify contract functionality

## Compilation

To compile the contract using Stellar CLI:

```bash
cd contracts-offerhub/contracts/project-publication-contract
stellar contract build
```

The resulting WASM file will be in `target/wasm32-unknown-unknown/release/project_publication_contract.wasm`.

## Deployment on Testnet


### Deployment Steps (for reference)

If you need to redeploy the contract, follow these steps:

1. Install Stellar CLI:
```bash
cargo install --locked stellar-cli
```

2. Configure the connection to testnet:
```bash
stellar config network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443/soroban/rpc \
  --network-passphrase "Test SDF Network ; September 2015"
```

3. Create an account (if you don't have one):
```bash
stellar config identity generate --global admin
stellar config identity address admin
```

4. Fund the account from friendbot:
```bash
curl "https://friendbot.stellar.org/?addr=$(stellar config identity address admin)"
```

5. Build and deploy the contract:
```bash
cd contracts-offerhub/contracts/project-publication-contract
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/project_publication_contract.wasm \
  --source admin \
  --network testnet
```

This will return a contract ID that will be used to interact with it.

6. Initialize the contract:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar config identity address admin)
```

## Usage Examples

### Record a Project Publication

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  record_project \
  --caller $(stellar config identity address admin) \
  --client_id <CLIENT_ADDRESS> \
  --project_id "project-123" \
  --timestamp $(date +%s)
```

### Get Project Record

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  get_project_record \
  --project_id "project-123"
```

## Function Reference

### `initialize(admin: Address) -> Result<(), Error>`

Initialize the contract with an admin address. This can only be called once.

**Parameters:**
- `admin`: The admin address that will be authorized to record projects

**Errors:**
- `AlreadyInitialized`: Contract has already been initialized

### `record_project(caller: Address, client_id: Address, project_id: String, timestamp: u64) -> Result<(), Error>`

Record a project publication. Only the admin can call this function.

**Parameters:**
- `caller`: The address calling the function (must be admin)
- `client_id`: The address of the client who published the project
- `project_id`: Unique identifier for the project
- `timestamp`: Timestamp when the project was published

**Errors:**
- `NotInitialized`: Contract has not been initialized
- `Unauthorized`: Caller is not the admin
- `InvalidClientId`: Invalid client address provided
- `InvalidProjectId`: Invalid project ID format
- `ProjectAlreadyRecorded`: Project with this ID has already been recorded
- `InvalidTimestamp`: Timestamp is invalid (e.g., too far in the future)

### `get_project_record(project_id: String) -> Option<ProjectRecord>`

Retrieve a project record by project_id.

**Parameters:**
- `project_id`: The project ID to look up

**Returns:**
- `Some(ProjectRecord)` if found, `None` otherwise

## Data Types

### `ProjectRecord`

```rust
pub struct ProjectRecord {
    pub client_id: Address,      // Address of the client who published
    pub project_id: String,       // Unique project identifier
    pub timestamp: u64,            // Timestamp when project was published
    pub recorded_at: u64,          // Ledger timestamp when record was created
}
```

## Events

### `project_recorded`

Emitted when a project is successfully recorded.

**Topics:**
- `project_recorded` (Symbol)
- `client_id` (Address)
- `project_id` (String)

**Data:**
- `timestamp` (u64)

### `admin_initialized`

Emitted when the contract is initialized.

**Topics:**
- `admin_initialized` (Symbol)

**Data:**
- `admin` (Address)

## Testing

The contract includes comprehensive tests. To run the tests:

```bash
cd contracts-offerhub
cargo test -p project-publication-contract
```

The test suite covers:
- Contract initialization
- Project recording
- Record retrieval
- Access control
- Input validation
- Error handling
- Duplicate prevention

## Security

The contract implements various security mechanisms:

- Admin-only operations for recording projects
- One-time initialization to prevent re-initialization
- Input validation for all parameters
- Timestamp validation to prevent future-dated records
- Duplicate prevention (each project_id can only be recorded once)
- Immutable records once stored

## Integration

This contract is designed to be used by backend services to record project publications. The backend service should:

1. Call `record_project` when a project is published
2. Store the returned transaction hash for audit purposes
3. Use `get_project_record` to verify project publication status

---
