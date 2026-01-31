/**
 * @fileoverview Custom hook for content moderation logic and state management
 * @author Offer Hub Team
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ContentItem,
  ModerationResult,
  UserReport,
  ContentAppeal,
  ModerationAction,
  ModerationFilters,
  PaginationOptions,
  ModerationAnalytics,
  Moderator,
  ModerationPolicy,
  UseModerationOptions,
  UseModerationReturn,
  AppealResolution,
  ReportResolution,
  QualityMetrics,
  ModerationConfig,
  ExportOptions,
  AutomatedFlag,
  ContentType,
} from '@/types/moderation.types';
import { moderationService } from '@/services/moderation.service';

/**
 * Main hook for content moderation functionality
 */
export function useContentModeration(options: UseModerationOptions = {}): UseModerationReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    filters: initialFilters = {},
    pagination: initialPagination = { page: 1, pageSize: 20 },
  } = options;

  // State management
  const [content, setContent] = useState<ContentItem[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [appeals, setAppeals] = useState<ContentAppeal[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [policies, setPolicies] = useState<ModerationPolicy[]>([]);
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);

  // Filter and pagination state
  const [filters, setFilters] = useState<ModerationFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Additional state for specific operations
  const [loadingStates, setLoadingStates] = useState({
    content: false,
    reports: false,
    appeals: false,
    moderators: false,
    policies: false,
    analytics: false,
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Set loading state for specific operation
   */
  const setLoadingState = useCallback((operation: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [operation]: loading }));
  }, []);

  /**
   * Fetch content for moderation
   */
  const fetchContent = useCallback(async () => {
    setLoadingState('content', true);
    clearError();

    try {
      const response = await moderationService.getContentForModeration(filters, pagination);
      if (response.success) {
        setContent(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch content';
      setError(errorMessage);
      setContent([]);
    } finally {
      setLoadingState('content', false);
    }
  }, [filters, pagination, clearError, setLoadingState]);

  /**
   * Fetch user reports
   */
  const fetchReports = useCallback(async () => {
    setLoadingState('reports', true);
    clearError();

    try {
      const response = await moderationService.getReports(filters, pagination);
      if (response.success) {
        setReports(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      setReports([]);
    } finally {
      setLoadingState('reports', false);
    }
  }, [filters, pagination, clearError, setLoadingState]);

  /**
   * Fetch content appeals
   */
  const fetchAppeals = useCallback(async () => {
    setLoadingState('appeals', true);
    clearError();

    try {
      const response = await moderationService.getAppeals(filters, pagination);
      if (response.success) {
        setAppeals(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch appeals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appeals';
      setError(errorMessage);
      setAppeals([]);
    } finally {
      setLoadingState('appeals', false);
    }
  }, [filters, pagination, clearError, setLoadingState]);

  /**
   * Fetch moderators
   */
  const fetchModerators = useCallback(async () => {
    setLoadingState('moderators', true);
    clearError();

    try {
      const response = await moderationService.getModerators();
      if (response.success) {
        setModerators(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch moderators');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch moderators';
      setError(errorMessage);
      setModerators([]);
    } finally {
      setLoadingState('moderators', false);
    }
  }, [clearError, setLoadingState]);

  /**
   * Fetch moderation policies
   */
  const fetchPolicies = useCallback(async () => {
    setLoadingState('policies', true);
    clearError();

    try {
      const response = await moderationService.getPolicies();
      if (response.success) {
        setPolicies(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch policies');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch policies';
      setError(errorMessage);
      setPolicies([]);
    } finally {
      setLoadingState('policies', false);
    }
  }, [clearError, setLoadingState]);

  /**
   * Fetch moderation analytics
   */
  const fetchAnalytics = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    setLoadingState('analytics', true);
    clearError();

    try {
      const response = await moderationService.getAnalytics(dateRange, filters);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      setAnalytics(null);
    } finally {
      setLoadingState('analytics', false);
    }
  }, [filters, clearError, setLoadingState]);

  /**
   * Moderate content item
   */
  const moderateContent = useCallback(async (
    contentId: string,
    action: ModerationAction,
    reason: string
  ) => {
    setIsSubmitting(true);
    clearError();

    try {
      const response = await moderationService.moderateContent(contentId, action, reason);
      if (response.success) {
        // Update local content state
        setContent(prev => prev.map(item => 
          item.id === contentId 
            ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
            : item
        ));
        
        // Refresh data to ensure consistency
        await fetchContent();
      } else {
        throw new Error(response.message || 'Failed to moderate content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to moderate content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearError, fetchContent]);

  /**
   * Resolve user report
   */
  const resolveReport = useCallback(async (
    reportId: string,
    resolution: ReportResolution
  ) => {
    setIsSubmitting(true);
    clearError();

    try {
      const response = await moderationService.resolveReport(reportId, resolution);
      if (response.success) {
        // Update local reports state
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'resolved', resolution }
            : report
        ));
        
        // Refresh data
        await fetchReports();
      } else {
        throw new Error(response.message || 'Failed to resolve report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve report';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearError, fetchReports]);

  /**
   * Handle content appeal
   */
  const handleAppeal = useCallback(async (
    appealId: string,
    resolution: AppealResolution
  ) => {
    setIsSubmitting(true);
    clearError();

    try {
      const response = await moderationService.handleAppeal(appealId, resolution);
      if (response.success) {
        // Update local appeals state
        setAppeals(prev => prev.map(appeal => 
          appeal.id === appealId 
            ? { ...appeal, status: resolution.decision === 'overturned' ? 'approved' : 'denied', resolution }
            : appeal
        ));
        
        // Refresh data
        await fetchAppeals();
      } else {
        throw new Error(response.message || 'Failed to handle appeal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to handle appeal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearError, fetchAppeals]);

  /**
   * Update filters and trigger data refresh
   */
  const updateFilters = useCallback((newFilters: ModerationFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  /**
   * Update pagination
   */
  const updatePagination = useCallback((newPagination: PaginationOptions) => {
    setPagination(newPagination);
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        fetchContent(),
        fetchReports(),
        fetchAppeals(),
        fetchModerators(),
        fetchPolicies(),
        fetchAnalytics(),
      ]);
    } catch (err) {
      // Error handling is done in individual fetch functions
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchContent, fetchReports, fetchAppeals, fetchModerators, fetchPolicies, fetchAnalytics]);

  /**
   * Export moderation data
   */
  const exportData = useCallback(async (options: ExportOptions) => {
    setIsSubmitting(true);
    clearError();

    try {
      const blob = await moderationService.exportData(options);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moderation-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearError]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [filters, pagination]); // Re-fetch when filters or pagination change

  // Computed loading state
  const computedIsLoading = useMemo(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return {
    // Data
    content,
    reports,
    appeals,
    moderators,
    policies,
    analytics,
    
    // Loading states
    isLoading: computedIsLoading,
    isSubmitting,
    isRefreshing,
    
    // Error state
    error,
    
    // Actions
    moderateContent,
    resolveReport,
    handleAppeal,
    updateFilters,
    refreshData,
    exportData,
    
    // Additional actions
    updatePagination,
    fetchContent,
    fetchReports,
    fetchAppeals,
    fetchModerators,
    fetchPolicies,
    fetchAnalytics,
    clearError,
  };
}

/**
 * Hook for automated content filtering
 */
export function useAutomatedFiltering() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAutomatedFilter = useCallback(async (
    contentId: string,
    contentText: string,
    contentType: ContentType
  ): Promise<AutomatedFlag[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await moderationService.runAutomatedFiltering(contentId, contentText, contentType);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to run automated filtering');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run automated filtering';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const runBulkAutomatedFilter = useCallback(async (
    contentItems: { id: string; text: string; type: ContentType }[]
  ): Promise<{ [contentId: string]: AutomatedFlag[] }> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await moderationService.runBulkAutomatedFiltering(contentItems);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to run bulk automated filtering');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run bulk automated filtering';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    runAutomatedFilter,
    runBulkAutomatedFilter,
    clearError: () => setError(null),
  };
}

/**
 * Hook for quality scoring
 */
export function useQualityScoring() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateQualityScore = useCallback(async (
    contentId: string,
    contentText: string,
    contentType: ContentType,
    metadata?: Record<string, any>
  ): Promise<QualityMetrics> => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await moderationService.calculateQualityScore(
        contentId,
        contentText,
        contentType,
        metadata
      );
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to calculate quality score');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate quality score';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    isCalculating,
    error,
    calculateQualityScore,
    clearError: () => setError(null),
  };
}

/**
 * Hook for moderation configuration
 */
export function useModerationConfig() {
  const [config, setConfig] = useState<ModerationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await moderationService.getConfig();
      if (response.success) {
        setConfig(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch config');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch config';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates: Partial<ModerationConfig>) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await moderationService.updateConfig(updates);
      if (response.success) {
        setConfig(response.data);
      } else {
        throw new Error(response.message || 'Failed to update config');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update config';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    isUpdating,
    error,
    updateConfig,
    refreshConfig: fetchConfig,
    clearError: () => setError(null),
  };
}
