import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mockSystemHealth = {
      uptime: 99.8,
      responseTime: 142,
      errorRate: 0.3,
      databaseStatus: 'healthy' as const,
      serverLoad: 45,
      memoryUsage: 67,
      diskUsage: 42,
      activeConnections: 1234,
      lastChecked: new Date(),
    };

    return NextResponse.json(mockSystemHealth);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
}