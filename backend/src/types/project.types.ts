/**
 * @fileoverview Project types for backend API
 * @author Offer Hub Team
 */

export interface ProjectSkill {
  id: string;
  project_id: string;
  skill_name: string;
  created_at: string;
}

export type ProjectStatus =
  | "draft"
  | "pending"
  | "published"
  | "active"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived"
  | "deleted";

export type ProjectVisibility = "public" | "private";
export type ProjectType = "on-time" | "ongoing";
export type ExperienceLevel = "entry" | "intermediate" | "expert";
export type BudgetType = "fixed" | "hourly";

export interface CreateProjectDTO {
  title: string;
  description: string;
  category: string;
  budget: number;
  subcategory?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  projectType?: ProjectType;
  visibility?: ProjectVisibility;
  budgetType?: BudgetType;
  duration?: string;
  tags?: string[];
  deadline?: string;
  status?: ProjectStatus;
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "draft",
  "pending",
  "published",
  "active",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
  "deleted",
];

const PROJECT_VISIBILITIES: ProjectVisibility[] = ["public", "private"];
const PROJECT_TYPES: ProjectType[] = ["on-time", "ongoing"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "entry",
  "intermediate",
  "expert",
];
const BUDGET_TYPES: BudgetType[] = ["fixed", "hourly"];

export function isCreateProjectDTO(obj: any): obj is CreateProjectDTO {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  if (
    typeof obj.title !== "string" ||
    obj.title.trim().length === 0 ||
    typeof obj.description !== "string" ||
    obj.description.trim().length === 0 ||
    typeof obj.category !== "string" ||
    obj.category.trim().length === 0 ||
    typeof obj.budget !== "number" ||
    !Number.isFinite(obj.budget) ||
    obj.budget <= 0
  ) {
    return false;
  }

  if (
    obj.subcategory !== undefined &&
    typeof obj.subcategory !== "string"
  ) {
    return false;
  }

  if (
    obj.skills !== undefined &&
    (!Array.isArray(obj.skills) ||
      obj.skills.some((skill: any) => typeof skill !== "string"))
  ) {
    return false;
  }

  if (
    obj.experienceLevel !== undefined &&
    !EXPERIENCE_LEVELS.includes(obj.experienceLevel)
  ) {
    return false;
  }

  if (
    obj.projectType !== undefined &&
    !PROJECT_TYPES.includes(obj.projectType)
  ) {
    return false;
  }

  if (
    obj.visibility !== undefined &&
    !PROJECT_VISIBILITIES.includes(obj.visibility)
  ) {
    return false;
  }

  if (
    obj.budgetType !== undefined &&
    !BUDGET_TYPES.includes(obj.budgetType)
  ) {
    return false;
  }

  if (obj.duration !== undefined && typeof obj.duration !== "string") {
    return false;
  }

  if (
    obj.tags !== undefined &&
    (!Array.isArray(obj.tags) ||
      obj.tags.some((tag: any) => typeof tag !== "string"))
  ) {
    return false;
  }

  if (obj.deadline !== undefined && typeof obj.deadline !== "string") {
    return false;
  }

  if (
    obj.status !== undefined &&
    !PROJECT_STATUSES.includes(obj.status)
  ) {
    return false;
  }

  return true;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  budget_type: 'fixed' | 'hourly';
  status: 'draft' | 'pending' | 'published' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'archived' | 'deleted';
  visibility: 'public' | 'private';
  project_type: 'on-time' | 'ongoing';
  experience_level: 'entry' | 'intermediate' | 'expert';
  duration?: string;
  deadline?: string;
  tags: string[];
  on_chain_transaction_hash?: string;
  on_chain_id?: string;
  version: number;
  featured: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
  deleted_at?: string;
  skills: string[]; // Populated from project_skills relation
}

export interface ProjectWithDetails extends Project {
  // Include any additional fields that might be needed for detailed view
  attachments?: any[];
  milestones?: any[];
  client?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  client_id?: string;
}
