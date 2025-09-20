'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'
import { Account } from '@/types/account'
import CreateAccountModal from '@/components/CreateAccountModal'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { userAccounts, fetchUserAccounts, loading: accountsLoading, error } = useAccount()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchUserAccounts().finally(() => setLoading(false))
    }
  }, [status, router, fetchUserAccounts])

  const handleAccountSelect = (accountId: number) => {
    router.push(`/dashboard/accounts/${accountId}`)
  }

  const handleCreateAccount = () => {
    setIsCreateModalOpen(true)
  }

  const handleAccountCreated = (newAccount: Account) => {
    // Optionally navigate to the new account
    console.log('New account created:', newAccount)
    // router.push(`/dashboard/accounts/${newAccount.id}`)
  }

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Sélectionner un compte</h1>
              <p className="text-gray-400">Choisissez le compte sur lequel vous voulez travailler</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
              Erreur lors du chargement des comptes: {error}
            </div>
          )}

          {accountsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-gray-400 mt-4">Chargement des comptes...</p>
            </div>
          ) : userAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun compte trouvé</h3>
              <p className="text-gray-400 mb-6">Vous n&apos;avez accès à aucun compte pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Account Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {userAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-neon-green/10 to-emerald-400/10 p-6 rounded-xl border border-neon-green/20 cursor-pointer hover:border-neon-green/40 transition-all"
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">{account.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        account.status === 1 ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {account.status === 1 ? 'actif' : 'inactif'}
                      </span>
                    </div>
                    {account.domain && (
                      <p className="text-gray-300 text-sm mb-4">{account.domain}</p>
                    )}
                    {account.support_email && (
                      <p className="text-gray-400 text-xs mb-4">Support: {account.support_email}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-neon-green text-sm font-medium">
                        ID: #{account.id}
                      </span>
                      <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Create New Account Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <button 
                  onClick={handleCreateAccount}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
                >
                  + Créer un nouveau compte
                </button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleAccountCreated}
        />
      </div>
    </div>
  )
}
