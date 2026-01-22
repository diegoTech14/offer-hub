/**
 * @fileoverview Project controller handling project retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { projectService } from "@/services/project.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/AppError";
import { buildSuccessResponse } from "../utils/responseBuilder";
import { validateUUID } from "@/utils/validation";
import {
  CreateProjectDTO,
  isCreateProjectDTO,
} from "@/types/project.types";
import { AuthenticatedRequest, UserRole } from "@/types/auth.types";

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

const normalizeCreateProjectPayload = (payload: any): CreateProjectDTO => {
  return {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    budget: payload.budget,
    subcategory: payload.subcategory,
    skills: payload.skills,
    experienceLevel: payload.experienceLevel ?? payload.experience_level,
    projectType: payload.projectType ?? payload.project_type,
    visibility: payload.visibility,
    budgetType: payload.budgetType ?? payload.budget_type,
    duration: payload.duration,
    tags: payload.tags,
    deadline: payload.deadline,
    status: payload.status,
  };
};

export const createProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (user.role !== UserRole.CLIENT) {
      throw new ForbiddenError("Only clients can create projects");
    }

    const payload = normalizeCreateProjectPayload(req.body);

    if (!isCreateProjectDTO(payload)) {
      throw new BadRequestError("Invalid project data", "INVALID_PROJECT_DATA");
    }

    const project = await projectService.createProject(payload, user);

    res.status(201).json(
      buildSuccessResponse(project, "Project created successfully")
    );
  } catch (error: any) {
    next(error);
  }
};
