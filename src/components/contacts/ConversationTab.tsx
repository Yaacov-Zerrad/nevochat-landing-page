'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { contactsAPI } from '@/lib/api'

interface Conversation {
  id: string
  display_id: number
  status: number
  created_at: string
  updated_at: string
  last_activity_at: string
  inbox: {
    id: string
    name: string
    channel_type: string
  }
  assignee?: {
    id: string
    name: string
  }
}

interface ConversationTabProps {
  contactId: string
  accountId: string
}

export function ConversationTab({ contactId, accountId }: ConversationTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Ouverte'
      case 1:
        return 'Résolue'
      case 2:
        return 'En attente'
      default:
        return 'Inconnue'
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-green-400 bg-green-500/10'
      case 1:
        return 'text-blue-400 bg-blue-500/10'
      case 2:
        return 'text-yellow-400 bg-yellow-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Date invalide'
    }
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
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg text-neon-green hover:bg-neon-green/30 transition-colors"
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
        <h3 className="text-lg font-medium text-white mb-2">Aucune conversation</h3>
        <p className="text-gray-400">
          Ce contact n&apos;a pas encore de conversations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Conversations ({conversations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => {
              // Navigate to conversation
              window.location.href = `/dashboard/accounts/${accountId}/conversations?conversation=${conversation.id}`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium">
                  #{conversation.display_id}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                  {getStatusText(conversation.status)}
                </span>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Canal:</span>
                <span className="text-white">{conversation.inbox.name}</span>
              </div>
              
              {conversation.assignee && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Assigné à:</span>
                  <span className="text-white">{conversation.assignee.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Créée le:</span>
                <span className="text-white">{formatDate(conversation.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Dernière activité:</span>
                <span className="text-white">{formatDate(conversation.last_activity_at)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}