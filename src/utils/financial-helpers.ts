// Financial Analytics Utility Functions
// Helper functions for financial calculations, formatting, and data processing

import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import type {
  FinancialOverview,
  TransactionPattern,
  PerformanceIndicator,
  AnalyticsFilter,
} from "@/types/financial-analytics.types";
import type {
  Transaction,
  RevenueStream,
  Expense,
} from "@/types/financial.types";

// Formatting utilities
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

// Date utilities
export function getDateRangePresets() {
  const now = new Date();
  return {
    "7d": {
      start: subDays(now, 7),
      end: now,
      label: "Last 7 days",
    },
    "30d": {
      start: subDays(now, 30),
      end: now,
      label: "Last 30 days",
    },
    "90d": {
      start: subDays(now, 90),
      end: now,
      label: "Last 90 days",
    },
    "1y": {
      start: subDays(now, 365),
      end: now,
      label: "Last year",
    },
    ytd: {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
      label: "Year to date",
    },
  };
}

export function getMonthlyPeriods(
  startDate: Date,
  endDate: Date
): Array<{ start: Date; end: Date; label: string }> {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  return months.map((month) => ({
    start: startOfMonth(month),
    end: endOfMonth(month),
    label: format(month, "MMM yyyy"),
  }));
}

// Financial calculations
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateMargin(revenue: number, costs: number): number {
  if (revenue === 0) return 0;
  return ((revenue - costs) / revenue) * 100;
}

export function calculateRunway(cashBalance: number, burnRate: number): number {
  if (burnRate <= 0) return Infinity;
  return cashBalance / burnRate;
}

export function calculateMovingAverage(
  values: number[],
  period: number
): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(values[i]);
    } else {
      const sum = values
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Data filtering and aggregation
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.date >= startDate && transaction.date <= endDate
  );
}

export function aggregateTransactionsByCategory(
  transactions: Transaction[]
): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function aggregateTransactionsByPeriod(
  transactions: Transaction[],
  periodType: "daily" | "weekly" | "monthly" = "monthly"
): Array<{ period: string; amount: number; count: number }> {
  const groups = transactions.reduce((acc, transaction) => {
    let key: string;
    switch (periodType) {
      case "daily":
        key = format(transaction.date, "yyyy-MM-dd");
        break;
      case "weekly":
        key = format(transaction.date, "yyyy-'W'ww");
        break;
      case "monthly":
      default:
        key = format(transaction.date, "yyyy-MM");
        break;
    }

    if (!acc[key]) {
      acc[key] = { amount: 0, count: 0 };
    }
    acc[key].amount += transaction.amount;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  return Object.entries(groups).map(([period, data]) => ({
    period,
    amount: (data as { amount: number; count: number }).amount,
    count: (data as { amount: number; count: number }).count,
  }));
}

// Pattern detection
export function detectTransactionPatterns(
  transactions: Transaction[]
): TransactionPattern[] {
  const patterns: TransactionPattern[] = [];

  // Group by description similarity
  const descriptionGroups = transactions.reduce((acc, transaction) => {
    // Simple pattern matching - in real implementation, use more sophisticated algorithms
    const key = transaction.description.toLowerCase().replace(/\d+/g, "X");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Analyze each group for patterns
  Object.entries(descriptionGroups).forEach(([pattern, groupTransactions]) => {
    const transactions = groupTransactions as Transaction[];
    if (transactions.length >= 3) {
      // Minimum occurrences for a pattern
      const amounts = transactions.map((t: Transaction) => t.amount);
      const avgAmount =
        amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
      const lastTransaction = transactions.sort(
        (a: Transaction, b: Transaction) => b.date.getTime() - a.date.getTime()
      )[0];

      // Calculate frequency (days between transactions)
      const sortedTransactions = transactions.sort(
        (a: Transaction, b: Transaction) => a.date.getTime() - b.date.getTime()
      );
      const intervals = [];
      for (let i = 1; i < sortedTransactions.length; i++) {
        const days =
          (sortedTransactions[i].date.getTime() -
            sortedTransactions[i - 1].date.getTime()) /
          (1000 * 60 * 60 * 24);
        intervals.push(days);
      }
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;

      patterns.push({
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        frequency: avgInterval,
        averageAmount: avgAmount,
        trend: "stable", // Simplified - in real implementation, calculate trend
        confidence: Math.min(transactions.length / 10, 1), // Simple confidence calculation
        lastOccurrence: lastTransaction.date,
        predictedNext: new Date(
          lastTransaction.date.getTime() + avgInterval * 24 * 60 * 60 * 1000
        ),
      });
    }
  });

  return patterns;
}

// Performance indicators
export function calculatePerformanceIndicators(
  overview: FinancialOverview,
  previousOverview?: FinancialOverview
): PerformanceIndicator[] {
  const indicators: PerformanceIndicator[] = [];

  // Revenue growth
  indicators.push({
    id: "revenue_growth",
    name: "Revenue Growth",
    value: overview.revenueGrowth,
    target: 15, // 15% target growth
    unit: "%",
    trend:
      overview.revenueGrowth > 0
        ? "up"
        : overview.revenueGrowth < 0
        ? "down"
        : "stable",
    change: previousOverview
      ? overview.revenueGrowth - (previousOverview.revenueGrowth || 0)
      : 0,
    changePercent: previousOverview
      ? calculateGrowthRate(
          overview.revenueGrowth,
          previousOverview.revenueGrowth || 1
        )
      : 0,
    status:
      overview.revenueGrowth >= 15
        ? "good"
        : overview.revenueGrowth >= 5
        ? "warning"
        : "critical",
    description: "Month-over-month revenue growth rate",
  });

  // Profit margin
  indicators.push({
    id: "profit_margin",
    name: "Profit Margin",
    value: overview.profitMargin,
    target: 20, // 20% target margin
    unit: "%",
    trend: overview.profitMargin > 0 ? "up" : "down",
    change: previousOverview
      ? overview.profitMargin - (previousOverview.profitMargin || 0)
      : 0,
    changePercent: previousOverview
      ? calculateGrowthRate(
          overview.profitMargin,
          previousOverview.profitMargin || 1
        )
      : 0,
    status:
      overview.profitMargin >= 20
        ? "good"
        : overview.profitMargin >= 10
        ? "warning"
        : "critical",
    description: "Net profit as percentage of total revenue",
  });

  // Transaction success rate
  indicators.push({
    id: "success_rate",
    name: "Transaction Success Rate",
    value: overview.successRate,
    target: 95, // 95% target success rate
    unit: "%",
    trend:
      overview.successRate >= 95
        ? "up"
        : overview.successRate >= 90
        ? "stable"
        : "down",
    change: previousOverview
      ? overview.successRate - (previousOverview.successRate || 0)
      : 0,
    changePercent: previousOverview
      ? calculateGrowthRate(
          overview.successRate,
          previousOverview.successRate || 1
        )
      : 0,
    status:
      overview.successRate >= 95
        ? "good"
        : overview.successRate >= 90
        ? "warning"
        : "critical",
    description: "Percentage of successful transactions",
  });

  // Cash runway
  if (overview.runway !== Infinity) {
    indicators.push({
      id: "cash_runway",
      name: "Cash Runway",
      value: overview.runway,
      target: 12, // 12 months target runway
      unit: "months",
      trend:
        overview.runway >= 12 ? "up" : overview.runway >= 6 ? "stable" : "down",
      change: previousOverview
        ? overview.runway - (previousOverview.runway || 0)
        : 0,
      changePercent: previousOverview
        ? calculateGrowthRate(overview.runway, previousOverview.runway || 1)
        : 0,
      status:
        overview.runway >= 12
          ? "good"
          : overview.runway >= 6
          ? "warning"
          : "critical",
      description: "Months of operation at current burn rate",
    });
  }

  return indicators;
}

// Export utilities
export function prepareDataForExport(
  data: any[],
  format: "csv" | "json"
): string {
  if (format === "json") {
    return JSON.stringify(data, null, 2);
  }

  if (format === "csv" && data.length > 0) {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" ? `"${value}"` : value))
        .join(",")
    );
    return [headers, ...rows].join("\n");
  }

  return "";
}

// Color utilities for charts
export function getStatusColor(
  status: "good" | "warning" | "critical"
): string {
  switch (status) {
    case "good":
      return "#10B981";
    case "warning":
      return "#F59E0B";
    case "critical":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

export function getTrendColor(trend: "up" | "down" | "stable"): string {
  switch (trend) {
    case "up":
      return "#10B981";
    case "down":
      return "#EF4444";
    case "stable":
      return "#6B7280";
    default:
      return "#6B7280";
  }
}

// Validation utilities
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate && startDate <= new Date();
}

export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount);
}

export function sanitizeReportName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
}
