import request from 'supertest';
import express from 'express';

// Mock auth middleware before importing it to prevent Supabase initialization
jest.mock('../middlewares/auth.middleware', () => ({
    authenticateToken: () => (req: any, res: any, next: any) => {
        req.user = { id: 'test-user-id' }; // Mock user
        next();
    }
}));

import escrowInitRoutes from '../routes/escrow-init.routes';
import { ErrorHandler } from '../utils/AppError';
import axios from 'axios';
import { authenticateToken } from '../middlewares/auth.middleware';


// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isAxiosError.mockImplementation((payload) => payload.isAxiosError === true);

const app = express();
app.use(express.json());
app.use('/api/escrows', authenticateToken(), escrowInitRoutes);
app.use(ErrorHandler);

describe('POST /api/escrows/single-release/initialize', () => {
    const validData = {
        client: "0".repeat(56), // Valid 56 char string
        freelancer: "1".repeat(56), // Valid 56 char string
        amount: 100,
        deadline: 1234567890
    };

    beforeEach(() => {
        process.env.TRUSTLESSWORK_API_KEY = 'test-key';
        process.env.TRUSTLESSWORK_API_URL = 'https://api.test.com';
        jest.clearAllMocks();
    });

    it('should return unsignedTransaction on success', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { unsignedTransaction: 'test-transaction-string' }
        });

        const res = await request(app)
            .post('/api/escrows/single-release/initialize')
            .send(validData);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ unsignedTransaction: 'test-transaction-string' });
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.test.com/deployer/single-release',
            validData,
            { headers: { 'x-api-key': 'test-key' } }
        );
    });

    it('should return 422 on validation error (invalid amounts)', async () => {
        const res = await request(app)
            .post('/api/escrows/single-release/initialize')
            .send({ ...validData, amount: -10 });

        expect(res.status).toBe(422);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 on validation error (invalid addresses)', async () => {
        const res = await request(app)
            .post('/api/escrows/single-release/initialize')
            .send({ ...validData, client: 'short' });

        expect(res.status).toBe(422);
    });

    it('should return 500 if API Key is missing', async () => {
        delete process.env.TRUSTLESSWORK_API_KEY;

        // We need to re-import or handle env change if controller caches it. 
        // Controller reads env on each request, so it should be fine.

        const res = await request(app)
            .post('/api/escrows/single-release/initialize')
            .send(validData);

        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Missing TrustlessWork API Key');
    });

    it('should handle external API errors', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 400,
                data: { message: 'Contract error', details: 'Some details' }
            }
        });

        const res = await request(app)
            .post('/api/escrows/single-release/initialize')
            .send(validData);

        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe('Contract error');
    });
});
