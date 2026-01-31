import { projectService } from '@/services/project.service';
import { supabase } from '@/lib/supabase/supabase';
import { ProjectPublicationService } from '@/blockchain/project-publication.service';
import { ProjectStatus } from '@/types/project.types';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');
jest.mock('@/blockchain/project-publication.service');
jest.mock('@/services/escrow.service');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const MockedProjectPublicationService = ProjectPublicationService as jest.MockedClass<
  typeof ProjectPublicationService
>;

describe('ProjectService - getProjectById', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProjectData = {
    id: mockProjectId,
    client_id: '456e7890-e89b-12d3-a456-426614174001',
    freelancer_id: null,
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    subcategory: 'Web Development',
    budget_amount: 1000,
    budget_type: 'fixed',
    currency: 'XLM',
    status: 'open',
    visibility: 'public',
    project_type: 'on-time',
    experience_level: 'intermediate',
    duration: '2 weeks',
    deadline: '2024-02-01T00:00:00Z',
    tags: ['javascript', 'react'],
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
    subcategory: mockProjectData.subcategory,
    budget: mockProjectData.budget_amount,
    budgetType: mockProjectData.budget_type,
    currency: mockProjectData.currency,
    status: mockProjectData.status,
    visibility: mockProjectData.visibility,
    projectType: mockProjectData.project_type,
    experienceLevel: mockProjectData.experience_level,
    duration: mockProjectData.duration,
    deadline: mockProjectData.deadline,
    tags: mockProjectData.tags,
    onChainTxHash: mockProjectData.on_chain_tx_hash,
    createdAt: mockProjectData.created_at,
    updatedAt: mockProjectData.updated_at,
    skills: ['JavaScript', 'React', 'Node.js'],
    publishedAt: undefined,
    archivedAt: undefined,
    deletedAt: undefined
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
  });

  describe('Project not found', () => {
    it('should return null when project does not exist', async () => {
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
  });
});

describe('ProjectService - listProjects', () => {
  // Keeping Upstream tests for listProjects as is, assuming they are compatible with the merged service
  const mockProjectsData = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      client_id: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Web Development Project',
      description: 'Build a modern web application',
      category: 'Development',
      subcategory: 'Web Development',
      budget_amount: 5000, // DB column
      budget_type: 'fixed',
      status: 'open',
      visibility: 'public',
      project_type: 'on-time',
      experience_level: 'intermediate',
      duration: '3 months',
      deadline: '2024-06-01T00:00:00Z',
      tags: ['javascript', 'react'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      project_skills: [
        { skill_name: 'JavaScript' },
        { skill_name: 'React' },
        { skill_name: 'Node.js' }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return projects with default pagination', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockProjectsData,
        error: null,
        count: 1
      })
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const result = await projectService.listProjects({});

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].budget).toBe(5000); // Mapped
    expect(result.projects[0].skills).toEqual(['JavaScript', 'React', 'Node.js']);
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
    skills: ['TypeScript', 'Node.js'],
    tags: ['backend']
  };

  const mockProjectRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    client_id: mockUser.id,
    title: createData.title,
    description: createData.description,
    category: createData.category,
    subcategory: null,
    budget_amount: createData.budget,
    budget_type: 'fixed',
    status: 'draft',
    visibility: 'public',
    project_type: 'on-time',
    experience_level: 'intermediate',
    duration: null,
    deadline: null,
    tags: createData.tags,
    on_chain_tx_hash: null, // DB uses this
    on_chain_id: null,
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
      // This update call returns void/error, not data, traditionally. Or we don't await data.
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
    // Validate insert payload keys if needed, but integration test coverage is better for that.

    expect(skillsInsertMock).toHaveBeenCalledWith([
      { project_id: mockProjectRow.id, skill_name: 'TypeScript' },
      { project_id: mockProjectRow.id, skill_name: 'Node.js' }
    ]);
    expect(updateMock).toHaveBeenCalledWith({ on_chain_tx_hash: 'tx-123' }); // ProjectService now uses on_chain_tx_hash

    // Result should be CamelCase
    expect(result.onChainTxHash).toBe('tx-123'); // Mapped
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

    expect(result.onChainTxHash).toBeFalsy();
    expect(updateMock).not.toHaveBeenCalled();
  });
});
