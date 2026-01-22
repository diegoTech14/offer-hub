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

const router = Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("client", "admin"),
  createProjectHandler
);

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
