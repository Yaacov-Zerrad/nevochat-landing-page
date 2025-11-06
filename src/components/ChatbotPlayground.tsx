'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot, Settings, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotPlaygroundProps {
  flowId?: string;
}

export default function ChatbotPlayground({ flowId }: ChatbotPlaygroundProps) {
  const params = useParams();
  const accountId = params.accountId as string;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [sender, setSender] = useState('');
  const [contactName, setContactName] = useState('');
  const [tempSender, setTempSender] = useState('');
  const [tempContactName, setTempContactName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate default sender and contact name
  useEffect(() => {
    if (!sender) {
      const randomPhone = `+972${Math.floor(Math.random() * 900000000 + 100000000)}`;
      setSender(randomPhone);
      setTempSender(randomPhone);
    }
    if (!contactName) {
      const randomName = `Test User ${Math.floor(Math.random() * 1000)}`;
      setContactName(randomName);
      setTempContactName(randomName);
    }
  }, [sender, contactName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/chatbot/messages/web', {
        sender: sender,
        contact_name: contactName,
        body: inputMessage,
        account_id: parseInt(accountId),
        ...(flowId && { flow_id: flowId }),
      });

      // Handle response - can be multiple messages
      const botMessages = response.data?.messages || [];
      
      if (botMessages.length > 0) {
        const newBotMessages: Message[] = botMessages.map((msg: string, index: number) => ({
          id: `bot-${Date.now()}-${index}`,
          content: msg,
          sender: 'bot' as const,
          timestamp: new Date(),
        }));
        setMessages((prev) => [...prev, ...newBotMessages]);
      } else if (response.data?.detail) {
        // Fallback if no messages array
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: response.data.detail,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: error.response?.data?.detail || 'Erreur lors de l\'envoi du message',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateNewIdentity = () => {
    const randomPhone = `+972${Math.floor(Math.random() * 900000000 + 100000000)}`;
    const randomName = `Test User ${Math.floor(Math.random() * 1000)}`;
    setSender(randomPhone);
    setContactName(randomName);
    setTempSender(randomPhone);
    setTempContactName(randomName);
  };

  const handleClearConversation = () => {
    setMessages([]);
    // Generate new identity when clearing conversation
    generateNewIdentity();
  };

  const handleSaveSettings = () => {
    setSender(tempSender);
    setContactName(tempContactName);
    setShowSettings(false);
    // Clear conversation when settings change
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-neon-green to-green-400 text-gray-900 p-4 rounded-full shadow-lg hover:shadow-neon-green/50 transition-all duration-300 hover:scale-110 z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border border-neon-green/30 rounded-lg shadow-2xl shadow-neon-green/20 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 border-b border-neon-green/20 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-neon-green" />
          <h3 className="text-white font-semibold">Playground</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Paramètres"
          >
            <Settings className="w-4 h-4 text-gray-400 hover:text-neon-green" />
          </button>
          <button
            onClick={handleClearConversation}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Effacer la conversation"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-800/50 border-b border-neon-green/20">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Numéro de téléphone</label>
              <input
                type="text"
                value={tempSender}
                onChange={(e) => setTempSender(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-neon-green"
                placeholder="+972545564449"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom du contact</label>
              <input
                type="text"
                value={tempContactName}
                onChange={(e) => setTempContactName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-neon-green"
                placeholder="Test User"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full px-4 py-2 bg-neon-green text-gray-900 rounded-lg font-medium hover:bg-green-400 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Commencez une conversation...</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-neon-green text-gray-900'
                  : 'bg-gray-800 text-white border border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-neon-green" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/50 border-t border-neon-green/20 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-neon-green text-gray-900 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
