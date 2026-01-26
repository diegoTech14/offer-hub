import { Router } from 'express';
import { getEscrowsByRole } from '../controllers/escrow-query.controller';

const router = Router();

router.get('/by-role', getEscrowsByRole);

export default router;
