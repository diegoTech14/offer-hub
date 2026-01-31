/**
 * @fileoverview Custom hook for admin dashboard functionality and data management
 * @author Offer Hub Team
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AdminDashboardState,
  SystemHealthMetrics,
  PlatformUser,
  UserManagementFilters,
  SecurityEvent,
  ContentModerationItem,
  FinancialMetrics,
} from '@/types/admin.types';
import { adminService } from '@/services/admin.service';

interface UseAdminDashboardReturn {
  // State
  user: any;
  platformStats: any;
  systemHealth: any;
  notifications: any[];
  unreadNotificationsCount: number;
  widgets: any[];
  isLoading: boolean;
  error: string | null;
  systemHealthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  platformGrowthTrend: any;

  // Actions
  initializeDashboard: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  refreshSystemHealth: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  setupAutoRefresh: (intervalMs?: number) => void;
  cleanupAutoRefresh: () => void;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [state, setState] = useState<AdminDashboardState>({
    user: null,
    platformStats: null,
    systemHealth: null,
    notifications: [],
    unreadNotificationsCount: 0,
    widgets: [],
    isLoading: true,
    error: null,
  });

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const dashboardData = await adminService.getDashboardData();

      setState((prev) => ({
        ...prev,
        platformStats: dashboardData.statistics,
        systemHealth: dashboardData.systemHealth,
        unreadNotificationsCount: dashboardData.unreadNotifications,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data',
        isLoading: false,
      }));
    }
  }, []);

  // Refresh platform statistics
  const refreshStatistics = useCallback(async () => {
    try {
      const stats = await adminService.getPlatformStatistics();
      setState((prev) => ({ ...prev, platformStats: stats }));
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
    }
  }, []);

  // Refresh system health
  const refreshSystemHealth = useCallback(async () => {
    try {
      const health = await adminService.getSystemHealth();
      setState((prev) => ({ ...prev, systemHealth: health }));
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const { notifications, unreadCount } =
        await adminService.getNotifications();
      setState((prev) => ({
        ...prev,
        notifications,
        unreadNotificationsCount: unreadCount,
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await adminService.markNotificationAsRead(id);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif,
        ),
        unreadNotificationsCount: Math.max(
          0,
          prev.unreadNotificationsCount - 1,
        ),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notif) => ({
          ...notif,
          isRead: true,
        })),
        unreadNotificationsCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Set up auto-refresh
  const setupAutoRefresh = useCallback(
    (intervalMs: number = 30000) => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      const newInterval = setInterval(() => {
        refreshStatistics();
        refreshSystemHealth();
        loadNotifications();
      }, intervalMs);

      setRefreshInterval(newInterval);
    },
    [refreshStatistics, refreshSystemHealth, loadNotifications],
  );

  // Clean up auto-refresh
  const cleanupAutoRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDashboard();
    setupAutoRefresh();

    return cleanupAutoRefresh;
  }, [initializeDashboard, setupAutoRefresh, cleanupAutoRefresh]);

  // Computed values
  const systemHealthStatus = useMemo(() => {
    if (!state.systemHealth) return 'unknown';

    const { uptime, errorRate, databaseStatus } = state.systemHealth;

    if (errorRate > 5 || databaseStatus === 'error' || uptime < 95)
      return 'critical';
    if (errorRate > 1 || databaseStatus === 'warning' || uptime < 99)
      return 'warning';
    return 'healthy';
  }, [state.systemHealth]);

  const platformGrowthTrend = useMemo(() => {
    if (!state.platformStats) return null;

    const { userGrowthRate, projectGrowthRate, revenueGrowthRate } =
      state.platformStats;

    return {
      users: userGrowthRate > 0 ? 'up' : userGrowthRate < 0 ? 'down' : 'stable',
      projects:
        projectGrowthRate > 0
          ? 'up'
          : projectGrowthRate < 0
          ? 'down'
          : 'stable',
      revenue:
        revenueGrowthRate > 0
          ? 'up'
          : revenueGrowthRate < 0
          ? 'down'
          : 'stable',
    };
  }, [state.platformStats]);

  return {
    // State
    ...state,
    systemHealthStatus,
    platformGrowthTrend,

    // Actions
    initializeDashboard,
    refreshStatistics,
    refreshSystemHealth,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setupAutoRefresh,
    cleanupAutoRefresh,
  };
}

interface UseUserManagementReturn {
  users: PlatformUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  filters: UserManagementFilters;
  selectedUsers: string[];
  isLoading: boolean;
  error: string | null;
  loadUsers: (page?: number, limit?: number) => Promise<void>;
  updateFilters: (newFilters: UserManagementFilters) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  searchUsers: (query: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

// Hook for user management
export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserManagementFilters>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (page = 1, limit = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await adminService.getUsers(filters, page, limit);
        setUsers(response.users);
        setTotalUsers(response.total);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load users',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  const updateFilters = useCallback((newFilters: UserManagementFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedUsers([]);
  }, []);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.map((user) => user.id));
  }, [users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        loadUsers(1);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await adminService.searchUsers(query);
        setUsers(searchResults);
        setTotalUsers(searchResults.length);
        setCurrentPage(1);
        setTotalPages(1);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [loadUsers],
  );

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers(currentPage);
  }, [loadUsers, currentPage]);

  return {
    users,
    totalUsers,
    currentPage,
    totalPages,
    filters,
    selectedUsers,
    isLoading,
    error,
    loadUsers,
    updateFilters,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    searchUsers,
    setCurrentPage,
  };
}

interface UseSystemMonitoringReturn {
  systemHealth: SystemHealthMetrics | null;
  securityEvents: SecurityEvent[];
  isLoading: boolean;
  error: string | null;
  loadSystemHealth: () => Promise<void>;
  loadSecurityEvents: () => Promise<void>;
  initializeMonitoring: () => Promise<void>;
}

// Hook for system monitoring
export function useSystemMonitoring(): UseSystemMonitoringReturn {
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(
    null,
  );
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSystemHealth = useCallback(async () => {
    try {
      const health = await adminService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load system health',
      );
    }
  }, []);

  const loadSecurityEvents = useCallback(async () => {
    try {
      const { events } = await adminService.getSecurityEvents();
      setSecurityEvents(events);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load security events',
      );
    }
  }, []);

  const initializeMonitoring = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([loadSystemHealth(), loadSecurityEvents()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadSystemHealth, loadSecurityEvents]);

  useEffect(() => {
    initializeMonitoring();

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadSystemHealth();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [initializeMonitoring, loadSystemHealth]);

  return {
    systemHealth,
    securityEvents,
    isLoading,
    error,
    loadSystemHealth,
    loadSecurityEvents,
    initializeMonitoring,
  };
}

interface UseContentModerationReturn {
  moderationQueue: ContentModerationItem[];
  totalItems: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  loadModerationQueue: (status?: string, page?: number) => Promise<void>;
  moderateContent: (id: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

// Hook for content moderation
export function useContentModeration(): UseContentModerationReturn {
  const [moderationQueue, setModerationQueue] = useState<
    ContentModerationItem[]
  >([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModerationQueue = useCallback(async (status?: string, page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.getModerationQueue(status, page);
      setModerationQueue(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load moderation queue',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const moderateContent = useCallback(
    async (id: string, action: 'approve' | 'reject', reason?: string) => {
      try {
        await adminService.moderateContent(id, action, reason);
        // Remove moderated item from queue
        setModerationQueue((prev) => prev.filter((item) => item.id !== id));
        setTotalItems((prev) => prev - 1);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to moderate content',
        );
      }
    },
    [],
  );

  useEffect(() => {
    loadModerationQueue();
  }, [loadModerationQueue]);

  return {
    moderationQueue,
    totalItems,
    currentPage,
    isLoading,
    error,
    loadModerationQueue,
    moderateContent,
    setCurrentPage,
  };
}

interface UseFinancialMetricsReturn {
  financialData: FinancialMetrics | null;
  isLoading: boolean;
  error: string | null;
  loadFinancialMetrics: (dateRange?: { from: Date; to: Date }) => Promise<void>;
}

// Hook for financial metrics
export function useFinancialMetrics(): UseFinancialMetricsReturn {
  const [financialData, setFinancialData] = useState<FinancialMetrics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialMetrics = useCallback(
    async (dateRange?: { from: Date; to: Date }) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await adminService.getFinancialMetrics(dateRange);
        setFinancialData(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load financial metrics',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadFinancialMetrics();
  }, [loadFinancialMetrics]);

  return {
    financialData,
    isLoading,
    error,
    loadFinancialMetrics,
  };
}
