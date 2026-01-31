"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Smartphone,
  CreditCard,
  User,
  DollarSign,
  Activity,
  Eye,
  BarChart3,
  Zap,
  RefreshCw,
  Download,
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
  RiskAssessment as RiskAssessmentType,
  RiskFactor,
  RiskFactorType,
  MitigationStrategy,
  MitigationStrategyType,
  RiskLevel
} from '@/types/payment-security.types';
import { usePaymentSecurity } from '@/hooks/use-payment-security';
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RiskAssessmentProps {
  className?: string;
  transactionData?: any;
  userId?: string;
  onAssessmentComplete?: (assessment: RiskAssessmentType) => void;
  autoAssess?: boolean;
}

export function RiskAssessment({
  className = '',
  transactionData,
  userId,
  onAssessmentComplete,
  autoAssess = false
}: RiskAssessmentProps) {
  const { isLoading, error, assessRisk } = usePaymentSecurity();
  
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);

  // Risk level colors
  const riskLevelColors = {
    [RiskLevel.VERY_LOW]: '#10B981',
    [RiskLevel.LOW]: '#84CC16',
    [RiskLevel.MEDIUM]: '#F59E0B',
    [RiskLevel.HIGH]: '#EF4444',
    [RiskLevel.VERY_HIGH]: '#DC2626'
  };

  const riskFactorIcons = {
    [RiskFactorType.USER_HISTORY]: User,
    [RiskFactorType.TRANSACTION_AMOUNT]: DollarSign,
    [RiskFactorType.PAYMENT_METHOD]: CreditCard,
    [RiskFactorType.MERCHANT_REPUTATION]: Shield,
    [RiskFactorType.DEVICE_TRUST]: Smartphone,
    [RiskFactorType.LOCATION_ANALYSIS]: MapPin,
    [RiskFactorType.TIME_ANALYSIS]: Clock,
    [RiskFactorType.VELOCITY_PATTERNS]: Activity
  };

  const mitigationStrategyIcons = {
    [MitigationStrategyType.TWO_FACTOR_AUTH]: Shield,
    [MitigationStrategyType.PAYMENT_VERIFICATION]: CreditCard,
    [MitigationStrategyType.MANUAL_REVIEW]: Eye,
    [MitigationStrategyType.TRANSACTION_LIMIT]: DollarSign,
    [MitigationStrategyType.COOLING_PERIOD]: Clock,
    [MitigationStrategyType.DEVICE_VERIFICATION]: Smartphone,
    [MitigationStrategyType.BIOMETRIC_AUTH]: User
  };

  // Auto-assess when transaction data is provided
  useEffect(() => {
    if (autoAssess && transactionData && !riskAssessment) {
      handleAssessRisk();
    }
  }, [autoAssess, transactionData, riskAssessment]);

  const handleAssessRisk = async () => {
    if (!transactionData) {
      console.warn('No transaction data provided for risk assessment');
      return;
    }

    setIsAnalyzing(true);
    try {
      const assessment = await assessRisk(transactionData);
      setRiskAssessment(assessment);
      onAssessmentComplete?.(assessment);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelText = (score: number): string => {
    if (score >= 80) return 'Very High Risk';
    if (score >= 60) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Very Low Risk';
  };

  const getRiskLevelFromScore = (score: number): RiskLevel => {
    if (score >= 80) return RiskLevel.VERY_HIGH;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 40) return RiskLevel.MEDIUM;
    if (score >= 20) return RiskLevel.LOW;
    return RiskLevel.VERY_LOW;
  };

  const formatFactorName = (factor: RiskFactorType): string => {
    return factor.toString().replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStrategyName = (strategy: MitigationStrategyType): string => {
    return strategy.toString().replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const preparePieChartData = () => {
    if (!riskAssessment) return [];
    
    return riskAssessment.riskFactors.map((factor, index) => ({
      name: formatFactorName(factor.factor),
      value: factor.score * factor.weight,
      fill: `hsl(${index * 60}, 70%, 50%)`
    }));
  };

  const prepareBarChartData = () => {
    if (!riskAssessment) return [];
    
    return riskAssessment.riskFactors.map(factor => ({
      name: formatFactorName(factor.factor).substring(0, 10) + '...',
      score: factor.score,
      weight: factor.weight * 100,
      weightedScore: factor.score * factor.weight
    }));
  };

  const prepareRadialData = () => {
    if (!riskAssessment) return [];
    
    return [{
      name: 'Risk Score',
      value: riskAssessment.overallRiskScore,
      fill: riskLevelColors[getRiskLevelFromScore(riskAssessment.overallRiskScore)]
    }];
  };

  if (isLoading || isAnalyzing) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Analyzing transaction risk...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Risk Assessment Error</AlertTitle>
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
          <h2 className="text-2xl font-bold">Risk Assessment</h2>
        </div>
        <div className="flex items-center space-x-2">
          {!riskAssessment && (
            <Button 
              onClick={handleAssessRisk} 
              disabled={!transactionData}
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Assess Risk</span>
            </Button>
          )}
          {riskAssessment && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleAssessRisk}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-assess
              </Button>
            </>
          )}
        </div>
      </div>

      {!riskAssessment && !transactionData && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Transaction Data</h3>
            <p className="text-muted-foreground">
              Provide transaction data to perform risk assessment
            </p>
          </CardContent>
        </Card>
      )}

      {riskAssessment && (
        <>
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ 
                  color: riskLevelColors[getRiskLevelFromScore(riskAssessment.overallRiskScore)] 
                }}>
                  {riskAssessment.overallRiskScore}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  {getRiskLevelText(riskAssessment.overallRiskScore)}
                </p>
                <Progress 
                  value={riskAssessment.overallRiskScore} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Factors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskAssessment.riskFactors.length}</div>
                <p className="text-xs text-muted-foreground">
                  Factors analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mitigation Strategies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskAssessment.mitigationStrategies.length}</div>
                <p className="text-xs text-muted-foreground">
                  Recommended actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manual Review</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {riskAssessment.requiresManualReview ? (
                    <span className="text-red-600">Required</span>
                  ) : (
                    <span className="text-green-600">Not Required</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on risk score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="factors">Risk Factors</TabsTrigger>
              <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Score Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Score Breakdown</CardTitle>
                    <CardDescription>Contribution of each risk factor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={preparePieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {preparePieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Overall Risk Gauge */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Level Gauge</CardTitle>
                    <CardDescription>Overall transaction risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="30%" 
                        outerRadius="80%" 
                        data={prepareRadialData()}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar dataKey="value" fill={prepareRadialData()[0]?.fill} />
                        <text 
                          x="50%" 
                          y="70%" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className="text-2xl font-bold"
                          fill={prepareRadialData()[0]?.fill}
                        >
                          {riskAssessment.overallRiskScore}
                        </text>
                        <text 
                          x="50%" 
                          y="80%" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className="text-sm text-muted-foreground"
                        >
                          Risk Score
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Risk Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Factors Analysis</CardTitle>
                    <CardDescription>Detailed breakdown by factor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prepareBarChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#8884d8" name="Risk Score" />
                        <Bar dataKey="weightedScore" fill="#82ca9d" name="Weighted Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Assessment Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
                    <CardDescription>Metadata and timing information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Transaction ID</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {riskAssessment.transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">User ID</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {riskAssessment.userId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Assessment Date</span>
                        <span className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'medium'
                          }).format(riskAssessment.assessmentDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Valid Until</span>
                        <span className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'medium'
                          }).format(riskAssessment.validUntil)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Assessed By</span>
                        <Badge variant="outline">{riskAssessment.assessedBy}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="factors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of each risk factor</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factor</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Weighted Score</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskAssessment.riskFactors.map((factor, index) => {
                        const IconComponent = riskFactorIcons[factor.factor] || Activity;
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">
                                  {formatFactorName(factor.factor)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{factor.score}</span>
                                <Progress value={factor.score} className="w-16" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {(factor.weight * 100).toFixed(0)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {(factor.score * factor.weight).toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm text-muted-foreground truncate">
                                {factor.description}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedFactor(factor)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {formatFactorName(factor.factor)} Details
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed analysis of this risk factor
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold">Description</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {factor.description}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Data Points</h4>
                                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                        {JSON.stringify(factor.dataPoints, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitigation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mitigation Strategies</CardTitle>
                  <CardDescription>Recommended actions to reduce risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {riskAssessment.mitigationStrategies.map((strategy, index) => {
                      const IconComponent = mitigationStrategyIcons[strategy.strategy] || Shield;
                      return (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg">
                                  {formatStrategyName(strategy.strategy)}
                                </CardTitle>
                              </div>
                              <Badge variant="outline">
                                Priority {strategy.priority}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              {strategy.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Risk Reduction</span>
                                <span className="text-sm font-semibold text-green-600">
                                  -{strategy.estimatedReduction}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Automatable</span>
                                <Badge variant={strategy.automatable ? "default" : "secondary"}>
                                  {strategy.automatable ? "Yes" : "No"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Assessment Data</CardTitle>
                  <CardDescription>Complete assessment details in JSON format</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(riskAssessment, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}