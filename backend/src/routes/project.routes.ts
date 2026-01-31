import { Router } from "express";
import {
  createProjectHandler,
  listProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  assignFreelancerHandler
} from "@/controllers/project.controller";
import { authenticateToken, authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";

const router = Router();

// POST /api/projects - Create a new project
router.post("/", authenticateToken(), createProjectHandler);

// GET /api/projects - List projects with filtering and pagination
router.get("/", listProjectsHandler);

// GET /api/projects/:projectId - Get project by ID
router.get("/:projectId", getProjectHandler);

// PATCH /api/projects/:id - Update project
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  updateProjectHandler
);

// DELETE /api/projects/:id - Delete project
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  deleteProjectHandler
);

// PATCH /api/projects/:projectId/assign/:freelancerId - Assign freelancer
router.patch(
  "/:projectId/assign/:freelancerId",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  assignFreelancerHandler
);

export default router;
