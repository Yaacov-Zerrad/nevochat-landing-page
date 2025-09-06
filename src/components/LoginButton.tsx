'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { UserIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function LoginButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="h-10 w-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={() => router.push('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-neon-green/20 text-neon-green px-3 py-2 rounded-lg hover:bg-neon-green/30 transition-colors"
        >
          <UserIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </motion.button>
        <motion.button
          onClick={() => signOut()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Logout
        </motion.button>
      </div>
    )
  }

  return (
    <motion.button
      onClick={() => router.push('/auth/signin')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gradient-to-r from-neon-green to-emerald-400 text-black font-bold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300"
    >
      Login
    </motion.button>
  )
}
