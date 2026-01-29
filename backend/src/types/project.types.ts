/**
 * @fileoverview Project types for backend API
 * @author Offer Hub Team
 */

/**
 * Enum aligned with DB enum `project_status`
 */
export enum ProjectStatus {
  DRAFT = "draft",
  PENDING = "pending",
  PUBLISHED = "published",
  OPEN = "open",
  ACTIVE = "active",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

export type ProjectVisibility = "public" | "private";
export type ProjectType = "on-time" | "ongoing";
export type ExperienceLevel = "entry" | "intermediate" | "expert";
export type BudgetType = "fixed" | "hourly";

/**
 * Project entity (camelCase) - Domain Model
 */
export interface Project {
  id: string;
  clientId: string;
  freelancerId?: string | null;

  title: string;
  description: string;
  category: string;
  subcategory?: string;

  budget: number; // Domain uses budget
  budgetType: BudgetType;
  currency: string;

  status: ProjectStatus;
  visibility: ProjectVisibility;
  projectType: ProjectType;
  experienceLevel: ExperienceLevel;

  duration?: string;
  deadline?: string | null;

  tags: string[];
  skills: string[];

  onChainTxHash?: string | null;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
}

/**
 * DTO for creating a project (User's shape)
 */
export interface CreateProjectDTO {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  budgetType?: BudgetType;
  currency?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  projectType?: ProjectType;
  visibility?: ProjectVisibility;
  duration?: string;
  tags?: string[];
  deadline?: string;
  status?: ProjectStatus;
}

/**
 * DTO for updating a project
 */
export interface UpdateProjectDTO {
  freelancerId?: string | null;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  budget?: number;
  budgetType?: BudgetType;
  currency?: string;
  status?: ProjectStatus;
  deadline?: string;
  visibility?: ProjectVisibility;
  projectType?: ProjectType;
  experienceLevel?: ExperienceLevel;
  duration?: string;
  tags?: string[];
  skills?: string[];
  onChainTxHash?: string | null;
}

export interface UpdateProjectResult {
  success: boolean;
  status: number;
  message?: string;
  data?: Project;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  clientId?: string;
  freelancerId?: string;
  minBudget?: number;
  maxBudget?: number;
}

/**
 * DB row shapes (snake_case)
 */
export interface ProjectRow {
  id: string;
  client_id: string;
  freelancer_id: string | null;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget_amount: number; // Mapped from budget
  budget_type: string;
  currency: string;
  status: string;
  visibility: string;
  project_type: string;
  experience_level: string;
  duration?: string;
  deadline: string | null;
  on_chain_tx_hash: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
  deleted_at?: string;
}

export interface ProjectSkillRow {
  skill_name: string;
  project_id: string;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["entry", "intermediate", "expert"];
const PROJECT_TYPES: ProjectType[] = ["on-time", "ongoing"];
const VISIBILITIES: ProjectVisibility[] = ["public", "private"];
const BUDGET_TYPES: BudgetType[] = ["fixed", "hourly"];
const PROJECT_STATUSES = Object.values(ProjectStatus);

// User's guard implementation
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
    !VISIBILITIES.includes(obj.visibility)
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
