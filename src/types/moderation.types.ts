/**
 * @fileoverview TypeScript interfaces for content moderation system
 * @author Offer Hub Team
 */

// Base content types
export type ContentType = 'project' | 'profile' | 'review' | 'message' | 'service' | 'comment' | 'image' | 'document';

export type ModerationAction = 'approve' | 'reject' | 'flag' | 'remove' | 'warn' | 'suspend' | 'ban';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'removed' | 'under_review';

export type ContentPriority = 'low' | 'medium' | 'high' | 'critical';

export type ReviewSource = 'automated' | 'user_report' | 'manual_review' | 'appeal';

export type QualityScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Content moderation interfaces
export interface ContentItem {
  id: string;
  type: ContentType;
  authorId: string;
  authorName: string;
  authorEmail: string;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  status: ModerationStatus;
  priority: ContentPriority;
  qualityScore?: QualityScore;
  flagCount: number;
  reportCount: number;
  isPublic: boolean;
  parentId?: string; // For nested content like comments
  attachments?: ContentAttachment[];
}

export interface ContentAttachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isModerated: boolean;
  moderationResult?: ModerationResult;
}

export interface ModerationResult {
  id: string;
  contentId: string;
  action: ModerationAction;
  reason: string;
  confidence: number; // 0-1 for automated, 1 for manual
  moderatorId?: string;
  moderatorName?: string;
  automatedFlags: AutomatedFlag[];
  manualNotes?: string;
  appealable: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AutomatedFlag {
  type: FlagType;
  confidence: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'toxicity' | 'spam' | 'inappropriate' | 'quality' | 'policy' | 'safety';
}

export type FlagType = 
  | 'toxic_language'
  | 'hate_speech'
  | 'spam'
  | 'inappropriate_content'
  | 'low_quality'
  | 'misleading_information'
  | 'copyright_violation'
  | 'privacy_violation'
  | 'harassment'
  | 'adult_content'
  | 'violence'
  | 'self_harm'
  | 'policy_violation';

// User reporting and flagging
export interface UserReport {
  id: string;
  contentId: string;
  reporterId: string;
  reporterName: string;
  reportType: FlagType;
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: ContentPriority;
  assignedModeratorId?: string;
  resolution?: ReportResolution;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportResolution {
  action: ModerationAction;
  reason: string;
  moderatorId: string;
  moderatorName: string;
  notes?: string;
  resolvedAt: Date;
  followUpRequired: boolean;
}

// Quality scoring system
export interface QualityMetrics {
  overall: QualityScore;
  content: QualityScore;
  relevance: QualityScore;
  clarity: QualityScore;
  completeness: QualityScore;
  originality: QualityScore;
  factors: QualityFactor[];
  suggestions: string[];
  lastCalculated: Date;
}

export interface QualityFactor {
  name: string;
  score: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Moderation policies and rules
export interface ModerationPolicy {
  id: string;
  name: string;
  description: string;
  contentTypes: ContentType[];
  rules: PolicyRule[];
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  action: ModerationAction;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isAutomated: boolean;
  confidence: number;
  appealable: boolean;
}

export interface RuleCondition {
  type: 'keyword' | 'pattern' | 'ai_classification' | 'user_score' | 'content_length' | 'custom';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'matches_pattern' | 'ai_confidence';
  value: string | number | boolean;
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

// Moderator management
export interface Moderator {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ModeratorRole;
  permissions: ModeratorPermission[];
  specializations: ContentType[];
  isActive: boolean;
  performance: ModeratorPerformance;
  createdAt: Date;
  lastActiveAt: Date;
}

export type ModeratorRole = 'junior' | 'senior' | 'lead' | 'admin';

export type ModeratorPermission = 
  | 'view_content'
  | 'moderate_content'
  | 'manage_reports'
  | 'handle_appeals'
  | 'manage_policies'
  | 'view_analytics'
  | 'manage_moderators'
  | 'export_data'
  | 'system_config';

export interface ModeratorPerformance {
  totalReviews: number;
  correctDecisions: number;
  overturnedDecisions: number;
  averageResponseTime: number; // in minutes
  averageDecisionTime: number; // in minutes
  accuracyRate: number; // 0-1
  efficiencyScore: number; // 0-1
  lastEvaluated: Date;
  monthlyStats: MonthlyModerationStats[];
}

export interface MonthlyModerationStats {
  month: string; // YYYY-MM
  reviewCount: number;
  accuracy: number;
  avgResponseTime: number;
  flaggedContent: number;
  appealsHandled: number;
}

// Appeal system
export interface ContentAppeal {
  id: string;
  contentId: string;
  originalModerationId: string;
  appealerId: string;
  appealerName: string;
  reason: string;
  evidence?: string[];
  status: AppealStatus;
  priority: ContentPriority;
  assignedModeratorId?: string;
  resolution?: AppealResolution;
  createdAt: Date;
  updatedAt: Date;
}

export type AppealStatus = 'pending' | 'under_review' | 'approved' | 'denied' | 'escalated';

export interface AppealResolution {
  decision: 'upheld' | 'overturned' | 'modified';
  newAction?: ModerationAction;
  reason: string;
  moderatorId: string;
  moderatorName: string;
  notes?: string;
  resolvedAt: Date;
  escalatedTo?: string;
}

// Analytics and metrics
export interface ModerationAnalytics {
  overview: ModerationOverview;
  contentMetrics: ContentTypeMetrics[];
  moderatorMetrics: ModeratorMetrics;
  policyEffectiveness: PolicyEffectiveness[];
  trendData: TrendData[];
  qualityMetrics: QualityAnalytics;
}

export interface ModerationOverview {
  totalContent: number;
  pendingReview: number;
  autoModerated: number;
  manuallyReviewed: number;
  flaggedContent: number;
  removedContent: number;
  appealsReceived: number;
  appealsOverturned: number;
  averageResponseTime: number;
  qualityScoreAverage: number;
}

export interface ContentTypeMetrics {
  type: ContentType;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  avgQualityScore: number;
  flagRate: number;
  appealRate: number;
}

export interface ModeratorMetrics {
  totalModerators: number;
  activeModerators: number;
  avgAccuracy: number;
  avgResponseTime: number;
  workloadDistribution: WorkloadDistribution[];
}

export interface WorkloadDistribution {
  moderatorId: string;
  moderatorName: string;
  assignedContent: number;
  completedReviews: number;
  pendingReviews: number;
  workloadPercentage: number;
}

export interface PolicyEffectiveness {
  policyId: string;
  policyName: string;
  triggeredCount: number;
  accuracyRate: number;
  falsePositiveRate: number;
  effectiveness: number;
}

export interface TrendData {
  date: string;
  totalContent: number;
  flaggedContent: number;
  removedContent: number;
  avgQualityScore: number;
  responseTime: number;
}

export interface QualityAnalytics {
  averageScore: number;
  distribution: ScoreDistribution[];
  improvementTrends: QualityTrend[];
  topIssues: string[];
}

export interface ScoreDistribution {
  score: QualityScore;
  count: number;
  percentage: number;
}

export interface QualityTrend {
  contentType: ContentType;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  period: string;
}

// API interfaces
export interface ModerationFilters {
  status?: ModerationStatus;
  contentType?: ContentType;
  priority?: ContentPriority;
  moderatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  qualityScore?: QualityScore;
  hasAppeals?: boolean;
  source?: ReviewSource;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ModerationApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Hook interfaces
export interface UseModerationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: ModerationFilters;
  pagination?: PaginationOptions;
}

export interface UseModerationReturn {
  // Data
  content: ContentItem[];
  reports: UserReport[];
  appeals: ContentAppeal[];
  moderators: Moderator[];
  policies: ModerationPolicy[];
  analytics: ModerationAnalytics | null;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isRefreshing: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  moderateContent: (contentId: string, action: ModerationAction, reason: string) => Promise<void>;
  resolveReport: (reportId: string, resolution: ReportResolution) => Promise<void>;
  handleAppeal: (appealId: string, resolution: AppealResolution) => Promise<void>;
  updateFilters: (filters: ModerationFilters) => void;
  refreshData: () => Promise<void>;
  exportData: (options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeMetadata?: boolean;
  filters?: ModerationFilters;
}

// Configuration interfaces
export interface ModerationConfig {
  autoModerationEnabled: boolean;
  minConfidenceThreshold: number;
  maxReviewTimeHours: number;
  escalationThreshold: number;
  qualityScoreThreshold: QualityScore;
  enableAppealProcess: boolean;
  maxAppealsPerUser: number;
  appealTimeoutDays: number;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  slackIntegration: boolean;
  pushNotifications: boolean;
  alertThresholds: {
    highPriorityContent: number;
    pendingReviewBacklog: number;
    appealVolume: number;
  };
}

// Error interfaces
export interface ModerationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Component props interfaces
export interface ContentModerationProps {
  className?: string;
  initialFilters?: ModerationFilters;
  onContentModerated?: (contentId: string, action: ModerationAction) => void;
}

export interface AutomatedFilteringProps {
  className?: string;
  config?: ModerationConfig;
  onConfigUpdate?: (config: ModerationConfig) => void;
}

export interface ManualReviewProps {
  className?: string;
  moderatorId?: string;
  specialization?: ContentType[];
}

export interface QualityScoringProps {
  className?: string;
  contentTypes?: ContentType[];
  showTrends?: boolean;
}
