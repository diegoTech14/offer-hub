import { Router } from "express";
import { getProjectHandler } from "@/controllers/project.controller";

const router = Router();

// GET /api/projects/:projectId - Get project by ID
router.get("/:projectId", getProjectHandler);

export default router;