import { useState } from 'react'
import { supabase } from '../services/supabase'
import type { 
  StaffAvailability, 
  DefaultStaffRole, 
  EventStaffDetailed,
  StaffSuggestion,
  EventStaffSummary,
  StaffRole,
  AvailabilityStatus
} from '../types/staff'

export function useStaff() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar disponibilidade de staff para uma data
  const getStaffAvailability = async (date: string): Promise<StaffAvailability[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('staff_availability')
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            email,
            phone,
            role
          )
        `)
        .eq('available_date', date)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar disponibilidade'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Definir disponibilidade de staff
  const setStaffAvailability = async (
    profileId: string,
    date: string,
    status: AvailabilityStatus,
    startTime?: string,
    endTime?: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('staff_availability')
        .upsert({
          profile_id: profileId,
          available_date: date,
          status,
          start_time: startTime,
          end_time: endTime,
          notes
        }, {
          onConflict: 'profile_id,available_date'
        })

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao definir disponibilidade'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar roles padrão de um perfil
  const getDefaultStaffRoles = async (profileId: string): Promise<DefaultStaffRole[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('default_staff_roles')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .order('experience_level', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar roles padrão'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Definir role padrão para um perfil
  const setDefaultStaffRole = async (
    profileId: string,
    staffRole: StaffRole,
    experienceLevel: number,
    hourlyRate?: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('default_staff_roles')
        .upsert({
          profile_id: profileId,
          staff_role: staffRole,
          experience_level: experienceLevel,
          hourly_rate: hourlyRate,
          notes,
          is_active: true
        }, {
          onConflict: 'profile_id,staff_role'
        })

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao definir role padrão'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar staff de um evento
  const getEventStaff = async (eventId: string): Promise<EventStaffDetailed[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('event_staff_details')
        .select('*')
        .eq('event_id', eventId)
        .order('assigned_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar staff do evento'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Atribuir staff a um evento
  const assignStaffToEvent = async (
    eventId: string,
    profileId: string,
    staffRole: StaffRole,
    hourlyRate?: number,
    hoursPlanned?: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('event_staff')
        .insert({
          event_id: eventId,
          profile_id: profileId,
          staff_role: staffRole,
          hourly_rate: hourlyRate,
          hours_planned: hoursPlanned || 8.0,
          notes,
          confirmed: false
        })

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atribuir staff'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Atribuir pessoa a uma função existente criando um perfil temporário quando necessário
  const assignPersonToRoleWithName = async (
    eventStaffId: string,
    personName: string,
    profileId?: string,
    hourlyRate?: number
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      let finalProfileId = profileId

      if (!finalProfileId) {
        const { data: tempProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            full_name: personName,
            role: 'client',
            email: `temp-${Date.now()}@temp.local`
          })
          .select('id')
          .single()

        if (profileError) {
          console.error('Erro ao criar perfil temporário:', profileError)
          throw new Error('Não foi possível criar perfil temporário')
        }

        finalProfileId = tempProfile.id
      }

      const { error } = await supabase
        .from('event_staff')
        .update({
          profile_id: finalProfileId,
          hourly_rate: hourlyRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventStaffId)

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atribuir pessoa'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Atribuir pessoa a uma função existente (quando já tem profileId)
  const assignPersonToRole = async (
    eventStaffId: string,
    profileId: string,
    hourlyRate?: number,
    hoursPlanned?: number
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!profileId) {
        setError('profileId é obrigatório para atribuir uma pessoa a uma função existente.')
        return false
      }

      const { error } = await supabase
        .from('event_staff')
        .update({
          profile_id: profileId,
          hourly_rate: hourlyRate,
          hours_planned: hoursPlanned || 8.0,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventStaffId)

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atribuir pessoa'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Atribuir staff a um evento criando perfil temporário quando necessário (inserção)
  const assignStaffToEventWithName = async (
    eventId: string,
    staffRole: StaffRole,
    personName: string,
    profileId?: string,
    hourlyRate?: number,
    hoursPlanned?: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      let finalProfileId = profileId
      if (!finalProfileId) {
        const { data: tempProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({ full_name: personName, role: 'client', email: `temp-${Date.now()}@temp.local` })
          .select('id')
          .single()

        if (profileError) {
          console.error('Erro ao criar perfil temporário:', profileError)
          throw new Error('Não foi possível criar perfil temporário')
        }

        finalProfileId = tempProfile.id
      }

      const { error } = await supabase
        .from('event_staff')
        .insert({
          event_id: eventId,
          profile_id: finalProfileId,
          staff_role: staffRole,
          hourly_rate: hourlyRate,
          hours_planned: hoursPlanned || 8.0,
          notes,
          confirmed: false
        })

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atribuir staff'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Adicionar função ao evento — delega para inserir com perfil temporário
  const addRoleToEvent = async (
    eventId: string,
    staffRole: StaffRole,
    personName?: string,
    notes?: string
  ): Promise<boolean> => {
    return assignStaffToEventWithName(eventId, staffRole, personName || 'Não atribuído', undefined, undefined, undefined, notes)
  }

  // Confirmar participação de staff em evento
  const confirmStaffAssignment = async (eventStaffId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('event_staff')
        .update({
          confirmed: true,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', eventStaffId)

      if (error) throw error
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar participação'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remover staff de evento
  const removeStaffFromEvent = async (eventStaffId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('event_staff')
        .delete()
        .eq('id', eventStaffId)

      // Log response for debugging removal issues (RLS / permissions / not found)
      console.log('useStaff.removeStaffFromEvent response', { eventStaffId, data, error })

      if (error) throw error
      
      // If no error, the delete was successful (data can be null in Supabase deletes)
      console.log('Staff removed successfully:', eventStaffId)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover staff'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar sugestões de staff para um evento
  const getStaffSuggestions = async (
    eventId: string,
    requiredRoles?: StaffRole[]
  ): Promise<StaffSuggestion[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .rpc('suggest_staff_for_event', {
          event_uuid: eventId,
          required_roles: requiredRoles
        })

      if (error) throw error
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar sugestões'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Buscar staff disponível para uma data
  const getAvailableStaff = async (
    date: string,
    requiredRole?: StaffRole
  ): Promise<StaffSuggestion[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .rpc('get_available_staff_for_date', {
          target_date: date,
          required_role: requiredRole
        })

      if (error) throw error
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar staff disponível'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Calcular custo total de staff para um evento
  const calculateEventStaffCost = async (eventId: string): Promise<number> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .rpc('calculate_event_staff_cost', {
          event_uuid: eventId
        })

      if (error) throw error
      return data || 0
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular custo'
      setError(message)
      return 0
    } finally {
      setLoading(false)
    }
  }

  // Buscar resumo de staff para um evento
  const getEventStaffSummary = async (eventId: string): Promise<EventStaffSummary | null> => {
    try {
      setLoading(true)
      setError(null)

      const staff = await getEventStaff(eventId)
      const totalCost = await calculateEventStaffCost(eventId)

      const summary: EventStaffSummary = {
        total_roles: staff.length,
        assigned_staff: staff.filter(s => s.profile_id).length,
        confirmed_staff: staff.filter(s => s.confirmed).length,
        pending_confirmation: staff.filter(s => s.profile_id && !s.confirmed).length,
        total_planned_cost: totalCost,
        total_actual_cost: staff.reduce((sum, s) => {
          return sum + (s.hourly_rate || 0) * (s.hours_worked || s.hours_planned)
        }, 0),
        roles_by_type: staff.reduce((acc, s) => {
          acc[s.staff_role] = (acc[s.staff_role] || 0) + 1
          return acc
        }, {} as Record<StaffRole, number>)
      }

      return summary
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar resumo'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    
    // Staff availability
    getStaffAvailability,
    setStaffAvailability,
    
    // Default roles
    getDefaultStaffRoles,
    setDefaultStaffRole,
    
  // Event staff management
  getEventStaff,
  addRoleToEvent,
  assignPersonToRole,
  assignPersonToRoleWithName,
  assignStaffToEvent,
  assignStaffToEventWithName,
  confirmStaffAssignment,
  removeStaffFromEvent,
    
    // Suggestions and availability
    getStaffSuggestions,
    getAvailableStaff,
    
    // Analytics
    calculateEventStaffCost,
    getEventStaffSummary
  }
}
