// Comprehensive Project Management Hook with Full CRUD Operations
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilters,
  ProjectSearchParams,
  ProjectError,
  ProjectStatistics,
  ProjectVersion,
  UseProjectsOptions,
  UseProjectsReturn,
  ProjectResponse,
  ProjectsListResponse
} from '@/types/project.types';
import { useProjectCache } from './use-project-cache';
import { useProjectState } from './use-project-state';
import { useProjectValidation as useProjectValidator } from './use-project-validation';
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
    filters = {}
  } = options;

  // Initialize hooks
  const cache = useProjectCache({
    ttl: 5 * 60 * 1000, // 5 minutes
    enableBackgroundRefresh: enableBackgroundSync
  });

  const {
    state: projectState,
    setProjects,
    addProject,
    updateProject: updateStateProject,
    removeProject: removeStateProject,
    setCurrentProject,
    setLoading,
    setError,
    clearError,
    setFilters: setStateFilters,
    setPagination,
    applyOptimisticUpdate,
    revertOptimisticUpdate,
    commitOptimisticUpdate,
    getProjectStats: getStateProjectStats,
    isProjectModified: getStateProjectModified,
    getProjectHistory: getStateProjectHistory
  } = useProjectState({
    enableOptimisticUpdates,
    enableUndoRedo: true,
    autoSave: true
  });

  const validation = useProjectValidator({
    strictMode: true,
    validateOnChange: true
  });

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Error handling
  const handleError = useCallback((error: unknown, operation: string) => {
    if (error instanceof Error && error.name === 'AbortError') return; // Ignore cancelled requests

    const errorObj = error as Error & { code?: string; details?: unknown; projectId?: string };
    const projectError: ProjectError = {
      code: errorObj.code || 'UNKNOWN_ERROR',
      message: errorObj.message || 'An unexpected error occurred',
      details: errorObj.details || error,
      timestamp: new Date(),
      operation: operation as ProjectError['operation'],
      projectId: errorObj.projectId
    };

    setError(projectError);
    console.error(`Project operation failed (${operation}):`, error);
  }, [setError]);

  // API request helper
  const makeApiRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const method = options.method || 'GET';

    // Only cancel previous GET requests to avoid aborting mutations
    if (method === 'GET' && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    if (method === 'GET') {
      abortControllerRef.current = controller;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

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

    const projectsFromApi = response.data;

    // Update state and cache
    setProjects(projectsFromApi);
    if (response.pagination) {
      setPagination(response.pagination);
    }
    if (enableCache) {
      cache.setProjectsList(projectsFromApi, projectFilters);
    }

    return projectsFromApi;
  }, [setProjects, setPagination, enableCache, cache, makeApiRequest]);

  // Initialize projects
  const initializeProjects = useCallback(async () => {
    try {
      setLoading('fetching', true);
      clearError();

      // Try to get from cache first
      if (enableCache) {
        const cachedProjects = cache.getProjectsList(filters);
        if (cachedProjects && cachedProjects.length > 0) {
          setProjects(cachedProjects);
          setIsInitialized(true);
          setLoading('fetching', false);
          return;
        }
      }

      // Fetch from API
      await fetchProjects(filters);
      setIsInitialized(true);
    } catch (error) {
      handleError(error, 'initializeProjects');
    } finally {
      setLoading('fetching', false);
    }
  }, [enableCache, filters, setProjects, setLoading, clearError, cache, fetchProjects, handleError]);

  // Initialize and auto-fetch
  useEffect(() => {
    if (autoFetch && !isInitialized) {
      initializeProjects();
    }

    // Setup refresh timer
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        if (enableBackgroundSync) {
          // Use fetchProjects directly to avoid initializing status reset
          fetchProjects(filters).catch(err => handleError(err, 'refreshTimer'));
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
  }, [autoFetch, isInitialized, refreshInterval, enableBackgroundSync, initializeProjects, fetchProjects, filters, handleError]);

  // CRUD Operations
  const createProject = useCallback(async (projectData: CreateProjectDTO): Promise<Project> => {
    try {
      console.log('🔍 [useProjects] Starting createProject with data:', projectData);

      // Validate project data
      console.log('🔍 [useProjects] Validating project data...');
      const validationResult = validation.validateProject(projectData);
      if (!validationResult.isValid) {
        console.error('❌ [useProjects] Validation failed:', validationResult.errors);
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }
      console.log('✅ [useProjects] Validation passed');

      setLoading('creating', true);
      clearError();

      // Apply optimistic update
      const tempId = `temp_${Date.now()}`;
      if (enableOptimisticUpdates) {
        console.log('🔍 [useProjects] Applying optimistic update...');
        const tempProject: Project = {
          id: tempId,
          client_id: projectData.client_id || '',
          title: projectData.title || '',
          description: projectData.description || '',
          category: projectData.category || '',
          budget: projectData.budget || 0,
          budgetType: projectData.budgetType || 'fixed',
          status: 'pending',
          visibility: projectData.visibility || 'public',
          projectType: projectData.projectType || 'on-time',
          experienceLevel: projectData.experienceLevel || 'entry',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skills: projectData.skills || [],
          tags: projectData.tags || [],
          attachments: projectData.attachments || [],
          milestones: projectData.milestones || [],
          requirements: projectData.requirements || []
        };
        applyOptimisticUpdate(tempId, tempProject);
      }

      // Make API request
      console.log('🌐 [useProjects] Making API request to /api/projects...');
      const response = await makeApiRequest<ProjectResponse>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      console.log('📥 [useProjects] API response received:', response);

      if (!response.success) {
        console.error('❌ [useProjects] API returned error:', response.message);
        throw new Error(response.message || 'Failed to create project');
      }

      const newProject = response.data;
      console.log('✅ [useProjects] Project created successfully:', newProject);

      // Update state
      addProject(newProject);
      if (enableOptimisticUpdates) {
        commitOptimisticUpdate(tempId);
      }

      // Update cache
      if (enableCache) {
        cache.setProject(newProject);
        cache.invalidateProject('list'); // Invalidate projects list cache
      }

      return newProject;
    } catch (error) {
      console.error('❌ [useProjects] Error in createProject:', error);
      if (enableOptimisticUpdates) {
        revertOptimisticUpdate(`temp_${Date.now()}`); // Approx
      }
      handleError(error, 'createProject');
      throw error;
    } finally {
      console.log('🏁 [useProjects] Finishing createProject, setting loading to false');
      setLoading('creating', false);
    }
  }, [validation, setLoading, clearError, enableOptimisticUpdates, applyOptimisticUpdate, makeApiRequest, addProject, commitOptimisticUpdate, enableCache, cache, revertOptimisticUpdate, handleError]);

  const updateProject = useCallback(async (id: string, updates: Partial<UpdateProjectDTO>): Promise<Project> => {
    try {
      // Validate update data
      const validationResult = validation.validateProject(updates as CreateProjectDTO | UpdateProjectDTO);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      setLoading('updating', true);
      clearError();

      // Apply optimistic update
      if (enableOptimisticUpdates) {
        applyOptimisticUpdate(id, updates);
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
      updateStateProject(id, updatedProject);
      if (enableOptimisticUpdates) {
        commitOptimisticUpdate(id);
      }

      // Update cache
      if (enableCache) {
        cache.setProject(updatedProject);
        cache.invalidateProject('list');
      }

      return updatedProject;
    } catch (error) {
      if (enableOptimisticUpdates) {
        revertOptimisticUpdate(id);
      }
      handleError(error, 'updateProject');
      throw error;
    } finally {
      setLoading('updating', false);
    }
  }, [validation, setLoading, clearError, enableOptimisticUpdates, applyOptimisticUpdate, makeApiRequest, updateStateProject, commitOptimisticUpdate, enableCache, cache, revertOptimisticUpdate, handleError]);

  const deleteProject = useCallback(async (id: string, softDelete: boolean = true): Promise<void> => {
    try {
      setLoading('deleting', true);
      clearError();

      // Apply optimistic update
      if (enableOptimisticUpdates) {
        applyOptimisticUpdate(id, {
          status: 'deleted' as const,
          deleted_at: new Date().toISOString()
        } as Partial<Project>);
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
        updateStateProject(id, {
          status: 'deleted' as const,
          deleted_at: new Date().toISOString()
        } as Partial<Project>);
      } else {
        removeStateProject(id);
      }

      if (enableOptimisticUpdates) {
        commitOptimisticUpdate(id);
      }

      // Update cache
      if (enableCache) {
        cache.invalidateProject(id);
        cache.invalidateProject('list');
      }
    } catch (error) {
      if (enableOptimisticUpdates) {
        revertOptimisticUpdate(id);
      }
      handleError(error, 'deleteProject');
      throw error;
    } finally {
      setLoading('deleting', false);
    }
  }, [setLoading, clearError, enableOptimisticUpdates, applyOptimisticUpdate, makeApiRequest, updateStateProject, removeStateProject, commitOptimisticUpdate, enableCache, cache, revertOptimisticUpdate, handleError]);

  const getProject = useCallback(async (id: string): Promise<Project> => {
    try {
      setLoading('fetching', true);
      clearError();

      // Try cache first
      if (enableCache) {
        const cachedProject = cache.getProject(id);
        if (cachedProject) {
          setCurrentProject(cachedProject);
          setLoading('fetching', false);
          return cachedProject;
        }
      }

      // Fetch from API
      const response = await makeApiRequest<ProjectResponse>(`/api/projects/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch project');
      }

      const projectFromApi = response.data;

      // Update state and cache
      setCurrentProject(projectFromApi);
      if (enableCache) {
        cache.setProject(projectFromApi);
      }

      return projectFromApi;
    } catch (error) {
      handleError(error, 'getProject');
      throw error;
    } finally {
      setLoading('fetching', false);
    }
  }, [setLoading, clearError, enableCache, cache, setCurrentProject, makeApiRequest, handleError]);

  const getProjects = useCallback(async (projectFilters?: ProjectFilters): Promise<Project[]> => {
    try {
      setLoading('fetching', true);
      clearError();

      const filtersToUse = projectFilters || filters;

      // Try cache first
      if (enableCache) {
        const cachedProjects = cache.getProjectsList(filtersToUse);
        if (cachedProjects && cachedProjects.length > 0) {
          setProjects(cachedProjects);
          setLoading('fetching', false);
          return cachedProjects;
        }
      }

      // Fetch from API
      return await fetchProjects(filtersToUse);
    } catch (error) {
      handleError(error, 'getProjects');
      throw error;
    } finally {
      setLoading('fetching', false);
    }
  }, [setLoading, clearError, filters, enableCache, cache, setProjects, fetchProjects, handleError]);

  // Search and Filter Operations
  const searchProjects = useCallback(async (params: ProjectSearchParams): Promise<Project[]> => {
    try {
      setLoading('searching', true);
      clearError();

      // Try cache first
      if (enableCache && params.query) {
        const cachedResults = cache.getSearchResults(params.query, params.filters);
        if (cachedResults && cachedResults.length > 0) {
          setLoading('searching', false);
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
      setLoading('searching', false);
    }
  }, [setLoading, clearError, enableCache, cache, makeApiRequest, handleError]);

  const setFilters = useCallback((newFilters: ProjectFilters) => {
    setStateFilters(newFilters);
  }, [setStateFilters]);

  const clearFilters = useCallback(() => {
    setStateFilters({});
  }, [setStateFilters]);

  // Cache Management
  const refreshProject = useCallback(async (id: string): Promise<Project> => {
    if (enableCache) cache.invalidateProject(id);
    return await getProject(id);
  }, [enableCache, cache, getProject]);

  const refreshAll = useCallback(async (): Promise<void> => {
    if (enableCache) cache.clear();
    await getProjects();
  }, [enableCache, cache, getProjects]);

  const clearCache = useCallback(() => {
    if (enableCache) cache.clear();
  }, [enableCache, cache]);

  // Statistics
  const getProjectStats = useCallback((): ProjectStatistics | null => {
    return getStateProjectStats();
  }, [getStateProjectStats]);

  // Utility
  const isProjectModified = useCallback((id: string): boolean => {
    return getStateProjectModified(id);
  }, [getStateProjectModified]);

  const getProjectHistory = useCallback((id: string): ProjectVersion[] => {
    return getStateProjectHistory(id);
  }, [getStateProjectHistory]);

  return {
    // Data
    projects: projectState.projects,
    currentProject: projectState.currentProject,
    pagination: projectState.pagination,

    // Loading States
    loading: projectState.loading,

    // Error Handling
    error: projectState.error,

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
    validateProject: (p) => validation.validateProject(p),

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

export default useProjects;
