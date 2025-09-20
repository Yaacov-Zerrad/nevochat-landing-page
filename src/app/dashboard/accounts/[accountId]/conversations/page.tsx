'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { conversationAPI } from '@/lib/api'

interface Contact {
  id: number
  name: string
  email?: string
  phone_number?: string
}

interface User {
  id: number
  name: string
  email: string
  display_name?: string
}

interface Inbox {
  id: number
  name: string
  channel_type: number
}

interface Team {
  id: number
  name: string
  description?: string
}

interface LastMessage {
  id: number
  content: string
  message_type: number
  created_at: string
  sender_type: string
  sender_id: number
}

interface Conversation {
  id: number
  display_id: number
  status: number
  created_at: string
  updated_at: string
  last_activity_at: string
  contact_last_seen_at?: string
  agent_last_seen_at?: string
  priority?: number
  contact: Contact
  inbox: Inbox
  assignee?: User
  team?: Team
  last_message?: LastMessage
  unread_count: number
  uuid: string
  identifier?: string
}

interface Message {
  id: number
  content: string
  message_type: number
  created_at: string
  updated_at: string
  private: boolean
  status: number
  sender_type: string
  sender_id: number
  sender_name: string
}

const statusLabels = {
  0: { label: 'Ouvert', color: 'bg-green-500/20 text-green-400' },
  1: { label: 'Résolu', color: 'bg-gray-500/20 text-gray-400' },
  2: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
  3: { label: 'Fermé', color: 'bg-red-500/20 text-red-400' }
}

const priorityLabels = {
  0: { label: 'Faible', color: 'text-blue-400' },
  1: { label: 'Moyenne', color: 'text-yellow-400' },
  2: { label: 'Élevée', color: 'text-orange-400' },
  3: { label: 'Urgente', color: 'text-red-400' }
}

export default function ConversationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('0')
  const [searchQuery, setSearchQuery] = useState('')
  const [showConversationList, setShowConversationList] = useState(true)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const data = await conversationAPI.getConversations(parseInt(accountId), params)
      setConversations(data.results || data)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, accountId])

  const fetchConversationMessages = useCallback(async (conversationId: number) => {
    try {
      setMessagesLoading(true)
      const data = await conversationAPI.getConversation(parseInt(accountId), conversationId)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }, [accountId])

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return
    
    try {
      const messageData = await conversationAPI.sendMessage(parseInt(accountId), selectedConversation.id, {
        content: newMessage,
        message_type: 1, // Outgoing message
        private: false,
        content_type: 0, // Text message
      })
      
      setMessages(prev => [...prev, messageData])
      setNewMessage('')
      // Refresh conversations to update last message
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const updateConversationStatus = async (conversationId: number, newStatus: number) => {
    try {
      await conversationAPI.updateConversation(parseInt(accountId), conversationId, { status: newStatus })
      
      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, status: newStatus } : conv
        )
      )
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Error updating conversation status:', error)
    }
  }

  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await conversationAPI.markAsRead(parseInt(accountId), conversationId)
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [accountId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchConversations()
    }
  }, [status, router, fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
    }
  }, [selectedConversation, fetchConversationMessages, markAsRead])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-white mb-4">Non autorisé</h1>
          <p className="text-gray-400">Vous devez être connecté pour voir cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md rounded-2xl border border-neon-green/20 h-[calc(100vh-64px)] sm:h-[calc(100vh-120px)]"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center p-4 lg:p-6 border-b border-neon-green/20">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <button
                onClick={() => router.push(`/dashboard/accounts/${accountId}`)}
                className="text-neon-green hover:text-neon-green/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Conversations</h1>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="0">Ouvert</option>
                <option value="1">Résolu</option>
                <option value="2">En attente</option>
                <option value="3">Fermé</option>
              </select>
              
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none sm:w-64 text-sm"
              />
              
              <button
                onClick={fetchConversations}
                className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 text-sm"
              >
                Actualiser
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(100%-120px)] lg:h-[calc(100%-88px)]">
            Mobile Navigation
            {/* <div className="lg:hidden flex bg-gray-800/50 border-b border-neon-green/20">
              <button
                onClick={() => setShowConversationList(true)}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  showConversationList
                    ? 'bg-neon-green/20 text-neon-green border-b-2 border-neon-green'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Conversations {conversations.length > 0 && `(${conversations.length})`}
              </button>
              <button
                onClick={() => setShowConversationList(false)}
                disabled={!selectedConversation}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  !showConversationList
                    ? 'bg-neon-green/20 text-neon-green border-b-2 border-neon-green'
                    : 'text-gray-400 hover:text-white disabled:text-gray-600'
                }`}
              >
                Messages {selectedConversation ? `(${selectedConversation.contact.name})` : ''}
              </button>
            </div> */}

            {/* Conversations List */}
            <div className={`w-full lg:w-1/3 lg:border-r border-neon-green/20 overflow-y-auto ${
              showConversationList ? 'block' : 'hidden lg:block'
            }`}>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  Aucune conversation trouvée
                </div>
              ) : (
                conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-neon-green/10 border-l-4 border-l-neon-green'
                        : 'hover:bg-gray-800/50'
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation)
                      setShowConversationList(false) // Auto-switch to messages on mobile
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white truncate">
                          {conversation.contact.name || 'Contact inconnu'}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusLabels[conversation.status as keyof typeof statusLabels].color}`}>
                        {statusLabels[conversation.status as keyof typeof statusLabels].label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="truncate">#{conversation.display_id}</span>
                      <span>{formatTime(conversation.last_activity_at)}</span>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-gray-300 mt-1 truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                    
                    {conversation.priority !== undefined && conversation.priority > 0 && (
                      <div className="mt-2">
                        <span className={`text-xs ${priorityLabels[conversation.priority as keyof typeof priorityLabels].color}`}>
                          {priorityLabels[conversation.priority as keyof typeof priorityLabels].label}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Conversation Detail */}
            <div className={`flex-1 flex flex-col ${
              showConversationList ? 'hidden lg:flex' : 'flex'
            }`}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-3 lg:p-4 border-b border-neon-green/20 bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={() => setShowConversationList(true)}
                            className="lg:hidden text-neon-green hover:text-neon-green/80 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <h2 className="text-lg lg:text-xl font-bold text-white truncate">
                            {selectedConversation.contact.name || 'Contact inconnu'}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-400">
                          <span>#{selectedConversation.display_id}</span>
                          <span className="truncate">{selectedConversation.inbox.name}</span>
                          {selectedConversation.assignee && (
                            <span className="truncate">Assigné à: {selectedConversation.assignee.display_name || selectedConversation.assignee.name}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ml-2">
                        <button
                          onClick={() => updateConversationStatus(selectedConversation.id, 0)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-colors"
                        >
                          Rouvrir
                        </button>
                        <button
                          onClick={() => updateConversationStatus(selectedConversation.id, 1)}
                          className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-colors"
                        >
                          Résoudre
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-400">
                        Aucun message dans cette conversation
                      </div>
                    ) : (
                      messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender_type === 'User' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] lg:max-w-md p-3 rounded-lg ${
                              message.sender_type === 'User'
                                ? 'bg-neon-green/20 text-white'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-300 truncate">{message.sender_name}</span>
                              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{formatTime(message.created_at)}</span>
                            </div>
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 lg:p-4 border-t border-neon-green/20">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Tapez votre message..."
                        className="flex-1 bg-gray-800 text-white px-3 lg:px-4 py-2 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none text-sm"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-neon-green/20 hover:bg-neon-green/30 disabled:bg-gray-600 disabled:text-gray-400 text-neon-green px-4 lg:px-6 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:border-gray-600 text-sm whitespace-nowrap"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 p-6 text-center">
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm lg:text-base">Sélectionnez une conversation pour voir les messages</p>
                    <p className="text-xs text-gray-500 mt-2 lg:hidden">Utilisez l&apos;onglet &quot;Conversations&quot; pour choisir une discussion</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}