/**
 * Status Timeline Component
 * Interactive timeline visualization for status changes
 */

'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useTimelinePreferencesStore } from '@/stores/use-timeline-preferences-store';
import { getStatusColor, getStatusLabel, formatMilliseconds } from '@/utils/status-helpers';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineDataPoint, ApplicationStatus } from '@/types/application-status.types';

export interface StatusTimelineProps {
  timeline: TimelineDataPoint[];
  currentStatus?: ApplicationStatus | null;
  variant?: 'compact' | 'full';
  interactive?: boolean;
  className?: string;
}

export function StatusTimeline({
  timeline,
  variant = 'full',
  interactive = false,
  className = '',
}: StatusTimelineProps) {
  const { preferences, setPreferences } = useTimelinePreferencesStore();
  const [selectedPoint, setSelectedPoint] = useState<TimelineDataPoint | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate timeline scale based on zoom
  const scale = useMemo(() => {
    if (variant === 'compact') return 1;
    return preferences.zoom;
  }, [variant, preferences.zoom]);

  // Handle zoom
  const handleZoomIn = () => {
    const newZoom = Math.min(2.0, preferences.zoom + 0.2);
    setPreferences({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, preferences.zoom - 0.2);
    setPreferences({ zoom: newZoom });
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Empty state
  if (!timeline || timeline.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-32 text-gray-500">
          No status changes yet
        </CardContent>
      </Card>
    );
  }

  // Compact variant - horizontal progress bar style
  if (variant === 'compact') {
    return (
      <div className={cn('w-full space-y-2', className)}>
        <div className="flex items-center justify-between overflow-x-auto">
          {timeline.map((point, index) => {
            const statusColor = getStatusColor(point.status);
            const isLast = index === timeline.length - 1;
            const isCurrent = point.isCurrentStatus;

            return (
              <div key={point.id} className="flex items-center flex-shrink-0">
                {/* Status node */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                          isCurrent ? 'ring-4 ring-offset-2' : '',
                          statusColor.border,
                          statusColor.bg
                        )}
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full',
                            statusColor.text
                          )}
                          style={{ backgroundColor: statusColor.hex }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">{point.title}</p>
                        <p className="text-gray-500">{format(point.date, 'PPp')}</p>
                        {point.description && <p>{point.description}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Connector line */}
                {!isLast && (
                  <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-700 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Status labels */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          {timeline.map((point) => (
            <div key={`label-${point.id}`} className="flex-shrink-0 w-20 text-center">
              {getStatusLabel(point.status)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant - detailed timeline
  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Controls */}
      {interactive && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={handleZoomOut} size="sm" variant="outline" disabled={preferences.zoom <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(preferences.zoom * 100)}%
            </span>
            <Button onClick={handleZoomIn} size="sm" variant="outline" disabled={preferences.zoom >= 2.0}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={toggleExpanded} size="sm" variant="ghost">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea className="w-full">
        <div className="relative py-8" style={{ transform: `scale(${scale})`, transformOrigin: 'left top' }}>
          <div className="flex items-start gap-8">
            {timeline.map((point, index) => {
              const statusColor = getStatusColor(point.status);
              const isLast = index === timeline.length - 1;
              const isCurrent = point.isCurrentStatus;

              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center gap-4 min-w-[200px]">
                    {/* Status node */}
                    <div
                      className={cn(
                        'relative flex flex-col items-center gap-2 cursor-pointer',
                        interactive && 'hover:scale-110 transition-transform'
                      )}
                      onClick={() => interactive && setSelectedPoint(point)}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all',
                          isCurrent ? 'ring-4 ring-offset-2' : '',
                          statusColor.border,
                          statusColor.bg
                        )}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: statusColor.hex }}
                        />
                      </div>

                      {/* Status label */}
                      <Badge className={cn(statusColor.bg, statusColor.text)}>
                        {point.title}
                      </Badge>
                    </div>

                    {/* Card with details */}
                    <Card className="w-[200px]">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-sm font-medium">{format(point.date, 'PP')}</div>
                        <div className="text-xs text-gray-500">{format(point.date, 'p')}</div>

                        {preferences.showDurations && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Duration: {formatMilliseconds(point.duration)}
                          </div>
                        )}

                        {point.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {point.description}
                          </p>
                        )}

                        <div className="text-xs text-gray-500">
                          By {point.actorName}
                        </div>

                        {preferences.showFeedback && point.feedback && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-blue-600">Client Feedback</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {point.feedback.message}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Connector line */}
                    {!isLast && (
                      <div className="absolute left-[calc(100%_-_32px)] top-8 w-8 h-0.5 bg-gray-300 dark:bg-gray-700" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Selected point details modal */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">{selectedPoint.title}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Date:</span> {format(selectedPoint.date, 'PPp')}
                </div>
                <div>
                  <span className="font-medium">Changed by:</span> {selectedPoint.actorName}
                </div>
                <div>
                  <span className="font-medium">Duration in status:</span>{' '}
                  {formatMilliseconds(selectedPoint.duration)}
                </div>
                {selectedPoint.description && (
                  <div>
                    <span className="font-medium">Comments:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedPoint.description}</p>
                  </div>
                )}
                {selectedPoint.feedback && (
                  <div>
                    <span className="font-medium">Client Feedback:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedPoint.feedback.message}</p>
                  </div>
                )}
              </div>
              <Button onClick={() => setSelectedPoint(null)} className="mt-4 w-full">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
