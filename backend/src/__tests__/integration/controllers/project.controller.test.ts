import { createProjectHandler, getProjectHandler, listProjectsHandler } from '@/controllers/project.controller';
import { projectService } from '@/services/project.service';
import { ProjectStatus, BudgetType, ProjectType, ExperienceLevel, ProjectVisibility } from '@/types/project.types';
import { UserRole } from '@/types/auth.types';

// Mock the project service
jest.mock('@/services/project.service');
jest.mock('@/services/escrow.service');
const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('Project Controller - getProjectHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProject = {
    id: mockProjectId,
    clientId: '456e7890-e89b-12d3-a456-426614174001',
    freelancerId: null,
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    subcategory: 'Web Development',
    budget: 1000,
    budgetType: 'fixed' as BudgetType,
    currency: 'XLM',
    status: ProjectStatus.OPEN,
    visibility: 'public' as ProjectVisibility,
    projectType: 'on-time' as ProjectType,
    experienceLevel: 'intermediate' as ExperienceLevel,
    duration: '2 weeks',
    deadline: '2024-02-01T00:00:00Z',
    onChainTxHash: '0x1234567890abcdef',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    skills: ['JavaScript', 'React', 'Node.js'],
    tags: ['javascript', 'react']
  };

  beforeEach(() => {
    mockReq = {
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 404 if projectId is missing', async () => {
      mockReq.params = {};
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project ID is required',
          statusCode: 404
        })
      );
    });

    it('should return 404 if projectId is invalid UUID', async () => {
      mockReq.params = { projectId: 'invalid-uuid' };
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid project ID format',
          statusCode: 404
        })
      );
    });

    it('should validate UUID format correctly', async () => {
      mockReq.params = { projectId: mockProjectId };
      mockProjectService.getProjectById.mockResolvedValue(mockProject);
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
    });
  });

  describe('Successful Project Retrieval', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return 200 with project data when project exists', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Project retrieved successfully',
          data: mockProject
        })
      );
    });
  });

  describe('Project Not Found', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return 404 when project does not exist', async () => {
      mockProjectService.getProjectById.mockResolvedValue(null);
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project not found',
          statusCode: 404
        })
      );
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      mockProjectService.getProjectById.mockRejectedValue(serviceError);
      await getProjectHandler(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});

describe('Project Controller - listProjectsHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockProjects = [
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      clientId: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Mobile App Development',
      description: 'Create a mobile app for iOS and Android',
      category: 'Development',
      subcategory: 'Mobile Development',
      budget: 8000,
      budgetType: 'fixed',
      currency: 'XLM',
      status: ProjectStatus.OPEN,
      visibility: 'public',
      projectType: 'on-time',
      experienceLevel: 'expert',
      duration: '4 months',
      deadline: '2024-07-01T00:00:00Z',
      tags: ['mobile', 'ios', 'android'],
      onChainTxHash: '0xabc',
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
      skills: ['Swift', 'Kotlin', 'React Native']
    }
  ] as any[];

  beforeEach(() => {
    mockReq = {
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Default Pagination', () => {
    it('should return projects with default pagination', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 1
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        status: undefined,
        category: undefined,
        minBudget: undefined,
        maxBudget: undefined
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProjects,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 1,
            per_page: 20
          }
        })
      );
    });
  });

  describe('Custom Pagination', () => {
    it('should accept custom page and limit parameters', async () => {
      mockReq.query = { page: '2', limit: '10' };
      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 1
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: undefined,
        status: undefined,
        category: undefined,
        minBudget: undefined,
        maxBudget: undefined
      });
    });
  });
});

describe('Project Controller - createProjectHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockUser = {
    id: '456e7890-e89b-12d3-a456-426614174001',
    role: UserRole.CLIENT,
    wallet_address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  };

  const createPayload = {
    title: 'New Project',
    description: 'A new project description',
    category: 'Development',
    budget: 1000,
    skills: ['TypeScript']
  };

  const createdProject = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    clientId: mockUser.id,
    title: createPayload.title,
    description: createPayload.description,
    category: createPayload.category,
    budget: createPayload.budget,
    budgetType: 'fixed',
    status: ProjectStatus.DRAFT,
    visibility: 'public',
    projectType: 'on-time',
    experienceLevel: 'intermediate',
    tags: [],
    onChainTxHash: 'tx-123',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    skills: ['TypeScript']
  };

  beforeEach(() => {
    mockReq = {
      body: {},
      user: mockUser
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 403 when user is not a client', async () => {
    mockReq.user = { ...mockUser, role: UserRole.FREELANCER };
    mockReq.body = createPayload;
    await createProjectHandler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Only clients can create projects',
        statusCode: 403
      })
    );
  });

  it('should return 400 on invalid payload', async () => {
    mockReq.body = { title: '', description: 'Missing category', budget: 100 };
    await createProjectHandler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid project data',
        statusCode: 400
      })
    );
  });

  it('should return 201 with created project', async () => {
    mockReq.body = createPayload;
    mockProjectService.createProject.mockResolvedValue(createdProject as any);

    await createProjectHandler(mockReq, mockRes, mockNext);

    expect(mockProjectService.createProject).toHaveBeenCalledWith(
      expect.objectContaining(createPayload),
      mockUser
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Project created successfully',
        data: createdProject
      })
    );
  });
});
