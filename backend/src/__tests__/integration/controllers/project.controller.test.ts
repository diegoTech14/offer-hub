import { getProjectHandler } from '@/controllers/project.controller';
import { projectService } from '@/services/project.service';

// Mock the project service
jest.mock('@/services/project.service');
const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('Project Controller - getProjectHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProject = {
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
    skills: ['JavaScript', 'React', 'Node.js']
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
      // Test valid UUID
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

    it('should return project with all required fields', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(mockProject);
      expect(responseData.id).toBe(mockProjectId);
      expect(responseData.skills).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(responseData.on_chain_transaction_hash).toBe('0x1234567890abcdef');
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

    it('should not call res.json when project is not found', async () => {
      mockProjectService.getProjectById.mockResolvedValue(null);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should call projectService.getProjectById with correct ID', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.getProjectById).toHaveBeenCalledTimes(1);
      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      mockProjectService.getProjectById.mockRejectedValue(serviceError);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return standardized API response format', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Project retrieved successfully');
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual(mockProject);
    });

    it('should include timestamp in response', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveProperty('timestamp');
      expect(typeof response.timestamp).toBe('string');
    });
  });
});