// Tipos para o sistema de staff/equipe

export type StaffRole = 
  | 'cerimonialista'
  | 'coordenador'
  | 'planner'
  | 'assistente'
  | 'recepcionista'
  | 'monitora'
  | 'produtor_camarim'
  | 'mestre_cerimonia'
  | 'seguranca'
  | 'fiscal_limpeza';

export type AvailabilityStatus = 'available' | 'unavailable' | 'maybe';

export interface StaffAvailability {
  id: string;
  profile_id: string;
  available_date: string; // ISO date string
  start_time?: string;
  end_time?: string;
  status: AvailabilityStatus;
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
export const DEFAULT_STAFF_TEMPLATES: EventStaffTemplate[] = [
  {
    id: 'wedding-small',
    name: 'Casamento Pequeno (até 100 convidados)',
    description: 'Equipe essencial para casamentos menores',
    default_roles: [
      { staff_role: 'cerimonialista', quantity: 1, required: true },
      { staff_role: 'coordenador', quantity: 1, required: true },
      { staff_role: 'recepcionista', quantity: 1, required: false },
      { staff_role: 'monitora', quantity: 2, required: false }
    ]
  },
  {
    id: 'wedding-medium',
    name: 'Casamento Médio (100-200 convidados)',
    description: 'Equipe completa para casamentos de porte médio',
    default_roles: [
      { staff_role: 'cerimonialista', quantity: 1, required: true },
      { staff_role: 'coordenador', quantity: 1, required: true },
      { staff_role: 'planner', quantity: 1, required: false },
      { staff_role: 'assistente', quantity: 1, required: false },
      { staff_role: 'recepcionista', quantity: 2, required: true },
      { staff_role: 'monitora', quantity: 3, required: true },
      { staff_role: 'produtor_camarim', quantity: 1, required: false }
    ]
  },
  {
    id: 'wedding-large',
    name: 'Casamento Grande (200+ convidados)',
    description: 'Equipe completa para grandes eventos',
    default_roles: [
      { staff_role: 'cerimonialista', quantity: 1, required: true },
      { staff_role: 'coordenador', quantity: 2, required: true },
      { staff_role: 'planner', quantity: 1, required: true },
      { staff_role: 'assistente', quantity: 2, required: true },
      { staff_role: 'recepcionista', quantity: 3, required: true },
      { staff_role: 'monitora', quantity: 4, required: true },
      { staff_role: 'produtor_camarim', quantity: 1, required: true },
      { staff_role: 'mestre_cerimonia', quantity: 1, required: false },
      { staff_role: 'seguranca', quantity: 2, required: false }
    ]
  },
  {
    id: 'corporate',
    name: 'Evento Corporativo',
    description: 'Equipe para eventos empresariais',
    default_roles: [
      { staff_role: 'coordenador', quantity: 1, required: true },
      { staff_role: 'assistente', quantity: 1, required: true },
      { staff_role: 'recepcionista', quantity: 2, required: true },
      { staff_role: 'monitora', quantity: 2, required: false },
      { staff_role: 'mestre_cerimonia', quantity: 1, required: false }
    ]
  }
];
