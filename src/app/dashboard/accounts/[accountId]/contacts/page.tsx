'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactDetails } from '@/components/contacts/ContactDetails'
import { ContactFilters } from '@/components/contacts/ContactFilters'
import { ContactStats } from '@/components/contacts/ContactStats'
import { useContacts } from '@/hooks/useContacts'
import { ContactFilters as FilterType } from '@/types/contacts'

interface ContactsPageProps {
  params: {
    accountId: string
  }
}

export default function ContactsPage({ params }: ContactsPageProps) {
  const { accountId } = params
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterType>({
    status: 'all',
    contactType: '',
    countryCode: '',
    hasConversations: null,
    createdAfter: '',
    createdBefore: '',
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

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
  }

  const handleContactUpdate = async (contactId: string, data: any) => {
    try {
      await updateContact(contactId, data)
      // Refresh contact details if this contact is selected
      if (contactId === selectedContactId) {
        refetch()
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
    }
  }

  const handleContactBlock = async (contactId: string) => {
    try {
      await blockContact(contactId)
      refetch()
    } catch (error) {
      console.error('Failed to block contact:', error)
    }
  }

  const handleContactUnblock = async (contactId: string) => {
    try {
      await unblockContact(contactId)
      refetch()
    } catch (error) {
      console.error('Failed to unblock contact:', error)
    }
  }

  const handleContactDelete = async (contactId: string) => {
    try {
      await deleteContact(contactId)
      if (contactId === selectedContactId) {
        setSelectedContactId(null)
      }
      refetch()
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h3 className="text-red-400 font-medium mb-2">Erreur</h3>
            <p className="text-gray-300">Impossible de charger les contacts.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Contacts</h1>
              <p className="text-gray-400 mt-1">
                Gérez vos contacts et leurs conversations
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green/50 w-64"
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
                className={`px-4 py-2 rounded-lg border transition-all ${
                  showFilters
                    ? 'bg-neon-green/20 border-neon-green/30 text-neon-green'
                    : 'bg-white/5 border-white/10 text-white hover:border-white/20'
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
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Contacts List */}
          <div className="col-span-12 lg:col-span-5">
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
                    
                    {/* Load More */}
                    {pagination?.hasNextPage && (
                      <div className="p-4">
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

          {/* Contact Details */}
          <div className="col-span-12 lg:col-span-7">
            {selectedContactId ? (
              <ContactDetails
                contactId={selectedContactId}
                accountId={accountId}
                onUpdate={handleContactUpdate}
                onBlock={() => handleContactBlock(selectedContactId)}
                onUnblock={() => handleContactUnblock(selectedContactId)}
                onDelete={() => handleContactDelete(selectedContactId)}
              />
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <div className="text-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Sélectionnez un contact
                  </h3>
                  <p className="text-gray-400">
                    Choisissez un contact dans la liste pour voir ses détails et conversations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}