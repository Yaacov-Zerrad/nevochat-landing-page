'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationAPI, contactsAPI } from '@/lib/api'
import { ConversationsList,  Conversation, ConversationFilters, ConversationFiltersType } from './components'
import { MessagesSection } from './components'
import { ContactDetails } from '@/components/contacts/ContactDetails'
import { ConversationsProvider, useConversations } from '@/contexts/ConversationsContext'

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

// Main page component wrapped with provider
function ConversationsPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  
  // Use WebSocket context for real-time updates
  const {
    conversations: wsConversations,
    selectedConversation: wsSelectedConversation,
    messages: wsMessages,
    setSelectedConversation,
    isConnected,
    sendMessage: wsSendMessage,
    updateConversationStatus: wsUpdateStatus,
    refreshConversations,
    updateFilters,
  } = useConversations()
  
  // Local state for UI
  const [newMessage, setNewMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showConversationList, setShowConversationList] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ConversationFiltersType>({
    status: '',
    priority: '',
    assignee: '',
    unassigned: false,
    inbox: '',
    team: '',
    labels: '',
    contact_type: '',
    has_unread: false,
    is_snoozed: false,
    waiting_for: '',
    created_after: '',
    created_before: '',
    last_activity_after: '',
    last_activity_before: '',
    ordering: '-last_activity_at',
  })

  const conversations = wsConversations
  const selectedConversation = wsSelectedConversation
  const messages = wsMessages

  // Update filters when status or search changes
  useEffect(() => {
    const filterParams: any = {}
    
    // Apply filters from the advanced filters component
    // Only add filters that have actual values (not empty strings or false)
    if (filters.status && filters.status !== '') {
      filterParams.status = filters.status
    }
    
    if (filters.priority && filters.priority !== '') {
      filterParams.priority = filters.priority
    }
    
    if (filters.assignee && filters.assignee !== '') {
      filterParams.assignee = filters.assignee
    }
    
    if (filters.unassigned === true) {
      filterParams.unassigned = true
    }
    
    if (filters.inbox && filters.inbox !== '') {
      filterParams.inbox = filters.inbox
    }
    
    if (filters.team && filters.team !== '') {
      filterParams.team = filters.team
    }
    
    if (filters.labels && filters.labels !== '') {
      filterParams.labels = filters.labels
    }
    
    if (filters.contact_type && filters.contact_type !== '') {
      filterParams.contact_type = filters.contact_type
    }
    
    if (filters.has_unread === true) {
      filterParams.has_unread = true
    }
    
    if (filters.is_snoozed === true) {
      filterParams.is_snoozed = true
    }
    
    if (filters.waiting_for && filters.waiting_for !== '') {
      filterParams.waiting_for = filters.waiting_for
    }
    
    if (filters.created_after && filters.created_after !== '') {
      filterParams.created_after = new Date(filters.created_after).toISOString()
    }
    
    if (filters.created_before && filters.created_before !== '') {
      filterParams.created_before = new Date(filters.created_before).toISOString()
    }
    
    if (filters.last_activity_after && filters.last_activity_after !== '') {
      filterParams.last_activity_after = new Date(filters.last_activity_after).toISOString()
    }
    
    if (filters.last_activity_before && filters.last_activity_before !== '') {
      filterParams.last_activity_before = new Date(filters.last_activity_before).toISOString()
    }
    
    if (filters.ordering && filters.ordering !== '') {
      filterParams.ordering = filters.ordering
    }
    
    if (searchQuery.trim()) {
      filterParams.search = searchQuery.trim()
    }
    
    // Force update by creating a new object reference
    updateFilters({ ...filterParams })
  }, [filters, searchQuery, updateFilters])

  // Fetch conversations on mount and filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      refreshConversations()
    }
  }, [status, refreshConversations])

  const sendMessageHandler = async () => {
    if (!wsSelectedConversation || !newMessage.trim()) return
    
    try {
      wsSendMessage(wsSelectedConversation.id, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const updateConversationStatus = async (conversationId: number, newStatus: number) => {
    try {
      wsUpdateStatus(conversationId, newStatus)
    } catch (error) {
      console.error('Error updating conversation status:', error)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
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
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none sm:w-64 text-sm"
                />
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition-colors border text-sm flex items-center space-x-2 ${
                    showFilters
                      ? 'bg-neon-green/20 text-neon-green border-neon-green/40'
                      : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filtres</span>
                  {Object.values(filters).some(v => v && v !== '' && v !== false && v !== '-last_activity_at') && (
                    <span className="bg-neon-green text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {Object.values(filters).filter(v => v && v !== '' && v !== false && v !== '-last_activity_at').length}
                    </span>
                  )}
                </button>
                
                
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-400">
                    {isConnected ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters Modal */}
            <ConversationFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters)
              }}
              onClose={() => setShowFilters(false)}
              isOpen={showFilters}
            />

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
                  // Find full conversation from context
                  const fullConv = wsConversations.find(c => c.id === conversation.id)
                  if (fullConv) {
                    setSelectedConversation(fullConv)
                  }
                }}
                onHideList={() => setShowConversationList(false)}
                showConversationList={showConversationList}
              />

              {/* Messages Section Component */}
              <MessagesSection
                selectedConversation={selectedConversation}
                messages={messages}
                messagesLoading={false}
                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSendMessage={sendMessageHandler}
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

// Default export with ConversationsProvider wrapper
export default function ConversationsPage() {
  const params = useParams()
  const accountId = parseInt(params.accountId as string)
  const { data: session } = useSession()
  
  // Get token from session
  const token = session?.accessToken as string || ''

  if (!token) {
    // Return loading or nothing while token is being fetched
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <ConversationsProvider accountId={accountId} token={token}>
      <ConversationsPageContent />
    </ConversationsProvider>
  )
}