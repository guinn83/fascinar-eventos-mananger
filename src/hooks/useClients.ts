import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import type { Client, CreateClientData, UpdateClientData, RelationshipType } from '../types/client'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os clientes
  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes'
      setError(errorMessage)
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Criar novo cliente
  const createClient = async (clientData: CreateClientData) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single()

      if (error) throw error
      
      setClients(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente'
      setError(errorMessage)
      console.error('Erro ao criar cliente:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Atualizar cliente
  const updateClient = async (id: string, updates: UpdateClientData) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ))
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente'
      setError(errorMessage)
      console.error('Erro ao atualizar cliente:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Deletar cliente
  const deleteClient = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setClients(prev => prev.filter(client => client.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar cliente'
      setError(errorMessage)
      console.error('Erro ao deletar cliente:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Vincular cliente a um perfil
  const linkClientToProfile = async (clientId: string, profileId: string) => {
    return updateClient(clientId, { profile_id: profileId })
  }

  // Desvincular cliente de um perfil
  const unlinkClientFromProfile = async (clientId: string) => {
    return updateClient(clientId, { profile_id: undefined })
  }

  // Buscar clientes vinculados a um perfil específico
  const getClientsByProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('profile_id', profileId)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Erro ao buscar clientes por perfil:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  }

  // Criar relacionamento entre dois clientes
  const createRelationship = async (
    clientId1: string, 
    clientId2: string, 
    relationshipType: RelationshipType
  ) => {
    try {
      setError(null)
      
      // Atualizar o primeiro cliente
      const { error: error1 } = await supabase
        .from('clients')
        .update({ 
          related_client_id: clientId2, 
          relationship_type: relationshipType 
        })
        .eq('id', clientId1)

      if (error1) throw error1

      // Determinar o tipo de relacionamento inverso
      const inverseRelationship = getInverseRelationship(relationshipType)
      
      // Atualizar o segundo cliente
      const { error: error2 } = await supabase
        .from('clients')
        .update({ 
          related_client_id: clientId1, 
          relationship_type: inverseRelationship 
        })
        .eq('id', clientId2)

      if (error2) throw error2

      // Recarregar a lista de clientes
      await fetchClients()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar relacionamento'
      setError(errorMessage)
      console.error('Erro ao criar relacionamento:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Remover relacionamento entre clientes
  const removeRelationship = async (clientId1: string, clientId2: string) => {
    try {
      setError(null)
      
      // Remover relacionamento do primeiro cliente
      const { error: error1 } = await supabase
        .from('clients')
        .update({ 
          related_client_id: null, 
          relationship_type: null 
        })
        .eq('id', clientId1)

      if (error1) throw error1

      // Remover relacionamento do segundo cliente
      const { error: error2 } = await supabase
        .from('clients')
        .update({ 
          related_client_id: null, 
          relationship_type: null 
        })
        .eq('id', clientId2)

      if (error2) throw error2

      // Recarregar a lista de clientes
      await fetchClients()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover relacionamento'
      setError(errorMessage)
      console.error('Erro ao remover relacionamento:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Buscar clientes relacionados
  const getRelatedClients = (clientId: string) => {
    return clients.filter(client => 
      client.related_client_id === clientId || 
      client.id === clients.find(c => c.id === clientId)?.related_client_id
    )
  }

  // Função auxiliar para determinar relacionamento inverso
  const getInverseRelationship = (relationship: RelationshipType): RelationshipType => {
    switch (relationship) {
      case 'Noivo/Noiva':
        return 'Noivo/Noiva' // Recíproco
      case 'Esposo/Esposa':
        return 'Esposo/Esposa' // Recíproco
      case 'Filho/Filha':
        return 'Pai/Mãe'
      case 'Pai/Mãe':
        return 'Filho/Filha'
      case 'Outro':
        return 'Outro'
      default:
        return 'Outro'
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    linkClientToProfile,
    unlinkClientFromProfile,
    getClientsByProfile,
    createRelationship,
    removeRelationship,
    getRelatedClients
  }
}
