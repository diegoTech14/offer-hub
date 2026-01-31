import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const mockNotifications = [
      {
        id: '1',
        type: 'security' as const,
        title: 'Multiple Failed Login Attempts',
        message: 'User account jane.doe@example.com has 5 failed login attempts in the last hour',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        priority: 'high' as const,
        actionUrl: '/admin/users/security-alerts',
      },
      {
        id: '2',
        type: 'system' as const,
        title: 'Server Maintenance Scheduled',
        message: 'Scheduled maintenance window for database updates on Sunday 2AM-4AM EST',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium' as const,
        actionUrl: '/admin/system/maintenance',
      },
      {
        id: '3',
        type: 'content' as const,
        title: 'Content Flagged for Review',
        message: 'User-generated content has been flagged by multiple users for inappropriate material',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'medium' as const,
        actionUrl: '/admin/moderation/queue',
      },
      {
        id: '4',
        type: 'business' as const,
        title: 'Revenue Milestone Reached',
        message: 'Monthly revenue has exceeded $70,000 for the first time',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'low' as const,
        actionUrl: '/admin/analytics/revenue',
      },
      {
        id: '5',
        type: 'user' as const,
        title: 'New Premium User Registration',
        message: 'High-value client has registered and completed onboarding process',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        priority: 'low' as const,
        actionUrl: '/admin/users/premium',
      },
    ];

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = mockNotifications.slice(startIndex, endIndex);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    const response = {
      notifications: paginatedNotifications,
      total: mockNotifications.length,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(mockNotifications.length / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin notifications' },
      { status: 500 }
    );
  }
}