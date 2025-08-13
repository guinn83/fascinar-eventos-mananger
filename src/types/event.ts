export interface Event {
  id: string
  title: string
  description?: string
  image_url?: string
  event_date: string
  end_date?: string
  location?: string
  attendees: number // Número de convidados
  staff: number // Número de pessoas da equipe de organização
  price: number
  status: 'active' | 'inactive' | 'cancelled' | 'completed'
  profile_id: string
  created_at: string
  updated_at: string
}

export interface CreateEventData {
  title: string
  description?: string
  image_url?: string
  event_date: string
  end_date?: string
  location?: string
  attendees?: number // Número de convidados
  staff?: number // Número de pessoas da equipe de organização
  price?: number
  status?: Event['status']
  profile_id: string
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}
