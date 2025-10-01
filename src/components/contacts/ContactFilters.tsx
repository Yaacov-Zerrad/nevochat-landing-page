'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Filters {
  status: string
  contactType: string
  countryCode: string
  hasConversations: boolean | null
  createdAfter: string
  createdBefore: string
}

interface ContactFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClose: () => void
}

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'blocked', label: 'Bloqués' },
]

const contactTypeOptions = [
  { value: '', label: 'Tous les types' },
  { value: '0', label: 'Particulier' },
  { value: '1', label: 'Entreprise' },
]

const conversationOptions = [
  { value: null, label: 'Tous' },
  { value: true, label: 'Avec conversations' },
  { value: false, label: 'Sans conversations' },
]

export function ContactFilters({ filters, onFiltersChange, onClose }: ContactFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters = {
      status: 'all',
      contactType: '',
      countryCode: '',
      hasConversations: null,
      createdAfter: '',
      createdBefore: '',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onClose()
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-white/10 bg-white/5 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de contact
            </label>
            <select
              value={localFilters.contactType}
              onChange={(e) => handleFilterChange('contactType', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
            >
              {contactTypeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Code Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Code pays
            </label>
            <input
              type="text"
              placeholder="ex: FR, US, CA"
              value={localFilters.countryCode}
              onChange={(e) => handleFilterChange('countryCode', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green/50"
            />
          </div>

          {/* Conversations Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conversations
            </label>
            <select
              value={localFilters.hasConversations === null ? 'null' : localFilters.hasConversations.toString()}
              onChange={(e) => {
                const value = e.target.value === 'null' ? null : e.target.value === 'true'
                handleFilterChange('hasConversations', value)
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
            >
              <option value="null" className="bg-gray-800">Tous</option>
              <option value="true" className="bg-gray-800">Avec conversations</option>
              <option value="false" className="bg-gray-800">Sans conversations</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Créé après
            </label>
            <input
              type="date"
              value={localFilters.createdAfter}
              onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Créé avant
            </label>
            <input
              type="date"
              value={localFilters.createdBefore}
              onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Réinitialiser
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg text-neon-green hover:bg-neon-green/30 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}