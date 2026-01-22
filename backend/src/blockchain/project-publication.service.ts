import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";
import dotenv from "dotenv";

dotenv.config();

export interface ProjectPublicationResult {
  transactionHash: string;
  ledger: number;
}

export class ProjectPublicationService {
  private readonly contract: Contract;
  private readonly adminKeypair: Keypair;
  private readonly server: rpc.Server;
  private readonly networkPassphrase: string;

  constructor() {
    const contractAddress = process.env.PROJECT_PUBLICATION_CONTRACT_ID;
    const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
    const rpcUrl =
      process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
    const network = process.env.SOROBAN_NETWORK || "testnet";

    if (!contractAddress) {
      throw new Error("PROJECT_PUBLICATION_CONTRACT_ID missing");
    }

    if (!adminSecret) {
      throw new Error("STELLAR_ADMIN_SECRET_KEY missing");
    }

    this.networkPassphrase =
      network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
    this.adminKeypair = Keypair.fromSecret(adminSecret);
    this.server = new rpc.Server(rpcUrl);
    this.contract = new Contract(contractAddress);
  }

  async recordProjectPublication(
    clientId: string,
    projectId: string,
    timestamp: number,
  ): Promise<ProjectPublicationResult> {
    const account = await this.getAccount(this.adminKeypair.publicKey());
    const callerScVal = Address.fromString(
      this.adminKeypair.publicKey(),
    ).toScVal();
    const clientScVal = Address.fromString(clientId).toScVal();
    const projectIdScVal = nativeToScVal(projectId, { type: "string" });
    const timestampScVal = nativeToScVal(BigInt(timestamp), { type: "u64" });

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        this.contract.call(
          "record_project",
          callerScVal,
          clientScVal,
          projectIdScVal,
          timestampScVal,
        ),
      )
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, sim).build();
    preparedTx.sign(this.adminKeypair);

    const send = await this.server.sendTransaction(preparedTx);

    if (send.status !== "PENDING") {
      throw new Error("Transaction submission failed");
    }

    const result = await this.pollTransactionStatus(send.hash);

    if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error("Transaction execution failed");
    }

    return {
      transactionHash: send.hash,
      ledger: result.ledger,
    };
  }

  private async getAccount(publicKey: string): Promise<Account> {
    const acc: any = await this.server.getAccount(publicKey);
    return new Account(publicKey, acc.sequence);
  }

  private async pollTransactionStatus(
    hash: string,
    maxAttempts = 15,
    interval = 3000,
  ): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const res = await this.server.getTransaction(hash);

      if (res.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
        return res;
      }

      await this.sleep(interval);
      attempts++;
    }

    throw new Error("Transaction confirmation timeout");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
