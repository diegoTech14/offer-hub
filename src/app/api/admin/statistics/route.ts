import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mockStatistics = {
      totalUsers: 15234,
      activeUsers: 3421,
      userGrowthRate: 12.5,
      totalProjects: 1456,
      activeProjects: 234,
      projectGrowthRate: 8.3,
      monthlyRevenue: 67500,
      revenueGrowthRate: 15.2,
      conversionRate: 3.2,
      averageProjectValue: 2450,
      retentionRate: 78.5,
    };

    return NextResponse.json(mockStatistics);
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}