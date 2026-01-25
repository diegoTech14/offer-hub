export interface CreateProjectDTO {
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  status?: ProjectStatus;
}

export enum ProjectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Project {
  id: string;
  client_id: string;
  freelancer_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  budget: number;
  status: string;
  on_chain_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProjectResult {
  success: boolean;
  status: number;
  message?: string;
  data?: Project;
}