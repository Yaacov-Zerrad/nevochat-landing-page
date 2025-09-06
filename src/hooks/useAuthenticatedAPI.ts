'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authAPI, userAPI, chatbotAPI } from '@/lib/api'
import { useCallback } from 'react'

export function useAuthenticatedAPI() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === 'authenticated' && !!session

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      throw new Error('Authentication required')
    }
  }, [isAuthenticated, router])

  // User API methods
  const getCurrentUser = useCallback(async () => {
    requireAuth()
    return await authAPI.getCurrentUser()
  }, [requireAuth])

  const updateProfile = useCallback(async (data: { name?: string; email?: string }) => {
    requireAuth()
    return await authAPI.updateProfile(data)
  }, [requireAuth])

  const changePassword = useCallback(async (data: { old_password: string; new_password: string }) => {
    requireAuth()
    return await authAPI.changePassword(data)
  }, [requireAuth])

  // Chatbot API methods
  const sendMessage = useCallback(async (data: { message: string; conversation_id?: string }) => {
    requireAuth()
    return await chatbotAPI.sendMessage(data)
  }, [requireAuth])

  const getConversations = useCallback(async () => {
    requireAuth()
    return await chatbotAPI.getConversations()
  }, [requireAuth])

  const getConversation = useCallback(async (id: string) => {
    requireAuth()
    return await chatbotAPI.getConversation(id)
  }, [requireAuth])

  return {
    // Auth state
    isAuthenticated,
    session,
    accessToken: session?.accessToken,
    
    // User methods
    getCurrentUser,
    updateProfile,
    changePassword,
    
    // Chatbot methods
    sendMessage,
    getConversations,
    getConversation,
  }
}

export default useAuthenticatedAPI
