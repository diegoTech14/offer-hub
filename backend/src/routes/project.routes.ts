import { Router } from "express";
import {
  createProjectHandler,
  getAllProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
  assignFreelancerHandler,
} from "@/controllers/project.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { getProjectHandler } from "@/controllers/project.controller";

const router = Router();

// GET /api/projects/:projectId - Get project by ID
router.get("/:projectId", getProjectHandler);

router.get("/", getAllProjectsHandler);

router.get("/:id", getProjectByIdHandler);

router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("client", "admin"),
  updateProjectHandler
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("client", "admin"),
  deleteProjectHandler
);

router.patch(
  "/:projectId/assign/:freelancerId",
  verifyToken,
  authorizeRoles("client", "admin"),
  assignFreelancerHandler
);

export default router;
