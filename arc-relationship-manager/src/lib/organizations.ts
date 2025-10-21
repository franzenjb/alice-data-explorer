import { supabase } from './supabase'
import { Organization, SearchFilters } from './types'

export class OrganizationService {
  static async getAll(filters?: SearchFilters): Promise<Organization[]> {
    let query = supabase
      .from('organizations')
      .select('*')
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
      .select('*')
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
      .select('*')
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
      .select('*')
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
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'National Capital & Greater Chesapeake', code: 'NCGC' },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Northern California Coastal', code: 'NCC' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Southern California', code: 'SCA' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Texas Gulf Coast', code: 'TGC' }
    ]
  }

  static async getChaptersByRegion(regionId: string) {
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Washington DC Metro', code: 'DCM' },
      { id: '550e8400-e29b-41d4-a716-446655440011', name: 'San Francisco Bay Area', code: 'SFBA' }
    ]
  }

  static async getCountiesByChapter(chapterId: string) {
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Montgomery County', state_code: 'MD' },
      { id: '550e8400-e29b-41d4-a716-446655440021', name: 'Fairfax County', state_code: 'VA' }
    ]
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