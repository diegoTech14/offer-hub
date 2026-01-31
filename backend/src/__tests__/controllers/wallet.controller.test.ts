/**
 * @fileoverview Tests for wallet controller list handler
 */

import { Request, Response, NextFunction } from 'express';
import { getWalletsHandler } from '@/controllers/wallet.controller';
import * as walletService from '@/services/wallet.service';
import { AppError } from '@/utils/AppError';

jest.mock('@/services/wallet.service');

describe('Wallet Controller - getWalletsHandler', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      user: { id: 'user-123' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and list of wallets ordered correctly', async () => {
    const wallets = [
      {
        id: 'uuid-1',
        address: 'GINVISIBLE1',
        type: 'invisible',
        provider: null,
        is_primary: true,
        created_at: '2024-01-01T00:00:00Z',
        user_id: 'user-123',
      },
      {
        id: 'uuid-2',
        address: 'GEXTERNAL2',
        type: 'external',
        provider: 'freighter',
        is_primary: false,
        created_at: '2024-01-10T15:30:00Z',
        user_id: 'user-123',
      },
      {
        id: 'uuid-3',
        address: 'GEXTERNAL3',
        type: 'external',
        provider: 'albedo',
        is_primary: false,
        created_at: '2024-02-01T10:00:00Z',
        user_id: 'user-123',
      },
    ];

    (walletService.getWalletsByUserId as jest.Mock).mockResolvedValue(wallets);

    await getWalletsHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);

    const expectedData = [
      // primary first
      {
        id: 'uuid-1',
        public_key: 'GINVISIBLE1',
        type: 'invisible',
        provider: 'internal',
        is_primary: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      // then by created_at desc among non-primary
      {
        id: 'uuid-3',
        public_key: 'GEXTERNAL3',
        type: 'external',
        provider: 'albedo',
        is_primary: false,
        created_at: '2024-02-01T10:00:00Z',
      },
      {
        id: 'uuid-2',
        public_key: 'GEXTERNAL2',
        type: 'external',
        provider: 'freighter',
        is_primary: false,
        created_at: '2024-01-10T15:30:00Z',
      },
    ];

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expectedData,
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next with AppError when user is not authenticated', async () => {
    mockRequest.user = undefined;

    await getWalletsHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
    const err = (mockNext as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
  });
});
