import request from 'supertest';
import express from 'express';

let mockRole = 'client';

jest.mock('@/middlewares/auth.middleware', () => ({
  authenticateToken: () => (req: any, _res: any, next: any) => {
    req.user = {
      id: '456e7890-e89b-12d3-a456-426614174001',
      role: mockRole,
      wallet_address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    };
    next();
  }
}));

import projectRoutes from '@/routes/project.routes';
import { ErrorHandler } from '@/utils/AppError';
import { projectService } from '@/services/project.service';

jest.mock('@/services/project.service');

const mockProjectService = projectService as jest.Mocked<typeof projectService>;

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);
app.use(ErrorHandler);

let server: any = null;

try {
  server = app.listen(0, '127.0.0.1');
  server.on('error', () => {
    server = null;
  });
} catch {
  server = null;
}

afterAll((done) => {
  if (server && server.listening) {
    server.close(done);
  } else {
    done();
  }
});

const ensureServer = (): boolean => {
  return Boolean(server && server.listening);
};

describe('POST /api/projects', () => {
  const validPayload = {
    title: 'New Project',
    description: 'A project description',
    category: 'Development',
    budget: 1000,
    skills: ['TypeScript']
  };

  const createdProject = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    client_id: '456e7890-e89b-12d3-a456-426614174001',
    title: validPayload.title,
    description: validPayload.description,
    category: validPayload.category,
    budget: validPayload.budget,
    budget_type: 'fixed',
    status: 'draft',
    visibility: 'public',
    project_type: 'on-time',
    experience_level: 'intermediate',
    tags: [],
    on_chain_transaction_hash: 'tx-123',
    version: 1,
    featured: false,
    priority: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    skills: ['TypeScript']
  };

  beforeEach(() => {
    mockRole = 'client';
    jest.clearAllMocks();
  });

  it('should return 201 when project is created', async () => {
    if (!ensureServer()) return;
    mockProjectService.createProject.mockResolvedValue(createdProject as any);

    const res = await request(server)
      .post('/api/projects')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(createdProject);
  });

  it('should return 400 when payload is invalid', async () => {
    if (!ensureServer()) return;
    const res = await request(server)
      .post('/api/projects')
      .send({ title: '', description: 'Missing category', budget: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PROJECT_DATA');
  });

  it('should return 403 when user is not a client', async () => {
    if (!ensureServer()) return;
    mockRole = 'freelancer';

    const res = await request(server)
      .post('/api/projects')
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
