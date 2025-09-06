'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, MessageSquare, Image, List, Phone, MapPin, Shield, Zap } from 'lucide-react'
import { twilioTemplatesAPI } from '@/lib/api'

interface MessagingService {
  messaging_service_sid: string
  phone_number: string
  account_sid: string
  id: number
}

interface Template {
  sid: string
  friendly_name: string
  language: string
  status: string
  category: string
  body: string
  content_types: string[]
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  const [messagingServices, setMessagingServices] = useState<MessagingService[]>([])
  const [selectedService, setSelectedService] = useState<MessagingService | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [templatesLoading, setTemplatesLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchMessagingServices()
    }
  }, [status, router, accountId])

  const fetchMessagingServices = async () => {
    try {
      setLoading(true)
      const data = await twilioTemplatesAPI.getMessagingServices(parseInt(accountId))
      setMessagingServices(data.messaging_services || [])
      if (data.messaging_services?.length > 0) {
        setSelectedService(data.messaging_services[0])
        fetchTemplates(data.messaging_services[0].messaging_service_sid)
      }
    } catch (error) {
      console.error('Failed to fetch messaging services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async (messagingServiceSid: string) => {
    try {
      setTemplatesLoading(true)
      const data = await twilioTemplatesAPI.getTemplates(messagingServiceSid)
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleServiceChange = (service: MessagingService) => {
    setSelectedService(service)
    fetchTemplates(service.messaging_service_sid)
  }

  const handleCreateTemplate = (templateType: string) => {
    router.push(`/dashboard/accounts/${accountId}/templates/create?type=${templateType}&service=${selectedService?.messaging_service_sid}`)
  }

  const templateTypes = [
    {
      type: 'text',
      title: 'Template Texte',
      description: 'Message texte simple avec variables',
      icon: MessageSquare,
      color: 'from-blue-500/10 to-cyan-400/10 border-blue-500/20'
    },
    {
      type: 'media',
      title: 'Template Média',
      description: 'Message avec image, vidéo ou document',
      icon: Image,
      color: 'from-purple-500/10 to-pink-400/10 border-purple-500/20'
    },
    {
      type: 'quick-reply',
      title: 'Réponses Rapides',
      description: 'Boutons de réponse rapide',
      icon: Zap,
      color: 'from-green-500/10 to-emerald-400/10 border-green-500/20'
    },
    {
      type: 'list-picker',
      title: 'Liste de Choix',
      description: 'Menu déroulant avec options',
      icon: List,
      color: 'from-yellow-500/10 to-orange-400/10 border-yellow-500/20'
    },
    {
      type: 'call-to-action',
      title: 'Appel à l\'Action',
      description: 'Boutons d\'action (URL, téléphone)',
      icon: Phone,
      color: 'from-red-500/10 to-pink-400/10 border-red-500/20'
    },
    {
      type: 'location',
      title: 'Localisation',
      description: 'Partage de localisation',
      icon: MapPin,
      color: 'from-indigo-500/10 to-blue-400/10 border-indigo-500/20'
    },
    {
      type: 'authentication',
      title: 'Authentification',
      description: 'OTP et codes de vérification',
      icon: Shield,
      color: 'from-orange-500/10 to-red-400/10 border-orange-500/20'
    }
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/accounts/${accountId}`)}
                className="p-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Templates WhatsApp</h1>
                <p className="text-gray-400">Gérez vos templates de messages WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Messaging Service Selector */}
          {messagingServices.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Service de messagerie
              </label>
              <select
                value={selectedService?.messaging_service_sid || ''}
                onChange={(e) => {
                  const service = messagingServices.find(s => s.messaging_service_sid === e.target.value)
                  if (service) handleServiceChange(service)
                }}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
              >
                {messagingServices.map((service) => (
                  <option key={service.messaging_service_sid} value={service.messaging_service_sid}>
                    {service.phone_number} ({service.messaging_service_sid})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Create Template Types */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Créer un nouveau template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templateTypes.map((templateType) => {
                const IconComponent = templateType.icon
                return (
                  <motion.div
                    key={templateType.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-br ${templateType.color} p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg`}
                    onClick={() => selectedService && handleCreateTemplate(templateType.type)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 rounded-lg bg-white/10">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {templateType.title}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {templateType.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Existing Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Templates existants</h2>
              {templatesLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-green"></div>
              )}
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucun template trouvé</p>
                <p className="text-gray-500 text-sm">Créez votre premier template ci-dessus</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.sid}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-neon-green/30 transition-all duration-300 cursor-pointer"
                    onClick={() => router.push(`/dashboard/accounts/${accountId}/templates/${selectedService?.messaging_service_sid}/${template.friendly_name}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {template.friendly_name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : template.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Langue:</span> {template.language}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Catégorie:</span> {template.category}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Types:</span> {template.content_types?.join(', ')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {template.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
