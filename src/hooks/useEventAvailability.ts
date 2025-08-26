import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'

export interface EventAvailability {
  id: string
  staff_id: string
  event_id: string
  event: {
    id: string
    title: string
    event_date: string
    end_date?: string
    location: string
    status: string
  }
  is_available: boolean
  available_from?: string
  available_until?: string
  notes?: string
  is_scheduled?: boolean // Se já está escalado para este evento
}

export interface AvailabilityInput {
  event_id: string
  is_available: boolean
  available_from?: string
  available_until?: string
  notes?: string
}

export const useEventAvailability = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Buscar próximos eventos com disponibilidade (scroll infinito)
  const getUpcomingEventsWithAvailability = async (limit: number = 20, offset: number = 0): Promise<{
    events: EventAvailability[]
    hasMore: boolean
  }> => {
    if (!user) return { events: [], hasMore: false }
    
    try {
      setLoading(true)
      setError(null)

      // Data atual para filtrar apenas eventos futuros
      const today = new Date().toISOString().split('T')[0]

      // Buscar eventos futuros ordenados por data
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .range(offset, offset + limit - 1)

      if (eventsError) throw eventsError

      if (!events || events.length === 0) {
        return { events: [], hasMore: false }
      }

      // Como a tabela staff_event_availability não existe, vamos buscar pelo staff_availability
      // que tem disponibilidade por data, não por evento específico
      // Buscar perfil do usuário para obter o profile_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !userProfile) {
        console.error('Erro ao buscar perfil:', profileError)
        return { events: [], hasMore: false }
      }

      // Query event-specific availability rows for the user's profile
      const eventIdsList = events.map(e => e.id)
      const { data: availabilities, error: availError } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('profile_id', userProfile.id)
        .in('event_id', eventIdsList)

      // Se a tabela não existir, continuar sem disponibilidades
      if (availError && !availError.message?.includes('does not exist')) {
        throw availError
      }

      // Buscar escalações existentes (event_staff)
      const eventIds = events.map(e => e.id)
      const { data: scheduledEvents, error: staffError } = await supabase
        .from('event_staff')
        .select('event_id')
        .eq('profile_id', userProfile.id)
        .in('event_id', eventIds)

      if (staffError) throw staffError

      // Combinar dados
      const enrichedEvents: EventAvailability[] = events.map(event => {
  const availability = availabilities?.find(a => a.event_id === event.id)
        const isScheduled = scheduledEvents?.some(s => s.event_id === event.id)

        return {
          id: availability?.id || '',
          staff_id: userProfile.id,
          event_id: event.id,
          event: {
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            end_date: event.end_date,
            location: event.location || '',
            status: event.status
          },
          is_available: availability?.is_available ?? (availability?.status === 'available' ? true : false),
          available_from: availability?.available_from || availability?.start_time,
          available_until: availability?.available_until || availability?.end_time,
          notes: availability?.notes,
          is_scheduled: isScheduled
        }
      })

      // Verificar se há mais eventos (próxima página)
      const { data: nextPage, error: nextError } = await supabase
        .from('events')
        .select('id')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .range(offset + limit, offset + limit)

      if (nextError) throw nextError

      const hasMore = nextPage && nextPage.length > 0

      return { events: enrichedEvents, hasMore }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err)
      setError('Erro ao carregar eventos')
      return { events: [], hasMore: false }
    } finally {
      setLoading(false)
    }
  }

  // Definir disponibilidade para um evento específico
  const setEventAvailability = async (input: AvailabilityInput): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)
      setError(null)

      // Buscar perfil do usuário para obter o profile_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !userProfile) {
        throw new Error('Erro ao buscar perfil do usuário')
      }

      // Verificar se o staff já está escalado para este evento
      const { data: scheduledEvents, error: checkError } = await supabase
        .from('event_staff')
        .select('id')
        .eq('profile_id', userProfile.id)
        .eq('event_id', input.event_id)

      if (checkError) throw checkError

      if (scheduledEvents && scheduledEvents.length > 0) {
        setError('Não é possível alterar disponibilidade. Você já está escalado para este evento.')
        return false
      }

      // Buscar o evento para obter a data
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('event_date')
        .eq('id', input.event_id)
        .single()

      if (eventError || !event) {
        throw new Error('Evento não encontrado')
      }

      // Upsert availability for this profile/event using event_id
      const { error } = await supabase
        .from('staff_availability')
        .upsert({
          profile_id: userProfile.id,
          staff_id: userProfile.id,
          event_id: input.event_id,
          is_available: input.is_available,
          available_from: input.available_from || null,
          available_until: input.available_until || null,
          notes: input.notes || null
        }, { onConflict: 'staff_id,event_id' })

      if (error) {
        throw error
      }

      return true
    } catch (err) {
      console.error('Erro ao salvar disponibilidade:', err)
      setError('Erro ao salvar disponibilidade')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar disponibilidade para um evento específico
  const getAvailabilityForEvent = async (eventId: string): Promise<EventAvailability | null> => {
    if (!user) return null

    try {
      // Buscar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !userProfile) {
        throw new Error('Erro ao buscar perfil do usuário')
      }

      // Buscar dados do evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) throw eventError

      // Buscar disponibilidade específica para este evento
      const { data: availability, error: availError } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('profile_id', userProfile.id)
        .eq('event_id', eventId)
        .single()

      if (availError && availError.code !== 'PGRST116') throw availError

      // Verificar se está escalado
      const { data: scheduled, error: staffError } = await supabase
        .from('event_staff')
        .select('id')
        .eq('profile_id', userProfile.id)
        .eq('event_id', eventId)

      if (staffError) throw staffError

      return {
        id: availability?.id || '',
        staff_id: userProfile.id,
        event_id: eventId,
        event: {
          id: event.id,
          title: event.title,
          event_date: event.event_date,
          end_date: event.end_date,
          location: event.location || '',
          status: event.status
        },
  is_available: availability?.is_available ?? (availability?.status === 'available' ? true : false),
  available_from: availability?.available_from || availability?.start_time,
  available_until: availability?.available_until || availability?.end_time,
        notes: availability?.notes,
        is_scheduled: !!scheduled && scheduled.length > 0
      }
    } catch (err) {
      console.error('Erro ao buscar disponibilidade do evento:', err)
      setError('Erro ao carregar disponibilidade')
      return null
    }
  }

  // Verificar se o staff está escalado para um evento
  const checkIfScheduledForEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Buscar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !userProfile) return false

      const { data, error } = await supabase
        .from('event_staff')
        .select('id')
        .eq('profile_id', userProfile.id)
        .eq('event_id', eventId)

      if (error) throw error

      return data && data.length > 0
    } catch (err) {
      console.error('Erro ao verificar escalação:', err)
      return false
    }
  }

  // Buscar todas as disponibilidades para um evento (visão admin)
  const getAllAvailabilityForEvent = async (eventId: string): Promise<{
    available: any[]
    unavailable: any[]
    notResponded: any[]
  }> => {
    try {
      setLoading(true)
      setError(null)

      // Buscar todos os profiles de organizers
      const { data: allStaff, error: staffError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'organizer')

      if (staffError) throw staffError

  // Buscar disponibilidades específicas para este eventId
      const { data: availabilities, error: availError } = await supabase
        .from('staff_availability')
        .select('*, profiles(id, full_name, email)')
        .eq('event_id', eventId)
        .eq('profiles.role', 'organizer')

      if (availError) throw availError

      const available: any[] = []
      const unavailable: any[] = []
      const notResponded: any[] = []

      allStaff?.forEach(staff => {
        const availability = availabilities?.find(a => a.profile_id === staff.id)
        
        if (!availability) {
          notResponded.push(staff)
        } else if (availability.is_available ?? availability.status === 'available') {
          available.push({
            ...staff,
            ...availability
          })
        } else {
          unavailable.push({
            ...staff,
            ...availability
          })
        }
      })

      return { available, unavailable, notResponded }
    } catch (err) {
      console.error('Erro ao buscar disponibilidades do evento:', err)
      setError('Erro ao carregar dados')
      return { available: [], unavailable: [], notResponded: [] }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getUpcomingEventsWithAvailability,
    setEventAvailability,
    getAvailabilityForEvent,
    checkIfScheduledForEvent,
    getAllAvailabilityForEvent,
    clearError: () => setError(null)
  }
}
