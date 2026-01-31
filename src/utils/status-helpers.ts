/**
 * Status Tracking Utility Functions
 * Helper functions for status validation, transitions, formatting, and calculations
 */

import {
  ApplicationStatus,
  StatusChange,
  TimelineDataPoint,
  StatusDistribution,
  StatusTimeMetrics,
  StatusTransition,
  ClientFeedback,
} from '@/types/application-status.types';
import { differenceInDays, differenceInMilliseconds, format } from 'date-fns';

// ==================== Status Validation ====================

/**
 * Valid status transitions based on workflow rules
 */
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['under_review', 'withdrawn'],
  under_review: ['interview_scheduled', 'rejected', 'accepted', 'withdrawn'],
  interview_scheduled: ['interview_completed', 'withdrawn'],
  interview_completed: ['accepted', 'rejected', 'under_review', 'withdrawn'],
  accepted: [], // Final state
  rejected: [], // Final state
  withdrawn: [], // Final state
};

/**
 * Validate if a status transition is allowed
 */
export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  const allowedTransitions = VALID_TRANSITIONS[from] || [];
  return allowedTransitions.includes(to);
}

/**
 * Get all possible next statuses from current status
 */
export function getAllowedNextStatuses(currentStatus: ApplicationStatus): ApplicationStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if status is a final state
 */
export function isFinalStatus(status: ApplicationStatus): boolean {
  return status === 'accepted' || status === 'rejected' || status === 'withdrawn';
}

/**
 * Check if status requires action
 */
export function requiresAction(status: ApplicationStatus): boolean {
  return status === 'interview_scheduled' || status === 'under_review';
}

// ==================== Status Formatting ====================

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    interview_scheduled: 'Interview Scheduled',
    interview_completed: 'Interview Completed',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[status] || status;
}

/**
 * Get status description
 */
export function getStatusDescription(status: ApplicationStatus): string {
  const descriptions: Record<ApplicationStatus, string> = {
    submitted: 'Your application has been submitted and is awaiting review',
    under_review: 'Your application is currently being reviewed by the client',
    interview_scheduled: 'An interview has been scheduled for this application',
    interview_completed: 'The interview has been completed, awaiting final decision',
    accepted: 'Congratulations! Your application has been accepted',
    rejected: 'Your application was not selected for this project',
    withdrawn: 'This application has been withdrawn',
  };
  return descriptions[status] || '';
}

/**
 * Get status color for UI styling
 */
export function getStatusColor(status: ApplicationStatus): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  const colors: Record<ApplicationStatus, { bg: string; text: string; border: string; hex: string }> = {
    submitted: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-700',
      hex: '#3B82F6',
    },
    under_review: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
      hex: '#EAB308',
    },
    interview_scheduled: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-800 dark:text-purple-200',
      border: 'border-purple-300 dark:border-purple-700',
      hex: '#A855F7',
    },
    interview_completed: {
      bg: 'bg-indigo-100 dark:bg-indigo-900',
      text: 'text-indigo-800 dark:text-indigo-200',
      border: 'border-indigo-300 dark:border-indigo-700',
      hex: '#6366F1',
    },
    accepted: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-300 dark:border-green-700',
      hex: '#22C55E',
    },
    rejected: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
      hex: '#EF4444',
    },
    withdrawn: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border-gray-300 dark:border-gray-700',
      hex: '#6B7280',
    },
  };
  return colors[status];
}

/**
 * Get status icon name (for lucide-react)
 */
export function getStatusIcon(status: ApplicationStatus): string {
  const icons: Record<ApplicationStatus, string> = {
    submitted: 'Send',
    under_review: 'Eye',
    interview_scheduled: 'Calendar',
    interview_completed: 'CheckCircle2',
    accepted: 'ThumbsUp',
    rejected: 'ThumbsDown',
    withdrawn: 'XCircle',
  };
  return icons[status] || 'Circle';
}

// ==================== Time Calculations ====================

/**
 * Calculate duration between two dates in human-readable format
 */
export function formatDuration(startDate: Date, endDate: Date = new Date()): string {
  const days = getDurationInDays(startDate, endDate);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Calculate duration in days
 */
export function getDurationInDays(startDate: Date, endDate: Date = new Date()): number {
  return differenceInDays(endDate, startDate);
}

/**
 * Calculate duration in milliseconds
 */
export function getDurationInMs(startDate: Date, endDate: Date = new Date()): number {
  return differenceInMilliseconds(endDate, startDate);
}

/**
 * Calculate time spent in each status
 */
export function calculateStatusDurations(changes: StatusChange[]): Record<ApplicationStatus, number> {
  const durations: Partial<Record<ApplicationStatus, number>> = {};

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const nextChange = changes[i + 1];

    const duration = nextChange
      ? getDurationInMs(new Date(change.changedAt), new Date(nextChange.changedAt))
      : getDurationInMs(new Date(change.changedAt), new Date());

    durations[change.toStatus] = (durations[change.toStatus] || 0) + duration;
  }

  return durations as Record<ApplicationStatus, number>;
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatMilliseconds(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ==================== Timeline Helpers ====================

/**
 * Convert status changes to timeline data points
 */
export function convertToTimelineData(
  changes: StatusChange[],
  currentStatus: ApplicationStatus,
  feedbackMap?: Map<string, ClientFeedback>
): TimelineDataPoint[] {
  return changes.map((change, index) => {
    const nextChange = changes[index + 1];
    const duration = nextChange
      ? getDurationInMs(new Date(change.changedAt), new Date(nextChange.changedAt))
      : getDurationInMs(new Date(change.changedAt), new Date());

    return {
      id: change.id,
      date: new Date(change.changedAt),
      status: change.toStatus,
      title: getStatusLabel(change.toStatus),
      description: change.comments,
      actor: change.changedBy,
      actorName: change.changedByName || change.changedBy,
      duration,
      feedback: feedbackMap?.get(change.id),
      isCurrentStatus: change.toStatus === currentStatus && index === changes.length - 1,
      metadata: change.metadata,
    };
  });
}

/**
 * Group timeline points by date
 */
export function groupTimelineByDate(
  points: TimelineDataPoint[]
): Record<string, TimelineDataPoint[]> {
  const grouped: Record<string, TimelineDataPoint[]> = {};

  for (const point of points) {
    const dateKey = format(point.date, 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(point);
  }

  return grouped;
}

// ==================== Analytics Calculations ====================

/**
 * Calculate status distribution
 */
export function calculateStatusDistribution(changes: StatusChange[]): StatusDistribution[] {
  const counts: Partial<Record<ApplicationStatus, number>> = {};
  let total = 0;

  // Get latest status for each application
  const latestStatuses = new Map<string, ApplicationStatus>();
  for (const change of changes) {
    latestStatuses.set(change.applicationId, change.toStatus);
  }

  // Count each status
  for (const status of latestStatuses.values()) {
    counts[status] = (counts[status] || 0) + 1;
    total++;
  }

  return Object.entries(counts).map(([status, count]) => ({
    status: status as ApplicationStatus,
    count: count || 0,
    percentage: total > 0 ? ((count || 0) / total) * 100 : 0,
  }));
}

/**
 * Calculate time metrics for each status
 */
export function calculateTimeMetrics(changes: StatusChange[]): StatusTimeMetrics[] {
  const statusTimes: Partial<Record<ApplicationStatus, number[]>> = {};

  // Group by application and calculate time in each status
  const applicationChanges = new Map<string, StatusChange[]>();
  for (const change of changes) {
    if (!applicationChanges.has(change.applicationId)) {
      applicationChanges.set(change.applicationId, []);
    }
    applicationChanges.get(change.applicationId)!.push(change);
  }

  // Calculate durations for each status
  for (const appChanges of applicationChanges.values()) {
    const sorted = appChanges.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    for (let i = 0; i < sorted.length; i++) {
      const change = sorted[i];
      const nextChange = sorted[i + 1];

      const duration = nextChange
        ? getDurationInDays(new Date(change.changedAt), new Date(nextChange.changedAt))
        : getDurationInDays(new Date(change.changedAt), new Date());

      if (!statusTimes[change.toStatus]) {
        statusTimes[change.toStatus] = [];
      }
      statusTimes[change.toStatus]!.push(duration);
    }
  }

  // Calculate metrics
  return Object.entries(statusTimes).map(([status, times]) => {
    const sorted = times.sort((a, b) => a - b);
    const sum = sorted.reduce((acc, t) => acc + t, 0);
    const avg = sum / sorted.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      status: status as ApplicationStatus,
      averageDays: avg,
      minDays: sorted[0] || 0,
      maxDays: sorted[sorted.length - 1] || 0,
      medianDays: median,
    };
  });
}

/**
 * Calculate status transitions
 */
export function calculateTransitions(changes: StatusChange[]): StatusTransition[] {
  const transitions = new Map<string, { count: number; totalTime: number }>();

  const applicationChanges = new Map<string, StatusChange[]>();
  for (const change of changes) {
    if (!applicationChanges.has(change.applicationId)) {
      applicationChanges.set(change.applicationId, []);
    }
    applicationChanges.get(change.applicationId)!.push(change);
  }

  for (const appChanges of applicationChanges.values()) {
    const sorted = appChanges.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    for (let i = 1; i < sorted.length; i++) {
      const prevChange = sorted[i - 1];
      const currChange = sorted[i];
      const key = `${prevChange.toStatus}->${currChange.toStatus}`;

      const time = getDurationInDays(new Date(prevChange.changedAt), new Date(currChange.changedAt));

      if (!transitions.has(key)) {
        transitions.set(key, { count: 0, totalTime: 0 });
      }

      const data = transitions.get(key)!;
      data.count++;
      data.totalTime += time;
    }
  }

  return Array.from(transitions.entries()).map(([key, data]) => {
    const [from, to] = key.split('->') as [ApplicationStatus, ApplicationStatus];
    return {
      from,
      to,
      count: data.count,
      averageTime: data.totalTime / data.count,
    };
  });
}

/**
 * Calculate average time to decision (from submitted to final status)
 */
export function calculateAverageTimeToDecision(changes: StatusChange[]): number {
  const applicationChanges = new Map<string, StatusChange[]>();
  for (const change of changes) {
    if (!applicationChanges.has(change.applicationId)) {
      applicationChanges.set(change.applicationId, []);
    }
    applicationChanges.get(change.applicationId)!.push(change);
  }

  let totalDays = 0;
  let completedApplications = 0;

  for (const appChanges of applicationChanges.values()) {
    const sorted = appChanges.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
    const firstChange = sorted[0];
    const lastChange = sorted[sorted.length - 1];

    if (isFinalStatus(lastChange.toStatus)) {
      const days = getDurationInDays(new Date(firstChange.changedAt), new Date(lastChange.changedAt));
      totalDays += days;
      completedApplications++;
    }
  }

  return completedApplications > 0 ? totalDays / completedApplications : 0;
}

/**
 * Calculate success rate
 */
export function calculateSuccessRate(changes: StatusChange[]): { successRate: number; rejectionRate: number } {
  const latestStatuses = new Map<string, ApplicationStatus>();
  for (const change of changes) {
    latestStatuses.set(change.applicationId, change.toStatus);
  }

  let accepted = 0;
  let rejected = 0;
  let total = 0;

  for (const status of latestStatuses.values()) {
    if (status === 'accepted') accepted++;
    if (status === 'rejected') rejected++;
    if (isFinalStatus(status)) total++;
  }

  return {
    successRate: total > 0 ? (accepted / total) * 100 : 0,
    rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
  };
}

// ==================== Validation ====================

/**
 * Validate status change request
 */
export function validateStatusChange(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  userRole?: 'client' | 'freelancer' | 'admin'
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (currentStatus === newStatus) {
    errors.push('New status must be different from current status');
  }

  if (!isValidTransition(currentStatus, newStatus)) {
    errors.push(`Invalid transition from ${getStatusLabel(currentStatus)} to ${getStatusLabel(newStatus)}`);
  }

  if (isFinalStatus(currentStatus)) {
    errors.push(`Cannot change status from final state ${getStatusLabel(currentStatus)}`);
  }

  // Role-based validation
  if (userRole === 'freelancer' && newStatus !== 'withdrawn') {
    errors.push('Freelancers can only withdraw applications');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== Export Helpers ====================

/**
 * Prepare status data for CSV export
 */
export function prepareCSVData(changes: StatusChange[]): string[][] {
  const headers = ['Date', 'Application ID', 'From Status', 'To Status', 'Changed By', 'Reason', 'Comments'];
  const rows = changes.map((change) => [
    format(new Date(change.changedAt), 'yyyy-MM-dd HH:mm:ss'),
    change.applicationId,
    change.fromStatus ? getStatusLabel(change.fromStatus) : '-',
    getStatusLabel(change.toStatus),
    change.changedByName || change.changedBy,
    change.reason || '-',
    change.comments || '-',
  ]);

  return [headers, ...rows];
}

/**
 * Convert CSV data to blob
 */
export function csvToBlob(data: string[][]): Blob {
  const csv = data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
