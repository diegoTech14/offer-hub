"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { applicationCacheManager } from '@/utils/application-cache-manager';

interface UseApplicationCacheOptions {
  ttlMs?: number;
  enableBackgroundUpdate?: boolean;
}

interface UseApplicationCacheReturn<T> {
  getCached: (key: string) => T | undefined;
  setCached: (key: string, value: T, ttlMs?: number) => void;
  invalidate: (key: string) => void;
  invalidatePrefix: (prefix: string) => void;
  withCache: (key: string, fetcher: () => Promise<T>, options?: { ttlMs?: number }) => Promise<T>;
  cacheStats: { hits: number; misses: number; evictions: number };
}

const inflight = new Map<string, Promise<any>>();

export function useApplicationCache<T = any>(options: UseApplicationCacheOptions = {}): UseApplicationCacheReturn<T> {
  const { ttlMs = 5 * 60 * 1000, enableBackgroundUpdate = true } = options;
  const [, setVersion] = useState(0);
  const unsubRef = useRef<() => void>();

  useEffect(() => {
    unsubRef.current = applicationCacheManager.addListener(() => setVersion((v) => v + 1));
    return () => {
      unsubRef.current && unsubRef.current();
    };
  }, []);

  const getCached = useCallback(<T>(key: string) => {
    return applicationCacheManager.get<T>(key);
  }, []);

  const setCached = useCallback(<T>(key: string, value: T, ttl?: number) => {
    applicationCacheManager.set(key, value, ttl ?? ttlMs);
  }, [ttlMs]);

  const invalidate = useCallback((key: string) => {
    applicationCacheManager.invalidate(key);
  }, []);

  const invalidatePrefix = useCallback((prefix: string) => {
    applicationCacheManager.invalidateByPrefix(prefix);
  }, []);

  const withCache = useCallback(async (key: string, fetcher: () => Promise<any>, opts?: { ttlMs?: number }) => {
    const cached = applicationCacheManager.get<any>(key);
    if (cached !== undefined) {
      if (enableBackgroundUpdate) {
        // SWR: return cached and refresh in background
        if (!inflight.has(key)) {
          const p = fetcher()
            .then((val) => {
              applicationCacheManager.set(key, val, opts?.ttlMs ?? ttlMs);
              return val;
            })
            .finally(() => {
              inflight.delete(key);
            });
          inflight.set(key, p);
        }
      }
      return cached;
    }
    if (inflight.has(key)) {
      return inflight.get(key)!;
    }
    const p = fetcher()
      .then((val) => {
        applicationCacheManager.set(key, val, opts?.ttlMs ?? ttlMs);
        return val;
      })
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, p);
    return p;
  }, [ttlMs, enableBackgroundUpdate]);

  const cacheStats = useMemo(() => applicationCacheManager.getStats(), [setVersion]);

  return {
    getCached,
    setCached,
    invalidate,
    invalidatePrefix,
    withCache,
    cacheStats,
  };
}