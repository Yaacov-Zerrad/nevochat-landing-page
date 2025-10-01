'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConversationTab } from './ConversationTab'
import { contactsAPI } from '@/lib/api'

interface Contact {
  id: string
  name: string
  email?: string
  phone_number?: string
  identifier?: string
  contact_type?: number
  middle_name?: string
  last_name?: string
  location?: string
  country_code?: string
  blocked: boolean
  additional_attributes?: any
  custom_attributes?: any
  last_activity_at?: string
  created_at: string
  updated_at: string
  conversations_count: number
  recent_conversations?: any[]
  tags?: string[]
}

interface ContactDetailsProps {
  contactId: string
  accountId: string
  onUpdate: (contactId: string, data: any) => void
  onBlock: () => void
  onUnblock: () => void
  onDelete: () => void
}

export function ContactDetails({
  contactId,
  accountId,
  onUpdate,
  onBlock,
  onUnblock,
  onDelete,
}: ContactDetailsProps) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Contact>>({})
  const [activeTab, setActiveTab] = useState<'details' | 'conversations'>('details')

  useEffect(() => {
    const loadContactDetails = async () => {
      if (!contactId) return
      
      setLoading(true)
      setError(null)
      try {
        const data = await contactsAPI.getContact(parseInt(accountId), parseInt(contactId))
        setContact(data)
        setEditData(data)
      } catch (err) {
        setError('Impossible de charger les détails du contact')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadContactDetails()
  }, [contactId, accountId])

  const fetchContactDetails = async () => {
    if (!contactId || !accountId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await contactsAPI.getContact(parseInt(accountId), parseInt(contactId))
      setContact(data)
      setEditData(data)
    } catch (err) {
      setError('Impossible de charger les détails du contact')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!contact) return
    
    try {
      setLoading(true)
      await onUpdate(contact.id, editData)
      setContact({ ...contact, ...editData })
      setIsEditing(false)
    } catch (err) {
      setError('Impossible de sauvegarder les modifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData(contact || {})
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
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
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-white/10 rounded w-1/3"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchContactDetails}
            className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg text-neon-green hover:bg-neon-green/30 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!contact) return null

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {getInitials(contact.name)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {contact.name || 'Contact sans nom'}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    contact.blocked
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {contact.blocked ? 'Bloqué' : 'Actif'}
                </span>
                <span className="text-gray-400 text-sm">
                  {contact.conversations_count} conversation{contact.conversations_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  Modifier
                </button>
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-2">
                      {contact.blocked ? (
                        <button
                          onClick={onUnblock}
                          className="w-full px-4 py-2 text-left text-green-400 hover:bg-white/5 transition-colors"
                        >
                          Débloquer
                        </button>
                      ) : (
                        <button
                          onClick={onBlock}
                          className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-white/5 transition-colors"
                        >
                          Bloquer
                        </button>
                      )}
                      <button
                        onClick={onDelete}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg text-neon-green hover:bg-neon-green/30 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'details'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'conversations'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Conversations ({contact.conversations_count})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'details' ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom complet
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                      />
                    ) : (
                      <p className="text-white">{contact.name || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                      />
                    ) : (
                      <p className="text-white">{contact.email || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone_number || ''}
                        onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                      />
                    ) : (
                      <p className="text-white">{contact.phone_number || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Localisation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                      />
                    ) : (
                      <p className="text-white">{contact.location || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Métadonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de création
                    </label>
                    <p className="text-white">{formatDate(contact.created_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dernière modification
                    </label>
                    <p className="text-white">{formatDate(contact.updated_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dernière activité
                    </label>
                    <p className="text-white">
                      {contact.last_activity_at ? formatDate(contact.last_activity_at) : 'Jamais'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Identifiant
                    </label>
                    <p className="text-white font-mono text-sm">{contact.identifier || '-'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="conversations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ConversationTab contactId={contactId} accountId={accountId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}