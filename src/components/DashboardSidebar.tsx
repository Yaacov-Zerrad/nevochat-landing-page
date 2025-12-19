'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  accountId: string
  accountName?: string
  onClose: () => void
}

export default function DashboardSidebar({ isOpen, accountId, accountName, onClose }: SidebarProps) {
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
      title: 'Appareils',
      icon: '�',
      path: `/dashboard/accounts/${accountId}/devices`,
      color: 'text-green-400'
    },
    {
      title: 'Conversations',
      icon: '💬',
      path: `/dashboard/accounts/${accountId}/conversations`,
      color: 'text-green-400'
    },
    {
      title: 'Contacts',
      icon: '👥',
      path: `/dashboard/accounts/${accountId}/contacts`,
      color: 'text-purple-400'
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
    {
      title: 'Abonnement',
      icon: '💳',
      path: `/dashboard/accounts/${accountId}/subscription`,
      color: 'text-yellow-400'
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
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 cursor-pointer"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-background/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {accountName || 'Dashboard'}
                  </h2>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActivePath(item.path)
                          ? 'bg-primary/20 border border-primary/30 shadow-lg'
                          : 'hover:bg-secondary border border-transparent hover:border-border'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${
                          isActivePath(item.path) ? 'text-primary' : 'text-foreground group-hover:text-primary'
                        }`}>
                          {item.title}
                        </div>
                      </div>
                      {isActivePath(item.path) && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-8">
                <div className="h-px bg-gradient-to-r from-border to-transparent"></div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Actions rapides</h3>
                
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground">🏢</span>
                  <span className="text-muted-foreground group-hover:text-foreground text-sm">Tous les comptes</span>
                </Link>

                <button
                  onClick={() => {
                    onClose() // Ferme la sidebar
                    signOut({ callbackUrl: '/' })
                  }}
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
