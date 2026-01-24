/**
 * @fileoverview AI-powered content filtering system component
 * @author Offer Hub Team
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutomatedFiltering, useModerationConfig } from "@/hooks/use-content-moderation";
import {
  AutomatedFilteringProps,
  AutomatedFlag,
  ContentType,
  FlagType,
  ModerationConfig,
} from "@/types/moderation.types";

interface FilteringStats {
  totalProcessed: number;
  flaggedContent: number;
  averageConfidence: number;
  processingTime: number;
  accuracyRate: number;
}

interface FilterTestResult {
  contentId: string;
  flags: AutomatedFlag[];
  processingTime: number;
  overallScore: number;
}

const contentTypeOptions: { value: ContentType; label: string }[] = [
  { value: 'project', label: 'Projects' },
  { value: 'profile', label: 'Profiles' },
  { value: 'review', label: 'Reviews' },
  { value: 'message', label: 'Messages' },
  { value: 'service', label: 'Services' },
  { value: 'comment', label: 'Comments' },
];

const flagTypeOptions: { value: FlagType; label: string; color: string }[] = [
  { value: 'toxic_language', label: 'Toxic Language', color: 'bg-red-100 text-red-800' },
  { value: 'hate_speech', label: 'Hate Speech', color: 'bg-red-100 text-red-800' },
  { value: 'spam', label: 'Spam', color: 'bg-orange-100 text-orange-800' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low_quality', label: 'Low Quality', color: 'bg-gray-100 text-gray-800' },
  { value: 'misleading_information', label: 'Misleading Info', color: 'bg-purple-100 text-purple-800' },
  { value: 'harassment', label: 'Harassment', color: 'bg-red-100 text-red-800' },
  { value: 'adult_content', label: 'Adult Content', color: 'bg-pink-100 text-pink-800' },
];

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "stable" 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
}) {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500";
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn("text-xs flex items-center", trendColor)}>
                <TrendingUp className="h-3 w-3 mr-1" />
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

function FilterConfigurationPanel({ 
  config, 
  onConfigUpdate 
}: { 
  config: ModerationConfig;
  onConfigUpdate: (config: Partial<ModerationConfig>) => void;
}) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleConfigChange = useCallback((updates: Partial<ModerationConfig>) => {
    const updatedConfig = { ...localConfig, ...updates };
    setLocalConfig(updatedConfig);
    onConfigUpdate(updates);
  }, [localConfig, onConfigUpdate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto-moderation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Auto-moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-enabled">Enable Auto-moderation</Label>
              <Switch
                id="auto-enabled"
                checked={localConfig.autoModerationEnabled}
                onCheckedChange={(checked) => 
                  handleConfigChange({ autoModerationEnabled: checked })
                }
              />
            </div>
            
            <div>
              <Label>Confidence Threshold: {(localConfig.minConfidenceThreshold * 100).toFixed(0)}%</Label>
              <Slider
                value={[localConfig.minConfidenceThreshold * 100]}
                onValueChange={([value]) => 
                  handleConfigChange({ minConfidenceThreshold: value / 100 })
                }
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum confidence required for automatic actions
              </p>
            </div>

            <div>
              <Label>Quality Score Threshold: {localConfig.qualityScoreThreshold}/10</Label>
              <Slider
                value={[localConfig.qualityScoreThreshold]}
                onValueChange={([value]) => 
                  handleConfigChange({ qualityScoreThreshold: value as any })
                }
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum quality score to avoid flagging
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Review Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Review Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="review-time">Max Review Time (hours)</Label>
              <Input
                id="review-time"
                type="number"
                value={localConfig.maxReviewTimeHours}
                onChange={(e) => 
                  handleConfigChange({ maxReviewTimeHours: parseInt(e.target.value) })
                }
                min={1}
                max={168}
              />
            </div>

            <div>
              <Label htmlFor="escalation-threshold">Escalation Threshold</Label>
              <Input
                id="escalation-threshold"
                type="number"
                value={localConfig.escalationThreshold}
                onChange={(e) => 
                  handleConfigChange({ escalationThreshold: parseInt(e.target.value) })
                }
                min={1}
                max={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of flags before escalating to human review
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="appeal-enabled">Enable Appeal Process</Label>
              <Switch
                id="appeal-enabled"
                checked={localConfig.enableAppealProcess}
                onCheckedChange={(checked) => 
                  handleConfigChange({ enableAppealProcess: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FilterTestingPanel() {
  const [testContent, setTestContent] = useState("");
  const [testContentType, setTestContentType] = useState<ContentType>("project");
  const [testResult, setTestResult] = useState<FilterTestResult | null>(null);
  
  const { runAutomatedFilter, isProcessing, error } = useAutomatedFiltering();

  const handleRunTest = useCallback(async () => {
    if (!testContent.trim()) return;

    try {
      const flags = await runAutomatedFilter(
        `test-${Date.now()}`,
        testContent,
        testContentType
      );
      
      const overallScore = flags.reduce((acc, flag) => acc + flag.confidence, 0) / flags.length || 0;
      
      setTestResult({
        contentId: `test-${Date.now()}`,
        flags,
        processingTime: Math.random() * 100 + 50, // Mock processing time
        overallScore,
      });
    } catch (err) {
      console.error('Test failed:', err);
    }
  }, [testContent, testContentType, runAutomatedFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Test Content Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-content">Content to Test</Label>
            <Textarea
              id="test-content"
              placeholder="Enter content to test the filtering system..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="test-content-type">Content Type</Label>
            <Select
              value={testContentType}
              onValueChange={(value) => setTestContentType(value as ContentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleRunTest} 
            disabled={!testContent.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Filter Test
              </>
            )}
          </Button>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Processing Time</Label>
                <p className="text-lg font-semibold">{testResult.processingTime.toFixed(1)}ms</p>
              </div>
              <div>
                <Label>Overall Risk Score</Label>
                <p className="text-lg font-semibold">{(testResult.overallScore * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div>
              <Label>Detected Issues</Label>
              <div className="space-y-2 mt-2">
                {testResult.flags.length === 0 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    No issues detected
                  </div>
                ) : (
                  testResult.flags.map((flag, index) => {
                    const flagInfo = flagTypeOptions.find(opt => opt.value === flag.type);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          <div>
                            <Badge className={flagInfo?.color || 'bg-gray-100 text-gray-800'}>
                              {flagInfo?.label || flag.type}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{flag.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{(flag.confidence * 100).toFixed(1)}%</p>
                          <Badge variant={flag.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {flag.severity}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FilteringStatsPanel() {
  // Mock data - in real implementation, this would come from analytics
  const stats: FilteringStats = {
    totalProcessed: 12847,
    flaggedContent: 1289,
    averageConfidence: 0.847,
    processingTime: 67.3,
    accuracyRate: 0.923,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Processed"
          value={stats.totalProcessed.toLocaleString()}
          change="+12.5% this week"
          icon={<Activity className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Flagged Content"
          value={stats.flaggedContent.toLocaleString()}
          change="-2.3% this week"
          icon={<Shield className="h-4 w-4" />}
          trend="down"
        />
        <StatCard
          title="Avg Confidence"
          value={`${(stats.averageConfidence * 100).toFixed(1)}%`}
          change="+1.2% this week"
          icon={<Bot className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${(stats.accuracyRate * 100).toFixed(1)}%`}
          change="stable"
          icon={<CheckCircle className="h-4 w-4" />}
          trend="stable"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Performance by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flagTypeOptions.map((flagType) => {
              const processed = Math.floor(Math.random() * 1000) + 100;
              const accuracy = Math.random() * 0.2 + 0.8; // 80-100%
              
              return (
                <div key={flagType.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge className={flagType.color}>{flagType.label}</Badge>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {processed} processed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={accuracy * 100} className="w-24" />
                    <span className="text-sm font-medium">{(accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AutomatedFiltering({ className, config, onConfigUpdate }: AutomatedFilteringProps) {
  const { config: moderationConfig, updateConfig, isLoading, error } = useModerationConfig();
  const [activeTab, setActiveTab] = useState("overview");

  const handleConfigUpdate = useCallback((configUpdates: Partial<ModerationConfig>) => {
    updateConfig(configUpdates);
    onConfigUpdate?.(configUpdates);
  }, [updateConfig, onConfigUpdate]);

  const currentConfig = config || moderationConfig;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Configuration</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Not Available</h3>
          <p className="text-gray-600">Unable to load moderation configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automated Content Filtering</h2>
          <p className="text-muted-foreground">
            AI-powered content moderation and quality control system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={currentConfig.autoModerationEnabled ? "default" : "secondary"}>
            {currentConfig.autoModerationEnabled ? "Active" : "Inactive"}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FilteringStatsPanel />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <FilterConfigurationPanel 
            config={currentConfig} 
            onConfigUpdate={handleConfigUpdate}
          />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <FilterTestingPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FilteringStatsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
