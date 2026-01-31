/**
 * @fileoverview Manual content review workflows component
 * @author Offer Hub Team
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  User,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useContentModeration } from "@/hooks/use-content-moderation";
import {
  ContentItem,
  ModerationAction,
  ModerationStatus,
  ContentType,
  ContentPriority,
  ManualReviewProps,
  AutomatedFlag,
} from "@/types/moderation.types";

interface ReviewDialogData {
  content: ContentItem | null;
  isOpen: boolean;
}

interface BulkAction {
  action: ModerationAction;
  reason: string;
  selectedIds: string[];
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  flagged: { label: "Flagged", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  removed: { label: "Removed", color: "bg-red-100 text-red-800", icon: XCircle },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Eye },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Critical", color: "bg-red-100 text-red-800" },
};

const contentTypeConfig = {
  project: { label: "Project", icon: FileText },
  profile: { label: "Profile", icon: User },
  review: { label: "Review", icon: Eye },
  message: { label: "Message", icon: FileText },
  service: { label: "Service", icon: Zap },
  comment: { label: "Comment", icon: FileText },
  image: { label: "Image", icon: FileText },
  document: { label: "Document", icon: FileText },
};

function ContentCard({ 
  content, 
  isSelected, 
  onSelect, 
  onReview 
}: {
  content: ContentItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onReview: (content: ContentItem) => void;
}) {
  const statusInfo = statusConfig[content.status];
  const priorityInfo = priorityConfig[content.priority];
  const typeInfo = contentTypeConfig[content.type];
  const StatusIcon = statusInfo.icon;
  const TypeIcon = typeInfo.icon;

  const timeAgo = useMemo(() => {
    const now = new Date();
    const created = new Date(content.createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  }, [content.createdAt]);

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(content.id, checked as boolean)}
            />
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {typeInfo.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={priorityInfo.color}>
              {priorityInfo.label}
            </Badge>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {content.title && (
            <h4 className="font-medium text-sm line-clamp-1">{content.title}</h4>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.content}
          </p>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>By {content.authorName}</span>
            <span>{timeAgo}</span>
            {content.flagCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {content.flagCount} flags
              </Badge>
            )}
            {content.qualityScore && (
              <Badge variant="outline" className="text-xs">
                Quality: {content.qualityScore}/10
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onReview(content)}
            className="h-6 px-2"
          >
            <Eye className="h-3 w-3 mr-1" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewDialog({ 
  data, 
  onClose, 
  onModerate 
}: {
  data: ReviewDialogData;
  onClose: () => void;
  onModerate: (contentId: string, action: ModerationAction, reason: string) => Promise<void>;
}) {
  const [action, setAction] = useState<ModerationAction | "">("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!data.content || !action || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onModerate(data.content.id, action as ModerationAction, reason);
      onClose();
    } catch (error) {
      console.error('Moderation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [data.content, action, reason, onModerate, onClose]);

  const resetForm = useCallback(() => {
    setAction("");
    setReason("");
  }, []);

  useEffect(() => {
    if (data.isOpen) {
      resetForm();
    }
  }, [data.isOpen, resetForm]);

  if (!data.content) return null;

  return (
    <Dialog open={data.isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Review Content</span>
          </DialogTitle>
          <DialogDescription>
            Review and moderate the following content item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm">{contentTypeConfig[data.content.type].label}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusConfig[data.content.status].color}>
                    {statusConfig[data.content.status].label}
                  </Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={priorityConfig[data.content.priority].color}>
                    {priorityConfig[data.content.priority].label}
                  </Badge>
                </div>
                <div>
                  <Label>Quality Score</Label>
                  <p className="text-sm">
                    {data.content.qualityScore ? `${data.content.qualityScore}/10` : "Not scored"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Author</Label>
                <p className="text-sm">{data.content.authorName} ({data.content.authorEmail})</p>
              </div>

              {data.content.title && (
                <div>
                  <Label>Title</Label>
                  <p className="text-sm">{data.content.title}</p>
                </div>
              )}

              <div>
                <Label>Content</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                  {data.content.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label>Created</Label>
                  <p>{new Date(data.content.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{new Date(data.content.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation History */}
          {data.content.flagCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flags & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="destructive">
                    {data.content.flagCount} flags
                  </Badge>
                  <Badge variant="outline">
                    {data.content.reportCount} reports
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moderation Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Moderation Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="action">Action *</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="flag">Flag for Review</SelectItem>
                    <SelectItem value="remove">Remove</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="suspend">Suspend Author</SelectItem>
                    <SelectItem value="ban">Ban Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a detailed reason for this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!action || !reason.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Moderation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilterPanel({ 
  onFiltersChange 
}: {
  onFiltersChange: (filters: any) => void;
}) {
  const [status, setStatus] = useState<ModerationStatus | "">("");
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [priority, setPriority] = useState<ContentPriority | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const applyFilters = useCallback(() => {
    onFiltersChange({
      status: status || undefined,
      contentType: contentType || undefined,
      priority: priority || undefined,
      searchTerm: searchTerm || undefined,
    });
  }, [status, contentType, priority, searchTerm, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setStatus("");
    setContentType("");
    setPriority("");
    setSearchTerm("");
    onFiltersChange({});
  }, [onFiltersChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {Object.entries(contentTypeConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              {Object.entries(priorityConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button onClick={applyFilters} size="sm" className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm" className="flex-1">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManualReview({ 
  className, 
  moderatorId, 
  specialization 
}: ManualReviewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({
    content: null,
    isOpen: false,
  });
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<Partial<BulkAction>>({});

  const {
    content,
    isLoading,
    error,
    moderateContent,
    updateFilters,
    refreshData,
  } = useContentModeration({
    filters: {
      status: 'pending',
      ...(specialization && { contentType: specialization[0] }),
    },
  });

  const handleSelectContent = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedIds(selected ? content.map(item => item.id) : []);
  }, [content]);

  const handleReviewContent = useCallback((contentItem: ContentItem) => {
    setReviewDialog({
      content: contentItem,
      isOpen: true,
    });
  }, []);

  const handleCloseReviewDialog = useCallback(() => {
    setReviewDialog({
      content: null,
      isOpen: false,
    });
  }, []);

  const handleBulkAction = useCallback(async () => {
    if (!bulkAction.action || !bulkAction.reason || selectedIds.length === 0) return;

    try {
      // In a real implementation, this would call a bulk moderation API
      await Promise.all(
        selectedIds.map(id => moderateContent(id, bulkAction.action!, bulkAction.reason!))
      );
      
      setSelectedIds([]);
      setBulkActionDialog(false);
      setBulkAction({});
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [bulkAction, selectedIds, moderateContent]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Content</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData}>
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
          <h2 className="text-2xl font-bold">Manual Content Review</h2>
          <p className="text-muted-foreground">
            Review and moderate content requiring human attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {content.length} items pending
          </Badge>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel onFiltersChange={updateFilters} />
        </div>

        {/* Content List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedIds.length} items selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkActionDialog(true)}
                    >
                      Bulk Action
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedIds.length === content.length && content.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm">Select all</Label>
          </div>

          {/* Content Items */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : content.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No content pending review at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  isSelected={selectedIds.includes(item.id)}
                  onSelect={handleSelectContent}
                  onReview={handleReviewContent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        data={reviewDialog}
        onClose={handleCloseReviewDialog}
        onModerate={moderateContent}
      />

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onOpenChange={setBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Moderation Action</DialogTitle>
            <DialogDescription>
              Apply an action to {selectedIds.length} selected items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-action">Action</Label>
              <Select 
                value={bulkAction.action || ""} 
                onValueChange={(value) => setBulkAction(prev => ({ ...prev, action: value as ModerationAction }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve All</SelectItem>
                  <SelectItem value="reject">Reject All</SelectItem>
                  <SelectItem value="flag">Flag All</SelectItem>
                  <SelectItem value="remove">Remove All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulk-reason">Reason</Label>
              <Textarea
                id="bulk-reason"
                placeholder="Provide a reason for this bulk action..."
                value={bulkAction.reason || ""}
                onChange={(e) => setBulkAction(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              disabled={!bulkAction.action || !bulkAction.reason}
            >
              Apply to {selectedIds.length} items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
