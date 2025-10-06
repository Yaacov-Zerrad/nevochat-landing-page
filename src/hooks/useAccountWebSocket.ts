/**
 * Account-Specific WebSocket Hook
 * 
 * Connects to account WebSocket endpoint and handles conversation events:
 * - conversation.new - New conversation created
 * - conversation.updated - Conversation status/assignee/etc changed
 * - message.new - New message in conversation
 * - message.updated - Message edited/deleted
 * - typing.start - Someone started typing
 * - typing.stop - Someone stopped typing
 */

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket, WebSocketMessage } from './useWebSocket';

export interface Conversation {
  id: number;
  status: number;
  priority: number;
  assignee_id?: number;
  inbox_id: number;
  team_id?: number;
  contact: {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
  };
  last_message?: {
    id: number;
    content: string;
    message_type: number;
    created_at: string;
    sender_type: string;
  };
  unread_count: number;
  created_at: string;
  last_activity_at: string;
  snoozed_until?: string;
  cached_label_list?: string[];
}

export interface Message {
  id: number;
  content: string;
  message_type: number;
  conversation_id: number;
  sender_type: string;
  sender_id?: number;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface TypingIndicator {
  conversation_id: number;
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface UseAccountWebSocketOptions {
  accountId: number;
  token: string;
  wsBaseUrl?: string;
  autoConnect?: boolean;
  debug?: boolean;
  onConversationNew?: (conversation: Conversation) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
  onMessageNew?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onTypingStart?: (typing: TypingIndicator) => void;
  onTypingStop?: (typing: TypingIndicator) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export interface UseAccountWebSocketReturn {
  isConnected: boolean;
  connectionState: string;
  sendMessage: (conversationId: number, content: string) => void;
  updateConversationStatus: (conversationId: number, status: number) => void;
  markAsRead: (conversationId: number) => void;
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;
  reconnect: () => void;
}

export function useAccountWebSocket(
  options: UseAccountWebSocketOptions
): UseAccountWebSocketReturn {
  const {
    accountId,
    token,
    wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    autoConnect = true,
    debug = false,
    onConversationNew,
    onConversationUpdated,
    onMessageNew,
    onMessageUpdated,
    onTypingStart,
    onTypingStop,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const typingTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (debug) {
      console.log('[AccountWebSocket] Message:', message.type, message.data);
    }

    switch (message.type) {
      case 'conversation.new':
        onConversationNew?.(message.data as Conversation);
        break;

      case 'conversation.updated':
        onConversationUpdated?.(message.data as Conversation);
        break;

      case 'message.new':
        onMessageNew?.(message.data as Message);
        break;

      case 'message.updated':
        onMessageUpdated?.(message.data as Message);
        break;

      case 'typing.start':
        onTypingStart?.(message.data as TypingIndicator);
        break;

      case 'typing.stop':
        onTypingStop?.(message.data as TypingIndicator);
        break;

      case 'error':
        onError?.(message.data);
        break;

      default:
        if (debug) {
          console.warn('[AccountWebSocket] Unknown message type:', message.type);
        }
    }
  }, [
    debug,
    onConversationNew,
    onConversationUpdated,
    onMessageNew,
    onMessageUpdated,
    onTypingStart,
    onTypingStop,
    onError,
  ]);

  // Handle connection open
  const handleOpen = useCallback(() => {
    if (debug) {
      console.log('[AccountWebSocket] Connected to account', accountId);
    }
    onConnect?.();
  }, [accountId, debug, onConnect]);

  // Handle connection close
  const handleClose = useCallback(() => {
    if (debug) {
      console.log('[AccountWebSocket] Disconnected from account', accountId);
    }
    onDisconnect?.();
  }, [accountId, debug, onDisconnect]);

  // Handle connection error
  const handleError = useCallback((event: Event) => {
    if (debug) {
      console.error('[AccountWebSocket] Connection error:', event);
    }
    onError?.(event);
  }, [debug, onError]);

  // Initialize WebSocket
  const {
    state,
    send,
    reconnect,
    isConnected,
  } = useWebSocket({
    url: `${wsBaseUrl}/ws/accounts/${accountId}/`,
    token,
    autoConnect,
    reconnect: true,
    reconnectInterval: 1000,
    reconnectMaxInterval: 30000,
    heartbeatInterval: 30000,
    debug,
    onMessage: handleMessage,
    onOpen: handleOpen,
    onClose: handleClose,
    onError: handleError,
  });

  // Send message action
  const sendMessage = useCallback((conversationId: number, content: string) => {
    send({
      type: 'send_message',
      data: {
        conversation_id: conversationId,
        content,
        message_type: 0, // incoming message
      },
    });
  }, [send]);

  // Update conversation status
  const updateConversationStatus = useCallback((conversationId: number, status: number) => {
    send({
      type: 'update_status',
      data: {
        conversation_id: conversationId,
        status,
      },
    });
  }, [send]);

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: number) => {
    send({
      type: 'mark_as_read',
      data: {
        conversation_id: conversationId,
      },
    });
  }, [send]);

  // Start typing indicator
  const startTyping = useCallback((conversationId: number) => {
    send({
      type: 'start_typing',
      data: {
        conversation_id: conversationId,
      },
    });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }

    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  }, [send]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: number) => {
    send({
      type: 'stop_typing',
      data: {
        conversation_id: conversationId,
      },
    });

    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
      delete typingTimeoutRef.current[conversationId];
    }
  }, [send]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    isConnected,
    connectionState: state,
    sendMessage,
    updateConversationStatus,
    markAsRead,
    startTyping,
    stopTyping,
    reconnect,
  };
}
