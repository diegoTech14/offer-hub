"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Conversation } from '@/types/messages.types';

interface MessagesSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function MessagesSidebar({ conversations, activeConversationId, onConversationSelect, loading, error }: MessagesSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col px-4">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-16">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            {/* Skeleton list while loading conversations */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 dark:text-red-400">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-gray-500 dark:text-gray-400">No conversations found.</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg mt-6 mb-6",
                activeConversationId === conversation.id && "bg-gray-50 dark:bg-gray-700"
              )}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="relative mt-5">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.participants?.[0]?.avatar_url || "/placeholder.svg"} alt={conversation.participants?.[0]?.name || "User"} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                    {conversation.participants?.[0]?.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {conversation.participants?.[0]?.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">{conversation.participants?.[0]?.name || 'User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{conversation.last_message?.content || ''}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : ''}</span>
              </div>
              {conversation.unread_count && conversation.unread_count > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">{conversation.unread_count}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
