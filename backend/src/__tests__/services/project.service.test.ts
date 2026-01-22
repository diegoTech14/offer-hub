import { projectService } from '@/services/project.service';
import { supabase } from '@/lib/supabase/supabase';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ProjectService - getProjectById', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProjectData = {
    id: mockProjectId,
    client_id: '456e7890-e89b-12d3-a456-426614174001',
    freelancer_id: null,
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    budget_amount: 1000,
    currency: 'XLM',
    status: 'open' as const,
    deadline: '2024-02-01T00:00:00Z',
    on_chain_tx_hash: '0x1234567890abcdef',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    project_skills: [
      { skill_name: 'JavaScript' },
      { skill_name: 'React' },
      { skill_name: 'Node.js' }
    ]
  };

  const expectedProject = {
    id: mockProjectId,
    clientId: mockProjectData.client_id,
    freelancerId: null,
    title: mockProjectData.title,
    description: mockProjectData.description,
    category: mockProjectData.category,
    budgetAmount: mockProjectData.budget_amount,
    currency: mockProjectData.currency,
    status: mockProjectData.status,
    deadline: mockProjectData.deadline,
    onChainTxHash: mockProjectData.on_chain_tx_hash,
    createdAt: mockProjectData.created_at,
    updatedAt: mockProjectData.updated_at,
    skills: ['JavaScript', 'React', 'Node.js']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful project retrieval', () => {
    it('should return project with skills when project exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(result).toEqual(expectedProject);
    });

    it('should return project with empty skills array when no skills exist', async () => {
      const projectWithoutSkills = {
        ...mockProjectData,
        project_skills: []
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithoutSkills,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result?.skills).toEqual([]);
    });

    it('should return project with empty skills array when project_skills is null', async () => {
      const projectWithoutSkills = {
        ...mockProjectData,
        project_skills: null
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithoutSkills,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result?.skills).toEqual([]);
    });
  });

  describe('Project not found', () => {
    it('should return null when project does not exist (PGRST116)', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result).toBeNull();
    });

    it('should return null when data is null', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result).toBeNull();
    });
  });

  describe('Database errors', () => {
    it('should throw error on database connection issues', async () => {
      const dbError = new Error('Database connection failed');
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: dbError
            })
          })
        })
      } as any);

      await expect(projectService.getProjectById(mockProjectId))
        .rejects
        .toThrow('Database error: Database connection failed');
    });

    it('should throw error on unexpected database errors', async () => {
      const unexpectedError = { code: 'UNKNOWN', message: 'Unexpected error' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: unexpectedError
            })
          })
        })
      } as any);

      await expect(projectService.getProjectById(mockProjectId))
        .rejects
        .toThrow('Database error: Unexpected error');
    });
  });

  describe('Query structure', () => {
    it('should query the correct table and fields', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null
            })
          })
        })
      } as any);

      await projectService.getProjectById(mockProjectId);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      // Verify the select includes project_skills relation
      const mockSelect = mockSupabase.from('projects').select;
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        project_skills(skill_name)
      `);
    });

    it('should filter by the correct project ID', async () => {
      const mockEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProjectData,
          error: null
        })
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq
        })
      } as any);

      await projectService.getProjectById(mockProjectId);

      expect(mockEq).toHaveBeenCalledWith('id', mockProjectId);
    });
  });
});