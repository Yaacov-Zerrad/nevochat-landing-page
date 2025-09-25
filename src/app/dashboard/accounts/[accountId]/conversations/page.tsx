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
  identifier?: string
  additional_attributes?: {
    type?: string
    country?: string
    country_code?: string
    [key: string]: any
  }
  custom_attributes?: {
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
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

// Contact Modal Component
const ContactModal = ({ contact, isOpen, onClose }: { contact: Contact | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !contact) return null

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return '🌍'
    const flagEmoji = countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    )
    return flagEmoji
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-neon-green/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Détails du contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          {/* Name */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Nom</p>
                <p className="text-white font-semibold">{contact.name}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          {contact.phone_number && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p className="text-white font-semibold">{contact.phone_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-semibold">{contact.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Country Info */}
          {contact.additional_attributes?.country && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-2xl">
                  {getCountryFlag(contact.additional_attributes.country_code)}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pays</p>
                  <p className="text-white font-semibold">{contact.additional_attributes.country}</p>
                  {contact.additional_attributes.country_code && (
                    <p className="text-xs text-gray-500">{contact.additional_attributes.country_code}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Type */}
          {contact.additional_attributes?.type && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7.5 8h5M7.5 12h5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-semibold capitalize">{contact.additional_attributes.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Attributes */}
          {contact.additional_attributes && Object.keys(contact.additional_attributes).filter(key => !['type', 'country', 'country_code'].includes(key)).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-3">Attributs supplémentaires</h3>
              <div className="space-y-2">
                {Object.entries(contact.additional_attributes)
                  .filter(([key]) => !['type', 'country', 'country_code'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Custom Attributes */}
          {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-3">Attributs personnalisés</h3>
              <div className="space-y-2">
                {Object.entries(contact.custom_attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          {contact.created_at && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Créé le</p>
                  <p className="text-white font-semibold">{new Date(contact.created_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
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
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

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
    <>
      <ContactModal 
        contact={selectedContact} 
        isOpen={showContactModal} 
        onClose={() => {
          setShowContactModal(false)
          setSelectedContact(null)
        }} 
      />
      
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
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex border-b border-neon-green/20">
              <button
                onClick={() => setShowConversationList(true)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  showConversationList
                    ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Conversations</span>
                  {conversations.reduce((sum, conv) => sum + conv.unread_count, 0) > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setShowConversationList(false)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  !showConversationList
                    ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
                    : 'text-gray-400 hover:text-white'
                }`}
                disabled={!selectedConversation}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8V4l4 4z" />
                  </svg>
                  <span>Messages</span>
                </div>
              </button>
            </div>

            {/* Conversations List */}
            <div className={`w-full lg:w-1/3 lg:border-r border-neon-green/20 overflow-y-auto ${
              showConversationList ? 'block' : 'hidden lg:block'
            }`}>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">Aucune conversation trouvée</p>
                  <p className="text-sm text-gray-500 mt-1">Les conversations apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/30">
                  {conversations.map((conversation) => {
                    const getCountryFlag = (countryCode?: string) => {
                      if (!countryCode) return null
                      return countryCode.toUpperCase().replace(/./g, char => 
                        String.fromCodePoint(char.charCodeAt(0) + 127397)
                      )
                    }

                    return (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 cursor-pointer transition-all relative ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-gradient-to-r from-neon-green/10 to-transparent border-l-4 border-l-neon-green'
                            : 'hover:bg-gray-800/30'
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          setShowConversationList(false)
                        }}
                      >
                        {/* Unread indicator */}
                        {conversation.unread_count > 0 && (
                          <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                        )}

                        <div className="flex items-start space-x-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-neon-green/20">
                            <span className="text-neon-green font-semibold text-lg">
                              {conversation.contact.name ? conversation.contact.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <h3 className="font-semibold text-white truncate">
                                  {conversation.contact.name || 'Contact inconnu'}
                                </h3>
                                {conversation.contact.additional_attributes?.country_code && (
                                  <span className="text-lg flex-shrink-0">
                                    {getCountryFlag(conversation.contact.additional_attributes.country_code)}
                                  </span>
                                )}
                                {conversation.contact.additional_attributes?.type && (
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex-shrink-0">
                                    {conversation.contact.additional_attributes.type}
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${statusLabels[conversation.status as keyof typeof statusLabels].color}`}>
                                {statusLabels[conversation.status as keyof typeof statusLabels].label}
                              </span>
                            </div>
                            
                            {/* Meta info */}
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="truncate">#{conversation.display_id}</span>
                                <span className="text-gray-600">•</span>
                                <span className="truncate text-xs">{conversation.inbox.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {conversation.unread_count > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {conversation.unread_count}
                                  </span>
                                )}
                                <span className="text-xs">{formatTime(conversation.last_activity_at)}</span>
                              </div>
                            </div>
                            
                            {/* Last message */}
                            {conversation.last_message && (
                              <p className="text-sm text-gray-300 truncate mb-1">
                                <span className="text-gray-500">
                                  {conversation.last_message.sender_type === 'User' ? 'Vous: ' : ''}
                                </span>
                                {conversation.last_message.content}
                              </p>
                            )}
                            
                            {/* Priority */}
                            {conversation.priority !== undefined && conversation.priority > 0 && (
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className={`text-xs font-medium ${priorityLabels[conversation.priority as keyof typeof priorityLabels].color}`}>
                                  {priorityLabels[conversation.priority as keyof typeof priorityLabels].label}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Conversation Detail */}
            <div className={`flex-1 flex flex-col ${
              showConversationList ? 'hidden lg:flex' : 'flex'
            }`}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-3 lg:p-4 border-b border-neon-green/20 bg-gradient-to-r from-gray-800/50 to-gray-900/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => setShowConversationList(true)}
                            className="lg:hidden text-neon-green hover:text-neon-green/80 transition-colors p-1 rounded-lg hover:bg-neon-green/10"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          {/* Contact Avatar and Name */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-neon-green/30">
                              <span className="text-neon-green font-semibold">
                                {selectedConversation.contact.name ? selectedConversation.contact.name.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div>
                              <h2 className="text-lg lg:text-xl font-bold text-white">
                                {selectedConversation.contact.name || 'Contact inconnu'}
                              </h2>
                              {selectedConversation.contact.phone_number && (
                                <p className="text-xs text-gray-400">{selectedConversation.contact.phone_number}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs text-gray-400">
                          <span className="bg-gray-700/50 px-2 py-1 rounded-full">#{selectedConversation.display_id}</span>
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full truncate">{selectedConversation.inbox.name}</span>
                          {selectedConversation.assignee && (
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full truncate">
                              {selectedConversation.assignee.display_name || selectedConversation.assignee.name}
                            </span>
                          )}
                          {selectedConversation.contact.additional_attributes?.country && (
                            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                              {selectedConversation.contact.additional_attributes.country_code && 
                                selectedConversation.contact.additional_attributes.country_code.toUpperCase().replace(/./g, char => 
                                  String.fromCodePoint(char.charCodeAt(0) + 127397)
                                )
                              } {selectedConversation.contact.additional_attributes.country}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ml-2">
                        {/* Contact Details Button */}
                        <button
                          onClick={() => {
                            setSelectedContact(selectedConversation.contact)
                            setShowContactModal(true)
                          }}
                          className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded-lg text-xs lg:text-sm transition-colors border border-neon-green/20 hover:border-neon-green/40 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Contact</span>
                        </button>
                        
                        {/* Status buttons - conditional based on current status */}
                        <div className="flex space-x-1">
                          {selectedConversation.status === 0 ? (
                            <button
                              onClick={() => updateConversationStatus(selectedConversation.id, 1)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm transition-colors flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Résoudre</span>
                            </button>
                          ) : (
                            // Si la conversation n'est pas ouverte, montrer le bouton "Rouvrir"
                            <button
                              onClick={() => updateConversationStatus(selectedConversation.id, 0)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm transition-colors flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden sm:inline">Rouvrir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Chargement des messages...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 p-6 text-center">
                        <div>
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="text-lg font-medium">Aucun message</p>
                          <p className="text-sm text-gray-500 mt-1">Cette conversation n&apos;a pas encore de messages</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isUser = message.sender_type === 'User'
                          const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-end space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isUser && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  showAvatar ? 'bg-gray-600' : 'opacity-0'
                                }`}>
                                  {showAvatar && (
                                    <span className="text-white text-xs font-medium">
                                      {message.sender_name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className={`max-w-[75%] lg:max-w-md ${isUser ? 'order-first' : ''}`}>
                                {showAvatar && !isUser && (
                                  <p className="text-xs text-gray-400 mb-1 ml-2">{message.sender_name}</p>
                                )}
                                
                                <div
                                  className={`p-3 rounded-2xl shadow-lg ${
                                    isUser
                                      ? 'bg-gradient-to-r from-neon-green/20 to-emerald-500/20 text-white border border-neon-green/20'
                                      : 'bg-gray-700/80 text-white border border-gray-600/30'
                                  } ${
                                    isUser 
                                      ? 'rounded-br-md' 
                                      : 'rounded-bl-md'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                  <div className="flex justify-end mt-2">
                                    <span className="text-xs text-gray-300 opacity-70">
                                      {formatTime(message.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {isUser && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  showAvatar ? 'bg-neon-green/20 border border-neon-green/30' : 'opacity-0'
                                }`}>
                                  {showAvatar && (
                                    <span className="text-neon-green text-xs font-medium">
                                      {message.sender_name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 lg:p-4 border-t border-neon-green/20 bg-gray-800/30">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          placeholder="Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
                          rows={1}
                          className="w-full bg-gray-700/80 text-white px-4 py-3 rounded-2xl border border-gray-600/50 focus:border-neon-green/50 focus:outline-none text-sm resize-none overflow-hidden backdrop-blur-sm"
                          style={{
                            minHeight: '44px',
                            maxHeight: '120px',
                            height: newMessage.split('\n').length > 1 ? 'auto' : '44px'
                          }}
                        />
                        {newMessage.trim() && (
                          <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                            {newMessage.length} caractères
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-neon-green/20 to-emerald-500/20 hover:from-neon-green/30 hover:to-emerald-500/30 disabled:from-gray-600/20 disabled:to-gray-600/20 disabled:text-gray-400 text-neon-green p-3 rounded-2xl transition-all border border-neon-green/20 hover:border-neon-green/40 disabled:border-gray-600/20 flex items-center justify-center min-w-[44px] h-[44px] shadow-lg disabled:shadow-none"
                        title={newMessage.trim() ? "Envoyer le message" : "Tapez un message"}
                      >
                        <svg className={`w-5 h-5 transition-transform ${newMessage.trim() ? 'rotate-0' : 'rotate-45'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Maj+Entrée pour nouvelle ligne</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedConversation.status !== 0 && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                            Conversation {statusLabels[selectedConversation.status as keyof typeof statusLabels].label.toLowerCase()}
                          </span>
                        )}
                      </div>
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
    </>
  )
}