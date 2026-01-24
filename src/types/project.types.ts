// Enhanced Project Types for Comprehensive Project Management
export interface CreateProjectDTO {
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  subcategory?: string;
  skills?: string[];
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
  projectType?: 'on-time' | 'ongoing';
  visibility?: 'public' | 'private';
  budgetType?: 'fixed' | 'hourly';
  duration?: string;
  attachments?: ProjectAttachment[];
  milestones?: ProjectMilestone[];
  tags?: string[];
  location?: ProjectLocation;
  deadline?: string;
  requirements?: ProjectRequirement[];
  status?: ProjectStatus;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  id: string;
  version?: number;
  changeReason?: string;
}

export interface ProjectResponse {
  message: string;
  success: boolean;
  data: Project;
  pagination?: PaginationInfo;
}

export interface ProjectsListResponse {
  message: string;
  success: boolean;
  data: Project[];
  pagination?: PaginationInfo;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  status: ProjectStatus;
  visibility: 'public' | 'private';
  projectType: 'on-time' | 'ongoing';
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  duration?: string;
  deadline?: string;
  skills: string[];
  tags: string[];
  attachments: ProjectAttachment[];
  milestones: ProjectMilestone[];
  requirements: ProjectRequirement[];
  location?: ProjectLocation;
  version: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
  deleted_at?: string;
  client?: ProjectClient;
  applications?: ProjectApplication[];
  statistics?: ProjectStatistics;
  metadata?: ProjectMetadata;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  mimeType: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  completed_at?: string;
  created_at: string;
}

export interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  type: 'mandatory' | 'preferred' | 'optional';
  category: 'skill' | 'experience' | 'certification' | 'portfolio' | 'other';
  weight?: number;
}

export interface ProjectLocation {
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  remote?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ProjectClient {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating?: number;
  totalProjects?: number;
  verified?: boolean;
  location?: string;
}

export interface ProjectApplication {
  id: string;
  freelancer_id: string;
  project_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposal: string;
  bid_amount?: number;
  timeline?: string;
  created_at: string;
  updated_at: string;
  freelancer?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    skills: string[];
  };
}

export interface ProjectStatistics {
  views: number;
  applications: number;
  saved: number;
  shared: number;
  last_viewed?: string;
  conversion_rate?: number;
}

export interface ProjectMetadata {
  seo_title?: string;
  seo_description?: string;
  featured?: boolean;
  priority?: number;
  custom_fields?: Record<string, any>;
  integration_data?: Record<string, any>;
}

export interface ProjectDraft {
  client_id: string;
  title: string;
  description: string;
  category: string;
  budgetAmount: number;
  subcategory?: string;
  skills: string[];
  experienceLevel: string;
  projectType: "on-time" | "ongoing";
  visibility: "public" | "private";
  budgetType: "fixed" | "hourly";
  duration: string;
  attachments: ProjectAttachment[];
  milestones: ProjectMilestone[];
  tags?: string[];
  location?: ProjectLocation;
  deadline?: string;
  requirements?: ProjectRequirement[];
}

// Project Status Types
export type ProjectStatus = 
  | 'draft'
  | 'pending'
  | 'published'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'archived'
  | 'deleted';

// Project Filter Types
export interface ProjectFilters {
  status?: ProjectStatus[];
  category?: string[];
  subcategory?: string[];
  budget_min?: number;
  budget_max?: number;
  budget_type?: ('fixed' | 'hourly')[];
  project_type?: ('on-time' | 'ongoing')[];
  experience_level?: ('entry' | 'intermediate' | 'expert')[];
  visibility?: ('public' | 'private')[];
  skills?: string[];
  tags?: string[];
  location?: {
    country?: string;
    state?: string;
    city?: string;
    remote?: boolean;
  };
  date_range?: {
    start?: string;
    end?: string;
  };
  client_id?: string;
  search?: string;
  featured?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'budget' | 'deadline' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Project Search Types
export interface ProjectSearchParams {
  query?: string;
  filters?: ProjectFilters;
  pagination?: {
    page: number;
    limit: number;
  };
  sorting?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Project Validation Types
export interface ProjectValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ProjectValidationResult {
  isValid: boolean;
  errors: ProjectValidationError[];
  warnings: ProjectValidationError[];
}

// Project Cache Types
export interface ProjectCacheEntry {
  data: Project | Project[];
  timestamp: number;
  ttl: number;
  version: number;
  metadata?: {
    source: 'api' | 'cache' | 'local';
    lastModified?: string;
    etag?: string;
  };
}

export interface ProjectCacheConfig {
  ttl: number;
  maxSize: number;
  enableBackgroundRefresh: boolean;
  enableOfflineSupport: boolean;
  compressionEnabled: boolean;
}

// Project State Types
export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    searching: boolean;
  };
  error: ProjectError | null;
  filters: ProjectFilters;
  pagination: PaginationInfo | null;
  lastUpdated: Date | null;
  cache: Map<string, ProjectCacheEntry>;
  optimisticUpdates: Map<string, Partial<Project>>;
}

export interface ProjectError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  operation: 'create' | 'read' | 'update' | 'delete' | 'search';
  projectId?: string;
}

// Project Hook Types
export interface UseProjectsOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
  enableOptimisticUpdates?: boolean;
  enableBackgroundSync?: boolean;
  filters?: ProjectFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface UseProjectsReturn {
  // Data
  projects: Project[];
  currentProject: Project | null;
  pagination: PaginationInfo | null;
  
  // Loading States
  loading: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    searching: boolean;
  };
  
  // Error Handling
  error: ProjectError | null;
  
  // CRUD Operations
  createProject: (project: CreateProjectDTO) => Promise<Project>;
  updateProject: (id: string, updates: Partial<UpdateProjectDTO>) => Promise<Project>;
  deleteProject: (id: string, softDelete?: boolean) => Promise<void>;
  getProject: (id: string) => Promise<Project>;
  getProjects: (filters?: ProjectFilters) => Promise<Project[]>;
  
  // Search and Filter
  searchProjects: (params: ProjectSearchParams) => Promise<Project[]>;
  setFilters: (filters: ProjectFilters) => void;
  clearFilters: () => void;
  
  // Cache Management
  refreshProject: (id: string) => Promise<Project>;
  refreshAll: () => Promise<void>;
  clearCache: () => void;
  
  // State Management
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
  
  // Validation
  validateProject: (project: CreateProjectDTO | UpdateProjectDTO) => ProjectValidationResult;
  
  // Statistics
  getProjectStats: () => ProjectStatistics | null;
  
  // Utility
  isProjectModified: (id: string) => boolean;
  getProjectHistory: (id: string) => ProjectVersion[];
}

// Project Version History
export interface ProjectVersion {
  id: string;
  project_id: string;
  version: number;
  changes: Record<string, any>;
  changed_by: string;
  change_reason?: string;
  created_at: string;
  snapshot: Partial<Project>;
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Project Analytics Types
export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageBudget: number;
  popularCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  budgetDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  timelineStats: Array<{
    period: string;
    created: number;
    completed: number;
    cancelled: number;
  }>;
}

// Project Export Types
export interface ProjectExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeArchived?: boolean;
  includeDeleted?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  fields?: string[];
  filters?: ProjectFilters;
}

export interface ProjectExportResult {
  success: boolean;
  data?: any;
  filename?: string;
  size?: number;
  error?: string;
}

// Project Integration Types
export interface ProjectIntegration {
  id: string;
  project_id: string;
  service: string;
  external_id: string;
  data: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  last_sync: string;
  created_at: string;
}

// Project Notification Types
export interface ProjectNotification {
  id: string;
  project_id: string;
  user_id: string;
  type: 'created' | 'updated' | 'deleted' | 'application' | 'milestone' | 'deadline';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Project Audit Types
export interface ProjectAuditLog {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Project Template Types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: Partial<CreateProjectDTO>;
  is_public: boolean;
  created_by: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Project Collaboration Types
export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  invited_by: string;
  joined_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// Project Workflow Types
export interface ProjectWorkflow {
  id: string;
  project_id: string;
  stage: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Project Backup Types
export interface ProjectBackup {
  id: string;
  project_id: string;
  backup_type: 'full' | 'incremental';
  data: Project;
  created_at: string;
  size: number;
  checksum: string;
}

// Project Migration Types
export interface ProjectMigration {
  id: string;
  from_version: string;
  to_version: string;
  migration_script: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  error?: string;
}

// Project Performance Types
export interface ProjectPerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  apiResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

// Project Security Types
export interface ProjectSecuritySettings {
  id: string;
  project_id: string;
  encryption_enabled: boolean;
  access_control: {
    public_read: boolean;
    authenticated_write: boolean;
    owner_only_delete: boolean;
  };
  audit_logging: boolean;
  data_retention_days: number;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

// Project Compliance Types
export interface ProjectCompliance {
  id: string;
  project_id: string;
  standard: string;
  version: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  last_audit: string;
  next_audit: string;
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  created_at: string;
  updated_at: string;
}