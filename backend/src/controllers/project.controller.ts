/**
 * @fileoverview Project controller handling project retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { projectService } from "@/services/project.service";
import {
  getAllProjects,
  getProjectById as getProjectByIdService,
  updateProject,
  deleteProject,
  assignFreelancer
} from "@/services/project.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from "@/utils/AppError";
import { buildSuccessResponse, buildErrorResponse, buildPaginatedResponse } from "../utils/responseBuilder";
import { validateUUID, validateIntegerRange } from "@/utils/validation";
import {
  CreateProjectDTO,
  isCreateProjectDTO,
  ProjectFilters
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
    const payload = buildSuccessResponse(project, "Project retrieved successfully");
    res.status(200).json({ ...payload, timestamp: new Date().toISOString() });
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

export const listProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse pagination in a way that still validates 0/NaN properly
    const page = req.query.page !== undefined ? Number(req.query.page) : 1;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 20;

    if (!Number.isInteger(page) || !validateIntegerRange(page, 1, 1000)) {
      throw new ValidationError("Page number must be between 1 and 1000");
    }

    if (!Number.isInteger(limit) || !validateIntegerRange(limit, 1, 100)) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    const minBudget =
      req.query.minBudget !== undefined ? Number(req.query.minBudget) : undefined;
    const maxBudget =
      req.query.maxBudget !== undefined ? Number(req.query.maxBudget) : undefined;

    if (minBudget !== undefined && Number.isNaN(minBudget)) {
      throw new ValidationError("Minimum budget must be a number");
    }

    if (maxBudget !== undefined && Number.isNaN(maxBudget)) {
      throw new ValidationError("Maximum budget must be a number");
    }

    if (minBudget !== undefined && minBudget < 0) {
      throw new ValidationError("Minimum budget cannot be negative");
    }

    if (maxBudget !== undefined && maxBudget < 0) {
      throw new ValidationError("Maximum budget cannot be negative");
    }

    if (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget) {
      throw new ValidationError("Minimum budget cannot be greater than maximum budget");
    }

    const filters: ProjectFilters = {
      page,
      limit,
      search: req.query.search as string,
      status: req.query.status as string,
      category: req.query.category as string,
      minBudget,
      maxBudget,
    };

    const result = await projectService.listProjects(filters);

    // Ensure ordering by created_at descending for the response (tests assert this)
    const orderedProjects = [...result.projects].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return res.status(200).json(
      buildPaginatedResponse(orderedProjects, "Projects retrieved successfully", {
        current_page: page,
        total_pages: Math.ceil(result.total / limit),
        total_items: result.total,
        per_page: limit,
      })
    );
  } catch (error: any) {

    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};

export const getAllProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.query;
    const projects = await getAllProjects(filters);
    res.status(200).json(
      buildSuccessResponse(projects, "Projects retrieved successfully")
    );
  } catch (error: any) {
    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};

export const getProjectByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new BadRequestError("Invalid project ID format");
    }

    const project = await getProjectByIdService(id);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    res.status(200).json(
      buildSuccessResponse(project, "Project retrieved successfully")
    );
  } catch (error: any) {
    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};

export const updateProjectHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { id } = req.params;
    const client_id = (req as any).user?.id;
    const updates = req.body;

    if (!validateUUID(id)) {
      throw new BadRequestError("Invalid project ID format");
    }

    if (!client_id) {
      throw new BadRequestError("Client ID is required");
    }

    const result = await updateProject(id, updates, client_id);

    if (!result.success) {
      return res.status(result.status).json(
        buildErrorResponse(result.message || 'Update failed')
      );
    }

    res.status(result.status).json(
      buildSuccessResponse(result.data, result.message || 'Project updated successfully')
    );
  } catch (error: any) {
    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};

export const deleteProjectHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { id } = req.params;
    const client_id = (req as any).user?.id;

    if (!validateUUID(id)) {
      throw new BadRequestError("Invalid project ID format");
    }

    if (!client_id) {
      throw new BadRequestError("Client ID is required");
    }

    const result = await deleteProject(id, client_id);

    if (!result.success) {
      return res.status(result.status).json(
        buildErrorResponse(result.message || 'Delete failed')
      );
    }

    res.status(result.status).json(
      buildSuccessResponse(result.data, result.message || 'Project deleted successfully')
    );
  } catch (error: any) {
    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};

export const assignFreelancerHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { projectId, freelancerId } = req.params;
    const client_id = (req as any).user?.id;

    // Validate UUIDs
    if (!validateUUID(projectId) || !validateUUID(freelancerId)) {
      throw new BadRequestError("Invalid UUID format for projectId or freelancerId");
    }

    // Validate client_id exists
    if (!client_id || !validateUUID(client_id)) {
      throw new BadRequestError("Authentication required");
    }

    // Call service method
    const result = await assignFreelancer(
      projectId,
      freelancerId,
      client_id
    );

    // Return appropriate HTTP status based on service result
    if (result.success) {
      return res.status(result.status).json(
        buildSuccessResponse(result.data, result.message || 'Freelancer assigned successfully')
      );
    } else {
      return res.status(result.status).json(
        buildErrorResponse(result.message || 'Failed to assign freelancer')
      );
    }
  } catch (error: any) {
    if (next) {
      next(error);
    } else {
      throw error;
    }
  }
};
