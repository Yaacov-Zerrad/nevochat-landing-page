// Contact related types for the CRM system

export interface Contact {
  id: number
  name?: string
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
  
  // Computed fields from API
  conversations_count?: number
  last_conversation_at?: string
  status?: 'active' | 'inactive' | 'blocked'
}

export interface ContactCreateData {
  name?: string
  email?: string
  phone_number?: string
  contact_type?: number
  middle_name?: string
  last_name?: string
  location?: string
  country_code?: string
  additional_attributes?: Record<string, any>
  custom_attributes?: Record<string, any>
}

export interface ContactUpdateData {
  name?: string
  email?: string
  phone_number?: string
  contact_type?: number
  middle_name?: string
  last_name?: string
  location?: string
  country_code?: string
  blocked?: boolean
  additional_attributes?: Record<string, any>
  custom_attributes?: Record<string, any>
}

export interface ContactFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive' | 'blocked'
  contact_type?: number | string
  country_code?: string
  has_conversations?: boolean | null
  created_after?: string
  created_before?: string
  ordering?: string
}

export interface ContactStats {
  total_contacts: number
  active_contacts: number
  inactive_contacts: number
  blocked_contacts: number
}

export interface ContactListResponse {
  results: Contact[]
  count: number
  next?: string
  previous?: string
}

export interface ContactConversation {
  id: number
  display_id: number
  status: number
  created_at: string
  updated_at: string
  last_activity_at: string
  contact_last_seen_at?: string
  agent_last_seen_at?: string
  assignee_last_seen_at?: string
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  assignee?: {
    id: number
    name: string
    email: string
  }
  team?: {
    id: number
    name: string
  }
  priority?: number
  snoozed_until?: string
  uuid: string
  additional_attributes?: Record<string, any>
  custom_attributes?: Record<string, any>
}

export interface ContactConversationsResponse {
  results: ContactConversation[]
  count: number
  next?: string
  previous?: string
}

// Pagination interface
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Filter options for the UI
export interface ContactFilterOptions {
  statuses: Array<{ value: string; label: string }>
  contactTypes: Array<{ value: number; label: string }>
  countries: Array<{ value: string; label: string }>
}

// Bulk action types
export type ContactBulkAction = 'block' | 'unblock' | 'delete'

export interface ContactBulkActionData {
  contact_ids: number[]
  action: ContactBulkAction
}

// Contact detail view with additional data
export interface ContactDetail extends Contact {
  recent_conversations: ContactConversation[]
  tags: string[]
}