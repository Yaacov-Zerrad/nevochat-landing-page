'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { whatsappAPI } from '@/lib/api';

export default function WhatsAppMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = Array.isArray(params.accountId) ? params.accountId[0] : params.accountId;
  const whatsappId = Array.isArray(params.whatsappId) ? params.whatsappId[0] : params.whatsappId;

  const [messages, setMessages] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAccount = useCallback(async () => {
    if (!whatsappId) return;
    try {
      const accountData = await whatsappAPI.getWhatsAppAccount(whatsappId);
      setAccount(accountData);
    } catch (error) {
      console.error('Erreur lors du chargement du compte:', error);
    }
  }, [whatsappId]);

  const fetchMessages = useCallback(async () => {
    if (!whatsappId) return;
    try {
      const response = await whatsappAPI.getMessages({ account: whatsappId });
      setMessages(response?.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  }, [whatsappId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
      fetchMessages();
    }
  }, [status, router, fetchAccount, fetchMessages]);

  const handleSendMessage = async (e:any) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient.trim() || !whatsappId) return;

    setSending(true);
    try {
      await whatsappAPI.sendMessage(whatsappId, {
        to_number: recipient,
        message: newMessage,
        message_type: 'text'
      });
      
      setNewMessage('');
      setRecipient('');
      await fetchMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/accounts/${accountId}/whatsapp`);
  };

  const formatDate = (dateString:any) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getMessageStatusColor = (status:any) => {
    switch (status) {
      case 'sent':
        return 'text-blue-400';
      case 'delivered':
        return 'text-green-400';
      case 'read':
        return 'text-green-500';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getMessageStatusIcon = (status:any) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md rounded-2xl border border-neon-green/20 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="text-neon-green hover:text-neon-green/80 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Messages WhatsApp</h1>
                  {account && (
                    <p className="text-gray-400">
                      {account.display_name || account.phone_number} - {account.phone_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Send Message Form */}
          <div className="p-6 border-b border-gray-700/50">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destinataire
                  </label>
                  <input
                    type="tel"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="+33123456789"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim() || !recipient.trim()}
                      className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50"
                    >
                      {sending ? '📤' : '➤'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Aucun message
                </h3>
                <p className="text-gray-400">
                  Envoyez votre premier message pour commencer une conversation.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.direction === 'outgoing'
                          ? 'bg-neon-green/20 border border-neon-green/30'
                          : 'bg-gray-700/50 border border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">
                          {message.direction === 'outgoing' ? 'Vous' : message.from_number}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-white text-sm mb-2">
                        {message.content?.text || 'Message non textuel'}
                      </p>
                      
                      {message.direction === 'outgoing' && (
                        <div className="flex items-center justify-end gap-1">
                          <span className={`text-xs ${getMessageStatusColor(message.status)}`}>
                            {getMessageStatusIcon(message.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {message.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
