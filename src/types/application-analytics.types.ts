export interface ApplicationAnalytics {
  id: string;
  applicationId: string;
  userId: string;
  submittedAt: Date;
  status: ApplicationStatus;
  decisionAt?: Date;
  decisionTime?: number;
  source: ApplicationSource;
  projectType: string;
  projectValue?: number;
  skillsRequired: string[];
  successRate?: number;
  userEngagement: UserEngagement;
  behaviorMetrics: BehaviorMetrics;
}

export interface ApplicationPerformanceMetrics {
  totalApplications: number;
  successfulApplications: number;
  pendingApplications: number;
  averageDecisionTime: number;
  successRate: number;
  conversionRate: number;
  averageProjectValue: number;
  topSkills: SkillMetric[];
  timeToDecision: TimeMetric[];
  applicationsBySource: SourceMetric[];
}

export interface UserEngagement {
  profileViews: number;
  messagesSent: number;
  lastActive: Date;
  sessionDuration: number;
  pagesVisited: number;
  documentsUploaded: number;
  portfolioViews: number;
}

export interface BehaviorMetrics {
  submissionTime: Date;
  timeSpentOnApplication: number;
  revisionsCount: number;
  attachmentCount: number;
  customFieldsCompleted: number;
  averageResponseTime: number;
  mobilePlatform: boolean;
}

export interface ApplicationTrends {
  period: string;
  applications: number;
  successRate: number;
  averageValue: number;
  change: number;
  changePercentage: number;
}

export interface UserBehaviorPattern {
  userId: string;
  applicationFrequency: number;
  averageApplicationQuality: number;
  preferredSubmissionTimes: TimePattern[];
  devicePreference: DevicePreference;
  engagementScore: number;
  successPrediction: number;
}

export interface TimePattern {
  hour: number;
  dayOfWeek: number;
  frequency: number;
}

export interface DevicePreference {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface ApplicationReport {
  id: string;
  name: string;
  description: string;
  filters: ApplicationAnalyticsFilter;
  metrics: ApplicationReportMetric[];
  visualizations: VisualizationType[];
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
}

export interface ApplicationReportMetric {
  id: string;
  name: string;
  type: ApplicationMetricType;
  calculation: CalculationType;
  format: DisplayFormat;
  aggregation?: AggregationType;
}

export interface ApplicationAnalyticsFilter {
  dateRange: DateRange;
  status?: ApplicationStatus[];
  source?: ApplicationSource[];
  projectType?: string[];
  skillsRequired?: string[];
  userId?: string[];
  projectValueRange?: ValueRange;
  successRate?: number;
  engagementLevel?: EngagementLevel[];
}

export interface ValueRange {
  min: number;
  max: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  enabled: boolean;
}

export interface ApplicationDashboard {
  id: string;
  name: string;
  widgets: ApplicationWidget[];
  layout: WidgetLayout[];
  isDefault: boolean;
  userId: string;
  lastUpdated: Date;
  refreshInterval: number;
}

export interface ApplicationWidget {
  id: string;
  type: ApplicationWidgetType;
  title: string;
  data: any;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

export interface WidgetConfig {
  refreshInterval?: number;
  filters?: ApplicationAnalyticsFilter;
  displayOptions?: DisplayOptions;
  dataSource?: DataSource;
  realTimeEnabled?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface DisplayOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  colorScheme?: string;
  animation?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showGrid?: boolean;
  theme?: 'light' | 'dark';
}

export interface DataSource {
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  cache?: boolean;
  cacheDuration?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeData: boolean;
  includeMetadata: boolean;
  dateRange?: DateRange;
  filters?: ApplicationAnalyticsFilter;
  compression?: boolean;
}

export interface PredictiveAnalytics {
  applicationSuccessPrediction: SuccessPrediction;
  marketTrends: MarketTrend[];
  skillDemandForecast: SkillForecast[];
  userBehaviorPredictions: UserPrediction[];
  platformOptimization: OptimizationRecommendation[];
}

export interface SuccessPrediction {
  userId: string;
  applicationId: string;
  successProbability: number;
  confidenceLevel: number;
  factors: PredictionFactor[];
  recommendations: string[];
}

export interface MarketTrend {
  skill: string;
  currentDemand: number;
  predictedDemand: number;
  growthRate: number;
  timeframe: string;
  confidence: number;
}

export interface SkillForecast {
  skill: string;
  currentValue: number;
  projectedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  marketSaturation: number;
}

export interface UserPrediction {
  userId: string;
  activityPrediction: number;
  successLikelihood: number;
  churnRisk: number;
  valueScore: number;
}

export interface OptimizationRecommendation {
  area: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  expectedImprovement: number;
  timeframe: string;
}

export interface PredictionFactor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  currentValue: number;
}

export interface ComplianceReport {
  id: string;
  reportType: ComplianceReportType;
  generatedAt: Date;
  period: DateRange;
  data: ComplianceData;
  status: 'draft' | 'final' | 'submitted';
  submittedBy?: string;
  submittedAt?: Date;
}

export interface ComplianceData {
  totalApplications: number;
  processingTimes: ProcessingTimeMetric[];
  fairnessMetrics: FairnessMetric[];
  dataRetention: DataRetentionMetric[];
  userConsent: ConsentMetric[];
  auditTrail: AuditEntry[];
}

export interface ProcessingTimeMetric {
  averageTime: number;
  medianTime: number;
  maxTime: number;
  complianceThreshold: number;
  withinCompliance: number;
  violations: number;
}

export interface FairnessMetric {
  metric: string;
  overallScore: number;
  demographicBreakdown: DemographicMetric[];
  bias?: BiasDetection;
}

export interface DemographicMetric {
  category: string;
  value: number;
  percentage: number;
  expectedRange: ValueRange;
}

export interface BiasDetection {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  affectedGroups: string[];
  recommendations: string[];
}

export interface DataRetentionMetric {
  category: string;
  totalRecords: number;
  retainedRecords: number;
  deletedRecords: number;
  retentionRate: number;
  complianceStatus: 'compliant' | 'non-compliant';
}

export interface ConsentMetric {
  totalUsers: number;
  consentGranted: number;
  consentWithdrawn: number;
  consentRate: number;
  lastUpdated: Date;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface AnalyticsState {
  isLoading: boolean;
  error?: AnalyticsError;
  lastUpdated?: Date;
  cache?: Map<string, CacheEntry>;
  realTimeConnection?: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface SkillMetric {
  skill: string;
  count: number;
  successRate: number;
  averageValue: number;
  demand: number;
}

export interface TimeMetric {
  period: string;
  averageTime: number;
  medianTime: number;
  percentile90: number;
  percentile95: number;
}

export interface SourceMetric {
  source: ApplicationSource;
  count: number;
  successRate: number;
  averageValue: number;
  conversionRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
  trend?: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface SegmentData {
  segment: string;
  value: number;
  percentage: number;
  trend: number;
  metadata?: Record<string, any>;
}

export interface ApplicationAPIResponse<T = any> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    filters?: ApplicationAnalyticsFilter;
    generated?: Date;
  };
  timestamp: Date;
  version?: string;
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export enum ApplicationSource {
  DIRECT = 'direct',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  JOB_BOARD = 'job_board',
  EMAIL_CAMPAIGN = 'email_campaign',
  ORGANIC_SEARCH = 'organic_search',
  PAID_ADVERTISING = 'paid_advertising',
  MOBILE_APP = 'mobile_app',
  API = 'api'
}

export enum ApplicationMetricType {
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  AVERAGE = 'average',
  SUM = 'sum',
  RATIO = 'ratio',
  TREND = 'trend',
  DISTRIBUTION = 'distribution',
  CONVERSION = 'conversion'
}

export enum CalculationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  GROWTH_RATE = 'growth_rate',
  MOVING_AVERAGE = 'moving_average',
  MEDIAN = 'median',
  MODE = 'mode',
  PERCENTILE = 'percentile'
}

export enum DisplayFormat {
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  DURATION = 'duration',
  DATE = 'date',
  TIME = 'time',
  BYTES = 'bytes'
}

export enum AggregationType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  FUNNEL_CHART = 'funnel_chart',
  TREEMAP = 'treemap',
  RADAR_CHART = 'radar_chart'
}

export enum ApplicationWidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  LIST = 'list',
  PROGRESS = 'progress',
  STATUS = 'status',
  TIMELINE = 'timeline',
  MAP = 'map',
  ACTIVITY_FEED = 'activity_feed'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg',
  HTML = 'html'
}

export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum ComplianceReportType {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  SOX = 'sox',
  AUDIT = 'audit',
  FAIRNESS = 'fairness',
  PERFORMANCE = 'performance'
}

export interface MobileAnalytics {
  deviceType: string;
  operatingSystem: string;
  appVersion: string;
  screenSize: string;
  networkType: string;
  batteryLevel?: number;
  location?: GeolocationData;
  crashReports: CrashReport[];
  performanceMetrics: MobilePerformanceMetrics;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface CrashReport {
  id: string;
  timestamp: Date;
  errorMessage: string;
  stackTrace: string;
  deviceInfo: DeviceInfo;
  appState: string;
}

export interface DeviceInfo {
  model: string;
  manufacturer: string;
  operatingSystem: string;
  version: string;
  memoryUsage: number;
  storageUsage: number;
}

export interface MobilePerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryDrain: number;
  networkLatency: number;
}

export interface SecurityAnalytics {
  authenticationAttempts: AuthAttempt[];
  suspiciousActivity: SuspiciousActivity[];
  dataAccess: DataAccess[];
  securityIncidents: SecurityIncident[];
  complianceScore: number;
}

export interface AuthAttempt {
  id: string;
  userId?: string;
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  method: string;
  failureReason?: string;
}

export interface SuspiciousActivity {
  id: string;
  userId: string;
  activity: string;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  resolved: boolean;
}

export interface DataAccess {
  id: string;
  userId: string;
  resource: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  authorized: boolean;
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  affectedUsers: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedAt?: Date;
}