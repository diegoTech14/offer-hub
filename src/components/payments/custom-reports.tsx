"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  FileText,
  Download,
  Calendar as CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Play,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinancialAnalytics } from "@/hooks/use-financial-analytics";
import { formatNumber } from "@/utils/financial-helpers";
import type {
  CustomReportsProps,
  CustomReport,
} from "@/types/financial-analytics.types";

export default function CustomReports({
  onReportCreate,
  onReportUpdate,
  onReportDelete,
  className = "",
}: CustomReportsProps) {
  const {
    customReports,
    loading,
    createCustomReport,
    updateCustomReport,
    deleteCustomReport,
    generateReport,
    exportData,
  } = useFinancialAnalytics();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // New report form state
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    type: "revenue" as CustomReport["type"],
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    },
    filters: {
      categories: [] as string[],
      userSegments: [] as string[],
      projectTypes: [] as string[],
    },
    metrics: [] as string[],
    schedule: {
      frequency: "monthly" as "monthly" | "daily" | "weekly" | "quarterly",
      recipients: [] as string[],
      format: "pdf" as "pdf" | "excel" | "csv",
    },
    isPublic: false,
  });

  // Available metrics by report type
  const availableMetrics = useMemo(() => {
    const metricsByType = {
      revenue: [
        "totalRevenue",
        "revenueGrowth",
        "revenueBySource",
        "topPerformers",
        "seasonalTrends",
        "forecasts",
      ],
      expenses: [
        "totalExpenses",
        "expensesByCategory",
        "costOptimization",
        "budgetComparison",
        "expenseGrowth",
      ],
      profitability: [
        "grossProfit",
        "netProfit",
        "profitMargin",
        "byProjectType",
        "byUserSegment",
        "trends",
      ],
      transactions: [
        "transactionCount",
        "successRate",
        "averageValue",
        "patterns",
        "processingTime",
      ],
      custom: [
        "totalRevenue",
        "totalExpenses",
        "netProfit",
        "transactionCount",
        "successRate",
        "revenueGrowth",
      ],
    };
    return metricsByType[newReport.type] || [];
  }, [newReport.type]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return customReports.filter((report) => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || report.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [customReports, searchTerm, filterType]);

  // Handle create report
  const handleCreateReport = async () => {
    try {
      const reportId = await createCustomReport({
        name: newReport.name,
        description: newReport.description,
        type: newReport.type,
        criteria: {
          dateRange: newReport.dateRange,
          filters: newReport.filters,
          metrics: newReport.metrics,
        },
        schedule: newReport.schedule,
        createdBy: "current_user", // In real app, get from auth context
        isPublic: newReport.isPublic,
      });

      onReportCreate?.(customReports.find((r) => r.id === reportId)!);
      setIsCreateDialogOpen(false);
      resetNewReport();
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  // Handle update report
  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    try {
      await updateCustomReport(selectedReport.id, newReport);
      onReportUpdate?.(selectedReport);
      setIsEditDialogOpen(false);
      setSelectedReport(null);
      resetNewReport();
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  // Handle delete report
  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteCustomReport(reportId);
      onReportDelete?.(reportId);
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  // Handle generate report
  const handleGenerateReport = async (reportId: string) => {
    try {
      await generateReport(reportId);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  // Reset form
  const resetNewReport = () => {
    setNewReport({
      name: "",
      description: "",
      type: "revenue",
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(),
      },
      filters: {
        categories: [],
        userSegments: [],
        projectTypes: [],
      },
      metrics: [],
      schedule: {
        frequency: "monthly" as "monthly" | "daily" | "weekly" | "quarterly",
        recipients: [],
        format: "pdf" as "pdf" | "excel" | "csv",
      },
      isPublic: false,
    });
  };

  // Load report for editing
  const loadReportForEdit = (report: CustomReport) => {
    setSelectedReport(report);
    setNewReport({
      name: report.name,
      description: report.description || "",
      type: report.type,
      dateRange: report.criteria.dateRange,
      filters: {
        categories: report.criteria.filters.categories || [],
        userSegments: report.criteria.filters.userSegments || [],
        projectTypes: report.criteria.filters.projectTypes || [],
      },
      metrics: report.criteria.metrics,
      schedule: report.schedule || {
        frequency: "monthly" as const,
        recipients: [],
        format: "pdf" as const,
      },
      isPublic: report.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const getReportIcon = (type: CustomReport["type"]) => {
    switch (type) {
      case "revenue":
        return <DollarSign className="h-4 w-4" />;
      case "expenses":
        return <TrendingUp className="h-4 w-4" />;
      case "profitability":
        return <Target className="h-4 w-4" />;
      case "transactions":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (report: CustomReport) => {
    if (report.schedule) {
      return <Badge variant="default">Scheduled</Badge>;
    }
    return <Badge variant="secondary">Manual</Badge>;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-gray-600">
            Create and manage customized financial reports
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
              <DialogDescription>
                Build a customized financial report with specific metrics and
                filters
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    value={newReport.name}
                    onChange={(e) =>
                      setNewReport((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Monthly Revenue Analysis"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Report Type</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) =>
                      setNewReport((prev) => ({
                        ...prev,
                        type: value as CustomReport["type"],
                        metrics: [], // Reset metrics when type changes
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Analysis</SelectItem>
                      <SelectItem value="expenses">Expense Analysis</SelectItem>
                      <SelectItem value="profitability">
                        Profitability Analysis
                      </SelectItem>
                      <SelectItem value="transactions">
                        Transaction Analysis
                      </SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed monthly revenue breakdown and analysis"
                  rows={3}
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newReport.dateRange.start, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newReport.dateRange.start}
                        onSelect={(date) =>
                          date &&
                          setNewReport((prev) => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: date },
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newReport.dateRange.end, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newReport.dateRange.end}
                        onSelect={(date) =>
                          date &&
                          setNewReport((prev) => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: date },
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Metrics Selection */}
              <div>
                <Label>Metrics to Include</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={newReport.metrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewReport((prev) => ({
                              ...prev,
                              metrics: [...prev.metrics, metric],
                            }));
                          } else {
                            setNewReport((prev) => ({
                              ...prev,
                              metrics: prev.metrics.filter((m) => m !== metric),
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={metric} className="text-sm">
                        {metric
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Scheduling (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={newReport.schedule.frequency}
                      onValueChange={(value) =>
                        setNewReport((prev) => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            frequency: value as any,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Format</Label>
                    <Select
                      value={newReport.schedule.format}
                      onValueChange={(value) =>
                        setNewReport((prev) => ({
                          ...prev,
                          schedule: { ...prev.schedule, format: value as any },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="public"
                      checked={newReport.isPublic}
                      onCheckedChange={(checked) =>
                        setNewReport((prev) => ({
                          ...prev,
                          isPublic: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="public">Make public</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={!newReport.name || newReport.metrics.length === 0}
              >
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-600">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="profitability">Profitability</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-600">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getReportIcon(report.type)}
                  <CardTitle className="text-lg dark:text-white">{report.name}</CardTitle>
                </div>
                {getStatusBadge(report)}
              </div>
              {report.description && (
                <CardDescription className="line-clamp-2 dark:text-gray-300">
                  {report.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="capitalize dark:text-white">{report.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Metrics:</span>
                  <span className="dark:text-white">{report.criteria.metrics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="dark:text-white">
                    {format(
                      new Date(report.generatedAt || new Date()),
                      "MMM dd"
                    )}
                  </span>
                </div>
                {report.schedule && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                    <span className="capitalize dark:text-white">
                      {report.schedule.frequency}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-600">
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadReportForEdit(report)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-600">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 dark:text-white">No reports found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm || filterType !== "all"
                ? "No reports match your current filters."
                : "Get started by creating your first custom report."}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Update your custom financial report settings
            </DialogDescription>
          </DialogHeader>

          {/* Same form content as create dialog */}
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Report Name</Label>
                <Input
                  id="edit-name"
                  value={newReport.name}
                  onChange={(e) =>
                    setNewReport((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Monthly Revenue Analysis"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Report Type</Label>
                <Select
                  value={newReport.type}
                  onValueChange={(value) =>
                    setNewReport((prev) => ({
                      ...prev,
                      type: value as CustomReport["type"],
                      metrics: [], // Reset metrics when type changes
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue Analysis</SelectItem>
                    <SelectItem value="expenses">Expense Analysis</SelectItem>
                    <SelectItem value="profitability">
                      Profitability Analysis
                    </SelectItem>
                    <SelectItem value="transactions">
                      Transaction Analysis
                    </SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={newReport.description}
                onChange={(e) =>
                  setNewReport((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Detailed monthly revenue breakdown and analysis"
                rows={3}
              />
            </div>

            {/* Metrics Selection */}
            <div>
              <Label>Metrics to Include</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableMetrics.map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${metric}`}
                      checked={newReport.metrics.includes(metric)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewReport((prev) => ({
                            ...prev,
                            metrics: [...prev.metrics, metric],
                          }));
                        } else {
                          setNewReport((prev) => ({
                            ...prev,
                            metrics: prev.metrics.filter((m) => m !== metric),
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${metric}`} className="text-sm">
                      {metric
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReport}
              disabled={!newReport.name || newReport.metrics.length === 0}
            >
              Update Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
