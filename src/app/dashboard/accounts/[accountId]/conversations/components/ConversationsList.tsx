'use client'

import { motion } from 'framer-motion'

// Optimized conversation interface for list view - only includes displayed data
interface ConversationListItem {
  id: number
  display_id: number
  status: number
  last_activity_at: string
  priority?: number
  contact_name: string
  contact_country_code?: string
  contact_type?: string
  inbox_name: string
  last_message?: {
    content: string
    sender_type: string
  }
  unread_count: number
}

// Full conversation interface for detail view (kept for selectedConversation)
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

interface ConversationsListProps {
  conversations: ConversationListItem[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: ConversationListItem) => void
  onHideList: () => void
  showConversationList: boolean
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

export const ConversationsList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onHideList,
  showConversationList
}: ConversationsListProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null
    return countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    )
  }

  return (
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
          {conversations.map((conversation) => (
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
                onSelectConversation(conversation)
                onHideList()
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
                    {conversation.contact_name ? conversation.contact_name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate">
                        {conversation.contact_name || 'Contact inconnu'}
                      </h3>
                      {conversation.contact_country_code && (
                        <span className="text-lg flex-shrink-0">
                          {getCountryFlag(conversation.contact_country_code)}
                        </span>
                      )}
                      {conversation.contact_type && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex-shrink-0">
                          {conversation.contact_type}
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
                      <span className="truncate text-xs">{conversation.inbox_name}</span>
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
          ))}
        </div>
      )}
    </div>
  )
}

// Export the optimized type for use in parent components
export type { ConversationListItem }

export default ConversationsList