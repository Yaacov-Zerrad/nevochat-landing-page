'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contactsAPI, conversationAPI } from '@/lib/api'

interface Contact {
  id: number
  name: string
  phone_number?: string
  identifier?: string
  additional_attributes?: {
    country?: string
    country_code?: string
    [key: string]: any
  }
}

interface Inbox {
  id: number
  name: string
  channel_type: string
}

interface StartConversationModalProps {
  isOpen: boolean
  onClose: () => void
  accountId: number
  onConversationStarted: (conversationId: number) => void
}

export function StartConversationModal({
  isOpen,
  onClose,
  accountId,
  onConversationStarted,
}: StartConversationModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [contactName, setContactName] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const [selectedInboxId, setSelectedInboxId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch contacts and inboxes when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        await fetchContacts()
        await fetchInboxes()
      } else {
        // Reset form when closing
        setSelectedContact(null)
        setPhoneNumber('')
        setContactName('')
        setInitialMessage('')
        setSearchQuery('')
        setError(null)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accountId])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await contactsAPI.getContacts(accountId, {
        page_size: 50,
        search: searchQuery,
        ordering: '-created_at',
      })
      setContacts(response.results)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setError('Échec du chargement des contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchInboxes = async () => {
    try {
      const data = await conversationAPI.getInboxes(accountId)
      setInboxes(data.results || [])
      if (data.results && data.results.length > 0) {
        setSelectedInboxId(data.results[0].id)
      }
    } catch (error) {
      console.error('Error fetching inboxes:', error)
      setError('Échec du chargement des boîtes de réception')
    }
  }

  // Update search when query changes
  useEffect(() => {
    if (isOpen) {
      const debounce = setTimeout(() => {
        fetchContacts()
      }, 300)
      return () => clearTimeout(debounce)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isOpen])

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setPhoneNumber(contact.phone_number || contact.identifier || '')
    setContactName(contact.name)
  }

  const handleStartConversation = async () => {
    if (!phoneNumber.trim()) {
      setError('Le numéro de téléphone est requis')
      return
    }

    if (!selectedInboxId) {
      setError('Veuillez sélectionner une boîte de réception')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await conversationAPI.startConversation({
        account_id: accountId,
        inbox_id: selectedInboxId,
        phone_number: phoneNumber,
        contact_name: contactName || undefined,
        initial_message: initialMessage || undefined,
      })

      // Call the callback with the conversation ID
      onConversationStarted(response.conversation_id)
      onClose()
    } catch (error: any) {
      console.error('Error starting conversation:', error)
      setError(error.response?.data?.detail || 'Échec du démarrage de la conversation')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 border border-neon-green/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 z-10 p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Nouvelle conversation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Inbox Selection */}
            {inboxes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Boîte de réception
                </label>
                <select
                  value={selectedInboxId || ''}
                  onChange={(e) => setSelectedInboxId(parseInt(e.target.value))}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none"
                >
                  {inboxes.map((inbox) => (
                    <option key={inbox.id} value={inbox.id}>
                      {inbox.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Contact Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rechercher un contact existant
              </label>
              <input
                type="text"
                placeholder="Rechercher par nom ou numéro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none"
              />

              {/* Contacts List */}
              {loading ? (
                <div className="mt-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green mx-auto"></div>
                </div>
              ) : contacts.length > 0 ? (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-neon-green/20 border-neon-green text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-400">
                        {contact.phone_number || contact.identifier}
                      </div>
                      {contact.additional_attributes?.country && (
                        <div className="text-xs text-gray-500 mt-1">
                          {contact.additional_attributes.country}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Aucun contact trouvé
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-gray-400 mb-4">Ou entrez manuellement les informations</p>

              {/* Inbox Selector */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boîte de réception *
                  </label>
                  <select
                    value={selectedInboxId || ''}
                    onChange={(e) => setSelectedInboxId(parseInt(e.target.value))}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none"
                  >
                    <option value="">Sélectionner une boîte de réception</option>
                    {inboxes.map((inbox) => (
                      <option key={inbox.id} value={inbox.id}>
                        {inbox.name} ({inbox.channel_type})
                      </option>
                    ))}
                  </select>
                </div>

              {/* Phone Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="text"
                    placeholder="+972545564449"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Incluez l&apos;indicatif du pays (ex: +972, +33)
                  </p>
                </div>

                {/* Contact Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du contact (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none"
                  />
                </div>

                {/* Initial Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message initial (optionnel)
                  </label>
                  <textarea
                    placeholder="Tapez un message ou laissez vide pour démarrer le flow automatique..."
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si aucun message n&apos;est fourni, le flow de chatbot démarrera automatiquement
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 z-10 p-4 sm:p-6 border-t border-white/10 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleStartConversation}
              disabled={submitting || !phoneNumber.trim() || !selectedInboxId}
              className="px-6 py-3 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Démarrage...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Démarrer la conversation</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
