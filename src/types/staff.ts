// Tipos para o sistema de staff/equipe

// Single source of truth for staff roles and their display/order.
// Update this array when adding/removing roles — the `StaffRole` type
// and ordering logic are derived from it automatically.
export const STAFF_ROLE_HIERARCHY = [
  'cerimonialista',
  'coordenador',
  'planner',
  'produtor_camarim',
  'mestre_cerimonia',
  'assistente',
  'recepcionista',
  'seguranca',
  'monitora',
  'fiscal_limpeza'
] as const

export type StaffRole = typeof STAFF_ROLE_HIERARCHY[number]

// Returns a numeric rank for a role; unknown roles get placed after known ones.
export const getRoleRank = (role: StaffRole | string) => {
  const idx = (STAFF_ROLE_HIERARCHY as readonly string[]).indexOf(role as string)
  return idx === -1 ? STAFF_ROLE_HIERARCHY.length : idx
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'maybe';

export interface StaffAvailability {
  id: string;
  // New schema: availability can be a default (event_id IS NULL) or an event-specific row
  staff_id?: string; // formerly profile_id
  profile_id?: string; // keep for backwards compatibility
  event_id?: string | null; // NULL = default availability
  available_date?: string; // kept for compatibility if present
  is_available?: boolean; // new boolean flag (preferred)
  start_time?: string;
  end_time?: string;
  // Legacy status enum (optional) — map to/from is_available where needed
  status?: AvailabilityStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DefaultStaffRole {
  id: string;
  profile_id: string;
  staff_role: StaffRole;
  experience_level: number; // 1-5
  hourly_rate?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventStaff {
  id: string;
  event_id: string;
  role_name: string; // Nome da função
  person_name: string; // Nome da pessoa (sempre preenchido)
  user_id?: string; // UUID nullable → profiles.user_id (se a pessoa tem conta)
  confirmed: boolean;
  hourly_rate?: number;
  hours_planned: number;
  hours_worked?: number;
  notes?: string;
  assigned_at: string;
  confirmed_at?: string;
  assigned_by?: string;
  arrival_time?: string; // HH:mm, optional arrival time for the person
  
  // Campos para compatibilidade (deprecated)
  profile_id?: string; // Para compatibilidade com código antigo
  staff_role?: StaffRole; // Para compatibilidade com código antigo
}

// Interface estendida com informações do perfil
export interface EventStaffDetailed extends EventStaff {
  staff_name?: string; // Para compatibilidade
  staff_email?: string;
  staff_phone?: string;
  event_title: string;
  event_date: string;
  planned_cost: number;
  actual_cost?: number;
  assigned_by_name?: string;
  
  // Propriedades da nova estrutura
  staff_role: StaffRole; // Derivado de role_name
  arrival_time?: string; // HH:mm
}

// Interface para sugestões de staff
export interface StaffSuggestion {
  profile_id: string;
  full_name: string;
  staff_role: StaffRole;
  experience_level: number;
  hourly_rate?: number;
  availability_status: AvailabilityStatus;
  priority_score: number;
}

// Informações resumidas de staff para um evento
export interface EventStaffSummary {
  total_roles: number;
  assigned_staff: number;
  confirmed_staff: number;
  pending_confirmation: number;
  total_planned_cost: number;
  total_actual_cost?: number;
  roles_by_type: Record<StaffRole, number>;
}

// Configuração padrão de roles para diferentes tipos de evento
export interface EventStaffTemplate {
  id: string;
  name: string;
  description: string;
  default_roles: {
    staff_role: StaffRole;
    quantity: number;
    required: boolean;
  }[];
}

// Labels em português para as roles
export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  cerimonialista: 'Cerimonialista',
  coordenador: 'Coordenador(a)',
  planner: 'Planner',
  assistente: 'Assistente',
  recepcionista: 'Recepcionista',
  monitora: 'Monitor(a)',
  produtor_camarim: 'Produtor(a) de Camarim',
  mestre_cerimonia: 'Mestre de Cerimônia',
  seguranca: 'Segurança',
  fiscal_limpeza: 'Fiscal de Limpeza'
};

// Labels para status de disponibilidade
export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Disponível',
  unavailable: 'Indisponível',
  // 'busy' removed — use 'unavailable' instead
  maybe: 'Talvez'
};

// Cores para status de disponibilidade (para UI)
export const AVAILABILITY_STATUS_COLORS: Record<AvailabilityStatus, string> = {
  available: 'text-success bg-success/10',
  unavailable: 'text-danger bg-danger/10',
  // 'busy' removed — reuse 'unavailable' styles where appropriate
  maybe: 'text-warning bg-warning/10'
};

// Templates padrão de staff para diferentes tipos de evento
// DEFAULT_STAFF_TEMPLATES moved to src/config/staffTemplates.ts for easier editing.
