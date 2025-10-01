'use client'

import { useState, useEffect, useCallback } from 'react'
import { contactsAPI } from '@/lib/api'
import {
  Contact,
  ContactFilters,
  ContactStats,
  ContactUpdateData,
  ContactListResponse,
  PaginationInfo,
} from '@/types/contact'

interface UseContactsOptions extends ContactFilters {
  pageSize?: number
  autoFetch?: boolean
}

interface UseContactsReturn {
  contacts: Contact[]
  stats: ContactStats | null
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
  updateContact: (contactId: number, data: ContactUpdateData) => Promise<void>
  blockContact: (contactId: number) => Promise<void>
  unblockContact: (contactId: number) => Promise<void>
  deleteContact: (contactId: number, deleteConversations?: boolean) => Promise<void>
  bulkActions: (contactIds: number[], action: 'block' | 'unblock' | 'delete') => Promise<void>
}

export function useContacts(
  accountId: string,
  options: UseContactsOptions = {}
): UseContactsReturn {
  const {
    search,
    status,
    contact_type,
    country_code,
    has_conversations,
    created_after,
    created_before,
    ordering = '-last_activity_at',
    pageSize = 20,
    autoFetch = true,
  } = options

  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchContacts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!accountId) return

    setLoading(true)
    setError(null)

    try {
      const params: any = {
        page,
        page_size: pageSize,
        ordering,
      }

      // Add filters
      if (search) params.search = search
      if (status && status !== 'all') params.status = status
      if (contact_type) params.contact_type = contact_type
      if (country_code) params.country_code = country_code
      if (has_conversations !== null) params.has_conversations = has_conversations
      if (created_after) params.created_after = created_after
      if (created_before) params.created_before = created_before

      const response: ContactListResponse = await contactsAPI.getContacts(
        parseInt(accountId),
        params
      )

      const newContacts = response.results || []
      
      if (append) {
        setContacts(prev => [...prev, ...newContacts])
      } else {
        setContacts(newContacts)
      }

      // Update pagination info
      const totalPages = Math.ceil(response.count / pageSize)
      setPagination({
        currentPage: page,
        totalPages,
        totalCount: response.count,
        pageSize,
        hasNextPage: !!response.next,
        hasPreviousPage: !!response.previous,
      })

      setCurrentPage(page)
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
      setError('Impossible de charger les contacts')
    } finally {
      setLoading(false)
    }
  }, [
    accountId,
    search,
    status,
    contact_type,
    country_code,
    has_conversations,
    created_after,
    created_before,
    ordering,
    pageSize,
  ])

  const fetchStats = useCallback(async () => {
    if (!accountId) return

    try {
      const statsData = await contactsAPI.getContactStats(parseInt(accountId))
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch contact stats:', err)
    }
  }, [accountId])

  const refetch = useCallback(async () => {
    setCurrentPage(1)
    await Promise.all([
      fetchContacts(1, false),
      fetchStats()
    ])
  }, [fetchContacts, fetchStats])

  const loadMore = useCallback(async () => {
    if (!pagination?.hasNextPage || loading) return
    await fetchContacts(currentPage + 1, true)
  }, [fetchContacts, currentPage, pagination?.hasNextPage, loading])

  const updateContact = useCallback(async (contactId: number, data: ContactUpdateData) => {
    try {
      const updatedContact = await contactsAPI.updateContact(
        parseInt(accountId),
        contactId,
        data
      )

      // Update the contact in the local state
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId ? { ...contact, ...updatedContact } : contact
        )
      )

      return updatedContact
    } catch (err) {
      console.error('Failed to update contact:', err)
      throw err
    }
  }, [accountId])

  const blockContact = useCallback(async (contactId: number) => {
    try {
      await contactsAPI.blockContact(parseInt(accountId), contactId)

      // Update the contact in the local state
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId 
            ? { ...contact, blocked: true, status: 'blocked' as const }
            : contact
        )
      )

      // Refresh stats
      await fetchStats()
    } catch (err) {
      console.error('Failed to block contact:', err)
      throw err
    }
  }, [accountId, fetchStats])

  const unblockContact = useCallback(async (contactId: number) => {
    try {
      await contactsAPI.unblockContact(parseInt(accountId), contactId)

      // Update the contact in the local state
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId 
            ? { ...contact, blocked: false, status: 'active' as const }
            : contact
        )
      )

      // Refresh stats
      await fetchStats()
    } catch (err) {
      console.error('Failed to unblock contact:', err)
      throw err
    }
  }, [accountId, fetchStats])

  const deleteContact = useCallback(async (contactId: number, deleteConversations: boolean = false) => {
    try {
      await contactsAPI.deleteContact(parseInt(accountId), contactId, deleteConversations)

      // Remove the contact from the local state
      setContacts(prev => prev.filter(contact => contact.id !== contactId))

      // Refresh stats
      await fetchStats()
    } catch (err) {
      console.error('Failed to delete contact:', err)
      throw err
    }
  }, [accountId, fetchStats])

  const bulkActions = useCallback(async (
    contactIds: number[],
    action: 'block' | 'unblock' | 'delete'
  ) => {
    try {
      await contactsAPI.bulkActions(parseInt(accountId), {
        contact_ids: contactIds,
        action,
      })

      if (action === 'delete') {
        // Remove contacts from local state
        setContacts(prev => prev.filter(contact => !contactIds.includes(contact.id)))
      } else {
        // Update contacts in local state
        const isBlocked = action === 'block'
        const newStatus: 'blocked' | 'active' = isBlocked ? 'blocked' : 'active'
        setContacts(prev =>
          prev.map(contact =>
            contactIds.includes(contact.id)
              ? { 
                  ...contact, 
                  blocked: isBlocked, 
                  status: newStatus
                }
              : contact
          )
        )
      }

      // Refresh stats
      await fetchStats()
    } catch (err) {
      console.error('Failed to perform bulk action:', err)
      throw err
    }
  }, [accountId, fetchStats])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [autoFetch, refetch])

  return {
    contacts,
    stats,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    updateContact,
    blockContact,
    unblockContact,
    deleteContact,
    bulkActions,
  }
}

// Hook for getting a single contact with conversations
export function useContactDetail(accountId: string, contactId: string) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContactDetail = useCallback(async () => {
    if (!accountId || !contactId) return

    setLoading(true)
    setError(null)

    try {
      const [contactData, conversationsData] = await Promise.all([
        contactsAPI.getContact(parseInt(accountId), parseInt(contactId)),
        contactsAPI.getContactConversations(parseInt(accountId), parseInt(contactId))
      ])

      setContact(contactData)
      setConversations(conversationsData.results || [])
    } catch (err) {
      console.error('Failed to fetch contact detail:', err)
      setError('Impossible de charger les détails du contact')
    } finally {
      setLoading(false)
    }
  }, [accountId, contactId])

  useEffect(() => {
    fetchContactDetail()
  }, [fetchContactDetail])

  return {
    contact,
    conversations,
    loading,
    error,
    refetch: fetchContactDetail,
  }
}