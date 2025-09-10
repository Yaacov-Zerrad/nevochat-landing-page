'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function IntegrationsPage() {
  const params = useParams()
  const accountId = params.accountId as string

  const integrations = [
    {
      name: 'WhatsApp Business API',
      description: 'Connectez votre compte WhatsApp Business',
      icon: '📱',
      status: 'connected',
      color: 'from-green-500/10 to-emerald-400/10 border-green-500/20'
    },
    {
      name: 'Webhooks',
      description: 'Configurez des webhooks pour vos événements',
      icon: '🔗',
      status: 'available',
      color: 'from-blue-500/10 to-cyan-400/10 border-blue-500/20'
    },
    {
      name: 'CRM Integration',
      description: 'Synchronisez avec votre CRM',
      icon: '💼',
      status: 'available',
      color: 'from-purple-500/10 to-pink-400/10 border-purple-500/20'
    },
    {
      name: 'Analytics Tools',
      description: 'Connectez Google Analytics, Facebook Pixel',
      icon: '📊',
      status: 'available',
      color: 'from-orange-500/10 to-yellow-400/10 border-orange-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Intégrations</h1>
            <p className="text-gray-400">Connectez des services externes à votre compte</p>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${integration.color} p-6 rounded-xl border hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{integration.name}</h3>
                      <p className="text-gray-300 text-sm">{integration.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    integration.status === 'connected' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {integration.status === 'connected' ? 'Connecté' : 'Disponible'}
                  </span>
                </div>
                
                <div className="flex justify-end">
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    integration.status === 'connected'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                  }`}>
                    {integration.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* API Keys Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Clés API</h2>
            <p className="text-gray-400 mb-4">Gérez vos clés API pour les intégrations personnalisées</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">API Key principale</h4>
                  <p className="text-gray-400 text-sm">sk-****************************</p>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30">
                    Copier
                  </button>
                  <button className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded text-sm hover:bg-yellow-500/30">
                    Régénérer
                  </button>
                </div>
              </div>
            </div>
            
            <button className="mt-4 bg-neon-green/20 text-neon-green px-4 py-2 rounded-lg hover:bg-neon-green/30 transition-colors">
              + Nouvelle clé API
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
