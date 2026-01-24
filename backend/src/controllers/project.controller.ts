import { Request, Response } from 'express';
import * as projectService from '@/services/project.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';
import { AuthenticatedRequest } from '@/types/middleware.types';
import { UpdateProjectDTO } from '@/types/project.type';

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

export const updateProjectHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { id: projectId } = req.params;
  const updates: UpdateProjectDTO = req.body;

  // Get client_id from authenticated user
  const clientId = req.user.id;

  if (!uuidRegex.test(projectId)) {
    return res.status(400).json(
      buildErrorResponse('Invalid project ID format')
    );
  }

  const result = await projectService.updateProject(projectId, updates, clientId);

  if (!result.success) {
    return res.status(result.status).json(
      buildErrorResponse(result.message || 'Update failed')
    );
  }

  return res.status(200).json(
    buildSuccessResponse(result.data, 'Project updated successfully')
  );
};

export const deleteProjectHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Get client_id from authenticated user
  const clientId = req.user.id;

  if (!uuidRegex.test(id)) {
    return res.status(400).json(
      buildErrorResponse('Invalid project ID format')
    );
  }

  const result = await projectService.deleteProject(id, clientId);

  if (!result.success) {
    return res.status(result.status).json(
      buildErrorResponse(result.message || 'Delete failed')
    );
  }

  return res.status(200).json(
    buildSuccessResponse(result.data, result.message || 'Project deleted successfully')
  );
};
