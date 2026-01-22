import { Router } from 'express';
import { initializeSingleRelease } from '../controllers/escrow-init.controller';

const router = Router();

router.post('/single-release/initialize', initializeSingleRelease);

export default router;
