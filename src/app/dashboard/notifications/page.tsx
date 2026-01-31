"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, MessageCircle, Briefcase, Wallet as WalletIcon } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "message",
      icon: MessageCircle,
      title: "New message from Alex Johnson",
      description: "Regarding the Website Development project",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      type: "project",
      icon: Briefcase,
      title: "Project milestone completed",
      description: "Mobile App UI/UX Design - Phase 2",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "payment",
      icon: WalletIcon,
      title: "Payment received",
      description: "$500.00 XLM deposited to your wallet",
      time: "1 day ago",
      unread: false,
    },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-600";
      case "project":
        return "bg-purple-100 text-purple-600";
      case "payment":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showAuth={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64">
          <ClientSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Stay updated with your activities</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow ${
                    notification.unread ? "border-l-4 border-l-[#149A9B]" : ""
                  }`}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={`p-2 rounded-full ${getIconColor(notification.type)}`}>
                      <notification.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        {notification.unread && (
                          <Badge className="bg-[#149A9B] hover:bg-[#149A9B] text-white text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


