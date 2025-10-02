"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  Calendar,
  Users,
  Activity,
} from "lucide-react";

// Import our new components
import FinancialDashboard from "@/components/payments/financial-dashboard";
import TransactionAnalytics from "@/components/payments/transaction-analytics";
import RevenueAnalysis from "@/components/payments/revenue-analysis";
import CustomReports from "@/components/payments/custom-reports";

export default function FinancialDashboardDemo() {
  const [activeDemo, setActiveDemo] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Financial Dashboard & Analytics Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the comprehensive financial management system with
            advanced analytics, customizable reports, and real-time insights.
            This demo showcases all the features implemented for the Offer Hub
            platform.
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-8 w-8 mx-auto text-blue-600" />
              <CardTitle className="text-lg">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Comprehensive KPIs, performance indicators, and real-time
                financial metrics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Activity className="h-8 w-8 mx-auto text-green-600" />
              <CardTitle className="text-lg">Transaction Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Pattern detection, success rates, and detailed transaction
                analysis
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-8 w-8 mx-auto text-purple-600" />
              <CardTitle className="text-lg">Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Revenue forecasting, optimization insights, and growth analytics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 mx-auto text-orange-600" />
              <CardTitle className="text-lg">Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Customizable reporting with scheduling and automated generation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Explore each component of the financial analytics system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeDemo}
              onValueChange={setActiveDemo}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Transactions</span>
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Revenue</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="dashboard" className="space-y-6">
                  <div className="border rounded-lg p-1 bg-white">
                    <FinancialDashboard viewMode="desktop" className="p-6" />
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6">
                  <div className="border rounded-lg p-1 bg-white">
                    <TransactionAnalytics
                      showPatterns={true}
                      showForecasts={true}
                      className="p-6"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6">
                  <div className="border rounded-lg p-1 bg-white">
                    <RevenueAnalysis
                      timeframe="30d"
                      showOptimization={true}
                      showForecasts={true}
                      className="p-6"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  <div className="border rounded-lg p-1 bg-white">
                    <CustomReports
                      className="p-6"
                      onReportCreate={(report) =>
                        console.log("Report created:", report)
                      }
                      onReportUpdate={(report) =>
                        console.log("Report updated:", report)
                      }
                      onReportDelete={(reportId) =>
                        console.log("Report deleted:", reportId)
                      }
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Implementation Features</CardTitle>
            <CardDescription>
              Key features and capabilities of the financial analytics system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Financial Overview
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time KPI tracking</li>
                  <li>• Performance indicators with targets</li>
                  <li>• Profit margin analysis</li>
                  <li>• Cash flow monitoring</li>
                  <li>• Automated alerts and notifications</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Transaction Analytics
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AI-powered pattern detection</li>
                  <li>• Success rate monitoring</li>
                  <li>• Processing time analysis</li>
                  <li>• Failure reason tracking</li>
                  <li>• Hourly activity patterns</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Revenue Analysis
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Revenue source breakdown</li>
                  <li>• Growth forecasting</li>
                  <li>• Seasonal trend analysis</li>
                  <li>• Optimization recommendations</li>
                  <li>• Top performer identification</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-600" />
                  Profitability Metrics
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Gross and net profit analysis</li>
                  <li>• Margin tracking by segment</li>
                  <li>• Project type profitability</li>
                  <li>• User segment analysis</li>
                  <li>• EBITDA calculations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  Custom Reports
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Drag-and-drop report builder</li>
                  <li>• Automated scheduling</li>
                  <li>• Multiple export formats</li>
                  <li>• Custom filters and metrics</li>
                  <li>• Report sharing and collaboration</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Data Security & Compliance
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Role-based access control</li>
                  <li>• Data encryption</li>
                  <li>• Compliance reporting</li>
                  <li>• Audit trails</li>
                  <li>• GDPR compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Technologies and patterns used in this implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Frontend Technologies</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Next.js 14</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">Shadcn/ui</Badge>
                  <Badge variant="outline">Recharts</Badge>
                  <Badge variant="outline">React Hooks</Badge>
                  <Badge variant="outline">date-fns</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Architecture Patterns</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Custom Hooks</Badge>
                  <Badge variant="outline">Component Composition</Badge>
                  <Badge variant="outline">Type Safety</Badge>
                  <Badge variant="outline">Responsive Design</Badge>
                  <Badge variant="outline">Performance Optimization</Badge>
                  <Badge variant="outline">Accessibility</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-600">
            This demo showcases the complete financial dashboard and analytics
            system implemented for the Offer Hub platform. All components are
            production-ready and follow best practices for scalability,
            performance, and user experience.
          </p>
          <div className="mt-4 space-x-4">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Demo
            </Button>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Request Implementation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
