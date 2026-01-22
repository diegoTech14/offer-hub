import { Request, Response } from 'express';
import * as projectService from '@/services/project.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createProjectHandler = async (req: Request, res: Response) => {

    const project = await projectService.createProject(req.body);
    return res.status(201).json(
      buildSuccessResponse(project, 'Project created successfully')
    );
 
};

export const getAllProjectsHandler = async (req: Request, res: Response) => {
  
    const filters = req.query;
    const projects = await projectService.getAllProjects(filters);
    return res.json(
      buildSuccessResponse(projects, 'Projects retrieved successfully')
    );
  
};

export const getProjectByIdHandler = async (req: Request, res: Response) => {

    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    if (!project) {
      return res.status(404).json(
        buildErrorResponse('Project not found')
      );
    }
    return res.json(
      buildSuccessResponse(project, 'Project retrieved successfully')
    );

};

export const updateProjectHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const client_id = req.body.client_id;

  if (!uuidRegex.test(id) || !uuidRegex.test(client_id)) {
    return res.status(400).json(
      buildErrorResponse('Invalid UUID format')
    );
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