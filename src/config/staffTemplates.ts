import type { EventStaffTemplate } from '../types/staff'

// Editable, single-file configuration for quick template edits.
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
]

export default DEFAULT_STAFF_TEMPLATES
