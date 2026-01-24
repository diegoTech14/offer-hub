/**
 * @fileoverview Profile routes configuration
 * @author Offer Hub Team
 */

import { Router } from "express";
import { createProfileHandler } from "@/controllers/profile.controller";
import { getProfileHandler } from "@/controllers/profile.controller";

const router = Router();

// POST /api/profile - Create profile for authenticated user
router.post("/", createProfileHandler);

/**
 * @route GET /api/profiles/:userId
 * @desc Get user profile by user ID
 * @access Public (no authentication required)
 */
router.get("/:userId", getProfileHandler);

export default router;
