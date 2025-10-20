export interface Region {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Chapter {
  id: string
  region_id: string
  name: string
  code: string
  created_at: string
  region?: Region
}

export interface County {
  id: string
  chapter_id: string
  name: string
  state_code: string
  fips_code: string
  created_at: string
  chapter?: Chapter
}

export interface Organization {
  id: string
  name: string
  mission_area?: 'disaster_relief' | 'health_safety' | 'military_families' | 'international' | 'blood_services' | 'other'
  organization_type?: 'government' | 'nonprofit' | 'business' | 'faith_based' | 'educational' | 'healthcare' | 'other'
  
  // Geographic assignment
  region_id?: string
  chapter_id?: string
  county_id?: string
  
  // Location data
  address?: string
  city?: string
  state?: string
  zip?: string
  
  // Contact info
  website?: string
  phone?: string
  
  // Metadata
  tags?: string[]
  notes?: string
  status: 'active' | 'inactive' | 'prospect'
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  region?: Region
  chapter?: Chapter
  county?: County
  people?: Person[]
  meetings?: Meeting[]
}

export interface Person {
  id: string
  org_id: string
  first_name?: string
  last_name?: string
  title?: string
  email?: string
  phone?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  organization?: Organization
}

export interface Meeting {
  id: string
  org_id: string
  date: string
  location?: string
  summary?: string
  follow_up_date?: string
  attendees?: string[]
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  organization?: Organization
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  meeting_id: string
  storage_path: string
  file_name?: string
  mime_type?: string
  uploaded_by?: string
  created_at: string
  
  // Relations
  meeting?: Meeting
}

export interface UserProfile {
  id: string
  email: string
  role: 'national_admin' | 'regional_lead' | 'chapter_user' | 'read_only'
  region_id?: string
  chapter_id?: string
  first_name?: string
  last_name?: string
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  actor_user_id: string
  entity_type: 'organization' | 'person' | 'meeting' | 'attachment'
  entity_id: string
  action: 'created' | 'updated' | 'deleted'
  payload?: Record<string, any>
  timestamp: string
}

// Search and filtering types
export interface SearchFilters {
  query?: string
  region_ids?: string[]
  chapter_ids?: string[]
  mission_areas?: Organization['mission_area'][]
  organization_types?: Organization['organization_type'][]
  status?: Organization['status'][]
  has_recent_activity?: boolean
  has_upcoming_followups?: boolean
  tags?: string[]
}

export interface DashboardStats {
  total_organizations: number
  total_people: number
  total_meetings: number
  pending_followups: number
  recent_activity_count: number
  organizations_by_mission_area: Record<string, number>
  meetings_this_month: number
  new_organizations_this_month: number
}