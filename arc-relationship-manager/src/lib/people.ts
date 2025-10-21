import { supabase } from './supabase'
import { Person, SearchFilters } from './types'

export class PersonService {
  static async getAll(filters?: SearchFilters): Promise<Person[]> {
    let query = supabase
      .from('people')
      .select('*, organization:organizations(id, name)')
      .order('updated_at', { ascending: false })

    // Apply search filter
    if (filters?.query) {
      query = query.textSearch('search_vector', filters.query)
    }

    // Apply organization filter
    if (filters?.organization_ids?.length) {
      query = query.in('org_id', filters.organization_ids)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Person | null> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:organizations(id, name), meetings(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async getByOrganization(orgId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('org_id', orgId)
      .order('last_name')

    if (error) throw error
    return data || []
  }

  static async create(data: Partial<Person>): Promise<Person> {
    const { data: person, error } = await supabase
      .from('people')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select('*, organization:organizations(id, name)')
      .single()

    if (error) throw error
    return person
  }

  static async update(id: string, data: Partial<Person>): Promise<Person> {
    const { data: person, error } = await supabase
      .from('people')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', id)
      .select('*, organization:organizations(id, name)')
      .single()

    if (error) throw error
    return person
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async searchByEmail(email: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:organizations(id, name)')
      .ilike('email', `%${email}%`)
      .limit(10)

    if (error) throw error
    return data || []
  }

  static async searchByName(name: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:organizations(id, name)')
      .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`)
      .limit(10)

    if (error) throw error
    return data || []
  }
}