"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Eye,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Smartphone,
  CreditCard,
  Bell,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Search,
  Calendar
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  SecurityDashboardData,
  SecurityAlert,
  RiskLevel,
  SystemHealthStatus,
  ServiceStatus,
  TimeframePeriod
} from '@/types/payment-security.types';
import { usePaymentSecurity } from '../../hooks/use-payment-security';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SecurityMonitorProps {
  className?: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SecurityMonitor({
  className = '',
  userId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: SecurityMonitorProps) {
  const {
    isLoading,
    error,
    getSecurityMetrics,
    getSecurityAlerts,
    acknowledgeAlert,
    reportSecurityEvent
  } = usePaymentSecurity();

  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [filterSeverity, setFilterSeverity] = useState<SecuritySeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);

  // Colors for charts and status indicators
  const severityColors = {
    [SecuritySeverity.LOW]: '#10B981',
    [SecuritySeverity.MEDIUM]: '#F59E0B',
    [SecuritySeverity.HIGH]: '#EF4444',
    [SecuritySeverity.CRITICAL]: '#DC2626'
  };

  const riskLevelColors = {
    [RiskLevel.VERY_LOW]: '#10B981',
    [RiskLevel.LOW]: '#84CC16',
    [RiskLevel.MEDIUM]: '#F59E0B',
    [RiskLevel.HIGH]: '#EF4444',
    [RiskLevel.VERY_HIGH]: '#DC2626'
  };

  const serviceStatusColors = {
    [ServiceStatus.HEALTHY]: '#10B981',
    [ServiceStatus.DEGRADED]: '#F59E0B',
    [ServiceStatus.DOWN]: '#EF4444',
    [ServiceStatus.UNKNOWN]: '#6B7280'
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !monitoringEnabled) return;

    const interval = setInterval(() => {
      loadDashboardData();
      loadSecurityAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, monitoringEnabled, selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      const [metricsData, alertsData] = await Promise.all([
        getSecurityMetrics(selectedTimeframe === '1h' ? TimeframePeriod.HOURLY :
                          selectedTimeframe === '24h' ? TimeframePeriod.DAILY :
                          selectedTimeframe === '7d' ? TimeframePeriod.WEEKLY : TimeframePeriod.MONTHLY),
        getSecurityAlerts()
      ]);

      // Simulate dashboard data structure
      const mockDashboardData: SecurityDashboardData = {
        currentRiskLevel: RiskLevel.LOW,
        activeIncidents: alertsData?.filter((a: SecurityAlert) => !a.acknowledged).length || 0,
        todayMetrics: {
          transactionsProcessed: 1250,
          fraudAttempts: 23,
          blockedTransactions: 18,
          successfulBlocks: 16,
          falsePositives: 2,
          averageRiskScore: 15.7
        },
        trendData: {
          riskScoreTrend: generateMockTrendData(),
          fraudAttemptsTrend: generateMockTrendData(),
          responseTimeTrend: generateMockTrendData(),
          accuracyTrend: generateMockTrendData()
        },
        alerts: alertsData || [],
        systemHealth: {
          fraudDetectionService: ServiceStatus.HEALTHY,
          riskAssessmentService: ServiceStatus.HEALTHY,
          securityMonitoring: ServiceStatus.HEALTHY,
          alertingSystem: ServiceStatus.DEGRADED,
          auditingService: ServiceStatus.HEALTHY,
          overallHealth: ServiceStatus.HEALTHY
        }
      };

      setDashboardData(mockDashboardData);
      setActiveAlerts(alertsData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const alerts = await getSecurityAlerts();
      setActiveAlerts(alerts);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const generateMockTrendData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp,
        value: Math.floor(Math.random() * 100) + 10
      });
    }
    return data;
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      await loadSecurityAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    loadSecurityAlerts();
  };

  const filteredAlerts = activeAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityIcon = (severity: SecuritySeverity) => {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return <XCircle className="h-4 w-4" />;
      case SecuritySeverity.HIGH:
        return <AlertTriangle className="h-4 w-4" />;
      case SecuritySeverity.MEDIUM:
        return <Clock className="h-4 w-4" />;
      case SecuritySeverity.LOW:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getServiceStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.HEALTHY:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ServiceStatus.DEGRADED:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case ServiceStatus.DOWN:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security monitor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Monitor Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Security Monitor</h2>
          <Badge variant={monitoringEnabled ? "default" : "secondary"}>
            {monitoringEnabled ? "Active" : "Paused"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="monitoring-toggle">Real-time Monitoring</Label>
            <Switch
              id="monitoring-toggle"
              checked={monitoringEnabled}
              onCheckedChange={setMonitoringEnabled}
            />
          </div>
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Risk Level</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: riskLevelColors[dashboardData.currentRiskLevel] }}>
                {dashboardData.currentRiskLevel.toUpperCase().replace('_', ' ')}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardData.activeIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Detection Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {((dashboardData.todayMetrics.successfulBlocks / dashboardData.todayMetrics.fraudAttempts) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.todayMetrics.successfulBlocks}/{dashboardData.todayMetrics.fraudAttempts} blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.todayMetrics.averageRiskScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Trend</CardTitle>
                  <CardDescription>Average risk scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.trendData.riskScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(time) => formatTimestamp(time)} />
                      <YAxis />
                      <Tooltip labelFormatter={(time) => formatTimestamp(time)} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Fraud Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Attempts</CardTitle>
                  <CardDescription>Detected fraud attempts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData.trendData.fraudAttemptsTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(time) => formatTimestamp(time)} />
                      <YAxis />
                      <Tooltip labelFormatter={(time) => formatTimestamp(time)} />
                      <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Today's Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Security Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transactions Processed</span>
                      <span className="font-semibold">{dashboardData.todayMetrics.transactionsProcessed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fraud Attempts</span>
                      <span className="font-semibold text-red-600">{dashboardData.todayMetrics.fraudAttempts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Successful Blocks</span>
                      <span className="font-semibold text-green-600">{dashboardData.todayMetrics.successfulBlocks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">False Positives</span>
                      <span className="font-semibold text-yellow-600">{dashboardData.todayMetrics.falsePositives}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Detection Accuracy</span>
                        <span className="font-semibold">
                          {((dashboardData.todayMetrics.successfulBlocks / (dashboardData.todayMetrics.successfulBlocks + dashboardData.todayMetrics.falsePositives)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.todayMetrics.successfulBlocks / (dashboardData.todayMetrics.successfulBlocks + dashboardData.todayMetrics.falsePositives)) * 100} 
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                  <CardDescription>System response times for fraud detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.trendData.responseTimeTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(time) => formatTimestamp(time)} />
                      <YAxis />
                      <Tooltip labelFormatter={(time) => formatTimestamp(time)} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Alerts Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={filterSeverity} onValueChange={(value: any) => setFilterSeverity(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={SecuritySeverity.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={SecuritySeverity.HIGH}>High</SelectItem>
                  <SelectItem value={SecuritySeverity.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={SecuritySeverity.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                {filteredAlerts.length} of {activeAlerts.length} alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="flex items-center space-x-1"
                          style={{ borderColor: severityColors[alert.severity] }}
                        >
                          {getSeverityIcon(alert.severity)}
                          <span style={{ color: severityColors[alert.severity] }}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                      <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={alert.acknowledged ? "default" : "destructive"}>
                          {alert.acknowledged ? "Acknowledged" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No alerts found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Detailed security event log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Security events will be displayed here when available.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fraud Detection Service</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.fraudDetectionService)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.fraudDetectionService.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.fraudDetectionService.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ML models operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.riskAssessmentService)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.riskAssessmentService.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.riskAssessmentService.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time scoring active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Monitoring</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.securityMonitoring)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.securityMonitoring.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.securityMonitoring.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    24/7 monitoring active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerting System</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.alertingSystem)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.alertingSystem.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.alertingSystem.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.systemHealth.alertingSystem === ServiceStatus.DEGRADED ? 
                     'Some delays detected' : 'All notifications working'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auditing Service</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.auditingService)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.auditingService.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.auditingService.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compliance logging active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                  {getServiceStatusIcon(dashboardData.systemHealth.overallHealth)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.systemHealth.overallHealth.charAt(0).toUpperCase() + 
                     dashboardData.systemHealth.overallHealth.slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System operational
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}