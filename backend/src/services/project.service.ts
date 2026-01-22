/**
 * @fileoverview Project service providing project data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { Project, ProjectSkill } from "@/types/project.types";

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

    // Transform the data to include skills as array of strings
    const skills = projectData.project_skills?.map((ps: ProjectSkill) => ps.skill_name) || [];

    // Remove the nested project_skills data and add the skills array
    const { project_skills, ...project } = projectData;

    return {
      ...project,
      skills
    } as Project;
  }
}

export const projectService = new ProjectService();