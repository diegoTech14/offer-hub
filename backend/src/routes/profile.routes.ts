/**
 * @fileoverview Profile routes configuration
 * @author Offer Hub Team
 */

import { Router } from "express";
import { 
  createProfileHandler,
  getProfileHandler,
  updateProfileHandler
} from "@/controllers/profile.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// POST /api/profile - Create profile for authenticated user
router.post("/", createProfileHandler);

/**
 * @route GET /api/profiles/:userId
 * @desc Get user profile by user ID
 * @access Public (no authentication required)
 */
router.get("/:userId", getProfileHandler);

// PATCH /api/profiles/:userId - Update profile (protected with authentication)
router.patch("/:userId", verifyToken, updateProfileHandler);

export default router;
