'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ConversationFiltersType {
  status?: string
  priority?: string
  assignee?: string
  unassigned?: boolean
  inbox?: string
  team?: string
  labels?: string
  contact_type?: string
  has_unread?: boolean
  is_snoozed?: boolean
  waiting_for?: string
  created_after?: string
  created_before?: string
  last_activity_after?: string
  last_activity_before?: string
  ordering?: string
}

interface ConversationFiltersProps {
  filters: ConversationFiltersType
  onFiltersChange: (filters: ConversationFiltersType) => void
  onClose: () => void
  isOpen: boolean
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: '0', label: 'Ouvert' },
  { value: '1', label: 'Résolu' },
  { value: '2', label: 'En attente' },
  { value: '3', label: 'Fermé' },
]

const priorityOptions = [
  { value: '', label: 'Toutes les priorités' },
  { value: '0', label: 'Faible' },
  { value: '1', label: 'Moyenne' },
  { value: '2', label: 'Élevée' },
  { value: '3', label: 'Urgente' },
]

const waitingForOptions = [
  { value: '', label: 'Tous' },
  { value: 'customer', label: 'Client' },
  { value: 'agent', label: 'Agent' },
]

const orderingOptions = [
  { value: '-last_activity_at', label: 'Dernière activité (décroissant)' },
  { value: 'last_activity_at', label: 'Dernière activité (croissant)' },
  { value: '-created_at', label: 'Date de création (décroissant)' },
  { value: 'created_at', label: 'Date de création (croissant)' },
  { value: '-priority', label: 'Priorité (décroissant)' },
  { value: 'priority', label: 'Priorité (croissant)' },
]

const contactTypeOptions = [
  { value: '', label: 'Tous les types' },
  { value: '0', label: 'Particulier' },
  { value: '1', label: 'Entreprise' },
]

export function ConversationFilters({ filters, onFiltersChange, onClose, isOpen }: ConversationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ConversationFiltersType>(filters)

  const handleFilterChange = (key: keyof ConversationFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: ConversationFiltersType = {
      status: '',
      priority: '',
      assignee: '',
      unassigned: false,
      inbox: '',
      team: '',
      labels: '',
      contact_type: '',
      has_unread: false,
      is_snoozed: false,
      waiting_for: '',
      created_after: '',
      created_before: '',
      last_activity_after: '',
      last_activity_before: '',
      ordering: '-last_activity_at',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleRemoveAll = () => {
    const resetFilters: ConversationFiltersType = {
      status: '',
      priority: '',
      assignee: '',
      unassigned: false,
      inbox: '',
      team: '',
      labels: '',
      contact_type: '',
      has_unread: false,
      is_snoozed: false,
      waiting_for: '',
      created_after: '',
      created_before: '',
      last_activity_after: '',
      last_activity_before: '',
      ordering: '-last_activity_at',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onClose()
  }

  const getActiveFiltersCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'ordering' && value === '-last_activity_at') return false
      return value && value !== '' && value !== false
    }).length
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-primary/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Filtres avancés</h2>
                {getActiveFiltersCount() > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Basic Filters */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtres de base
                </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20/50"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={localFilters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de contact
              </label>
              <select
                value={localFilters.contact_type || ''}
                onChange={(e) => handleFilterChange('contact_type', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              >
                {contactTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Waiting For Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                En attente de
              </label>
              <select
                value={localFilters.waiting_for || ''}
                onChange={(e) => handleFilterChange('waiting_for', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              >
                {waitingForOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordering */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tri
              </label>
              <select
                value={localFilters.ordering || '-last_activity_at'}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              >
                {orderingOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtres avancés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Assignee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID de l&apos;assigné
              </label>
              <input
                type="text"
                placeholder="ex: 123"
                value={localFilters.assignee || ''}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Inbox ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID de l&apos;inbox
              </label>
              <input
                type="text"
                placeholder="ex: 1"
                value={localFilters.inbox || ''}
                onChange={(e) => handleFilterChange('inbox', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Team ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID de l&apos;équipe
              </label>
              <input
                type="text"
                placeholder="ex: 1"
                value={localFilters.team || ''}
                onChange={(e) => handleFilterChange('team', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Labels (séparés par virgule)
              </label>
              <input
                type="text"
                placeholder="ex: urgent, vip"
                value={localFilters.labels || ''}
                onChange={(e) => handleFilterChange('labels', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Boolean Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Unassigned */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.unassigned || false}
                onChange={(e) => handleFilterChange('unassigned', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 text-primary focus:ring-neon-green/50 focus:ring-offset-0"
              />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Non assignées</span>
            </label>

            {/* Has Unread */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.has_unread || false}
                onChange={(e) => handleFilterChange('has_unread', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 text-primary focus:ring-neon-green/50 focus:ring-offset-0"
              />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Messages non lus</span>
            </label>

            {/* Is Snoozed */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.is_snoozed || false}
                onChange={(e) => handleFilterChange('is_snoozed', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 text-primary focus:ring-neon-green/50 focus:ring-offset-0"
              />
              <span className="text-gray-900 dark:text-gray-100 font-medium">En pause</span>
            </label>
          </div>
        </div>

        {/* Date Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Filtres de date
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Created After */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Créé après
              </label>
              <input
                type="datetime-local"
                value={localFilters.created_after || ''}
                onChange={(e) => handleFilterChange('created_after', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Created Before */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Créé avant
              </label>
              <input
                type="datetime-local"
                value={localFilters.created_before || ''}
                onChange={(e) => handleFilterChange('created_before', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Last Activity After */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dernière activité après
              </label>
              <input
                type="datetime-local"
                value={localFilters.last_activity_after || ''}
                onChange={(e) => handleFilterChange('last_activity_after', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>

            {/* Last Activity Before */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dernière activité avant
              </label>
              <input
                type="datetime-local"
                value={localFilters.last_activity_before || ''}
                onChange={(e) => handleFilterChange('last_activity_before', e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer - Fixed at bottom */}
      <div className="sticky bottom-0 bg-card border-t border-border p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleRemoveAll}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer tous les filtres
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white/5 border border-border rounded-lg text-foreground hover:bg-white/10 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
)}
</AnimatePresence>
  )
}
