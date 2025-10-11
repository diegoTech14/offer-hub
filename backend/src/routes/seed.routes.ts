import { Router } from 'express';
import { seedProjects, createWaitlistTable } from '@/controllers/seed.controller';

const router = Router();

// Only available in development
router.post('/projects', seedProjects);
router.post('/waitlist-table', createWaitlistTable);

export default router;

