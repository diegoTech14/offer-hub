import { Router } from 'express';
import { addToWaitlist, getWaitlistCount } from '@/controllers/waitlist.controller';

const router = Router();

// Public routes - no authentication required
router.post('/', addToWaitlist);
router.get('/count', getWaitlistCount);

export default router;

