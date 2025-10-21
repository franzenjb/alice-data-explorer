import { supabase } from './supabase'
import { Meeting, SearchFilters } from './types'

export class MeetingService {
  static async getAll(filters?: SearchFilters): Promise<Meeting[]> {
    let query = supabase
      .from('meetings')
      .select('*, organization:organizations(id, name)')
      .order('date', { ascending: false })

    // Apply search filter
    if (filters?.query) {
      query = query.textSearch('search_vector', filters.query)
    }

    // Apply organization filter
    if (filters?.organization_ids?.length) {
      query = query.in('org_id', filters.organization_ids)
    }

    // Apply date range filter
    if (filters?.date_from) {
      query = query.gte('date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('date', filters.date_to)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Meeting | null> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:organizations(id, name), attachments(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async getByOrganization(orgId: string): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:organizations(id, name)')
      .eq('org_id', orgId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getUpcoming(limit = 10): Promise<Meeting[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:organizations(id, name)')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async getFollowUps(): Promise<Meeting[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:organizations(id, name)')
      .not('follow_up_date', 'is', null)
      .lte('follow_up_date', today)
      .order('follow_up_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(data: Partial<Meeting>): Promise<Meeting> {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select('*, organization:organizations(id, name)')
      .single()

    if (error) throw error
    return meeting
  }

  static async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', id)
      .select('*, organization:organizations(id, name)')
      .single()

    if (error) throw error
    return meeting
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}