"use client";

import React, { useState } from 'react';
import { Bell, Send, Settings, History, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from './notification-center';
import { NotificationPreferences } from './notification-preferences';
import { NotificationHistory } from './notification-history';
import { useMessageNotifications, usePushNotificationSubscription } from '@/hooks/use-message-notifications';
import { useNotification } from '@/lib/contexts/NotificatonContext';

/**
 * Example component demonstrating the complete notification system integration
 * This shows how to use all the notification components together
 */
export function NotificationSystemExample({ userId }: { userId: string }) {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'center' | 'preferences' | 'history'>('center');

  const {
    notifications,
    unreadCount,
    sendNotification,
    requestNotificationPermission,
    preferences,
  } = useMessageNotifications({
    userId,
    autoConnect: true,
    enableRealtime: true,
  });

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    subscription: pushSubscription,
    requestPermission: requestPushPermission,
    subscribe: createPushSubscription,
  } = usePushNotificationSubscription(userId);

  const { actions: notificationActions } = useNotification();

  // Example function to send a test notification
  const sendTestNotification = async () => {
    try {
      await sendNotification({
        type: 'message',
        priority: 'medium',
        title: 'Test Notification',
        message: 'This is a test notification to demonstrate the notification system.',
        conversationId: 'test-conversation-1',
        senderId: userId,
        senderName: 'System',
        channels: [],
        metadata: {
          messageType: 'text',
          category: 'message',
          urgency: 'medium',
        },
        actionUrl: '/messages',
        actionLabel: 'View Messages',
      });

      notificationActions.showToast({
        type: 'success',
        title: 'Test Notification Sent',
        message: 'A test notification has been sent successfully!',
      });
    } catch (error) {
      notificationActions.showToast({
        type: 'error',
        title: 'Failed to Send',
        message: 'Could not send test notification. Please try again.',
      });
    }
  };

  // Handle push notification subscription
  const handlePushSubscription = async () => {
    try {
      if (!isPushSupported) {
        notificationActions.showToast({
          type: 'warning',
          title: 'Not Supported',
          message: 'Push notifications are not supported in this browser.',
        });
        return;
      }

      if (pushPermission === 'denied') {
        notificationActions.showToast({
          type: 'warning',
          title: 'Permission Denied',
          message: 'Push notification permission has been denied. Please enable it in your browser settings.',
        });
        return;
      }

      if (pushSubscription) {
        notificationActions.showToast({
          type: 'info',
          title: 'Already Subscribed',
          message: 'You are already subscribed to push notifications.',
        });
        return;
      }

      const granted = await requestPushPermission();
      if (!granted) {
        notificationActions.showToast({
          type: 'error',
          title: 'Permission Required',
          message: 'Push notification permission is required to enable notifications.',
        });
        return;
      }

      await createPushSubscription();
      notificationActions.showToast({
        type: 'success',
        title: 'Push Notifications Enabled',
        message: 'You will now receive push notifications!',
      });
    } catch (error) {
      notificationActions.showToast({
        type: 'error',
        title: 'Subscription Failed',
        message: 'Failed to subscribe to push notifications. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification System Demo</h1>
            <p className="text-gray-600 mt-2">
              Complete notification and alert system with real-time updates, multi-channel delivery, and user preferences.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Push Notification Status */}
            <div className="flex items-center space-x-2">
              {isPushSupported ? (
                pushPermission === 'granted' ? (
                  pushSubscription ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Bell className="w-3 h-3 mr-1" />
                      Push Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <Bell className="w-3 h-3 mr-1" />
                      Ready to Enable
                    </Badge>
                  )
                ) : (
                  <Badge variant="destructive">
                    <Bell className="w-3 h-3 mr-1" />
                    Permission Needed
                  </Badge>
                )
              ) : (
                <Badge variant="secondary">
                  <Bell className="w-3 h-3 mr-1" />
                  Not Supported
                </Badge>
              )}
            </div>

            {/* Notification Center Button */}
            <Button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Channels Enabled</p>
                  <p className="text-2xl font-bold">
                    {preferences ? Object.values(preferences.channels).filter(Boolean).length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="center">Notification Center</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">History & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="center" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Center Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  The notification center provides a comprehensive interface for managing all your notifications.
                  You can view, filter, search, and take actions on your notifications in real-time.
                </p>
                
                <div className="flex items-center space-x-4">
                  <Button onClick={sendTestNotification}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handlePushSubscription}
                    disabled={!isPushSupported || pushPermission === 'denied'}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {pushSubscription ? 'Push Enabled' : 'Enable Push'}
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Features Demonstrated:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time notification delivery and updates</li>
                    <li>• Multi-channel delivery (in-app, push, email, SMS)</li>
                    <li>• Smart notification routing based on user preferences</li>
                    <li>• Bulk operations (mark as read, delete)</li>
                    <li>• Advanced filtering and search capabilities</li>
                    <li>• Priority-based notification handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <NotificationPreferences userId={userId} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <NotificationHistory userId={userId} />
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Real-time Notifications</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Instant delivery of notifications with WebSocket support for real-time updates.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>Multi-channel Delivery</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Support for in-app, push, email, and SMS notifications with intelligent routing.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>User Preferences</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Granular control over notification types, channels, timing, and frequency.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <History className="w-4 h-4 text-orange-600" />
                  <span>History & Analytics</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Comprehensive tracking and analytics of notification performance and engagement.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-red-600" />
                  <span>Smart Routing</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Intelligent routing based on priority, user preferences, and quiet hours.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Batch Processing</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Efficient processing of multiple notifications with queue management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        userId={userId}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
}

export default NotificationSystemExample;
