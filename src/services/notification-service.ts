import axios from 'axios';
import {
  MessageNotification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationHistory,
  NotificationAnalytics,
  NotificationBatch,
  NotificationApiResponse,
  PaginatedNotifications,
  NotificationSearchParams,
  PushNotificationPayload,
  EmailNotificationData,
  SmsNotificationData,
  DeviceSubscription,
  PushSubscription,
  NotificationQueueItem,
  NotificationConsent,
  NotificationOptOut,
  NotificationMetrics,
  NotificationWebhook,
  WebhookPayload,
  NotificationChannelType,
} from '../types/message-notifications.types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

class NotificationService {
  private baseUrl: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.baseUrl = `${API_BASE}/notifications`;
  }

  // Core notification management
  async createNotification(notification: Omit<MessageNotification, 'id' | 'timestamp'>): Promise<NotificationApiResponse<MessageNotification>> {
    try {
      const response = await axios.post(`${this.baseUrl}`, notification);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications(params: NotificationSearchParams = {}): Promise<NotificationApiResponse<PaginatedNotifications>> {
    try {
      const response = await axios.get(`${this.baseUrl}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationById(id: string): Promise<NotificationApiResponse<MessageNotification>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(id: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/${id}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/mark-all-read`, { userId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNotification(id: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Batch processing
  async createNotificationBatch(notifications: Omit<MessageNotification, 'id' | 'timestamp'>[]): Promise<NotificationApiResponse<NotificationBatch>> {
    try {
      const response = await axios.post(`${this.baseUrl}/batch`, { notifications });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBatchStatus(batchId: string): Promise<NotificationApiResponse<NotificationBatch>> {
    try {
      const response = await axios.get(`${this.baseUrl}/batch/${batchId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<NotificationApiResponse<NotificationPreferences>> {
    try {
      const response = await axios.get(`${this.baseUrl}/preferences/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationApiResponse<NotificationPreferences>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Templates
  async getTemplates(): Promise<NotificationApiResponse<NotificationTemplate[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTemplateById(id: string): Promise<NotificationApiResponse<NotificationTemplate>> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationApiResponse<NotificationTemplate>> {
    try {
      const response = await axios.post(`${this.baseUrl}/templates`, template);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<NotificationApiResponse<NotificationTemplate>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/templates/${id}`, template);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Push notifications
  async sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/push`, {
        userId,
        payload
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async subscribeToPush(userId: string, subscription: PushSubscription): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/push/subscribe`, {
        userId,
        subscription
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unsubscribeFromPush(userId: string, endpoint: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.delete(`${this.baseUrl}/push/subscribe`, {
        data: { userId, endpoint }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email notifications
  async sendEmailNotification(data: EmailNotificationData): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/email`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // SMS notifications
  async sendSmsNotification(data: SmsNotificationData): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/sms`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Device management
  async registerDevice(userId: string, device: DeviceSubscription): Promise<NotificationApiResponse<DeviceSubscription>> {
    try {
      const response = await axios.post(`${this.baseUrl}/devices`, {
        userId,
        device
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDevices(userId: string): Promise<NotificationApiResponse<DeviceSubscription[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/devices/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDeviceStatus(deviceId: string, isActive: boolean): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/devices/${deviceId}`, { isActive });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics and metrics
  async getNotificationAnalytics(
    userId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<NotificationApiResponse<NotificationAnalytics>> {
    try {
      const response = await axios.get(`${this.baseUrl}/analytics`, {
        params: { userId, ...dateRange }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationHistory(
    notificationId: string
  ): Promise<NotificationApiResponse<NotificationHistory[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${notificationId}/history`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMetrics(dateRange?: { start: string; end: string }): Promise<NotificationApiResponse<NotificationMetrics>> {
    try {
      const response = await axios.get(`${this.baseUrl}/metrics`, {
        params: dateRange
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Queue management
  async getQueueStatus(): Promise<NotificationApiResponse<NotificationQueueItem[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/queue`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async retryFailedNotification(queueItemId: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/queue/${queueItemId}/retry`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Consent and opt-out management
  async getConsentStatus(userId: string): Promise<NotificationApiResponse<NotificationConsent[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/consent/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateConsent(consent: NotificationConsent): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/consent`, consent);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOptOutStatus(userId: string): Promise<NotificationApiResponse<NotificationOptOut[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/opt-out/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async optOut(userId: string, optOut: Omit<NotificationOptOut, 'userId' | 'optedOutAt'>): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseUrl}/opt-out`, {
        userId,
        ...optOut
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Webhook management
  async createWebhook(webhook: Omit<NotificationWebhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationApiResponse<NotificationWebhook>> {
    try {
      const response = await axios.post(`${this.baseUrl}/webhooks`, webhook);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhooks(): Promise<NotificationApiResponse<NotificationWebhook[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/webhooks`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWebhook(id: string, webhook: Partial<NotificationWebhook>): Promise<NotificationApiResponse<NotificationWebhook>> {
    try {
      const response = await axios.patch(`${this.baseUrl}/webhooks/${id}`, webhook);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWebhook(id: string): Promise<NotificationApiResponse<void>> {
    try {
      const response = await axios.delete(`${this.baseUrl}/webhooks/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Real-time notifications (WebSocket support)
  async connectToRealtime(userId: string): Promise<WebSocket> {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications/${userId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to notification WebSocket');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }

  // Utility methods
  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1) {
        await this.delay(this.retryDelay);
        return this.retryOperation(operation, attempts - 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      return new Error(`Notification Service Error (${status}): ${message}`);
    }
    return new Error(`Notification Service Error: ${error.message || 'Unknown error'}`);
  }

  // Smart notification routing
  async sendSmartNotification(
    userId: string,
    notification: Omit<MessageNotification, 'id' | 'timestamp' | 'channels'>,
    preferences?: NotificationPreferences
  ): Promise<NotificationApiResponse<MessageNotification>> {
    try {
      // Get user preferences if not provided
      if (!preferences) {
        const prefsResponse = await this.getUserPreferences(userId);
        preferences = prefsResponse.data;
      }

      // Determine optimal channels based on preferences and notification priority
      const channels = this.determineOptimalChannels(notification, preferences);

      const fullNotification = {
        ...notification,
        channels
      };

      return await this.createNotification(fullNotification);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private determineOptimalChannels(
    notification: Omit<MessageNotification, 'id' | 'timestamp' | 'channels'>,
    preferences: NotificationPreferences
  ): MessageNotification['channels'] {
    const channels: MessageNotification['channels'] = [];

    // Always include in-app notifications
    if (preferences.channels.inApp) {
      channels.push({
        type: 'in-app',
        enabled: true,
        delivered: false,
        failed: false,
        retryCount: 0,
        maxRetries: 3
      });
    }

    // Add push notifications based on priority and preferences
    if (preferences.channels.push && notification.priority !== 'low') {
      channels.push({
        type: 'push',
        enabled: true,
        delivered: false,
        failed: false,
        retryCount: 0,
        maxRetries: 3
      });
    }

    // Add email notifications for high priority or if user prefers email
    if (preferences.channels.email && (notification.priority === 'high' || notification.priority === 'urgent')) {
      channels.push({
        type: 'email',
        enabled: true,
        delivered: false,
        failed: false,
        retryCount: 0,
        maxRetries: 3
      });
    }

    // Add SMS for urgent notifications
    if (preferences.channels.sms && notification.priority === 'urgent') {
      channels.push({
        type: 'sms',
        enabled: true,
        delivered: false,
        failed: false,
        retryCount: 0,
        maxRetries: 3
      });
    }

    return channels;
  }

  // Template-based notification sending
  async sendTemplateNotification(
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    overrides?: Partial<MessageNotification>
  ): Promise<NotificationApiResponse<MessageNotification>> {
    try {
      const response = await axios.post(`${this.baseUrl}/template/send`, {
        userId,
        templateId,
        variables,
        overrides
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
export default notificationService;
