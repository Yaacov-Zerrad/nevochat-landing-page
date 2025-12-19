'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contactsAPI, conversationAPI } from '@/lib/api'
import Image from 'next/image'

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

interface ConversationTabProps {
  contactId: string
  accountId: string
}

const statusLabels = {
  0: { label: 'Ouvert', color: 'bg-green-500/20 text-green-400' },
  1: { label: 'Résolu', color: 'bg-gray-500/20 text-muted-foreground' },
  2: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
  3: { label: 'Fermé', color: 'bg-red-500/20 text-red-400' }
}

const priorityLabels = {
  0: { label: 'Faible', color: 'text-blue-400' },
  1: { label: 'Moyenne', color: 'text-yellow-400' },
  2: { label: 'Élevée', color: 'text-orange-400' },
  3: { label: 'Urgente', color: 'text-red-400' }
}

export function ConversationTab({ contactId, accountId }: ConversationTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const fetchConversations = useCallback(async () => {
    if (!contactId || !accountId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await contactsAPI.getContactConversations(
        parseInt(accountId), 
        parseInt(contactId)
      )
      setConversations(data.results || data)
    } catch (err) {
      setError('Impossible de charger les conversations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [contactId, accountId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

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

  const fetchMessages = useCallback(async (conversationId: number) => {
    setMessagesLoading(true)
    try {
      const data = await conversationAPI.getConversation(parseInt(accountId), conversationId)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [accountId])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
    setMessages([])
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      await conversationAPI.sendMessage(parseInt(accountId), selectedConversation.id, {
        content: newMessage,
        message_type: 0,
        private: false
      })
      setNewMessage('')
      fetchMessages(selectedConversation.id)
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-6 bg-white/10 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Erreur</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-16 h-16 text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-2">Aucune conversation</h3>
        <p className="text-muted-foreground">
          Ce contact n&apos;a pas encore de conversations.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {!selectedConversation ? (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-700/30 -mx-6">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="px-6 py-4 cursor-pointer transition-all relative hover:bg-gray-800/30"
                onClick={() => handleSelectConversation(conversation)}
              >
            {/* Unread indicator */}
            {conversation.unread_count > 0 && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                <span className="text-primary font-semibold text-base sm:text-lg">
                  {conversation.contact.name ? conversation.contact.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                      {conversation.contact.name || 'Contact inconnu'}
                    </h3>
                    {conversation.contact.additional_attributes?.country_code && (
                      <span className="text-base sm:text-lg flex-shrink-0">
                        {getCountryFlag(conversation.contact.additional_attributes.country_code)}
                      </span>
                    )}
                    {conversation.contact.additional_attributes?.type && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0 hidden sm:inline-block">
                        {conversation.contact.additional_attributes.type}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0 whitespace-nowrap ${statusLabels[conversation.status as keyof typeof statusLabels].color}`}>
                    {statusLabels[conversation.status as keyof typeof statusLabels].label}
                  </span>
                </div>
                
                {/* Meta info */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                    <span className="truncate">#{conversation.display_id}</span>
                    <span className="text-gray-600">•</span>
                    <span className="truncate text-xs">{conversation.inbox.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                    {conversation.unread_count > 0 && (
                      <span className="bg-red-500 text-foreground text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full min-w-[20px] text-center">
                        {conversation.unread_count}
                      </span>
                    )}
                    <span className="text-xs whitespace-nowrap">{formatTime(conversation.last_activity_at)}</span>
                  </div>
                </div>
                
                {/* Last message */}
                {conversation.last_message && (
                  <p className="text-xs sm:text-sm text-gray-300 truncate mb-1">
                    <span className="text-gray-500">
                      {conversation.last_message.sender_type === 'User' ? 'Vous: ' : ''}
                    </span>
                    {conversation.last_message.content}
                  </p>
                )}
                
                {/* Priority */}
                {conversation.priority !== undefined && conversation.priority > 0 && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
        </motion.div>
      ) : (
        <motion.div
          key="messages"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex flex-col h-[600px] -mx-6 min-h-0"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-white/5 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleBackToList}
                className="text-primary hover:text-primary/80 transition-colors p-1 rounded-lg hover:bg-neon-green/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-primary/30 flex-shrink-0">
                  <span className="text-primary font-semibold text-sm sm:text-base">
                    {selectedConversation.contact.name ? selectedConversation.contact.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                    {selectedConversation.contact.name || 'Contact inconnu'}
                  </h3>
                  <p className="text-xs text-muted-foreground">#{selectedConversation.display_id}</p>
                </div>
              </div>

              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${statusLabels[selectedConversation.status as keyof typeof statusLabels].color}`}>
                {statusLabels[selectedConversation.status as keyof typeof statusLabels].label}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Chargement des messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                <div>
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-base sm:text-lg font-medium">Aucun message</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.sender_type === 'User'
                const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-1.5 sm:gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        showAvatar ? 'bg-gray-600' : 'opacity-0'
                      }`}>
                        {showAvatar && (
                          <span className="text-foreground text-xs font-medium">
                            {message.sender_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
                      {showAvatar && !isUser && (
                        <p className="text-xs text-muted-foreground mb-1 ml-2">{message.sender_name}</p>
                      )}
                      
                      <div
                        className={`px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl shadow-lg ${
                          isUser
                            ? 'bg-gradient-to-r from-neon-green/20 to-emerald-500/20 text-foreground border border-primary/20'
                            : 'bg-secondary/80 text-foreground border border-gray-600/30'
                        } ${
                          isUser 
                            ? 'rounded-br-md' 
                            : 'rounded-bl-md'
                        }`}
                      >
                        {message.content && (
                          <p className="text-sm leading-relaxed break-words">{message.content}</p>
                        )}
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {message.attachments.map((attachment) => {
                              if (attachment.file_type === 'image') {
                                return (
                                  <div key={attachment.id} className="relative">
                                    <Image
                                      src={attachment.file_url}
                                      alt={attachment.filename}
                                      width={250}
                                      height={200}
                                      className="max-w-[200px] sm:max-w-xs max-h-48 sm:max-h-64 rounded-lg border border-gray-600/30 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                                      onClick={() => window.open(attachment.file_url, '_blank')}
                                    />
                                  </div>
                                )
                              }

                              return (
                                <div key={attachment.id} className="bg-secondary/50 rounded-lg p-2">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-foreground truncate flex-1">{attachment.filename}</span>
                                    <span className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-1.5 sm:mt-2">
                          <span className="text-xs text-gray-300 opacity-70">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isUser && (
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        showAvatar ? 'bg-primary/20 border border-primary/30' : 'opacity-0'
                      }`}>
                        {showAvatar && (
                          <span className="text-primary text-xs font-medium">
                            {message.sender_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-white/5 flex-shrink-0">
            <div className="flex items-end gap-1.5 sm:gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Message..."
                rows={1}
                className="flex-1 bg-secondary/80 text-foreground px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-gray-600/50 focus:border-neon-green/50 focus:outline-none text-sm resize-none"
                style={{
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-neon-green/20 to-emerald-500/20 hover:from-neon-green/30 hover:to-emerald-500/30 disabled:from-gray-600/20 disabled:to-gray-600/20 disabled:text-muted-foreground text-primary p-2.5 sm:p-3 rounded-2xl transition-all border border-primary/20 hover:border-neon-green/40 disabled:border-gray-600/20 flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}