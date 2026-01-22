export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: {
    api: number;
    database: number;
    cache: number;
  };
  throughput: {
    requestsPerSecond: number;
    transactionsPerSecond: number;
  };
  errorRates: {
    total: number;
    http4xx: number;
    http5xx: number;
    database: number;
  };
  uptime: {
    percentage: number;
    lastDowntime?: Date;
    downtimeDuration?: number;
  };
}

export interface UserBehaviorMetrics {
  timestamp: Date;
  activeUsers: {
    total: number;
    online: number;
    new: number;
    returning: number;
  };
  pageViews: {
    total: number;
    unique: number;
    bounceRate: number;
    averageSessionDuration: number;
  };
  userEngagement: {
    clickThroughRate: number;
    conversionRate: number;
    retentionRate: number;
  };
  geographicData: {
    country: string;
    users: number;
    sessions: number;
  }[];
}

export interface BusinessMetrics {
  timestamp: Date;
  revenue: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    growth: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    averageValue: number;
  };
  users: {
    total: number;
    active: number;
    newRegistrations: number;
    churnRate: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    averageValue: number;
  };
}

export interface RealTimeAlert {
  id: string;
  type: 'performance' | 'security' | 'system' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilters;
  refreshInterval: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
  permissions: DashboardPermission[];
}

export interface DashboardWidget {
  id: string;
  type: 'metric-card' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart' | 'table' | 'alert-list';
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  dataSource: DataSource;
  refreshInterval?: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar';
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  timeRange?: TimeRange;
  groupBy?: string[];
  filters?: Record<string, any>;
  thresholds?: {
    warning: number;
    critical: number;
  };
  displayOptions?: {
    showLegend: boolean;
    showGrid: boolean;
    animation: boolean;
    colors?: string[];
  };
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
}

export interface DashboardFilters {
  timeRange: TimeRange;
  userSegment?: string[];
  location?: string[];
  custom?: Record<string, any>;
}

export interface DashboardPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
}

export interface DataSource {
  type: 'system' | 'business' | 'user' | 'custom';
  endpoint?: string;
  query?: string;
  parameters?: Record<string, any>;
}

export interface TimeRange {
  start: Date;
  end: Date;
  interval: '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d';
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'system' | 'user' | 'business' | 'custom';
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  schedule?: ReportSchedule;
  parameters: ReportParameters;
  recipients: string[];
  lastGenerated?: Date;
  nextGeneration?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
}

export interface ReportParameters {
  timeRange: TimeRange;
  metrics: string[];
  groupBy?: string[];
  filters?: Record<string, any>;
  includeTrends: boolean;
  includeComparisons: boolean;
}

export interface WebSocketMessage {
  type: 'system_metrics' | 'user_metrics' | 'business_metrics' | 'alert' | 'notification';
  data: any;
  timestamp: Date;
}

export interface MonitoringState {
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
}

export interface UserAnalyticsData {
  timestamp: Date;
  sessionData: {
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  userFlow: {
    entryPages: PageMetric[];
    exitPages: PageMetric[];
    conversionFunnel: FunnelStep[];
  };
  demographics: {
    ageGroups: DemographicSegment[];
    locations: LocationMetric[];
    devices: DeviceMetric[];
  };
  engagement: {
    dailyActiveUsers: TimeSeriesData[];
    monthlyActiveUsers: TimeSeriesData[];
    userRetention: RetentionCohort[];
  };
}

export interface PageMetric {
  page: string;
  views: number;
  uniqueViews: number;
  averageTime: number;
  bounceRate: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface DemographicSegment {
  segment: string;
  count: number;
  percentage: number;
}

export interface LocationMetric {
  country: string;
  city?: string;
  users: number;
  sessions: number;
  revenue?: number;
}

export interface DeviceMetric {
  device: string;
  os: string;
  browser: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface RetentionCohort {
  cohort: string;
  period: number;
  users: number;
  retentionRate: number;
}

export interface HeatmapData {
  x: number;
  y: number;
  value: number;
  element?: string;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  category: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}