export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type ProjectType =
  | 'development'
  | 'design'
  | 'marketing'
  | 'writing'
  | 'consulting'
  | 'other';

export interface ApplicationMeta {
  createdBy: string;
  updatedBy?: string;
  source?: 'web' | 'mobile' | 'api';
  tags?: string[];
  locale?: string;
}

export interface Application {
  id: string;
  title: string;
  summary: string;
  description: string;
  status: ApplicationStatus;
  projectType: ProjectType;
  budget?: number;
  currency?: string;
  skills?: string[];
  attachments?: Array<{ id: string; name: string; url: string }>;
  meta?: ApplicationMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  title: string;
  summary: string;
  description: string;
  projectType: ProjectType;
  budget?: number;
  currency?: string;
  skills?: string[];
  attachments?: Array<{ name: string; url: string }>;
  meta?: ApplicationMeta;
}

export interface UpdateApplicationRequest {
  title?: string;
  summary?: string;
  description?: string;
  status?: ApplicationStatus;
  projectType?: ProjectType;
  budget?: number;
  currency?: string;
  skills?: string[];
  attachments?: Array<{ id?: string; name: string; url: string }>;
  meta?: ApplicationMeta;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  projectType?: ProjectType[];
  dateRange?: DateRange;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
  custom?: Record<string, unknown>;
  searchQuery?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchResult<T> {
  item: T;
  score: number; // 0-1 relevance
  highlights?: Array<{ field: keyof T; snippet: string }>;
}

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  filters?: ApplicationFilters;
  fields?: Array<keyof Application>;
  fileName?: string;
}

export interface LoadingState {
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastUpdated?: Date;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  ttlMs: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byProjectType: Record<ProjectType, number>;
  averageBudget?: number;
  skillsFrequency: Record<string, number>;
  createdMonthly: Array<{ month: string; count: number }>;
}

export interface UseApplicationsReturn {
  applications: Application[];
  paginated: PaginatedResult<Application>;
  filters: ApplicationFilters;
  loading: LoadingState;
  error: string | null;
  stats: ApplicationStats;
  // CRUD
  create: (req: CreateApplicationRequest) => Promise<Application>;
  update: (id: string, updates: UpdateApplicationRequest) => Promise<Application>;
  remove: (id: string) => Promise<void>;
  fetchAll: (force?: boolean) => Promise<void>;
  // Filtering/Search/Pagination
  applyFilters: (filters: ApplicationFilters) => void;
  clearFilters: () => void;
  search: (query: string) => SearchResult<Application>[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Export
  exportData: (options: ExportOptions) => Promise<Blob>;
  // Cache
  invalidateCache: (prefix?: string) => void;
}