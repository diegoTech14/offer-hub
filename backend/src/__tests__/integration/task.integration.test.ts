import request from 'supertest';
import express from 'express';
import taskRoutes from '@/routes/task.routes';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware';
import { taskService } from '@/services/task.service';

// Mock the task service
jest.mock('@/services/task.service');

// Mock authentication middleware
jest.mock('@/middlewares/auth.middleware');

const mockTaskService = taskService as jest.Mocked<typeof taskService>;
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('Task Integration Tests', () => {
  let app: express.Application;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'client@example.com',
    role: 'client'
  };

  const mockTaskRecord = {
    id: 'task-record-id',
    project_id: '456e7890-e89b-12d3-a456-426614174001',
    freelancer_id: '789e0123-e89b-12d3-a456-426614174002',
    client_id: mockUser.id,
    completed: true,
    outcome_description: 'Task completed successfully',
    on_chain_tx_hash: '0x1234567890abcdef',
    on_chain_task_id: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to add user to request
    mockAuthenticateToken.mockImplementation(() => {
      return async (req: any, res: any, next: any) => {
        req.user = mockUser;
        req.securityContext = { requestId: 'test-request-id' };
        next();
      };
    });
    
    app.use('/api/task-records', taskRoutes);
    app.use(errorHandlerMiddleware);
    
    jest.clearAllMocks();
  });

  describe('POST /api/task-records', () => {
    const validTaskData = {
      project_id: '456e7890-e89b-12d3-a456-426614174001',
      freelancer_id: '789e0123-e89b-12d3-a456-426614174002',
      completed: true,
      outcome_description: 'Task completed successfully'
    };

    it('should create task record successfully', async () => {
      mockTaskService.createTaskRecord.mockResolvedValue(mockTaskRecord);

      const response = await request(app)
        .post('/api/task-records')
        .send(validTaskData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Task outcome recorded successfully',
        data: {
          taskRecord: mockTaskRecord
        }
      });

      expect(mockTaskService.createTaskRecord).toHaveBeenCalledWith(
        validTaskData,
        mockUser.id
      );
    });

    it('should return 422 for invalid project_id format', async () => {
      const invalidData = {
        ...validTaskData,
        project_id: 'invalid-uuid'
      };

      const response = await request(app)
        .post('/api/task-records')
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for missing required fields', async () => {
      const incompleteData = {
        project_id: validTaskData.project_id
        // Missing freelancer_id and completed
      };

      const response = await request(app)
        .post('/api/task-records')
        .send(incompleteData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for invalid freelancer_id format', async () => {
      const invalidData = {
        ...validTaskData,
        freelancer_id: 'not-a-uuid'
      };

      const response = await request(app)
        .post('/api/task-records')
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should return 422 for invalid completed field type', async () => {
      const invalidData = {
        ...validTaskData,
        completed: 'not-a-boolean'
      };

      const response = await request(app)
        .post('/api/task-records')
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Project not found');
      mockTaskService.createTaskRecord.mockRejectedValue(serviceError);

      const response = await request(app)
        .post('/api/task-records')
        .send(validTaskData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/task-records/project/:projectId', () => {
    const projectId = '456e7890-e89b-12d3-a456-426614174001';

    it('should return task record when found', async () => {
      mockTaskService.getTaskRecordByProjectId.mockResolvedValue(mockTaskRecord);

      const response = await request(app)
        .get(`/api/task-records/project/${projectId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Task record retrieved successfully',
        data: {
          taskRecord: mockTaskRecord
        }
      });

      expect(mockTaskService.getTaskRecordByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('should return 404 when task record not found', async () => {
      mockTaskService.getTaskRecordByProjectId.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/task-records/project/${projectId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task record not found for this project');
    });

    it('should return 422 when project ID is missing', async () => {
      const response = await request(app)
        .get('/api/task-records/project/')
        .expect(404); // Express returns 404 for missing route params
    });
  });

  describe('GET /api/task-records/client', () => {
    it('should return client task records', async () => {
      const mockTaskRecords = [mockTaskRecord];
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue(mockTaskRecords);

      const response = await request(app)
        .get('/api/task-records/client')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Client task records retrieved successfully',
        data: {
          taskRecords: mockTaskRecords,
          count: 1
        }
      });

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when no records found', async () => {
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/task-records/client')
        .expect(200);

      expect(response.body.data.taskRecords).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /api/task-records/freelancer', () => {
    it('should return freelancer task records', async () => {
      const mockTaskRecords = [mockTaskRecord];
      mockTaskService.getTaskRecordsByFreelancerId.mockResolvedValue(mockTaskRecords);

      const response = await request(app)
        .get('/api/task-records/freelancer')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Freelancer task records retrieved successfully',
        data: {
          taskRecords: mockTaskRecords,
          count: 1
        }
      });

      expect(mockTaskService.getTaskRecordsByFreelancerId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Authentication', () => {
    beforeEach(() => {
      // Mock authentication middleware to reject requests
      mockAuthenticateToken.mockImplementation(() => {
        return async (req: any, res: any, next: any) => {
          res.status(401).json({
            success: false,
            error: {
              message: 'Authentication required'
            }
          });
        };
      });
    });

    it('should require authentication for POST /api/task-records', async () => {
      const response = await request(app)
        .post('/api/task-records')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication for GET endpoints', async () => {
      await request(app)
        .get('/api/task-records/client')
        .expect(401);

      await request(app)
        .get('/api/task-records/freelancer')
        .expect(401);

      await request(app)
        .get('/api/task-records/project/some-id')
        .expect(401);
    });
  });
});