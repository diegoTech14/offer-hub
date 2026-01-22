import { NextRequest, NextResponse } from 'next/server';
import { UserBehaviorMetrics } from '@/types/monitoring.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || '1h';

    // Generate mock user behavior metrics data
    const now = new Date();
    const startTime = start ? new Date(start) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endTime = end ? new Date(end) : now;
    
    const mockData: UserBehaviorMetrics[] = [];
    const points = 24; // Generate 24 data points
    const timeStep = (endTime.getTime() - startTime.getTime()) / points;

    const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia'];

    for (let i = 0; i < points; i++) {
      const timestamp = new Date(startTime.getTime() + i * timeStep);
      
      mockData.push({
        timestamp,
        activeUsers: {
          total: 1500 + Math.floor(Math.random() * 500), // 1500-2000
          online: 300 + Math.floor(Math.random() * 200), // 300-500
          new: 50 + Math.floor(Math.random() * 30), // 50-80
          returning: 1200 + Math.floor(Math.random() * 300), // 1200-1500
        },
        pageViews: {
          total: 5000 + Math.floor(Math.random() * 2000), // 5000-7000
          unique: 2000 + Math.floor(Math.random() * 800), // 2000-2800
          bounceRate: 30 + Math.random() * 20, // 30-50%
          averageSessionDuration: 180 + Math.random() * 120, // 3-5 minutes
        },
        userEngagement: {
          clickThroughRate: 2 + Math.random() * 3, // 2-5%
          conversionRate: 1 + Math.random() * 2, // 1-3%
          retentionRate: 60 + Math.random() * 20, // 60-80%
        },
        geographicData: countries.map(country => ({
          country,
          users: Math.floor(100 + Math.random() * 300), // 100-400
          sessions: Math.floor(200 + Math.random() * 500), // 200-700
        })),
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching user behavior metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user behavior metrics' },
      { status: 500 }
    );
  }
}