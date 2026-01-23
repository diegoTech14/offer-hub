import request from 'supertest';
import express from 'express';
import axios from 'axios';

// Mock auth middleware before importing it to prevent Supabase initialization
jest.mock('../middlewares/auth.middleware', () => ({
    authenticateToken: () => (req: any, res: any, next: any) => {
        req.user = { id: 'test-user-id' }; // Mock user
        next();
    }
}));

import escrowQueryRoutes from '../routes/escrow-query.routes';
import { ErrorHandler } from '../utils/AppError';
import { authenticateToken } from '../middlewares/auth.middleware';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isAxiosError.mockImplementation((payload) => payload.isAxiosError === true);

const app = express();
app.use(express.json());
app.use('/api/escrows', authenticateToken(), escrowQueryRoutes);
app.use(ErrorHandler);

describe('GET /api/escrows/by-role', () => {
    const validAddress = "G" + "0".repeat(55);
    
    beforeEach(() => {
        process.env.TRUSTLESSWORK_API_KEY = 'test-key';
        process.env.TRUSTLESSWORK_API_URL = 'https://api.test.com';
        jest.clearAllMocks();
    });

    it('should return list of escrows on success', async () => {
        const mockEscrows = [{ id: 'escrow-1', title: 'Escrow 1' }];
        mockedAxios.get.mockResolvedValueOnce({
            data: mockEscrows
        });

        const res = await request(app)
            .get(`/api/escrows/by-role?role=client&roleAddress=${validAddress}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockEscrows);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://api.test.com/helper/get-escrows-by-role',
            {
                params: { role: 'client', roleAddress: validAddress },
                headers: { 'x-api-key': 'test-key' }
            }
        );
    });

    it('should return 422 on validation error (invalid role)', async () => {
        const res = await request(app)
            .get(`/api/escrows/by-role?role=invalid&roleAddress=${validAddress}`);

        expect(res.status).toBe(422);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 on validation error (invalid address)', async () => {
        const res = await request(app)
            .get(`/api/escrows/by-role?role=client&roleAddress=short`);

        expect(res.status).toBe(422);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 if API Key is missing', async () => {
        delete process.env.TRUSTLESSWORK_API_KEY;

        const res = await request(app)
            .get(`/api/escrows/by-role?role=client&roleAddress=${validAddress}`);

        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Missing TrustlessWork API Key');
    });

    it('should handle external API errors', async () => {
        mockedAxios.get.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 404,
                data: { message: 'Not found' }
            }
        });

        const res = await request(app)
            .get(`/api/escrows/by-role?role=client&roleAddress=${validAddress}`);

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Not found');
    });
});
