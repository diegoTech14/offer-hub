import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { UpdateProjectResult } from '@/types/project.type';

// Mock supabase before importing project.service
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

// Mock escrow service to avoid stellar-sdk dependency
jest.mock('@/services/escrow.service', () => ({
  escrowService: {
    createEscrow: jest.fn(),
  },
}));

// Mock user service
jest.mock('@/services/user.service', () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

// Mock auth middleware
jest.mock('@/middlewares/auth.middleware', () => ({
  verifyToken: (_req: Request, _res: Response, next: NextFunction) => {
    (_req as any).user = { id: 'test-user-id', role: 'client' };
    next();
  },
  authorizeRoles: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

// Mock the service module
jest.mock('@/services/project.service', () => ({
  updateProject: jest.fn(),
  createProject: jest.fn(),
  getAllProjects: jest.fn(),
  getProjectById: jest.fn(),
  deleteProject: jest.fn(),
  isValidStatusTransition: jest.fn(),
  hasFreelancerAssigned: jest.fn(),
}));

// Import AFTER mocks
import projectRoutes from '@/routes/project.routes';
import * as projectService from '@/services/project.service';
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware';

const mockedUpdateProject = projectService.updateProject as jest.MockedFunction<typeof projectService.updateProject>;

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);
app.use(errorHandlerMiddleware);

describe('PATCH /api/projects/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success scenarios', () => {
    it('should return 200 when project is updated successfully', async () => {
      const mockProject = {
        id: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        client_id: 'test-user-id',
        title: 'Updated Project',
        description: 'Updated description',
        category: 'web',
        budget: 1000,
        status: 'open',
        freelancer_id: null,
        on_chain_tx_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockedUpdateProject.mockResolvedValue({
        success: true,
        status: 200,
        data: mockProject,
      } as UpdateProjectResult);

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ title: 'Updated Project', description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', 'Updated Project');
      expect(mockedUpdateProject).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        { title: 'Updated Project', description: 'Updated description' },
        'test-user-id'
      );
    });

    it('should allow updating status from open to in_progress', async () => {
      const mockProject = {
        id: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        client_id: 'test-user-id',
        title: 'Project',
        description: 'Description',
        category: 'web',
        budget: 1000,
        status: 'in_progress',
        freelancer_id: null,
        on_chain_tx_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockedUpdateProject.mockResolvedValue({
        success: true,
        status: 200,
        data: mockProject,
      } as UpdateProjectResult);

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('status', 'in_progress');
    });
  });

  describe('Error scenarios', () => {
    it('should return 400 for invalid project ID format', async () => {
      const res = await request(app)
        .patch('/api/projects/invalid-uuid')
        .send({ title: 'Updated Project' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(mockedUpdateProject).not.toHaveBeenCalled();
    });

    it('should return 404 when project is not found', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 404,
        message: 'Project not found',
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ title: 'Updated Project' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 403 when user is not the project owner', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 403,
        message: 'Only the project owner can update this project',
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ title: 'Updated Project' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 when project status does not allow updates', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 400,
        message: "Cannot update project with status 'completed'. Updates only allowed when status is 'open' or 'in_progress'",
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ title: 'Updated Project' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 when trying invalid status transition', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 400,
        message: "Invalid status transition from 'open' to 'completed'. Allowed transitions: in_progress, cancelled",
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ status: 'completed' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 when trying to modify budget with freelancer assigned', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 400,
        message: 'Budget cannot be modified once a freelancer is assigned to the project',
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ budget: 2000 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 when no valid fields to update', async () => {
      mockedUpdateProject.mockResolvedValue({
        success: false,
        status: 400,
        message: 'No valid fields to update',
      });

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({ client_id: 'another-user-id' }); // Protected field

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('Protected fields', () => {
    it('should not allow modification of client_id, id, or on_chain_tx_hash', async () => {
      const mockProject = {
        id: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        client_id: 'test-user-id',
        title: 'Updated Title',
        description: 'Description',
        category: 'web',
        budget: 1000,
        status: 'open',
        freelancer_id: null,
        on_chain_tx_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockedUpdateProject.mockResolvedValue({
        success: true,
        status: 200,
        data: mockProject,
      } as UpdateProjectResult);

      const res = await request(app)
        .patch('/api/projects/a1b2c3d4-e5f6-4890-abcd-ef1234567890')
        .send({
          title: 'Updated Title',
          client_id: 'malicious-id',
          id: 'malicious-id',
          on_chain_tx_hash: 'malicious-hash',
        });

      expect(res.status).toBe(200);
      // The service should filter out protected fields
      expect(mockedUpdateProject).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        expect.objectContaining({ title: 'Updated Title' }),
        'test-user-id'
      );
    });
  });
});
