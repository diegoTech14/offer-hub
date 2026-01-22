// Core notification types
export interface MessageNotification {
  id: string;
  type: 'message' | 'system' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
  channels: NotificationChannel[];
  metadata?: NotificationMetadata;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in-app';
  enabled: boolean;
  delivered: boolean;
  deliveredAt?: string;
  failed: boolean;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

export interface NotificationMetadata {
  messageType?: 'text' | 'file' | 'system';
  projectId?: string;
  serviceRequestId?: string;
  urgency?: 'low' | 'medium' | 'high';
  category?: 'message' | 'payment' | 'dispute' | 'project' | 'security';
  tags?: string[];
  customData?: Record<string, any>;
}

// User notification preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  messageNotifications: {
    newMessage: boolean;
    messageRead: boolean;
    typingIndicator: boolean;
    messageDelivery: boolean;
  };
  projectNotifications: {
    projectUpdate: boolean;
    milestoneReached: boolean;
    deadlineReminder: boolean;
    paymentReceived: boolean;
  };
  systemNotifications: {
    securityAlerts: boolean;
    accountUpdates: boolean;
    maintenanceAlerts: boolean;
    featureUpdates: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    digest: boolean;
    digestFrequency: 'hourly' | 'daily' | 'weekly';
  };
  updatedAt: string;
}

// Notification templates
export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  channels: NotificationChannelType[];
  template: {
    title: string;
    message: string;
    emailSubject?: string;
    emailBody?: string;
    pushTitle?: string;
    pushBody?: string;
  };
  variables: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannelType = 'push' | 'email' | 'sms' | 'in-app';

// Notification history and analytics
export interface NotificationHistory {
  id: string;
  notificationId: string;
  userId: string;
  action: 'sent' | 'delivered' | 'read' | 'clicked' | 'dismissed' | 'failed';
  timestamp: string;
  channel?: NotificationChannelType;
  metadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  channelBreakdown: {
    [key in NotificationChannelType]: {
      sent: number;
      delivered: number;
      failed: number;
      averageDeliveryTime: number;
    };
  };
  timeRange: {
    start: string;
    end: string;
  };
}

// Batch processing
export interface NotificationBatch {
  id: string;
  notifications: MessageNotification[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  failedCount: number;
  successCount: number;
  retryCount: number;
  maxRetries: number;
}

// Real-time notification events
export interface NotificationEvent {
  type: 'new_notification' | 'notification_read' | 'notification_delivered' | 'preferences_updated';
  data: MessageNotification | NotificationPreferences;
  timestamp: string;
}

// API response types
export interface NotificationApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedNotifications {
  notifications: MessageNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter and search types
export interface NotificationFilters {
  type?: MessageNotification['type'];
  priority?: MessageNotification['priority'];
  read?: boolean;
  channel?: NotificationChannelType;
  dateRange?: {
    start: string;
    end: string;
  };
  conversationId?: string;
  senderId?: string;
  category?: NotificationMetadata['category'];
}

export interface NotificationSearchParams {
  query?: string;
  filters?: NotificationFilters;
  sortBy?: 'timestamp' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Push notification types
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Email notification types
export interface EmailNotificationData {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateVariables?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

// SMS notification types
export interface SmsNotificationData {
  to: string;
  message: string;
  from?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
}

// Device and subscription management
export interface DeviceSubscription {
  id: string;
  userId: string;
  deviceToken: string;
  deviceType: 'web' | 'ios' | 'android';
  userAgent?: string;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  deviceType: 'web' | 'ios' | 'android';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification queue and processing
export interface NotificationQueueItem {
  id: string;
  notification: MessageNotification;
  userId: string;
  priority: number;
  scheduledFor: string;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  error?: string;
}

// Compliance and GDPR
export interface NotificationConsent {
  userId: string;
  consentType: 'marketing' | 'transactional' | 'system';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

export interface NotificationOptOut {
  userId: string;
  channel: NotificationChannelType;
  optOutType: 'all' | 'category' | 'specific';
  category?: string;
  specificNotifications?: string[];
  reason?: string;
  optedOutAt: string;
}

// Performance and monitoring
export interface NotificationMetrics {
  timestamp: string;
  totalNotifications: number;
  deliveryMetrics: {
    successful: number;
    failed: number;
    pending: number;
  };
  performanceMetrics: {
    averageDeliveryTime: number;
    queueSize: number;
    processingRate: number;
  };
  channelMetrics: {
    [key in NotificationChannelType]: {
      sent: number;
      delivered: number;
      failed: number;
      averageDeliveryTime: number;
    };
  };
}

// Webhook and integration types
export interface NotificationWebhook {
  id: string;
  url: string;
  events: NotificationEvent['type'][];
  secret?: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebhookPayload {
  event: NotificationEvent['type'];
  notification: MessageNotification;
  timestamp: string;
  signature?: string;
}
