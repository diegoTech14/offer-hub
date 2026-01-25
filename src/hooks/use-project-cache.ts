// Intelligent Caching System for Project Data
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Project,
  ProjectFilters,
  ProjectCacheConfig,
  ProjectCacheEntry,
  ProjectSearchParams,
  PaginationInfo
} from '@/types/project.types';
import {
  ProjectCacheManager,
  getProjectCacheManager,
  createCacheKey,
  invalidateProjectCache,
  getCacheStats
} from '@/utils/project-cache-manager';

export interface UseProjectCacheOptions {
  ttl?: number;
  maxSize?: number;
  enableBackgroundRefresh?: boolean;
  enableOfflineSupport?: boolean;
  compressionEnabled?: boolean;
  autoCleanup?: boolean;
  cleanupInterval?: number;
}

export interface UseProjectCacheReturn {
  // Cache operations
  get: (key: string) => Project | Project[] | null;
  set: (key: string, data: Project | Project[], ttl?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;

  // Project-specific operations
  getProject: (id: string) => Project | null;
  setProject: (project: Project, ttl?: number) => void;
  getProjectsList: (filters?: ProjectFilters) => Project[] | null;
  setProjectsList: (projects: Project[], filters?: ProjectFilters, ttl?: number) => void;
  getSearchResults: (query: string, filters?: ProjectFilters) => Project[] | null;
  setSearchResults: (results: Project[], query: string, filters?: ProjectFilters, ttl?: number) => void;

  // Cache management
  invalidateProject: (id: string) => void;
  invalidateByPattern: (pattern: string) => void;
  refreshProject: (id: string) => Promise<Project | null>;
  refreshProjectsList: (filters?: ProjectFilters) => Promise<Project[] | null>;

  // Cache statistics
  getStats: () => {
    size: number;
    hitRate: number;
    memoryUsage: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  };

  // Cache state
  isConnected: boolean;
  lastSync: Date | null;
  pendingUpdates: string[];

  // Utility
  generateKey: (operation: string, params?: any) => string;
  subscribe: (key: string, callback: (data: any) => void) => () => void;
}

export function useProjectCache(options: UseProjectCacheOptions = {}): UseProjectCacheReturn {
  const [isConnected, setIsConnected] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<string[]>([]);

  const cacheManagerRef = useRef<ProjectCacheManager | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  // Initialize cache manager
  useEffect(() => {
    const config: ProjectCacheConfig = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 1000,
      enableBackgroundRefresh: options.enableBackgroundRefresh ?? true,
      enableOfflineSupport: options.enableOfflineSupport ?? true,
      compressionEnabled: options.compressionEnabled ?? false
    };

    cacheManagerRef.current = getProjectCacheManager(config);

    // Setup cleanup timer
    if (options.autoCleanup !== false) {
      const interval = options.cleanupInterval || 60 * 1000; // 1 minute
      cleanupTimerRef.current = setInterval(() => {
        cacheManagerRef.current?.cleanup();
      }, interval);
    }

    // Setup network listeners
    const handleOnline = () => {
      setIsConnected(true);
      setLastSync(new Date());
      // Process pending updates when coming back online
      processPendingUpdates();
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, [options.ttl, options.maxSize, options.enableBackgroundRefresh, options.enableOfflineSupport, options.compressionEnabled, options.autoCleanup, options.cleanupInterval]);

  // Process pending updates when coming back online
  const processPendingUpdates = useCallback(async () => {
    if (pendingUpdates.length === 0) return;

    try {
      // Process pending updates in batches
      const batchSize = 5;
      for (let i = 0; i < pendingUpdates.length; i += batchSize) {
        const batch = pendingUpdates.slice(i, i + batchSize);
        await Promise.all(batch.map(key => refreshCacheEntry(key)));
      }

      setPendingUpdates([]);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to process pending updates:', error);
    }
  }, [pendingUpdates]);

  // Refresh a specific cache entry
  const refreshCacheEntry = useCallback(async (key: string): Promise<void> => {
    if (!cacheManagerRef.current) return;

    try {
      // This would typically make an API call to refresh the data
      // For now, we'll just update the timestamp
      const entry = cacheManagerRef.current.get(key);
      if (entry) {
        // Update the entry with fresh data
        // In a real implementation, you'd fetch fresh data from the API
        cacheManagerRef.current.set(key, entry, options.ttl);
      }
    } catch (error) {
      console.warn(`Failed to refresh cache entry ${key}:`, error);
    }
  }, [options.ttl]);

  // Core cache operations
  const get = useCallback((key: string): Project | Project[] | null => {
    if (!cacheManagerRef.current) return null;
    return cacheManagerRef.current.get(key);
  }, []);

  const set = useCallback((key: string, data: Project | Project[], ttl?: number): void => {
    if (!cacheManagerRef.current) return;
    cacheManagerRef.current.set(key, data, ttl);
  }, []);

  const has = useCallback((key: string): boolean => {
    if (!cacheManagerRef.current) return false;
    return cacheManagerRef.current.has(key);
  }, []);

  const deleteKey = useCallback((key: string): boolean => {
    if (!cacheManagerRef.current) return false;
    return cacheManagerRef.current.delete(key);
  }, []);

  const clear = useCallback((): void => {
    if (!cacheManagerRef.current) return;
    cacheManagerRef.current.clear();
    setPendingUpdates([]);
  }, []);

  // Project-specific operations
  const getProject = useCallback((id: string): Project | null => {
    const key = createCacheKey('single', { id });
    const result = get(key);
    return Array.isArray(result) ? null : result;
  }, [get]);

  const setProject = useCallback((project: Project, ttl?: number): void => {
    const key = createCacheKey('single', { id: project.id });
    set(key, project, ttl);
  }, [set]);

  const getProjectsList = useCallback((filters?: ProjectFilters): Project[] | null => {
    const key = createCacheKey('list', filters);
    const result = get(key);
    return Array.isArray(result) ? result : null;
  }, [get]);

  const setProjectsList = useCallback((projects: Project[], filters?: ProjectFilters, ttl?: number): void => {
    const key = createCacheKey('list', filters);
    set(key, projects, ttl);
  }, [set]);

  const getSearchResults = useCallback((query: string, filters?: ProjectFilters): Project[] | null => {
    const key = createCacheKey('search', { query, filters });
    const result = get(key);
    return Array.isArray(result) ? result : null;
  }, [get]);

  const setSearchResults = useCallback((results: Project[], query: string, filters?: ProjectFilters, ttl?: number): void => {
    const key = createCacheKey('search', { query, filters });
    set(key, results, ttl);
  }, [set]);

  // Cache management
  const invalidateProject = useCallback((id: string): void => {
    if (!cacheManagerRef.current) return;
    cacheManagerRef.current.invalidateProject(id);
  }, []);

  const invalidateByPattern = useCallback((pattern: string): void => {
    if (!cacheManagerRef.current) return;
    cacheManagerRef.current.invalidateByPattern(pattern);
  }, []);

  const refreshProject = useCallback(async (id: string): Promise<Project | null> => {
    if (!isConnected) {
      // Add to pending updates if offline
      setPendingUpdates(prev => [...prev, createCacheKey('single', { id })]);
      return getProject(id);
    }

    try {
      await refreshCacheEntry(createCacheKey('single', { id }));
      return getProject(id);
    } catch (error) {
      console.error(`Failed to refresh project ${id}:`, error);
      return getProject(id);
    }
  }, [isConnected, getProject, refreshCacheEntry]);

  const refreshProjectsList = useCallback(async (filters?: ProjectFilters): Promise<Project[] | null> => {
    if (!isConnected) {
      // Add to pending updates if offline
      setPendingUpdates(prev => [...prev, createCacheKey('list', filters)]);
      return getProjectsList(filters);
    }

    try {
      await refreshCacheEntry(createCacheKey('list', filters));
      return getProjectsList(filters);
    } catch (error) {
      console.error('Failed to refresh projects list:', error);
      return getProjectsList(filters);
    }
  }, [isConnected, getProjectsList, refreshCacheEntry]);

  // Cache statistics
  const getStats = useCallback(() => {
    if (!cacheManagerRef.current) return {
      size: 0,
      hitRate: 0,
      memoryUsage: 0,
      oldestEntry: null,
      newestEntry: null
    };

    return cacheManagerRef.current.getStats();
  }, []);

  // Utility functions
  const generateKey = useCallback((operation: string, params?: any): string => {
    if (!cacheManagerRef.current) return '';
    return cacheManagerRef.current.generateKey(operation, params);
  }, []);

  const subscribe = useCallback((key: string, callback: (data: any) => void): (() => void) => {
    if (!cacheManagerRef.current) return () => { };

    // Store subscriber reference
    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }
    subscribersRef.current.get(key)!.add(callback);

    // Subscribe to cache manager
    const unsubscribe = cacheManagerRef.current.subscribe(key, callback);

    // Return combined unsubscribe function
    return () => {
      unsubscribe();
      const subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(key);
        }
      }
    };
  }, []);

  return {
    // Cache operations
    get,
    set,
    has,
    delete: deleteKey,
    clear,

    // Project-specific operations
    getProject,
    setProject,
    getProjectsList,
    setProjectsList,
    getSearchResults,
    setSearchResults,

    // Cache management
    invalidateProject,
    invalidateByPattern,
    refreshProject,
    refreshProjectsList,

    // Cache statistics
    getStats,

    // Cache state
    isConnected,
    lastSync,
    pendingUpdates,

    // Utility
    generateKey,
    subscribe
  };
}

// Specialized hooks for different use cases
export function useProjectCacheSubscription(key: string, callback: (data: any) => void) {
  const { subscribe } = useProjectCache();

  useEffect(() => {
    const unsubscribe = subscribe(key, callback);
    return unsubscribe;
  }, [key, callback, subscribe]);
}

export function useProjectCacheStats() {
  const { getStats } = useProjectCache();
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getStats]);

  return stats;
}

export function useProjectCacheConnection() {
  const { isConnected, lastSync, pendingUpdates } = useProjectCache();

  return {
    isConnected,
    lastSync,
    pendingUpdates,
    isOffline: !isConnected,
    hasPendingUpdates: pendingUpdates.length > 0
  };
}

// Cache utilities
export const useProjectCacheUtils = () => {
  const cache = useProjectCache();

  const cacheProject = useCallback((project: Project) => {
    cache.setProject(project);
  }, [cache]);

  const cacheProjects = useCallback((projects: Project[], filters?: ProjectFilters) => {
    cache.setProjectsList(projects, filters);
  }, [cache]);

  const cacheSearchResults = useCallback((results: Project[], query: string, filters?: ProjectFilters) => {
    cache.setSearchResults(results, query, filters);
  }, [cache]);

  const getCachedProject = useCallback((id: string) => {
    return cache.getProject(id);
  }, [cache]);

  const getCachedProjects = useCallback((filters?: ProjectFilters) => {
    return cache.getProjectsList(filters);
  }, [cache]);

  const getCachedSearchResults = useCallback((query: string, filters?: ProjectFilters) => {
    return cache.getSearchResults(query, filters);
  }, [cache]);

  const invalidateProjectCache = useCallback((id: string) => {
    cache.invalidateProject(id);
  }, [cache]);

  const clearProjectCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    cacheProject,
    cacheProjects,
    cacheSearchResults,
    getCachedProject,
    getCachedProjects,
    getCachedSearchResults,
    invalidateProjectCache,
    clearProjectCache,
    cacheStats: cache.getStats(),
    isConnected: cache.isConnected,
    lastSync: cache.lastSync,
    pendingUpdates: cache.pendingUpdates
  };
};
