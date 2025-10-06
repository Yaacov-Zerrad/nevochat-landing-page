'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationAPI, contactsAPI } from '@/lib/api'
import { ConversationsList, type ConversationListItem } from './components'
import { MessagesSection } from './components'
import { ContactDetails } from '@/components/contacts/ContactDetails'

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

interface MessageAttachment {
  id: number
  file_type: string
  filename: string
  file_path: string
  file_url: string
  content_type: string
  file_size: number
  external_url?: string
  meta?: any
  created_at: string
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
  attachments?: MessageAttachment[]
}

export default function ConversationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  
  // Use ConversationListItem for the list (optimized)
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  // Keep full Conversation type for selected conversation (fetched separately with details)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
      // Fetch the full conversation details when selecting a conversation
      const data = await conversationAPI.getConversation(parseInt(accountId), conversationId)
      setMessages(data.messages || [])
      // Update selectedConversation with full details
      setSelectedConversation(data)
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
    // Only fetch if we have a selected conversation ID
    // We use the ID to avoid re-fetching on every selectedConversation change
    const conversationId = selectedConversation?.id
    if (conversationId) {
      markAsRead(conversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])

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
      {/* Contact Details Modal */}
      <AnimatePresence>
        {showContactModal && selectedContact && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-neon-green/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Détails du contact</h2>
                <button
                  onClick={() => {
                    setShowContactModal(false)
                    setSelectedContact(null)
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ContactDetails
                contactId={String(selectedContact.id)}
                accountId={accountId}
                onUpdate={async (contactId, data) => {
                  try {
                    await contactsAPI.updateContact(parseInt(accountId), parseInt(contactId), data)
                    // Refresh contact data
                    const updatedContact = await contactsAPI.getContact(parseInt(accountId), parseInt(contactId))
                    setSelectedContact(updatedContact)
                  } catch (error) {
                    console.error('Failed to update contact:', error)
                    throw error
                  }
                }}
                onBlock={async () => {
                  try {
                    await contactsAPI.blockContact(parseInt(accountId), selectedContact.id)
                    setShowContactModal(false)
                    setSelectedContact(null)
                  } catch (error) {
                    console.error('Failed to block contact:', error)
                  }
                }}
                onUnblock={async () => {
                  try {
                    await contactsAPI.unblockContact(parseInt(accountId), selectedContact.id)
                    setShowContactModal(false)
                    setSelectedContact(null)
                  } catch (error) {
                    console.error('Failed to unblock contact:', error)
                  }
                }}
                onDelete={async () => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
                    try {
                      await contactsAPI.deleteContact(parseInt(accountId), selectedContact.id)
                      setShowContactModal(false)
                      setSelectedContact(null)
                    } catch (error) {
                      console.error('Failed to delete contact:', error)
                    }
                  }
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
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

              {/* Conversations List Component */}
              <ConversationsList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={(conversation) => {
                  // When selecting from list, trigger fetch of full details
                  fetchConversationMessages(conversation.id)
                }}
                onHideList={() => setShowConversationList(false)}
                showConversationList={showConversationList}
              />

              {/* Messages Section Component */}
              <MessagesSection
                selectedConversation={selectedConversation}
                messages={messages}
                messagesLoading={messagesLoading}
                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSendMessage={sendMessage}
                onShowConversationList={() => setShowConversationList(true)}
                onUpdateConversationStatus={updateConversationStatus}
                onShowContactModal={(contact) => {
                  setSelectedContact(contact)
                  setShowContactModal(true)
                }}
                showConversationList={showConversationList}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}