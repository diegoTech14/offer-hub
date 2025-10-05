"use client";

import React, { useState, useMemo } from "react";
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
  Target,
  Lightbulb,
  Calendar,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinancialAnalytics } from "@/hooks/use-financial-analytics";
import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  getStatusColor,
  getTrendColor,
} from "@/utils/financial-helpers";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import type { RevenueAnalysisProps } from "@/types/financial-analytics.types";

export default function RevenueAnalysis({
  timeframe = "30d",
  showOptimization = true,
  showForecasts = true,
  className = "",
}: RevenueAnalysisProps) {
  const {
    overview,
    revenueAnalysis,
    loading,
    error,
    refreshData,
    exportData,
    filters,
  } = useFinancialAnalytics();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [forecastScenario, setForecastScenario] = useState("conservative");

  // Mock revenue data for detailed analysis
  const mockRevenueData = useMemo(
    () => [
      {
        month: "Sep",
        commission: 22400,
        subscription: 16800,
        premium: 7200,
        advertising: 4800,
      },
      {
        month: "Oct",
        commission: 24100,
        subscription: 18200,
        premium: 7900,
        advertising: 5200,
      },
      {
        month: "Nov",
        commission: 25800,
        subscription: 19100,
        premium: 8400,
        advertising: 5500,
      },
      {
        month: "Dec",
        commission: 27200,
        subscription: 20500,
        premium: 8900,
        advertising: 5800,
      },
      {
        month: "Jan",
        commission: 28900,
        subscription: 21800,
        premium: 9200,
        advertising: 6100,
      },
    ],
    []
  );

  // Mock revenue by source
  const mockRevenueBySource = useMemo(
    () => [
      {
        name: "Platform Commission",
        value: 125420,
        growth: 15.2,
        color: "#3B82F6",
      },
      {
        name: "Premium Subscriptions",
        value: 89500,
        growth: 12.8,
        color: "#10B981",
      },
      {
        name: "Featured Listings",
        value: 42800,
        growth: 8.4,
        color: "#F59E0B",
      },
      {
        name: "Sponsored Content",
        value: 28100,
        growth: 22.1,
        color: "#8B5CF6",
      },
      { name: "API Access", value: 18400, growth: -3.2, color: "#EF4444" },
    ],
    []
  );

  // Mock seasonal trends
  const mockSeasonalTrends = useMemo(
    () => [
      { period: "Q1", multiplier: 1.2, revenue: 156000, confidence: 0.85 },
      { period: "Q2", multiplier: 0.9, revenue: 117000, confidence: 0.78 },
      { period: "Q3", multiplier: 1.1, revenue: 143000, confidence: 0.82 },
      { period: "Q4", multiplier: 1.3, revenue: 169000, confidence: 0.91 },
    ],
    []
  );

  // Mock optimization opportunities
  const mockOptimizations = useMemo(
    () => [
      {
        category: "Premium Subscriptions",
        currentRevenue: 89500,
        potentialRevenue: 112000,
        uplift: 25.1,
        effort: "Medium",
        recommendation:
          "Introduce annual subscription discounts to increase conversion",
        impact: "High",
      },
      {
        category: "Featured Listings",
        currentRevenue: 42800,
        potentialRevenue: 51400,
        uplift: 20.1,
        effort: "Low",
        recommendation:
          "Optimize pricing strategy and add premium placement options",
        impact: "Medium",
      },
      {
        category: "API Access",
        currentRevenue: 18400,
        potentialRevenue: 26200,
        uplift: 42.4,
        effort: "High",
        recommendation:
          "Develop enterprise API packages with advanced features",
        impact: "High",
      },
    ],
    []
  );

  // Mock forecasts
  const mockForecasts = useMemo(
    () => [
      {
        period: "Feb 2024",
        conservative: 295000,
        optimistic: 325000,
        pessimistic: 265000,
        confidence: 0.87,
      },
      {
        period: "Mar 2024",
        conservative: 312000,
        optimistic: 348000,
        pessimistic: 278000,
        confidence: 0.82,
      },
      {
        period: "Apr 2024",
        conservative: 328000,
        optimistic: 372000,
        pessimistic: 289000,
        confidence: 0.78,
      },
    ],
    []
  );

  // Mock top performers
  const mockTopPerformers = useMemo(
    () => [
      { name: "Web Development", revenue: 45200, growth: 18.5, margin: 72.3 },
      { name: "Mobile Apps", revenue: 38900, growth: 22.1, margin: 68.7 },
      { name: "Design Services", revenue: 32100, growth: 15.8, margin: 75.2 },
      { name: "Digital Marketing", revenue: 28700, growth: 12.4, margin: 65.8 },
      { name: "Data Analytics", revenue: 24500, growth: 28.9, margin: 78.1 },
    ],
    []
  );

  const handleExport = async () => {
    try {
      const blob = await exportData({
        format: "csv",
        includeCharts: false,
        includeRawData: true,
        dateRange: filters.dateRange,
        sections: ["revenue"],
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-analysis-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (growth < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading revenue analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analysis</h2>
          <p className="text-gray-600">
            Comprehensive revenue insights and growth opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500">
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500">
            <Download className="h-4 w-4" />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
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
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>
                {formatPercentage(overview?.revenueGrowth || 0)} growth
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Monthly Recurring
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(overview?.monthlyRecurringRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Predictable revenue stream
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Avg Transaction
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(overview?.averageTransactionValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Per transaction value
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Revenue per User
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{formatCurrency(485.5)}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Average per active user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-700">
          <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="sources" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Sources</TabsTrigger>
          <TabsTrigger value="forecasts" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Forecasts</TabsTrigger>
          <TabsTrigger value="optimization" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                <CardDescription className="dark:text-gray-300">Monthly revenue growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                      <Bar
                        dataKey="commission"
                        stackId="a"
                        fill="#3B82F6"
                        name="Commission"
                      />
                      <Bar
                        dataKey="subscription"
                        stackId="a"
                        fill="#10B981"
                        name="Subscriptions"
                      />
                      <Bar
                        dataKey="premium"
                        stackId="a"
                        fill="#F59E0B"
                        name="Premium"
                      />
                      <Bar
                        dataKey="advertising"
                        stackId="a"
                        fill="#8B5CF6"
                        name="Advertising"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Trends */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Seasonal Patterns</CardTitle>
                <CardDescription className="dark:text-gray-300">Quarterly revenue patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockSeasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Top Performing Categories</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Highest revenue generating services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTopPerformers.map((performer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-gray-600 rounded-full text-sm font-bold text-blue-600 dark:text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatPercentage(performer.margin)} margin
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(performer.revenue)}
                        </p>
                        <div className="flex items-center space-x-1 text-sm">
                          {getTrendIcon(performer.growth)}
                          <span
                            className={cn(
                              performer.growth > 0
                                ? "text-green-600"
                                : performer.growth < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            )}
                          >
                            {formatPercentage(Math.abs(performer.growth))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue Distribution</CardTitle>
                <CardDescription className="dark:text-gray-300">Current revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockRevenueBySource}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {mockRevenueBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of all revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRevenueBySource.map((source, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <h4 className="font-semibold">{source.name}</h4>
                      </div>
                      <Badge
                        variant={source.growth > 0 ? "default" : "destructive"}
                      >
                        {source.growth > 0 ? "+" : ""}
                        {formatPercentage(source.growth)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Revenue</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(source.value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Growth Rate</p>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(source.growth)}
                          <span
                            className={cn(
                              "font-medium",
                              source.growth > 0
                                ? "text-green-600"
                                : source.growth < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            )}
                          >
                            {formatPercentage(Math.abs(source.growth))}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Market Share</p>
                        <p className="font-medium">
                          {formatPercentage(
                            (source.value /
                              mockRevenueBySource.reduce(
                                (sum, s) => sum + s.value,
                                0
                              )) *
                              100
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Trend</p>
                        <div className="flex items-center space-x-1">
                          {source.growth > 10 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : source.growth < -5 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm">
                            {source.growth > 10
                              ? "Strong"
                              : source.growth < -5
                              ? "Declining"
                              : "Stable"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          {showForecasts && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Revenue Forecasts</span>
                    <Select
                      value={forecastScenario}
                      onValueChange={setForecastScenario}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">
                          Conservative
                        </SelectItem>
                        <SelectItem value="optimistic">Optimistic</SelectItem>
                        <SelectItem value="pessimistic">Pessimistic</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                  <CardDescription>
                    AI-powered revenue predictions based on historical data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockForecasts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="conservative"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          name="Conservative"
                          strokeDasharray={
                            forecastScenario === "conservative" ? "0" : "5 5"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="optimistic"
                          stroke="#10B981"
                          strokeWidth={2}
                          name="Optimistic"
                          strokeDasharray={
                            forecastScenario === "optimistic" ? "0" : "5 5"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="pessimistic"
                          stroke="#EF4444"
                          strokeWidth={2}
                          name="Pessimistic"
                          strokeDasharray={
                            forecastScenario === "pessimistic" ? "0" : "5 5"
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockForecasts.map((forecast, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">
                          {forecast.period}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Conservative:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(forecast.conservative)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Optimistic:
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(forecast.optimistic)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Pessimistic:
                            </span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(forecast.pessimistic)}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Confidence:
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 dark:bg-gray-500 h-2 rounded-full"
                                    style={{
                                      width: `${forecast.confidence * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {formatPercentage(forecast.confidence * 100)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {showOptimization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Revenue Optimization Opportunities</span>
                </CardTitle>
                <CardDescription>
                  AI-identified opportunities to increase revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOptimizations.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {opportunity.category}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {opportunity.recommendation}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              opportunity.impact === "High"
                                ? "default"
                                : opportunity.impact === "Medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {opportunity.impact} Impact
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Current Revenue
                          </p>
                          <p className="font-bold">
                            {formatCurrency(opportunity.currentRevenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Potential Revenue
                          </p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(opportunity.potentialRevenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Revenue Uplift
                          </p>
                          <div className="flex items-center space-x-1">
                            <ArrowUp className="h-3 w-3 text-green-500" />
                            <span className="font-bold text-green-600">
                              {formatPercentage(opportunity.uplift)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Implementation
                          </p>
                          <Badge
                            variant={
                              opportunity.effort === "Low"
                                ? "default"
                                : opportunity.effort === "Medium"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {opportunity.effort} Effort
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Potential additional revenue:
                          <span className="font-bold text-green-600 ml-1">
                            {formatCurrency(
                              opportunity.potentialRevenue -
                                opportunity.currentRevenue
                            )}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500">
                          <Zap className="h-4 w-4 mr-1" />
                          Implement
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-600">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-blue-600 dark:text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-white">
                        Total Optimization Potential
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-gray-300 mb-2">
                        Implementing all recommendations could increase revenue
                        by{" "}
                        <span className="font-bold">
                          {formatCurrency(
                            mockOptimizations.reduce(
                              (sum, opt) =>
                                sum +
                                (opt.potentialRevenue - opt.currentRevenue),
                              0
                            )
                          )}
                        </span>{" "}
                        annually (
                        {formatPercentage(
                          (mockOptimizations.reduce(
                            (sum, opt) =>
                              sum + (opt.potentialRevenue - opt.currentRevenue),
                            0
                          ) /
                            mockOptimizations.reduce(
                              (sum, opt) => sum + opt.currentRevenue,
                              0
                            )) *
                            100
                        )}{" "}
                        increase).
                      </p>
                      <Button size="sm">View Implementation Roadmap</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
