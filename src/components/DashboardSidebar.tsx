'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  isOpen: boolean
  accountId: string
  accountName?: string
}

export default function DashboardSidebar({ isOpen, accountId, accountName }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: '🏠',
      path: `/dashboard/accounts/${accountId}`,
      color: 'text-neon-green'
    },
    {
      title: 'Flows',
      icon: '🔄',
      path: `/dashboard/accounts/${accountId}/flows`,
      color: 'text-blue-400'
    },
    {
      title: 'WhatsApp',
      icon: '💬',
      path: `/dashboard/accounts/${accountId}/whatsapp`,
      color: 'text-green-400'
    },
    // {
    //   title: 'Analytics',
    //   icon: '📊',
    //   path: `/dashboard/accounts/${accountId}/analytics`,
    //   color: 'text-green-400'
    // },
    {
      title: 'Templates',
      icon: '📝',
      path: `/dashboard/accounts/${accountId}/templates`,
      color: 'text-pink-400'
    },
    // {
    //   title: 'Integrations',
    //   icon: '🔗',
    //   path: `/dashboard/accounts/${accountId}/integrations`,
    //   color: 'text-teal-400'
    // },
    // {
    //   title: 'Settings',
    //   icon: '⚙️',
    //   path: `/dashboard/accounts/${accountId}/settings`,
    //   color: 'text-orange-400'
    // },
    // {
    //   title: 'Team',
    //   icon: '👥',
    //   path: `/dashboard/accounts/${accountId}/team`,
    //   color: 'text-indigo-400'
    // }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleBackToAccounts = () => {
    router.push('/dashboard')
  }

  const isActivePath = (path: string) => {
    return pathname === path
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-md border-r border-neon-green/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={handleBackToAccounts}
                    className="text-neon-green hover:text-neon-green/80 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-white truncate">
                    {accountName || 'Dashboard'}
                  </h2>
                </div>
                <div className="h-px bg-gradient-to-r from-neon-green/20 to-transparent"></div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActivePath(item.path)
                        ? 'bg-neon-green/20 border border-neon-green/30'
                        : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${
                        isActivePath(item.path) ? 'text-neon-green' : 'text-white group-hover:text-neon-green'
                      }`}>
                        {item.title}
                      </div>
                    </div>
                    {isActivePath(item.path) && (
                      <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-8">
                <div className="h-px bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Actions rapides</h3>
                
                <button
                  onClick={handleBackToAccounts}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="text-gray-400 group-hover:text-white">🏢</span>
                  <span className="text-gray-400 group-hover:text-white text-sm">Tous les comptes</span>
                </button>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                >
                  <span className="text-red-400">🚪</span>
                  <span className="text-red-400 text-sm">Déconnexion</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
