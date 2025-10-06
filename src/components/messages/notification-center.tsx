"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, MoreVertical, Check, CheckCheck, Trash2, Settings, X, AlertCircle, Info, MessageSquare, FileText, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMessageNotifications } from '@/hooks/use-message-notifications';
import { MessageNotification, NotificationChannelType } from '@/types/message-notifications.types';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const TYPE_ICONS = {
  message: MessageSquare,
  system: Info,
  alert: AlertCircle,
  reminder: Bell,
  payment: CreditCard,
  security: Shield,
  file: FileText,
};

const CHANNEL_LABELS: Record<NotificationChannelType, string> = {
  'in-app': 'In-App',
  'push': 'Push',
  'email': 'Email',
  'sms': 'SMS',
};

export function NotificationCenter({ userId, isOpen, onClose, className }: NotificationCenterProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    hasNextPage,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    clearError,
    refresh,
  } = useMessageNotifications({
    userId,
    autoConnect: isOpen,
    enableRealtime: true,
  });

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'read') return notification.read;
    return true;
  });

  // Handle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Handle bulk actions
  const handleBulkMarkAsRead = async () => {
    for (const notificationId of selectedNotifications) {
      await markAsRead(notificationId);
    }
    clearSelection();
  };

  const handleBulkDelete = async () => {
    for (const notificationId of selectedNotifications) {
      await deleteNotification(notificationId);
    }
    clearSelection();
  };

  const handleBulkMarkAllAsRead = async () => {
    await markAllAsRead();
    clearSelection();
  };

  // Get notification icon
  const getNotificationIcon = (notification: MessageNotification) => {
    const IconComponent = TYPE_ICONS[notification.metadata?.category as keyof typeof TYPE_ICONS] || TYPE_ICONS.message;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: MessageNotification['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Render notification item
  const renderNotificationItem = (notification: MessageNotification) => {
    const isSelected = selectedNotifications.includes(notification.id);
    const IconComponent = TYPE_ICONS[notification.metadata?.category as keyof typeof TYPE_ICONS] || TYPE_ICONS.message;

    return (
      <Card 
        key={notification.id} 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/30",
          isSelected && "ring-2 ring-blue-500",
          notification.priority === 'urgent' && "border-red-200 bg-red-50/30"
        )}
        onClick={() => !notification.read && markAsRead(notification.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={isSelected}
              onChange={() => toggleNotificationSelection(notification.id)}
              className="mt-1"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                !notification.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              )}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className={cn(
                    "text-sm font-medium",
                    !notification.read ? "text-gray-900" : "text-gray-600"
                  )}>
                    {notification.title}
                  </h4>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getPriorityBadgeColor(notification.priority))}
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">
                    {formatNotificationTime(notification.timestamp)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.read && (
                        <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className={cn(
                "text-sm mt-1 line-clamp-2",
                !notification.read ? "text-gray-700" : "text-gray-500"
              )}>
                {notification.message}
              </p>

              {notification.senderName && (
                <div className="flex items-center space-x-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={notification.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {notification.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">
                    from {notification.senderName}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-2">
                {notification.channels.map((channel) => (
                  <Badge 
                    key={channel.type} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {CHANNEL_LABELS[channel.type]}
                  </Badge>
                ))}
              </div>

              {notification.actionUrl && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto mt-2 text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(notification.actionUrl, '_blank');
                  }}
                >
                  {notification.actionLabel || 'View Details'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50", className)} onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {showFilters && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <Checkbox
                      key={priority}
                      checked={filters.priority === priority}
                      onCheckedChange={(checked) => 
                        setFilters({ 
                          ...filters, 
                          priority: checked ? priority as MessageNotification['priority'] : undefined 
                        })
                      }
                      className="mr-2"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center justify-between p-4 border-b bg-blue-50">
              <span className="text-sm text-blue-700">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1">
              {/* Action Bar */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  {selectedNotifications.length === 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllNotifications}
                        disabled={filteredNotifications.length === 0}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkMarkAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Mark All Read
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>

              {/* Notifications List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {isLoading && filteredNotifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : error ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600">{error}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearError}
                          className="mt-2"
                        >
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  ) : filteredNotifications.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {activeTab === 'unread' ? 'No unread notifications' : 
                           activeTab === 'read' ? 'No read notifications' : 
                           'No notifications yet'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {filteredNotifications.map(renderNotificationItem)}
                      
                      {hasNextPage && (
                        <div className="text-center py-4">
                          <Button
                            variant="outline"
                            onClick={loadMoreNotifications}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Loading...' : 'Load More'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
