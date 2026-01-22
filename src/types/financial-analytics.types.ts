// Financial Analytics System Types
// Comprehensive type definitions for advanced financial analytics and reporting

export interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRecurringRevenue: number;
  averageTransactionValue: number;
  transactionCount: number;
  successRate: number;
  revenueGrowth: number;
  expenseGrowth: number;
  cashFlow: number;
  burnRate: number;
  runway: number;
}

export interface TransactionPattern {
  id: string;
  pattern: string;
  frequency: number;
  averageAmount: number;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
  lastOccurrence: Date;
  predictedNext?: Date;
}

export interface RevenueAnalysis {
  totalRevenue: number;
  revenueBySource: Record<string, number>;
  revenueByPeriod: Array<{
    period: string;
    amount: number;
    growth: number;
  }>;
  topPerformers: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    multiplier: number;
    confidence: number;
  }>;
  forecasts: Array<{
    period: string;
    predicted: number;
    confidence: number;
    scenario: "conservative" | "optimistic" | "pessimistic";
  }>;
}

export interface ExpenseTracking {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByPeriod: Array<{
    period: string;
    amount: number;
    change: number;
  }>;
  costOptimization: Array<{
    category: string;
    currentCost: number;
    optimizedCost: number;
    savings: number;
    recommendation: string;
  }>;
  budgetComparison: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  ebitda: number;
  ebitdaMargin: number;
  byProjectType: Record<
    string,
    {
      revenue: number;
      costs: number;
      profit: number;
      margin: number;
    }
  >;
  byUserSegment: Record<
    string,
    {
      revenue: number;
      costs: number;
      profit: number;
      margin: number;
    }
  >;
  byTimeframe: Record<
    string,
    {
      revenue: number;
      costs: number;
      profit: number;
      margin: number;
    }
  >;
  trends: Array<{
    period: string;
    profit: number;
    margin: number;
    change: number;
  }>;
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  type: "revenue" | "expenses" | "profitability" | "transactions" | "custom";
  criteria: {
    dateRange: {
      start: Date;
      end: Date;
    };
    filters: Record<string, any>;
    groupBy?: string[];
    metrics: string[];
  };
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    recipients: string[];
    format: "pdf" | "excel" | "csv";
  };
  data?: any;
  generatedAt?: Date;
  createdBy: string;
  isPublic: boolean;
}

export interface FinancialVisualization {
  type: "line" | "bar" | "pie" | "area" | "scatter" | "heatmap";
  data: Array<Record<string, any>>;
  config: {
    xAxis?: string;
    yAxis?: string[];
    colors?: string[];
    title?: string;
    subtitle?: string;
  };
  responsive: boolean;
  exportable: boolean;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
    preset?: "7d" | "30d" | "90d" | "1y" | "ytd" | "custom";
  };
  categories?: string[];
  userSegments?: string[];
  projectTypes?: string[];
  transactionTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
  status?: string[];
}

export interface PerformanceIndicator {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  changePercent: number;
  status: "good" | "warning" | "critical";
  description: string;
}

export interface ComplianceReport {
  id: string;
  type: "tax" | "audit" | "regulatory" | "internal";
  period: {
    start: Date;
    end: Date;
  };
  status: "draft" | "pending" | "approved" | "submitted";
  data: {
    totalRevenue: number;
    totalExpenses: number;
    taxableIncome: number;
    deductions: number;
    taxLiability: number;
  };
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  generatedAt: Date;
  approvedBy?: string;
  submittedAt?: Date;
}

export interface FinancialAlert {
  id: string;
  type: "threshold" | "anomaly" | "trend" | "compliance";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold?: number;
  triggeredAt: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  actions: Array<{
    label: string;
    action: string;
  }>;
}

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: string[];
  template?: string;
}

// Hook return types
export interface UseFinancialAnalyticsReturn {
  // Data
  overview: FinancialOverview | null;
  transactionPatterns: TransactionPattern[];
  revenueAnalysis: RevenueAnalysis | null;
  expenseTracking: ExpenseTracking | null;
  profitability: ProfitabilityMetrics | null;
  customReports: CustomReport[];
  performanceIndicators: PerformanceIndicator[];
  complianceReports: ComplianceReport[];
  alerts: FinancialAlert[];

  // State
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilter;

  // Actions
  updateFilters: (filters: Partial<AnalyticsFilter>) => void;
  refreshData: () => Promise<void>;
  createCustomReport: (
    report: Omit<CustomReport, "id" | "generatedAt">
  ) => Promise<string>;
  updateCustomReport: (
    id: string,
    updates: Partial<CustomReport>
  ) => Promise<void>;
  deleteCustomReport: (id: string) => Promise<void>;
  generateReport: (reportId: string) => Promise<void>;
  exportData: (options: ExportOptions) => Promise<Blob>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
}

// Component prop types
export interface FinancialDashboardProps {
  userId?: string;
  viewMode?: "desktop" | "mobile" | "tablet";
  compact?: boolean;
  className?: string;
}

export interface TransactionAnalyticsProps {
  filters?: Partial<AnalyticsFilter>;
  showPatterns?: boolean;
  showForecasts?: boolean;
  className?: string;
}

export interface RevenueAnalysisProps {
  timeframe?: string;
  showOptimization?: boolean;
  showForecasts?: boolean;
  className?: string;
}

export interface CustomReportsProps {
  onReportCreate?: (report: CustomReport) => void;
  onReportUpdate?: (report: CustomReport) => void;
  onReportDelete?: (reportId: string) => void;
  className?: string;
}
