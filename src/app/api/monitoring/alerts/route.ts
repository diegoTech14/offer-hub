import { NextRequest, NextResponse } from 'next/server';
import { RealTimeAlert } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Generate mock alerts data
    const now = new Date();
    const mockAlerts: RealTimeAlert[] = [
      {
        id: '1',
        type: 'performance',
        severity: 'high',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 80% for the past 5 minutes',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        acknowledged: false,
        metadata: {
          cpu: 85,
          server: 'web-01',
        },
      },
      {
        id: '2',
        type: 'system',
        severity: 'medium',
        title: 'Memory Usage Warning',
        message: 'Memory usage is approaching critical levels (75%)',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        acknowledged: true,
        resolvedAt: new Date(now.getTime() - 15 * 60 * 1000),
        metadata: {
          memory: 75,
          server: 'web-02',
        },
      },
      {
        id: '3',
        type: 'business',
        severity: 'low',
        title: 'Conversion Rate Drop',
        message: 'Conversion rate has dropped by 5% compared to yesterday',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        acknowledged: false,
        metadata: {
          current_rate: 2.1,
          previous_rate: 2.6,
        },
      },
      {
        id: '4',
        type: 'security',
        severity: 'critical',
        title: 'Multiple Failed Login Attempts',
        message: 'Detected 50+ failed login attempts from IP 192.168.1.100',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
        acknowledged: false,
        metadata: {
          ip: '192.168.1.100',
          attempts: 53,
          timeframe: '5 minutes',
        },
      },
      {
        id: '5',
        type: 'performance',
        severity: 'medium',
        title: 'Database Query Slowdown',
        message: 'Average database response time increased to 150ms',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        acknowledged: true,
        metadata: {
          avg_response_time: 150,
          threshold: 100,
        },
      },
    ];

    // Apply filters
    let filteredAlerts = mockAlerts;

    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === 'true';
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === isAcknowledged);
    }

    if (start && end) {
      const startTime = new Date(start);
      const endTime = new Date(end);
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.timestamp >= startTime && alert.timestamp <= endTime
      );
    }

    return NextResponse.json(filteredAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}