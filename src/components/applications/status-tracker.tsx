/**
 * Status Tracker Component
 * Main container for application status tracking and management
 */

'use client';

import React, { useState } from 'react';
import { useApplicationStatus } from '@/hooks/use-application-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusTimeline } from './status-timeline';
import { StatusHistory } from './status-history';
import { StatusAnalytics } from './status-analytics';
import { getStatusLabel, getStatusColor, getStatusDescription } from '@/utils/status-helpers';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusTrackerProps {
  applicationId: string;
  freelancerId?: string;
  clientId?: string;
  viewMode?: 'freelancer' | 'client' | 'admin';
  showAnalytics?: boolean;
  className?: string;
}

export function StatusTracker({
  applicationId,
  viewMode = 'freelancer',
  showAnalytics = false,
  className = '',
}: StatusTrackerProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'analytics'>('timeline');

  const {
    currentStatus,
    timeline,
    statusHistory,
    isLoading,
    error,
    refreshStatus,
  } = useApplicationStatus(applicationId, viewMode);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Error Loading Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refreshStatus} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColor = currentStatus ? getStatusColor(currentStatus) : null;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle>Application Status</CardTitle>
                {currentStatus && (
                  <Badge className={cn(statusColor?.bg, statusColor?.text)}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {getStatusLabel(currentStatus)}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {currentStatus ? getStatusDescription(currentStatus) : 'No status information available'}
              </CardDescription>
            </div>
            <Button
              onClick={refreshStatus}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Timeline Preview */}
        <CardContent>
          <div className="mb-6">
            <StatusTimeline
              timeline={timeline}
              currentStatus={currentStatus}
              variant="compact"
            />
          </div>

          {/* Tabs for detailed views */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="history">
                History ({statusHistory.length})
              </TabsTrigger>
              {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            </TabsList>

            <TabsContent value="timeline" className="mt-6">
              <StatusTimeline
                timeline={timeline}
                variant="full"
                interactive
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <StatusHistory
                changes={statusHistory}
              />
            </TabsContent>

            {showAnalytics && (
              <TabsContent value="analytics" className="mt-6">
                <StatusAnalytics />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

StatusTracker.displayName = 'StatusTracker';
