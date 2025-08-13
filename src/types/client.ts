export type RelationshipType = 
  | 'Noivo/Noiva'
  | 'Esposo/Esposa'
  | 'Filho/Filha'
  | 'Pai/Mãe'
  | 'Outro'

export interface Client {
  id: string
  name: string
  email?: string // Email do cliente
  phone?: string
  cpf: string // Obrigatório e único
  profile_id?: string // ID do perfil de usuário vinculado (opcional)
  related_client_id?: string // ID do cliente relacionado (opcional)
  relationship_type?: RelationshipType // Tipo de relacionamento (obrigatório se related_client_id existe)
  created_at: string
  updated_at: string
  // Campos populados por join quando necessário
  related_client?: Client // Dados do cliente relacionado
  profile?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export interface CreateClientData {
  name: string
  email?: string
  phone?: string
  cpf: string // Obrigatório
  profile_id?: string
  related_client_id?: string
  relationship_type?: RelationshipType
}

export interface UpdateClientData {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  profile_id?: string
  related_client_id?: string
  relationship_type?: RelationshipType
}
