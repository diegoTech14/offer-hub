import {
  SystemMetrics,
  PerformanceMetrics,
  UserBehaviorMetrics,
  BusinessMetrics,
  RealTimeAlert,
  MonitoringDashboard,
  AnalyticsReport,
  UserAnalyticsData,
  TimeRange,
  WebSocketMessage,
  CustomMetric,
  HeatmapData,
  TimeSeriesData,
} from '@/types/monitoring.types';

class MonitoringService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  constructor() {
    this.initializeWebSocket();
  }

  // WebSocket Management
  private initializeWebSocket() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Monitoring WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Monitoring WebSocket disconnected');
        this.emit('connection', { status: 'disconnected' });
        this.attemptReconnection();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error: 'WebSocket connection error' });
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.attemptReconnection();
    }
  }

  private attemptReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, delay);
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'system_metrics':
        this.emit('systemMetrics', message.data);
        break;
      case 'user_metrics':
        this.emit('userMetrics', message.data);
        break;
      case 'business_metrics':
        this.emit('businessMetrics', message.data);
        break;
      case 'alert':
        this.emit('alert', message.data);
        break;
      case 'notification':
        this.emit('notification', message.data);
        break;
    }
  }

  // Event Management
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // API Calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // System Monitoring
  async getSystemMetrics(timeRange?: TimeRange): Promise<SystemMetrics[]> {
    const params = timeRange ? new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    }) : '';

    return this.apiCall<SystemMetrics[]>(`/monitoring/system-metrics?${params}`);
  }

  async getPerformanceMetrics(timeRange?: TimeRange): Promise<PerformanceMetrics[]> {
    const params = timeRange ? new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    }) : '';

    return this.apiCall<PerformanceMetrics[]>(`/monitoring/performance-metrics?${params}`);
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastCheck: Date;
    }>;
  }> {
    return this.apiCall('/monitoring/system-health');
  }

  // User Analytics
  async getUserBehaviorMetrics(timeRange?: TimeRange): Promise<UserBehaviorMetrics[]> {
    const params = timeRange ? new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    }) : '';

    return this.apiCall<UserBehaviorMetrics[]>(`/monitoring/user-behavior?${params}`);
  }

  async getUserAnalytics(timeRange: TimeRange): Promise<UserAnalyticsData> {
    const params = new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    });

    return this.apiCall<UserAnalyticsData>(`/monitoring/user-analytics?${params}`);
  }

  async getHeatmapData(page: string, timeRange: TimeRange): Promise<HeatmapData[]> {
    const params = new URLSearchParams({
      page,
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    });

    return this.apiCall<HeatmapData[]>(`/monitoring/heatmap?${params}`);
  }

  async getConversionFunnel(funnelId: string, timeRange: TimeRange): Promise<any> {
    const params = new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    });

    return this.apiCall(`/monitoring/funnel/${funnelId}?${params}`);
  }

  // Business Metrics
  async getBusinessMetrics(timeRange?: TimeRange): Promise<BusinessMetrics[]> {
    const params = timeRange ? new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    }) : '';

    return this.apiCall<BusinessMetrics[]>(`/monitoring/business-metrics?${params}`);
  }

  async getRevenueAnalytics(timeRange: TimeRange): Promise<{
    totalRevenue: number;
    revenueByPeriod: TimeSeriesData[];
    revenueBySource: Array<{ source: string; amount: number; percentage: number }>;
    forecasting: TimeSeriesData[];
  }> {
    const params = new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    });

    return this.apiCall(`/monitoring/revenue-analytics?${params}`);
  }

  // Alerts Management
  async getAlerts(filters?: {
    type?: string;
    severity?: string;
    acknowledged?: boolean;
    timeRange?: TimeRange;
  }): Promise<RealTimeAlert[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'timeRange' && typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
            params.append('start', (value as TimeRange).start.toISOString());
            params.append('end', (value as TimeRange).end.toISOString());
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    return this.apiCall<RealTimeAlert[]>(`/monitoring/alerts?${params}`);
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.apiCall(`/monitoring/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  }

  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    await this.apiCall(`/monitoring/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  async createAlert(alert: Omit<RealTimeAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<RealTimeAlert> {
    return this.apiCall<RealTimeAlert>('/monitoring/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  // Dashboard Management
  async getDashboards(): Promise<MonitoringDashboard[]> {
    return this.apiCall<MonitoringDashboard[]>('/monitoring/dashboards');
  }

  async getDashboard(id: string): Promise<MonitoringDashboard> {
    return this.apiCall<MonitoringDashboard>(`/monitoring/dashboards/${id}`);
  }

  async createDashboard(dashboard: Omit<MonitoringDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringDashboard> {
    return this.apiCall<MonitoringDashboard>('/monitoring/dashboards', {
      method: 'POST',
      body: JSON.stringify(dashboard),
    });
  }

  async updateDashboard(id: string, updates: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    return this.apiCall<MonitoringDashboard>(`/monitoring/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDashboard(id: string): Promise<void> {
    await this.apiCall(`/monitoring/dashboards/${id}`, {
      method: 'DELETE',
    });
  }

  async shareDashboard(id: string, permissions: Array<{ userId: string; role: string }>): Promise<void> {
    await this.apiCall(`/monitoring/dashboards/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ permissions }),
    });
  }

  // Custom Metrics
  async getCustomMetrics(): Promise<CustomMetric[]> {
    return this.apiCall<CustomMetric[]>('/monitoring/custom-metrics');
  }

  async createCustomMetric(metric: Omit<CustomMetric, 'id' | 'createdAt'>): Promise<CustomMetric> {
    return this.apiCall<CustomMetric>('/monitoring/custom-metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }

  async updateCustomMetric(id: string, updates: Partial<CustomMetric>): Promise<CustomMetric> {
    return this.apiCall<CustomMetric>(`/monitoring/custom-metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCustomMetric(id: string): Promise<void> {
    await this.apiCall(`/monitoring/custom-metrics/${id}`, {
      method: 'DELETE',
    });
  }

  async evaluateCustomMetric(id: string, timeRange: TimeRange): Promise<TimeSeriesData[]> {
    const params = new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      interval: timeRange.interval,
    });

    return this.apiCall<TimeSeriesData[]>(`/monitoring/custom-metrics/${id}/evaluate?${params}`);
  }

  // Reports
  async generateReport(reportId: string): Promise<{ reportUrl: string; expiresAt: Date }> {
    return this.apiCall(`/monitoring/reports/${reportId}/generate`, {
      method: 'POST',
    });
  }

  async getReports(): Promise<AnalyticsReport[]> {
    return this.apiCall<AnalyticsReport[]>('/monitoring/reports');
  }

  async createReport(report: Omit<AnalyticsReport, 'id' | 'createdAt'>): Promise<AnalyticsReport> {
    return this.apiCall<AnalyticsReport>('/monitoring/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async updateReport(id: string, updates: Partial<AnalyticsReport>): Promise<AnalyticsReport> {
    return this.apiCall<AnalyticsReport>(`/monitoring/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteReport(id: string): Promise<void> {
    await this.apiCall(`/monitoring/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Data Export
  async exportData(
    type: 'system' | 'user' | 'business' | 'alerts',
    format: 'csv' | 'json' | 'xlsx',
    timeRange: TimeRange,
    filters?: Record<string, any>
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    return this.apiCall('/monitoring/export', {
      method: 'POST',
      body: JSON.stringify({
        type,
        format,
        timeRange,
        filters,
      }),
    });
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Connection Status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const monitoringService = new MonitoringService();
export default monitoringService;