import { Router } from 'express';
import { getEscrowBalances } from '../controllers/escrow-balance.controller';

const router = Router();

router.get('/balances', getEscrowBalances);

export default router;
