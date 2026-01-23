import { supabase } from "@/lib/supabase/supabase";
import {
  Project,
  ProjectRow,
  ProjectSkillRow,
  ProjectStatus,
} from "@/types/project.types";
import { InternalServerError } from "@/utils/AppError";
import { userService } from "./user.service";
import { escrowService } from "./escrow.service";

// CreateProjectDTO type definition
type CreateProjectDTO = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'archived_at' | 'deleted_at' | 'version' | 'skills'>;
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

export const updateProject = async (
  id: string,
  updates: Partial<CreateProjectDTO>,
  client_id: string
) => {
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

  if (updates.status) {
    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress'],
      in_progress: ['completed'],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(updates.status)) {
      return {
        success: false,
        status: 400,
        message: 'Invalid_status_transition',
      };
    }
  }

  const allowedFields = ['title', 'description', 'budget', 'status'];
  const cleanUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (updates[key as keyof CreateProjectDTO] !== undefined) {
      cleanUpdates[key] = updates[key as keyof CreateProjectDTO];
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return { success: false, status: 500, message: 'Update_failed' };
  }

  return { success: true, status: 200, data: updated };
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

class ProjectService {
  /**
   * Get a project by ID with related skills
   * @param projectId - The UUID of the project to retrieve
   * @returns Project data with skills or null if not found
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    // Query the projects table with related skills
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        project_skills(skill_name)
      `)
      .eq("id", projectId)
      .single();

    if (projectError) {
      // If project not found, return null
      if (projectError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Database error: ${projectError.message}`);
    }

    if (!projectData) {
      return null;
    }

    const row = projectData as ProjectRow & {
      project_skills?: ProjectSkillRow[] | null;
    };

    // Transform the data to include skills as array of strings
    const skills = row.project_skills?.map((ps) => ps.skill_name) || [];

    return {
      id: row.id,
      clientId: row.client_id,
      freelancerId: row.freelancer_id,
      title: row.title,
      description: row.description,
      category: row.category,
      budgetAmount: Number(row.budget_amount),
      currency: row.currency || "XLM",
      status: (row.status || ProjectStatus.OPEN) as ProjectStatus,
      deadline: row.deadline,
      onChainTxHash: row.on_chain_tx_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      skills,
    };
  }
}

export const assignFreelancer = async (
  projectId: string,
  freelancerId: string,
  clientId: string
): Promise<{ success: boolean; status: number; data?: any; message?: string }> => {
  // 1. Fetch project by ID - return 404 if not found
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  // 2. Verify project status is 'open' - return 400 if invalid state
  if (project.status !== 'open') {
    return {
      success: false,
      status: 400,
      message: 'Project_must_be_open_to_assign_freelancer',
    };
  }

  // 3. Verify requester is project owner (client_id matches) - return 403 if unauthorized
  if (project.client_id !== clientId) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  // 4. Fetch freelancer user - return 404 if not found
  const freelancer = await userService.getUserById(freelancerId);
  if (!freelancer) {
    return { success: false, status: 404, message: 'Freelancer_not_found' };
  }

  // 5. Verify freelancer has 'freelancer' role - return 400 if invalid role
  if (!freelancer.is_freelancer) {
    return {
      success: false,
      status: 400,
      message: 'User_is_not_a_freelancer',
    };
  }

  // 6. Verify freelancer and client are different users - return 400 if same
  if (freelancerId === clientId) {
    return {
      success: false,
      status: 400,
      message: 'Freelancer_and_client_cannot_be_the_same_user',
    };
  }

  // Fetch client user to get wallet address
  const client = await userService.getUserById(clientId);
  if (!client || !client.wallet_address) {
    return {
      success: false,
      status: 500,
      message: 'Client_wallet_address_not_found',
    };
  }

  if (!freelancer.wallet_address) {
    return {
      success: false,
      status: 500,
      message: 'Freelancer_wallet_address_not_found',
    };
  }

  // Transaction Flow: Create escrow first, then update project
  try {
    // Create escrow via escrow service
    const escrowAddress = await escrowService.createEscrow({
      clientAddress: client.wallet_address,
      freelancerAddress: freelancer.wallet_address,
      amount: Number(project.budget), // Convert budget to number (assuming it's in XLM)
      projectId: projectId,
    });

    // If escrow creation succeeds, update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        freelancer_id: freelancerId,
        escrow_address: escrowAddress,
        status: 'in_progress',
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      // Log error for debugging
      console.error('Failed to update project after escrow creation:', updateError);
      return {
        success: false,
        status: 500,
        message: 'Failed_to_update_project_after_escrow_creation',
      };
    }

    return {
      success: true,
      status: 200,
      data: updatedProject,
      message: 'Freelancer_assigned_successfully',
    };
  } catch (error) {
    // If escrow creation fails, do NOT update project (maintain atomicity)
    // Log error for debugging
    console.error('Escrow creation failed:', error);
    
    // Check if it's an AppError to get the status code
    if (error instanceof InternalServerError) {
      return {
        success: false,
        status: 500,
        message: error.message || 'Escrow_creation_failed',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'Escrow_creation_failed',
    };
  }
};
export const projectService = new ProjectService();
