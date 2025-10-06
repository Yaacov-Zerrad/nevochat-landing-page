/**
 * Core WebSocket Hook with Auto-Reconnection
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Heartbeat/ping-pong for connection keep-alive
 * - Page Visibility API integration (maintains connection in background)
 * - Message buffering when disconnected
 * - Connection state management
 * - Token-based authentication
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export interface UseWebSocketOptions {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectMaxInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export interface UseWebSocketReturn {
  state: WebSocketState;
  send: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    token,
    autoConnect = true,
    reconnect: shouldReconnect = true,
    reconnectInterval = 1000,
    reconnectMaxInterval = 30000,
    reconnectAttempts = Infinity,
    heartbeatInterval = 30000,
    debug = false,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const [state, setState] = useState<WebSocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageBufferRef = useRef<WebSocketMessage[]>([]);
  const isManualDisconnectRef = useRef(false);

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[WebSocket] ${message}`, ...args);
    }
  }, [debug]);

  // Build WebSocket URL with token
  const getWebSocketUrl = useCallback(() => {
    if (!token) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${token}`;
  }, [url, token]);

  // Send heartbeat/ping to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Sending heartbeat');
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
      
      // Schedule next heartbeat
      heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
    }
  }, [heartbeatInterval, log]);

  // Clear heartbeat timeout
  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Flush message buffer when connected
  const flushMessageBuffer = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageBufferRef.current.length > 0) {
      log(`Flushing ${messageBufferRef.current.length} buffered messages`);
      
      messageBufferRef.current.forEach(message => {
        wsRef.current?.send(JSON.stringify(message));
      });
      
      messageBufferRef.current = [];
    }
  }, [log]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Already connected');
      return;
    }

    isManualDisconnectRef.current = false;
    setState('connecting');
    log('Connecting to', getWebSocketUrl());

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = (event) => {
        log('Connected');
        setState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        sendHeartbeat();
        
        // Flush buffered messages
        flushMessageBuffer();
        
        onOpen?.(event);
      };

      ws.onclose = (event) => {
        log('Disconnected', event.code, event.reason);
        setState('disconnected');
        clearHeartbeat();
        
        onClose?.(event);
        
        // Auto-reconnect if not manual disconnect
        if (shouldReconnect && !isManualDisconnectRef.current) {
          if (reconnectAttemptsRef.current < reconnectAttempts) {
            const delay = Math.min(
              reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
              reconnectMaxInterval
            );
            
            log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
            reconnectAttemptsRef.current++;
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            log('Max reconnection attempts reached');
            setState('error');
          }
        }
      };

      ws.onerror = (event) => {
        log('Error', event);
        setState('error');
        onError?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          log('Message received', message.type);
          
          // Handle pong response
          if (message.type === 'pong') {
            log('Heartbeat acknowledged');
            return;
          }
          
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          log('Failed to parse message', error);
        }
      };

    } catch (error) {
      log('Connection error', error);
      setState('error');
    }
  }, [
    getWebSocketUrl,
    shouldReconnect,
    reconnectAttempts,
    reconnectInterval,
    reconnectMaxInterval,
    sendHeartbeat,
    flushMessageBuffer,
    clearHeartbeat,
    onOpen,
    onClose,
    onError,
    onMessage,
    log,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    log('Disconnecting');
    isManualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    clearHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setState('disconnected');
  }, [clearHeartbeat, log]);

  // Reconnect (disconnect then connect)
  const reconnectFn = useCallback(() => {
    log('Manual reconnection');
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect, log]);

  // Send message
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Sending message', message.type);
      wsRef.current.send(JSON.stringify(message));
    } else {
      log('Not connected, buffering message', message.type);
      messageBufferRef.current.push(message);
    }
  }, [log]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        log('Page hidden');
      } else {
        log('Page visible');
        // Reconnect if disconnected
        if (wsRef.current?.readyState !== WebSocket.OPEN && shouldReconnect) {
          log('Reconnecting after page became visible');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, shouldReconnect, log]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    send,
    connect,
    disconnect,
    reconnect: reconnectFn,
    lastMessage,
    isConnected: state === 'connected',
  };
}
