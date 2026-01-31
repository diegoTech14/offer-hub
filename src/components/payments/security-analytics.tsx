"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  AlertTriangle,
  Eye,
  Clock,
  Target,
  Zap,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Settings
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  SecurityMetrics,
  TimeframePeriod,
  SecurityEventType,
  RiskFactorType,
  ResponseTimeMetrics
} from '@/types/payment-security.types';
import { usePaymentSecurity } from '@/hooks/use-payment-security';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface SecurityAnalyticsProps {
  className?: string;
  userId?: string;
}

export function SecurityAnalytics({
  className = '',
  userId
}: SecurityAnalyticsProps) {
  const { isLoading, error, getSecurityMetrics } = usePaymentSecurity();
  
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframePeriod>(TimeframePeriod.DAILY);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899'
  };

  // Load metrics on component mount and timeframe change
  useEffect(() => {
    loadMetrics();
  }, [selectedTimeframe]);

  const loadMetrics = async () => {
    setIsRefreshing(true);
    try {
      const data = await getSecurityMetrics(selectedTimeframe);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadMetrics();
  };

  const formatEventType = (eventType: SecurityEventType): string => {
    return eventType.toString().replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRiskFactor = (factor: RiskFactorType): string => {
    return factor.toString().replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const prepareEventTypeData = () => {
    if (!metrics) return [];
    
    return Object.entries(metrics.securityEventsByType).map(([type, count]) => ({
      name: formatEventType(type as SecurityEventType).substring(0, 15) + '...',
      value: count,
      fullName: formatEventType(type as SecurityEventType)
    }));
  };

  const prepareRiskFactorData = () => {
    if (!metrics) return [];
    
    return metrics.topRiskFactors.map(factor => ({
      name: formatRiskFactor(factor.factor).substring(0, 12) + '...',
      occurrences: factor.occurrences,
      weight: factor.averageWeight * 100,
      contribution: factor.totalRiskContribution,
      fullName: formatRiskFactor(factor.factor)
    }));
  };

  const preparePerformanceData = () => {
    if (!metrics) return [];
    
    // Generate mock trend data for performance metrics
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: timestamp.toISOString().substring(11, 16), // HH:MM format
        detectionTime: Math.floor(Math.random() * 50) + 100,
        responseTime: Math.floor(Math.random() * 30) + 50,
        accuracy: Math.floor(Math.random() * 10) + 85,
        throughput: Math.floor(Math.random() * 50) + 100
      });
    }
    
    return data;
  };

  const calculateAccuracy = () => {
    if (!metrics) return 0;
    return ((metrics.truePositives / (metrics.truePositives + metrics.falsePositives)) * 100).toFixed(1);
  };

  const calculateRecall = () => {
    if (!metrics) return 0;
    return ((metrics.truePositives / (metrics.truePositives + metrics.falseNegatives)) * 100).toFixed(1);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

  if (isLoading && !metrics) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Loading security analytics...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Security Analytics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select 
            value={selectedTimeframe} 
            onValueChange={(value: TimeframePeriod) => setSelectedTimeframe(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeframePeriod.HOURLY}>Last Hour</SelectItem>
              <SelectItem value={TimeframePeriod.DAILY}>Last 24 Hours</SelectItem>
              <SelectItem value={TimeframePeriod.WEEKLY}>Last Week</SelectItem>
              <SelectItem value={TimeframePeriod.MONTHLY}>Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Processed in timeframe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{calculateAccuracy()}%</div>
                <p className="text-xs text-muted-foreground">
                  Precision: {(metrics.precision * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Transactions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.blockedTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  {((metrics.blockedTransactions / metrics.totalTransactions) * 100).toFixed(2)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.responseTimeMetrics.averageResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  P95: {metrics.responseTimeMetrics.p95ResponseTime}ms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Events Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Events Distribution</CardTitle>
                    <CardDescription>Breakdown of security events by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={prepareEventTypeData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {prepareEventTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Risk Factors Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Risk Factors</CardTitle>
                    <CardDescription>Most frequent risk factors detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prepareRiskFactorData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                        <Bar dataKey="occurrences" fill={chartColors.primary} name="Occurrences" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Model Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Model Performance Metrics</CardTitle>
                    <CardDescription>Fraud detection model accuracy metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Precision</span>
                          <span className="text-sm font-bold">{(metrics.precision * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${metrics.precision * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Recall</span>
                          <span className="text-sm font-bold">{(metrics.recall * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${metrics.recall * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">F1 Score</span>
                          <span className="text-sm font-bold">{(metrics.f1Score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${metrics.f1Score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Avg Risk Score</span>
                          <span className="text-sm font-bold">{metrics.averageRiskScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${metrics.averageRiskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detection Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detection Statistics</CardTitle>
                    <CardDescription>True/false positives and negatives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{metrics.truePositives}</div>
                        <div className="text-sm text-green-700">True Positives</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{metrics.falsePositives}</div>
                        <div className="text-sm text-red-700">False Positives</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{metrics.falseNegatives}</div>
                        <div className="text-sm text-yellow-700">False Negatives</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.totalTransactions - metrics.truePositives - metrics.falsePositives - metrics.falseNegatives}
                        </div>
                        <div className="text-sm text-blue-700">True Negatives</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="threats" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Threat Analysis</CardTitle>
                    <CardDescription>Security threats by type and frequency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(metrics.securityEventsByType)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">
                                {formatEventType(type as SecurityEventType)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">{count}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(count / Math.max(...Object.values(metrics.securityEventsByType))) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Factor Contributions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Factor Contributions</CardTitle>
                    <CardDescription>Total risk contribution by factor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prepareRiskFactorData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                        <Bar dataKey="contribution" fill={chartColors.warning} name="Risk Contribution" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Time Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time Performance</CardTitle>
                    <CardDescription>Detection and response time trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={preparePerformanceData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="detectionTime" stroke={chartColors.primary} name="Detection Time (ms)" />
                        <Line type="monotone" dataKey="responseTime" stroke={chartColors.secondary} name="Response Time (ms)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* System Throughput */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Throughput</CardTitle>
                    <CardDescription>Transaction processing capacity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={preparePerformanceData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="throughput" stroke={chartColors.purple} fill={chartColors.purple} fillOpacity={0.3} name="Transactions/min" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Detailed Performance Metrics</CardTitle>
                    <CardDescription>Comprehensive system performance statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.responseTimeMetrics.averageDetectionTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Detection Time</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.responseTimeMetrics.averageResponseTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.responseTimeMetrics.p95DetectionTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">P95 Detection Time</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {metrics.responseTimeMetrics.p95ResponseTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">P95 Response Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Trends</CardTitle>
                  <CardDescription>Long-term security trends and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Historical trend analysis will be available with more data collection.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}