'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'
import { Account } from '@/types/account'

export default function AccountDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const { fetchAccountById } = useAccount()

  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true)
      const accountData = await fetchAccountById(parseInt(accountId))
      setAccount(accountData)
    } catch (error) {
      console.error('Failed to fetch account:', error)
    } finally {
      setLoading(false)
    }
  }, [accountId, fetchAccountById])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchAccount()
    }
  }, [status, router, fetchAccount])

  const handleNavigation = (path: string) => {
    router.push(`/dashboard/accounts/${accountId}${path}`)
  }

  const handleBackToAccounts = () => {
    router.push('/dashboard')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!session || !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-white mb-4">Compte non trouvé</h1>
          <p className="text-gray-400 mb-6">Le compte demandé n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
          <button
            onClick={handleBackToAccounts}
            className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
          >
            Retour aux comptes
          </button>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: 'Conversations',
      description: 'Gérer vos conversations clients',
      icon: '💬',
      path: '/conversations',
      color: 'from-blue-500/10 to-cyan-400/10 border-blue-500/20'
    },
    {
      title: 'Flows',
      description: 'Gérer vos flows de conversation',
      icon: '🔄',
      path: '/flows',
      color: 'from-purple-500/10 to-indigo-400/10 border-purple-500/20'
    },
    // {
    //   title: 'Analytics',
    //   description: 'Voir les statistiques',
    //   icon: '📊',
    //   path: '/analytics',
    //   color: 'from-green-500/10 to-emerald-400/10 border-green-500/20'
    // },
    {
      title: 'Templates',
      description: 'Gérer vos templates WhatsApp',
      icon: '📝',
      path: '/templates',
      color: 'from-pink-500/10 to-rose-400/10 border-pink-500/20'
    },
    {
      title: 'WhatsApp',
      icon: '�',
      path: `/devices`,
      color: 'text-green-400'
    },
    // {
    //   title: 'Settings',
    //   description: 'Paramètres du compte',
    //   icon: '⚙️',
    //   path: '/settings',
    //   color: 'from-orange-500/10 to-yellow-400/10 border-orange-500/20'
    // },
    // {
    //   title: 'Team',
    //   description: 'Gérer votre équipe',
    //   icon: '👥',
    //   path: '/team',
    //   color: 'from-indigo-500/10 to-purple-400/10 border-indigo-500/20'
    // },
    // {
    //   title: 'Integrations',
    //   description: 'Connecter des services',
    //   icon: '🔗',
    //   path: '/integrations',
    //   color: 'from-teal-500/10 to-cyan-400/10 border-teal-500/20'
    // }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAccounts}
                className="text-neon-green hover:text-neon-green/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{account.name}</h1>
                <div className="flex items-center space-x-4">
                  {account.domain && (
                    <p className="text-gray-400">{account.domain}</p>
                  )}
                  {account.support_email && (
                    <p className="text-gray-500 text-sm">Support: {account.support_email}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm rounded-full ${
                account.status === 1 ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {account.status === 1 ? 'actif' : 'inactif'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${item.color} p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">-</div>
              <div className="text-sm text-gray-400">Conversations actives</div>
            </div>
            <div className="bg-neon-green/10 p-4 rounded-lg border border-neon-green/20">
              <div className="text-2xl font-bold text-neon-green">-</div>
              <div className="text-sm text-gray-400">Flows actifs</div>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">-</div>
              <div className="text-sm text-gray-400">Taux de réponse</div>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">-</div>
              <div className="text-sm text-gray-400">Messages envoyés</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
