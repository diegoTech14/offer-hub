"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationFilters,
  PaginatedResult,
  LoadingState,
  UseApplicationsReturn,
  ExportOptions,
  SearchResult,
} from '@/types/applications.types';
import { useApplicationCache } from '@/hooks/use-application-cache';
import { useApplicationFilters } from '@/hooks/use-application-filters';
import { useApplicationStats } from '@/hooks/use-application-stats';
import { exportApplications, paginate, validateApplication } from '@/utils/application-helpers';
import { handleError as mapError } from '@/errors/utils/handle-errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const CACHE_PREFIX = 'applications';
const LIST_KEY = `${CACHE_PREFIX}:list`;

const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

function useLogger(scope = 'Applications') {
  const log = useCallback((level: 'info' | 'error' | 'warn', message: string, data?: any) => {
    const payload = { scope, message, data, ts: new Date().toISOString() };
    if (level === 'info') console.log(`[INFO]`, payload);
    if (level === 'warn') console.warn(`[WARN]`, payload);
    if (level === 'error') console.error(`[ERROR]`, payload);
  }, [scope]);
  return { log };
}

async function fetchJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useApplications(): UseApplicationsReturn {
  const { log } = useLogger();

  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 25);
  const [loading, setLoading] = useState<LoadingState>({
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    lastUpdated: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const cache = useApplicationCache<Application[]>({ ttlMs: 5 * 60 * 1000, enableBackgroundUpdate: true });

  // Filters
  const { filters, setFilters, clearFilters, filtered, searchResults, search } = useApplicationFilters(applications);

  // Stats
  const stats = useApplicationStats(applications);

  const paginated: PaginatedResult<Application> = useMemo(() => {
    const base = filters.searchQuery ? (searchResults.map((r) => r.item)) : filtered;
    return paginate(base, page, pageSize);
  }, [filtered, searchResults, filters.searchQuery, page, pageSize]);

  const updateLoading = useCallback((partial: Partial<LoadingState>) => {
    setLoading((prev) => ({ ...prev, ...partial, lastUpdated: partial.isFetching === false ? new Date() : prev.lastUpdated }));
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    const mapped = mapError(err as any);
    setError(mapped.message || `Failed to ${operation}`);
    log('error', `Operation failed: ${operation}`, mapped);
  }, [log]);

  // Data fetcher with caching and SWR
  const fetchAll = useCallback(async (force = false) => {
    setError(null);
    updateLoading({ isFetching: true });
    try {
      const key = LIST_KEY;
      const getter = async () => {
        try {
          const data = await fetchJson<Application[]>('/applications');
          return data.map((a) => ({ ...a, createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt) }));
        } catch (apiErr) {
          // Fallback to cache if API fails
          const cached = cache.getCached<Application[]>(key);
          if (cached) {
            log('warn', 'API failed; using cached applications');
            return cached;
          }
          throw apiErr;
        }
      };
      const data = force ? await getter() : await cache.withCache(key, getter, { ttlMs: 5 * 60 * 1000 });
      setApplications(data);
      updateLoading({ isFetching: false });
    } catch (err) {
      handleError(err, 'fetch applications');
      updateLoading({ isFetching: false });
    }
  }, [cache, handleError, log, updateLoading]);

  // CRUD operations
  const create = useCallback(async (req: CreateApplicationRequest): Promise<Application> => {
    setError(null);
    updateLoading({ isCreating: true });
    try {
      const validation = validateApplication(req as any);
      if (!validation.valid) throw new Error(validation.errors.join(', '));

      const body = JSON.stringify(req);
      let created: Application;
      try {
        created = await fetchJson<Application>('/applications', { method: 'POST', body });
      } catch (apiErr) {
        // Local fallback
        created = {
          id: Math.random().toString(36).slice(2),
          title: req.title,
          summary: req.summary,
          description: req.description,
          status: 'draft',
          projectType: req.projectType,
          budget: req.budget,
          currency: req.currency,
          skills: req.skills,
          attachments: (req.attachments || []).map((a, i) => ({ id: `${i}`, ...a })),
          meta: req.meta,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        log('warn', 'API create failed; using local fallback', created);
      }
      setApplications((prev) => [created, ...prev]);
      cache.invalidatePrefix(CACHE_PREFIX);
      syncChannelRef.current?.postMessage({ type: 'upsert', payload: created });
      updateLoading({ isCreating: false });
      return created;
    } catch (err) {
      handleError(err, 'create application');
      updateLoading({ isCreating: false });
      throw err;
    }
  }, [cache, handleError, log]);

  const update = useCallback(async (id: string, updates: UpdateApplicationRequest): Promise<Application> => {
    setError(null);
    updateLoading({ isUpdating: true });
    try {
      const body = JSON.stringify(updates);
      let updated: Application | null = null;
      try {
        updated = await fetchJson<Application>(`/applications/${id}`, { method: 'PUT', body });
      } catch (apiErr) {
        // Local optimistic update
        setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)));
        updated = applications.find((a) => a.id === id) || null;
        log('warn', 'API update failed; applied optimistic local update', { id, updates });
      }
      if (updated) {
        setApplications((prev) => prev.map((a) => (a.id === id ? updated! : a)));
      }
      cache.invalidatePrefix(CACHE_PREFIX);
      syncChannelRef.current?.postMessage({ type: 'upsert', payload: updated || { id, ...updates } });
      updateLoading({ isUpdating: false });
      return (updated || applications.find((a) => a.id === id)!) as Application;
    } catch (err) {
      handleError(err, 'update application');
      updateLoading({ isUpdating: false });
      throw err;
    }
  }, [applications, cache, handleError, log]);

  const remove = useCallback(async (id: string): Promise<void> => {
    setError(null);
    updateLoading({ isDeleting: true });
    try {
      try {
        await fetchJson<void>(`/applications/${id}`, { method: 'DELETE' });
      } catch (apiErr) {
        // Local deletion fallback
        log('warn', 'API delete failed; applying local delete', { id });
      }
      setApplications((prev) => prev.filter((a) => a.id !== id));
      cache.invalidatePrefix(CACHE_PREFIX);
      syncChannelRef.current?.postMessage({ type: 'delete', payload: { id } });
      updateLoading({ isDeleting: false });
    } catch (err) {
      handleError(err, 'delete application');
      updateLoading({ isDeleting: false });
      throw err;
    }
  }, [cache, handleError, log]);

  // Search wrapper for direct usage
  const searchWrapper = useCallback((query: string): SearchResult<Application>[] => {
    return search(query);
  }, [search]);

  // Export functionality
  const exportData = useCallback(async (options: ExportOptions) => {
    const base = options.filters ? filtered : applications;
    const data = await exportApplications(base, options);
    // Optional client-side download
    try {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.fileName || 'applications'}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    return data;
  }, [applications, filtered]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('applications-model-sync');
    syncChannelRef.current = channel;
    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'upsert' && payload) {
        setApplications((prev) => {
          const exists = prev.some((a) => a.id === payload.id);
          return exists ? prev.map((a) => (a.id === payload.id ? { ...a, ...payload } : a)) : [payload, ...prev];
        });
      }
      if (type === 'delete' && payload?.id) {
        setApplications((prev) => prev.filter((a) => a.id !== payload.id));
      }
    };
    return () => channel.close();
  }, []);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    applications,
    paginated,
    filters,
    loading,
    error,
    stats,
    // CRUD
    create,
    update,
    remove,
    fetchAll,
    // Filtering/Search/Pagination
    applyFilters: setFilters,
    clearFilters,
    search: searchWrapper,
    setPage,
    setPageSize,
    // Export
    exportData,
    // Cache
    invalidateCache: (prefix?: string) => prefix ? cache.invalidatePrefix(prefix) : cache.invalidatePrefix(CACHE_PREFIX),
  };
}