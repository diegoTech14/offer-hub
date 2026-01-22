import { ProjectRecordService } from '../project-record.service';
import {
  BlockchainError,
  ContractError,
  NetworkError,
  ConfigurationError,
} from '@/types/blockchain.types';

// Mock Stellar SDK
jest.mock('@stellar/stellar-sdk', () => ({
  Keypair: {
    fromSecret: jest.fn((secret: string) => ({
      publicKey: () => 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      secret: () => secret,
    })),
  },
  Networks: {
    TESTNET: 'Test SDF Network ; September 2015',
  },
  Server: jest.fn().mockImplementation(() => ({
    loadAccount: jest.fn().mockResolvedValue({
      accountId: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      sequenceNumber: '123456789',
    }),
    simulateTransaction: jest.fn(),
    submitTransaction: jest.fn(),
  })),
  TransactionBuilder: jest.fn().mockImplementation(() => ({
    addOperation: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      sign: jest.fn(),
      setSorobanData: jest.fn(),
      setSorobanAuthorizations: jest.fn(),
    }),
  })),
  Operation: {
    invokeHostFunction: jest.fn(),
  },
  xdr: {
    Hash: {
      fromXDR: jest.fn(),
    },
    ScAddress: {
      scAddressTypeContract: jest.fn(),
    },
    ScSymbol: {
      scSymbol: jest.fn(),
    },
    ScVec: {
      scVec: jest.fn(),
    },
    HostFunction: {
      hostFunctionTypeInvokeContract: jest.fn(),
    },
    InvokeContractArgs: jest.fn(),
  },
}));

describe('ProjectRecordService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      PROJECT_PUBLICATION_CONTRACT_ID: 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      STELLAR_ADMIN_SECRET_KEY: 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      STELLAR_RPC_URL: 'https://soroban-testnet.stellar.org:443',
      STELLAR_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should throw ConfigurationError if contract address is missing', () => {
      delete process.env.PROJECT_PUBLICATION_CONTRACT_ID;
      expect(() => {
        new ProjectRecordService();
      }).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError if admin secret key is missing', () => {
      delete process.env.STELLAR_ADMIN_SECRET_KEY;
      expect(() => {
        new ProjectRecordService();
      }).toThrow(ConfigurationError);
    });

    it('should initialize with default RPC URL if not provided', () => {
      delete process.env.STELLAR_RPC_URL;
      const service = new ProjectRecordService();
      expect(service).toBeInstanceOf(ProjectRecordService);
    });
  });

  describe('recordProject', () => {
    let service: ProjectRecordService;
    let mockServer: any;

    beforeEach(() => {
      service = new ProjectRecordService();
      const { Server } = require('@stellar/stellar-sdk');
      mockServer = new Server();
    });

    it('should throw error if clientId is missing', async () => {
      await expect(
        service.recordProject('', 'project-123')
      ).rejects.toThrow(BlockchainError);
    });

    it('should throw error if projectId is missing', async () => {
      await expect(
        service.recordProject('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '')
      ).rejects.toThrow(BlockchainError);
    });

    it('should use current timestamp if not provided', async () => {
      const mockSubmit = jest.fn().mockResolvedValue({
        hash: 'tx_hash_123',
        errorResult: null,
      });
      mockServer.submitTransaction = mockSubmit;

      const mockSimulate = jest.fn().mockResolvedValue({
        errorResult: null,
        transactionData: { build: jest.fn() },
        auth: [],
      });
      mockServer.simulateTransaction = mockSimulate;

      const result = await service.recordProject(
        'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        'project-123'
      );

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('tx_hash_123');
    });

    it('should handle contract errors', async () => {
      const mockSimulate = jest.fn().mockResolvedValue({
        errorResult: {
          switch: () => ({ name: 'SOROBAN_RESOURCE_MISSING' }),
          code: () => 1,
        },
      });
      mockServer.simulateTransaction = mockSimulate;

      await expect(
        service.recordProject(
          'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'project-123'
        )
      ).rejects.toThrow(ContractError);
    });

    it('should handle network errors', async () => {
      const mockSimulate = jest.fn().mockRejectedValue(
        new Error('Network error')
      );
      mockServer.simulateTransaction = mockSimulate;

      await expect(
        service.recordProject(
          'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'project-123'
        )
      ).rejects.toThrow(NetworkError);
    });
  });

  describe('getProjectRecord', () => {
    let service: ProjectRecordService;
    let mockServer: any;

    beforeEach(() => {
      service = new ProjectRecordService();
      const { Server } = require('@stellar/stellar-sdk');
      mockServer = new Server();
    });

    it('should throw error if projectId is missing', async () => {
      await expect(service.getProjectRecord('')).rejects.toThrow(
        BlockchainError
      );
    });

    it('should return null if project not found', async () => {
      const mockSimulate = jest.fn().mockResolvedValue({
        errorResult: {
          switch: () => ({ name: 'SOROBAN_RESOURCE_MISSING' }),
          code: () => 1,
        },
      });
      mockServer.simulateTransaction = mockSimulate;

      const result = await service.getProjectRecord('non-existent');
      expect(result).toBeNull();
    });

    it('should return project record if found', async () => {
      const { xdr } = require('@stellar/stellar-sdk');
      const mockScVal = {
        switch: () => xdr.ScValType.scvVec(),
        vec: () => ({
          length: () => 4,
          get: jest.fn((index: number) => {
            const values = [
              { switch: () => xdr.ScValType.scvAddress(), address: () => ({ accountId: () => ({ ed25519: () => Buffer.from('client_id') }) }) }) },
              { switch: () => xdr.ScValType.scvString(), str: () => ({ toString: () => 'project-123' }) },
              { switch: () => xdr.ScValType.scvU64(), u64: () => ({ toString: () => '1234567890' }) },
              { switch: () => xdr.ScValType.scvU64(), u64: () => ({ toString: () => '1234567891' }) },
            ];
            return values[index];
          }),
        }),
      };

      const mockSimulate = jest.fn().mockResolvedValue({
        errorResult: null,
        result: {
          retval: () => mockScVal,
        },
      });
      mockServer.simulateTransaction = mockSimulate;

      const result = await service.getProjectRecord('project-123');

      expect(result).not.toBeNull();
      expect(result?.project_id).toBe('project-123');
    });

    it('should handle network errors', async () => {
      const mockSimulate = jest.fn().mockRejectedValue(
        new Error('Network error')
      );
      mockServer.simulateTransaction = mockSimulate;

      await expect(
        service.getProjectRecord('project-123')
      ).rejects.toThrow(NetworkError);
    });
  });
});
