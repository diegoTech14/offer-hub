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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinancialAnalytics } from "@/hooks/use-financial-analytics";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
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
  ScatterChart,
  Scatter,
} from "recharts";
import type { TransactionAnalyticsProps } from "@/types/financial-analytics.types";

export default function TransactionAnalytics({
  filters: propFilters,
  showPatterns = true,
  showForecasts = true,
  className = "",
}: TransactionAnalyticsProps) {
  const {
    overview,
    transactionPatterns,
    loading,
    error,
    filters,
    updateFilters,
    refreshData,
    exportData,
  } = useFinancialAnalytics();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock transaction data for detailed analytics
  const mockTransactionData = useMemo(
    () => [
      {
        id: "txn_001",
        date: "2024-01-15",
        type: "revenue",
        amount: 1250.0,
        status: "completed",
        category: "commission",
        description: "Project completion fee",
        processingTime: 2.3,
        fees: 36.25,
      },
      {
        id: "txn_002",
        date: "2024-01-14",
        type: "expense",
        amount: 299.99,
        status: "completed",
        category: "infrastructure",
        description: "AWS Infrastructure",
        processingTime: 1.8,
        fees: 8.7,
      },
      {
        id: "txn_003",
        date: "2024-01-13",
        type: "revenue",
        amount: 89.99,
        status: "completed",
        category: "subscription",
        description: "Premium subscription",
        processingTime: 1.2,
        fees: 2.61,
      },
      {
        id: "txn_004",
        date: "2024-01-12",
        type: "revenue",
        amount: 450.0,
        status: "failed",
        category: "premium_features",
        description: "Featured listing fee",
        processingTime: 5.2,
        fees: 0,
      },
      {
        id: "txn_005",
        date: "2024-01-11",
        type: "expense",
        amount: 150.0,
        status: "completed",
        category: "marketing",
        description: "Marketing campaign",
        processingTime: 2.1,
        fees: 4.35,
      },
    ],
    []
  );

  // Mock success rate data over time
  const mockSuccessRateData = useMemo(
    () => [
      { month: "Sep", rate: 97.2, volume: 1180 },
      { month: "Oct", rate: 98.1, volume: 1245 },
      { month: "Nov", rate: 96.8, volume: 1320 },
      { month: "Dec", rate: 98.5, volume: 1410 },
      { month: "Jan", rate: 98.3, volume: 1247 },
    ],
    []
  );

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return mockTransactionData.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || transaction.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || transaction.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [mockTransactionData, searchTerm, selectedCategory, selectedStatus]);

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const successfulTransactions = filteredTransactions.filter(
      (t) => t.status === "completed"
    ).length;
    const failedTransactions = filteredTransactions.filter(
      (t) => t.status === "failed"
    ).length;
    const totalVolume = filteredTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalFees = filteredTransactions.reduce((sum, t) => sum + t.fees, 0);
    const avgProcessingTime =
      filteredTransactions.reduce((sum, t) => sum + t.processingTime, 0) /
      totalTransactions;

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      successRate:
        totalTransactions > 0
          ? (successfulTransactions / totalTransactions) * 100
          : 0,
      totalVolume,
      totalFees,
      avgProcessingTime: avgProcessingTime || 0,
      avgTransactionValue:
        totalTransactions > 0 ? totalVolume / totalTransactions : 0,
    };
  }, [filteredTransactions]);

  const handleExport = async () => {
    try {
      const blob = await exportData({
        format: "csv",
        includeCharts: false,
        includeRawData: true,
        dateRange: filters.dateRange,
        sections: ["transactions"],
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transaction-analytics-${
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

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading transaction analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transaction Analytics</h2>
          <p className="text-gray-600">
            Detailed analysis of transaction patterns and performance
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Total Transactions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatNumber(analytics.totalTransactions)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {formatCurrency(analytics.totalVolume)} total volume
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatPercentage(analytics.successRate)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {analytics.successfulTransactions} successful,{" "}
              {analytics.failedTransactions} failed
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Avg Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {analytics.avgProcessingTime.toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Average transaction processing
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Processing Fees
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(analytics.totalFees)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {formatPercentage(
                (analytics.totalFees / analytics.totalVolume) * 100
              )}{" "}
              of volume
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
          <TabsTrigger value="patterns" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Patterns</TabsTrigger>
          <TabsTrigger value="performance" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Performance</TabsTrigger>
          <TabsTrigger value="details" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate Trend */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Success Rate Trend</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Transaction success rate over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSuccessRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[95, 100]} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "rate" ? `${value}%` : value,
                          name === "rate" ? "Success Rate" : "Volume",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Success Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Volume by Category */}
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Volume by Category</CardTitle>
                <CardDescription className="dark:text-gray-300">Transaction distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: "Commission", value: 45, fill: "#3B82F6" },
                          { name: "Subscriptions", value: 25, fill: "#10B981" },
                          {
                            name: "Infrastructure",
                            value: 15,
                            fill: "#F59E0B",
                          },
                          { name: "Marketing", value: 10, fill: "#8B5CF6" },
                          { name: "Other", value: 5, fill: "#EF4444" },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      />
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {showPatterns && (
            <Card className="dark:bg-gray-800 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Target className="h-5 w-5" />
                  <span>Transaction Patterns</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  AI-detected patterns in transaction behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Pattern analysis will be displayed here</p>
                  <p className="text-sm">
                    Based on transaction history and AI detection
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="dark:text-white">Performance Metrics</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Transaction processing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance analytics will be displayed here</p>
                <p className="text-sm">
                  Processing times, failure analysis, and optimization insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Filters */}
          <Card className="dark:bg-gray-800 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="dark:text-white">Transaction Details</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Detailed transaction history and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search transactions</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by ID or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="infrastructure">
                        Infrastructure
                      </SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.id}
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "revenue"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          {transaction.processingTime.toFixed(1)}s
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.fees)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
