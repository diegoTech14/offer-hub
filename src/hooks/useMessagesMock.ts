import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message, CreateMessageDTO } from '@/types/messages.types';

interface UseMessagesResult {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  activeConversation: Conversation | null;
  messages: Message[];
  handleSendMessage: (content: string, file?: File) => Promise<void>;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  errorConversations: string | null;
  errorMessages: string | null;
  errorSend: string | null;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    client_id: 'user-1',
    freelancer_id: 'user-2',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    participants: [
      { id: 'user-1', name: 'You', avatar_url: '/avatar.png', online: true },
      { id: 'user-2', name: 'Alex Johnson', avatar_url: '/person1.png', online: false }
    ],
    last_message: {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'user-2',
      content: 'Thanks for the great work!',
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    unread_count: 2,
  },
  {
    id: 'conv-2',
    client_id: 'user-1',
    freelancer_id: 'user-3',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date().toISOString(),
    participants: [
      { id: 'user-1', name: 'You', avatar_url: '/avatar.png', online: true },
      { id: 'user-3', name: 'Sarah Wilson', avatar_url: '/person2.png', online: true }
    ],
    last_message: {
      id: 'msg-2',
      conversation_id: 'conv-2',
      sender_id: 'user-3',
      content: 'Can we schedule a call for tomorrow?',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    unread_count: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Hello! I\'m ready to start the project.',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'user-2',
      content: 'Great! Here are the requirements...',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 7000000).toISOString(),
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Perfect, I\'ll get started right away.',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 6800000).toISOString(),
    },
    {
      id: 'msg-4',
      conversation_id: 'conv-1',
      sender_id: 'user-2',
      content: 'Thanks for the great work!',
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-5',
      conversation_id: 'conv-2',
      sender_id: 'user-1',
      content: 'Hi Sarah, how are you?',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg-6',
      conversation_id: 'conv-2',
      sender_id: 'user-3',
      content: 'Can we schedule a call for tomorrow?',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

export function useMessagesMock(userId?: string): UseMessagesResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [errorSend, setErrorSend] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    if (!userId) return;
    setLoadingConversations(true);
    setErrorConversations(null);
    
    // Simulate API delay
    setTimeout(() => {
      setConversations(mockConversations);
      setLoadingConversations(false);
    }, 1000);
  }, [userId]);

  // Set active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    const conv = conversations.find((c) => c.id === activeConversationId) || null;
    setActiveConversation(conv);
  }, [activeConversationId, conversations]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;
    setLoadingMessages(true);
    setErrorMessages(null);
    
    // Simulate API delay
    setTimeout(() => {
      const convMessages = mockMessages[activeConversationId] || [];
      setMessages(convMessages);
      setLoadingMessages(false);
    }, 500);
  }, [activeConversationId]);

  const handleSendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!activeConversationId || !userId) return;
      
      setSendingMessage(true);
      setErrorSend(null);
      
      // Create optimistic message
      const optimisticMsg: Message = {
        id: 'optimistic-' + Date.now(),
        conversation_id: activeConversationId,
        sender_id: userId,
        content,
        message_type: file ? 'file' : 'text',
        file_url: file ? URL.createObjectURL(file) : undefined,
        file_name: file?.name,
        file_size: file?.size,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, optimisticMsg]);
      
      // Simulate sending delay
      setTimeout(() => {
        // Replace optimistic message with real one
        const realMsg: Message = {
          ...optimisticMsg,
          id: 'msg-' + Date.now(),
        };
        
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? realMsg : m))
        );
        
        setSendingMessage(false);
      }, 1000);
    },
    [activeConversationId, userId]
  );

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    errorConversations,
    errorMessages,
    errorSend,
  };
}