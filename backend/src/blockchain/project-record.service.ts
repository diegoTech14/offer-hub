import {
  Keypair,
  Networks,
  Server,
  TransactionBuilder,
  Operation,
  xdr,
} from '@stellar/stellar-sdk';
import {
  ProjectRecord,
  RecordProjectResult,
  BlockchainError,
  ContractError,
  NetworkError,
  ConfigurationError,
} from '@/types/blockchain.types';

/**
 * Project Record Service
 * Handles interactions with the Project Publication Soroban smart contract
 * 
 * Note: This service uses the Stellar SDK to interact with Soroban contracts.
 * For production use, consider using @stellar/stellar-sdk/contract for better
 * type safety and convenience methods.
 */
class ProjectRecordService {
  private contractAddress: string;
  private rpcUrl: string;
  private networkPassphrase: string;
  private adminSecretKey: string;
  private server: Server;

  constructor() {
    // Load configuration from environment variables
    this.contractAddress = process.env.PROJECT_PUBLICATION_CONTRACT_ID || '';
    this.rpcUrl =
      process.env.STELLAR_RPC_URL ||
      process.env.SOROBAN_RPC_URL ||
      'https://soroban-testnet.stellar.org:443';
    this.networkPassphrase =
      process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
    this.adminSecretKey = process.env.STELLAR_ADMIN_SECRET_KEY || '';

    // Validate required configuration
    if (!this.contractAddress) {
      throw new ConfigurationError(
        'PROJECT_PUBLICATION_CONTRACT_ID environment variable is required'
      );
    }

    if (!this.adminSecretKey) {
      throw new ConfigurationError(
        'STELLAR_ADMIN_SECRET_KEY environment variable is required'
      );
    }

    // Initialize Stellar server
    this.server = new Server(this.rpcUrl);
  }

  /**
   * Get the admin keypair from secret key
   */
  private getAdminKeypair(): Keypair {
    try {
      return Keypair.fromSecret(this.adminSecretKey);
    } catch (error) {
      throw new ConfigurationError(
        `Invalid admin secret key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Convert a value to SCVal format
   * Helper function to convert JavaScript values to Soroban SCVal
   */
  private nativeToScVal(value: any, type: string): xdr.ScVal {
    switch (type) {
      case 'address':
        return xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
              xdr.Uint256.fromXDR(value, 'hex')
            )
          )
        );
      case 'string':
        return xdr.ScVal.scvString(xdr.ScString.scString(value));
      case 'u64':
        return xdr.ScVal.scvU64(xdr.Uint64.fromString(value.toString()));
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  /**
   * Convert SCVal to native JavaScript value
   */
  private scValToNative(scVal: xdr.ScVal): any {
    switch (scVal.switch()) {
      case xdr.ScValType.scvString():
        return scVal.str().toString();
      case xdr.ScValType.scvU64():
        return scVal.u64().toString();
      case xdr.ScValType.scvAddress():
        // Extract address string from SCAddress
        const addr = scVal.address();
        if (addr.switch() === xdr.ScAddressType.scAddressTypeAccount()) {
          return addr.accountId().ed25519().toString('hex');
        }
        return addr.contractId().toString('hex');
      default:
        return scVal;
    }
  }

  /**
   * Build and submit a transaction to invoke a contract function
   */
  private async buildAndSubmitTransaction(
    functionName: string,
    args: xdr.ScVal[]
  ): Promise<string> {
    try {
      const adminKeypair = this.getAdminKeypair();
      const adminAddress = adminKeypair.publicKey();

      // Load the source account
      const sourceAccount = await this.server.loadAccount(adminAddress);

      // Convert contract address to hash
      const contractHash = xdr.Hash.fromXDR(
        Buffer.from(this.contractAddress.replace('C', ''), 'hex'),
        'hex'
      );

      // Build the transaction
      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: xdr.ScAddress.scAddressTypeContract(contractHash),
                functionName: xdr.ScSymbol.scSymbol(functionName),
                args: xdr.ScVec.scVec(args),
              })
            ),
          })
        )
        .setTimeout(60);

      const transaction = txBuilder.build();

      // Simulate the transaction to get footprint and auth entries
      const simulation = await this.server.simulateTransaction(transaction);

      if (simulation.errorResult) {
        const errorCode = simulation.errorResult.code();
        throw new ContractError(
          `Contract simulation failed: ${simulation.errorResult.switch().name}`,
          errorCode
        );
      }

      // Set soroban data from simulation
      if (simulation.transactionData) {
        transaction.setSorobanData(simulation.transactionData.build());
      }

      // Handle authorization entries if needed
      if (simulation.auth && simulation.auth.length > 0) {
        const authEntries = simulation.auth.map((entry) => {
          if (
            entry.switch() ===
            xdr.SorobanCredentialsType.sorobanCredentialsSourceAccount()
          ) {
            return entry;
          }
          // For other auth types, additional signing would be required
          return entry;
        });
        transaction.setSorobanAuthorizations(authEntries);
      }

      // Sign the transaction
      transaction.sign(adminKeypair);

      // Submit the transaction
      const response = await this.server.submitTransaction(transaction);

      if (response.errorResult) {
        throw new ContractError(
          `Transaction failed: ${response.errorResult.switch().name}`,
          response.errorResult.code()
        );
      }

      return response.hash;
    } catch (error) {
      if (error instanceof BlockchainError) {
        throw error;
      }
      throw new NetworkError(
        `Failed to submit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Record a project publication on the blockchain
   * @param clientId - The Stellar address of the client who published the project
   * @param projectId - Unique identifier for the project
   * @param timestamp - Optional timestamp (defaults to current time)
   * @returns Transaction hash
   */
  async recordProject(
    clientId: string,
    projectId: string,
    timestamp?: number
  ): Promise<RecordProjectResult> {
    try {
      // Validate inputs
      if (!clientId || !projectId) {
        throw new BlockchainError('clientId and projectId are required');
      }

      // Use current timestamp if not provided
      const projectTimestamp = timestamp || Math.floor(Date.now() / 1000);

      // Get admin keypair for caller
      const adminKeypair = this.getAdminKeypair();
      const adminAddress = adminKeypair.publicKey();

      // Convert arguments to SCVal
      const args = [
        this.nativeToScVal(adminAddress, 'address'), // caller
        this.nativeToScVal(clientId, 'address'), // client_id
        this.nativeToScVal(projectId, 'string'), // project_id
        this.nativeToScVal(projectTimestamp.toString(), 'u64'), // timestamp
      ];

      // Build and submit transaction
      const transactionHash = await this.buildAndSubmitTransaction(
        'record_project',
        args
      );

      return {
        transactionHash,
        success: true,
      };
    } catch (error) {
      if (error instanceof BlockchainError) {
        throw error;
      }
      throw new NetworkError(
        `Failed to record project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Get a project record from the blockchain
   * @param projectId - The project ID to look up
   * @returns ProjectRecord or null if not found
   */
  async getProjectRecord(projectId: string): Promise<ProjectRecord | null> {
    try {
      if (!projectId) {
        throw new BlockchainError('projectId is required');
      }

      // Build a read-only query (simulation without submitting)
      const adminKeypair = this.getAdminKeypair();
      const adminAddress = adminKeypair.publicKey();

      const sourceAccount = await this.server.loadAccount(adminAddress);

      // Convert contract address to hash
      const contractHash = xdr.Hash.fromXDR(
        Buffer.from(this.contractAddress.replace('C', ''), 'hex'),
        'hex'
      );

      const args = [this.nativeToScVal(projectId, 'string')];

      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: xdr.ScAddress.scAddressTypeContract(contractHash),
                functionName: xdr.ScSymbol.scSymbol('get_project_record'),
                args: xdr.ScVec.scVec(args),
              })
            ),
          })
        )
        .setTimeout(60);

      const transaction = txBuilder.build();

      // Simulate the transaction (read-only)
      const simulation = await this.server.simulateTransaction(transaction);

      if (simulation.errorResult) {
        // If error is "not found", return null
        const errorType = simulation.errorResult.switch().name;
        if (
          errorType === 'SOROBAN_RESOURCE_MISSING' ||
          errorType === 'SOROBAN_RESOURCE_LIMIT_EXCEEDED'
        ) {
          return null;
        }
        throw new ContractError(
          `Contract simulation failed: ${errorType}`,
          simulation.errorResult.code()
        );
      }

      // Extract result from simulation
      if (!simulation.result) {
        return null;
      }

      // Convert SCVal result to native JavaScript object
      const resultVal = simulation.result.retval();

      // Check if result is None (optional type) - represented as void in some cases
      if (
        resultVal.switch() === xdr.ScValType.scvVoid() ||
        resultVal.switch() === xdr.ScValType.scvBool()
      ) {
        return null;
      }

      // Parse the ProjectRecord struct (should be a Vec)
      if (resultVal.switch() !== xdr.ScValType.scvVec()) {
        return null;
      }

      const recordVec = resultVal.vec();
      if (!recordVec || recordVec.length() < 4) {
        return null;
      }

      const clientIdScVal = recordVec.get(0);
      const projectIdScVal = recordVec.get(1);
      const timestampScVal = recordVec.get(2);
      const recordedAtScVal = recordVec.get(3);

      const clientId = this.scValToNative(clientIdScVal) as string;
      const projectIdStr = this.scValToNative(projectIdScVal) as string;
      const timestamp = Number(this.scValToNative(timestampScVal));
      const recordedAt = Number(this.scValToNative(recordedAtScVal));

      return {
        client_id: clientId,
        project_id: projectIdStr,
        timestamp,
        recorded_at: recordedAt,
      };
    } catch (error) {
      if (error instanceof BlockchainError) {
        throw error;
      }
      throw new NetworkError(
        `Failed to get project record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }
}

// Export singleton instance
export const projectRecordService = new ProjectRecordService();

// Export class for testing
export { ProjectRecordService };
