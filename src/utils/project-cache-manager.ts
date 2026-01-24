// Advanced Project Cache Manager with TTL and Invalidation
import { Project, ProjectCacheEntry, ProjectCacheConfig, ProjectFilters } from '@/types/project.types';

export class ProjectCacheManager {
  private cache = new Map<string, ProjectCacheEntry>();
  private config: ProjectCacheConfig;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private backgroundRefreshTimer: NodeJS.Timeout | null = null;
  private compressionEnabled: boolean;
  private maxSize: number;

  constructor(config: Partial<ProjectCacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // 1000 entries default
      enableBackgroundRefresh: true,
      enableOfflineSupport: false,
      compressionEnabled: false,
      ...config
    };
    
    this.compressionEnabled = this.config.compressionEnabled;
    this.maxSize = this.config.maxSize;
    
    this.startBackgroundRefresh();
    this.setupStorageListeners();
  }

  // Core Cache Operations
  set(key: string, data: Project | Project[], ttl?: number): void {
    const entry: ProjectCacheEntry = {
      data: this.compressionEnabled ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      version: this.getVersion(),
      metadata: {
        source: 'cache',
        lastModified: new Date().toISOString()
      }
    };

    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.notifySubscribers(key, data);
    this.persistToStorage(key, entry);
  }

  get(key: string): Project | Project[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Try to load from persistent storage
      const persisted = this.loadFromStorage(key);
      if (persisted) {
        this.cache.set(key, persisted);
        return this.compressionEnabled ? this.decompress(persisted.data) : persisted.data;
      }
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return null;
    }

    return this.compressionEnabled ? this.decompress(entry.data) : entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromStorage(key);
    this.notifySubscribers(key, null);
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.clearStorage();
    this.notifyAllSubscribers(null);
  }

  // Cache Key Generation
  generateKey(operation: string, params?: any): string {
    const baseKey = `project_${operation}`;
    
    if (!params) return baseKey;
    
    // Create a deterministic key from parameters
    const paramString = typeof params === 'string' 
      ? params 
      : JSON.stringify(params, Object.keys(params).sort());
    
    return `${baseKey}_${this.hashString(paramString)}`;
  }

  generateProjectKey(id: string): string {
    return this.generateKey('single', { id });
  }

  generateProjectsListKey(filters?: ProjectFilters): string {
    return this.generateKey('list', filters);
  }

  generateSearchKey(query: string, filters?: ProjectFilters): string {
    return this.generateKey('search', { query, filters });
  }

  // Cache Invalidation
  invalidateProject(id: string): void {
    const projectKey = this.generateProjectKey(id);
    this.delete(projectKey);
    
    // Invalidate related caches
    this.invalidateRelatedCaches(id);
  }

  invalidateRelatedCaches(projectId: string): void {
    const keysToInvalidate: string[] = [];
    
    // Find all keys that might contain this project
    for (const key of this.cache.keys()) {
      if (key.includes('list') || key.includes('search')) {
        keysToInvalidate.push(key);
      }
    }
    
    keysToInvalidate.forEach(key => this.delete(key));
  }

  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  // Cache Statistics
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let totalHits = 0;
    let totalRequests = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    
    for (const entry of this.cache.values()) {
      totalRequests++;
      if (!this.isExpired(entry)) {
        totalHits++;
      }
      
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    }
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
      newestEntry: newestTimestamp === 0 ? null : new Date(newestTimestamp)
    };
  }

  // Cache Management
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.removeFromStorage(key);
    });
  }

  evictOldest(): void {
    let oldestKey = '';
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Background Refresh
  private startBackgroundRefresh(): void {
    if (!this.config.enableBackgroundRefresh) return;
    
    this.backgroundRefreshTimer = setInterval(() => {
      this.backgroundRefresh();
    }, this.config.ttl / 2); // Refresh at half TTL
  }

  private async backgroundRefresh(): Promise<void> {
    const keysToRefresh: string[] = [];
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      // Refresh entries that are 80% through their TTL
      if (now - entry.timestamp > entry.ttl * 0.8) {
        keysToRefresh.push(key);
      }
    }
    
    // Refresh in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < keysToRefresh.length; i += batchSize) {
      const batch = keysToRefresh.slice(i, i + batchSize);
      await Promise.all(batch.map(key => this.refreshEntry(key)));
    }
  }

  private async refreshEntry(key: string): Promise<void> {
    try {
      // This would typically make an API call to refresh the data
      // For now, we'll just update the timestamp
      const entry = this.cache.get(key);
      if (entry) {
        entry.timestamp = Date.now();
        entry.version = this.getVersion();
        this.cache.set(key, entry);
      }
    } catch (error) {
      console.warn(`Failed to refresh cache entry ${key}:`, error);
    }
  }

  // Subscription System
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string, data: any): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in cache subscriber:', error);
        }
      });
    }
  }

  private notifyAllSubscribers(data: any): void {
    for (const subscribers of this.subscribers.values()) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in cache subscriber:', error);
        }
      });
    }
  }

  // Persistence
  private persistToStorage(key: string, entry: ProjectCacheEntry): void {
    if (!this.config.enableOfflineSupport) return;
    
    try {
      const storageKey = `project_cache_${key}`;
      const data = JSON.stringify(entry);
      localStorage.setItem(storageKey, data);
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error);
    }
  }

  private loadFromStorage(key: string): ProjectCacheEntry | null {
    if (!this.config.enableOfflineSupport) return null;
    
    try {
      const storageKey = `project_cache_${key}`;
      const data = localStorage.getItem(storageKey);
      
      if (!data) return null;
      
      const entry = JSON.parse(data) as ProjectCacheEntry;
      
      // Check if entry is expired
      if (this.isExpired(entry)) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return entry;
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      return null;
    }
  }

  private removeFromStorage(key: string): void {
    if (!this.config.enableOfflineSupport) return;
    
    try {
      const storageKey = `project_cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error);
    }
  }

  private clearStorage(): void {
    if (!this.config.enableOfflineSupport) return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('project_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  }

  private setupStorageListeners(): void {
    if (!this.config.enableOfflineSupport) return;
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('project_cache_')) {
        const key = event.key.replace('project_cache_', '');
        
        if (event.newValue === null) {
          // Entry was deleted
          this.cache.delete(key);
        } else {
          // Entry was updated
          try {
            const entry = JSON.parse(event.newValue) as ProjectCacheEntry;
            this.cache.set(key, entry);
          } catch (error) {
            console.warn('Failed to parse storage event:', error);
          }
        }
      }
    });
  }

  // Utility Methods
  private isExpired(entry: ProjectCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getVersion(): number {
    return Date.now();
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry).length * 2;
    }
    
    return totalSize;
  }

  // Compression (simple JSON compression)
  private compress(data: any): any {
    if (!this.compressionEnabled) return data;
    
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression - in a real implementation, you'd use a proper compression library
      return {
        compressed: true,
        data: jsonString
      };
    } catch (error) {
      console.warn('Failed to compress data:', error);
      return data;
    }
  }

  private decompress(data: any): any {
    if (!this.compressionEnabled || !data?.compressed) return data;
    
    try {
      return JSON.parse(data.data);
    } catch (error) {
      console.warn('Failed to decompress data:', error);
      return data;
    }
  }

  // Cleanup
  destroy(): void {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer);
      this.backgroundRefreshTimer = null;
    }
    
    this.cache.clear();
    this.subscribers.clear();
  }
}

// Singleton instance
let cacheManagerInstance: ProjectCacheManager | null = null;

export const getProjectCacheManager = (config?: Partial<ProjectCacheConfig>): ProjectCacheManager => {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new ProjectCacheManager(config);
  }
  return cacheManagerInstance;
};

export const destroyProjectCacheManager = (): void => {
  if (cacheManagerInstance) {
    cacheManagerInstance.destroy();
    cacheManagerInstance = null;
  }
};

// Cache utilities
export const createCacheKey = (operation: string, params?: any): string => {
  const manager = getProjectCacheManager();
  return manager.generateKey(operation, params);
};

export const invalidateProjectCache = (projectId: string): void => {
  const manager = getProjectCacheManager();
  manager.invalidateProject(projectId);
};

export const clearProjectCache = (): void => {
  const manager = getProjectCacheManager();
  manager.clear();
};

export const getCacheStats = () => {
  const manager = getProjectCacheManager();
  return manager.getStats();
};
