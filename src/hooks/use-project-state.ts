// State Management Hook for Complex Project Operations
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Project, 
  ProjectState, 
  ProjectError, 
  ProjectFilters, 
  PaginationInfo,
  ProjectValidationResult,
  ProjectVersion,
  ProjectStatistics,
  CreateProjectDTO,
  UpdateProjectDTO
} from '@/types/project.types';

export interface UseProjectStateOptions {
  enableOptimisticUpdates?: boolean;
  enableUndoRedo?: boolean;
  maxHistorySize?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  enableConflictResolution?: boolean;
  enableRealTimeSync?: boolean;
}

export interface UseProjectStateReturn {
  // State
  state: ProjectState;
  
  // Project operations
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  
  // Loading state management
  setLoading: (operation: keyof ProjectState['loading'], loading: boolean) => void;
  setError: (error: ProjectError | null) => void;
  clearError: () => void;
  
  // Filter and pagination
  setFilters: (filters: ProjectFilters) => void;
  setPagination: (pagination: PaginationInfo | null) => void;
  
  // Optimistic updates
  applyOptimisticUpdate: (id: string, updates: Partial<Project>) => void;
  revertOptimisticUpdate: (id: string) => void;
  commitOptimisticUpdate: (id: string) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getHistory: () => ProjectVersion[];
  
  // Validation
  validateProject: (project: CreateProjectDTO | UpdateProjectDTO) => ProjectValidationResult;
  setValidationErrors: (errors: ProjectValidationResult) => void;
  
  // Statistics
  getProjectStats: () => ProjectStatistics | null;
  updateProjectStats: (stats: ProjectStatistics) => void;
  
  // Utility
  isProjectModified: (id: string) => boolean;
  getProjectHistory: (id: string) => ProjectVersion[];
  reset: () => void;
}

export function useProjectState(options: UseProjectStateOptions = {}): UseProjectStateReturn {
  const {
    enableOptimisticUpdates = true,
    enableUndoRedo = true,
    maxHistorySize = 50,
    autoSave = false,
    autoSaveInterval = 30000, // 30 seconds
    enableConflictResolution = true,
    enableRealTimeSync = false
  } = options;

  // Main state
  const [state, setState] = useState<ProjectState>({
    projects: [],
    currentProject: null,
    loading: {
      fetching: false,
      creating: false,
      updating: false,
      deleting: false,
      searching: false
    },
    error: null,
    filters: {},
    pagination: null,
    lastUpdated: null,
    cache: new Map(),
    optimisticUpdates: new Map()
  });

  // History management
  const historyRef = useRef<ProjectVersion[]>([]);
  const historyIndexRef = useRef(-1);
  const pendingChangesRef = useRef<Map<string, Partial<Project>>>(new Map());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conflictResolutionRef = useRef<Map<string, any>>(new Map());

  // Initialize auto-save
  useEffect(() => {
    if (autoSave) {
      autoSaveTimerRef.current = setInterval(() => {
        savePendingChanges();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval]);

  // Save pending changes
  const savePendingChanges = useCallback(() => {
    if (pendingChangesRef.current.size === 0) return;

    const changes = Array.from(pendingChangesRef.current.entries());
    pendingChangesRef.current.clear();

    // In a real implementation, you would save these changes to the server
    console.log('Auto-saving pending changes:', changes);
  }, []);

  // Project operations
  const setProjects = useCallback((projects: Project[]) => {
    setState(prev => ({
      ...prev,
      projects,
      lastUpdated: new Date()
    }));

    // Add to history
    if (enableUndoRedo) {
      addToHistory('setProjects', { projects });
    }
  }, [enableUndoRedo]);

  const addProject = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, project],
      lastUpdated: new Date()
    }));

    // Add to history
    if (enableUndoRedo) {
      addToHistory('addProject', { project });
    }
  }, [enableUndoRedo]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState(prev => {
      const updatedProjects = prev.projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      );

      const updatedCurrentProject = prev.currentProject?.id === id 
        ? { ...prev.currentProject, ...updates }
        : prev.currentProject;

      return {
        ...prev,
        projects: updatedProjects,
        currentProject: updatedCurrentProject,
        lastUpdated: new Date()
      };
    });

    // Add to history
    if (enableUndoRedo) {
      addToHistory('updateProject', { id, updates });
    }

    // Add to pending changes for auto-save
    if (autoSave) {
      pendingChangesRef.current.set(id, updates);
    }
  }, [enableUndoRedo, autoSave]);

  const removeProject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id),
      currentProject: prev.currentProject?.id === id ? null : prev.currentProject,
      lastUpdated: new Date()
    }));

    // Add to history
    if (enableUndoRedo) {
      addToHistory('removeProject', { id });
    }
  }, [enableUndoRedo]);

  const setCurrentProject = useCallback((project: Project | null) => {
    setState(prev => ({
      ...prev,
      currentProject: project
    }));
  }, []);

  // Loading state management
  const setLoading = useCallback((operation: keyof ProjectState['loading'], loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [operation]: loading
      }
    }));
  }, []);

  const setError = useCallback((error: ProjectError | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Filter and pagination
  const setFilters = useCallback((filters: ProjectFilters) => {
    setState(prev => ({
      ...prev,
      filters
    }));
  }, []);

  const setPagination = useCallback((pagination: PaginationInfo | null) => {
    setState(prev => ({
      ...prev,
      pagination
    }));
  }, []);

  // Optimistic updates
  const applyOptimisticUpdate = useCallback((id: string, updates: Partial<Project>) => {
    if (!enableOptimisticUpdates) return;

    setState(prev => {
      const optimisticUpdates = new Map(prev.optimisticUpdates);
      optimisticUpdates.set(id, updates);

      return {
        ...prev,
        optimisticUpdates
      };
    });
  }, [enableOptimisticUpdates]);

  const revertOptimisticUpdate = useCallback((id: string) => {
    if (!enableOptimisticUpdates) return;

    setState(prev => {
      const optimisticUpdates = new Map(prev.optimisticUpdates);
      optimisticUpdates.delete(id);

      return {
        ...prev,
        optimisticUpdates
      };
    });
  }, [enableOptimisticUpdates]);

  const commitOptimisticUpdate = useCallback((id: string) => {
    if (!enableOptimisticUpdates) return;

    setState(prev => {
      const optimisticUpdates = new Map(prev.optimisticUpdates);
      const updates = optimisticUpdates.get(id);
      
      if (!updates) return prev;

      const updatedProjects = prev.projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      );

      const updatedCurrentProject = prev.currentProject?.id === id 
        ? { ...prev.currentProject, ...updates }
        : prev.currentProject;

      optimisticUpdates.delete(id);

      return {
        ...prev,
        projects: updatedProjects,
        currentProject: updatedCurrentProject,
        optimisticUpdates,
        lastUpdated: new Date()
      };
    });
  }, [enableOptimisticUpdates]);

  // History management
  const addToHistory = useCallback((action: string, data: any) => {
    if (!enableUndoRedo) return;

    const version: ProjectVersion = {
      id: `version_${Date.now()}`,
      project_id: data.id || 'global',
      version: historyRef.current.length + 1,
      changes: { action, ...data },
      changed_by: 'current_user', // In a real app, this would be the actual user ID
      change_reason: `Action: ${action}`,
      created_at: new Date().toISOString(),
      snapshot: data
    };

    // Remove any history after current index
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new version
    historyRef.current.push(version);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > maxHistorySize) {
      historyRef.current = historyRef.current.slice(-maxHistorySize);
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, [enableUndoRedo, maxHistorySize]);

  const undo = useCallback(() => {
    if (!enableUndoRedo || historyIndexRef.current <= 0) return;

    historyIndexRef.current--;
    const version = historyRef.current[historyIndexRef.current];
    
    if (version) {
      applyVersion(version);
    }
  }, [enableUndoRedo]);

  const redo = useCallback(() => {
    if (!enableUndoRedo || historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current++;
    const version = historyRef.current[historyIndexRef.current];
    
    if (version) {
      applyVersion(version);
    }
  }, [enableUndoRedo]);

  const applyVersion = useCallback((version: ProjectVersion) => {
    const { action, ...data } = version.changes;

    switch (action) {
      case 'setProjects':
        setState(prev => ({
          ...prev,
          projects: data.projects,
          lastUpdated: new Date()
        }));
        break;
      case 'addProject':
        setState(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== data.project.id),
          lastUpdated: new Date()
        }));
        break;
      case 'updateProject':
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(project => 
            project.id === data.id ? { ...project, ...data.updates } : project
          ),
          lastUpdated: new Date()
        }));
        break;
      case 'removeProject':
        // This would require storing the removed project to restore it
        break;
    }
  }, []);

  // Validation
  const validateProject = useCallback((project: CreateProjectDTO | UpdateProjectDTO): ProjectValidationResult => {
    // This would use the validation hook
    // For now, return a basic validation
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }, []);

  const setValidationErrors = useCallback((errors: ProjectValidationResult) => {
    // Store validation errors in state if needed
    console.log('Validation errors:', errors);
  }, []);

  // Statistics
  const getProjectStats = useCallback((): ProjectStatistics | null => {
    if (state.projects.length === 0) return null;

    const totalProjects = state.projects.length;
    const activeProjects = state.projects.filter(p => p.status === 'active').length;
    const completedProjects = state.projects.filter(p => p.status === 'completed').length;
    const averageBudget = state.projects.reduce((sum, p) => sum + p.budget, 0) / totalProjects;

    // Calculate popular categories
    const categoryCounts = state.projects.reduce((acc, project) => {
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
      .slice(0, 5);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      averageBudget,
      popularCategories,
      budgetDistribution: [], // Would calculate this based on budget ranges
      timelineStats: [] // Would calculate this based on creation dates
    };
  }, [state.projects]);

  const updateProjectStats = useCallback((stats: ProjectStatistics) => {
    // Store statistics in state if needed
    console.log('Updated project stats:', stats);
  }, []);

  // Utility functions
  const isProjectModified = useCallback((id: string): boolean => {
    return state.optimisticUpdates.has(id) || pendingChangesRef.current.has(id);
  }, [state.optimisticUpdates]);

  const getProjectHistory = useCallback((id: string): ProjectVersion[] => {
    return historyRef.current.filter(version => version.project_id === id);
  }, []);

  const reset = useCallback(() => {
    setState({
      projects: [],
      currentProject: null,
      loading: {
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
        searching: false
      },
      error: null,
      filters: {},
      pagination: null,
      lastUpdated: null,
      cache: new Map(),
      optimisticUpdates: new Map()
    });

    historyRef.current = [];
    historyIndexRef.current = -1;
    pendingChangesRef.current.clear();
    conflictResolutionRef.current.clear();
  }, []);

  return {
    // State
    state,
    
    // Project operations
    setProjects,
    addProject,
    updateProject,
    removeProject,
    setCurrentProject,
    
    // Loading state management
    setLoading,
    setError,
    clearError,
    
    // Filter and pagination
    setFilters,
    setPagination,
    
    // Optimistic updates
    applyOptimisticUpdate,
    revertOptimisticUpdate,
    commitOptimisticUpdate,
    
    // History management
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    getHistory: () => historyRef.current,
    
    // Validation
    validateProject,
    setValidationErrors,
    
    // Statistics
    getProjectStats,
    updateProjectStats,
    
    // Utility
    isProjectModified,
    getProjectHistory,
    reset
  };
}

// Specialized hooks for different use cases
export function useProjectOptimisticUpdates() {
  const { applyOptimisticUpdate, revertOptimisticUpdate, commitOptimisticUpdate, state } = useProjectState({
    enableOptimisticUpdates: true
  });

  return {
    applyOptimisticUpdate,
    revertOptimisticUpdate,
    commitOptimisticUpdate,
    hasOptimisticUpdates: state.optimisticUpdates.size > 0,
    optimisticUpdates: state.optimisticUpdates
  };
}

export function useProjectHistory() {
  const { undo, redo, canUndo, canRedo, getHistory } = useProjectState({
    enableUndoRedo: true
  });

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    history: getHistory()
  };
}

export function useProjectAutoSave() {
  const { state } = useProjectState({
    autoSave: true,
    autoSaveInterval: 30000
  });

  return {
    hasUnsavedChanges: state.optimisticUpdates.size > 0,
    lastUpdated: state.lastUpdated
  };
}

export function useProjectConflictResolution() {
  const { state } = useProjectState({
    enableConflictResolution: true
  });

  const resolveConflict = useCallback((projectId: string, conflict: any) => {
    // Implement conflict resolution logic
    console.log('Resolving conflict for project:', projectId, conflict);
  }, []);

  return {
    resolveConflict,
    hasConflicts: false // Would be determined by conflict detection logic
  };
}
