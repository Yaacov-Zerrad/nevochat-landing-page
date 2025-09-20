'use client'

import { useLeftHover } from '@/hooks/useLeftHover'
import DashboardSidebar from '@/components/DashboardSidebar'
import SidebarTrigger from '@/components/SidebarTrigger'
import { useParams } from 'next/navigation'
import { useAccount } from '@/contexts/AccountContext'
import { useEffect, useState } from 'react'
import { Account } from '@/types/account'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, closeSidebar } = useLeftHover({
    triggerWidth: 50,
    delay: 200,
    closeDelay: 300
  })
  
  const params = useParams()
  const accountId = params.accountId as string
  const [account, setAccount] = useState<Account | null>(null)
  const { fetchAccountById } = useAccount()

  useEffect(() => {
    if (accountId) {
      const fetchAccount = async () => {
        try {
          const accountData = await fetchAccountById(parseInt(accountId))
          setAccount(accountData)
        } catch (error) {
          console.error('Failed to fetch account:', error)
        }
      }
      fetchAccount()
    }
  }, [accountId, fetchAccountById])

  return (
    <div className="relative min-h-screen">
      {/* Zone de déclenchement invisible */}
      <div className="fixed left-0 top-0 bottom-0 w-12 z-30 pointer-events-none" />
      
      {/* Indicateur de déclenchement */}
      <SidebarTrigger isVisible={!isOpen} />
      
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={isOpen} 
        accountId={accountId}
        accountName={account?.name}
        onClose={closeSidebar}
      />
      
      {/* Contenu principal */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}
