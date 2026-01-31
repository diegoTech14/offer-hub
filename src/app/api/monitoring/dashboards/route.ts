import { NextRequest, NextResponse } from 'next/server';
import { MonitoringDashboard } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    // Generate mock dashboards data
    const now = new Date();
    const mockDashboards: MonitoringDashboard[] = [
      {
        id: '1',
        name: 'System Overview',
        description: 'Main system monitoring dashboard with key performance indicators',
        isDefault: true,
        widgets: [
          {
            id: 'widget-1',
            type: 'metric-card',
            title: 'CPU Usage',
            config: {
              chartType: 'line',
              aggregation: 'avg',
              timeRange: {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now,
                interval: '1h',
              },
              thresholds: {
                warning: 70,
                critical: 85,
              },
            },
            position: { x: 0, y: 0 },
            size: { width: 4, height: 2 },
            dataSource: {
              type: 'system',
              endpoint: '/api/monitoring/system-metrics',
            },
          },
          {
            id: 'widget-2',
            type: 'line-chart',
            title: 'Response Times',
            config: {
              chartType: 'line',
              aggregation: 'avg',
              timeRange: {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now,
                interval: '1h',
              },
            },
            position: { x: 4, y: 0 },
            size: { width: 8, height: 4 },
            dataSource: {
              type: 'system',
              endpoint: '/api/monitoring/performance-metrics',
            },
          },
        ],
        layout: {
          columns: 12,
          rows: 8,
          gap: 16,
        },
        filters: {
          timeRange: {
            start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            end: now,
            interval: '1h',
          },
        },
        refreshInterval: 30000, // 30 seconds
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        shared: true,
        permissions: [
          {
            userId: 'admin',
            role: 'admin',
          },
        ],
      },
      {
        id: '2',
        name: 'User Analytics',
        description: 'User behavior and engagement metrics dashboard',
        isDefault: false,
        widgets: [
          {
            id: 'widget-3',
            type: 'pie-chart',
            title: 'User Distribution',
            config: {
              chartType: 'pie',
              aggregation: 'sum',
              timeRange: {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now,
                interval: '24h',
              },
            },
            position: { x: 0, y: 0 },
            size: { width: 6, height: 4 },
            dataSource: {
              type: 'user',
              endpoint: '/api/monitoring/user-behavior',
            },
          },
          {
            id: 'widget-4',
            type: 'bar-chart',
            title: 'Page Views',
            config: {
              chartType: 'bar',
              aggregation: 'sum',
              timeRange: {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now,
                interval: '1h',
              },
            },
            position: { x: 6, y: 0 },
            size: { width: 6, height: 4 },
            dataSource: {
              type: 'user',
              endpoint: '/api/monitoring/user-behavior',
            },
          },
        ],
        layout: {
          columns: 12,
          rows: 8,
          gap: 16,
        },
        filters: {
          timeRange: {
            start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            end: now,
            interval: '1h',
          },
        },
        refreshInterval: 60000, // 1 minute
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        shared: false,
        permissions: [
          {
            userId: 'admin',
            role: 'admin',
          },
        ],
      },
    ];

    return NextResponse.json(mockDashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dashboard = await request.json();
    
    // In a real implementation, you would save to database
    const newDashboard: MonitoringDashboard = {
      ...dashboard,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newDashboard, { status: 201 });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}