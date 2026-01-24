import {
    disconnectWallet,
    getWalletById,
    getWalletsByUserId,
    deleteWallet
} from '@/services/wallet.service';
import { supabase } from '@/lib/supabase/supabase';
import { AppError } from '@/utils/AppError';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('WalletService - disconnectWallet', () => {
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    const mockWalletId = '456e7890-e89b-12d3-a456-426614174001';
    const mockOtherUserId = '789e0123-e89b-12d3-a456-426614174002';

    const mockExternalWallet = {
        id: mockWalletId,
        user_id: mockUserId,
        address: 'GEXTERNALWALLET123456789',
        type: 'external' as const,
        created_at: '2024-01-15T10:00:00Z',
    };

    const mockInvisibleWallet = {
        id: mockWalletId,
        user_id: mockUserId,
        address: 'GINVISIBLEWALLET123456789',
        type: 'invisible' as const,
        encrypted_private_key: 'encrypted_key_here',
        created_at: '2024-01-14T10:00:00Z',
    };

    const mockSecondWallet = {
        id: '111e2222-e89b-12d3-a456-426614174003',
        user_id: mockUserId,
        address: 'GSECONDWALLET123456789',
        type: 'external' as const,
        created_at: '2024-01-16T10:00:00Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Successful wallet disconnection', () => {
        it('should successfully disconnect an external wallet when user has multiple wallets', async () => {
            // Mock getWalletById
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockExternalWallet,
                            error: null,
                        }),
                    }),
                }),
            } as any);

            // Mock getWalletsByUserId
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [mockExternalWallet, mockSecondWallet],
                        error: null,
                    }),
                }),
            } as any);

            // Mock deleteWallet
            mockSupabase.from.mockReturnValueOnce({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).resolves.not.toThrow();
        });
    });

    describe('Wallet not found', () => {
        it('should throw 404 when wallet does not exist', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'PGRST116', message: 'No rows found' },
                        }),
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).rejects.toThrow(
                expect.objectContaining({
                    message: 'Wallet not found',
                    statusCode: 404,
                })
            );
        });
    });

    describe('Ownership validation', () => {
        it('should throw 403 when wallet belongs to another user', async () => {
            const walletBelongingToOtherUser = {
                ...mockExternalWallet,
                user_id: mockOtherUserId,
            };

            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: walletBelongingToOtherUser,
                            error: null,
                        }),
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).rejects.toThrow(
                expect.objectContaining({
                    message: 'You do not have permission to disconnect this wallet',
                    statusCode: 403,
                })
            );
        });
    });

    describe('Wallet type validation', () => {
        it('should throw 400 when trying to delete invisible wallet', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockInvisibleWallet,
                            error: null,
                        }),
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).rejects.toThrow(
                expect.objectContaining({
                    message: 'Cannot disconnect system-generated invisible wallets',
                    statusCode: 400,
                })
            );
        });
    });

    describe('Last wallet validation', () => {
        it('should throw 400 when trying to delete the only wallet', async () => {
            // Mock getWalletById
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockExternalWallet,
                            error: null,
                        }),
                    }),
                }),
            } as any);

            // Mock getWalletsByUserId - only one wallet
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [mockExternalWallet],
                        error: null,
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).rejects.toThrow(
                expect.objectContaining({
                    message: 'Cannot disconnect your only wallet. You must have at least one wallet.',
                    statusCode: 400,
                })
            );
        });
    });

    describe('Primary wallet handling', () => {
        it('should successfully delete primary wallet when user has other wallets', async () => {
            const primaryWallet = {
                ...mockExternalWallet,
                created_at: '2024-01-10T10:00:00Z', // Earlier date = primary
            };

            // Mock getWalletById
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: primaryWallet,
                            error: null,
                        }),
                    }),
                }),
            } as any);

            // Mock getWalletsByUserId
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [primaryWallet, mockSecondWallet],
                        error: null,
                    }),
                }),
            } as any);

            // Mock deleteWallet
            mockSupabase.from.mockReturnValueOnce({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            } as any);

            await expect(disconnectWallet(mockWalletId, mockUserId)).resolves.not.toThrow();
        });
    });
});

describe('WalletService - getWalletById', () => {
    const mockWalletId = '456e7890-e89b-12d3-a456-426614174001';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return wallet when found', async () => {
        const mockWallet = {
            id: mockWalletId,
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            address: 'GWALLET123456789',
            type: 'external',
            created_at: '2024-01-15T10:00:00Z',
        };

        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockWallet,
                        error: null,
                    }),
                }),
            }),
        } as any);

        const result = await getWalletById(mockWalletId);
        expect(result).toEqual(mockWallet);
    });

    it('should return null when wallet not found', async () => {
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { code: 'PGRST116', message: 'No rows found' },
                    }),
                }),
            }),
        } as any);

        const result = await getWalletById(mockWalletId);
        expect(result).toBeNull();
    });
});
