import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { Event, CreateEventData, UpdateEventData } from '../types/event'
import { useAuthStore } from '../store/authStore'
import { canViewAllEvents } from '../types/user'

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { getUserRole } = useAuthStore()

  // Buscar eventos baseado no role do usuário
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      const userRole = getUserRole()
      const shouldViewAllEvents = canViewAllEvents(userRole)

      // Query direta sem testes desnecessários
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      // Se não for admin/organizer, filtrar apenas eventos do usuário
      if (!shouldViewAllEvents) {
        query = query.eq('profile_id', currentUser.id)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        // Detectar se a tabela não existe
        if (fetchError.message?.includes('relation "public.events" does not exist') ||
            fetchError.code === 'PGRST116' || 
            fetchError.message?.includes('does not exist')) {
          throw new Error('TABELA_NAO_EXISTE')
        }
        
        // Detectar erro de RLS/permissões
        if (fetchError.message?.includes('policy') || 
            fetchError.message?.includes('RLS') ||
            fetchError.code === '42501') {
          throw new Error('ERRO_PERMISSOES')
        }
        
        throw fetchError
      }

      setEvents(data || [])
    } catch (err: any) {
      if (err.message === 'TABELA_NAO_EXISTE') {
        setError('A tabela "events" não foi criada no Supabase. Consulte o arquivo SUPABASE_SETUP.md para instruções de configuração.')
      } else if (err.message === 'ERRO_PERMISSOES') {
        setError('Erro de permissões: As políticas RLS podem não estar configuradas corretamente. Verifique as permissões da tabela events.')
      } else {
        setError(`Erro ao carregar eventos: ${err.message || err}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Buscar um evento específico por ID
  const getEvent = async (eventId: string): Promise<Event | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Evento não encontrado')
        }
        throw fetchError
      }

      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Criar novo evento
  const createEvent = async (eventData: CreateEventData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error: createError } = await supabase
        .from('events')
        .insert([
          {
            ...eventData,
            profile_id: user.id
          }
        ])
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Atualizar a lista local
      setEvents(prev => [...prev, data])
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Atualizar evento
  const updateEvent = async (eventData: UpdateEventData) => {
    try {
      const { id, ...updateFields } = eventData

      const { data, error: updateError } = await supabase
        .from('events')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Atualizar a lista local
      setEvents(prev => prev.map(event => 
        event.id === id ? data : event
      ))
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Deletar evento
  const deleteEvent = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) {
        throw deleteError
      }

      // Remover da lista local
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Carregar eventos quando o hook for montado
  useEffect(() => {
    fetchEvents()
  }, [])

  // Configurar listener para mudanças em tempo real
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const userRole = getUserRole()
        const shouldViewAllEvents = canViewAllEvents(userRole)

        let subscription

        if (shouldViewAllEvents) {
          // Admin/Organizer: escutar mudanças em todos os eventos
          subscription = supabase
            .channel('events_changes_all')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'events'
              },
              () => {
                // Recarregar eventos quando houver mudanças
                fetchEvents()
              }
            )
            .subscribe()
        } else {
          // Usuário comum: escutar apenas eventos próprios
          subscription = supabase
            .channel('events_changes_user')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'events',
                filter: `profile_id=eq.${user.id}`
              },
              () => {
                // Recarregar eventos quando houver mudanças
                fetchEvents()
              }
            )
            .subscribe()
        }

        return () => {
          subscription.unsubscribe()
        }
      }
    }

    setupRealtimeSubscription()
  }, [])

  return {
    events,
    loading,
    error,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  }
}
