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