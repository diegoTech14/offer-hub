/**
 * @fileoverview Main content moderation interface and dashboard
 * @author Offer Hub Team
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Star,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useContentModeration } from "@/hooks/use-content-moderation";
import {
  ContentModerationProps,
  ModerationAnalytics,
  ContentItem,
  UserReport,
  ContentAppeal,
  ModerationFilters,
  ExportOptions,
  ContentType,
  ModerationStatus,
  ContentPriority,
} from "@/types/moderation.types";

// Import sub-components
import AutomatedFiltering from "./automated-filtering";
import ManualReview from "./manual-review";
import QualityScoring from "./quality-scoring";

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  onClick?: () => void;
}

function QuickStatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  onClick,
}: QuickStatsCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  }[changeType];

  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-md", onClick && "hover:bg-gray-50")}>
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn("text-xs mt-1", changeColor)}>
                {change}
              </p>
            )}
          </div>
          <div className="h-8 w-8 text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationQueue({
  content,
  onContentClick,
}: {
  content: ContentItem[];
  onContentClick: (content: ContentItem) => void;
}) {
  const prioritizedContent = useMemo(() => {
    return content
      .filter(item => item.status === 'pending' || item.status === 'flagged')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10); // Show top 10 items
  }, [content]);

  const priorityConfig = {
    low: { label: "Low", color: "bg-gray-100 text-gray-800" },
    medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
    high: { label: "High", color: "bg-orange-100 text-orange-800" },
    critical: { label: "Critical", color: "bg-red-100 text-red-800" },
  };

  if (prioritizedContent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">
            No content pending moderation at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Moderation Queue
          </div>
          <Badge variant="outline">{prioritizedContent.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prioritizedContent.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onContentClick(item)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <Badge className={priorityConfig[item.priority].color}>
                    {priorityConfig[item.priority].label}
                  </Badge>
                </div>
                <p className="text-sm font-medium truncate">{item.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground truncate">{item.content}</p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                  <span>By {item.authorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.flagCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {item.flagCount} flags
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({
  reports,
  appeals,
}: {
  reports: UserReport[];
  appeals: ContentAppeal[];
}) {
  const activities = useMemo(() => {
    const reportActivities = reports.slice(0, 5).map(report => ({
      id: report.id,
      type: 'report' as const,
      title: `New report: ${report.reportType}`,
      description: report.description.slice(0, 100) + '...',
      timestamp: new Date(report.createdAt),
      priority: report.priority,
    }));

    const appealActivities = appeals.slice(0, 5).map(appeal => ({
      id: appeal.id,
      type: 'appeal' as const,
      title: 'Content appeal submitted',
      description: appeal.reason.slice(0, 100) + '...',
      timestamp: new Date(appeal.createdAt),
      priority: appeal.priority,
    }));

    return [...reportActivities, ...appealActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }, [reports, appeals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-md">
                <div className="flex-shrink-0">
                  {activity.type === 'report' ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge
                  variant={activity.priority === 'critical' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {activity.priority}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationOverview({ analytics }: { analytics: ModerationAnalytics | null }) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { overview } = analytics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <QuickStatsCard
        title="Total Content"
        value={overview.totalContent.toLocaleString()}
        icon={<FileText className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Pending Review"
        value={overview.pendingReview.toLocaleString()}
        change={overview.pendingReview > 100 ? "High volume" : "Normal"}
        changeType={overview.pendingReview > 100 ? "negative" : "neutral"}
        icon={<Clock className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Auto-Moderated"
        value={overview.autoModerated.toLocaleString()}
        change={`${((overview.autoModerated / overview.totalContent) * 100).toFixed(1)}% of total`}
        changeType="positive"
        icon={<Bot className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Quality Score"
        value={`${overview.qualityScoreAverage.toFixed(1)}/10`}
        change="Platform average"
        changeType="neutral"
        icon={<Star className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Flagged Content"
        value={overview.flaggedContent.toLocaleString()}
        change={`${((overview.flaggedContent / overview.totalContent) * 100).toFixed(1)}% flag rate`}
        changeType={overview.flaggedContent > 50 ? "negative" : "neutral"}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Response Time"
        value={`${overview.averageResponseTime.toFixed(1)}h`}
        change="Average response"
        changeType={overview.averageResponseTime > 24 ? "negative" : "positive"}
        icon={<Activity className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Appeals"
        value={overview.appealsReceived.toLocaleString()}
        change={`${overview.appealsOverturned} overturned`}
        changeType="neutral"
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <QuickStatsCard
        title="Removed Content"
        value={overview.removedContent.toLocaleString()}
        change={`${((overview.removedContent / overview.totalContent) * 100).toFixed(1)}% removal rate`}
        changeType="neutral"
        icon={<XCircle className="h-4 w-4" />}
      />
    </div>
  );
}

function ExportDialog({
  onExport,
}: {
  onExport: (options: ExportOptions) => Promise<void>;
}) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    includeMetadata: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await onExport(options);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [options, onExport]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Moderation Data</DialogTitle>
          <DialogDescription>
            Export moderation data for analysis or compliance reporting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Export Format</Label>
            <Select value={options.format} onValueChange={(format) => setOptions(prev => ({ ...prev, format: format as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={options.dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={options.dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ContentModeration({ 
  className, 
  initialFilters,
  onContentModerated 
}: ContentModerationProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const {
    content,
    reports,
    appeals,
    analytics,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    exportData,
  } = useContentModeration({
    filters: initialFilters,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  const handleContentClick = useCallback((contentItem: ContentItem) => {
    setSelectedContent(contentItem);
    // Could open a detailed view or navigate to manual review
    setActiveTab("manual-review");
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleExport = useCallback(async (options: ExportOptions) => {
    await exportData(options);
  }, [exportData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Moderation System</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Comprehensive content moderation and quality control system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={analytics?.overview.pendingReview ? "destructive" : "secondary"}>
            {analytics?.overview.pendingReview || 0} pending
          </Badge>
          <ExportDialog onExport={handleExport} />
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="automated">Automated Filtering</TabsTrigger>
          <TabsTrigger value="manual-review">Manual Review</TabsTrigger>
          <TabsTrigger value="quality">Quality Scoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <ModerationOverview analytics={analytics} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModerationQueue 
              content={content} 
              onContentClick={handleContentClick}
            />
            <RecentActivity 
              reports={reports} 
              appeals={appeals}
            />
          </div>

          {/* Additional Stats */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.contentMetrics.map((metric) => (
                      <div key={metric.type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{metric.type}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(metric.approved / metric.total) * 100} className="w-20" />
                          <span className="text-sm text-muted-foreground">
                            {metric.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Moderator Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Moderators</span>
                      <span className="text-sm font-medium">
                        {analytics.moderatorMetrics.activeModerators}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Accuracy</span>
                      <span className="text-sm font-medium">
                        {(analytics.moderatorMetrics.avgAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium">
                        {analytics.moderatorMetrics.avgResponseTime.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className="text-sm font-medium">
                        {analytics.overview.qualityScoreAverage.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={analytics.overview.qualityScoreAverage * 10} className="w-full" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Low Quality</span>
                      <span>High Quality</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Automated Filtering Tab */}
        <TabsContent value="automated" className="space-y-6">
          <AutomatedFiltering />
        </TabsContent>

        {/* Manual Review Tab */}
        <TabsContent value="manual-review" className="space-y-6">
          <ManualReview />
        </TabsContent>

        {/* Quality Scoring Tab */}
        <TabsContent value="quality" className="space-y-6">
          <QualityScoring />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <div className="space-y-6">
              <ModerationOverview analytics={analytics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Effectiveness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.policyEffectiveness.map((policy) => (
                        <div key={policy.policyId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{policy.policyName}</span>
                            <Badge variant="outline">
                              {(policy.effectiveness * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={policy.effectiveness * 100} />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{policy.triggeredCount} triggers</span>
                            <span>{(policy.accuracyRate * 100).toFixed(1)}% accuracy</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.trendData.slice(-7).map((trend, index) => (
                        <div key={trend.date} className="flex items-center justify-between">
                          <span className="text-sm">
                            {new Date(trend.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {trend.flaggedContent} flagged
                            </span>
                            <Badge variant="outline">
                              {trend.avgQualityScore.toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
