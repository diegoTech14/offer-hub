// Comprehensive Project Management Hook with Full CRUD Operations
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Project, 
  CreateProjectDTO, 
  UpdateProjectDTO, 
  ProjectFilters, 
  ProjectSearchParams,
  ProjectValidationResult,
  ProjectError,
  PaginationInfo,
  ProjectStatistics,
  ProjectVersion,
  UseProjectsOptions,
  UseProjectsReturn,
  ProjectResponse,
  ProjectsListResponse
} from '@/types/project.types';
import { useProjectCache } from './use-project-cache';
import { useProjectState } from './use-project-state';
import { useProjectValidation } from './use-project-validation';
import { projectUtils } from '@/utils/project-helpers';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const {
    autoFetch = true,
    refreshInterval = 300000, // 5 minutes
    enableCache = true,
    enableOptimisticUpdates = true,
    enableBackgroundSync = true,
    filters = {},
    pagination = { page: 1, limit: 20 }
  } = options;

  // Initialize hooks
  const cache = useProjectCache({
    ttl: 5 * 60 * 1000, // 5 minutes
    enableBackgroundRefresh: enableBackgroundSync
  });

  const state = useProjectState({
    enableOptimisticUpdates,
    enableUndoRedo: true,
    autoSave: true
  });

  const validation = useProjectValidation({
    strictMode: true,
    validateOnChange: true
  });

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize and auto-fetch
  useEffect(() => {
    if (autoFetch && !isInitialized) {
      initializeProjects();
    }

    // Setup refresh timer
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        if (enableBackgroundSync) {
          refreshAll();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, isInitialized, refreshInterval, enableBackgroundSync]);

  // Initialize projects
  const initializeProjects = useCallback(async () => {
    try {
      state.setLoading('fetching', true);
      state.clearError();

      // Try to get from cache first
      if (enableCache) {
        const cachedProjects = cache.getProjectsList(filters);
        if (cachedProjects && cachedProjects.length > 0) {
          state.setProjects(cachedProjects);
          setIsInitialized(true);
          state.setLoading('fetching', false);
          return;
        }
      }

      // Fetch from API
      await fetchProjects(filters);
      setIsInitialized(true);
    } catch (error) {
      handleError(error, 'initializeProjects');
    } finally {
      state.setLoading('fetching', false);
    }
  }, [enableCache, filters, state, cache]);

  // Error handling
  const handleError = useCallback((error: any, operation: string) => {
    const projectError: ProjectError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details || error,
      timestamp: new Date(),
      operation: operation as any,
      projectId: error.projectId
    };

    state.setError(projectError);
    console.error(`Project operation failed (${operation}):`, error);
  }, [state]);

  // API request helper
  const makeApiRequest = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

  // CRUD Operations
  const createProject = useCallback(async (projectData: CreateProjectDTO): Promise<Project> => {
    try {
      // Validate project data
      const validationResult = validation.validateProject(projectData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      state.setLoading('creating', true);
      state.clearError();

      // Apply optimistic update
      if (enableOptimisticUpdates) {
        const tempProject: Project = {
          id: `temp_${Date.now()}`,
          ...projectData,
          status: 'pending',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skills: projectData.skills || [],
          tags: projectData.tags || [],
          attachments: projectData.attachments || [],
          milestones: projectData.milestones || [],
          requirements: projectData.requirements || []
        };
        state.applyOptimisticUpdate(tempProject.id, tempProject);
      }

      // Make API request
      const response = await makeApiRequest<ProjectResponse>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create project');
      }

      const newProject = response.data;

      // Update state
      state.addProject(newProject);
      state.commitOptimisticUpdate(`temp_${Date.now()}`);

      // Update cache
      if (enableCache) {
        cache.setProject(newProject);
        cache.invalidateProject('list'); // Invalidate projects list cache
      }

      return newProject;
    } catch (error) {
      if (enableOptimisticUpdates) {
        state.revertOptimisticUpdate(`temp_${Date.now()}`);
      }
      handleError(error, 'createProject');
      throw error;
    } finally {
      state.setLoading('creating', false);
    }
  }, [validation, state, enableOptimisticUpdates, enableCache, cache, makeApiRequest, handleError]);

  const updateProject = useCallback(async (id: string, updates: Partial<UpdateProjectDTO>): Promise<Project> => {
    try {
      // Validate update data
      const validationResult = validation.validateProject(updates as any);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      state.setLoading('updating', true);
      state.clearError();

      // Get current project for optimistic update
      const currentProject = state.state.projects.find(p => p.id === id);
      if (!currentProject) {
        throw new Error('Project not found');
      }

      // Apply optimistic update
      if (enableOptimisticUpdates) {
        state.applyOptimisticUpdate(id, updates);
      }

      // Make API request
      const response = await makeApiRequest<ProjectResponse>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update project');
      }

      const updatedProject = response.data;

      // Update state
      state.updateProject(id, updatedProject);
      state.commitOptimisticUpdate(id);

      // Update cache
      if (enableCache) {
        cache.setProject(updatedProject);
        cache.invalidateProject('list'); // Invalidate projects list cache
      }

      return updatedProject;
    } catch (error) {
      if (enableOptimisticUpdates) {
        state.revertOptimisticUpdate(id);
      }
      handleError(error, 'updateProject');
      throw error;
    } finally {
      state.setLoading('updating', false);
    }
  }, [validation, state, enableOptimisticUpdates, enableCache, cache, makeApiRequest, handleError]);

  const deleteProject = useCallback(async (id: string, softDelete: boolean = true): Promise<void> => {
    try {
      state.setLoading('deleting', true);
      state.clearError();

      // Apply optimistic update
      if (enableOptimisticUpdates) {
        state.applyOptimisticUpdate(id, { 
          status: softDelete ? 'deleted' : 'deleted',
          deleted_at: new Date().toISOString()
        });
      }

      // Make API request
      const response = await makeApiRequest<{ success: boolean; message: string }>(`/api/projects/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ softDelete })
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete project');
      }

      // Update state
      if (softDelete) {
        state.updateProject(id, { 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        });
      } else {
        state.removeProject(id);
      }
      state.commitOptimisticUpdate(id);

      // Update cache
      if (enableCache) {
        cache.invalidateProject(id);
        cache.invalidateProject('list'); // Invalidate projects list cache
      }
    } catch (error) {
      if (enableOptimisticUpdates) {
        state.revertOptimisticUpdate(id);
      }
      handleError(error, 'deleteProject');
      throw error;
    } finally {
      state.setLoading('deleting', false);
    }
  }, [state, enableOptimisticUpdates, enableCache, cache, makeApiRequest, handleError]);

  const getProject = useCallback(async (id: string): Promise<Project> => {
    try {
      state.setLoading('fetching', true);
      state.clearError();

      // Try cache first
      if (enableCache) {
        const cachedProject = cache.getProject(id);
        if (cachedProject) {
          state.setCurrentProject(cachedProject);
          state.setLoading('fetching', false);
          return cachedProject;
        }
      }

      // Fetch from API
      const response = await makeApiRequest<ProjectResponse>(`/api/projects/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch project');
      }

      const project = response.data;

      // Update state and cache
      state.setCurrentProject(project);
      if (enableCache) {
        cache.setProject(project);
      }

      return project;
    } catch (error) {
      handleError(error, 'getProject');
      throw error;
    } finally {
      state.setLoading('fetching', false);
    }
  }, [state, enableCache, cache, makeApiRequest, handleError]);

  const getProjects = useCallback(async (projectFilters?: ProjectFilters): Promise<Project[]> => {
    try {
      state.setLoading('fetching', true);
      state.clearError();

      const filtersToUse = projectFilters || filters;

      // Try cache first
      if (enableCache) {
        const cachedProjects = cache.getProjectsList(filtersToUse);
        if (cachedProjects && cachedProjects.length > 0) {
          state.setProjects(cachedProjects);
          state.setLoading('fetching', false);
          return cachedProjects;
        }
      }

      // Fetch from API
      const projects = await fetchProjects(filtersToUse);
      return projects;
    } catch (error) {
      handleError(error, 'getProjects');
      throw error;
    } finally {
      state.setLoading('fetching', false);
    }
  }, [state, enableCache, cache, filters, handleError]);

  // Internal fetch function
  const fetchProjects = useCallback(async (projectFilters: ProjectFilters): Promise<Project[]> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(projectFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await makeApiRequest<ProjectsListResponse>(`/api/projects?${queryParams.toString()}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }

    const projects = response.data;

    // Update state and cache
    state.setProjects(projects);
    if (response.pagination) {
      state.setPagination(response.pagination);
    }
    if (enableCache) {
      cache.setProjectsList(projects, projectFilters);
    }

    return projects;
  }, [state, enableCache, cache, makeApiRequest]);

  // Search and Filter Operations
  const searchProjects = useCallback(async (params: ProjectSearchParams): Promise<Project[]> => {
    try {
      state.setLoading('searching', true);
      state.clearError();

      // Try cache first
      if (enableCache && params.query) {
        const cachedResults = cache.getSearchResults(params.query, params.filters);
        if (cachedResults && cachedResults.length > 0) {
          state.setLoading('searching', false);
          return cachedResults;
        }
      }

      // Build search query
      const queryString = projectUtils.search.buildSearchQuery(params);
      const response = await makeApiRequest<ProjectsListResponse>(`/api/projects/search?${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to search projects');
      }

      const results = response.data;

      // Update cache
      if (enableCache && params.query) {
        cache.setSearchResults(results, params.query, params.filters);
      }

      return results;
    } catch (error) {
      handleError(error, 'searchProjects');
      throw error;
    } finally {
      state.setLoading('searching', false);
    }
  }, [state, enableCache, cache, makeApiRequest, handleError]);

  const setFilters = useCallback((newFilters: ProjectFilters) => {
    state.setFilters(newFilters);
  }, [state]);

  const clearFilters = useCallback(() => {
    state.setFilters({});
  }, [state]);

  // Cache Management
  const refreshProject = useCallback(async (id: string): Promise<Project> => {
    try {
      // Invalidate cache
      if (enableCache) {
        cache.invalidateProject(id);
      }

      // Fetch fresh data
      return await getProject(id);
    } catch (error) {
      handleError(error, 'refreshProject');
      throw error;
    }
  }, [enableCache, cache, getProject, handleError]);

  const refreshAll = useCallback(async (): Promise<void> => {
    try {
      // Clear cache
      if (enableCache) {
        cache.clear();
      }

      // Fetch fresh data
      await getProjects();
    } catch (error) {
      handleError(error, 'refreshAll');
    }
  }, [enableCache, cache, getProjects, handleError]);

  const clearCache = useCallback(() => {
    if (enableCache) {
      cache.clear();
    }
  }, [enableCache, cache]);

  // State Management
  const setCurrentProject = useCallback((project: Project | null) => {
    state.setCurrentProject(project);
  }, [state]);

  const clearError = useCallback(() => {
    state.clearError();
  }, [state]);

  // Validation
  const validateProject = useCallback((project: CreateProjectDTO | UpdateProjectDTO): ProjectValidationResult => {
    return validation.validateProject(project);
  }, [validation]);

  // Statistics
  const getProjectStats = useCallback((): ProjectStatistics | null => {
    return state.getProjectStats();
  }, [state]);

  // Utility
  const isProjectModified = useCallback((id: string): boolean => {
    return state.isProjectModified(id);
  }, [state]);

  const getProjectHistory = useCallback((id: string): ProjectVersion[] => {
    return state.getProjectHistory(id);
  }, [state]);

  return {
    // Data
    projects: state.state.projects,
    currentProject: state.state.currentProject,
    pagination: state.state.pagination,
    
    // Loading States
    loading: state.state.loading,
    
    // Error Handling
    error: state.state.error,
    
    // CRUD Operations
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getProjects,
    
    // Search and Filter
    searchProjects,
    setFilters,
    clearFilters,
    
    // Cache Management
    refreshProject,
    refreshAll,
    clearCache,
    
    // State Management
    setCurrentProject,
    clearError,
    
    // Validation
    validateProject,
    
    // Statistics
    getProjectStats,
    
    // Utility
    isProjectModified,
    getProjectHistory
  };
}

// Specialized hooks for different use cases
export function useProjectCRUD() {
  const { createProject, updateProject, deleteProject, getProject, loading, error } = useProjects({
    autoFetch: false
  });

  return {
    createProject,
    updateProject,
    deleteProject,
    getProject,
    loading: {
      creating: loading.creating,
      updating: loading.updating,
      deleting: loading.deleting,
      fetching: loading.fetching
    },
    error
  };
}

export function useProjectSearch() {
  const { searchProjects, setFilters, clearFilters, loading, error } = useProjects({
    autoFetch: false
  });

  return {
    searchProjects,
    setFilters,
    clearFilters,
    loading: loading.searching,
    error
  };
}

export function useProjectList() {
  const { projects, getProjects, loading, error, pagination } = useProjects();

  return {
    projects,
    getProjects,
    loading: loading.fetching,
    error,
    pagination
  };
}

export function useProjectDetails(id: string) {
  const { currentProject, getProject, loading, error } = useProjects({
    autoFetch: false
  });

  useEffect(() => {
    if (id) {
      getProject(id);
    }
  }, [id, getProject]);

  return {
    project: currentProject,
    getProject,
    loading: loading.fetching,
    error
  };
}

export function useProjectValidation() {
  const { validateProject } = useProjects({
    autoFetch: false
  });

  return {
    validateProject
  };
}

export function useProjectStatistics() {
  const { getProjectStats } = useProjects();

  return {
    getProjectStats
  };
}

// Export the main hook as default
export default useProjects;
