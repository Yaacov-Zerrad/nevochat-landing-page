export interface Contact {
  id: string
  name: string
  email?: string
  phone_number?: string
  identifier?: string
  contact_type?: number
  middle_name?: string
  last_name?: string
  location?: string
  country_code?: string
  blocked: boolean
  additional_attributes?: Record<string, any>
  custom_attributes?: Record<string, any>
  last_activity_at?: string
  created_at: string
  updated_at: string
  conversations_count: number
  last_conversation_at?: string
  status: 'active' | 'inactive' | 'blocked'
  recent_conversations?: Conversation[]
  tags?: string[]
}

export interface ContactStats {
  total_contacts: number
  active_contacts: number
  inactive_contacts: number
  blocked_contacts: number
}

export interface Conversation {
  id: string
  display_id: number
  status: number
  created_at: string
  updated_at: string
  last_activity_at: string
  inbox: {
    id: string
    name: string
    channel_type: string
  }
  assignee?: {
    id: string
    name: string
  }
  contact?: Contact
}

export interface ContactFilters {
  search?: string
  status?: string
  contactType?: string
  countryCode?: string
  hasConversations?: boolean | null
  createdAfter?: string
  createdBefore?: string
  ordering?: string
}

export interface Pagination {
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
}