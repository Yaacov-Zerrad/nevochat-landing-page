'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'
import { Account } from '@/types/account'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslations } from 'next-intl'

export default function AccountDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const accountId = params.accountId as string
  const t = useTranslations('account')
  const tDashboard = useTranslations('dashboard')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!session || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass glass-border p-8 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('notFound')}</h1>
          <p className="text-muted-foreground mb-6">{t('notFoundDescription')}</p>
          <button
            onClick={handleBackToAccounts}
            className="btn-primary w-full"
          >
            {t('backToAccounts')}
          </button>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: t('menu.conversations'),
      description: t('menu.conversationsDesc'),
      icon: '💬',
      path: '/conversations',
      gradient: 'from-blue-500 to-cyan-500'
    },
     {
      title: t('menu.contacts'),
      description: t('menu.contactsDesc'),
      icon: '📱',
      path: `/contacts`,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: t('menu.flows'),
      description: t('menu.flowsDesc'),
      icon: '🔄',
      path: '/flows',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: t('menu.templates'),
      description: t('menu.templatesDesc'),
      icon: '📝',
      path: '/templates',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: t('menu.whatsapp'),
      description: t('menu.whatsappDesc'),
      icon: '📱',
      path: `/devices`,
      gradient: 'from-green-500 to-emerald-500'
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glass-border p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAccounts}
                className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-secondary/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent mb-2">
                  {account.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {account.domain && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {account.domain}
                    </p>
                  )}
                  {account.support_email && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {tDashboard('support')}: {account.support_email}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                account.status === 1 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-gray-500/20 text-gray-600 dark:text-muted-foreground border border-gray-500/30'
              }`}>
                {account.status === 1 ? tDashboard('active') : tDashboard('inactive')}
              </span>
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
              >
                {tDashboard('signOut')}
              </button>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="card-hover group relative overflow-hidden"
                onClick={() => handleNavigation(item.path)}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">-</div>
                  <div className="text-sm text-muted-foreground mt-1">{t('stats.activeConversations')}</div>
                </div>
                <svg className="w-8 h-8 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-500 dark:text-purple-400">-</div>
                  <div className="text-sm text-muted-foreground mt-1">{t('stats.activeFlows')}</div>
                </div>
                <svg className="w-8 h-8 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-500 dark:text-green-400">-</div>
                  <div className="text-sm text-muted-foreground mt-1">{t('stats.responseRate')}</div>
                </div>
                <svg className="w-8 h-8 text-green-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">-</div>
                  <div className="text-sm text-muted-foreground mt-1">{t('stats.messagesSent')}</div>
                </div>
                <svg className="w-8 h-8 text-orange-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
