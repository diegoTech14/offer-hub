'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Clock,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
  AlertCircle,
} from 'lucide-react';
import { useSystemMonitoring } from '@/hooks/use-admin-dashboard';
import type { SystemHealthMetrics, SecurityEvent } from '@/types/admin.types';
import { cn } from '@/lib/utils';

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
  description?: string;
  threshold?: { warning: number; critical: number };
}

function HealthMetricCard({
  title,
  value,
  status,
  icon,
  description,
  threshold,
}: HealthMetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'critical':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getProgressValue = () => {
    if (typeof value === 'string') return 0;
    if (title.toLowerCase().includes('uptime')) return value;
    if (title.toLowerCase().includes('usage')) return value;
    return 0;
  };

  return (
    <Card
      className={cn(
        'border-2',
        getStatusColor(status).split(' ').slice(2).join(' '),
      )}
    >
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <div
                className={cn(
                  'p-2 rounded-full',
                  getStatusColor(status).split(' ').slice(0, 2).join(' '),
                )}
              >
                {icon}
              </div>
              <div>
                <p className='text-sm font-medium'>{title}</p>
                <p className='text-xs text-muted-foreground'>{description}</p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <span className='text-lg font-bold'>
                {typeof value === 'number' &&
                title.toLowerCase().includes('uptime')
                  ? `${value.toFixed(2)}%`
                  : typeof value === 'number' &&
                    title.toLowerCase().includes('usage')
                  ? `${value.toFixed(1)}%`
                  : typeof value === 'number' &&
                    title.toLowerCase().includes('time')
                  ? `${value}ms`
                  : value}
              </span>
              {getStatusIcon()}
            </div>

            {typeof value === 'number' &&
              (title.toLowerCase().includes('uptime') ||
                title.toLowerCase().includes('usage')) && (
                <div className='space-y-1'>
                  <Progress value={getProgressValue()} className='h-2' />
                  {threshold && (
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>Warning: {threshold.warning}%</span>
                      <span>Critical: {threshold.critical}%</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SystemOverviewProps {
  systemHealth: SystemHealthMetrics | null;
  isLoading: boolean;
}

function SystemOverview({ systemHealth, isLoading }: SystemOverviewProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='space-y-3'>
                <div className='h-4 w-20 bg-gray-200 animate-pulse rounded' />
                <div className='h-6 w-16 bg-gray-200 animate-pulse rounded' />
                <div className='h-2 bg-gray-200 animate-pulse rounded' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className='text-center py-8'>
        <Server className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <p className='text-gray-500'>No system health data available</p>
      </div>
    );
  }

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.5) return 'healthy';
    if (uptime >= 99.0) return 'warning';
    return 'critical';
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime <= 200) return 'healthy';
    if (responseTime <= 500) return 'warning';
    return 'critical';
  };

  const getErrorRateStatus = (errorRate: number) => {
    if (errorRate <= 1) return 'healthy';
    if (errorRate <= 5) return 'warning';
    return 'critical';
  };

  const getUsageStatus = (usage: number) => {
    if (usage <= 70) return 'healthy';
    if (usage <= 90) return 'warning';
    return 'critical';
  };

  const getDatabaseStatus = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'healthy';
      case 'warning':
        return 'warning';
      default:
        return 'critical';
    }
  };

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <HealthMetricCard
        title='System Uptime'
        value={systemHealth.uptime}
        status={getUptimeStatus(systemHealth.uptime)}
        icon={<Clock className='h-5 w-5' />}
        description='System availability'
        threshold={{ warning: 99.0, critical: 98.0 }}
      />

      <HealthMetricCard
        title='Response Time'
        value={systemHealth.responseTime}
        status={getResponseTimeStatus(systemHealth.responseTime)}
        icon={<Activity className='h-5 w-5' />}
        description='Average API response time'
      />

      <HealthMetricCard
        title='Error Rate'
        value={`${systemHealth.errorRate}%`}
        status={getErrorRateStatus(systemHealth.errorRate)}
        icon={<AlertTriangle className='h-5 w-5' />}
        description='Error percentage'
      />

      <HealthMetricCard
        title='Database'
        value={systemHealth.databaseStatus}
        status={getDatabaseStatus(systemHealth.databaseStatus)}
        icon={<Database className='h-5 w-5' />}
        description='Database connectivity'
      />

      <HealthMetricCard
        title='Server Load'
        value={systemHealth.serverLoad}
        status={getUsageStatus(systemHealth.serverLoad)}
        icon={<Cpu className='h-5 w-5' />}
        description='CPU utilization'
        threshold={{ warning: 70, critical: 90 }}
      />

      <HealthMetricCard
        title='Memory Usage'
        value={systemHealth.memoryUsage}
        status={getUsageStatus(systemHealth.memoryUsage)}
        icon={<Monitor className='h-5 w-5' />}
        description='RAM utilization'
        threshold={{ warning: 80, critical: 95 }}
      />

      <HealthMetricCard
        title='Disk Usage'
        value={systemHealth.diskUsage}
        status={getUsageStatus(systemHealth.diskUsage)}
        icon={<HardDrive className='h-5 w-5' />}
        description='Storage utilization'
        threshold={{ warning: 80, critical: 95 }}
      />

      <HealthMetricCard
        title='Active Connections'
        value={systemHealth.activeConnections}
        status='healthy'
        icon={<Wifi className='h-5 w-5' />}
        description='Current connections'
      />
    </div>
  );
}

interface SecurityEventRowProps {
  event: SecurityEvent;
  onUpdateStatus: (eventId: string, status: SecurityEvent['status']) => void;
}

function SecurityEventRow({ event, onUpdateStatus }: SecurityEventRowProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant='destructive'>Critical</Badge>;
      case 'high':
        return <Badge className='bg-orange-100 text-orange-800'>High</Badge>;
      case 'medium':
        return <Badge className='bg-yellow-100 text-yellow-800'>Medium</Badge>;
      case 'low':
        return <Badge variant='secondary'>Low</Badge>;
      default:
        return <Badge variant='outline'>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Resolved
          </Badge>
        );
      case 'investigating':
        return (
          <Badge className='bg-blue-100 text-blue-800'>Investigating</Badge>
        );
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>;
      case 'false_positive':
        return <Badge variant='outline'>False Positive</Badge>;
      default:
        return <Badge variant='outline'>Unknown</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className='space-y-1'>
          <p className='font-medium text-sm'>
            {event.type.replace('_', ' ').toUpperCase()}
          </p>
          <p className='text-xs text-muted-foreground'>
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className='max-w-xs'>
          <p className='text-sm truncate'>{event.description}</p>
          <p className='text-xs text-muted-foreground'>{event.ipAddress}</p>
        </div>
      </TableCell>
      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
      <TableCell>{getStatusBadge(event.status)}</TableCell>
      <TableCell>
        <Select
          value={event.status}
          onValueChange={(value: SecurityEvent['status']) =>
            onUpdateStatus(event.id, value)
          }
        >
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='investigating'>Investigating</SelectItem>
            <SelectItem value='resolved'>Resolved</SelectItem>
            <SelectItem value='false_positive'>False Positive</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}

interface SecurityEventsProps {
  events: SecurityEvent[];
  isLoading: boolean;
  onUpdateEvent: (eventId: string, status: SecurityEvent['status']) => void;
}

function SecurityEvents({
  events,
  isLoading,
  onUpdateEvent,
}: SecurityEventsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-3'>
                <div className='h-4 w-20 bg-gray-200 animate-pulse rounded' />
                <div className='h-4 w-32 bg-gray-200 animate-pulse rounded' />
                <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
                <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Shield className='h-5 w-5' />
          <span>Security Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className='text-center py-8'>
            <Shield className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <p className='text-green-600 font-medium'>
              No security events detected
            </p>
            <p className='text-sm text-muted-foreground'>System is secure</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <SecurityEventRow
                  key={event.id}
                  event={event}
                  onUpdateStatus={onUpdateEvent}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function SystemHealth() {
  const {
    systemHealth,
    securityEvents,
    isLoading,
    error,
    initializeMonitoring,
  } = useSystemMonitoring();

  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  const handleRefresh = () => {
    initializeMonitoring();
  };

  const handleUpdateSecurityEvent = async (
    eventId: string,
    status: SecurityEvent['status'],
  ) => {
    try {
      // This would typically call the admin service to update the event
      console.log('Updating security event:', eventId, status);
      // For now, we'll just refresh the data
      initializeMonitoring();
    } catch (error) {
      console.error('Failed to update security event:', error);
    }
  };

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading System Health
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate overall system status
  const getOverallStatus = () => {
    if (!systemHealth) return 'unknown';

    const { uptime, errorRate, databaseStatus, memoryUsage, diskUsage } =
      systemHealth;

    if (
      errorRate > 5 ||
      databaseStatus === 'error' ||
      uptime < 95 ||
      memoryUsage > 95 ||
      diskUsage > 95
    ) {
      return 'critical';
    }

    if (
      errorRate > 1 ||
      databaseStatus === 'warning' ||
      uptime < 99 ||
      memoryUsage > 80 ||
      diskUsage > 80
    ) {
      return 'warning';
    }

    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>System Health</h1>
          <p className='text-muted-foreground'>
            Monitor system performance and security
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Badge
            variant={overallStatus === 'healthy' ? 'default' : 'destructive'}
            className={cn(
              'text-sm px-3 py-1',
              overallStatus === 'healthy' && 'bg-green-100 text-green-800',
              overallStatus === 'warning' && 'bg-yellow-100 text-yellow-800',
              overallStatus === 'critical' && 'bg-red-100 text-red-800',
            )}
          >
            System Status:{' '}
            {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
          </Badge>
          <Button variant='outline' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-4'>
            <span className='text-sm font-medium'>Time Range:</span>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1h'>Last Hour</SelectItem>
                <SelectItem value='6h'>Last 6 Hours</SelectItem>
                <SelectItem value='24h'>Last 24 Hours</SelectItem>
                <SelectItem value='7d'>Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
            {systemHealth && (
              <span className='text-sm text-muted-foreground'>
                Last updated:{' '}
                {new Date(systemHealth.lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>System Overview</h2>
        <SystemOverview systemHealth={systemHealth} isLoading={isLoading} />
      </div>

      {/* Security Events */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Security Monitoring</h2>
        <SecurityEvents
          events={securityEvents}
          isLoading={isLoading}
          onUpdateEvent={handleUpdateSecurityEvent}
        />
      </div>

      {/* System Alerts */}
      {overallStatus === 'critical' && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-center'>
              <AlertTriangle className='h-5 w-5 text-red-600 mr-3' />
              <div>
                <h4 className='text-sm font-medium text-red-800'>
                  Critical System Alert
                </h4>
                <p className='text-sm text-red-700'>
                  System performance is below acceptable thresholds. Immediate
                  attention required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {overallStatus === 'warning' && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardContent className='p-4'>
            <div className='flex items-center'>
              <AlertTriangle className='h-5 w-5 text-yellow-600 mr-3' />
              <div>
                <h4 className='text-sm font-medium text-yellow-800'>
                  System Warning
                </h4>
                <p className='text-sm text-yellow-700'>
                  Some system metrics are approaching warning thresholds.
                  Monitor closely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
