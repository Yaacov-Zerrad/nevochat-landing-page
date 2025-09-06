'use client'

import { useState } from 'react'
import { Smartphone, User, Send } from 'lucide-react'

interface WhatsAppPreviewProps {
  templateType: 'text' | 'media' | 'quick-reply' | 'list-picker' | 'call-to-action' | 'authentication' | 'location'
  templateData: any
  variables?: Record<string, string>
  className?: string
}

export default function WhatsAppPreview({ templateType, templateData, variables = {}, className = '' }: WhatsAppPreviewProps) {
  const [currentTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))

  // Replace variables in text
  const replaceVariables = (text: string) => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    })
    return result
  }

  const renderMessage = () => {
    switch (templateType) {
      case 'text':
        return (
          <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none max-w-xs ml-auto">
            <p className="text-sm whitespace-pre-wrap">
              {replaceVariables(templateData.body || '')}
            </p>
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-xs text-green-100">{currentTime}</span>
              <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="bg-green-500 text-white rounded-lg rounded-br-none max-w-xs ml-auto overflow-hidden">
            {/* Media header */}
            {templateData.header_url && (
              <div className="bg-gray-200 h-32 flex items-center justify-center">
                {templateData.header_type === 'image' ? (
                  <div className="text-gray-600 text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-xs">Image</p>
                  </div>
                ) : templateData.header_type === 'video' ? (
                  <div className="text-gray-600 text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                    </svg>
                    <p className="text-xs">Vidéo</p>
                  </div>
                ) : (
                  <div className="text-gray-600 text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-xs">Document</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Message body */}
            <div className="p-3">
              <p className="text-sm whitespace-pre-wrap">
                {replaceVariables(templateData.body || '')}
              </p>
              {templateData.footer && (
                <p className="text-xs text-green-100 mt-2 italic">
                  {replaceVariables(templateData.footer)}
                </p>
              )}
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-green-100">{currentTime}</span>
                <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
          </div>
        )

      case 'quick-reply':
        return (
          <div className="space-y-2 ml-auto max-w-xs">
            <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none">
              <p className="text-sm whitespace-pre-wrap">
                {replaceVariables(templateData.body || '')}
              </p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-green-100">{currentTime}</span>
                <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              {templateData.buttons?.map((button: any, index: number) => (
                <button
                  key={index}
                  className="block w-full bg-white border border-gray-300 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        )

      case 'list-picker':
        return (
          <div className="space-y-2 ml-auto max-w-xs">
            <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none">
              {templateData.header && (
                <p className="text-sm font-medium mb-2">{templateData.header}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">
                {replaceVariables(templateData.body || '')}
              </p>
              {templateData.footer && (
                <p className="text-xs text-green-100 mt-2 italic">
                  {templateData.footer}
                </p>
              )}
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-green-100">{currentTime}</span>
                <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <button className="w-full bg-white border border-gray-300 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>{templateData.button_text || 'Voir les options'}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        )

      case 'call-to-action':
        return (
          <div className="space-y-2 ml-auto max-w-xs">
            <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none">
              <p className="text-sm whitespace-pre-wrap">
                {replaceVariables(templateData.body || '')}
              </p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-green-100">{currentTime}</span>
                <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              {templateData.buttons?.map((button: any, index: number) => (
                <button
                  key={index}
                  className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  {button.type === 'phone' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  )}
                  {button.type === 'url' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                    </svg>
                  )}
                  <span>{button.text}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 'authentication':
        return (
          <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none max-w-xs ml-auto">
            <p className="text-sm whitespace-pre-wrap">
              {replaceVariables(templateData.body || '')}
            </p>
            {templateData.add_security_recommendation && (
              <p className="text-xs text-green-100 mt-2 italic">
                🔒 Ne partagez jamais ce code avec personne.
              </p>
            )}
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-xs text-green-100">{currentTime}</span>
              <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-2 ml-auto max-w-xs">
            <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none">
              <p className="text-sm whitespace-pre-wrap">
                {replaceVariables(templateData.body || '')}
              </p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-green-100">{currentTime}</span>
                <svg className="w-4 h-4 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <button className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              <span>Partager ma localisation</span>
            </button>
          </div>
        )

      default:
        return (
          <div className="bg-gray-300 text-gray-600 p-3 rounded-lg rounded-br-none max-w-xs ml-auto">
            <p className="text-sm">Type de template non supporté</p>
          </div>
        )
    }
  }

  return (
    <div className={`bg-gradient-to-b from-green-100 to-green-50 p-4 rounded-lg border border-gray-200 ${className}`}>
      {/* WhatsApp Header */}
      <div className="flex items-center justify-between bg-green-600 text-white p-3 rounded-t-lg -m-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Mon Entreprise</p>
            <p className="text-xs text-green-100">En ligne</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 min-h-32">
        {renderMessage()}
      </div>

      {/* WhatsApp Input */}
      <div className="flex items-center space-x-2 mt-4 bg-white p-2 rounded-full border border-gray-300">
        <input
          type="text"
          placeholder="Tapez un message..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          disabled
        />
        <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
