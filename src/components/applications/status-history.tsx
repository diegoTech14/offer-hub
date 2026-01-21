/**
 * Status History Component
 * Paginated list of all status changes with filtering
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getStatusLabel, getStatusColor } from '@/utils/status-helpers';
import { Search, Download, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusChange } from '@/types/application-status.types';

export interface StatusHistoryProps {
  applicationId?: string;
  changes: StatusChange[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function StatusHistory({
  changes,
  onLoadMore,
  hasMore = false,
  className = '',
}: StatusHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filter changes based on search
  const filteredChanges = React.useMemo(() => {
    let filtered = changes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (change) =>
          getStatusLabel(change.toStatus).toLowerCase().includes(query) ||
          change.changedByName?.toLowerCase().includes(query) ||
          change.comments?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [changes, searchQuery]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleExport = () => {
    // Export logic would go here
    const csvContent = changes.map((change) => ({
      date: format(new Date(change.changedAt), 'yyyy-MM-dd HH:mm:ss'),
      from: change.fromStatus ? getStatusLabel(change.fromStatus) : '-',
      to: getStatusLabel(change.toStatus),
      changedBy: change.changedByName || change.changedBy,
      comments: change.comments || '-',
    }));

    console.log('Export data:', csvContent);
    // TODO: Implement actual CSV download
  };

  // Empty state
  if (filteredChanges.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center h-32 text-gray-500">
          <p>No status changes found</p>
          {searchQuery && (
            <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
              Clear search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search status changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* History list */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredChanges.map((change, index) => {
            const isExpanded = expandedIds.has(change.id);
            const statusColor = getStatusColor(change.toStatus);
            const prevStatusColor = change.fromStatus ? getStatusColor(change.fromStatus) : null;

            return (
              <Card key={change.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Status transition */}
                      <div className="flex items-center gap-2">
                        {change.fromStatus && prevStatusColor && (
                          <>
                            <Badge className={cn(prevStatusColor.bg, prevStatusColor.text)}>
                              {getStatusLabel(change.fromStatus)}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </>
                        )}
                        <Badge className={cn(statusColor.bg, statusColor.text)}>
                          {getStatusLabel(change.toStatus)}
                        </Badge>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{format(new Date(change.changedAt), 'PPp')}</span>
                        <span>•</span>
                        <span>By {change.changedByName || change.changedBy}</span>
                        {change.reason && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{change.reason.replace('_', ' ')}</span>
                          </>
                        )}
                      </div>

                      {/* Comments preview */}
                      {change.comments && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className={cn(
                            'text-sm text-gray-700 dark:text-gray-300',
                            !isExpanded && 'line-clamp-2'
                          )}>
                            {change.comments}
                          </p>
                        </div>
                      )}

                      {/* Expand button */}
                      {change.comments && change.comments.length > 100 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(change.id)}
                          className="text-xs"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </Button>
                      )}

                      {/* Expanded details */}
                      {isExpanded && change.metadata && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Additional Details
                          </p>
                          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                            {JSON.stringify(change.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {index < filteredChanges.length - 1 && <Separator />}
              </Card>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && onLoadMore && (
          <div className="flex justify-center mt-6">
            <Button onClick={onLoadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
