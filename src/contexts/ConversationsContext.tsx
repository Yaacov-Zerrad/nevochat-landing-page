/**
 * Conversations Context Provider
 * 
 * Global state management for conversations with WebSocket integration.
 * Handles real-time updates, filtering, and conversation management.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useAccountWebSocket,
  Message,
  TypingIndicator,
} from '@/hooks/useAccountWebSocket';
import { conversationAPI } from '@/lib/api';
import type { Conversation } from '@/app/dashboard/accounts/[accountId]/conversations/components/ConversationsList';

export interface ConversationFilters {
  status?: number | number[];
  priority?: number | number[];
  assignee?: number;
  unassigned?: boolean;
  inbox?: number;
  team?: number;
  labels?: string[];
  contact_type?: string;
  has_unread?: boolean;
  is_snoozed?: boolean;
  waiting_for?: 'customer' | 'agent';
  created_after?: string;
  created_before?: string;
  last_activity_after?: string;
  last_activity_before?: string;
  search?: string;
  ordering?: string;
}

interface ConversationsContextValue {
  // State
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  filters: ConversationFilters;
  typingIndicators: Map<number, TypingIndicator>;
  isLoading: boolean;
  error: string | null;
  
  // WebSocket
  isConnected: boolean;
  connectionState: string;
  
  // Actions
  setSelectedConversation: (conversation: Conversation | null) => void;
  updateFilters: (filters: Partial<ConversationFilters>) => void;
  clearFilters: () => void;
  sendMessage: (conversationId: number, content: string) => void;
  updateConversationStatus: (conversationId: number, status: number) => void;
  markAsRead: (conversationId: number) => void;
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;
  refreshConversations: () => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

interface ConversationsProviderProps {
  children: React.ReactNode;
  accountId: number;
  token: string;
  initialConversations?: Conversation[];
}

export function ConversationsProvider({
  children,
  accountId,
  token,
  initialConversations = [],
}: ConversationsProviderProps) {
  // State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<ConversationFilters>({});
  const [typingIndicators, setTypingIndicators] = useState<Map<number, TypingIndicator>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to always have the latest selectedConversation in callbacks
  const selectedConversationRef = useRef<Conversation | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // WebSocket handlers
  const handleConversationNew = useCallback((conversation: Conversation) => {
    console.log('[ConversationsContext] New conversation:', conversation.id);
    
    setConversations(prev => {
      // Check if conversation already exists
      if (prev.find(c => c.id === conversation.id)) {
        return prev;
      }
      
      // Add to beginning of list
      return [conversation, ...prev];
    });
  }, []);

  const handleConversationUpdated = useCallback((conversation: Conversation) => {
    console.log('[ConversationsContext] Updated conversation:', conversation.id);
    
    setConversations(prev => {
      return prev.map(c => c.id === conversation.id ? conversation : c);
    });
    
    // Update selected conversation if it's the one that was updated
    setSelectedConversation(prev => {
      if (prev?.id === conversation.id) {
        return conversation;
      }
      return prev;
    });
  }, []);

  const handleMessageNew = useCallback((message: Message) => {
    console.log('[ConversationsContext] New message:', message.id);
    console.log('[ConversationsContext] Message conversation_id:', message.conversation_id);
    console.log('[ConversationsContext] Selected conversation id (from ref):', selectedConversationRef.current?.id);
    console.log('[ConversationsContext] Full message object:', message);
    
    // Add message to list if it's for selected conversation
    // Use ref to get the latest value without stale closure
    const currentSelectedConv = selectedConversationRef.current;
    
    if (currentSelectedConv && message.conversation_id && currentSelectedConv.id === message.conversation_id) {
      console.log('[ConversationsContext] ✅ Adding message to list');
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        if (prev.find(m => m.id === message.id)) {
          console.log('[ConversationsContext] ⚠️ Message already exists, skipping');
          return prev;
        }
        console.log('[ConversationsContext] ✅ Message added to list, new count:', prev.length + 1);
        return [...prev, message];
      });
    } else {
      console.log('[ConversationsContext] ❌ Message NOT added - conversation mismatch or missing data');
      console.log('[ConversationsContext] Debug - currentSelectedConv:', currentSelectedConv);
      console.log('[ConversationsContext] Debug - message.conversation_id:', message.conversation_id);
    }
    
    // Update conversation's last message and move to top
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id === message.conversation_id) {
          return {
            ...c,
            last_message: {
              id: message.id,
              content: message.content,
              message_type: message.message_type,
              created_at: message.created_at,
              sender_type: message.sender_type,
              sender_id: message.sender_id || 0,
            },
            last_activity_at: message.created_at,
            unread_count: c.unread_count + 1,
          };
        }
        return c;
      });
      
      // Sort by last activity
      return updated.sort((a, b) => 
        new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    });
  }, []); // ✅ No dependencies - uses ref which is always current

  const handleMessageUpdated = useCallback((message: Message) => {
    console.log('[ConversationsContext] Updated message:', message.id);
    
    // Update message in list
    setMessages(prev => {
      return prev.map(m => m.id === message.id ? message : m);
    });
  }, []);

  const handleTypingStart = useCallback((typing: TypingIndicator) => {
    console.log('[ConversationsContext] Typing start:', typing.conversation_id);
    
    setTypingIndicators(prev => {
      const next = new Map(prev);
      next.set(typing.conversation_id, typing);
      return next;
    });
  }, []);

  const handleTypingStop = useCallback((typing: TypingIndicator) => {
    console.log('[ConversationsContext] Typing stop:', typing.conversation_id);
    
    setTypingIndicators(prev => {
      const next = new Map(prev);
      next.delete(typing.conversation_id);
      return next;
    });
  }, []);

  const handleConnect = useCallback(() => {
    console.log('[ConversationsContext] Connected to WebSocket');
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('[ConversationsContext] Disconnected from WebSocket');
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('[ConversationsContext] WebSocket error:', error);
    setError(error?.message || 'WebSocket connection error');
  }, []);

  // Initialize WebSocket
  const {
    isConnected,
    connectionState,
    sendMessage: wsSendMessage,
    updateConversationStatus: wsUpdateStatus,
    markAsRead: wsMarkAsRead,
    startTyping: wsStartTyping,
    stopTyping: wsStopTyping,
    reconnect,
  } = useAccountWebSocket({
    accountId,
    token,
    autoConnect: true,
    debug: process.env.NODE_ENV === 'development',
    onConversationNew: handleConversationNew,
    onConversationUpdated: handleConversationUpdated,
    onMessageNew: handleMessageNew,
    onMessageUpdated: handleMessageUpdated,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  // Actions
  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    // Replace filters completely instead of merging to allow removing filters
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    wsSendMessage(conversationId, content);
  }, [wsSendMessage]);

  const updateConversationStatus = useCallback((conversationId: number, status: number) => {
    wsUpdateStatus(conversationId, status);
  }, [wsUpdateStatus]);

  const markAsRead = useCallback((conversationId: number) => {
    wsMarkAsRead(conversationId);
    
    // Optimistically update unread count
    setConversations(prev => {
      return prev.map(c => {
        if (c.id === conversationId) {
          return { ...c, unread_count: 0 };
        }
        return c;
      });
    });
  }, [wsMarkAsRead]);

  const startTyping = useCallback((conversationId: number) => {
    wsStartTyping(conversationId);
  }, [wsStartTyping]);

  const stopTyping = useCallback((conversationId: number) => {
    wsStopTyping(conversationId);
  }, [wsStopTyping]);

  const refreshConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params from filters
      const params: any = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
      
      const data = await conversationAPI.getConversations(accountId, params);
      setConversations(data.results || data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('[ConversationsContext] Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, filters]);

  const loadMoreMessages = useCallback(async (conversationId: number) => {
    try {
      // getConversation retourne la conversation complète avec les messages inclus
      const conversation = await conversationAPI.getConversation(accountId, conversationId);
      
      // Mettre à jour la conversation sélectionnée avec les données complètes du backend
      setSelectedConversation(conversation);
      
      // Mettre à jour les messages
      setMessages(conversation.messages || []);
      
    } catch (err) {
      console.error('[ConversationsContext] Error fetching conversation:', err);
    }
  }, [accountId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Toujours charger les détails complets avec les messages
      loadMoreMessages(selectedConversation.id);
      
      // Marquer la conversation comme lue automatiquement
      if (selectedConversation.unread_count > 0) {
        markAsRead(selectedConversation.id);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh conversations when filters change
  useEffect(() => {
    refreshConversations();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Context value
  const value = useMemo(() => ({
    conversations,
    selectedConversation,
    messages,
    filters,
    typingIndicators,
    isLoading,
    error,
    isConnected,
    connectionState,
    setSelectedConversation,
    updateFilters,
    clearFilters,
    sendMessage,
    updateConversationStatus,
    markAsRead,
    startTyping,
    stopTyping,
    refreshConversations,
    loadMoreMessages,
  }), [
    conversations,
    selectedConversation,
    messages,
    filters,
    typingIndicators,
    isLoading,
    error,
    isConnected,
    connectionState,
    updateFilters,
    clearFilters,
    sendMessage,
    updateConversationStatus,
    markAsRead,
    startTyping,
    stopTyping,
    refreshConversations,
    loadMoreMessages,
  ]);

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  
  if (!context) {
    throw new Error('useConversations must be used within ConversationsProvider');
  }
  
  return context;
}
