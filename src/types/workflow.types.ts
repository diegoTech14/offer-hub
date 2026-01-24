// Workflow Types for Dispute Resolution System
// Based on PRD.md specifications

export interface WorkflowStage {
  id: string;
  disputeId: string;
  stageName: WorkflowStageName;
  stageOrder: number;
  status: WorkflowStageStatus;
  startedAt?: Date;
  completedAt?: Date;
  deadline?: Date;
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export type WorkflowStageName = 
  | 'dispute_initiation'
  | 'mediator_assignment'
  | 'evidence_collection'
  | 'mediation_process'
  | 'resolution_or_escalation'
  | 'arbitration'
  | 'resolution_implementation';

export type WorkflowStageStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'escalated';

export interface WorkflowProgress {
  id: string;
  disputeId: string;
  stageId: string;
  progressPercentage: number;
  milestone?: string;
  notes?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface WorkflowNotification {
  id: string;
  disputeId: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
  deliveryMethod: DeliveryMethod;
}

export type NotificationType = 
  | 'stage_transition'
  | 'deadline_alert'
  | 'action_required'
  | 'resolution_update'
  | 'system_alert'
  | 'evidence_request'
  | 'mediator_assignment'
  | 'arbitration_escalation';

export type DeliveryMethod = 
  | 'in_app'
  | 'email'
  | 'sms'
  | 'push';

export interface WorkflowAuditTrail {
  id: string;
  disputeId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  oldState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowConfiguration {
  disputeType: string;
  stages: WorkflowStageConfig[];
  timeouts: Record<string, number>; // in hours
  escalationRules: EscalationRule[];
  notificationSettings: NotificationSettings;
}

export interface WorkflowStageConfig {
  stageName: WorkflowStageName;
  duration: number; // in hours
  requirements: string[];
  actions: string[];
  autoAdvance: boolean;
  escalationAfter?: number; // hours
}

export interface EscalationRule {
  fromStage: WorkflowStageName;
  toStage: WorkflowStageName;
  trigger: 'timeout' | 'manual' | 'condition';
  condition?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: DeliveryMethod[];
  timing: {
    immediate: NotificationType[];
    daily: NotificationType[];
    weekly: NotificationType[];
  };
}

export interface WorkflowAnalytics {
  totalDisputes: number;
  averageResolutionTime: number;
  stageCompletionRates: Record<WorkflowStageName, number>;
  escalationRates: Record<string, number>;
  userSatisfactionScore: number;
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
  };
}

export interface WorkflowState {
  disputeId: string;
  currentStage: WorkflowStageName;
  progress: WorkflowProgress[];
  notifications: WorkflowNotification[];
  auditTrail: WorkflowAuditTrail[];
  configuration: WorkflowConfiguration;
  analytics?: WorkflowAnalytics;
}

// Stage-specific data interfaces
export interface DisputeInitiationData {
  reason: string;
  projectId: string;
  description: string;
  evidence?: File[];
  disputeAmount: number;
}

export interface MediatorAssignmentData {
  mediatorId: string;
  assignedAt: Date;
  acceptedAt?: Date;
  declinedReason?: string;
  expertise: string[];
}

export interface EvidenceCollectionData {
  evidence: EvidenceItem[];
  requestedBy: string;
  deadline: Date;
  validationStatus: 'pending' | 'validated' | 'rejected';
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  ipfsHash?: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface MediationData {
  sessions: MediationSession[];
  settlementAttempts: SettlementAttempt[];
  mediatorNotes: string[];
  nextSteps: string[];
}

export interface MediationSession {
  id: string;
  scheduledAt: Date;
  duration: number; // in minutes
  participants: string[];
  outcome: 'ongoing' | 'settlement_reached' | 'escalation_needed';
  notes: string;
}

export interface SettlementAttempt {
  id: string;
  proposedBy: string;
  proposedAt: Date;
  terms: string;
  acceptedBy: string[];
  rejectedBy: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface ResolutionData {
  outcome: 'settlement' | 'escalation' | 'timeout';
  decision?: DisputeOutcome;
  settlementTerms?: string;
  escalatedTo?: 'arbitration';
  resolvedAt: Date;
  resolvedBy: string;
}

export type DisputeOutcome = 
  | 'favor_client'
  | 'favor_freelancer'
  | 'split'
  | 'no_decision';

export interface ArbitrationData {
  arbitratorId: string;
  assignedAt: Date;
  acceptedAt?: Date;
  evidenceReview: EvidenceReview[];
  finalDecision: DisputeOutcome;
  decisionReasoning: string;
  bindingDecision: boolean;
}

export interface EvidenceReview {
  evidenceId: string;
  reviewedBy: string;
  reviewedAt: Date;
  relevance: 'high' | 'medium' | 'low';
  credibility: 'high' | 'medium' | 'low';
  notes: string;
}

export interface ResolutionImplementationData {
  fundRelease: FundRelease;
  notificationsSent: boolean;
  feedbackCollected: boolean;
  disputeClosed: boolean;
  closureReason: string;
}

export interface FundRelease {
  amount: number;
  clientAmount: number;
  freelancerAmount: number;
  platformFee: number;
  releaseMethod: 'escrow_contract' | 'manual';
  transactionHash?: string;
  releasedAt: Date;
}

// Mobile-specific interfaces
export interface MobileWorkflowState {
  currentStage: WorkflowStageName;
  progressPercentage: number;
  nextAction: string;
  deadline?: Date;
  isOfflineCapable: boolean;
  pendingActions: PendingAction[];
}

export interface PendingAction {
  id: string;
  type: 'upload_evidence' | 'respond_to_mediator' | 'accept_settlement' | 'escalate_dispute';
  title: string;
  description: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// API Request/Response interfaces
export interface WorkflowApiRequest {
  disputeId: string;
  action: WorkflowAction;
  data?: Record<string, any>;
}

export type WorkflowAction = 
  | 'get_workflow_state'
  | 'transition_stage'
  | 'update_progress'
  | 'send_notification'
  | 'get_audit_trail'
  | 'get_analytics';

export interface WorkflowApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Hook interfaces
export interface UseDisputeWorkflowReturn {
  workflowState: WorkflowState | null;
  isLoading: boolean;
  error: string | null;
  currentStage: WorkflowStageName | null;
  progressPercentage: number;
  nextDeadline?: Date;
  canAdvanceStage: boolean;
  actions: {
    transitionStage: (stage: WorkflowStageName) => Promise<void>;
    updateProgress: (progress: Partial<WorkflowProgress>) => Promise<void>;
    sendNotification: (notification: Omit<WorkflowNotification, 'id' | 'sentAt'>) => Promise<void>;
    getAnalytics: () => Promise<WorkflowAnalytics>;
  };
}

export interface UseProgressTrackingReturn {
  progress: WorkflowProgress[];
  currentMilestone?: string;
  overallProgress: number;
  isOnTrack: boolean;
  actions: {
    updateProgress: (stageId: string, percentage: number, milestone?: string) => Promise<void>;
    addNote: (stageId: string, note: string) => Promise<void>;
    markMilestone: (stageId: string, milestone: string) => Promise<void>;
  };
}

export interface UseNotificationsReturn {
  notifications: WorkflowNotification[];
  unreadCount: number;
  actions: {
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    sendNotification: (notification: Omit<WorkflowNotification, 'id' | 'sentAt'>) => Promise<void>;
    updatePreferences: (settings: NotificationSettings) => Promise<void>;
  };
}

export interface UseDeadlineManagementReturn {
  upcomingDeadlines: Deadline[];
  overdueDeadlines: Deadline[];
  actions: {
    setDeadline: (stageId: string, deadline: Date) => Promise<void>;
    extendDeadline: (stageId: string, extensionHours: number) => Promise<void>;
    triggerEscalation: (stageId: string, reason: string) => Promise<void>;
  };
}

export interface Deadline {
  id: string;
  stageId: string;
  stageName: WorkflowStageName;
  deadline: Date;
  isOverdue: boolean;
  escalationTriggered: boolean;
  extensionHistory: DeadlineExtension[];
}

export interface DeadlineExtension {
  extendedAt: Date;
  extendedBy: string;
  originalDeadline: Date;
  newDeadline: Date;
  reason: string;
}

// Component Props interfaces
export interface DisputeWorkflowProps {
  disputeId: string;
  onStageChange?: (stage: WorkflowStageName) => void;
  onProgressUpdate?: (progress: number) => void;
  showAnalytics?: boolean;
  mobileOptimized?: boolean;
}

export interface WorkflowStagesProps {
  stages: WorkflowStage[];
  currentStage: WorkflowStageName;
  onStageClick?: (stage: WorkflowStageName) => void;
  showProgress?: boolean;
  compact?: boolean;
}

export interface ProgressTrackingProps {
  disputeId: string;
  showMilestones?: boolean;
  showNotes?: boolean;
  allowUpdates?: boolean;
  compact?: boolean;
}

export interface WorkflowAnalyticsProps {
  disputeId?: string; // If undefined, shows platform-wide analytics
  timeRange: '7d' | '30d' | '90d' | '1y';
  showDetailedMetrics?: boolean;
  exportable?: boolean;
}

export interface DeadlineManagerProps {
  disputeId: string;
  showOverdueOnly?: boolean;
  allowExtensions?: boolean;
  showEscalationHistory?: boolean;
}

export interface NotificationCenterProps {
  disputeId?: string;
  showAllNotifications?: boolean;
  allowMarkAsRead?: boolean;
  allowSendNotification?: boolean;
  compact?: boolean;
}

/**
 * Props for the MobileWorkflow component
 * 
 * This interface defines the properties for the mobile-optimized dispute workflow component
 * that provides a touch-friendly interface for managing dispute resolution processes.
 */
export interface MobileWorkflowProps {
  /** 
   * Unique identifier for the dispute being managed
   * @example "dispute_12345"
   */
  disputeId: string;
  
  /** 
   * Callback function called when a pending action is completed
   * @param action - The completed action object containing id, type, title, etc.
   * @example onActionComplete={(action) => console.log('Action completed:', action.title)}
   */
  onActionComplete?: (action: PendingAction) => void;
  
  /** 
   * Whether to show the offline/online status indicator in the header
   * @default true
   * @example showOfflineIndicator={false}
   */
  showOfflineIndicator?: boolean;
  
  /** 
   * Whether to enable swipe gestures for navigating between pending actions
   * @default true
   * @example enableGestures={false}
   */
  enableGestures?: boolean;
}

export interface AuditTrailViewerProps {
  disputeId: string;
  showDetailedChanges?: boolean;
  filterByAction?: string[];
  filterByUser?: string[];
  exportable?: boolean;
}
