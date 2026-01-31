import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mockDashboardData = {
      statistics: {
        totalUsers: 15234,
        activeUsers: 3421,
        userGrowthRate: 12.5,
        totalProjects: 1456,
        activeProjects: 234,
        projectGrowthRate: 8.3,
        monthlyRevenue: 67500,
        revenueGrowthRate: 15.2,
      },
      systemHealth: {
        uptime: 99.8,
        responseTime: 142,
        errorRate: 0.3,
        databaseStatus: 'healthy' as const,
        serverLoad: 45,
      },
      recentActivities: [
        {
          id: '1',
          adminId: 'admin-1',
          adminName: 'John Admin',
          action: 'user_verified',
          resource: 'user',
          resourceId: 'user-123',
          details: 'Verified user account for john.doe@example.com',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          ipAddress: '192.168.1.100',
        },
        {
          id: '2',
          adminId: 'admin-1',
          adminName: 'John Admin',
          action: 'project_approved',
          resource: 'project',
          resourceId: 'project-456',
          details: 'Approved project "E-commerce Website Development"',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          ipAddress: '192.168.1.100',
        },
        {
          id: '3',
          adminId: 'admin-2',
          adminName: 'Jane Admin',
          action: 'content_moderated',
          resource: 'content',
          resourceId: 'content-789',
          details: 'Removed inappropriate content from user profile',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.101',
        },
      ],
      pendingModerations: 12,
      unreadNotifications: 5,
    };

    return NextResponse.json(mockDashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}