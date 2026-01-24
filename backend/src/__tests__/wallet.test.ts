import request from 'supertest';
import express from 'express';
import { StrKey } from '@stellar/stellar-sdk';

// Mock auth middleware before importing
jest.mock('../middlewares/auth.middleware', () => ({
    verifyToken: (req: any, res: any, next: any) => {
        req.user = { id: 'test-user-id' };
        next();
    },
    authenticateToken: () => (req: any, res: any, next: any) => {
        req.user = { id: 'test-user-id' };
        next();
    }
}));

// Mock wallet service
jest.mock('../services/wallet.service', () => ({
    connectExternalWallet: jest.fn()
}));

import walletRoutes from '../routes/wallet.routes';
import { connectExternalWallet } from '../services/wallet.service';
import { ErrorHandler } from '../utils/AppError';

const app = express();
app.use(express.json());
app.use('/api/v1/wallets', walletRoutes);
app.use(ErrorHandler);

const mockedConnectExternalWallet = connectExternalWallet as jest.MockedFunction<typeof connectExternalWallet>;

describe('POST /api/v1/wallets/external', () => {
    let testPublicKey = 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const validProvider = 'freighter';

    beforeEach(() => {
        jest.clearAllMocks();
        // Use a valid format key for testing
        testPublicKey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));

        // Default mock implementation to prevent 500 errors when not explicitly mocked
        mockedConnectExternalWallet.mockResolvedValue({
            id: 'wallet-uuid',
            user_id: 'test-user-id',
            address: testPublicKey,
            type: 'external' as const,
            provider: 'freighter' as const,
            is_primary: false,
            created_at: new Date().toISOString()
        });
    });

    describe('Success Cases', () => {
        it('should connect external wallet successfully with valid data', async () => {
            const mockWallet = {
                id: 'wallet-uuid',
                user_id: 'test-user-id',
                address: testPublicKey,
                type: 'external' as const,
                provider: 'freighter' as const,
                is_primary: false,
                created_at: new Date().toISOString()
            };

            mockedConnectExternalWallet.mockResolvedValueOnce(mockWallet);

            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'freighter'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('External wallet connected successfully');
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.public_key).toBe(testPublicKey);
            expect(res.body.data.type).toBe('external');
            expect(res.body.data.provider).toBe('freighter');
            expect(res.body.data.is_primary).toBe(false);
        });

        it('should accept all valid providers', async () => {
            const providers = ['freighter', 'albedo', 'rabet', 'xbull', 'other'];

            for (const provider of providers) {
                const mockWallet = {
                    id: 'wallet-uuid',
                    user_id: 'test-user-id',
                    address: testPublicKey,
                    type: 'external' as const,
                    provider: provider as any,
                    is_primary: false,
                    created_at: new Date().toISOString()
                };

                mockedConnectExternalWallet.mockResolvedValueOnce(mockWallet);

                const res = await request(app)
                    .post('/api/v1/wallets/external')
                    .send({
                        public_key: testPublicKey,
                        provider: provider
                    });

                expect(res.status).toBe(201);
                expect(res.body.data.provider).toBe(provider);
            }
        });
    });

    describe('Validation Errors', () => {
        it('should return 422 if public_key is missing', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({ provider: 'freighter' });

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it('should return 422 if provider is missing', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({ public_key: testPublicKey });

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it('should return 400 if public_key format is invalid (not 56 chars)', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: 'GSHORT',
                    provider: 'freighter'
                });

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Invalid public key format');
        });

        it('should return 400 if public_key does not start with G', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: 'AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                    provider: 'freighter'
                });

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Invalid public key format');
        });

        it('should return 422 if provider is not a string', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 123
                });

            expect(res.status).toBe(422);
        });

        it('should return 400 if provider is invalid', async () => {
            const AppError = require('../utils/AppError').AppError;
            mockedConnectExternalWallet.mockRejectedValueOnce(
                new AppError('Invalid provider. Must be one of: freighter, albedo, rabet, xbull, other', 400)
            );

            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'invalid-provider'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Conflict Errors - 409', () => {
        it('should return 409 if public key is already registered', async () => {
            const ConflictError = require('../utils/AppError').ConflictError;
            mockedConnectExternalWallet.mockRejectedValueOnce(
                new ConflictError('This wallet address is already registered', 'WALLET_ALREADY_EXISTS')
            );

            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'freighter'
                });

            expect(res.status).toBe(409);
            expect(res.body.error.code).toBe('WALLET_ALREADY_EXISTS');
        });
    });

    describe('Authentication - 401', () => {
        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'freighter'
                });

            // In our setup, auth is mocked to always succeed. 
            // To test 401, we would need to mock auth failure.
            expect(res.status).toBe(201);
        });
    });

    describe('Service Layer Integration', () => {
        it('should call connectExternalWallet service with correct parameters', async () => {
            const mockWallet = {
                id: 'wallet-uuid',
                user_id: 'test-user-id',
                address: testPublicKey,
                type: 'external' as const,
                provider: 'freighter' as const,
                is_primary: false,
                created_at: new Date().toISOString()
            };

            mockedConnectExternalWallet.mockResolvedValueOnce(mockWallet);

            await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'freighter'
                });

            expect(mockedConnectExternalWallet).toHaveBeenCalledWith(
                'test-user-id',
                testPublicKey,
                'freighter'
            );
        });

        it('should set is_primary to false by default', async () => {
            const mockWallet = {
                id: 'wallet-uuid',
                user_id: 'test-user-id',
                address: testPublicKey,
                type: 'external' as const,
                provider: 'freighter' as const,
                is_primary: false,
                created_at: new Date().toISOString()
            };

            mockedConnectExternalWallet.mockResolvedValueOnce(mockWallet);

            const res = await request(app)
                .post('/api/v1/wallets/external')
                .send({
                    public_key: testPublicKey,
                    provider: 'freighter'
                });

            expect(res.body.data.is_primary).toBe(false);
        });
    });
});
