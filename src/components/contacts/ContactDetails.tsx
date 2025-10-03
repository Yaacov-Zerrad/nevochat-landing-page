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
  const [newAttributeKey, setNewAttributeKey] = useState('')
  const [newAttributeValue, setNewAttributeValue] = useState('')
  const [newCustomKey, setNewCustomKey] = useState('')
  const [newCustomValue, setNewCustomValue] = useState('')

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
    setNewAttributeKey('')
    setNewAttributeValue('')
    setNewCustomKey('')
    setNewCustomValue('')
  }

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return '🌍'
    try {
      return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
      )
    } catch {
      return '🌍'
    }
  }

  const updateAdditionalAttribute = (key: string, value: any) => {
    setEditData({
      ...editData,
      additional_attributes: {
        ...editData.additional_attributes,
        [key]: value
      }
    })
  }

  const deleteAdditionalAttribute = (key: string) => {
    const newAttrs = { ...editData.additional_attributes }
    delete newAttrs[key]
    setEditData({
      ...editData,
      additional_attributes: newAttrs
    })
  }

  const addAdditionalAttribute = () => {
    if (!newAttributeKey.trim()) return
    updateAdditionalAttribute(newAttributeKey.trim(), newAttributeValue)
    setNewAttributeKey('')
    setNewAttributeValue('')
  }

  const updateCustomAttribute = (key: string, value: any) => {
    setEditData({
      ...editData,
      custom_attributes: {
        ...editData.custom_attributes,
        [key]: value
      }
    })
  }

  const deleteCustomAttribute = (key: string) => {
    const newAttrs = { ...editData.custom_attributes }
    delete newAttrs[key]
    setEditData({
      ...editData,
      custom_attributes: newAttrs
    })
  }

  const addCustomAttribute = () => {
    if (!newCustomKey.trim()) return
    updateCustomAttribute(newCustomKey.trim(), newCustomValue)
    setNewCustomKey('')
    setNewCustomValue('')
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
              className="space-y-4"
            >
              {/* Name */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Nom</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50 mt-1"
                      />
                    ) : (
                      <p className="text-white font-semibold">{contact.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Téléphone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone_number || ''}
                        onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50 mt-1"
                      />
                    ) : (
                      <p className="text-white font-semibold">{contact.phone_number || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50 mt-1"
                      />
                    ) : (
                      <p className="text-white font-semibold">{contact.email || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Localisation</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50 mt-1"
                      />
                    ) : (
                      <p className="text-white font-semibold">{contact.location || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Country Code */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                    {getCountryFlag((isEditing ? editData : contact)?.country_code || (isEditing ? editData : contact)?.additional_attributes?.country_code)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Code pays</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.country_code || ''}
                        onChange={(e) => setEditData({ ...editData, country_code: e.target.value })}
                        placeholder="ex: FR, US, CA"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50 mt-1"
                      />
                    ) : (
                      <p className="text-white font-semibold">{contact.country_code || contact.additional_attributes?.country_code || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Attributes */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Attributs supplémentaires</h3>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const key = prompt('Nom de l\'attribut:')
                        if (key) {
                          const value = prompt('Valeur:')
                          if (value !== null) {
                            updateAdditionalAttribute(key, value)
                          }
                        }
                      }}
                      className="text-xs px-2 py-1 bg-neon-green/20 text-neon-green rounded border border-neon-green/30 hover:bg-neon-green/30 transition-colors"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    {editData.additional_attributes && Object.entries(editData.additional_attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={key}
                          disabled
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400 text-sm"
                        />
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) => updateAdditionalAttribute(key, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                        />
                        <button
                          onClick={() => deleteAdditionalAttribute(key)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {(!editData.additional_attributes || Object.keys(editData.additional_attributes).length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">Aucun attribut</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contact.additional_attributes && Object.entries(contact.additional_attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                    {(!contact.additional_attributes || Object.keys(contact.additional_attributes).length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">Aucun attribut</p>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Attributes */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Attributs personnalisés</h3>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const key = prompt('Nom de l\'attribut:')
                        if (key) {
                          const value = prompt('Valeur:')
                          if (value !== null) {
                            updateCustomAttribute(key, value)
                          }
                        }
                      }}
                      className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    {editData.custom_attributes && Object.entries(editData.custom_attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={key}
                          disabled
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400 text-sm"
                        />
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) => updateCustomAttribute(key, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                        />
                        <button
                          onClick={() => deleteCustomAttribute(key)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {(!editData.custom_attributes || Object.keys(editData.custom_attributes).length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">Aucun attribut</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contact.custom_attributes && Object.entries(contact.custom_attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                    {(!contact.custom_attributes || Object.keys(contact.custom_attributes).length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">Aucun attribut</p>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4">Métadonnées</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Identifiant:</span>
                    <span className="text-white font-mono">{contact.identifier || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Créé le:</span>
                    <span className="text-white">{formatDate(contact.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Modifié le:</span>
                    <span className="text-white">{formatDate(contact.updated_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dernière activité:</span>
                    <span className="text-white">{contact.last_activity_at ? formatDate(contact.last_activity_at) : 'Jamais'}</span>
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