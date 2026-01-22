import { projectService } from '@/services/project.service';
import { supabase } from '@/lib/supabase/supabase';
import { ProjectPublicationService } from '@/blockchain/project-publication.service';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');
jest.mock('@/blockchain/project-publication.service');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const MockedProjectPublicationService = ProjectPublicationService as jest.MockedClass<
  typeof ProjectPublicationService
>;

describe('ProjectService - getProjectById', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProjectData = {
    id: mockProjectId,
    client_id: '456e7890-e89b-12d3-a456-426614174001',
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    subcategory: 'Web Development',
    budget: 1000,
    budget_type: 'fixed' as const,
    status: 'published' as const,
    visibility: 'public' as const,
    project_type: 'on-time' as const,
    experience_level: 'intermediate' as const,
    duration: '2 weeks',
    deadline: '2024-02-01T00:00:00Z',
    tags: ['javascript', 'react'],
    on_chain_transaction_hash: '0x1234567890abcdef',
    on_chain_id: 'project_123',
    version: 1,
    featured: false,
    priority: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    project_skills: [
      { skill_name: 'JavaScript' },
      { skill_name: 'React' },
      { skill_name: 'Node.js' }
    ]
  };

  const expectedProject = {
    ...mockProjectData,
    skills: ['JavaScript', 'React', 'Node.js']
  };
  const { project_skills: _, ...expectedProjectWithoutSkills } = expectedProject;

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
      expect(result).toEqual(expectedProjectWithoutSkills);
      expect(result?.skills).toEqual(['JavaScript', 'React', 'Node.js']);
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

describe('ProjectService - createProject', () => {
  const mockUser: any = {
    id: '456e7890-e89b-12d3-a456-426614174001',
    wallet_address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    role: 'client'
  };

  const createData = {
    title: 'New Project',
    description: 'Test description',
    category: 'Development',
    budget: 500,
    skills: ['TypeScript', 'Node.js', 'TypeScript'],
    tags: ['backend']
  };

  const mockProjectRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    client_id: mockUser.id,
    title: createData.title,
    description: createData.description,
    category: createData.category,
    subcategory: null,
    budget: createData.budget,
    budget_type: 'fixed',
    status: 'draft',
    visibility: 'public',
    project_type: 'on-time',
    experience_level: 'intermediate',
    duration: null,
    deadline: null,
    tags: createData.tags,
    on_chain_transaction_hash: null,
    on_chain_id: null,
    version: 1,
    featured: false,
    priority: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create project and store on-chain hash when blockchain succeeds', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProjectRow,
          error: null
        })
      })
    });
    const updateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    const skillsInsertMock = jest.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return { insert: insertMock, update: updateMock } as any;
      }
      if (table === 'project_skills') {
        return { insert: skillsInsertMock } as any;
      }
      return {} as any;
    });

    const mockRecord = jest.fn().mockResolvedValue({ transactionHash: 'tx-123', ledger: 1 });
    MockedProjectPublicationService.mockImplementation(() => ({
      recordProjectPublication: mockRecord
    }) as any);

    const result = await projectService.createProject(createData as any, mockUser);

    expect(insertMock).toHaveBeenCalled();
    expect(skillsInsertMock).toHaveBeenCalledWith([
      { project_id: mockProjectRow.id, skill_name: 'TypeScript' },
      { project_id: mockProjectRow.id, skill_name: 'Node.js' }
    ]);
    expect(updateMock).toHaveBeenCalledWith({ on_chain_transaction_hash: 'tx-123' });
    expect(result.on_chain_transaction_hash).toBe('tx-123');
    expect(result.skills).toEqual(['TypeScript', 'Node.js']);
  });

  it('should continue when blockchain registration fails', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProjectRow,
          error: null
        })
      })
    });
    const updateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    const skillsInsertMock = jest.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return { insert: insertMock, update: updateMock } as any;
      }
      if (table === 'project_skills') {
        return { insert: skillsInsertMock } as any;
      }
      return {} as any;
    });

    MockedProjectPublicationService.mockImplementation(() => ({
      recordProjectPublication: jest.fn().mockRejectedValue(new Error('Chain error'))
    }) as any);

    const result = await projectService.createProject(createData as any, mockUser);

    expect(result.on_chain_transaction_hash).toBeFalsy();
    expect(updateMock).not.toHaveBeenCalled();
  });
});
