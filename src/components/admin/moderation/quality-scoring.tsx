/**
 * @fileoverview Content quality scoring and metrics component
 * @author Offer Hub Team
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart3,
  Brain,
  CheckCircle,
  FileText,
  LineChart,
  RefreshCw,
  Settings,
  Star,
  TrendingDown,
  TrendingUp,
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useQualityScoring } from "@/hooks/use-content-moderation";
import {
  QualityScoringProps,
  QualityMetrics,
  QualityScore,
  QualityFactor,
  ContentType,
  QualityAnalytics,
  ScoreDistribution,
  QualityTrend,
} from "@/types/moderation.types";

interface QualityTestResult {
  contentId: string;
  metrics: QualityMetrics;
  processingTime: number;
}

interface QualityConfig {
  contentWeight: number;
  relevanceWeight: number;
  clarityWeight: number;
  completenessWeight: number;
  originalityWeight: number;
  minQualityThreshold: QualityScore;
}

const contentTypeOptions: { value: ContentType; label: string }[] = [
  { value: 'project', label: 'Projects' },
  { value: 'profile', label: 'Profiles' },
  { value: 'review', label: 'Reviews' },
  { value: 'service', label: 'Services' },
  { value: 'comment', label: 'Comments' },
];

const qualityFactorDescriptions = {
  content: "Overall content quality and depth",
  relevance: "Relevance to platform and category",
  clarity: "Clarity and readability of content",
  completeness: "Completeness of required information",
  originality: "Originality and uniqueness of content",
};

const scoreColors = {
  1: "#ef4444", // red-500
  2: "#f97316", // orange-500
  3: "#eab308", // yellow-500
  4: "#eab308", // yellow-500
  5: "#84cc16", // lime-500
  6: "#84cc16", // lime-500
  7: "#22c55e", // green-500
  8: "#22c55e", // green-500
  9: "#10b981", // emerald-500
  10: "#059669", // emerald-600
};

// Mock data for analytics
const mockAnalytics: QualityAnalytics = {
  averageScore: 7.2,
  distribution: [
    { score: 1, count: 12, percentage: 1.2 },
    { score: 2, count: 23, percentage: 2.3 },
    { score: 3, count: 45, percentage: 4.5 },
    { score: 4, count: 67, percentage: 6.7 },
    { score: 5, count: 89, percentage: 8.9 },
    { score: 6, count: 156, percentage: 15.6 },
    { score: 7, count: 234, percentage: 23.4 },
    { score: 8, count: 198, percentage: 19.8 },
    { score: 9, count: 112, percentage: 11.2 },
    { score: 10, count: 64, percentage: 6.4 },
  ],
  improvementTrends: [
    { contentType: 'project', trend: 'improving', changePercentage: 12.5, period: 'Last 30 days' },
    { contentType: 'profile', trend: 'stable', changePercentage: 0.2, period: 'Last 30 days' },
    { contentType: 'review', trend: 'declining', changePercentage: -3.1, period: 'Last 30 days' },
    { contentType: 'service', trend: 'improving', changePercentage: 8.7, period: 'Last 30 days' },
  ],
  topIssues: [
    'Insufficient detail in project descriptions',
    'Poor grammar and spelling',
    'Irrelevant or misleading content',
    'Incomplete profile information',
    'Low-effort reviews and comments',
  ],
};

const mockTrendData = [
  { date: '2024-01-01', avgScore: 6.8, projectScore: 7.2, profileScore: 6.5, reviewScore: 7.0 },
  { date: '2024-01-08', avgScore: 7.0, projectScore: 7.3, profileScore: 6.7, reviewScore: 7.1 },
  { date: '2024-01-15', avgScore: 7.1, projectScore: 7.5, profileScore: 6.8, reviewScore: 6.9 },
  { date: '2024-01-22', avgScore: 7.3, projectScore: 7.6, profileScore: 7.0, reviewScore: 7.2 },
  { date: '2024-01-29', avgScore: 7.2, projectScore: 7.4, profileScore: 6.9, reviewScore: 7.3 },
];

function QualityScoreCard({ 
  title, 
  score, 
  trend, 
  trendValue 
}: {
  title: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}) {
  const scoreColor = scoreColors[Math.round(score) as QualityScore];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : LineChart;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold" style={{ color: scoreColor }}>
              {score.toFixed(1)}/10
            </p>
            {trendValue && (
              <p className={cn("text-xs flex items-center mt-1", trendColor)}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {trendValue}
              </p>
            )}
          </div>
          <div className="h-8 w-8">
            <Star className="h-8 w-8" style={{ color: scoreColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QualityFactorCard({ 
  factor, 
  onWeightChange 
}: {
  factor: QualityFactor & { weight: number };
  onWeightChange: (weight: number) => void;
}) {
  const scoreColor = scoreColors[Math.round(factor.score) as QualityScore];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{factor.name}</h4>
            <Badge 
              variant="outline" 
              style={{ 
                borderColor: scoreColor, 
                color: scoreColor 
              }}
            >
              {factor.score.toFixed(1)}
            </Badge>
          </div>
          
          <Progress 
            value={factor.score * 10} 
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${scoreColor} ${factor.score * 10}%, #e5e7eb ${factor.score * 10}%)`
            }}
          />
          
          <p className="text-xs text-muted-foreground">{factor.description}</p>
          
          <div>
            <Label className="text-xs">Weight: {(factor.weight * 100).toFixed(0)}%</Label>
            <Slider
              value={[factor.weight * 100]}
              onValueChange={([value]) => onWeightChange(value / 100)}
              max={100}
              min={0}
              step={5}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QualityTestPanel() {
  const [testContent, setTestContent] = useState("");
  const [testContentType, setTestContentType] = useState<ContentType>("project");
  const [testResult, setTestResult] = useState<QualityTestResult | null>(null);
  
  const { calculateQualityScore, isCalculating, error } = useQualityScoring();

  const handleRunTest = useCallback(async () => {
    if (!testContent.trim()) return;

    try {
      const metrics = await calculateQualityScore(
        `test-${Date.now()}`,
        testContent,
        testContentType
      );
      
      setTestResult({
        contentId: `test-${Date.now()}`,
        metrics,
        processingTime: Math.random() * 200 + 100, // Mock processing time
      });
    } catch (err) {
      console.error('Quality scoring failed:', err);
    }
  }, [testContent, testContentType, calculateQualityScore]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Test Quality Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-content">Content to Analyze</Label>
            <Textarea
              id="test-content"
              placeholder="Enter content to test quality scoring..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={6}
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
            disabled={!testContent.trim() || isCalculating}
            className="w-full"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Quality
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
              <CheckCircle className="h-5 w-5 mr-2" />
              Quality Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QualityScoreCard
                title="Overall Quality"
                score={testResult.metrics.overall}
              />
              <div>
                <Label>Processing Time</Label>
                <p className="text-lg font-semibold">{testResult.processingTime.toFixed(1)}ms</p>
              </div>
              <div>
                <Label>Last Calculated</Label>
                <p className="text-sm">{new Date(testResult.metrics.lastCalculated).toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Quality Factors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResult.metrics.factors.map((factor, index) => (
                  <QualityFactorCard
                    key={index}
                    factor={{ ...factor, weight: 0.2 }} // Mock weight
                    onWeightChange={() => {}} // No-op for test results
                  />
                ))}
              </div>
            </div>

            {testResult.metrics.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Improvement Suggestions</h4>
                <div className="space-y-2">
                  {testResult.metrics.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-md">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QualityAnalyticsPanel({ analytics }: { analytics: QualityAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QualityScoreCard
          title="Platform Average"
          score={analytics.averageScore}
          trend="up"
          trendValue="+0.3 this month"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scored</p>
                <p className="text-2xl font-bold">
                  {analytics.distribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Quality</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.distribution
                    .filter(item => item.score >= 8)
                    .reduce((sum, item) => sum + item.percentage, 0)
                    .toFixed(1)}%
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.distribution
                    .filter(item => item.score <= 5)
                    .reduce((sum, item) => sum + item.percentage, 0)
                    .toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Trends by Content Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.improvementTrends.map((trend) => {
                const TrendIcon = trend.trend === 'improving' ? TrendingUp : 
                                trend.trend === 'declining' ? TrendingDown : LineChart;
                const trendColor = trend.trend === 'improving' ? 'text-green-500' : 
                                 trend.trend === 'declining' ? 'text-red-500' : 'text-gray-500';
                
                return (
                  <div key={trend.contentType} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {contentTypeOptions.find(opt => opt.value === trend.contentType)?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{trend.period}</span>
                    </div>
                    <div className={cn("flex items-center space-x-2", trendColor)}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" name="Overall Average" strokeWidth={2} />
              <Line type="monotone" dataKey="projectScore" stroke="#10b981" name="Projects" />
              <Line type="monotone" dataKey="profileScore" stroke="#f59e0b" name="Profiles" />
              <Line type="monotone" dataKey="reviewScore" stroke="#ef4444" name="Reviews" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Top Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topIssues.map((issue, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <Badge variant="outline">{index + 1}</Badge>
                <p className="text-sm flex-1">{issue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QualityConfigPanel() {
  const [config, setConfig] = useState<QualityConfig>({
    contentWeight: 0.25,
    relevanceWeight: 0.20,
    clarityWeight: 0.20,
    completenessWeight: 0.20,
    originalityWeight: 0.15,
    minQualityThreshold: 6,
  });

  const handleWeightChange = useCallback((factor: keyof QualityConfig, weight: number) => {
    setConfig(prev => ({ ...prev, [factor]: weight }));
  }, []);

  const totalWeight = useMemo(() => {
    return config.contentWeight + config.relevanceWeight + config.clarityWeight + 
           config.completenessWeight + config.originalityWeight;
  }, [config]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Quality Scoring Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Quality Factors Weights</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust the importance of each quality factor (Total: {(totalWeight * 100).toFixed(0)}%)
            </p>
            
            <div className="space-y-4">
              {Object.entries(qualityFactorDescriptions).map(([key, description]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="capitalize">{key}</Label>
                    <span className="text-sm font-medium">
                      {(config[`${key}Weight` as keyof QualityConfig] as number * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[(config[`${key}Weight` as keyof QualityConfig] as number) * 100]}
                    onValueChange={([value]) => handleWeightChange(`${key}Weight` as keyof QualityConfig, value / 100)}
                    max={50}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
              ))}
            </div>

            {Math.abs(totalWeight - 1) > 0.01 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Weights should total 100%. Currently: {(totalWeight * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label>Minimum Quality Threshold: {config.minQualityThreshold}/10</Label>
            <Slider
              value={[config.minQualityThreshold]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, minQualityThreshold: value as QualityScore }))}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Content below this threshold will be flagged for review
            </p>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" className="flex-1">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QualityScoring({ 
  className, 
  contentTypes, 
  showTrends = true 
}: QualityScoringProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Quality Scoring</h2>
          <p className="text-muted-foreground">
            Analyze and monitor content quality across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            AI-Powered
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <QualityAnalyticsPanel analytics={mockAnalytics} />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <QualityTestPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <QualityAnalyticsPanel analytics={mockAnalytics} />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <QualityConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
