'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactDetails } from '@/components/contacts/ContactDetails'
import { ContactFilters } from '@/components/contacts/ContactFilters'
import { ContactStats } from '@/components/contacts/ContactStats'
import { useContacts } from '@/hooks/useContacts'
import { ContactFilters as FilterType } from '@/types/contact'

interface ContactsPageProps {
  params: {
    accountId: string
  }
}

export default function ContactsPage({ params }: ContactsPageProps) {
  const { accountId } = params
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterType>({
    status: 'all',
    contact_type: '',
    country_code: '',
    has_conversations: null,
    created_after: '',
    created_before: '',
  })

  const {
    contacts,
    stats,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    updateContact,
    blockContact,
    unblockContact,
    deleteContact,
  } = useContacts(accountId, { search: searchQuery, ...filters })

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters)
    setSelectedContactId(null)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedContactId(null)
  }

  const handleContactSelect = (contactId: number) => {
    setSelectedContactId(contactId)
    setShowContactModal(true)
  }

  const handleCloseModal = () => {
    setShowContactModal(false)
    // Keep selectedContactId for a smoother animation
    setTimeout(() => setSelectedContactId(null), 300)
  }

  const handleContactUpdate = async (contactId: string, data: any) => {
    try {
      await updateContact(parseInt(contactId), data)
      // Refresh contact details if this contact is selected
      if (parseInt(contactId) === selectedContactId) {
        refetch()
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
    }
  }

  const handleContactBlock = async (contactId: number) => {
    try {
      await blockContact(contactId)
      refetch()
    } catch (error) {
      console.error('Failed to block contact:', error)
    }
  }

  const handleContactUnblock = async (contactId: number) => {
    try {
      await unblockContact(contactId)
      refetch()
    } catch (error) {
      console.error('Failed to unblock contact:', error)
    }
  }

  const handleContactDelete = async (contactId: number) => {
    try {
      await deleteContact(contactId)
      if (contactId === selectedContactId) {
        setShowContactModal(false)
        setSelectedContactId(null)
      }
      refetch()
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h3 className="text-red-400 font-medium mb-2">Erreur</h3>
            <p className="text-gray-300">Impossible de charger les contacts.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="border-b border-neon-green/20 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Contacts</h1>
                <p className="text-gray-400 mt-1">
                  Gérez vos contacts et leurs conversations
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-neon-green focus:outline-none sm:w-64 text-sm placeholder-gray-400"
                  />
                  <svg
                    className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                    showFilters
                      ? 'bg-neon-green/20 border-neon-green/30 text-neon-green'
                      : 'bg-neon-green/20 border-neon-green/20 text-neon-green hover:bg-neon-green/30 hover:border-neon-green/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    <span>Filtres</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <ContactStats stats={stats} loading={loading} />

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <ContactFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="p-4 lg:p-6">
            {/* Contacts List - Full Width */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  Contacts ({pagination?.totalCount || 0})
                </h2>
              </div>
              
              <div className="divide-y divide-white/10">
                {loading && contacts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-neon-green/20 border-t-neon-green rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-4">Chargement des contacts...</p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="p-8 text-center">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Aucun contact</h3>
                    <p className="text-gray-400">
                      Aucun contact ne correspond à vos critères de recherche.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                      {contacts.map((contact) => (
                        <ContactCard
                          key={contact.id}
                          contact={contact}
                          isSelected={selectedContactId === contact.id}
                          onClick={() => handleContactSelect(contact.id)}
                          onBlock={() => handleContactBlock(contact.id)}
                          onUnblock={() => handleContactUnblock(contact.id)}
                          onDelete={() => handleContactDelete(contact.id)}
                        />
                      ))}
                    </div>
                    
                    {/* Load More */}
                    {pagination?.hasNextPage && (
                      <div className="p-4 border-t border-white/10">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Chargement...' : 'Charger plus'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Details Modal */}
      <AnimatePresence>
        {showContactModal && selectedContactId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Détails du contact</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <ContactDetails
                  contactId={selectedContactId.toString()}
                  accountId={accountId}
                  onUpdate={handleContactUpdate}
                  onBlock={() => handleContactBlock(selectedContactId)}
                  onUnblock={() => handleContactUnblock(selectedContactId)}
                  onDelete={() => {
                    handleContactDelete(selectedContactId)
                    handleCloseModal()
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}