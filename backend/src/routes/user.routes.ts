import { Router } from "express";
import {
  createUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateAvatarHandler,
  getAllUsersHandler,
  deleteOwnAccountHandler,
  updateProfileHandler,
  getCurrentUserHandler,
  getPublicUserProfileHandler,
} from "@/controllers/user.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";


const router = Router();

router.get("/", verifyToken, authorizeRoles(UserRole.ADMIN), getAllUsersHandler);

// I added authorization here because the route for public registration is in /api/auth/register
router.post("/", verifyToken, authorizeRoles(UserRole.ADMIN), createUserHandler);

// GET /me - Get current user's complete profile (must be before /:id routes to avoid conflicts)
router.get("/me", verifyToken, getCurrentUserHandler);
router.put("/me", verifyToken, updateProfileHandler);
// DELETE /me - Delete own account (must be before /:id routes to avoid conflicts)
router.delete("/me", verifyToken, deleteOwnAccountHandler);

// GET /:id/public - Public endpoint (no auth required)
router.get("/:id/public", getPublicUserProfileHandler);

router.get("/:id", verifyToken, getUserByIdHandler);
router.patch("/:id", verifyToken, updateUserHandler);
router.patch("/:userId/avatar", verifyToken, updateAvatarHandler);

export default router;
