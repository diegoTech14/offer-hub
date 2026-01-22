/**
 * @fileoverview Moderation service for content filtering, review workflows, and quality control
 * @author Offer Hub Team
 */

import {
  ContentItem,
  ModerationResult,
  UserReport,
  ContentAppeal,
  ModerationAction,
  ModerationFilters,
  PaginationOptions,
  ModerationApiResponse,
  AutomatedFlag,
  QualityMetrics,
  QualityScore,
  ModerationAnalytics,
  Moderator,
  ModerationPolicy,
  PolicyRule,
  AppealResolution,
  ReportResolution,
  ContentType,
  ModerationConfig,
  ExportOptions,
} from '@/types/moderation.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ModerationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/moderation`;
  }

  /**
   * Fetch content items for moderation with filters and pagination
   */
  async getContentForModeration(
    filters: ModerationFilters = {},
    pagination: PaginationOptions = { page: 1, pageSize: 20 }
  ): Promise<ModerationApiResponse<ContentItem[]>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.contentType) params.append('contentType', filters.contentType);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.moderatorId) params.append('moderatorId', filters.moderatorId);
    if (filters.qualityScore) params.append('qualityScore', filters.qualityScore.toString());
    if (filters.hasAppeals !== undefined) params.append('hasAppeals', filters.hasAppeals.toString());
    if (filters.source) params.append('source', filters.source);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    
    // Add pagination
    params.append('page', pagination.page.toString());
    params.append('pageSize', pagination.pageSize.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await fetch(`${this.baseUrl}/content?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Moderate a specific content item
   */
  async moderateContent(
    contentId: string,
    action: ModerationAction,
    reason: string,
    moderatorId?: string
  ): Promise<ModerationApiResponse<ModerationResult>> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        reason,
        moderatorId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to moderate content: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Automated content filtering using AI
   */
  async runAutomatedFiltering(
    contentId: string,
    contentText: string,
    contentType: ContentType
  ): Promise<ModerationApiResponse<AutomatedFlag[]>> {
    const response = await fetch(`${this.baseUrl}/automated-filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        contentText,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run automated filtering: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Bulk automated filtering for multiple content items
   */
  async runBulkAutomatedFiltering(
    contentItems: { id: string; text: string; type: ContentType }[]
  ): Promise<ModerationApiResponse<{ [contentId: string]: AutomatedFlag[] }>> {
    const response = await fetch(`${this.baseUrl}/automated-filter/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentItems,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run bulk automated filtering: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculate quality score for content
   */
  async calculateQualityScore(
    contentId: string,
    contentText: string,
    contentType: ContentType,
    metadata?: Record<string, any>
  ): Promise<ModerationApiResponse<QualityMetrics>> {
    const response = await fetch(`${this.baseUrl}/quality-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        contentText,
        contentType,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate quality score: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user reports
   */
  async getReports(
    filters: ModerationFilters = {},
    pagination: PaginationOptions = { page: 1, pageSize: 20 }
  ): Promise<ModerationApiResponse<UserReport[]>> {
    const params = new URLSearchParams();
    
    // Add filters (similar to content filtering)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    // Add pagination
    params.append('page', pagination.page.toString());
    params.append('pageSize', pagination.pageSize.toString());

    const response = await fetch(`${this.baseUrl}/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolve a user report
   */
  async resolveReport(
    reportId: string,
    resolution: ReportResolution
  ): Promise<ModerationApiResponse<UserReport>> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolution),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Submit user report for content
   */
  async submitReport(
    contentId: string,
    reporterId: string,
    reportType: string,
    description: string,
    evidence?: string[]
  ): Promise<ModerationApiResponse<UserReport>> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        reporterId,
        reportType,
        description,
        evidence,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get content appeals
   */
  async getAppeals(
    filters: ModerationFilters = {},
    pagination: PaginationOptions = { page: 1, pageSize: 20 }
  ): Promise<ModerationApiResponse<ContentAppeal[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    params.append('page', pagination.page.toString());
    params.append('pageSize', pagination.pageSize.toString());

    const response = await fetch(`${this.baseUrl}/appeals?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appeals: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Handle a content appeal
   */
  async handleAppeal(
    appealId: string,
    resolution: AppealResolution
  ): Promise<ModerationApiResponse<ContentAppeal>> {
    const response = await fetch(`${this.baseUrl}/appeals/${appealId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolution),
    });

    if (!response.ok) {
      throw new Error(`Failed to handle appeal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Submit a content appeal
   */
  async submitAppeal(
    contentId: string,
    originalModerationId: string,
    appealerId: string,
    reason: string,
    evidence?: string[]
  ): Promise<ModerationApiResponse<ContentAppeal>> {
    const response = await fetch(`${this.baseUrl}/appeals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        originalModerationId,
        appealerId,
        reason,
        evidence,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit appeal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get moderation analytics
   */
  async getAnalytics(
    dateRange?: { start: Date; end: Date },
    filters?: ModerationFilters
  ): Promise<ModerationApiResponse<ModerationAnalytics>> {
    const params = new URLSearchParams();
    
    if (dateRange) {
      params.append('startDate', dateRange.start.toISOString());
      params.append('endDate', dateRange.end.toISOString());
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/analytics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get moderators
   */
  async getModerators(): Promise<ModerationApiResponse<Moderator[]>> {
    const response = await fetch(`${this.baseUrl}/moderators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch moderators: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update moderator
   */
  async updateModerator(
    moderatorId: string,
    updates: Partial<Moderator>
  ): Promise<ModerationApiResponse<Moderator>> {
    const response = await fetch(`${this.baseUrl}/moderators/${moderatorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update moderator: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get moderation policies
   */
  async getPolicies(): Promise<ModerationApiResponse<ModerationPolicy[]>> {
    const response = await fetch(`${this.baseUrl}/policies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch policies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create or update moderation policy
   */
  async savePolicy(
    policy: Omit<ModerationPolicy, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<ModerationApiResponse<ModerationPolicy>> {
    const url = policy.id 
      ? `${this.baseUrl}/policies/${policy.id}`
      : `${this.baseUrl}/policies`;
    
    const method = policy.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policy),
    });

    if (!response.ok) {
      throw new Error(`Failed to save policy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete moderation policy
   */
  async deletePolicy(policyId: string): Promise<ModerationApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/policies/${policyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete policy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get moderation configuration
   */
  async getConfig(): Promise<ModerationApiResponse<ModerationConfig>> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update moderation configuration
   */
  async updateConfig(
    config: Partial<ModerationConfig>
  ): Promise<ModerationApiResponse<ModerationConfig>> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export moderation data
   */
  async exportData(options: ExportOptions): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get content by ID with moderation details
   */
  async getContentDetails(contentId: string): Promise<ModerationApiResponse<ContentItem>> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content details: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Bulk moderate content items
   */
  async bulkModerate(
    contentIds: string[],
    action: ModerationAction,
    reason: string,
    moderatorId?: string
  ): Promise<ModerationApiResponse<ModerationResult[]>> {
    const response = await fetch(`${this.baseUrl}/content/bulk-moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentIds,
        action,
        reason,
        moderatorId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk moderate content: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Assign content to moderator
   */
  async assignToModerator(
    contentIds: string[],
    moderatorId: string
  ): Promise<ModerationApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/content/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentIds,
        moderatorId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign content: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get moderation queue stats
   */
  async getQueueStats(): Promise<ModerationApiResponse<{
    pending: number;
    assigned: number;
    overdue: number;
    highPriority: number;
  }>> {
    const response = await fetch(`${this.baseUrl}/queue/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch queue stats: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const moderationService = new ModerationService();
export default moderationService;
