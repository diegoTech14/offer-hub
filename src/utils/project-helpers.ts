// Utility Functions for Project Operations and Data Manipulation
import { 
  Project, 
  ProjectFilters, 
  ProjectSearchParams, 
  ProjectStatistics,
  ProjectAnalytics,
  ProjectExportOptions,
  ProjectExportResult,
  ProjectStatus,
  ProjectDraft,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectValidationResult,
  ProjectVersion,
  PaginationInfo
} from '@/types/project.types';

// Project Data Transformation
export const transformProjectData = {
  // Convert draft to create DTO
  draftToCreateDTO: (draft: ProjectDraft): CreateProjectDTO => ({
    client_id: draft.client_id,
    title: draft.title,
    description: draft.description,
    category: draft.category,
    budget: draft.budgetAmount,
    subcategory: draft.subcategory,
    skills: draft.skills,
    experienceLevel: draft.experienceLevel as any,
    projectType: draft.projectType,
    visibility: draft.visibility,
    budgetType: draft.budgetType,
    duration: draft.duration,
    attachments: draft.attachments,
    milestones: draft.milestones,
    tags: draft.tags,
    location: draft.location,
    deadline: draft.deadline,
    requirements: draft.requirements
  }),

  // Convert create DTO to draft
  createDTOToDraft: (dto: CreateProjectDTO): ProjectDraft => ({
    client_id: dto.client_id,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    budgetAmount: dto.budget,
    subcategory: dto.subcategory,
    skills: dto.skills || [],
    experienceLevel: dto.experienceLevel || 'intermediate',
    projectType: dto.projectType || 'on-time',
    visibility: dto.visibility || 'public',
    budgetType: dto.budgetType || 'fixed',
    duration: dto.duration || '',
    attachments: dto.attachments || [],
    milestones: dto.milestones || [],
    tags: dto.tags || [],
    location: dto.location,
    deadline: dto.deadline,
    requirements: dto.requirements || []
  }),

  // Normalize project data
  normalizeProject: (project: any): Project => ({
    id: project.id || '',
    client_id: project.client_id || '',
    title: project.title || '',
    description: project.description || '',
    category: project.category || '',
    subcategory: project.subcategory || '',
    budget: Number(project.budget) || 0,
    budgetType: project.budgetType || 'fixed',
    status: project.status || 'pending',
    visibility: project.visibility || 'public',
    projectType: project.projectType || 'on-time',
    experienceLevel: project.experienceLevel || 'intermediate',
    duration: project.duration || '',
    deadline: project.deadline || '',
    skills: Array.isArray(project.skills) ? project.skills : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    attachments: Array.isArray(project.attachments) ? project.attachments : [],
    milestones: Array.isArray(project.milestones) ? project.milestones : [],
    requirements: Array.isArray(project.requirements) ? project.requirements : [],
    location: project.location || undefined,
    version: Number(project.version) || 1,
    created_at: project.created_at || new Date().toISOString(),
    updated_at: project.updated_at || new Date().toISOString(),
    published_at: project.published_at || undefined,
    archived_at: project.archived_at || undefined,
    deleted_at: project.deleted_at || undefined,
    client: project.client || undefined,
    applications: project.applications || [],
    statistics: project.statistics || undefined,
    metadata: project.metadata || undefined
  }),

  // Sanitize project data for API
  sanitizeForAPI: (project: any): any => {
    const sanitized = { ...project };
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Convert dates to ISO strings
    const dateFields = ['created_at', 'updated_at', 'published_at', 'archived_at', 'deleted_at', 'deadline'];
    dateFields.forEach(field => {
      if (sanitized[field] && sanitized[field] instanceof Date) {
        sanitized[field] = sanitized[field].toISOString();
      }
    });

    return sanitized;
  }
};

// Project Filtering and Search
export const projectFilters = {
  // Apply filters to projects
  applyFilters: (projects: Project[], filters: ProjectFilters): Project[] => {
    return projects.filter(project => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(project.status as ProjectStatus)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(project.category)) {
          return false;
        }
      }

      // Subcategory filter
      if (filters.subcategory && filters.subcategory.length > 0) {
        if (!project.subcategory || !filters.subcategory.includes(project.subcategory)) {
          return false;
        }
      }

      // Budget filter
      if (filters.budget_min !== undefined && project.budget < filters.budget_min) {
        return false;
      }
      if (filters.budget_max !== undefined && project.budget > filters.budget_max) {
        return false;
      }

      // Budget type filter
      if (filters.budget_type && filters.budget_type.length > 0) {
        if (!filters.budget_type.includes(project.budgetType)) {
          return false;
        }
      }

      // Project type filter
      if (filters.project_type && filters.project_type.length > 0) {
        if (!filters.project_type.includes(project.projectType)) {
          return false;
        }
      }

      // Experience level filter
      if (filters.experience_level && filters.experience_level.length > 0) {
        if (!filters.experience_level.includes(project.experienceLevel)) {
          return false;
        }
      }

      // Visibility filter
      if (filters.visibility && filters.visibility.length > 0) {
        if (!filters.visibility.includes(project.visibility)) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const hasRequiredSkills = filters.skills.some(skill => 
          project.skills.some(projectSkill => 
            projectSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasRequiredSkills) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.some(tag => 
          project.tags.some(projectTag => 
            projectTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasRequiredTags) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        if (filters.location.country && project.location?.country !== filters.location.country) {
          return false;
        }
        if (filters.location.state && project.location?.state !== filters.location.state) {
          return false;
        }
        if (filters.location.city && project.location?.city !== filters.location.city) {
          return false;
        }
        if (filters.location.remote !== undefined && project.location?.remote !== filters.location.remote) {
          return false;
        }
      }

      // Date range filter
      if (filters.date_range) {
        const projectDate = new Date(project.created_at);
        if (filters.date_range.start && projectDate < new Date(filters.date_range.start)) {
          return false;
        }
        if (filters.date_range.end && projectDate > new Date(filters.date_range.end)) {
          return false;
        }
      }

      // Client filter
      if (filters.client_id && project.client_id !== filters.client_id) {
        return false;
      }

      // Featured filter
      if (filters.featured !== undefined && project.metadata?.featured !== filters.featured) {
        return false;
      }

      return true;
    });
  },

  // Search projects by text
  searchProjects: (projects: Project[], query: string): Project[] => {
    if (!query.trim()) return projects;

    const searchTerm = query.toLowerCase();
    
    return projects.filter(project => {
      return (
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.category.toLowerCase().includes(searchTerm) ||
        (project.subcategory && project.subcategory.toLowerCase().includes(searchTerm)) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    });
  },

  // Sort projects
  sortProjects: (projects: Project[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Project[] => {
    return [...projects].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
};

// Project Statistics and Analytics
export const projectAnalytics = {
  // Calculate project statistics
  calculateStats: (projects: Project[]): ProjectStatistics => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const averageBudget = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.budget, 0) / totalProjects : 0;

    // Calculate popular categories
    const categoryCounts = projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalProjects) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate budget distribution
    const budgetRanges = [
      { range: '$0 - $100', min: 0, max: 100 },
      { range: '$100 - $500', min: 100, max: 500 },
      { range: '$500 - $1,000', min: 500, max: 1000 },
      { range: '$1,000 - $5,000', min: 1000, max: 5000 },
      { range: '$5,000 - $10,000', min: 5000, max: 10000 },
      { range: '$10,000+', min: 10000, max: Infinity }
    ];

    const budgetDistribution = budgetRanges.map(range => {
      const count = projects.filter(p => p.budget >= range.min && p.budget < range.max).length;
      return {
        range: range.range,
        count,
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0
      };
    });

    // Calculate timeline stats (last 12 months)
    const timelineStats = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const periodProjects = projects.filter(p => {
        const projectDate = new Date(p.created_at);
        return projectDate >= date && projectDate < nextDate;
      });

      timelineStats.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        created: periodProjects.length,
        completed: periodProjects.filter(p => p.status === 'completed').length,
        cancelled: periodProjects.filter(p => p.status === 'cancelled').length
      });
    }

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      averageBudget,
      popularCategories,
      budgetDistribution,
      timelineStats
    };
  },

  // Calculate project analytics
  calculateAnalytics: (projects: Project[]): ProjectAnalytics => {
    const stats = projectAnalytics.calculateStats(projects);
    
    return {
      totalProjects: stats.totalProjects,
      activeProjects: stats.activeProjects,
      completedProjects: stats.completedProjects,
      averageBudget: stats.averageBudget,
      popularCategories: stats.popularCategories,
      budgetDistribution: stats.budgetDistribution,
      timelineStats: stats.timelineStats
    };
  }
};

// Project Export Utilities
export const projectExport = {
  // Export projects to JSON
  exportToJSON: (projects: Project[], options: ProjectExportOptions): ProjectExportResult => {
    try {
      let filteredProjects = projects;

      // Apply filters
      if (options.filters) {
        filteredProjects = projectFilters.applyFilters(projects, options.filters);
      }

      // Apply date range
      if (options.dateRange) {
        filteredProjects = filteredProjects.filter(project => {
          const projectDate = new Date(project.created_at);
          return projectDate >= new Date(options.dateRange!.start) && 
                 projectDate <= new Date(options.dateRange!.end);
        });
      }

      // Filter fields if specified
      if (options.fields && options.fields.length > 0) {
        filteredProjects = filteredProjects.map(project => {
          const filteredProject: any = {};
          options.fields!.forEach(field => {
            if (field in project) {
              filteredProject[field] = (project as any)[field];
            }
          });
          return filteredProject as Project;
        });
      }

      const data = JSON.stringify(filteredProjects, null, 2);
      const filename = `projects_${new Date().toISOString().split('T')[0]}.json`;

      return {
        success: true,
        data,
        filename,
        size: new Blob([data]).size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  },

  // Export projects to CSV
  exportToCSV: (projects: Project[], options: ProjectExportOptions): ProjectExportResult => {
    try {
      let filteredProjects = projects;

      // Apply filters (same as JSON export)
      if (options.filters) {
        filteredProjects = projectFilters.applyFilters(projects, options.filters);
      }

      if (options.dateRange) {
        filteredProjects = filteredProjects.filter(project => {
          const projectDate = new Date(project.created_at);
          return projectDate >= new Date(options.dateRange!.start) && 
                 projectDate <= new Date(options.dateRange!.end);
        });
      }

      // Convert to CSV
      const fields = options.fields || [
        'id', 'title', 'description', 'category', 'budget', 'status', 
        'created_at', 'updated_at', 'client_id'
      ];

      const headers = fields.join(',');
      const rows = filteredProjects.map(project => {
        return fields.map(field => {
          const value = (project as any)[field];
          // Escape CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',');
      });

      const csv = [headers, ...rows].join('\n');
      const filename = `projects_${new Date().toISOString().split('T')[0]}.csv`;

      return {
        success: true,
        data: csv,
        filename,
        size: new Blob([csv]).size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
};

// Project Validation Utilities
export const projectValidation = {
  // Validate project data
  validateProject: (project: CreateProjectDTO | UpdateProjectDTO): ProjectValidationResult => {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic validation
    if (!project.title || project.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED_TITLE'
      });
    }

    if (!project.description || project.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'REQUIRED_DESCRIPTION'
      });
    }

    if (!project.budget || project.budget <= 0) {
      errors.push({
        field: 'budget',
        message: 'Budget must be greater than 0',
        code: 'INVALID_BUDGET'
      });
    }

    // Business logic validation
    if (project.budget > 1000000) {
      warnings.push({
        field: 'budget',
        message: 'Budget is very high. Please verify this is correct.',
        code: 'HIGH_BUDGET'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validate project status transition
  validateStatusTransition: (currentStatus: ProjectStatus, newStatus: ProjectStatus): boolean => {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'draft': ['pending', 'published'],
      'pending': ['published', 'cancelled'],
      'published': ['active', 'cancelled'],
      'active': ['completed', 'cancelled'],
      'completed': ['archived'],
      'cancelled': ['archived'],
      'archived': [],
      'deleted': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
};

// Project Pagination Utilities
export const projectPagination = {
  // Paginate projects
  paginate: (projects: Project[], page: number, limit: number): {
    data: Project[];
    pagination: PaginationInfo;
  } => {
    const total = projects.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = projects.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // Create pagination info
  createPaginationInfo: (page: number, limit: number, total: number): PaginationInfo => {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
};

// Project Comparison Utilities
export const projectComparison = {
  // Compare two projects
  compare: (project1: Project, project2: Project): Record<string, { old: any; new: any }> => {
    const changes: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([...Object.keys(project1), ...Object.keys(project2)]);

    allKeys.forEach(key => {
      const oldValue = (project1 as any)[key];
      const newValue = (project2 as any)[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    return changes;
  },

  // Get changed fields
  getChangedFields: (project1: Project, project2: Project): string[] => {
    const changes = projectComparison.compare(project1, project2);
    return Object.keys(changes);
  },

  // Check if project has significant changes
  hasSignificantChanges: (project1: Project, project2: Project): boolean => {
    const significantFields = ['title', 'description', 'budget', 'status', 'deadline'];
    const changes = projectComparison.compare(project1, project2);
    
    return significantFields.some(field => field in changes);
  }
};

// Project Formatting Utilities
export const projectFormatting = {
  // Format budget
  formatBudget: (budget: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(budget);
  },

  // Format date
  formatDate: (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'relative':
        const now = new Date();
        const diffInMs = now.getTime() - dateObj.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
      default:
        return dateObj.toLocaleDateString('en-US');
    }
  },

  // Format project status
  formatStatus: (status: ProjectStatus): string => {
    const statusMap: Record<ProjectStatus, string> = {
      'draft': 'Draft',
      'pending': 'Pending',
      'published': 'Published',
      'active': 'Active',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'archived': 'Archived',
      'deleted': 'Deleted'
    };

    return statusMap[status] || status;
  },

  // Truncate text
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

// Project Search Utilities
export const projectSearch = {
  // Build search query
  buildSearchQuery: (params: ProjectSearchParams): string => {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('q', params.query);
    }
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    if (params.pagination) {
      queryParams.append('page', params.pagination.page.toString());
      queryParams.append('limit', params.pagination.limit.toString());
    }
    
    if (params.sorting) {
      queryParams.append('sort', `${params.sorting.field}:${params.sorting.order}`);
    }
    
    return queryParams.toString();
  },

  // Parse search query
  parseSearchQuery: (queryString: string): ProjectSearchParams => {
    const params = new URLSearchParams(queryString);
    const result: ProjectSearchParams = {};
    
    if (params.has('q')) {
      result.query = params.get('q') || undefined;
    }
    
    // Parse filters
    const filters: ProjectFilters = {};
    const filterKeys = [
      'status', 'category', 'subcategory', 'budget_min', 'budget_max',
      'budget_type', 'project_type', 'experience_level', 'visibility',
      'skills', 'tags', 'client_id', 'featured'
    ];
    
    filterKeys.forEach(key => {
      const values = params.getAll(key);
      if (values.length > 0) {
        if (key.includes('_min') || key.includes('_max') || key === 'featured') {
          (filters as any)[key] = key === 'featured' ? values[0] === 'true' : Number(values[0]);
        } else {
          (filters as any)[key] = values;
        }
      }
    });
    
    if (Object.keys(filters).length > 0) {
      result.filters = filters;
    }
    
    // Parse pagination
    if (params.has('page') && params.has('limit')) {
      result.pagination = {
        page: Number(params.get('page')),
        limit: Number(params.get('limit'))
      };
    }
    
    // Parse sorting
    if (params.has('sort')) {
      const [field, order] = (params.get('sort') || '').split(':');
      if (field && order) {
        result.sorting = {
          field,
          order: order as 'asc' | 'desc'
        };
      }
    }
    
    return result;
  }
};

// Export all utilities
export const projectUtils = {
  transform: transformProjectData,
  filter: projectFilters,
  analytics: projectAnalytics,
  export: projectExport,
  validation: projectValidation,
  pagination: projectPagination,
  comparison: projectComparison,
  formatting: projectFormatting,
  search: projectSearch
};
