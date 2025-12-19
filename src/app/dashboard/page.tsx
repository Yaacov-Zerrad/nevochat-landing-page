'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'
import { Account } from '@/types/account'
import CreateAccountModalDetailed from '@/components/CreateAccountModalDetailed'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslations } from 'next-intl'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('dashboard')
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

  // Toujours afficher le popup si 0 compte
  useEffect(() => {
    if (!accountsLoading && userAccounts.length === 0 && !loading) {
      setIsCreateModalOpen(true)
    }
  }, [accountsLoading, userAccounts.length, loading])

  const handleAccountSelect = (accountId: number) => {
    router.push(`/dashboard/accounts/${accountId}`)
  }

  const handleCreateAccount = () => {
    setIsCreateModalOpen(true)
  }

  const handleAccountCreated = (newAccount: Account) => {
    // Rafraîchir la liste des comptes
    fetchUserAccounts()
    console.log('New account created:', newAccount)
  }

  const handleCloseModal = () => {
    // Ne fermer le modal que s'il y a au moins un compte
    if (userAccounts.length > 0) {
      setIsCreateModalOpen(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen gradient-bg-light dark:gradient-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-primary-50 to-primary-200 dark:from-gray-900 dark:to-primary-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glass-border p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
              >
                {t('signOut')}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 dark:text-red-400"
            >
              {t('errorLoading')}: {error}
            </motion.div>
          )}

          {accountsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">{t('loading')}</p>
            </div>
          ) : userAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('noAccounts')}</h3>
              <p className="text-muted-foreground mb-6">{t('noAccountsDescription')}</p>
            </div>
          ) : (
            <>
              {/* Account Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {userAccounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="card-hover group"
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {account.name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        account.status === 1 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-gray-500/20 text-gray-600 dark:text-muted-foreground border border-gray-500/30'
                      }`}>
                        {account.status === 1 ? t('active') : t('inactive')}
                      </span>
                    </div>
                    {account.domain && (
                      <p className="text-foreground/80 text-sm mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {account.domain}
                      </p>
                    )}
                    {account.support_email && (
                      <p className="text-muted-foreground text-xs mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {t('support')}: {account.support_email}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-primary text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {t('accountId')}: #{account.id}
                      </span>
                      <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <button 
                  onClick={handleCreateAccount}
                  className="btn-outline inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('createAccount')}
                </button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Create Account Modal */}
        <CreateAccountModalDetailed
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAccountCreated}
        />
      </div>
    </div>
  )
}
