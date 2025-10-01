'use client'

import { motion } from 'framer-motion'

interface Contact {
  id: string
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
  onBlock,
  onUnblock,
  onDelete,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'blocked':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'blocked':
        return 'Bloqué'
      default:
        return 'Inactif'
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ x: 4 }}
      className={`relative p-4 cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'bg-neon-green/10 border-l-4 border-l-neon-green'
          : 'hover:bg-white/5'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
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
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">
                {contact.name || 'Contact sans nom'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                    contact.status
                  )}/20 text-${
                    contact.status === 'active'
                      ? 'green'
                      : contact.status === 'blocked'
                      ? 'red'
                      : 'gray'
                  }-400`}
                >
                  {getStatusText(contact.status)}
                </span>
                {contact.conversations_count > 0 && (
                  <span className="text-xs text-gray-400">
                    {contact.conversations_count} conv.
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implement dropdown menu
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-2 space-y-1">
            {contact.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone_number && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="truncate">{contact.phone_number}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">{contact.location}</span>
              </div>
            )}
          </div>

          {/* Last Activity */}
          <div className="mt-3 text-xs text-gray-500">
            Dernière activité: {formatLastActivity(contact.last_activity_at)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}