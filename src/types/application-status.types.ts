/**
 * Application Status Tracking Types
 * Comprehensive type definitions for status tracking, history, notifications, and analytics
 */

// ==================== Core Status Types ====================

/**
 * Application status lifecycle stages
 */
export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

/**
 * Priority levels for status tracking
 */
export type StatusPriority = 'urgent' | 'high' | 'normal' | 'low';

/**
 * Reasons for status changes
 */
export type StatusChangeReason =
  | 'automatic'
  | 'manual'
  | 'client_action'
  | 'freelancer_action'
  | 'system'
  | 'deadline_passed'
  | 'requirements_met'
  | 'requirements_not_met';

// ==================== Status Change & History ====================

/**
 * Complete audit trail for status changes
 */
export interface StatusChange {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedBy: string;
  changedByName?: string;
  changedByRole?: 'client' | 'freelancer' | 'admin' | 'system';
  changedAt: Date;
  reason?: StatusChangeReason;
  comments?: string;
  metadata?: Record<string, any>;
  duration?: number; // Time spent in previous status (in milliseconds)
  isAutomated?: boolean;
}

/**
 * Status history with pagination support
 */
export interface StatusHistoryResponse {
  changes: StatusChange[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

// ==================== Client Communication ====================

/**
 * Client feedback linked to status changes
 */
export interface ClientFeedback {
  id: string;
  statusChangeId: string;
  applicationId: string;
  message: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  requestedAction?: string;
  actionRequired?: boolean;
  dueDate?: Date;
  createdAt: Date;
  createdBy: string;
  createdByName?: string;
  read?: boolean;
  respondedAt?: Date;
}

// ==================== Notifications ====================

/**
 * Notification types for status changes
 */
export type NotificationType =
  | 'STATUS_CHANGED'
  | 'CLIENT_FEEDBACK'
  | 'DEADLINE_APPROACHING'
  | 'INTERVIEW_SCHEDULED'
  | 'DECISION_MADE'
  | 'ACTION_REQUIRED';

/**
 * Status notification
 */
export interface StatusNotification {
  id: string;
  userId: string;
  applicationId: string;
  statusChangeId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<NotificationType, boolean>;
}

// ==================== Analytics & Metrics ====================

/**
 * Status distribution metrics
 */
export interface StatusDistribution {
  status: ApplicationStatus;
  count: number;
  percentage: number;
}

/**
 * Time metrics for status transitions
 */
export interface StatusTimeMetrics {
  status: ApplicationStatus;
  averageDays: number;
  minDays: number;
  maxDays: number;
  medianDays: number;
}

/**
 * Status transition data
 */
export interface StatusTransition {
  from: ApplicationStatus;
  to: ApplicationStatus;
  count: number;
  averageTime: number; // in days
}

/**
 * Comprehensive status metrics
 */
export interface StatusMetrics {
  totalApplications: number;
  averageTimeToDecision: number; // in days
  successRate: number; // percentage
  rejectionRate: number; // percentage
  statusDistribution: StatusDistribution[];
  timeInEachStatus: StatusTimeMetrics[];
  transitions: StatusTransition[];
  bottlenecks: Array<{
    status: ApplicationStatus;
    averageDays: number;
    reason?: string;
  }>;
  trendData: Array<{
    date: string;
    submitted: number;
    accepted: number;
    rejected: number;
  }>;
}

/**
 * Analytics filter options
 */
export interface StatusAnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  statuses?: ApplicationStatus[];
  clientIds?: string[];
  freelancerIds?: string[];
  projectTypes?: string[];
}

// ==================== Timeline Visualization ====================

/**
 * Timeline data point for visualization
 */
export interface TimelineDataPoint {
  id: string;
  date: Date;
  status: ApplicationStatus;
  title: string;
  description?: string;
  actor: string;
  actorName: string;
  duration: number; // time spent in this status (in milliseconds)
  feedback?: ClientFeedback;
  isCurrentStatus: boolean;
  metadata?: Record<string, any>;
}

/**
 * Timeline view preferences
 */
export interface TimelinePreferences {
  layout: 'horizontal' | 'vertical';
  zoom: number; // 0.5 to 2.0
  showDurations: boolean;
  showFeedback: boolean;
  groupByDate: boolean;
  colorScheme: 'default' | 'colorblind' | 'high-contrast';
}

// ==================== Status Workflow ====================

/**
 * Status transition rules
 */
export interface StatusTransitionRule {
  from: ApplicationStatus;
  to: ApplicationStatus;
  allowed: boolean;
  requiresApproval?: boolean;
  requiredRole?: 'client' | 'freelancer' | 'admin';
  conditions?: string[];
}

/**
 * Custom status workflow
 */
export interface StatusWorkflow {
  id: string;
  name: string;
  description?: string;
  statuses: ApplicationStatus[];
  transitions: StatusTransitionRule[];
  defaultStatus: ApplicationStatus;
  finalStatuses: ApplicationStatus[];
  isDefault: boolean;
}

// ==================== API Request/Response Types ====================

/**
 * Request to update application status
 */
export interface UpdateStatusRequest {
  applicationId: string;
  toStatus: ApplicationStatus;
  reason?: StatusChangeReason;
  comments?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to add client feedback
 */
export interface AddClientFeedbackRequest {
  statusChangeId: string;
  applicationId: string;
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  requestedAction?: string;
  actionRequired?: boolean;
  dueDate?: Date;
}

/**
 * Status tracking response
 */
export interface StatusTrackingResponse {
  currentStatus: ApplicationStatus;
  statusChanges: StatusChange[];
  timeline: TimelineDataPoint[];
  notifications: StatusNotification[];
  feedback: ClientFeedback[];
  estimatedDecisionDate?: Date;
  lastUpdated: Date;
}

// ==================== Filter & Search ====================

/**
 * Status history filters
 */
export interface StatusHistoryFilters {
  statuses?: ApplicationStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  changedBy?: string[];
  reasons?: StatusChangeReason[];
  hasComments?: boolean;
  hasFeedback?: boolean;
  searchQuery?: string;
}

/**
 * Notification filters
 */
export interface NotificationFilters {
  types?: NotificationType[];
  read?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  applicationIds?: string[];
}

// ==================== Export Options ====================

/**
 * Status data export options
 */
export interface StatusExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  includeTimeline?: boolean;
  includeFeedback?: boolean;
  includeMetrics?: boolean;
  filters?: StatusHistoryFilters;
  fileName?: string;
}

// ==================== Hook Return Types ====================

/**
 * Return type for useApplicationStatus hook
 */
export interface UseApplicationStatusReturn {
  // Current state
  currentStatus: ApplicationStatus | null;
  statusHistory: StatusChange[];
  timeline: TimelineDataPoint[];
  isLoading: boolean;
  error: string | null;

  // Actions
  updateStatus: (request: UpdateStatusRequest) => Promise<StatusChange>;
  addFeedback: (request: AddClientFeedbackRequest) => Promise<ClientFeedback>;
  refreshStatus: () => Promise<void>;

  // Pagination
  loadMoreHistory: () => Promise<void>;
  hasMoreHistory: boolean;

  // Filters
  filters: StatusHistoryFilters;
  setFilters: (filters: StatusHistoryFilters) => void;
  clearFilters: () => void;
}

/**
 * Return type for useStatusNotifications hook
 */
export interface UseStatusNotificationsReturn {
  notifications: StatusNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;

  // Pagination
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Return type for useStatusAnalytics hook
 */
export interface UseStatusAnalyticsReturn {
  metrics: StatusMetrics | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: StatusAnalyticsFilters;
  setFilters: (filters: StatusAnalyticsFilters) => void;
  clearFilters: () => void;

  // Actions
  refresh: () => Promise<void>;
  exportData: (options: StatusExportOptions) => Promise<Blob>;
}

// ==================== Store Types ====================

/**
 * Status filter store state
 */
export interface StatusFilterStore {
  filters: StatusHistoryFilters;
  setFilters: (filters: StatusHistoryFilters) => void;
  clearFilters: () => void;
  addStatusFilter: (status: ApplicationStatus) => void;
  removeStatusFilter: (status: ApplicationStatus) => void;
}

/**
 * Timeline preferences store state
 */
export interface TimelinePreferencesStore {
  preferences: TimelinePreferences;
  setPreferences: (prefs: Partial<TimelinePreferences>) => void;
  resetPreferences: () => void;
}

/**
 * Notification store state
 */
export interface NotificationStore {
  isOpen: boolean;
  selectedNotification: StatusNotification | null;
  setIsOpen: (open: boolean) => void;
  setSelectedNotification: (notification: StatusNotification | null) => void;
  preferences: NotificationPreferences;
  setPreferences: (prefs: Partial<NotificationPreferences>) => void;
}
