// Advanced Escrow Management System Types
// Comprehensive type definitions for secure escrow operations

export interface StartDisputePayload {
  contractId: string;
  signer: string;
  reason: string;
  evidence?: string[];
  category: DisputeCategory;
}

export interface DisputeResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  transactionId?: string;
  disputeId?: string;
}

export interface UpdateEscrowPayload {
  contractId: string;
  signer: string;
  milestones?: Milestone[];
  amounts?: number[];
  parameters?: Record<string, unknown>;
  autoReleaseSettings?: AutoReleaseSettings;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'disputed';
  completionCriteria: string[];
  deliverables: string[];
  autoReleaseAfter?: number; // hours
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowUpdateResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  transactionId?: string;
  contractId?: string;
  updatedMilestones?: Milestone[];
}

export interface InitializeContractPayload {
  clientId: string;
  freelancerId: string;
  amount: number;
  description: string;
  milestones?: Milestone[];
  escrowType: EscrowType;
  securitySettings: SecuritySettings;
  autoReleaseSettings?: AutoReleaseSettings;
  complianceSettings: ComplianceSettings;
}

export interface ReleaseFundsPayload {
  contractId: string;
  signer: string;
  amount: number;
  milestoneId?: string;
  reason?: string;
  evidence?: string[];
}

export interface TransactionResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  transactionId?: string;
  data?: Record<string, unknown>;
}

// Advanced Escrow Types
export type EscrowType = 'milestone' | 'time_based' | 'deliverable' | 'hybrid';
export type EscrowStatus = 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'expired';
export type DisputeCategory = 'quality' | 'delivery' | 'payment' | 'communication' | 'scope' | 'other';
export type ReleaseTrigger = 'manual' | 'automatic' | 'milestone' | 'time_based' | 'deliverable_approval';

export interface EscrowContract {
  id: string;
  clientId: string;
  freelancerId: string;
  projectId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  type: EscrowType;
  description: string;
  milestones: Milestone[];
  securitySettings: SecuritySettings;
  autoReleaseSettings?: AutoReleaseSettings;
  complianceSettings: ComplianceSettings;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  completedAt?: string;
  disputeId?: string;
  auditTrail: AuditEntry[];
  performanceMetrics: EscrowMetrics;
}

export interface SecuritySettings {
  multiSigRequired: boolean;
  timeLockDuration?: number; // hours
  maxDisputeWindow: number; // hours
  requireKYC: boolean;
  requireInsurance: boolean;
  encryptionLevel: 'standard' | 'enhanced' | 'military';
  accessControls: AccessControl[];
}

export interface AccessControl {
  role: 'client' | 'freelancer' | 'arbitrator' | 'admin';
  permissions: Permission[];
  conditions?: string[];
}

export interface Permission {
  action: 'view' | 'modify' | 'release' | 'dispute' | 'approve';
  scope: 'milestone' | 'contract' | 'funds' | 'all';
  restrictions?: string[];
}

export interface AutoReleaseSettings {
  enabled: boolean;
  trigger: ReleaseTrigger;
  conditions: ReleaseCondition[];
  fallbackAction: 'hold' | 'release' | 'dispute';
  notificationSettings: NotificationSettings;
}

export interface ReleaseCondition {
  type: 'time_elapsed' | 'milestone_completion' | 'deliverable_approval' | 'client_approval';
  value: number | string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook?: string;
  recipients: string[];
}

export interface ComplianceSettings {
  jurisdiction: string;
  regulatoryRequirements: string[];
  taxHandling: 'client' | 'freelancer' | 'platform';
  reportingRequirements: ReportingRequirement[];
  auditLevel: 'basic' | 'standard' | 'comprehensive';
}

export interface ReportingRequirement {
  type: 'transaction' | 'tax' | 'regulatory' | 'audit';
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'json' | 'xml' | 'csv' | 'pdf';
  recipients: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  transactionId?: string;
}

export interface EscrowMetrics {
  totalValue: number;
  averageCompletionTime: number;
  disputeRate: number;
  successRate: number;
  clientSatisfaction: number;
  freelancerSatisfaction: number;
  platformFees: number;
  processingTime: number;
}

export interface EscrowAnalytics {
  period: {
    start: string;
    end: string;
  };
  totalEscrows: number;
  totalValue: number;
  averageValue: number;
  completionRate: number;
  disputeRate: number;
  averageProcessingTime: number;
  topCategories: CategoryMetrics[];
  performanceTrends: PerformanceTrend[];
  userSatisfaction: SatisfactionMetrics;
  financialMetrics: FinancialMetrics;
}

export interface CategoryMetrics {
  category: string;
  count: number;
  totalValue: number;
  averageValue: number;
  successRate: number;
  disputeRate: number;
}

export interface PerformanceTrend {
  period: string;
  escrowsCreated: number;
  escrowsCompleted: number;
  totalValue: number;
  disputeCount: number;
  averageProcessingTime: number;
}

export interface SatisfactionMetrics {
  overallRating: number;
  clientRating: number;
  freelancerRating: number;
  responseTime: number;
  resolutionTime: number;
  feedbackCount: number;
}

export interface FinancialMetrics {
  totalFees: number;
  averageFee: number;
  feeGrowth: number;
  revenueByType: Record<string, number>;
  costBreakdown: Record<string, number>;
}

export interface EscrowCreationRequest {
  clientId: string;
  freelancerId: string;
  projectId: string;
  amount: number;
  currency: string;
  description: string;
  milestones: MilestoneCreationRequest[];
  escrowType: EscrowType;
  securitySettings: SecuritySettings;
  autoReleaseSettings?: AutoReleaseSettings;
  complianceSettings: ComplianceSettings;
  terms: string;
  attachments?: string[];
}

export interface MilestoneCreationRequest {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  completionCriteria: string[];
  deliverables: string[];
  autoReleaseAfter?: number;
  requiresApproval: boolean;
}

export interface EscrowFundManagement {
  contractId: string;
  totalAmount: number;
  releasedAmount: number;
  pendingAmount: number;
  disputedAmount: number;
  availableBalance: number;
  lockedBalance: number;
  feeAmount: number;
  currency: string;
  lastUpdated: string;
  fundHistory: FundTransaction[];
}

export interface FundTransaction {
  id: string;
  type: 'deposit' | 'release' | 'refund' | 'fee' | 'dispute_hold';
  amount: number;
  currency: string;
  timestamp: string;
  description: string;
  transactionId?: string;
  milestoneId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface EscrowSecurityValidation {
  contractId: string;
  validationResults: ValidationResult[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  lastValidated: string;
}

export interface ValidationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
}

export interface EscrowWorkflow {
  id: string;
  name: string;
  description: string;
  type: EscrowType;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'milestone' | 'approval' | 'payment' | 'notification' | 'validation';
  order: number;
  conditions: string[];
  actions: WorkflowAction[];
  timeout?: number;
  required: boolean;
}

export interface WorkflowAction {
  type: 'release_funds' | 'send_notification' | 'create_dispute' | 'update_status' | 'log_audit';
  parameters: Record<string, unknown>;
  conditions?: string[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface EscrowIntegration {
  id: string;
  name: string;
  type: 'payment_processor' | 'banking' | 'compliance' | 'reporting' | 'notification';
  provider: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
  lastSync: string;
  syncStatus: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

export interface EscrowNotification {
  id: string;
  contractId: string;
  type: 'milestone_due' | 'payment_released' | 'dispute_created' | 'contract_expiring' | 'auto_release_triggered';
  recipient: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  channels: ('email' | 'sms' | 'push' | 'webhook')[];
}
