/**
 * @fileoverview Project controller handling project retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { projectService } from "@/services/project.service";
import { NotFoundError } from "@/utils/AppError";
import { buildSuccessResponse } from "../utils/responseBuilder";
import { validateUUID } from "@/utils/validation";

export const getProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const projectIdStr = Array.isArray(projectId) ? projectId[0] : projectId;

    // Validate projectId is a valid UUID format
    if (!projectIdStr) {
      throw new NotFoundError("Project ID is required");
    }

    if (!validateUUID(projectIdStr)) {
      throw new NotFoundError("Invalid project ID format");
    }

    // Get project by ID
    const project = await projectService.getProjectById(projectIdStr);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Return 200 with project data
    res.status(200).json(
      buildSuccessResponse(project, "Project retrieved successfully")
    );
  } catch (error: any) {
    next(error);
  }
};