'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  mode?: 'ai' | 'human'
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
  mode?: 'ai' | 'human'
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
  private?: boolean
  status?: number
  sender_type: string
  sender_id?: number
  sender_name?: string
  attachments?: MessageAttachment[]
}

interface MessagesSectionProps {
  selectedConversation: Conversation | null
  messages: Message[]
  messagesLoading: boolean
  newMessage: string
  onNewMessageChange: (message: string) => void
  onSendMessage: () => void
  onShowConversationList: () => void
  onUpdateConversationStatus: (conversationId: number, status: number) => void
  onShowContactModal: (contact: Contact) => void
  showConversationList: boolean
  onToggleMode?: (type: 'contact' | 'conversation', id: number) => void
}

const statusLabels = {
  0: { label: 'Ouvert', color: 'bg-primary/20 text-primary' },
  1: { label: 'Résolu', color: 'bg-gray-500/20 text-muted-foreground' },
  2: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
  3: { label: 'Fermé', color: 'bg-red-500/20 text-red-400' }
}


// Component for displaying message attachments
const MessageAttachments = ({ attachments }: { attachments: MessageAttachment[] }) => {
  if (!attachments || attachments.length === 0) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((attachment) => {
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
              <div className="absolute bottom-2 left-2 bg-black/70 text-foreground text-xs px-2 py-1 rounded">
                {attachment.filename}
              </div>
            </div>
          )
        }

        if (attachment.file_type === 'video') {
          return (
            <div key={attachment.id} className="relative">
              <video
                src={attachment.file_url}
                controls
                className="max-w-[200px] sm:max-w-xs max-h-48 sm:max-h-64 rounded-lg border border-gray-600/30"
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
              <div className="text-xs text-muted-foreground mt-1">
                {attachment.filename} ({formatFileSize(attachment.file_size)})
              </div>
            </div>
          )
        }

        if (attachment.file_type === 'audio') {
          return (
            <div key={attachment.id} className="bg-gray-700/50 rounded-lg p-2 sm:p-3 max-w-[220px] sm:max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="text-xs sm:text-sm text-foreground truncate">{attachment.filename}</span>
              </div>
              <audio
                src={attachment.file_url}
                controls
                className="w-full"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
              <div className="text-xs text-muted-foreground mt-1">
                {formatFileSize(attachment.file_size)}
              </div>
            </div>
          )
        }

        // For other file types (documents, etc.)
        return (
          <div key={attachment.id} className="bg-gray-700/50 rounded-lg p-2 sm:p-3 max-w-[220px] sm:max-w-xs">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-foreground truncate">{attachment.filename}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
              </div>
              <button
                onClick={() => window.open(attachment.file_url, '_blank')}
                className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                title="Télécharger"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const MessagesSection = ({
  selectedConversation,
  messages,
  messagesLoading,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onShowConversationList,
  onUpdateConversationStatus,
  onShowContactModal,
  showConversationList,
  onToggleMode
}: MessagesSectionProps) => {
  // Fonction pour formater l'heure uniquement
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fonction pour obtenir le label de date (Aujourd'hui, Hier, ou la date)
  const getDateLabel = (dateString: string) => {
    const messageDate = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Réinitialiser les heures pour comparer uniquement les dates
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    
    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return "Aujourd'hui"
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Hier"
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  }

  // Fonction pour vérifier si on doit afficher un séparateur de date
  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true
    
    const currentDate = new Date(currentMessage.created_at)
    const previousDate = new Date(previousMessage.created_at)
    
    // Comparer uniquement les dates (sans les heures)
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const previousDateOnly = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate())
    
    return currentDateOnly.getTime() !== previousDateOnly.getTime()
  }

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null
    return countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    )
  }

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${
      showConversationList ? 'hidden lg:flex' : 'flex'
    }`}>
      {selectedConversation ? (
        <>
          {/* Conversation Header */}
          <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-200 dark:border-primary/20 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 flex-shrink-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
                  <button
                    onClick={onShowConversationList}
                    className="lg:hidden text-primary hover:text-primary/80 transition-colors p-1 rounded-lg hover:bg-neon-green/10 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Contact Avatar and Name */}
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-green/30 to-emerald-500/30 dark:from-neon-green/20 dark:to-emerald-500/20 rounded-full flex items-center justify-center border-2 border-primary/40 dark:border-primary/30 flex-shrink-0">
                      <span className="text-primary font-semibold text-sm sm:text-base">
                        {selectedConversation.contact.name ? selectedConversation.contact.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {selectedConversation.contact.name || 'Contact inconnu'}
                      </h2>
                      {selectedConversation.contact.phone_number && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{selectedConversation.contact.phone_number}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs">
                  <span className="bg-gray-200 dark:bg-gray-700/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">#{selectedConversation.display_id}</span>
                  <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full truncate max-w-[120px] sm:max-w-none font-medium">{selectedConversation.inbox.name}</span>
                  {selectedConversation.assignee && (
                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full truncate max-w-[100px] sm:max-w-none font-medium">
                      {selectedConversation.assignee.display_name || selectedConversation.assignee.name}
                    </span>
                  )}
                  {selectedConversation.contact.additional_attributes?.country && (
                    <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                      {selectedConversation.contact.additional_attributes.country_code && 
                        getCountryFlag(selectedConversation.contact.additional_attributes.country_code)
                      } <span className="hidden sm:inline">{selectedConversation.contact.additional_attributes.country}</span>
                    </span>
                  )}
                  {/* Mode Indicators */}
                  <button
                    onClick={() => onToggleMode?.('conversation', selectedConversation.id)}
                    title={`Cliquez pour passer en mode ${selectedConversation.mode === 'human' ? 'AI' : 'Humain'}`}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedConversation.mode === 'human'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                        : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                    }`}
                  >
                    Conv: {selectedConversation.mode === 'human' ? 'Humain' : 'AI'}
                  </button>
                  <button
                    onClick={() => onToggleMode?.('contact', selectedConversation.contact.id)}
                    title={`Cliquez pour passer le contact en mode ${selectedConversation.contact.mode === 'human' ? 'AI' : 'Humain'}`}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedConversation.contact.mode === 'human'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                        : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                    }`}
                  >
                    Contact: {selectedConversation.contact.mode === 'human' ? 'Humain' : 'AI'}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                {/* Contact Details Button */}
                <button
                  onClick={() => onShowContactModal(selectedConversation.contact)}
                  className="bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 sm:px-3 rounded-lg text-xs transition-colors border border-primary/20 hover:border-primary/40 flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Contact</span>
                </button>
                
                {/* Status buttons - conditional based on current status */}
                {selectedConversation.status === 0 ? (
                  <button
                    onClick={() => onUpdateConversationStatus(selectedConversation.id, 1)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 sm:px-3 rounded-lg text-xs transition-colors flex items-center space-x-1 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Résoudre</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateConversationStatus(selectedConversation.id, 0)}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 sm:px-3 rounded-lg text-xs transition-colors flex items-center space-x-1 w-full sm:w-auto justify-center"
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 min-h-0">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Chargement des messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">Aucun message</p>
                  <p className="text-sm text-gray-500 mt-1">Cette conversation n&apos;a pas encore de messages</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message, index) => {
                  const isUser = message.sender_type === 'User'
                  const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type
                  const previousMessage = index > 0 ? messages[index - 1] : undefined
                  const showDateSeparator = shouldShowDateSeparator(message, previousMessage)
                  
                  return (
                    <div key={message.id}>
                      {/* Séparateur de date (style WhatsApp) */}
                      {showDateSeparator && (
                        <div className="flex justify-center my-3 sm:my-4">
                          <div className="bg-gray-200 dark:bg-gray-700/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-medium shadow-md border border-gray-300 dark:border-gray-600/30">
                            {getDateLabel(message.created_at)}
                          </div>
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-1.5 sm:gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                      {!isUser && (
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          showAvatar ? 'bg-gray-300 dark:bg-gray-600' : 'opacity-0'
                        }`}>
                          {showAvatar && message.sender_name && (
                            <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">
                              {message.sender_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-md ${isUser ? 'order-first' : ''}`}>
                        {showAvatar && !isUser && message.sender_name && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2 font-medium">{message.sender_name}</p>
                        )}
                        
                        <div
                          className={`px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl shadow-lg ${
                            isUser
                              ? 'bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-950 dark:to-primary-800 text-gray-900 dark:text-white border-2 border-primary/50 dark:border-primary/40'
                              : 'bg-primary-200 dark:bg-primary-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600/50'
                          } ${
                            isUser 
                              ? 'rounded-br-md' 
                              : 'rounded-bl-md'
                          }`}
                        >
                          {message.content && (
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                          )}
                          
                          {/* Display attachments */}
                          <MessageAttachments attachments={message.attachments || []} />
                          
                          <div className="flex justify-end mt-1.5 sm:mt-2">
                            <span className="text-xs text-gray-700 dark:text-gray-200 opacity-80 font-medium">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isUser && (
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          showAvatar ? 'bg-primary/30 dark:bg-primary/20 border-2 border-primary/50 dark:border-primary/30' : 'opacity-0'
                        }`}>
                          {showAvatar && message.sender_name && (
                            <span className="text-primary text-xs font-medium">
                              {message.sender_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-2 sm:p-3 lg:p-4 border-t border-gray-200 dark:border-primary/20 bg-gray-50 dark:bg-gray-800/30 flex-shrink-0">
            <div className="flex items-end gap-1.5 sm:gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => onNewMessageChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSendMessage()
                    }
                  }}
                  placeholder="Message..."
                  rows={1}
                  className="w-full bg-white dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600/50 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20 focus:outline-none text-sm resize-none overflow-hidden backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400"
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                    height: newMessage.split('\n').length > 1 ? 'auto' : '40px'
                  }}
                />
              </div>
              
              <button
                onClick={onSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-neon-green/30 to-emerald-500/30 hover:from-neon-green/40 hover:to-emerald-500/40 dark:from-neon-green/20 dark:to-emerald-500/20 dark:hover:from-neon-green/30 dark:hover:to-emerald-500/30 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600/20 dark:disabled:to-gray-600/20 disabled:text-gray-500 dark:disabled:text-muted-foreground text-primary p-2.5 sm:p-3 rounded-2xl transition-all border-2 border-primary/40 hover:border-primary/60 dark:border-primary/20 dark:hover:border-primary/40 disabled:border-gray-400 dark:disabled:border-gray-600/20 flex items-center justify-center min-w-[40px] h-[40px] shadow-lg disabled:shadow-none flex-shrink-0"
                title={newMessage.trim() ? "Envoyer le message" : "Tapez un message"}
              >
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${newMessage.trim() ? 'rotate-0' : 'rotate-45'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Quick actions - Hidden on mobile for cleaner interface */}
            <div className="hidden sm:flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Maj+Entrée pour nouvelle ligne</span>
              </div>
              <div className="flex items-center space-x-2">
                {selectedConversation.status !== 0 && (
                  <span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                    Conversation {statusLabels[selectedConversation.status as keyof typeof statusLabels].label.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
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
  )
}

export default MessagesSection