'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Copy, Download } from 'lucide-react'
import { twilioTemplatesAPI } from '@/lib/api'
import WhatsAppPreview from '@/components/WhatsAppPreview'

interface Template {
  sid: string
  friendly_name: string
  language: string
  status: string
  category: string
  body: string
  content_types: string[]
  variables?: string[]
}

export default function TemplateDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  const templateName = params.templateName as string
  const messagingServiceSid = params.messagingServiceSid as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true)
      const data = await twilioTemplatesAPI.getTemplateByName(messagingServiceSid, templateName)
      setTemplate(data)
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setLoading(false)
    }
  }, [messagingServiceSid, templateName])
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchTemplate()
    }
  }, [status, router, templateName, messagingServiceSid, fetchTemplate])


  const handleDelete = async () => {
    if (!template || !confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return
    }

    try {
      setDeleting(true)
      await twilioTemplatesAPI.deleteTemplate(messagingServiceSid, template.sid)
      router.push(`/dashboard/accounts/${accountId}/templates`)
    } catch (error) {
      console.error('Failed to delete template:', error)
    } finally {
      setDeleting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!session || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-white mb-4">Template non trouvé</h1>
          <p className="text-gray-400 mb-6">Le template demandé n&apos;existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push(`/dashboard/accounts/${accountId}/templates`)}
            className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
          >
            Retour aux templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/accounts/${accountId}/templates`)}
                className="p-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{template.friendly_name}</h1>
                <p className="text-gray-400">Détails du template WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyToClipboard(template.sid)}
                className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 inline mr-2" />
                Copier SID
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400 inline mr-2"></div>
                ) : (
                  <Trash2 className="w-5 h-5 inline mr-2" />
                )}
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>

          {/* Template Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Template Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Informations</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      template.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : template.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Langue</label>
                    <p className="text-white">{template.language}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                    <p className="text-white">{template.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Types de contenu</label>
                    <p className="text-white">{template.content_types?.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Corps du message</h2>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                    {template.body}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(template.body)}
                  className="mt-3 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  Copier le corps
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => copyToClipboard(template.friendly_name)}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors border border-blue-500/20"
                  >
                    <Copy className="w-4 h-4 inline mr-2" />
                    Copier le nom
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(template, null, 2))}
                    className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors border border-purple-500/20"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Exporter JSON
                  </button>
                </div>
              </div>

              {/* WhatsApp Preview */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Aperçu WhatsApp</h2>
                <WhatsAppPreview
                  templateType="text" // We'll need to determine this from the template data
                  templateData={{ body: template.body }}
                  variables={{ '1': 'Exemple', '2': 'Valeur' }}
                />
              </div>

              {/* Technical Details */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Détails techniques</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">SID</label>
                    <code className="text-xs text-neon-green bg-gray-900/50 p-2 rounded block font-mono">
                      {template.sid}
                    </code>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Service de messagerie</label>
                    <code className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded block font-mono">
                      {messagingServiceSid}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
