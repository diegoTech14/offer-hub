import { Router } from "express";
import {
  createProjectHandler,
  getProjectHandler,
} from "@/controllers/project.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

// GET /api/projects/:projectId - Get project by ID
router.get("/:projectId", getProjectHandler);
// POST /api/projects - Create a new project
router.post("/", authenticateToken(), createProjectHandler);

export default router;
