"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Zap,
  FileText,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

import { useEscrowManagement } from '@/hooks/use-escrow-management';
import { EscrowContract, EscrowAnalytics, CategoryMetrics, PerformanceTrend } from '@/types/escrow.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface EscrowAnalyticsProps {
  analytics?: EscrowAnalytics | null;
  escrows: EscrowContract[];
  onEscrowSelect?: (escrow: EscrowContract) => void;
}

export default function EscrowAnalytics({ analytics, escrows, onEscrowSelect }: EscrowAnalyticsProps) {
  const { getEscrowAnalytics, loading, error } = useEscrowManagement();

  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [localAnalytics, setLocalAnalytics] = useState<EscrowAnalytics | null>(analytics || null);

  // Load analytics when timeframe changes
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeframe) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        const analyticsData = await getEscrowAnalytics({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });
        setLocalAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    };

    loadAnalytics();
  }, [timeframe, getEscrowAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSatisfactionIcon = (rating: number) => {
    if (rating >= 4.5) return <Award className="h-4 w-4" />;
    if (rating >= 3.5) return <ThumbsUp className="h-4 w-4" />;
    if (rating >= 2.5) return <ThumbsDown className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading && !localAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!localAnalytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-[#002333] mb-2">No Analytics Data</h3>
          <p className="text-[#002333]/70 text-center">
            Analytics data will appear here once you have escrow transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002333]">Escrow Analytics</h2>
          <p className="text-[#002333]/70 mt-1">
            Comprehensive insights into your escrow performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-800 font-medium">Error loading analytics</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Total Escrows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {formatNumber(localAnalytics.totalEscrows)}
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    {getTrendIcon(1)}
                    <span className="ml-1">+{localAnalytics.performanceTrends.length > 0 ? localAnalytics.performanceTrends[localAnalytics.performanceTrends.length - 1].escrowsCreated : 0} this period</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#15949C]/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#15949C]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {formatCurrency(localAnalytics.totalValue)}
                  </div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span>Avg: {formatCurrency(localAnalytics.averageValue)}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {formatPercentage(localAnalytics.completionRate)}
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Completion rate</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Dispute Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {formatPercentage(localAnalytics.disputeRate)}
                  </div>
                  <p className="text-xs text-amber-600 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Dispute rate</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#15949C]" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Escrow creation and completion trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {localAnalytics.performanceTrends.slice(-5).map((trend, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#002333]">{trend.period}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#002333]/70">
                            {formatNumber(trend.escrowsCreated)} created
                          </span>
                          <span className="text-sm text-[#002333]/70">
                            {formatNumber(trend.escrowsCompleted)} completed
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(trend.escrowsCompleted / Math.max(trend.escrowsCreated, 1)) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-[#002333]/70">
                          {formatPercentage(trend.escrowsCompleted / Math.max(trend.escrowsCreated, 1))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#15949C]" />
                  Financial Overview
                </CardTitle>
                <CardDescription>
                  Revenue and cost breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Total Fees</span>
                    <span className="font-medium text-[#002333]">
                      {formatCurrency(localAnalytics.financialMetrics.totalFees)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Average Fee</span>
                    <span className="font-medium text-[#002333]">
                      {formatCurrency(localAnalytics.financialMetrics.averageFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Fee Growth</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(localAnalytics.financialMetrics.feeGrowth)}
                      <span className={`text-sm font-medium ${getTrendColor(localAnalytics.financialMetrics.feeGrowth)}`}>
                        {formatPercentage(Math.abs(localAnalytics.financialMetrics.feeGrowth))}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#002333]">Revenue by Type</h4>
                  {Object.entries(localAnalytics.financialMetrics.revenueByType).map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs text-[#002333]/70 capitalize">{type.replace('_', ' ')}</span>
                      <span className="text-xs font-medium text-[#002333]">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#15949C]" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators and processing times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#15949C]" />
                    <span className="text-sm font-medium text-[#002333]">Average Processing Time</span>
                  </div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {localAnalytics.averageProcessingTime.toFixed(1)}h
                  </div>
                  <p className="text-xs text-[#002333]/70">
                    Time from creation to completion
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#15949C]" />
                    <span className="text-sm font-medium text-[#002333]">Efficiency Score</span>
                  </div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {((1 - localAnalytics.disputeRate) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-[#002333]/70">
                    Based on completion and dispute rates
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#15949C]" />
                    <span className="text-sm font-medium text-[#002333]">Active Escrows</span>
                  </div>
                  <div className="text-2xl font-bold text-[#002333]">
                    {escrows.filter(e => e.status === 'active').length}
                  </div>
                  <p className="text-xs text-[#002333]/70">
                    Currently in progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#15949C]" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Performance metrics by escrow category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Average Value</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Dispute Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localAnalytics.topCategories.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell>
                          <Badge variant="outline" className="text-[#15949C] border-[#15949C]">
                            {category.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-[#002333]">
                            {formatNumber(category.count)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-[#002333]">
                            {formatCurrency(category.totalValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-[#002333]">
                            {formatCurrency(category.averageValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={category.successRate * 100} className="w-16 h-2" />
                            <span className="text-sm font-medium text-[#002333]">
                              {formatPercentage(category.successRate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={category.disputeRate * 100} className="w-16 h-2" />
                            <span className="text-sm font-medium text-[#002333]">
                              {formatPercentage(category.disputeRate)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Satisfaction Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#15949C]" />
                  User Satisfaction
                </CardTitle>
                <CardDescription>
                  Overall satisfaction ratings and feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Overall Rating</span>
                    <div className="flex items-center gap-2">
                      {getSatisfactionIcon(localAnalytics.userSatisfaction.overallRating)}
                      <span className={`text-lg font-bold ${getSatisfactionColor(localAnalytics.userSatisfaction.overallRating)}`}>
                        {localAnalytics.userSatisfaction.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Client Rating</span>
                    <div className="flex items-center gap-2">
                      {getSatisfactionIcon(localAnalytics.userSatisfaction.clientRating)}
                      <span className={`font-medium ${getSatisfactionColor(localAnalytics.userSatisfaction.clientRating)}`}>
                        {localAnalytics.userSatisfaction.clientRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Freelancer Rating</span>
                    <div className="flex items-center gap-2">
                      {getSatisfactionIcon(localAnalytics.userSatisfaction.freelancerRating)}
                      <span className={`font-medium ${getSatisfactionColor(localAnalytics.userSatisfaction.freelancerRating)}`}>
                        {localAnalytics.userSatisfaction.freelancerRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Response Time</span>
                    <span className="font-medium text-[#002333]">
                      {localAnalytics.userSatisfaction.responseTime.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Resolution Time</span>
                    <span className="font-medium text-[#002333]">
                      {localAnalytics.userSatisfaction.resolutionTime.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#002333]/70">Feedback Count</span>
                    <span className="font-medium text-[#002333]">
                      {formatNumber(localAnalytics.userSatisfaction.feedbackCount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Escrows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#15949C]" />
                  Recent Escrows
                </CardTitle>
                <CardDescription>
                  Latest escrow contracts and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {escrows.slice(0, 5).map((escrow) => (
                    <div
                      key={escrow.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onEscrowSelect?.(escrow)}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#002333] line-clamp-1">
                          {escrow.description}
                        </p>
                        <p className="text-xs text-[#002333]/70">
                          {formatCurrency(escrow.amount, escrow.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            escrow.status === 'active' ? 'bg-green-100 text-green-800' :
                            escrow.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            escrow.status === 'disputed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {escrow.status}
                        </Badge>
                        <Eye className="h-4 w-4 text-[#002333]/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
