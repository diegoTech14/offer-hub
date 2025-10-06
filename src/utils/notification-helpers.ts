import {
  MessageNotification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationChannelType,
  NotificationMetadata,
  PushNotificationPayload,
  EmailNotificationData,
  SmsNotificationData,
  NotificationConsent,
  NotificationOptOut,
} from '../types/message-notifications.types';

/**
 * Notification utility functions for delivery optimization and management
 */

// Priority scoring system
export const PRIORITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
} as const;

// Channel delivery preferences based on priority
export const CHANNEL_PRIORITY_MAP: Record<MessageNotification['priority'], NotificationChannelType[]> = {
  low: ['in-app'],
  medium: ['in-app', 'push'],
  high: ['in-app', 'push', 'email'],
  urgent: ['in-app', 'push', 'email', 'sms'],
};

// Time-based delivery optimization
export const QUIET_HOURS_CONFIG = {
  defaultStart: '22:00',
  defaultEnd: '08:00',
  timezone: 'UTC',
} as const;

/**
 * Determines optimal notification channels based on priority and user preferences
 */
export function getOptimalChannels(
  priority: MessageNotification['priority'],
  preferences: NotificationPreferences,
  isQuietHours: boolean = false
): NotificationChannelType[] {
  const availableChannels = CHANNEL_PRIORITY_MAP[priority];
  const enabledChannels = availableChannels.filter(channel => {
    switch (channel) {
      case 'in-app':
        return preferences.channels.inApp;
      case 'push':
        return preferences.channels.push && !isQuietHours;
      case 'email':
        return preferences.channels.email && !isQuietHours;
      case 'sms':
        return preferences.channels.sms && !isQuietHours;
      default:
        return false;
    }
  });

  return enabledChannels;
}

/**
 * Checks if current time falls within quiet hours
 */
export function isQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHours?.enabled) return false;

  const now = new Date();
  const timezone = preferences.quietHours.timezone || QUIET_HOURS_CONFIG.timezone;
  
  // Convert current time to user's timezone
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const currentTime = userTime.toTimeString().slice(0, 5); // HH:mm format
  
  const startTime = preferences.quietHours.startTime || QUIET_HOURS_CONFIG.defaultStart;
  const endTime = preferences.quietHours.endTime || QUIET_HOURS_CONFIG.defaultEnd;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Calculates notification delivery delay based on priority and preferences
 */
export function calculateDeliveryDelay(
  priority: MessageNotification['priority'],
  preferences: NotificationPreferences
): number {
  const baseDelay = PRIORITY_SCORES[priority] * 1000; // Base delay in milliseconds
  
  if (isQuietHours(preferences)) {
    // Delay until end of quiet hours for non-urgent notifications
    if (priority !== 'urgent') {
      const endTime = preferences.quietHours?.endTime || QUIET_HOURS_CONFIG.defaultEnd;
      const [hours, minutes] = endTime.split(':').map(Number);
      const now = new Date();
      const endQuietHours = new Date();
      endQuietHours.setHours(hours, minutes, 0, 0);
      
      if (endQuietHours <= now) {
        endQuietHours.setDate(endQuietHours.getDate() + 1);
      }
      
      return endQuietHours.getTime() - now.getTime();
    }
  }
  
  return baseDelay;
}

/**
 * Generates push notification payload
 */
export function generatePushPayload(
  notification: MessageNotification,
  customData?: Record<string, any>
): PushNotificationPayload {
  const basePayload: PushNotificationPayload = {
    title: notification.title,
    body: notification.message,
    icon: '/favicon.ico',
    badge: '/badge.png',
    data: {
      notificationId: notification.id,
      conversationId: notification.conversationId,
      messageId: notification.messageId,
      priority: notification.priority,
      ...customData,
    },
    requireInteraction: notification.priority === 'urgent',
    silent: notification.priority === 'low',
    tag: `notification-${notification.id}`,
    renotify: notification.priority === 'urgent',
  };

  // Add action buttons for high priority notifications
  if (notification.priority === 'high' || notification.priority === 'urgent') {
    basePayload.actions = [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png',
      },
    ];
  }

  return basePayload;
}

/**
 * Generates email notification data
 */
export function generateEmailData(
  notification: MessageNotification,
  recipientEmail: string,
  template?: NotificationTemplate
): EmailNotificationData {
  const subject = template?.template.emailSubject || notification.title;
  const htmlBody = template?.template.emailBody || generateDefaultEmailBody(notification);
  const textBody = stripHtmlTags(htmlBody);

  return {
    to: recipientEmail,
    subject,
    htmlBody,
    textBody,
    from: process.env.NOTIFICATION_EMAIL_FROM || 'noreply@offerhub.com',
    replyTo: process.env.NOTIFICATION_EMAIL_REPLY_TO,
    templateId: template?.id,
    templateVariables: {
      notificationTitle: notification.title,
      notificationMessage: notification.message,
      senderName: notification.senderName,
      conversationId: notification.conversationId,
      actionUrl: notification.actionUrl,
      priority: notification.priority,
    },
  };
}

/**
 * Generates SMS notification data
 */
export function generateSmsData(
  notification: MessageNotification,
  recipientPhone: string,
  template?: NotificationTemplate
): SmsNotificationData {
  let message = template?.template.message || notification.message;
  
  // Truncate message for SMS (160 character limit)
  if (message.length > 160) {
    message = message.substring(0, 157) + '...';
  }

  return {
    to: recipientPhone,
    message,
    from: process.env.SMS_FROM_NUMBER,
    templateId: template?.id,
    templateVariables: {
      notificationTitle: notification.title,
      notificationMessage: notification.message,
      senderName: notification.senderName,
      conversationId: notification.conversationId,
      actionUrl: notification.actionUrl,
      priority: notification.priority,
    },
  };
}

/**
 * Validates notification data before sending
 */
export function validateNotification(notification: Partial<MessageNotification>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!notification.message || notification.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (!notification.priority || !Object.values(PRIORITY_SCORES).includes(PRIORITY_SCORES[notification.priority])) {
    errors.push('Valid priority is required');
  }

  if (!notification.type || !['message', 'system', 'alert', 'reminder'].includes(notification.type)) {
    errors.push('Valid type is required');
  }

  if (notification.expiresAt && new Date(notification.expiresAt) <= new Date()) {
    errors.push('Expiration date must be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if user has consented to specific notification types
 */
export function hasConsent(
  userId: string,
  consentType: NotificationConsent['consentType'],
  consents: NotificationConsent[]
): boolean {
  const consent = consents.find(
    c => c.userId === userId && c.consentType === consentType
  );
  
  return consent?.granted === true && !consent.revokedAt;
}

/**
 * Checks if user has opted out of specific notifications
 */
export function isOptedOut(
  userId: string,
  channel: NotificationChannelType,
  category: string,
  optOuts: NotificationOptOut[]
): boolean {
  return optOuts.some(optOut => {
    if (optOut.userId !== userId) return false;
    
    switch (optOut.optOutType) {
      case 'all':
        return optOut.channel === channel;
      case 'category':
        return optOut.channel === channel && optOut.category === category;
      case 'specific':
        return optOut.channel === channel && 
               optOut.specificNotifications?.includes(category);
      default:
        return false;
    }
  });
}

/**
 * Formats notification timestamp for display
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Generates notification digest for batch processing
 */
export function generateNotificationDigest(
  notifications: MessageNotification[],
  frequency: 'hourly' | 'daily' | 'weekly'
): {
  title: string;
  summary: string;
  notifications: MessageNotification[];
  priorityCounts: Record<MessageNotification['priority'], number>;
} {
  const priorityCounts = notifications.reduce((acc, notif) => {
    acc[notif.priority] = (acc[notif.priority] || 0) + 1;
    return acc;
  }, {} as Record<MessageNotification['priority'], number>);

  const totalCount = notifications.length;
  const urgentCount = priorityCounts.urgent || 0;
  const highCount = priorityCounts.high || 0;

  let title = '';
  let summary = '';

  switch (frequency) {
    case 'hourly':
      title = `Hourly Digest - ${totalCount} notification${totalCount > 1 ? 's' : ''}`;
      summary = `You have ${totalCount} new notification${totalCount > 1 ? 's' : ''}`;
      break;
    case 'daily':
      title = `Daily Digest - ${totalCount} notification${totalCount > 1 ? 's' : ''}`;
      summary = `You received ${totalCount} notification${totalCount > 1 ? 's' : ''} today`;
      break;
    case 'weekly':
      title = `Weekly Digest - ${totalCount} notification${totalCount > 1 ? 's' : ''}`;
      summary = `You received ${totalCount} notification${totalCount > 1 ? 's' : ''} this week`;
      break;
  }

  if (urgentCount > 0) {
    summary += `, including ${urgentCount} urgent notification${urgentCount > 1 ? 's' : ''}`;
  } else if (highCount > 0) {
    summary += `, including ${highCount} high priority notification${highCount > 1 ? 's' : ''}`;
  }

  return {
    title,
    summary,
    notifications: notifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    priorityCounts,
  };
}

/**
 * Optimizes notification batch for delivery
 */
export function optimizeNotificationBatch(
  notifications: MessageNotification[]
): MessageNotification[] {
  // Sort by priority and timestamp
  return notifications.sort((a, b) => {
    const priorityDiff = PRIORITY_SCORES[b.priority] - PRIORITY_SCORES[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Generates notification analytics summary
 */
export function generateAnalyticsSummary(
  notifications: MessageNotification[],
  timeRange: { start: string; end: string }
): {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  channelBreakdown: Record<NotificationChannelType, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
} {
  const totalSent = notifications.length;
  let totalDelivered = 0;
  let totalRead = 0;
  let totalFailed = 0;
  let totalDeliveryTime = 0;
  let deliveryCount = 0;

  const channelBreakdown: Record<NotificationChannelType, {
    sent: number;
    delivered: number;
    failed: number;
  }> = {
    'in-app': { sent: 0, delivered: 0, failed: 0 },
    'push': { sent: 0, delivered: 0, failed: 0 },
    'email': { sent: 0, delivered: 0, failed: 0 },
    'sms': { sent: 0, delivered: 0, failed: 0 },
  };

  notifications.forEach(notification => {
    notification.channels.forEach(channel => {
      channelBreakdown[channel.type].sent++;
      
      if (channel.delivered) {
        channelBreakdown[channel.type].delivered++;
        totalDelivered++;
        
        if (channel.deliveredAt) {
          const sentTime = new Date(notification.timestamp).getTime();
          const deliveredTime = new Date(channel.deliveredAt).getTime();
          totalDeliveryTime += deliveredTime - sentTime;
          deliveryCount++;
        }
      } else if (channel.failed) {
        channelBreakdown[channel.type].failed++;
        totalFailed++;
      }
    });

    if (notification.read) {
      totalRead++;
    }
  });

  return {
    totalSent,
    totalDelivered,
    totalRead,
    totalFailed,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
    averageDeliveryTime: deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0,
    channelBreakdown,
  };
}

/**
 * Helper function to generate default email body
 */
function generateDefaultEmailBody(notification: MessageNotification): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 16px;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          ${notification.message}
        </p>
        ${notification.actionUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${notification.actionUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              ${notification.actionLabel || 'View Details'}
            </a>
          </div>
        ` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          This notification was sent from OfferHub. If you no longer wish to receive these notifications, 
          you can update your preferences in your account settings.
        </p>
      </div>
    </div>
  `;
}

/**
 * Helper function to strip HTML tags
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Debounce function for notification throttling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for notification rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generates unique notification ID
 */
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Sanitizes notification content for different channels
 */
export function sanitizeContentForChannel(
  content: string,
  channel: NotificationChannelType,
  maxLength?: number
): string {
  let sanitized = content.trim();
  
  // Remove HTML tags for non-email channels
  if (channel !== 'email') {
    sanitized = stripHtmlTags(sanitized);
  }
  
  // Apply length limits
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }
  
  // Channel-specific sanitization
  switch (channel) {
    case 'sms':
      // SMS has 160 character limit
      if (sanitized.length > 160) {
        sanitized = sanitized.substring(0, 157) + '...';
      }
      break;
    case 'push':
      // Push notifications should be concise
      if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 97) + '...';
      }
      break;
  }
  
  return sanitized;
}

export default {
  getOptimalChannels,
  isQuietHours,
  calculateDeliveryDelay,
  generatePushPayload,
  generateEmailData,
  generateSmsData,
  validateNotification,
  hasConsent,
  isOptedOut,
  formatNotificationTime,
  generateNotificationDigest,
  optimizeNotificationBatch,
  generateAnalyticsSummary,
  debounce,
  throttle,
  generateNotificationId,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeContentForChannel,
};
