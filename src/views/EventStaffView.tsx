import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useStaff } from '../hooks/useStaff'
import { 
  STAFF_ROLE_LABELS, 
  DEFAULT_STAFF_TEMPLATES,
  type StaffRole,
  type EventStaffDetailed,
  type EventStaffSummary
} from '../types/staff'
import { pageTokens, getCardItemClasses } from '../components/ui/theme'
// Update the import path if the card components are located elsewhere, for example:
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
// Or, if you do not have these components, create them or install a UI library (like shadcn/ui or Material UI) and import from there.

// badge removed — status is shown as a colored dot next to the person name

// Local fallback Button component for when ../components/ui/button is not available.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'confirm' | 'edit' | 'destructive' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
  const Button = ({ children, variant = 'default', size = 'md', className = '', ...props }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors'
  const variantClasses: Record<string, string> = {
    default: 'px-3 py-2 bg-primary text-white hover:bg-primary/90',
    outline: 'px-3 py-2 border border-border bg-surface text-text hover:bg-surface-hover',
    secondary: 'px-2 py-1 bg-warning/10 text-warning hover:bg-warning/20',
    confirm: 'px-3 py-2 bg-success text-white hover:bg-success/80',
    edit: 'px-3 py-2 border border-border bg-surface text-text hover:bg-surface-hover',
    destructive: 'px-3 py-2 bg-danger text-white hover:bg-danger/90',
    danger: 'px-3 py-2 bg-danger text-white hover:bg-danger/90'
  }
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: '',
    lg: 'px-4 py-3'
  }
  const classes = `${base} ${variantClasses[variant] ?? ''} ${sizeClasses[size] ?? ''} ${className}`
  return <button {...props} className={classes}>{children}</button>
}
import { 
  Users, 
  Plus, 
  CheckCircle, 
  Edit,
  Trash2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react'

export function EventStaffView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEvent } = useEvents()
  const {
    getEventStaff,
    addRoleToEvent,
    assignPersonToRoleWithName,
    confirmStaffAssignment,
    removeStaffFromEvent,
    getEventStaffSummary,
    loading,
    error
  } = useStaff()

  const [event, setEvent] = useState<any>(null)
  const [eventStaff, setEventStaff] = useState<EventStaffDetailed[]>([])
  const [summary, setSummary] = useState<EventStaffSummary | null>(null)
  const [selectedRole, _setSelectedRole] = useState<StaffRole | 'all'>('all')
  
  // Novos estados para fluxo de adição de função
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAssignPerson, setShowAssignPerson] = useState(false)
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<string>('')
  const [selectedEventStaffId, setSelectedEventStaffId] = useState<string>('')
  // Controlled inputs for assign/edit modal
  const [assignPersonName, setAssignPersonName] = useState('')
  const [assignProfileId, setAssignProfileId] = useState('')
  const [assignHourlyRate, setAssignHourlyRate] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (id) {
      loadEventData()
    }
  }, [id])

  const loadEventData = async () => {
    if (!id) return

    try {
      // Carregar dados do evento
      const eventData = await getEvent(id)
      setEvent(eventData)

      // Carregar staff do evento
      const staff = await getEventStaff(id)
      setEventStaff(staff)

      // Carregar resumo
      const summaryData = await getEventStaffSummary(id)
      setSummary(summaryData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  const handleAddRole = async (role: StaffRole) => {
    if (!id) return
    try {
      const success = await addRoleToEvent(id, role)
      if (success) {
        await loadEventData()
        setShowAddRole(false)
      }
    } catch (err) {
      console.error('Erro ao adicionar função:', err)
    }
  }

  const openAssignModalFor = (opts: { eventStaffId: string, role: StaffRole, personName?: string, profileId?: string, hourlyRate?: number }) => {
    setSelectedEventStaffId(opts.eventStaffId)
    setSelectedRoleForAssignment(opts.role)
    setAssignPersonName(opts.personName || '')
    setAssignProfileId(opts.profileId || '')
    setAssignHourlyRate(opts.hourlyRate)
    setShowAssignPerson(true)
  }

  const handleConfirmStaff = async (eventStaffId: string) => {
    try {
      const success = await confirmStaffAssignment(eventStaffId)
      if (success) {
        await loadEventData()
      }
    } catch (err) {
      console.error('Erro ao confirmar staff:', err)
    }
  }

  const handleRemoveStaff = async (eventStaffId: string) => {
    if (!confirm('Remover este membro da equipe? Esta ação não pode ser desfeita.')) return
    try {
      console.log('Removendo staff id=', eventStaffId)
      const success = await removeStaffFromEvent(eventStaffId)
      if (success) {
        await loadEventData()
      } else {
        alert('Não foi possível remover o membro da equipe.')
      }
    } catch (err) {
      console.error('Erro ao remover staff:', err)
      alert('Erro ao remover membro da equipe. Verifique o console para mais detalhes.')
    }
  }

  const applyTemplate = async (templateId: string) => {
    if (!id) return

    const template = DEFAULT_STAFF_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    try {
      for (const role of template.default_roles) {
        for (let i = 0; i < role.quantity; i++) {
          // Criar placeholder para o role (sem atribuir pessoa específica ainda)
          // Isso pode ser implementado como uma função separada
        }
      }
      await loadEventData()
    } catch (err) {
      console.error('Erro ao aplicar template:', err)
    }
  }

  const filteredStaff = selectedRole === 'all' 
    ? eventStaff 
    : eventStaff.filter(s => s.staff_role === selectedRole)

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto bg-background min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3"></div>
          <div className="h-64 bg-surface rounded"></div>
        </div>
      </div>
    )
  }

  return (
  <div className={`max-w-6xl mx-auto bg-background min-h-screen ${pageTokens.cardGap.sm}`}>
  {/* Header */}
  <div className={`flex justify-between items-start ${pageTokens.headerPadding}`}>
        <div>
          <h1 className="text-h1 text-text">Equipe Fascinar</h1>
          <p className="text-text-secondary mt-2">{event.title}</p>
          <p className="text-small text-text-muted">
            {new Date(event.event_date).toLocaleDateString('pt-BR')} • {event.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/eventos/${id}`)}
          >
            Voltar ao Evento
          </Button>
        </div>
      </div>
      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card className="w-full resume-card" strong>
            <CardContent size="md">
              <div className="flex items-center">
                <Users className="icon-xl text-icon-3 mr-4" />
                <div>
                  <p className="text-h3 font-bold text-text">{summary.total_roles} {summary.total_roles === 1 ? 'profissional' : 'profissionais'}</p>
                  <p className="text-xs text-text-muted mt-0">
                    {Object.entries(summary.roles_by_type)
                      .filter(([,count]) => count > 0)
                      .map(([role, count]) => `${count} ${STAFF_ROLE_LABELS[role as keyof typeof STAFF_ROLE_LABELS]}`)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Staff */}
  <Card strong>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-text">
              <span className="flex items-center gap-2">
              <Users className="icon-sm" />
              Equipe e Funções
            </span>
            {/* show Add button inside card header when there is at least one member */}
            {filteredStaff.length > 0 && (
              <Button onClick={() => setShowAddRole(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Função
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent size="md">
          {filteredStaff.length === 0 ? (
            <div className="text-center text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma função de equipe definida ainda.</p>
              <div className="mt-4">
                <Button onClick={() => setShowAddRole(true)}>Adicionar Primeira Função</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
                {filteredStaff.map((staff) => {
                const displayName = (staff.staff_name || '').toString().trim()
                const isUnassigned = displayName === '' || displayName.toLowerCase() === 'não atribuído'
                return (
                <div
                  key={staff.id}
                  className={`border border-border rounded-lg py-2 px-3 ${getCardItemClasses()}`}
                >
                  <div className="grid grid-cols-3 items-center gap-3">
                    {/* Função + Nome - role prominent, name below. Dot indicates status before name */}
                    <div className="col-span-2">
                      <h3 className="text-base font-semibold text-text truncate">
                        {STAFF_ROLE_LABELS[staff.staff_role]}
                      </h3>
                      <p className={`text-sm ${isUnassigned ? 'text-text-muted italic' : 'text-text-secondary'} truncate`}>
                        {isUnassigned ? (
                          <span className="inline-flex items-center">
                            <HelpCircle className="w-4 h-4 text-text-muted mr-2" aria-hidden />
                            Não atribuído
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            {staff.confirmed ? (
                              <span aria-label="Confirmado" className="mr-2"><CheckCircle className="w-4 h-4 text-success" aria-hidden /></span>
                            ) : (
                              <span aria-label="Aguardando" className="mr-2"><AlertTriangle className="w-4 h-4 text-warning" aria-hidden /></span>
                            )}
                            {displayName || 'Nome não informado'}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="col-span-1 flex items-center gap-2 justify-end">
                      {/* Botão para confirmar atribuição */}
                      {
                        (() => {
                          // Mostrar Confirmar sempre que houver um nome atribuído (com ou sem profile)
                          const showConfirm = !isUnassigned && !staff.confirmed
                              return showConfirm ? (
                              <Button
                                onClick={() => handleConfirmStaff(staff.id)}
                                variant="confirm"
                                className="w-10 h-10 rounded-full"
                                aria-label={`Confirmar ${displayName}`}
                                disabled={loading}
                              >
                                <CheckCircle className="w-6 h-6" />
                              </Button>
                          ) : null
                        })()
                      }

                      {/* Edit / Assign dynamic button */}
                      {
                        (() => {
                          const isAssigned = !isUnassigned // Tem nome (com ou sem profile)

                          if (!isAssigned) {
                            return (
                              <Button
                                onClick={() => openAssignModalFor({ eventStaffId: staff.id, role: staff.staff_role })}
                                className="text-success hover:text-success/80 hover:bg-success/10 px-3 py-1 rounded-md border border-border"
                                aria-label={`Atribuir pessoa à função ${STAFF_ROLE_LABELS[staff.staff_role]}`}
                              >
                                Atribuir
                              </Button>
                            )
                          } else {
                            return (
                              <Button
                                onClick={() => openAssignModalFor({ eventStaffId: staff.id, role: staff.staff_role, personName: displayName, profileId: staff.profile_id, hourlyRate: staff.hourly_rate })}
                                variant="edit"
                                className="w-10 h-10 rounded-full"
                                aria-label={`Editar atribuição de ${displayName}`}
                              >
                                <Edit className="w-6 h-6" />
                              </Button>
                            )
                          }
                        })()
                      }

                     <Button
                        variant="destructive"
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="w-10 h-10 rounded-full"
                        aria-label={`Remover ${displayName || 'função'}`}
                        disabled={loading}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>

                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para adicionar função */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-text">Adicionar Nova Função</CardTitle>
            </CardHeader>
            <CardContent size="md">
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Selecione uma função para adicionar à equipe do evento:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(STAFF_ROLE_LABELS).map(([role, label]) => (
                    <Button
                      key={role}
                      variant="outline"
                      onClick={() => handleAddRole(role as StaffRole)}
                      className="justify-start"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddRole(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para atribuir pessoa */}
      {showAssignPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-text">Atribuir Pessoa à Função</CardTitle>
            </CardHeader>
            <CardContent size="md">
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Função: <strong>{STAFF_ROLE_LABELS[selectedRoleForAssignment as keyof typeof STAFF_ROLE_LABELS]}</strong>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">Nome da Pessoa</label>
                    <input
                      type="text"
                      placeholder="Digite o nome..."
                      className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text placeholder-text-muted`}
                      value={assignPersonName}
                      onChange={(e) => setAssignPersonName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">Profile ID (opcional - apenas para usuários registrados)</label>
                    <input
                      type="text"
                      placeholder="ID do perfil (se houver)"
                      className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text placeholder-text-muted`}
                      value={assignProfileId}
                      onChange={(e) => setAssignProfileId(e.target.value)}
                    />
                    <p className="text-xs text-text-muted mt-1">Deixe em branco para pessoas sem conta no sistema</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">Valor por Hora (opcional)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text placeholder-text-muted`}
                      value={assignHourlyRate ?? ''}
                      onChange={(e) => setAssignHourlyRate(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAssignPerson(false)
                      setSelectedEventStaffId('')
                      setSelectedRoleForAssignment('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      const profileId = assignProfileId?.trim() || ''
                      const personName = assignPersonName?.trim()
                      const hourlyRate = assignHourlyRate

                      if (!personName) {
                        alert('Por favor, digite o nome da pessoa.')
                        return
                      }

                      // Use assignPersonToRoleWithName que cria perfil temporário se necessário
                      const success = await assignPersonToRoleWithName(
                        selectedEventStaffId,
                        personName,
                        profileId || undefined,
                        hourlyRate
                      )

                      if (success) {
                        await loadEventData()
                        setShowAssignPerson(false)
                        setSelectedEventStaffId('')
                        setSelectedRoleForAssignment('')
                        setAssignPersonName('')
                        setAssignProfileId('')
                        setAssignHourlyRate(undefined)
                      }
                    }}
                  >
                    <Plus className="w-5 h-5 mr-1" /> Atribuir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text">Templates de Equipe</CardTitle>
        </CardHeader>
        <CardContent size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_STAFF_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`border border-border rounded-lg cursor-pointer p-4 ${getCardItemClasses()}`}
                onClick={() => applyTemplate(template.id)}
              >
                <h3 className="font-semibold text-text">{template.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                <div className="mt-3">
                  <p className="text-xs text-text-muted">
                    {template.default_roles.length} funções
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="rounded-lg">
            <CardContent size="md">
              <div className="animate-spin w-8 h-8 border-4 border-border border-t-transparent rounded-full mx-auto"></div>
                <div className="animate-spin w-8 h-8 border-4 border-border border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-center text-text">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-danger text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
