import { useState } from 'react'
import { supabase } from '../services/supabase'

export interface AdminEventStats {
  event_id: string
  event_title: string
  event_date: string
  total_staff: number
  available_count: number
  unavailable_count: number
  pending_count: number
  scheduled_count: number
}

export interface StaffAvailabilityForEvent {
  staff_id: string
  staff_name: string
  staff_email: string
  is_available: boolean | null
  available_from?: string
  available_until?: string
  notes?: string
  is_scheduled: boolean
  updated_at: string
}

export interface AdminAvailabilityData {
  event: {
    id: string
    title: string
    event_date: string
    end_date?: string
    location?: string
    description?: string
  }
  staff_availabilities: StaffAvailabilityForEvent[]
  stats: {
    total: number
    available: number
    unavailable: number
    pending: number
    scheduled: number
  }
}

export const useAdminAvailability = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar estatísticas de todos os eventos
  const getEventStats = async (dateRange = 30): Promise<AdminEventStats[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + dateRange)
      
      const { data, error: queryError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          staff_event_availability (
            is_available,
            is_scheduled
          )
        `)
        .gte('event_date', new Date().toISOString())
        .lte('event_date', endDate.toISOString())
        .order('event_date', { ascending: true })

      if (queryError) throw queryError

      const stats: AdminEventStats[] = data.map(event => {
        const availabilities = event.staff_event_availability
        
        return {
          event_id: event.id,
          event_title: event.title,
          event_date: event.event_date,
          total_staff: availabilities.length,
          available_count: availabilities.filter(a => a.is_available === true && !a.is_scheduled).length,
          unavailable_count: availabilities.filter(a => a.is_available === false && !a.is_scheduled).length,
          pending_count: availabilities.filter(a => a.is_available === null).length,
          scheduled_count: availabilities.filter(a => a.is_scheduled === true).length
        }
      })

      return stats
      
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Buscar disponibilidades de um evento específico com dados dos funcionários
  const getEventAvailabilities = async (eventId: string): Promise<AdminAvailabilityData | null> => {
    setLoading(true)
    setError(null)

    try {
      // Buscar dados do evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) throw eventError

      // Buscar disponibilidades com dados dos funcionários
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('staff_event_availability')
        .select(`
          *,
          profiles:staff_id (
            id,
            name,
            email
          )
        `)
        .eq('event_id', eventId)

      if (availabilityError) throw availabilityError

      // Calcular estatísticas
      const stats = {
        total: availabilityData.length,
        available: availabilityData.filter(a => a.is_available === true && !a.is_scheduled).length,
        unavailable: availabilityData.filter(a => a.is_available === false && !a.is_scheduled).length,
        pending: availabilityData.filter(a => a.is_available === null).length,
        scheduled: availabilityData.filter(a => a.is_scheduled === true).length
      }

      // Mapear dados dos funcionários
      const staff_availabilities: StaffAvailabilityForEvent[] = availabilityData.map(item => ({
        staff_id: item.staff_id,
        staff_name: item.profiles?.name || 'Nome não encontrado',
        staff_email: item.profiles?.email || '',
        is_available: item.is_available,
        available_from: item.available_from,
        available_until: item.available_until,
        notes: item.notes,
        is_scheduled: item.is_scheduled || false,
        updated_at: item.updated_at
      }))

      return {
        event: eventData,
        staff_availabilities,
        stats
      }

    } catch (err) {
      console.error('Erro ao buscar disponibilidades do evento:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Escalar funcionário para evento
  const scheduleStaffForEvent = async (eventId: string, staffId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('staff_event_availability')
        .update({ 
          is_scheduled: true,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .eq('staff_id', staffId)

      if (error) throw error
      return true

    } catch (err) {
      console.error('Erro ao escalar funcionário:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remover escalação de funcionário
  const unscheduleStaffFromEvent = async (eventId: string, staffId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('staff_event_availability')
        .update({ 
          is_scheduled: false,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .eq('staff_id', staffId)

      if (error) throw error
      return true

    } catch (err) {
      console.error('Erro ao remover escalação:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Auto escalar funcionários disponíveis (algoritmo simples)
  const autoScheduleEvent = async (eventId: string, maxStaff = 5): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Buscar funcionários disponíveis que não estão escalados
      const { data: availableStaff, error } = await supabase
        .from('staff_event_availability')
        .select('staff_id')
        .eq('event_id', eventId)
        .eq('is_available', true)
        .eq('is_scheduled', false)
        .limit(maxStaff)

      if (error) throw error

      if (availableStaff.length === 0) {
        setError('Nenhum funcionário disponível para escalação automática')
        return false
      }

      // Escalar todos os funcionários disponíveis
      const updates = availableStaff.map(staff => ({
        event_id: eventId,
        staff_id: staff.staff_id,
        is_scheduled: true,
        updated_at: new Date().toISOString()
      }))

      const { error: updateError } = await supabase
        .from('staff_event_availability')
        .upsert(updates, { 
          onConflict: 'event_id,staff_id',
          ignoreDuplicates: false 
        })

      if (updateError) throw updateError

      return true

    } catch (err) {
      console.error('Erro na escalação automática:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Exportar dados para CSV
  const exportEventAvailabilities = async (eventId: string): Promise<string | null> => {
    try {
      const data = await getEventAvailabilities(eventId)
      if (!data) return null

      const csvHeader = 'Staff,Email,Status,Horario_Disponivel,Observacoes,Escalado'
      const csvRows = data.staff_availabilities.map(staff => {
        const status = staff.is_available === true ? 'Disponível' : 
                      staff.is_available === false ? 'Indisponível' : 'Pendente'
        const schedule = staff.available_from && staff.available_until 
          ? `${staff.available_from}-${staff.available_until}`
          : staff.available_from 
          ? `A partir ${staff.available_from}`
          : staff.available_until
          ? `Até ${staff.available_until}`
          : staff.is_available ? 'Dia todo' : ''
        
        return [
          staff.staff_name,
          staff.staff_email,
          status,
          schedule,
          staff.notes || '',
          staff.is_scheduled ? 'Sim' : 'Não'
        ].map(field => `"${field}"`).join(',')
      })

      return [csvHeader, ...csvRows].join('\n')

    } catch (err) {
      console.error('Erro ao exportar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    }
  }

  return {
    loading,
    error,
    getEventStats,
    getEventAvailabilities,
    scheduleStaffForEvent,
    unscheduleStaffFromEvent,
    autoScheduleEvent,
    exportEventAvailabilities
  }
}
