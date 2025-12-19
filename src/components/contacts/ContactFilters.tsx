'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContactFilters as FiltersType } from '@/types/contact'

interface ContactFiltersProps {
  filters: FiltersType
  onFiltersChange: (filters: FiltersType) => void
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

  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FiltersType = {
      status: 'all',
      contact_type: '',
      country_code: '',
      has_conversations: null,
      created_after: '',
      created_before: '',
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
      className="border-b border-border bg-white/5 backdrop-blur-sm"
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
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-neon-green/50"
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
              value={localFilters.contact_type}
              onChange={(e) => handleFilterChange('contact_type', e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-neon-green/50"
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
              value={localFilters.country_code}
              onChange={(e) => handleFilterChange('country_code', e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-green/50"
            />
          </div>

          {/* Conversations Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conversations
            </label>
            <select
              value={localFilters.has_conversations === null || localFilters.has_conversations === undefined ? 'null' : localFilters.has_conversations.toString()}
              onChange={(e) => {
                const value = e.target.value === 'null' ? null : e.target.value === 'true'
                handleFilterChange('has_conversations', value)
              }}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-neon-green/50"
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
              value={localFilters.created_after}
              onChange={(e) => handleFilterChange('created_after', e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-neon-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Créé avant
            </label>
            <input
              type="date"
              value={localFilters.created_before}
              onChange={(e) => handleFilterChange('created_before', e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-neon-green/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Réinitialiser
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-border rounded-lg text-foreground hover:bg-white/10 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/30 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}