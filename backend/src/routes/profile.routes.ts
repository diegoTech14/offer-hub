/**
 * @fileoverview Profile routes configuration
 * @author Offer Hub Team
 */

import { Router } from "express";
import { getProfileHandler } from "@/controllers/profile.controller";

const router = Router();

/**
 * @route GET /api/profiles/:userId
 * @desc Get user profile by user ID
 * @access Public (no authentication required)
 */
router.get("/:userId", getProfileHandler);

export default router;