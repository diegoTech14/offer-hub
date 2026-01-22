import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMetrics } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || '1h';

    // Generate mock performance metrics data
    const now = new Date();
    const startTime = start ? new Date(start) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endTime = end ? new Date(end) : now;
    
    const mockData: PerformanceMetrics[] = [];
    const points = 24; // Generate 24 data points
    const timeStep = (endTime.getTime() - startTime.getTime()) / points;

    for (let i = 0; i < points; i++) {
      const timestamp = new Date(startTime.getTime() + i * timeStep);
      
      mockData.push({
        timestamp,
        responseTime: {
          api: 150 + Math.random() * 100, // 150-250ms
          database: 50 + Math.random() * 50, // 50-100ms
          cache: 5 + Math.random() * 10, // 5-15ms
        },
        throughput: {
          requestsPerSecond: 100 + Math.random() * 200, // 100-300 RPS
          transactionsPerSecond: 50 + Math.random() * 100, // 50-150 TPS
        },
        errorRates: {
          total: Math.random() * 5, // 0-5%
          http4xx: Math.random() * 2, // 0-2%
          http5xx: Math.random() * 1, // 0-1%
          database: Math.random() * 0.5, // 0-0.5%
        },
        uptime: {
          percentage: 99.5 + Math.random() * 0.5, // 99.5-100%
          lastDowntime: i === 0 ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) : undefined,
          downtimeDuration: i === 0 ? 300000 : undefined, // 5 minutes in milliseconds
        },
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}