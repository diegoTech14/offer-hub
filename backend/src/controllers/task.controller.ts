/**
 * @fileoverview Task controller handling task record operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from "express";
import { taskService } from "@/services/task.service";
import { CreateTaskRecordDTO } from "@/types/task.types";
import { AuthenticatedRequest } from "@/types/auth.types";
import { validateCreateTaskRecord, validateUpdateTaskRating } from "@/validators/task.validator";
import {
  AppError,
  BadRequestError,
  mapSupabaseError,
  ValidationError,
} from "@/utils/AppError";
import { validateUUID } from "@/utils/validation";
import { buildPaginatedResponse } from "@/utils/responseBuilder";

/**
 * Record task outcome with blockchain registration
 * @route POST /api/task-records
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 *
 * Expected request body:
 * {
 *   "project_id": "string (required) - UUID of the project",
 *   "freelancer_id": "string (required) - UUID of the freelancer",
 *   "completed": "boolean (required) - Whether task was completed successfully",
 *   "outcome_description": "string (optional) - Description of the outcome"
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "message": "Task outcome recorded successfully",
 *   "data": {
 *     "taskRecord": {
 *       "id": "string",
 *       "project_id": "string",
 *       "freelancer_id": "string",
 *       "client_id": "string",
 *       "completed": boolean,
 *       "outcome_description": "string",
 *       "on_chain_tx_hash": "string",
 *       "on_chain_task_id": number,
 *       "created_at": "string",
 *       "updated_at": "string"
 *     }
 *   },
 *   "metadata": {
 *     "timestamp": "string",
 *     "requestId": "string"
 *   }
 * }
 */
export async function recordTaskOutcome(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authReq = req as AuthenticatedRequest;

    // Ensure user is authenticated
    if (!authReq.user) {
      return next(new AppError("Authentication required", 401));
    }

    const clientId = authReq.user.id;
    const requestData = req.body as CreateTaskRecordDTO;

    // Validate request body
    const validationResult = validateCreateTaskRecord(requestData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((err: any) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return next(new ValidationError(`Validation failed: ${errorMessages}`));
    }

    // Create task record
    const taskRecord = await taskService.createTaskRecord(
      validationResult.data,
      clientId,
    );

    // Build success response
    res.status(201).json({
      success: true,
      message: "Task outcome recorded successfully",
      data: {
        taskRecord,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: authReq.securityContext?.requestId || "unknown",
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get task record by project ID
 * @route GET /api/task-records/project/:projectId
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
export async function getTaskRecordByProject(
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { projectId } = req.params;

    if (!projectId) {
      return next(new ValidationError("Project ID is required"));
    }

    const taskRecord = await taskService.getTaskRecordByProjectId(projectId);

    if (!taskRecord) {
      return res.status(404).json({
        success: false,
        message: "Task record not found for this project",
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: authReq.securityContext?.requestId || "unknown",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Task record retrieved successfully",
      data: {
        taskRecord,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: authReq.securityContext?.requestId || "unknown",
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get task records by client ID (current user)
 * @route GET /api/task-records/client
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
export async function getClientTaskRecords(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new AppError("Authentication required", 401));
    }

    const clientId = authReq.user.id;

    if (!validateUUID(clientId)) {
      throw new BadRequestError("Invalid Client id format", "INVALID_UUID");
    }

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const page = req.query.page ? Number(req.query.page) : 1;
    const completed =
      req.query.completed === undefined
        ? undefined
        : req.query.completed === "true";

    const { taskRecords, meta } = await taskService.getTaskRecordsByClientId(
      clientId,
      limit,
      page,
      completed,
    );

    res.status(200).json(
      buildPaginatedResponse(
        taskRecords,
        "Client task records retrieved successfully",
        {
          current_page: meta.page,
          total_pages: Math.ceil(meta.total_items / (limit || 20)),
          total_items: meta.total_items,
          per_page: meta.limit || 20,
        },
      ),
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
}

/**
 * Get task records by freelancer ID (current user)
 * @route GET /api/task-records/freelancer
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
export async function getFreelancerTaskRecords(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new AppError("Authentication required", 401));
    }

    const freelancerId = authReq.user.id;
    const taskRecords =
      await taskService.getTaskRecordsByFreelancerId(freelancerId);

    res.status(200).json({
      success: true,
      message: "Freelancer task records retrieved successfully",
      data: {
        taskRecords,
        count: taskRecords.length,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: authReq.securityContext?.requestId || "unknown",
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update task rating
 * @route PATCH /api/task-records/:recordId/rating
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
export async function updateTaskRating(
  req: Request<{ recordId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { recordId } = req.params;

    if (!recordId) {
      return next(new ValidationError("Record ID is required"));
    }

    const validationResult = validateUpdateTaskRating(req.body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((err: any) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return next(new ValidationError(`Validation failed: ${errorMessages}`));
    }

    const clientId = authReq.user.id;
    const updatedRecord = await taskService.updateTaskRating(
      recordId,
      validationResult.data,
      clientId,
    );

    res.status(200).json({
      success: true,
      message: "Task rating updated successfully",
      data: {
        taskRecord: updatedRecord,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: authReq.securityContext?.requestId || "unknown",
      },
    });
  } catch (error) {
    next(error);
  }
}
