import { InternalServerError } from '@/utils/AppError';

// Mock dependencies before importing the service
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../user.service', () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

jest.mock('../escrow.service', () => ({
  escrowService: {
    createEscrow: jest.fn(),
  },
}));

// Import after mocks
import { assignFreelancer } from '../project.service';
import { supabase } from '@/lib/supabase/supabase';
import { userService } from '../user.service';
import { escrowService } from '../escrow.service';

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;
const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedEscrowService = escrowService as jest.Mocked<typeof escrowService>;

describe('assignFreelancer', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';
  const mockFreelancerId = '987fcdeb-51a2-43d7-8f9e-123456789abc';
  const mockClientId = '11111111-1111-1111-1111-111111111111';

  const mockProject = {
    id: mockProjectId,
    client_id: mockClientId,
    status: 'open',
    budget: 1000,
    title: 'Test Project',
    description: 'Test Description',
  };

  const mockFreelancer = {
    id: mockFreelancerId,
    wallet_address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUV',
    is_freelancer: true,
    username: 'freelancer1',
    name: 'Freelancer One',
    email: 'freelancer@example.com',
  };

  const mockClient = {
    id: mockClientId,
    wallet_address: 'GZYXWVUTSRQPONMLKJIHGFEDCBA0987654321ZYXWVUTSRQPONMLKJIHGFED',
    is_freelancer: false,
    username: 'client1',
    name: 'Client One',
    email: 'client@example.com',
  };

  const mockEscrowAddress = 'GESCROWADDRESS1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Logic', () => {
    it('should return 404 when project is not found', async () => {
      // Mock supabase to return error (project not found)
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Project not found' },
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe('Project_not_found');
    });

    it('should return 400 when project status is not "open"', async () => {
      const projectWithInvalidStatus = {
        ...mockProject,
        status: 'in_progress',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithInvalidStatus,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Project_must_be_open_to_assign_freelancer');
    });

    it('should return 403 when client is not the project owner', async () => {
      const projectWithDifferentClient = {
        ...mockProject,
        client_id: '99999999-9999-9999-9999-999999999999',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithDifferentClient,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.message).toBe('Unauthorized_client');
    });

    it('should return 404 when freelancer is not found', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      // Mock userService to return null (freelancer not found)
      mockedUserService.getUserById = jest.fn().mockResolvedValue(null);

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe('Freelancer_not_found');
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(mockFreelancerId);
    });

    it('should return 400 when user is not a freelancer', async () => {
      const nonFreelancer = {
        ...mockFreelancer,
        is_freelancer: false,
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(nonFreelancer); // First call for freelancer

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('User_is_not_a_freelancer');
    });

    it('should return 400 when freelancer and client are the same user', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      // Mock userService to return freelancer (same as client)
      mockedUserService.getUserById = jest.fn().mockResolvedValue(mockFreelancer);

      // Use same ID for freelancer and client
      const result = await assignFreelancer(mockProjectId, mockClientId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Freelancer_and_client_cannot_be_the_same_user');
    });

    it('should return 500 when client wallet address is not found', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      const clientWithoutWallet = {
        ...mockClient,
        wallet_address: null,
      };

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(mockFreelancer) // First call for freelancer
        .mockResolvedValueOnce(clientWithoutWallet); // Second call for client

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Client_wallet_address_not_found');
    });

    it('should return 500 when freelancer wallet address is not found', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      const freelancerWithoutWallet = {
        ...mockFreelancer,
        wallet_address: null,
      };

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(freelancerWithoutWallet) // First call for freelancer
        .mockResolvedValueOnce(mockClient); // Second call for client (with wallet)

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Freelancer_wallet_address_not_found');
    });
  });

  describe('Successful Assignment Flow', () => {
    it('should successfully assign freelancer and create escrow', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({
                // First call: fetch project
                data: mockProject,
                error: null,
              })
              .mockResolvedValueOnce({
                // Second call: update project
                data: {
                  ...mockProject,
                  freelancer_id: mockFreelancerId,
                  escrow_address: mockEscrowAddress,
                  status: 'in_progress',
                },
                error: null,
              }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  ...mockProject,
                  freelancer_id: mockFreelancerId,
                  escrow_address: mockEscrowAddress,
                  status: 'in_progress',
                },
                error: null,
              }),
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(mockFreelancer) // First call for freelancer
        .mockResolvedValueOnce(mockClient); // Second call for client

      mockedEscrowService.createEscrow = jest.fn().mockResolvedValue(mockEscrowAddress);

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('Freelancer_assigned_successfully');
      expect(result.data).toMatchObject({
        freelancer_id: mockFreelancerId,
        escrow_address: mockEscrowAddress,
        status: 'in_progress',
      });

      // Verify escrow service was called with correct parameters
      expect(mockedEscrowService.createEscrow).toHaveBeenCalledWith({
        clientAddress: mockClient.wallet_address,
        freelancerAddress: mockFreelancer.wallet_address,
        amount: mockProject.budget,
        projectId: mockProjectId,
      });
    });
  });

  describe('Escrow Creation Failure', () => {
    it('should return 500 when escrow creation fails and not update project', async () => {
      const mockUpdate = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
        update: mockUpdate,
      });
      mockedSupabase.from = mockFrom as any;

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(mockFreelancer)
        .mockResolvedValueOnce(mockClient);

      // Mock escrow service to throw error
      const escrowError = new InternalServerError('Escrow creation failed');
      mockedEscrowService.createEscrow = jest.fn().mockRejectedValue(escrowError);

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      // The error message can be either the InternalServerError message or the default
      expect(result.message).toMatch(/Escrow.*failed/i);

      // Verify project was NOT updated (check that update was not called)
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return 500 when project update fails after escrow creation', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });
      mockedSupabase.from = mockFrom as any;

      mockedUserService.getUserById = jest.fn()
        .mockResolvedValueOnce(mockFreelancer)
        .mockResolvedValueOnce(mockClient);

      mockedEscrowService.createEscrow = jest.fn().mockResolvedValue(mockEscrowAddress);

      const result = await assignFreelancer(mockProjectId, mockFreelancerId, mockClientId);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Failed_to_update_project_after_escrow_creation');
    });
  });
});
