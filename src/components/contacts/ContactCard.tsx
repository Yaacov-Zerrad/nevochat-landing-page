'use client'

import { motion } from 'framer-motion'

interface Contact {
  id: string | number
  name: string
  email?: string
  phone_number?: string
  identifier?: string
  contact_type?: number
  location?: string
  country_code?: string
  blocked: boolean
  last_activity_at?: string
  created_at: string
  conversations_count: number
  last_conversation_at?: string
  status: 'active' | 'inactive' | 'blocked'
  additional_attributes?: {
    type?: string
    country?: string
    country_code?: string
    [key: string]: any
  }
}

interface ContactCardProps {
  contact: Contact
  isSelected: boolean
  onClick: () => void
  onBlock: () => void
  onUnblock: () => void
  onDelete: () => void
}

export function ContactCard({
  contact,
  isSelected,
  onClick,
}: ContactCardProps) {
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null
    try {
      return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
      )
    } catch {
      return null
    }
  }

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Jamais'
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'À l\'instant'
      if (diffInHours < 24) return `Il y a ${diffInHours}h`
      if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`
      return `Il y a ${Math.floor(diffInHours / 168)}sem`
    } catch {
      return 'Date invalide'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-neon-green'
      case 'blocked':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get country from additional_attributes or contact
  const countryCode = contact.additional_attributes?.country_code || contact.country_code
  const country = contact.additional_attributes?.country || contact.location

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/50'
          : 'bg-white/5 border-white/10 hover:border-neon-green/30 hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar with Status */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-green/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {getInitials(contact.name)}
            </span>
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(
              contact.status
            )}`}
            title={contact.status === 'active' ? 'Actif' : contact.status === 'blocked' ? 'Bloqué' : 'Inactif'}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Badges Row */}
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium truncate">
              {contact.name || 'Contact sans nom'}
            </h3>
          </div>

          {/* Info Badges */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {/* Phone Badge */}
            {contact.phone_number && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-xs text-blue-400 truncate max-w-[100px]">
                  {contact.phone_number}
                </span>
              </div>
            )}

            {/* Email Badge */}
            {contact.email && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <span className="text-xs text-purple-400 truncate max-w-[120px]">
                  {contact.email}
                </span>
              </div>
            )}

            {/* Country Badge */}
            {(countryCode || country) && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span className="text-xs text-green-400">
                  {getCountryFlag(countryCode) || country}
                </span>
              </div>
            )}

            {/* Conversations Count Badge */}
            {contact.conversations_count > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-xs text-orange-400">
                  {contact.conversations_count}
                </span>
              </div>
            )}
          </div>

          {/* Last Activity */}
          <div className="mt-2 text-xs text-gray-500">
            {formatLastActivity(contact.last_activity_at)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}