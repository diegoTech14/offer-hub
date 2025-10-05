"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,

  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Calendar,
 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinancialAnalytics } from "@/hooks/use-financial-analytics";
import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  
  getDateRangePresets,
} from "@/utils/financial-helpers";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FinancialDashboardProps } from "@/types/financial-analytics.types";

export default function FinancialDashboard({
  userId,
  viewMode = "desktop",
  compact = false,
  className = "",
}: FinancialDashboardProps) {
  const {
    overview,
   
    performanceIndicators,
    alerts,
    loading,
    error,
    filters,
    updateFilters,
    refreshData,
    exportData,
    acknowledgeAlert,
  } = useFinancialAnalytics();

  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const dateRangePresets = getDateRangePresets();
  const isMobile = viewMode === "mobile";

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    if (dateRangePresets[timeframe as keyof typeof dateRangePresets]) {
      const preset =
        dateRangePresets[timeframe as keyof typeof dateRangePresets];
      updateFilters({
        dateRange: {
          start: preset.start,
          end: preset.end,
          preset: timeframe as any,
        },
      });
    }
  };

  // Handle export
  const handleExport = async (format: "csv" | "json") => {
    try {
      const blob = await exportData({
        format,
        includeCharts: false,
        includeRawData: true,
        dateRange: filters.dateRange,
        sections: ["overview", "revenue", "expenses", "profitability"],
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report-${
        filters.dateRange.start.toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading financial data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive financial insights and analytics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedTimeframe}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateRangePresets).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={refreshData} className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500">
            <RefreshCw className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Refresh</span>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            <Download className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Export</span>}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                alert.severity === "critical" && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                alert.severity === "warning" &&
                  "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
                alert.severity === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
              )}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    alert.severity === "critical" && "text-red-500 dark:text-red-400",
                    alert.severity === "warning" && "text-yellow-500 dark:text-yellow-400",
                    alert.severity === "info" && "text-blue-500 dark:text-blue-400"
                  )}
                />
                <div>
                  <p className="font-medium dark:text-white">{alert.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{alert.description}</p>
                </div>
              </div>
              {!alert.acknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(overview?.totalRevenue || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground dark:text-gray-400">
              {overview?.revenueGrowth && overview.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span>
                {formatPercentage(overview?.revenueGrowth || 0)} from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(overview?.netProfit || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground dark:text-gray-400">
              <span>
                Margin: {formatPercentage(overview?.profitMargin || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCompactNumber(overview?.transactionCount || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground dark:text-gray-400">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>
                {formatPercentage(overview?.successRate || 0)} success rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Avg Transaction
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(overview?.averageTransactionValue || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Per transaction</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      {performanceIndicators.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <Target className="h-5 w-5" />
              <span>Performance Indicators</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Key metrics tracking against targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceIndicators.map((indicator) => (
                <div key={indicator.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{indicator.name}</span>
                      <Badge
                        variant={
                          indicator.status === "good"
                            ? "default"
                            : indicator.status === "warning"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {indicator.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {indicator.value.toFixed(1)}
                        {indicator.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Target: {indicator.target}
                        {indicator.unit}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(
                      (indicator.value / indicator.target) * 100,
                      100
                    )}
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600">
                    {indicator.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-700">
          <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="revenue" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Revenue</TabsTrigger>
          <TabsTrigger value="expenses" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Expenses</TabsTrigger>
          <TabsTrigger value="profitability" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue vs Expenses</CardTitle>
                <CardDescription className="dark:text-gray-300">Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", revenue: 45200, expenses: 15400 },
                        { month: "Feb", revenue: 52100, expenses: 16800 },
                        { month: "Mar", revenue: 58900, expenses: 15900 },
                        { month: "Apr", revenue: 62500, expenses: 17200 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Expenses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Chart */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Cash Flow Trend</CardTitle>
                <CardDescription className="dark:text-gray-300">Monthly cash flow analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: "Jan", cashFlow: 29800 },
                        { month: "Feb", cashFlow: 35300 },
                        { month: "Mar", cashFlow: 43000 },
                        { month: "Apr", cashFlow: 45300 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="cashFlow"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Sources */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue by Source</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Distribution of revenue streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Commission", value: 25420, fill: "#3B82F6" },
                          {
                            name: "Subscriptions",
                            value: 18950,
                            fill: "#10B981",
                          },
                          {
                            name: "Premium Features",
                            value: 8200,
                            fill: "#F59E0B",
                          },
                          { name: "Advertising", value: 5100, fill: "#8B5CF6" },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Growth */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue Growth</CardTitle>
                <CardDescription className="dark:text-gray-300">Month-over-month growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { month: "Jan", growth: 12.3 },
                        { month: "Feb", growth: 15.2 },
                        { month: "Mar", growth: 13.0 },
                        { month: "Apr", growth: 16.1 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="growth" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Expense Categories</CardTitle>
                <CardDescription className="dark:text-gray-300">Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Infrastructure",
                            value: 15420,
                            fill: "#3B82F6",
                          },
                          { name: "Marketing", value: 12800, fill: "#10B981" },
                          { name: "Operations", value: 8900, fill: "#F59E0B" },
                          { name: "Development", value: 6700, fill: "#8B5CF6" },
                          { name: "Legal", value: 3200, fill: "#EF4444" },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Trends */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Expense Trends</CardTitle>
                <CardDescription className="dark:text-gray-300">Monthly expense tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", expenses: 15400 },
                        { month: "Feb", expenses: 16800 },
                        { month: "Mar", expenses: 15900 },
                        { month: "Apr", expenses: 17200 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#EF4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Margins */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Profit Margins</CardTitle>
                <CardDescription className="dark:text-gray-300">Profitability by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { segment: "Enterprise", margin: 80.0 },
                        { segment: "SMB", margin: 74.1 },
                        { segment: "Startups", margin: 66.7 },
                        { segment: "Individual", margin: 45.2 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="margin" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Profitability Trends */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Profitability Trends</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Monthly profit and margin trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", profit: 28500, margin: 18.5 },
                        { month: "Feb", profit: 35300, margin: 21.2 },
                        { month: "Mar", profit: 43000, margin: 24.8 },
                        { month: "Apr", profit: 45300, margin: 26.1 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="profit"
                        fill="#3B82F6"
                        name="Profit ($)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="margin"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Margin (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
