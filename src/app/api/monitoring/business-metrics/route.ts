import { NextRequest, NextResponse } from 'next/server';
import { BusinessMetrics } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || '1h';

    // Generate mock business metrics data
    const now = new Date();
    const startTime = start ? new Date(start) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endTime = end ? new Date(end) : now;
    
    const mockData: BusinessMetrics[] = [];
    const points = 24; // Generate 24 data points
    const timeStep = (endTime.getTime() - startTime.getTime()) / points;

    for (let i = 0; i < points; i++) {
      const timestamp = new Date(startTime.getTime() + i * timeStep);
      
      const totalRevenue = 50000 + Math.random() * 20000; // $50k-$70k
      const dailyRevenue = totalRevenue / 30;
      
      mockData.push({
        timestamp,
        revenue: {
          total: totalRevenue,
          daily: dailyRevenue,
          weekly: dailyRevenue * 7,
          monthly: totalRevenue,
          growth: -5 + Math.random() * 20, // -5% to +15%
        },
        transactions: {
          total: 500 + Math.floor(Math.random() * 200), // 500-700
          successful: 450 + Math.floor(Math.random() * 180), // 450-630
          failed: 10 + Math.floor(Math.random() * 20), // 10-30
          pending: 5 + Math.floor(Math.random() * 15), // 5-20
          averageValue: totalRevenue / (500 + Math.random() * 200),
        },
        users: {
          total: 10000 + Math.floor(Math.random() * 5000), // 10k-15k
          active: 2000 + Math.floor(Math.random() * 1000), // 2k-3k
          newRegistrations: 100 + Math.floor(Math.random() * 50), // 100-150
          churnRate: 2 + Math.random() * 3, // 2-5%
        },
        projects: {
          total: 1200 + Math.floor(Math.random() * 300), // 1200-1500
          active: 400 + Math.floor(Math.random() * 200), // 400-600
          completed: 800 + Math.floor(Math.random() * 200), // 800-1000
          averageValue: 2000 + Math.random() * 3000, // $2k-$5k
        },
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business metrics' },
      { status: 500 }
    );
  }
}