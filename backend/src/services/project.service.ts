import { supabase } from "@/lib/supabase/supabase";
import { CreateProjectDTO, UpdateProjectDTO, Project, UpdateProjectResult, ProjectStatus } from '@/types/project.type';
import { InternalServerError } from "@/utils/AppError";

// Status values that allow updates
// Note: 'pending' is included for backward compatibility with existing data
const UPDATABLE_STATUSES = ['open', 'pending', 'in_progress'];

// Fields that cannot be modified via update endpoint
const PROTECTED_FIELDS = ['id', 'client_id', 'on_chain_tx_hash', 'created_at'];

// Valid status transitions
// open/pending -> in_progress -> completed/cancelled
// Direct transition from open/pending to completed is not allowed
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress', 'cancelled'],
  pending: ['in_progress', 'cancelled'], // Same as 'open' for backward compatibility
  in_progress: ['completed', 'cancelled'],
};
export const createProject = async (data: CreateProjectDTO) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([data])
    .select()
    .single();

  if (error) throw new InternalServerError(error.message);
  return project;
};

export const getAllProjects = async (filters: any) => {
  let query = supabase.from('projects').select('*');

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.budget_min) query = query.gte('budget', filters.budget_min);
  if (filters.budget_max) query = query.lte('budget', filters.budget_max);

  const { data, error } = await query;

  if (error) throw new InternalServerError(error.message);
  return data;
};

export const getProjectById = async (id: string) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`*, users!projects_client_id_fkey(name)`)
    .eq('id', id)
    .single();

  if (error) throw new InternalServerError(error.message);
  return {
    ...project,
    client_name: project.users?.name || null,
  };
};

/**
 * Validates if a status transition is allowed
 * Status transitions: open -> in_progress -> completed/cancelled
 * Direct transition from open to completed is not allowed
 */
export const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  if (currentStatus === newStatus) {
    return true; // No change is always valid
  }
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Checks if a freelancer is assigned to the project
 * A freelancer is considered assigned if there's a contract linking them to the project
 */
export const hasFreelancerAssigned = async (projectId: string): Promise<boolean> => {
  // Check if project has a freelancer_id directly
  const { data: project } = await supabase
    .from('projects')
    .select('freelancer_id')
    .eq('id', projectId)
    .single();

  if (project?.freelancer_id) {
    return true;
  }

  // Also check if there's an active contract for this project
  const { data: contract } = await supabase
    .from('contracts')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)
    .single();

  return !!contract;
};

/**
 * Updates a project with validation
 * - Only project owner can update
 * - Updates only allowed when status is 'open' or 'in_progress'
 * - Budget cannot be modified if freelancer is assigned
 * - Protected fields (client_id, id, on_chain_tx_hash) cannot be modified
 */
export const updateProject = async (
  projectId: string,
  updates: UpdateProjectDTO,
  clientId: string
): Promise<UpdateProjectResult> => {
  // Fetch existing project
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project not found' };
  }

  // Validate ownership - only project owner can update
  if (existing.client_id !== clientId) {
    return { success: false, status: 403, message: 'Only the project owner can update this project' };
  }

  // Validate project status allows updates
  if (!UPDATABLE_STATUSES.includes(existing.status)) {
    return {
      success: false,
      status: 400,
      message: `Cannot update project with status '${existing.status}'. Updates only allowed when status is 'open' or 'in_progress'`,
    };
  }

  // Validate status transition if status is being changed
  if (updates.status && !isValidStatusTransition(existing.status, updates.status)) {
    return {
      success: false,
      status: 400,
      message: `Invalid status transition from '${existing.status}' to '${updates.status}'. Allowed transitions: ${VALID_STATUS_TRANSITIONS[existing.status]?.join(', ') || 'none'}`,
    };
  }

  // Check if budget modification is allowed (not allowed if freelancer assigned)
  if (updates.budget !== undefined && updates.budget !== existing.budget) {
    const freelancerAssigned = await hasFreelancerAssigned(projectId);
    if (freelancerAssigned) {
      return {
        success: false,
        status: 400,
        message: 'Budget cannot be modified once a freelancer is assigned to the project',
      };
    }
  }

  // Build clean updates object, excluding protected fields
  const cleanUpdates: Record<string, any> = {};
  const allowedFields = ['title', 'description', 'category', 'budget', 'status'];

  for (const key of allowedFields) {
    if (updates[key as keyof UpdateProjectDTO] !== undefined) {
      cleanUpdates[key] = updates[key as keyof UpdateProjectDTO];
    }
  }

  // If no valid updates, return early
  if (Object.keys(cleanUpdates).length === 0) {
    return { success: false, status: 400, message: 'No valid fields to update' };
  }

  // Perform the update (updated_at is handled by database trigger)
  const { data: updated, error: updateError } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    return { success: false, status: 500, message: 'Failed to update project' };
  }

  return { success: true, status: 200, data: updated as Project };
};

export const deleteProject = async (id: string, client_id: string) => {
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  if (existing.client_id !== client_id) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  if (existing.status !== 'pending') {
    return {
      success: false,
      status: 400,
      message: 'Cannot_delete_non_pending_project',
    };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('projects')
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single();

  if (deleteError) {
    return {
      success: false,
      status: 500,
      message: 'Delete_failed',
    };
  }

  return { success: true, status: 200, message: 'Project_deleted', data: deleted };
};