import { Router } from "express";
import { updateProfileHandler } from "@/controllers/profile.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// PATCH /api/profiles/:userId - Update profile (protected with authentication)
router.patch("/:userId", verifyToken, updateProfileHandler);

export default router;
