/**
 * @fileoverview Project service providing project data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { ProjectPublicationService } from "@/blockchain/project-publication.service";
import { AuthUser } from "@/types/auth.types";
import { CreateProjectDTO, Project, ProjectSkill } from "@/types/project.types";
import { mapSupabaseError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

class ProjectService {
  /**
   * Create a new project and attempt on-chain registration
   * @param data - Project creation payload
   * @param user - Authenticated user creating the project
   * @returns Created project data
   */
  async createProject(data: CreateProjectDTO, user: AuthUser): Promise<Project> {
    const skills = this.normalizeSkills(data.skills);

    const insertPayload = {
      client_id: user.id,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      subcategory: data.subcategory,
      budget: data.budget,
      budget_type: data.budgetType || "fixed",
      status: data.status || "draft",
      visibility: data.visibility || "public",
      project_type: data.projectType || "on-time",
      experience_level: data.experienceLevel || "intermediate",
      duration: data.duration,
      deadline: data.deadline,
      tags: data.tags || [],
    };

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert(insertPayload)
      .select("*")
      .single();

    if (projectError) {
      throw mapSupabaseError(projectError);
    }

    if (!projectData) {
      throw new Error("Project creation failed");
    }

    if (skills.length > 0) {
      const { error: skillsError } = await supabase
        .from("project_skills")
        .insert(
          skills.map((skill) => ({
            project_id: projectData.id,
            skill_name: skill,
          })),
        );

      if (skillsError) {
        throw mapSupabaseError(skillsError);
      }
    }

    let onChainTxHash: string | null = null;

    if (user.wallet_address) {
      onChainTxHash = await this.registerProjectOnChain(
        projectData.id,
        user.wallet_address,
      );

      if (onChainTxHash) {
        const { error: updateError } = await supabase
          .from("projects")
          .update({ on_chain_transaction_hash: onChainTxHash })
          .eq("id", projectData.id);

        if (updateError) {
          logger.warn("Failed to update project on-chain hash", updateError);
          onChainTxHash = null;
        }
      }
    } else {
      logger.warn("Skipping on-chain registration: missing wallet address");
    }

    return {
      ...projectData,
      on_chain_transaction_hash:
        onChainTxHash || projectData.on_chain_transaction_hash || undefined,
      skills,
    } as Project;
  }

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

  private normalizeSkills(skills?: string[]): string[] {
    if (!skills || !Array.isArray(skills)) {
      return [];
    }

    return Array.from(
      new Set(
        skills
          .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
          .filter((skill) => skill.length > 0),
      ),
    );
  }

  private async registerProjectOnChain(
    projectId: string,
    clientWalletAddress: string,
  ): Promise<string | null> {
    const maxAttempts = 2;
    const timestamp = Math.floor(Date.now() / 1000);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const publicationService = new ProjectPublicationService();
        const result = await publicationService.recordProjectPublication(
          clientWalletAddress,
          projectId,
          timestamp,
        );

        return result.transactionHash;
      } catch (error: any) {
        logger.warn(
          `Project publication failed (attempt ${attempt})`,
          error,
        );

        if (attempt < maxAttempts) {
          await this.sleep(500 * attempt);
        }
      }
    }

    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const projectService = new ProjectService();
