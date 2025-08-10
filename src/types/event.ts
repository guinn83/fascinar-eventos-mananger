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
  max_attendees?: number
  current_attendees?: number
  price?: number
  status?: Event['status']
  profile_id: string
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}
