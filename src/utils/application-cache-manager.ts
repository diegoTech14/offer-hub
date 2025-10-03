import { CacheEntry, CacheStats } from '@/types/applications.types';

type Listener = (key: string) => void;

export class ApplicationCacheManager {
  private store: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0 };
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private storageKeyPrefix = 'applications-cache:';

  constructor(enableSync = true) {
    if (enableSync && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('applications-sync');
      this.channel.onmessage = (event) => {
        const { type, key, prefix } = event.data || {};
        if (type === 'invalidate' && key) {
          this.invalidate(key, false);
        }
        if (type === 'invalidate-prefix' && prefix) {
          this.invalidateByPrefix(prefix, false);
        }
      };
    }
    this.restoreFromStorage();
  }

  addListener(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitInvalidation(key: string) {
    this.listeners.forEach((l) => l(key));
  }

  private now() {
    return Date.now();
  }

  private storageKey(key: string) {
    return `${this.storageKeyPrefix}${key}`;
  }

  private persistToStorage(key: string, entry: CacheEntry<any>) {
    try {
      localStorage.setItem(this.storageKey(key), JSON.stringify(entry));
    } catch {}
  }

  private removeFromStorage(key: string) {
    try {
      localStorage.removeItem(this.storageKey(key));
    } catch {}
  }

  private restoreFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (k.startsWith(this.storageKeyPrefix)) {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const entry = JSON.parse(raw) as CacheEntry<any>;
          const key = k.replace(this.storageKeyPrefix, '');
          if (!this.isExpired(entry)) {
            this.store.set(key, entry);
          } else {
            this.removeFromStorage(key);
          }
        }
      }
    } catch {}
  }

  private isExpired(entry: CacheEntry<any>) {
    return this.now() - entry.createdAt > entry.ttlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.removeFromStorage(key);
      this.stats.evictions++;
      return undefined;
    }
    this.stats.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      ttlMs,
      createdAt: this.now(),
    };
    this.store.set(key, entry);
    this.persistToStorage(key, entry);
  }

  invalidate(key: string, broadcast = true): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    this.removeFromStorage(key);
    this.emitInvalidation(key);
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'invalidate', key });
    }
  }

  invalidateByPrefix(prefix: string, broadcast = true): void {
    Array.from(this.store.keys()).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.invalidate(key, false);
      }
    });
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'invalidate-prefix', prefix });
    }
  }

  cleanup(): void {
    Array.from(this.store.entries()).forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        this.store.delete(key);
        this.removeFromStorage(key);
        this.stats.evictions++;
      }
    });
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

export const applicationCacheManager = new ApplicationCacheManager(true);