"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, Clock, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useMessageNotifications, usePushNotificationSubscription } from '@/hooks/use-message-notifications';
import { NotificationPreferences, NotificationChannelType } from '@/types/message-notifications.types';
import { useNotification } from '@/lib/contexts/NotificatonContext';
import { cn } from '@/lib/utils';

interface NotificationPreferencesProps {
  userId: string;
  className?: string;
}

export function NotificationPreferences({ userId, className }: NotificationPreferencesProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localPreferences, setLocalPreferences] = useState<Partial<NotificationPreferences>>({});

  const {
    preferences,
    isLoading,
    error,
    updatePreferences,
    loadPreferences,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
  } = useMessageNotifications({
    userId,
    autoConnect: true,
  });

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    subscription: pushSubscription,
    requestPermission: requestPushPermission,
    subscribe: createPushSubscription,
    unsubscribe: removePushSubscription,
  } = usePushNotificationSubscription(userId);

  const { actions: notificationActions } = useNotification();

  // Initialize local preferences when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
      setIsDirty(false);
      setHasChanges(false);
    }
  }, [preferences]);

  // Handle preference changes
  const handlePreferenceChange = (path: string, value: any) => {
    setLocalPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
    
    setIsDirty(true);
    setHasChanges(true);
  };

  // Save preferences
  const handleSavePreferences = async () => {
    if (!hasChanges || !localPreferences) return;

    try {
      setSaveStatus('saving');
      await updatePreferences(localPreferences);
      setSaveStatus('success');
      setIsDirty(false);
      setHasChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Reset preferences
  const handleResetPreferences = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setIsDirty(false);
      setHasChanges(false);
    }
  };

  // Handle push notification subscription
  const handlePushSubscription = async () => {
    try {
      if (pushSubscription) {
        // Unsubscribe
        await removePushSubscription();
        await unsubscribeFromPush(pushSubscription.endpoint);
        notificationActions.showToast({
          type: 'success',
          title: 'Push Notifications Disabled',
          message: 'You will no longer receive push notifications',
        });
      } else {
        // Subscribe
        if (pushPermission !== 'granted') {
          const granted = await requestPushPermission();
          if (!granted) {
            notificationActions.showToast({
              type: 'error',
              title: 'Permission Denied',
              message: 'Push notification permission was denied',
            });
            return;
          }
        }

        const subscription = await createPushSubscription();
        await subscribeToPush(subscription);
        notificationActions.showToast({
          type: 'success',
          title: 'Push Notifications Enabled',
          message: 'You will now receive push notifications',
        });
      }
    } catch (err) {
      notificationActions.showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update push notification settings',
      });
    }
  };

  // Get channel icon
  const getChannelIcon = (channel: NotificationChannelType) => {
    switch (channel) {
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'in-app': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Get save button status
  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Saved
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
            Error
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadPreferences} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-gray-600">Manage how and when you receive notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          {isDirty && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleResetPreferences}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            onClick={handleSavePreferences}
            disabled={!hasChanges || saveStatus === 'saving'}
            className={cn(
              saveStatus === 'success' && 'bg-green-600 hover:bg-green-700',
              saveStatus === 'error' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {getSaveButtonContent()}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Delivery Channels</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        {/* Delivery Channels */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* In-App Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="font-medium">In-App Notifications</Label>
                    <p className="text-sm text-gray-600">Show notifications within the application</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.channels?.inApp ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('channels.inApp', checked)}
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    {!isPushSupported && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Not Supported
                      </Badge>
                    )}
                    {pushPermission === 'denied' && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Permission Denied
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localPreferences.channels?.push ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('channels.push', checked)}
                    disabled={!isPushSupported || pushPermission === 'denied'}
                  />
                  {isPushSupported && pushPermission !== 'denied' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePushSubscription}
                    >
                      {pushSubscription ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.channels?.email ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('channels.email', checked)}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <Label className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via text message</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.channels?.sms ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('channels.sms', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Notifications */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Message Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">New Messages</Label>
                    <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                  </div>
                  <Switch
                    checked={localPreferences.messageNotifications?.newMessage ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('messageNotifications.newMessage', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Message Read Receipts</Label>
                    <p className="text-sm text-gray-600">Get notified when your messages are read</p>
                  </div>
                  <Switch
                    checked={localPreferences.messageNotifications?.messageRead ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('messageNotifications.messageRead', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Typing Indicators</Label>
                    <p className="text-sm text-gray-600">Show when someone is typing</p>
                  </div>
                  <Switch
                    checked={localPreferences.messageNotifications?.typingIndicator ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('messageNotifications.typingIndicator', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Delivery Confirmations</Label>
                    <p className="text-sm text-gray-600">Get notified when messages are delivered</p>
                  </div>
                  <Switch
                    checked={localPreferences.messageNotifications?.messageDelivery ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('messageNotifications.messageDelivery', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Notifications */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Project Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Project Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about project status changes</p>
                  </div>
                  <Switch
                    checked={localPreferences.projectNotifications?.projectUpdate ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('projectNotifications.projectUpdate', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Milestone Reached</Label>
                    <p className="text-sm text-gray-600">Get notified when project milestones are completed</p>
                  </div>
                  <Switch
                    checked={localPreferences.projectNotifications?.milestoneReached ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('projectNotifications.milestoneReached', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Deadline Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminded about upcoming deadlines</p>
                  </div>
                  <Switch
                    checked={localPreferences.projectNotifications?.deadlineReminder ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('projectNotifications.deadlineReminder', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Payment Received</Label>
                    <p className="text-sm text-gray-600">Get notified when payments are received</p>
                  </div>
                  <Switch
                    checked={localPreferences.projectNotifications?.paymentReceived ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('projectNotifications.paymentReceived', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Notifications */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>System Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Security Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about security-related events</p>
                  </div>
                  <Switch
                    checked={localPreferences.systemNotifications?.securityAlerts ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('systemNotifications.securityAlerts', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Account Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about account changes</p>
                  </div>
                  <Switch
                    checked={localPreferences.systemNotifications?.accountUpdates ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('systemNotifications.accountUpdates', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Maintenance Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about scheduled maintenance</p>
                  </div>
                  <Switch
                    checked={localPreferences.systemNotifications?.maintenanceAlerts ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('systemNotifications.maintenanceAlerts', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Feature Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about new features and updates</p>
                  </div>
                  <Switch
                    checked={localPreferences.systemNotifications?.featureUpdates ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('systemNotifications.featureUpdates', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Preferences */}
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Timing & Frequency</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Quiet Hours</Label>
                    <p className="text-sm text-gray-600">Set times when you don't want to receive notifications</p>
                  </div>
                  <Switch
                    checked={localPreferences.quietHours?.enabled ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('quietHours.enabled', checked)}
                  />
                </div>

                {localPreferences.quietHours?.enabled && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label className="text-sm">Start Time</Label>
                      <Input
                        type="time"
                        value={localPreferences.quietHours?.startTime || '22:00'}
                        onChange={(e) => handlePreferenceChange('quietHours.startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">End Time</Label>
                      <Input
                        type="time"
                        value={localPreferences.quietHours?.endTime || '08:00'}
                        onChange={(e) => handlePreferenceChange('quietHours.endTime', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm">Timezone</Label>
                      <Select
                        value={localPreferences.quietHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                        onValueChange={(value) => handlePreferenceChange('quietHours.timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                            {Intl.DateTimeFormat().resolvedOptions().timeZone}
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Frequency */}
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Notification Frequency</Label>
                  <p className="text-sm text-gray-600">Choose how often you want to receive notifications</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Immediate Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications as they happen</p>
                    </div>
                    <Switch
                      checked={localPreferences.frequency?.immediate ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('frequency.immediate', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Digest Notifications</Label>
                      <p className="text-sm text-gray-600">Receive a summary of notifications</p>
                    </div>
                    <Switch
                      checked={localPreferences.frequency?.digest ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange('frequency.digest', checked)}
                    />
                  </div>

                  {localPreferences.frequency?.digest && (
                    <div className="ml-6">
                      <Label className="text-sm">Digest Frequency</Label>
                      <Select
                        value={localPreferences.frequency?.digestFrequency || 'daily'}
                        onValueChange={(value) => handlePreferenceChange('frequency.digestFrequency', value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationPreferences;
