'use client'

import { motion } from 'framer-motion'

interface Contact {
  id: number
  name: string
  email?: string
  phone_number?: string
  identifier?: string
  additional_attributes?: {
    type?: string
    country?: string
    country_code?: string
    [key: string]: any
  }
  custom_attributes?: {
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
}

interface ContactModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
}

export const ContactModal = ({ contact, isOpen, onClose }: ContactModalProps) => {
  if (!isOpen || !contact) return null

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return '🌍'
    const flagEmoji = countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    )
    return flagEmoji
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-neon-green/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Détails du contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          {/* Name */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Nom</p>
                <p className="text-white font-semibold">{contact.name}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          {contact.phone_number && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p className="text-white font-semibold">{contact.phone_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-semibold">{contact.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Country Info */}
          {contact.additional_attributes?.country && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-2xl">
                  {getCountryFlag(contact.additional_attributes.country_code)}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pays</p>
                  <p className="text-white font-semibold">{contact.additional_attributes.country}</p>
                  {contact.additional_attributes.country_code && (
                    <p className="text-xs text-gray-500">{contact.additional_attributes.country_code}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Type */}
          {contact.additional_attributes?.type && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7.5 8h5M7.5 12h5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-semibold capitalize">{contact.additional_attributes.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Attributes */}
          {contact.additional_attributes && Object.keys(contact.additional_attributes).filter(key => !['type', 'country', 'country_code'].includes(key)).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-3">Attributs supplémentaires</h3>
              <div className="space-y-2">
                {Object.entries(contact.additional_attributes)
                  .filter(([key]) => !['type', 'country', 'country_code'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Custom Attributes */}
          {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-3">Attributs personnalisés</h3>
              <div className="space-y-2">
                {Object.entries(contact.custom_attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          {contact.created_at && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Créé le</p>
                  <p className="text-white font-semibold">{new Date(contact.created_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ContactModal