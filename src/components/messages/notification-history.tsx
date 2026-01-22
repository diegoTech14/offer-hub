"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMessageNotifications } from '@/hooks/use-message-notifications';
import { NotificationHistory, NotificationAnalytics, MessageNotification } from '@/types/message-notifications.types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationHistoryProps {
  userId: string;
  className?: string;
}

interface HistoryFilters {
  dateRange?: { from: Date; to: Date };
  channel?: string;
  status?: 'sent' | 'delivered' | 'read' | 'clicked' | 'dismissed' | 'failed';
  notificationType?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const STATUS_COLORS = {
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  read: 'bg-purple-100 text-purple-800',
  clicked: 'bg-indigo-100 text-indigo-800',
  dismissed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
};

const CHANNEL_ICONS = {
  'in-app': '📱',
  'push': '🔔',
  'email': '📧',
  'sms': '💬',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function NotificationHistory({ userId, className }: NotificationHistoryProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<MessageNotification | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const {
    notifications,
    analytics,
    isLoading,
    error,
    loadAnalytics,
    refresh,
  } = useMessageNotifications({
    userId,
    autoConnect: true,
  });

  // Mock history data - in real implementation, this would come from the API
  const [historyData, setHistoryData] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    loadAnalytics();
    loadHistoryData();
  }, [loadAnalytics]);

  const loadHistoryData = async () => {
    // Mock implementation - replace with actual API call
    const mockHistory: NotificationHistory[] = notifications.flatMap(notification => [
      {
        id: `${notification.id}-sent`,
        notificationId: notification.id,
        userId: userId,
        action: 'sent',
        timestamp: notification.timestamp,
        channel: 'in-app',
        metadata: { priority: notification.priority }
      },
      {
        id: `${notification.id}-delivered`,
        notificationId: notification.id,
        userId: userId,
        action: 'delivered',
        timestamp: new Date(Date.parse(notification.timestamp) + 1000).toISOString(),
        channel: 'in-app',
        metadata: { priority: notification.priority }
      },
      ...(notification.read ? [{
        id: `${notification.id}-read`,
        notificationId: notification.id,
        userId: userId,
        action: 'read' as const,
        timestamp: new Date(Date.parse(notification.timestamp) + 5000).toISOString(),
        channel: 'in-app' as const,
        metadata: { priority: notification.priority }
      }] : [])
    ]);

    setHistoryData(mockHistory);
  };

  // Filter history data
  const filteredHistory = historyData.filter(item => {
    if (filters.dateRange) {
      const itemDate = new Date(item.timestamp);
      if (itemDate < filters.dateRange.from || itemDate > filters.dateRange.to) {
        return false;
      }
    }
    if (filters.channel && item.channel !== filters.channel) return false;
    if (filters.status && item.action !== filters.status) return false;
    if (filters.priority && item.metadata?.priority !== filters.priority) return false;
    if (searchQuery) {
      const notification = notifications.find(n => n.id === item.notificationId);
      if (!notification?.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !notification?.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Group history by notification
  const groupedHistory = filteredHistory.reduce((acc, item) => {
    if (!acc[item.notificationId]) {
      acc[item.notificationId] = [];
    }
    acc[item.notificationId].push(item);
    return acc;
  }, {} as Record<string, NotificationHistory[]>);

  // Toggle row expansion
  const toggleRowExpansion = (notificationId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Export data
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      // Mock implementation - replace with actual export logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = format === 'csv' 
        ? convertToCSV(filteredHistory)
        : JSON.stringify(filteredHistory, null, 2);
      
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notification-history-${format}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: NotificationHistory[]) => {
    const headers = ['Timestamp', 'Action', 'Channel', 'Priority', 'Notification ID'];
    const rows = data.map(item => [
      format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      item.action,
      item.channel || '',
      item.metadata?.priority || '',
      item.notificationId
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Get status icon
  const getStatusIcon = (action: NotificationHistory['action']) => {
    switch (action) {
      case 'sent': return <Clock className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'read': return <Eye className="w-4 h-4" />;
      case 'clicked': return <TrendingUp className="w-4 h-4" />;
      case 'dismissed': return <XCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Render analytics overview
  const renderAnalyticsOverview = () => {
    if (!analytics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{analytics.totalSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{analytics.totalDelivered}</p>
                <p className="text-xs text-gray-500">
                  {analytics.deliveryRate.toFixed(1)}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold">{analytics.totalRead}</p>
                <p className="text-xs text-gray-500">
                  {analytics.readRate.toFixed(1)}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{analytics.totalFailed}</p>
                <p className="text-xs text-gray-500">
                  {analytics.failureRate.toFixed(1)}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render detailed history table
  const renderDetailedHistory = () => {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange
                  onSelect={(range) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: range?.from && range?.to ? range : undefined 
                  }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Channel</label>
                <Select
                  value={filters.channel || ''}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    channel: value || undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All channels</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    status: value as HistoryFilters['status'] || undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="clicked">Clicked</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    priority: value as HistoryFilters['priority'] || undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Notification History</span>
              <Badge variant="outline">
                {filteredHistory.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notification</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedHistory).map(([notificationId, historyItems]) => {
                    const notification = notifications.find(n => n.id === notificationId);
                    const latestItem = historyItems.sort((a, b) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )[0];
                    const isExpanded = expandedRows.has(notificationId);

                    return (
                      <React.Fragment key={notificationId}>
                        <TableRow 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleRowExpansion(notificationId)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <div>
                                <p className="font-medium text-sm">
                                  {notification?.title || 'Unknown Notification'}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {notification?.message || 'No message'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>{CHANNEL_ICONS[latestItem.channel as keyof typeof CHANNEL_ICONS] || '📱'}</span>
                              <span className="text-sm capitalize">
                                {latestItem.channel || 'in-app'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", STATUS_COLORS[latestItem.action])}
                            >
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(latestItem.action)}
                                <span className="capitalize">{latestItem.action}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {latestItem.metadata?.priority && (
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", PRIORITY_COLORS[latestItem.metadata.priority])}
                              >
                                {latestItem.metadata.priority}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{format(new Date(latestItem.timestamp), 'MMM d, yyyy')}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(latestItem.timestamp), 'HH:mm:ss')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotification(notification || null);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        <Collapsible open={isExpanded}>
                          <CollapsibleContent>
                            <TableRow>
                              <TableCell colSpan={6} className="bg-gray-50">
                                <div className="p-4">
                                  <h4 className="font-medium mb-2">Timeline</h4>
                                  <div className="space-y-2">
                                    {historyItems
                                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                      .map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3 text-sm">
                                          <div className="flex items-center space-x-1">
                                            {getStatusIcon(item.action)}
                                            <span className="font-medium capitalize">{item.action}</span>
                                          </div>
                                          <span className="text-gray-500">
                                            {format(new Date(item.timestamp), 'MMM d, HH:mm:ss')}
                                          </span>
                                          {item.channel && (
                                            <Badge variant="outline" className="text-xs">
                                              {item.channel}
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </Collapsible>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <History className="w-6 h-6" />
            <span>Notification History</span>
          </h2>
          <p className="text-gray-600">View and analyze your notification activity</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderAnalyticsOverview()}
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHistory.slice(0, 10).map((item) => {
                  const notification = notifications.find(n => n.id === item.notificationId);
                  return (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.action)}
                        <span className="text-sm font-medium capitalize">{item.action}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification?.title || 'Unknown Notification'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{CHANNEL_ICONS[item.channel as keyof typeof CHANNEL_ICONS] || '📱'}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.channel || 'in-app'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          {renderDetailedHistory()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsOverview()}
          
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.channelBreakdown).map(([channel, metrics]) => (
                      <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span>{CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS] || '📱'}</span>
                          <span className="font-medium capitalize">{channel}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{metrics.delivered}/{metrics.sent}</p>
                          <p className="text-xs text-gray-500">
                            {((metrics.delivered / metrics.sent) * 100).toFixed(1)}% delivery rate
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Delivery Time</span>
                      <span className="text-sm">{analytics.averageDeliveryTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delivery Rate</span>
                      <span className="text-sm">{analytics.deliveryRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Read Rate</span>
                      <span className="text-sm">{analytics.readRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Click Rate</span>
                      <span className="text-sm">{analytics.clickRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failure Rate</span>
                      <span className="text-sm text-red-600">{analytics.failureRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationHistory;
