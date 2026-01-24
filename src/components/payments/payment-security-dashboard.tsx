"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Eye,
  BarChart3,
  Settings,
  Bell,
  Lock,
  Activity
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
import { SecurityMonitor } from './security-monitor';
import { RiskAssessment } from './risk-assessment';
import { SecurityAnalytics } from './security-analytics';
import { usePaymentSecurity } from '@/hooks/use-payment-security';
import {
  RiskLevel,
  SecuritySeverity,
  SecurityEventType
} from '@/types/payment-security.types';

interface PaymentSecurityDashboardProps {
  className?: string;
  userId?: string;
}

export function PaymentSecurityDashboard({
  className = '',
  userId
}: PaymentSecurityDashboardProps) {
  const {
    isLoading,
    error,
    assessRisk,
    detectFraud,
    reportSecurityEvent,
    getSecurityMetrics,
    getSecurityAlerts
  } = usePaymentSecurity();

  const [activeTab, setActiveTab] = useState('overview');
  const [demoTransaction, setDemoTransaction] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState({
    overallStatus: 'secure',
    activeThreats: 0,
    systemHealth: 'good'
  });

  // Demo transaction data for testing
  const createDemoTransaction = (riskLevel: 'low' | 'medium' | 'high') => {
    const transactions = {
      low: {
        id: 'demo_low_001',
        userId: userId || 'demo_user_001',
        amount: 50.00,
        merchantCategory: 'grocery',
        paymentMethod: 'credit_card',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(),
        isInternational: false,
        isFirstTimeVendor: false,
        isHighRiskCategory: false,
        isKnownDevice: true,
        transactionsLast24h: 2,
        amountLast24h: 75.00,
        deviceTrustScore: 85,
        distanceFromUsualLocation: 5,
        isVPN: false
      },
      medium: {
        id: 'demo_medium_001',
        userId: userId || 'demo_user_001',
        amount: 2500.00,
        merchantCategory: 'electronics',
        paymentMethod: 'credit_card',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(),
        isInternational: true,
        isFirstTimeVendor: true,
        isHighRiskCategory: false,
        isKnownDevice: false,
        transactionsLast24h: 8,
        amountLast24h: 5000.00,
        deviceTrustScore: 45,
        distanceFromUsualLocation: 1500,
        isVPN: false
      },
      high: {
        id: 'demo_high_001',
        userId: userId || 'demo_user_001',
        amount: 15000.00,
        merchantCategory: 'cryptocurrency',
        paymentMethod: 'prepaid_card',
        ipAddress: '185.243.115.234',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: new Date(),
        isInternational: true,
        isFirstTimeVendor: true,
        isHighRiskCategory: true,
        isKnownDevice: false,
        transactionsLast24h: 25,
        amountLast24h: 50000.00,
        deviceTrustScore: 15,
        distanceFromUsualLocation: 8000,
        isVPN: true
      }
    };

    setDemoTransaction(transactions[riskLevel]);
  };

  const handleDemoSecurityEvent = async (severity: SecuritySeverity) => {
    try {
      await reportSecurityEvent({
        eventType: SecurityEventType.SUSPICIOUS_TRANSACTION,
        severity,
        description: `Demo security event - ${severity} severity`,
        userId: userId || 'demo_user',
        metadata: {
          source: 'demo',
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create demo security event:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'danger': return <Shield className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Status Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Security Center</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive fraud prevention and security monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getStatusColor(securityStatus.overallStatus)}`}>
              {getStatusIcon(securityStatus.overallStatus)}
              <span className="font-semibold capitalize">{securityStatus.overallStatus}</span>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {securityStatus.activeThreats} Active Threats
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Actions & Demo</span>
          </CardTitle>
          <CardDescription>
            Test security features and explore fraud detection capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Demo Transactions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Demo Risk Assessment</h4>
              <div className="space-y-2">
                <Button 
                  onClick={() => createDemoTransaction('low')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Low Risk Transaction
                </Button>
                <Button 
                  onClick={() => createDemoTransaction('medium')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  Medium Risk Transaction
                </Button>
                <Button 
                  onClick={() => createDemoTransaction('high')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Shield className="h-4 w-4 mr-2 text-red-500" />
                  High Risk Transaction
                </Button>
              </div>
            </div>

            {/* Demo Security Events */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Demo Security Events</h4>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleDemoSecurityEvent(SecuritySeverity.LOW)}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2 text-blue-500" />
                  Low Severity Alert
                </Button>
                <Button 
                  onClick={() => handleDemoSecurityEvent(SecuritySeverity.MEDIUM)}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2 text-yellow-500" />
                  Medium Severity Alert
                </Button>
                <Button 
                  onClick={() => handleDemoSecurityEvent(SecuritySeverity.HIGH)}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2 text-red-500" />
                  High Severity Alert
                </Button>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Fraud Detection</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Risk Assessment</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Alert System</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Security Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Risk Assessment</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Security Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Real-time security status and key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <div className="text-sm text-green-700">Detection Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">125ms</div>
                    <div className="text-sm text-blue-700">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">23</div>
                    <div className="text-sm text-red-700">Blocked Today</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <div className="text-sm text-yellow-700">False Positives</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
                <CardDescription>Security events and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transactions Processed</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Events</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fraud Attempts</span>
                    <span className="font-semibold text-red-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manual Reviews</span>
                    <span className="font-semibold text-orange-600">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Fraud Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced machine learning algorithms analyze transaction patterns in real-time to detect fraudulent activities.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• ML-based pattern recognition</li>
                  <li>• Real-time risk scoring</li>
                  <li>• Behavioral analysis</li>
                  <li>• Velocity checks</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Security Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  24/7 monitoring of all payment activities with instant alerts and automated response capabilities.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Real-time alerts</li>
                  <li>• System health monitoring</li>
                  <li>• Incident management</li>
                  <li>• Audit logging</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Analytics & Reporting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive analytics and reporting for security metrics, trends, and compliance requirements.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Performance metrics</li>
                  <li>• Trend analysis</li>
                  <li>• Compliance reporting</li>
                  <li>• Custom dashboards</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <SecurityMonitor userId={userId} autoRefresh={true} />
        </TabsContent>

        <TabsContent value="assessment">
          <RiskAssessment 
            transactionData={demoTransaction}
            userId={userId}
            autoAssess={!!demoTransaction}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SecurityAnalytics userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security System Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}