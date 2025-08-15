export type EventStatus = 'active' | 'inactive' | 'cancelled' | 'completed'

export interface Event {
  id: string
  title: string
  description?: string
  image_url?: string
  event_date: string
  end_date?: string
  location?: string
  max_attendees?: number
  current_attendees: number
  attendees: number // Número de convidados
  staff: number // Número de pessoas da equipe de organização
  price: number
  status: EventStatus
  
  // Relacionamentos atualizados (estrutura unificada)
  profile_id?: string // Mantido para backward compatibility
  client_profile_id?: string // Cliente que contratou
  created_by_profile_id?: string // Quem criou no sistema
  
  created_at: string
  updated_at: string
}

// Interface estendida com informações dos perfis relacionados
export interface EventWithProfiles extends Event {
  client_name?: string
  client_email?: string
  client_phone?: string
  client_company?: string
  creator_name?: string
  creator_role?: string
}

export interface CreateEventData {
  title: string
  description?: string
  image_url?: string
  event_date: string
  end_date?: string
  location?: string
  max_attendees?: number
  attendees?: number // Número de convidados
  staff?: number // Número de pessoas da equipe de organização
  price?: number
  status?: EventStatus
  client_profile_id?: string
  created_by_profile_id?: string
  profile_id?: string // Mantido para backward compatibility
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}
