/**
 * Payment Security and Fraud Prevention Types
 * Comprehensive type definitions for security monitoring, fraud detection, and risk assessment
 */

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  transactionId?: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  description: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: SecurityAction[];
}

export enum SecurityEventType {
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  UNUSUAL_LOCATION = 'unusual_location',
  VELOCITY_CHECK_FAILED = 'velocity_check_failed',
  DEVICE_FINGERPRINT_MISMATCH = 'device_fingerprint_mismatch',
  IP_REPUTATION_ALERT = 'ip_reputation_alert',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly',
  PAYMENT_METHOD_FRAUD = 'payment_method_fraud',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover_attempt',
  MONEY_LAUNDERING_INDICATOR = 'money_laundering_indicator'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityAction {
  type: SecurityActionType;
  timestamp: Date;
  automated: boolean;
  description: string;
  result: SecurityActionResult;
}

export enum SecurityActionType {
  BLOCK_TRANSACTION = 'block_transaction',
  REQUIRE_ADDITIONAL_AUTH = 'require_additional_auth',
  TEMPORARY_ACCOUNT_LOCK = 'temporary_account_lock',
  ALERT_SENT = 'alert_sent',
  MANUAL_REVIEW_TRIGGERED = 'manual_review_triggered',
  IP_BLOCKED = 'ip_blocked',
  DEVICE_BLOCKED = 'device_blocked',
  ESCALATE_TO_ADMIN = 'escalate_to_admin'
}

export enum SecurityActionResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

export interface FraudDetectionResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  reasons: FraudReason[];
  recommendedActions: SecurityActionType[];
  confidence: number; // 0-1
  modelVersion: string;
  processedAt: Date;
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface FraudReason {
  code: string;
  description: string;
  weight: number;
  category: FraudCategory;
}

export enum FraudCategory {
  BEHAVIORAL = 'behavioral',
  TRANSACTIONAL = 'transactional',
  DEVICE = 'device',
  LOCATION = 'location',
  VELOCITY = 'velocity',
  REPUTATION = 'reputation'
}

export interface RiskAssessment {
  transactionId: string;
  userId: string;
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  assessmentDate: Date;
  assessedBy: string; // system or user ID
  validUntil: Date;
  requiresManualReview: boolean;
}

export interface RiskFactor {
  factor: RiskFactorType;
  weight: number;
  score: number; // 0-100
  description: string;
  dataPoints: Record<string, any>;
}

export enum RiskFactorType {
  USER_HISTORY = 'user_history',
  TRANSACTION_AMOUNT = 'transaction_amount',
  PAYMENT_METHOD = 'payment_method',
  MERCHANT_REPUTATION = 'merchant_reputation',
  DEVICE_TRUST = 'device_trust',
  LOCATION_ANALYSIS = 'location_analysis',
  TIME_ANALYSIS = 'time_analysis',
  VELOCITY_PATTERNS = 'velocity_patterns'
}

export interface MitigationStrategy {
  strategy: MitigationStrategyType;
  priority: number;
  description: string;
  automatable: boolean;
  estimatedReduction: number; // percentage risk reduction
}

export enum MitigationStrategyType {
  TWO_FACTOR_AUTH = 'two_factor_auth',
  PAYMENT_VERIFICATION = 'payment_verification',
  MANUAL_REVIEW = 'manual_review',
  TRANSACTION_LIMIT = 'transaction_limit',
  COOLING_PERIOD = 'cooling_period',
  DEVICE_VERIFICATION = 'device_verification',
  BIOMETRIC_AUTH = 'biometric_auth'
}

export interface SecurityMetrics {
  timeframe: TimeframePeriod;
  startDate: Date;
  endDate: Date;
  totalTransactions: number;
  blockedTransactions: number;
  falsePositives: number;
  truePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageRiskScore: number;
  topRiskFactors: RiskFactorSummary[];
  securityEventsByType: Record<SecurityEventType, number>;
  responseTimeMetrics: ResponseTimeMetrics;
}

export enum TimeframePeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export interface RiskFactorSummary {
  factor: RiskFactorType;
  occurrences: number;
  averageWeight: number;
  totalRiskContribution: number;
}

export interface ResponseTimeMetrics {
  averageDetectionTime: number; // milliseconds
  averageResponseTime: number; // milliseconds
  p95DetectionTime: number;
  p95ResponseTime: number;
  totalProcessingTime: number;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
  isVpn?: boolean;
  isTor?: boolean;
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  canvas: string;
  webgl: string;
  trustScore: number; // 0-100
  firstSeen: Date;
  lastSeen: Date;
  associated_users: string[];
}

export interface PaymentSecurityConfig {
  riskScoreThresholds: RiskScoreThresholds;
  velocityLimits: VelocityLimits;
  geoRestrictions: GeoRestrictions;
  deviceTrustSettings: DeviceTrustSettings;
  mlModelSettings: MLModelSettings;
  alertingSettings: AlertingSettings;
  complianceSettings: ComplianceSettings;
}

export interface RiskScoreThresholds {
  allowAutomatic: number; // 0-30
  requireReview: number; // 31-70
  blockTransaction: number; // 71-100
  escalateToCritical: number; // 85-100
}

export interface VelocityLimits {
  transactionsPerMinute: number;
  transactionsPerHour: number;
  transactionsPerDay: number;
  amountPerHour: number;
  amountPerDay: number;
  amountPerWeek: number;
}

export interface GeoRestrictions {
  blockedCountries: string[];
  restrictedCountries: string[]; // require additional verification
  allowedCountries: string[];
  vpnPolicy: VpnPolicy;
  torPolicy: TorPolicy;
}

export enum VpnPolicy {
  ALLOW = 'allow',
  REVIEW = 'review',
  BLOCK = 'block'
}

export enum TorPolicy {
  ALLOW = 'allow',
  REVIEW = 'review',
  BLOCK = 'block'
}

export interface DeviceTrustSettings {
  minimumTrustScore: number;
  requireKnownDevice: boolean;
  deviceMemoryDays: number;
  enableFingerprinting: boolean;
}

export interface MLModelSettings {
  modelVersion: string;
  confidenceThreshold: number;
  enableRealTimeScoring: boolean;
  batchProcessingInterval: number; // minutes
  retrainingFrequency: number; // days
}

export interface AlertingSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  webhookAlerts: boolean;
  slackIntegration: boolean;
  severityThreshold: SecuritySeverity;
  alertRecipients: string[];
}

export interface ComplianceSettings {
  enablePciCompliance: boolean;
  enableAmlCompliance: boolean;
  enableKycRequirements: boolean;
  dataRetentionDays: number;
  auditLogLevel: AuditLogLevel;
  regulatoryReporting: boolean;
}

export enum AuditLogLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  affectedUsers: string[];
  affectedTransactions: string[];
  timeline: IncidentTimelineEntry[];
  rootCause?: string;
  resolution?: string;
  preventionMeasures?: string[];
}

export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  description: string;
  performedBy: string;
}

export interface SecurityDashboardData {
  currentRiskLevel: RiskLevel;
  activeIncidents: number;
  todayMetrics: DailySecurityMetrics;
  trendData: SecurityTrendData;
  alerts: SecurityAlert[];
  systemHealth: SystemHealthStatus;
}

export interface DailySecurityMetrics {
  transactionsProcessed: number;
  fraudAttempts: number;
  blockedTransactions: number;
  successfulBlocks: number;
  falsePositives: number;
  averageRiskScore: number;
}

export interface SecurityTrendData {
  riskScoreTrend: TrendDataPoint[];
  fraudAttemptsTrend: TrendDataPoint[];
  responseTimeTrend: TrendDataPoint[];
  accuracyTrend: TrendDataPoint[];
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
}

export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface SystemHealthStatus {
  fraudDetectionService: ServiceStatus;
  riskAssessmentService: ServiceStatus;
  securityMonitoring: ServiceStatus;
  alertingSystem: ServiceStatus;
  auditingService: ServiceStatus;
  overallHealth: ServiceStatus;
}

export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
  UNKNOWN = 'unknown'
}

// API Response Types
export interface SecurityApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedSecurityResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Hooks and Service Interfaces
export interface PaymentSecurityHookReturn {
  isLoading: boolean;
  error: string | null;
  assessRisk: (transactionData: any) => Promise<RiskAssessment>;
  detectFraud: (transactionData: any) => Promise<FraudDetectionResult>;
  reportSecurityEvent: (event: Partial<SecurityEvent>) => Promise<void>;
  getSecurityMetrics: (timeframe: TimeframePeriod) => Promise<SecurityMetrics>;
  getSecurityAlerts: () => Promise<SecurityAlert[]>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}

export interface FraudDetectionService {
  analyzeTransaction(transactionData: any): Promise<FraudDetectionResult>;
  updateModel(trainingData: any[]): Promise<boolean>;
  getModelMetrics(): Promise<any>;
  reportFraudFeedback(transactionId: string, isFraud: boolean): Promise<void>;
}