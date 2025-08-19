import { useState } from 'react'
import { supabase } from '../services/supabase'

export function useProfiles() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrganizers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, max_role')
        .eq('role', 'organizer')
        .order('full_name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar organizers')
      return []
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, getOrganizers }
}
