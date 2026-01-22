/**
 * @fileoverview Project service providing project data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import {
  Project,
  ProjectRow,
  ProjectSkillRow,
  ProjectStatus,
} from "@/types/project.types";

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

export const projectService = new ProjectService();