'use client'
import { useMessagesMock as useMessages } from "@/hooks/useMessagesMock";
import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Sidebar } from "@/components/account-settings/sidebar";
import { MessagesSidebar } from "@/components/messages/messages-sidebar";
import { MessagesMain } from "@/components/messages/messages-main";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const currentUserId = 'user-1';

export default function MessagesPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
    loadingConversations,
    loadingMessages,
    errorConversations,
    errorMessages,
    sendingMessage,
    errorSend,
  } = useMessages(currentUserId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);

  return (
    // This page is protected and set to both admin and user access as long as they are authenticated
    <ProtectedRoute roles={["admin", "user"]} >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isUserActive={isUserActive}
            setIsUserActive={setIsUserActive}
          />
          <div className="flex-1 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-140px)] flex overflow-hidden">
              <MessagesSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onConversationSelect={setActiveConversationId}
                loading={loadingConversations}
                error={errorConversations}
              />
              <MessagesMain
                activeConversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loadingMessages || sendingMessage}
                error={errorMessages || errorSend}
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
