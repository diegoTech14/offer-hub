/**
 * @fileoverview Role routes for role switching endpoints
 * @author Offer Hub Team
 */

import { Router } from "express";
import {
  becomeFreelancerHandler,
  becomeClientHandler,
} from "@/controllers/role.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * POST /api/users/:userId/become-freelancer
 * Switch user role to freelancer
 * Protected route - requires authentication
 * User can only switch their own role
 */
router.post(
  "/:userId/become-freelancer",
  authenticateToken(),
  becomeFreelancerHandler
);

/**
 * POST /api/users/:userId/become-client
 * Switch user role to client
 * Protected route - requires authentication
 * User can only switch their own role
 */
router.post(
  "/:userId/become-client",
  authenticateToken(),
  becomeClientHandler
);

export default router;
