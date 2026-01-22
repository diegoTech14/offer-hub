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

  const result = await projectService.updateProject(id, updates, client_id);

  return res.status(result.status).json(result);
};

export const deleteProjectHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client_id = req.body.client_id;

  if (!uuidRegex.test(id) || !uuidRegex.test(client_id)) {
    return res.status(400).json(
      buildErrorResponse('Invalid UUID format')
    );
  }

  const result = await projectService.deleteProject(id, client_id);

  return res.status(result.status).json(result);
};

export const assignFreelancerHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, freelancerId } = req.params;
    const client_id = (req.user as any)?.id;

    // Validate UUIDs
    if (!uuidRegex.test(projectId) || !uuidRegex.test(freelancerId)) {
      return res.status(400).json(
        buildErrorResponse('Invalid UUID format for projectId or freelancerId')
      );
    }

    // Validate client_id exists
    if (!client_id || !uuidRegex.test(client_id)) {
      return res.status(401).json(
        buildErrorResponse('Authentication required')
      );
    }

    // Call service method
    const result = await projectService.assignFreelancer(
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
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in assignFreelancerHandler:', error);
    return res.status(500).json(
      buildErrorResponse('Internal server error')
    );
  }
};