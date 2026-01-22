import { NextRequest, NextResponse } from 'next/server';
import { SystemMetrics } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || '1h';

    // Generate mock system metrics data
    const now = new Date();
    const startTime = start ? new Date(start) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endTime = end ? new Date(end) : now;
    
    const mockData: SystemMetrics[] = [];
    const points = 24; // Generate 24 data points
    const timeStep = (endTime.getTime() - startTime.getTime()) / points;

    for (let i = 0; i < points; i++) {
      const timestamp = new Date(startTime.getTime() + i * timeStep);
      
      mockData.push({
        timestamp,
        cpu: {
          usage: 45 + Math.random() * 30, // 45-75%
          loadAverage: [1.2, 1.5, 1.8],
          temperature: 45 + Math.random() * 20, // 45-65°C
        },
        memory: {
          total: 16 * 1024 * 1024 * 1024, // 16GB
          used: 8 * 1024 * 1024 * 1024 + Math.random() * 4 * 1024 * 1024 * 1024, // 8-12GB
          free: 4 * 1024 * 1024 * 1024 - Math.random() * 2 * 1024 * 1024 * 1024, // 2-4GB
          usage: 50 + Math.random() * 25, // 50-75%
        },
        disk: {
          total: 500 * 1024 * 1024 * 1024, // 500GB
          used: 200 * 1024 * 1024 * 1024 + Math.random() * 100 * 1024 * 1024 * 1024, // 200-300GB
          free: 200 * 1024 * 1024 * 1024 - Math.random() * 50 * 1024 * 1024 * 1024, // 150-200GB
          usage: 40 + Math.random() * 20, // 40-60%
        },
        network: {
          bytesIn: Math.floor(Math.random() * 1000000),
          bytesOut: Math.floor(Math.random() * 800000),
          packetsIn: Math.floor(Math.random() * 10000),
          packetsOut: Math.floor(Math.random() * 8000),
        },
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}