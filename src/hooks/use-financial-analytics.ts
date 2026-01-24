"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { addDays, subDays } from "date-fns";
import type {
  FinancialOverview,
  TransactionPattern,
  RevenueAnalysis,
  ExpenseTracking,
  ProfitabilityMetrics,
  CustomReport,
  PerformanceIndicator,
  ComplianceReport,
  FinancialAlert,
  AnalyticsFilter,
  ExportOptions,
  UseFinancialAnalyticsReturn,
} from "@/types/financial-analytics.types";
import type {
  Transaction,
  RevenueStream,
  Expense,
} from "@/types/financial.types";
import {
  mockTransactions,
  mockRevenueStreams,
  mockExpenses,
  mockFinancialMetrics,
} from "@/__mocks__/mock-financial-data";
import {
  calculateGrowthRate,
  calculateMargin,
  calculateRunway,
  detectTransactionPatterns,
  calculatePerformanceIndicators,
  filterTransactionsByDateRange,
  aggregateTransactionsByCategory,
  aggregateTransactionsByPeriod,
  prepareDataForExport,
  getDateRangePresets,
} from "@/utils/financial-helpers";

// Mock data generators for new analytics features
function generateMockFinancialOverview(
  transactions: Transaction[],
  revenues: RevenueStream[],
  expenses: Expense[]
): FinancialOverview {
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = calculateMargin(totalRevenue, totalExpenses);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    monthlyRecurringRevenue: revenues
      .filter((r) => r.type === "subscription")
      .reduce((sum, r) => sum + r.amount, 0),
    averageTransactionValue:
      transactions.length > 0 ? totalRevenue / transactions.length : 0,
    transactionCount: transactions.length,
    successRate: 98.5, // Mock success rate
    revenueGrowth: 15.2,
    expenseGrowth: 8.7,
    cashFlow: netProfit,
    burnRate: totalExpenses / 12, // Monthly burn rate
    runway: calculateRunway(netProfit * 6, totalExpenses / 12), // Assuming 6 months of cash
  };
}

function generateMockRevenueAnalysis(
  revenues: RevenueStream[]
): RevenueAnalysis {
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

  const revenueBySource = revenues.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRevenue,
    revenueBySource,
    revenueByPeriod: [
      { period: "2024-01", amount: 45200, growth: 15.2 },
      { period: "2024-02", amount: 52100, growth: 15.3 },
      { period: "2024-03", amount: 58900, growth: 13.0 },
    ],
    topPerformers: Object.entries(revenueBySource)
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: (amount / totalRevenue) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    seasonalTrends: [
      { period: "Q1", multiplier: 1.2, confidence: 0.85 },
      { period: "Q2", multiplier: 0.9, confidence: 0.78 },
      { period: "Q3", multiplier: 1.1, confidence: 0.82 },
      { period: "Q4", multiplier: 1.3, confidence: 0.91 },
    ],
    forecasts: [
      {
        period: "2024-04",
        predicted: 62500,
        confidence: 0.87,
        scenario: "optimistic",
      },
      {
        period: "2024-04",
        predicted: 59200,
        confidence: 0.92,
        scenario: "conservative",
      },
      {
        period: "2024-04",
        predicted: 55800,
        confidence: 0.78,
        scenario: "pessimistic",
      },
    ],
  };
}

function generateMockExpenseTracking(expenses: Expense[]): ExpenseTracking {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalExpenses,
    expensesByCategory,
    expensesByPeriod: [
      { period: "2024-01", amount: 15400, change: -2.1 },
      { period: "2024-02", amount: 16800, change: 9.1 },
      { period: "2024-03", amount: 15900, change: -5.4 },
    ],
    costOptimization: [
      {
        category: "infrastructure",
        currentCost: 2450,
        optimizedCost: 2100,
        savings: 350,
        recommendation: "Optimize cloud resource allocation",
      },
      {
        category: "marketing",
        currentCost: 5000,
        optimizedCost: 4200,
        savings: 800,
        recommendation: "Focus on higher ROI channels",
      },
    ],
    budgetComparison: [
      {
        category: "infrastructure",
        budgeted: 2500,
        actual: 2450,
        variance: -50,
      },
      { category: "marketing", budgeted: 4500, actual: 5000, variance: 500 },
      { category: "operations", budgeted: 1600, actual: 1500, variance: -100 },
    ],
  };
}

function generateMockProfitabilityMetrics(): ProfitabilityMetrics {
  return {
    grossProfit: 89500,
    grossMargin: 78.2,
    netProfit: 65200,
    netMargin: 56.9,
    ebitda: 72800,
    ebitdaMargin: 63.5,
    byProjectType: {
      "Web Development": {
        revenue: 45200,
        costs: 12800,
        profit: 32400,
        margin: 71.7,
      },
      "Mobile Development": {
        revenue: 35600,
        costs: 9200,
        profit: 26400,
        margin: 74.2,
      },
      "Design Services": {
        revenue: 28500,
        costs: 7500,
        profit: 21000,
        margin: 73.7,
      },
    },
    byUserSegment: {
      Enterprise: {
        revenue: 125000,
        costs: 25000,
        profit: 100000,
        margin: 80.0,
      },
      SMB: { revenue: 85000, costs: 22000, profit: 63000, margin: 74.1 },
      Startups: { revenue: 45000, costs: 15000, profit: 30000, margin: 66.7 },
    },
    byTimeframe: {
      "Q1 2024": { revenue: 89500, costs: 24300, profit: 65200, margin: 72.9 },
      "Q4 2023": { revenue: 78200, costs: 21800, profit: 56400, margin: 72.1 },
      "Q3 2023": { revenue: 72100, costs: 19500, profit: 52600, margin: 73.0 },
    },
    trends: [
      { period: "Jan 2024", profit: 28500, margin: 18.5, change: 12.3 },
      { period: "Dec 2023", profit: 26200, margin: 17.2, change: 8.7 },
      { period: "Nov 2023", profit: 24800, margin: 16.8, change: 5.2 },
    ],
  };
}

function generateMockCustomReports(): CustomReport[] {
  return [
    {
      id: "report_001",
      name: "Monthly Revenue Analysis",
      description: "Comprehensive monthly revenue breakdown",
      type: "revenue",
      criteria: {
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-01-31"),
        },
        filters: { categories: ["commission", "subscription"] },
        metrics: ["totalRevenue", "growth", "topSources"],
      },
      schedule: {
        frequency: "monthly",
        recipients: ["admin@example.com"],
        format: "pdf",
      },
      createdBy: "user_001",
      isPublic: false,
      generatedAt: new Date(),
    },
    {
      id: "report_002",
      name: "Expense Optimization Report",
      description: "Analysis of cost optimization opportunities",
      type: "expenses",
      criteria: {
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-03-31"),
        },
        filters: { categories: ["infrastructure", "marketing", "operations"] },
        metrics: ["totalExpenses", "categoryBreakdown", "optimization"],
      },
      createdBy: "user_001",
      isPublic: true,
    },
  ];
}

function generateMockAlerts(): FinancialAlert[] {
  return [
    {
      id: "alert_001",
      type: "threshold",
      severity: "warning",
      title: "High Marketing Spend",
      description: "Marketing expenses exceeded budget by 15%",
      metric: "marketing_expenses",
      currentValue: 5750,
      threshold: 5000,
      triggeredAt: new Date(),
      acknowledged: false,
      actions: [
        { label: "Review Campaign", action: "review_campaign" },
        { label: "Adjust Budget", action: "adjust_budget" },
      ],
    },
    {
      id: "alert_002",
      type: "anomaly",
      severity: "critical",
      title: "Unusual Transaction Pattern",
      description: "Detected unusual spike in failed transactions",
      metric: "transaction_failures",
      currentValue: 5.2,
      threshold: 2.0,
      triggeredAt: subDays(new Date(), 1),
      acknowledged: true,
      actions: [
        { label: "Investigate", action: "investigate" },
        { label: "Contact Support", action: "contact_support" },
      ],
    },
  ];
}

export function useFinancialAnalytics(): UseFinancialAnalyticsReturn {
  // State management
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [transactionPatterns, setTransactionPatterns] = useState<
    TransactionPattern[]
  >([]);
  const [revenueAnalysis, setRevenueAnalysis] =
    useState<RevenueAnalysis | null>(null);
  const [expenseTracking, setExpenseTracking] =
    useState<ExpenseTracking | null>(null);
  const [profitability, setProfitability] =
    useState<ProfitabilityMetrics | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [performanceIndicators, setPerformanceIndicators] = useState<
    PerformanceIndicator[]
  >([]);
  const [complianceReports, setComplianceReports] = useState<
    ComplianceReport[]
  >([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
      preset: "30d",
    },
    categories: [],
    userSegments: [],
    projectTypes: [],
    transactionTypes: [],
    status: [],
  });

  // Memoized filtered data
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(
      mockTransactions,
      filters.dateRange.start,
      filters.dateRange.end
    );
  }, [filters.dateRange]);

  const filteredRevenues = useMemo(() => {
    return mockRevenueStreams.filter(
      (revenue) =>
        revenue.date >= filters.dateRange.start &&
        revenue.date <= filters.dateRange.end
    );
  }, [filters.dateRange]);

  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter(
      (expense) =>
        expense.date >= filters.dateRange.start &&
        expense.date <= filters.dateRange.end
    );
  }, [filters.dateRange]);

  // Data fetching and processing
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate analytics data based on filtered data
      const newOverview = generateMockFinancialOverview(
        filteredTransactions,
        filteredRevenues,
        filteredExpenses
      );

      const patterns = detectTransactionPatterns(filteredTransactions);
      const revenue = generateMockRevenueAnalysis(filteredRevenues);
      const expenses = generateMockExpenseTracking(filteredExpenses);
      const profit = generateMockProfitabilityMetrics();
      const reports = generateMockCustomReports();
      const indicators = calculatePerformanceIndicators(newOverview);
      const alertsData = generateMockAlerts();

      setOverview(newOverview);
      setTransactionPatterns(patterns);
      setRevenueAnalysis(revenue);
      setExpenseTracking(expenses);
      setProfitability(profit);
      setCustomReports(reports);
      setPerformanceIndicators(indicators);
      setAlerts(alertsData);
      setComplianceReports([]); // Empty for now
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filteredTransactions, filteredRevenues, filteredExpenses]);

  // Filter updates
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Custom reports management
  const createCustomReport = useCallback(
    async (
      report: Omit<CustomReport, "id" | "generatedAt">
    ): Promise<string> => {
      const newReport: CustomReport = {
        ...report,
        id: `report_${Date.now()}`,
        generatedAt: new Date(),
      };
      setCustomReports((prev) => [...prev, newReport]);
      return newReport.id;
    },
    []
  );

  const updateCustomReport = useCallback(
    async (id: string, updates: Partial<CustomReport>) => {
      setCustomReports((prev) =>
        prev.map((report) =>
          report.id === id ? { ...report, ...updates } : report
        )
      );
    },
    []
  );

  const deleteCustomReport = useCallback(async (id: string) => {
    setCustomReports((prev) => prev.filter((report) => report.id !== id));
  }, []);

  const generateReport = useCallback(async (reportId: string) => {
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCustomReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, generatedAt: new Date() } : report
      )
    );
  }, []);

  // Export functionality
  const exportData = useCallback(
    async (options: ExportOptions): Promise<Blob> => {
      const data = {
        overview,
        transactions: filteredTransactions,
        revenues: filteredRevenues,
        expenses: filteredExpenses,
        profitability,
      };

      let content: string;
      let mimeType: string;

      switch (options.format) {
        case "json":
          content = JSON.stringify(data, null, 2);
          mimeType = "application/json";
          break;
        case "csv":
          content = prepareDataForExport(filteredTransactions, "csv");
          mimeType = "text/csv";
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      return new Blob([content], { type: mimeType });
    },
    [
      overview,
      filteredTransactions,
      filteredRevenues,
      filteredExpenses,
      profitability,
    ]
  );

  // Alert management
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? { ...alert, acknowledged: true, resolvedAt: new Date() }
          : alert
      )
    );
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    overview,
    transactionPatterns,
    revenueAnalysis,
    expenseTracking,
    profitability,
    customReports,
    performanceIndicators,
    complianceReports,
    alerts,

    // State
    loading,
    error,
    filters,

    // Actions
    updateFilters,
    refreshData,
    createCustomReport,
    updateCustomReport,
    deleteCustomReport,
    generateReport,
    exportData,
    acknowledgeAlert,
    resolveAlert,
  };
}
