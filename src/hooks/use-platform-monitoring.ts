'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MonitoringState,
  SystemMetrics,
  PerformanceMetrics,
  UserBehaviorMetrics,
  BusinessMetrics,
  RealTimeAlert,
  MonitoringDashboard,
  TimeRange,
  UserAnalyticsData,
  HeatmapData,
  CustomMetric,
} from '@/types/monitoring.types';
import { monitoringService } from '@/services/monitoring.service';

const initialState: MonitoringState = {
  systemMetrics: null,
  performanceMetrics: null,
  userMetrics: null,
  businessMetrics: null,
  alerts: [],
  dashboards: [],
  activeDashboard: null,
  isConnected: false,
  isLoading: false,
  error: null,
  lastUpdate: null,
};

interface UsePlatformMonitoringReturn {
  // State
  systemMetrics: SystemMetrics | null;
  performanceMetrics: PerformanceMetrics | null;
  userMetrics: UserBehaviorMetrics | null;
  businessMetrics: BusinessMetrics | null;
  alerts: RealTimeAlert[];
  dashboards: MonitoringDashboard[];
  activeDashboard: MonitoringDashboard | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  selectedTimeRange: TimeRange;
  
  // Actions
  initializeMonitoring: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  startAutoRefresh: (interval?: number) => void;
  stopAutoRefresh: () => void;
  updateTimeRange: (timeRange: TimeRange) => void;
  
  // Alert management
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, resolution?: string) => Promise<void>;
  
  // Dashboard management
  loadDashboard: (dashboardId: string) => Promise<void>;
  createDashboard: (dashboard: Omit<MonitoringDashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MonitoringDashboard>;
  updateDashboard: (id: string, updates: Partial<MonitoringDashboard>) => Promise<MonitoringDashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  
  // Derived state
  unacknowledgedAlerts: number;
  criticalAlerts: number;
  systemHealthStatus: 'healthy' | 'warning' | 'critical';
}

export function usePlatformMonitoring(): UsePlatformMonitoringReturn {
  const [state, setState] = useState<MonitoringState>(initialState);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date(),
    interval: '1h',
  });
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize monitoring
  const initializeMonitoring = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load initial data in parallel
      const [
        systemMetrics,
        performanceMetrics,
        userMetrics,
        businessMetrics,
        alerts,
        dashboards,
      ] = await Promise.all([
        monitoringService.getSystemMetrics(selectedTimeRange).catch(() => null),
        monitoringService.getPerformanceMetrics(selectedTimeRange).catch(() => null),
        monitoringService.getUserBehaviorMetrics(selectedTimeRange).catch(() => null),
        monitoringService.getBusinessMetrics(selectedTimeRange).catch(() => null),
        monitoringService.getAlerts({ timeRange: selectedTimeRange }).catch(() => []),
        monitoringService.getDashboards().catch(() => []),
      ]);

      setState(prev => ({
        ...prev,
        systemMetrics: systemMetrics?.[systemMetrics.length - 1] || null,
        performanceMetrics: performanceMetrics?.[performanceMetrics.length - 1] || null,
        userMetrics: userMetrics?.[userMetrics.length - 1] || null,
        businessMetrics: businessMetrics?.[businessMetrics.length - 1] || null,
        alerts,
        dashboards,
        activeDashboard: dashboards.find(d => d.isDefault) || dashboards[0] || null,
        isLoading: false,
        lastUpdate: new Date(),
      }));

      isInitializedRef.current = true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize monitoring',
        isLoading: false,
      }));
    }
  }, [selectedTimeRange]);

  // Refresh all metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const [systemMetrics, performanceMetrics, userMetrics, businessMetrics] = await Promise.all([
        monitoringService.getSystemMetrics(selectedTimeRange),
        monitoringService.getPerformanceMetrics(selectedTimeRange),
        monitoringService.getUserBehaviorMetrics(selectedTimeRange),
        monitoringService.getBusinessMetrics(selectedTimeRange),
      ]);

      setState(prev => ({
        ...prev,
        systemMetrics: systemMetrics[systemMetrics.length - 1] || null,
        performanceMetrics: performanceMetrics[performanceMetrics.length - 1] || null,
        userMetrics: userMetrics[userMetrics.length - 1] || null,
        businessMetrics: businessMetrics[businessMetrics.length - 1] || null,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, [selectedTimeRange]);

  // WebSocket event handlers
  useEffect(() => {
    const handleSystemMetrics = (data: SystemMetrics) => {
      setState(prev => ({
        ...prev,
        systemMetrics: data,
        lastUpdate: new Date(),
      }));
    };

    const handleUserMetrics = (data: UserBehaviorMetrics) => {
      setState(prev => ({
        ...prev,
        userMetrics: data,
        lastUpdate: new Date(),
      }));
    };

    const handleBusinessMetrics = (data: BusinessMetrics) => {
      setState(prev => ({
        ...prev,
        businessMetrics: data,
        lastUpdate: new Date(),
      }));
    };

    const handleAlert = (alert: RealTimeAlert) => {
      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts.slice(0, 99)], // Keep last 100 alerts
      }));
    };

    const handleConnection = (data: { status: string }) => {
      setState(prev => ({
        ...prev,
        isConnected: data.status === 'connected',
      }));
    };

    const handleError = (data: { error: string }) => {
      setState(prev => ({
        ...prev,
        error: data.error,
      }));
    };

    // Subscribe to WebSocket events
    monitoringService.on('systemMetrics', handleSystemMetrics);
    monitoringService.on('userMetrics', handleUserMetrics);
    monitoringService.on('businessMetrics', handleBusinessMetrics);
    monitoringService.on('alert', handleAlert);
    monitoringService.on('connection', handleConnection);
    monitoringService.on('error', handleError);

    return () => {
      // Unsubscribe from WebSocket events
      monitoringService.off('systemMetrics', handleSystemMetrics);
      monitoringService.off('userMetrics', handleUserMetrics);
      monitoringService.off('businessMetrics', handleBusinessMetrics);
      monitoringService.off('alert', handleAlert);
      monitoringService.off('connection', handleConnection);
      monitoringService.off('error', handleError);
    };
  }, []);

  // Auto-refresh setup
  const startAutoRefresh = useCallback((interval: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      if (!state.isConnected) {
        refreshMetrics();
      }
    }, interval);
  }, [refreshMetrics, state.isConnected]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Alert management
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await monitoringService.acknowledgeAlert(alertId);
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ),
      }));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string, resolution?: string) => {
    try {
      await monitoringService.resolveAlert(alertId, resolution);
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === alertId
            ? { ...alert, resolvedAt: new Date(), acknowledged: true }
            : alert
        ),
      }));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }, []);

  // Dashboard management
  const loadDashboard = useCallback(async (dashboardId: string) => {
    try {
      const dashboard = await monitoringService.getDashboard(dashboardId);
      setState(prev => ({
        ...prev,
        activeDashboard: dashboard,
      }));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }, []);

  const createDashboard = useCallback(async (dashboard: Omit<MonitoringDashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDashboard = await monitoringService.createDashboard(dashboard);
      setState(prev => ({
        ...prev,
        dashboards: [...prev.dashboards, newDashboard],
        activeDashboard: newDashboard,
      }));
      return newDashboard;
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw error;
    }
  }, []);

  const updateDashboard = useCallback(async (id: string, updates: Partial<MonitoringDashboard>) => {
    try {
      const updatedDashboard = await monitoringService.updateDashboard(id, updates);
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.map(d => d.id === id ? updatedDashboard : d),
        activeDashboard: prev.activeDashboard?.id === id ? updatedDashboard : prev.activeDashboard,
      }));
      return updatedDashboard;
    } catch (error) {
      console.error('Failed to update dashboard:', error);
      throw error;
    }
  }, []);

  const deleteDashboard = useCallback(async (id: string) => {
    try {
      await monitoringService.deleteDashboard(id);
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.filter(d => d.id !== id),
        activeDashboard: prev.activeDashboard?.id === id ? null : prev.activeDashboard,
      }));
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      throw error;
    }
  }, []);

  // Time range management
  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    refreshMetrics();
  }, [refreshMetrics]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    // State
    ...state,
    selectedTimeRange,
    
    // Actions
    initializeMonitoring,
    refreshMetrics,
    startAutoRefresh,
    stopAutoRefresh,
    updateTimeRange,
    
    // Alert management
    acknowledgeAlert,
    resolveAlert,
    
    // Dashboard management
    loadDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    
    // Derived state
    unacknowledgedAlerts: state.alerts.filter(alert => !alert.acknowledged).length,
    criticalAlerts: state.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length,
    systemHealthStatus: getSystemHealthStatus(state.systemMetrics, state.performanceMetrics),
  };
}

// Helper function to determine system health
function getSystemHealthStatus(
  systemMetrics: SystemMetrics | null,
  performanceMetrics: PerformanceMetrics | null
): 'healthy' | 'warning' | 'critical' {
  if (!systemMetrics || !performanceMetrics) return 'warning';

  const cpuUsage = systemMetrics.cpu.usage;
  const memoryUsage = systemMetrics.memory.usage;
  const diskUsage = systemMetrics.disk.usage;
  const errorRate = performanceMetrics.errorRates.total;
  const uptime = performanceMetrics.uptime.percentage;

  if (
    cpuUsage > 90 ||
    memoryUsage > 95 ||
    diskUsage > 95 ||
    errorRate > 5 ||
    uptime < 95
  ) {
    return 'critical';
  }

  if (
    cpuUsage > 70 ||
    memoryUsage > 80 ||
    diskUsage > 80 ||
    errorRate > 1 ||
    uptime < 99
  ) {
    return 'warning';
  }

  return 'healthy';
}

interface UseSystemMonitoringReturn {
  systemMetrics: SystemMetrics | null;
  performanceMetrics: PerformanceMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}

// Specialized hooks for specific monitoring aspects
export function useSystemMonitoring(): UseSystemMonitoringReturn {
  const { systemMetrics, performanceMetrics, isLoading, error, refreshMetrics } = usePlatformMonitoring();
  
  return {
    systemMetrics,
    performanceMetrics,
    isLoading,
    error,
    refreshMetrics,
  };
}

interface UseUserAnalyticsReturn {
  analyticsData: UserAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  loadUserAnalytics: (timeRange: TimeRange) => Promise<void>;
  loadHeatmapData: (page: string, timeRange: TimeRange) => Promise<HeatmapData[]>;
}

export function useUserAnalytics(): UseUserAnalyticsReturn {
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserAnalytics = useCallback(async (timeRange: TimeRange) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await monitoringService.getUserAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHeatmapData = useCallback(async (page: string, timeRange: TimeRange): Promise<HeatmapData[]> => {
    try {
      return await monitoringService.getHeatmapData(page, timeRange);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
      return [];
    }
  }, []);

  return {
    analyticsData,
    isLoading,
    error,
    loadUserAnalytics,
    loadHeatmapData,
  };
}

interface UseCustomMetricsReturn {
  metrics: CustomMetric[];
  isLoading: boolean;
  error: string | null;
  loadCustomMetrics: () => Promise<void>;
  createCustomMetric: (metric: Omit<CustomMetric, 'id' | 'createdAt'>) => Promise<CustomMetric>;
  updateCustomMetric: (id: string, updates: Partial<CustomMetric>) => Promise<CustomMetric>;
  deleteCustomMetric: (id: string) => Promise<void>;
}

export function useCustomMetrics(): UseCustomMetricsReturn {
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await monitoringService.getCustomMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCustomMetric = useCallback(async (metric: Omit<CustomMetric, 'id' | 'createdAt'>) => {
    try {
      const newMetric = await monitoringService.createCustomMetric(metric);
      setMetrics(prev => [...prev, newMetric]);
      return newMetric;
    } catch (error) {
      console.error('Failed to create custom metric:', error);
      throw error;
    }
  }, []);

  const updateCustomMetric = useCallback(async (id: string, updates: Partial<CustomMetric>) => {
    try {
      const updatedMetric = await monitoringService.updateCustomMetric(id, updates);
      setMetrics(prev => prev.map(m => m.id === id ? updatedMetric : m));
      return updatedMetric;
    } catch (error) {
      console.error('Failed to update custom metric:', error);
      throw error;
    }
  }, []);

  const deleteCustomMetric = useCallback(async (id: string) => {
    try {
      await monitoringService.deleteCustomMetric(id);
      setMetrics(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete custom metric:', error);
      throw error;
    }
  }, []);

  return {
    metrics,
    isLoading,
    error,
    loadCustomMetrics,
    createCustomMetric,
    updateCustomMetric,
    deleteCustomMetric,
  };
}