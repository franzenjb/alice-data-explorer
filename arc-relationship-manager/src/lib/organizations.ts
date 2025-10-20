import { supabase } from './supabase'
import { Organization, SearchFilters } from './types'

export class OrganizationService {
  static async getAll(filters?: SearchFilters): Promise<Organization[]> {
    let query = supabase
      .from('organizations')
      .select(`
        *,
        region:regions(id, name, code),
        chapter:chapters(id, name, code),
        county:counties(id, name, state_code),
        people(count),
        meetings(count)
      `)
      .order('updated_at', { ascending: false })

    // Apply search filter
    if (filters?.query) {
      query = query.textSearch('search_vector', filters.query)
    }

    // Apply region filter
    if (filters?.region_ids?.length) {
      query = query.in('region_id', filters.region_ids)
    }

    // Apply chapter filter
    if (filters?.chapter_ids?.length) {
      query = query.in('chapter_id', filters.chapter_ids)
    }

    // Apply mission area filter
    if (filters?.mission_areas?.length) {
      query = query.in('mission_area', filters.mission_areas)
    }

    // Apply organization type filter
    if (filters?.organization_types?.length) {
      query = query.in('organization_type', filters.organization_types)
    }

    // Apply status filter
    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }

    // Apply recent activity filter
    if (filters?.has_recent_activity) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('updated_at', thirtyDaysAgo)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        region:regions(id, name, code),
        chapter:chapters(id, name, code),
        county:counties(id, name, state_code),
        people(*),
        meetings(
          *,
          attachments(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async create(data: Partial<Organization>): Promise<Organization> {
    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select(`
        *,
        region:regions(id, name, code),
        chapter:chapters(id, name, code),
        county:counties(id, name, state_code)
      `)
      .single()

    if (error) throw error
    return org
  }

  static async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const { data: org, error } = await supabase
      .from('organizations')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', id)
      .select(`
        *,
        region:regions(id, name, code),
        chapter:chapters(id, name, code),
        county:counties(id, name, state_code)
      `)
      .single()

    if (error) throw error
    return org
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getRegions() {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getChaptersByRegion(regionId: string) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('region_id', regionId)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getCountiesByChapter(chapterId: string) {
    const { data, error } = await supabase
      .from('counties')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getDashboardStats() {
    const { data: stats, error } = await supabase.rpc('get_dashboard_stats')

    if (error) throw error
    return stats
  }

  static async searchSimilar(name: string, regionId?: string) {
    const { data, error } = await supabase.rpc('find_duplicate_organizations', {
      input_name: name,
      input_region_id: regionId,
      similarity_threshold: 0.6
    })

    if (error) throw error
    return data || []
  }
}