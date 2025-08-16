import { useState, useEffect, type ButtonHTMLAttributes } from 'react'
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
import { pageTokens } from '../components/ui/theme'
// Update the import path if the card components are located elsewhere, for example:
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
// Or, if you do not have these components, create them or install a UI library (like shadcn/ui or Material UI) and import from there.

// badge removed — status is shown as a colored dot next to the person name

// Local fallback Button component for when ../components/ui/button is not available.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}
const Button = ({ children, variant = 'default', size = 'md', className = '', ...props }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium'
  const variantClasses: Record<string, string> = {
    default: 'px-3 py-2 bg-blue-600 text-white hover:bg-blue-700',
    outline: 'px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'px-2 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
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
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
  <div className={`max-w-6xl mx-auto ${pageTokens.cardGap.sm}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipe Fascinar</h1>
          <p className="text-gray-600 mt-2">{event.title}</p>
          <p className="text-sm text-gray-500">
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
          <Card className="w-full resume-card">
            <CardContent size="md">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{summary.total_roles} {summary.total_roles === 1 ? 'profissional' : 'profissionais'}</p>
                  <p className="text-xs text-gray-500 mt-0">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipe e Funções
            </span>
            {/* show Add button inside card header when there is at least one member */}
            {filteredStaff.length > 0 && (
              <Button onClick={() => setShowAddRole(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Função
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent size="md">
          {filteredStaff.length === 0 ? (
            <div className="text-center text-gray-500">
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
                  className="border rounded-lg py-2 px-3"
                >
                  <div className="grid grid-cols-3 items-center gap-3">
                    {/* Função + Nome - role prominent, name below. Dot indicates status before name */}
                    <div className="col-span-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {STAFF_ROLE_LABELS[staff.staff_role]}
                      </h3>
                      <p className={`text-sm ${isUnassigned ? 'text-gray-500 italic' : 'text-gray-700'} truncate`}>
                        {isUnassigned ? (
                          <span className="inline-flex items-center">
                            <HelpCircle className="w-4 h-4 text-gray-400 mr-2" aria-hidden />
                            Não atribuído
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            {staff.confirmed ? (
                              <span aria-label="Confirmado" className="mr-2"><CheckCircle className="w-4 h-4 text-green-500" aria-hidden /></span>
                            ) : (
                              <span aria-label="Aguardando" className="mr-2"><AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden /></span>
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
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700"
                              aria-label={`Confirmar ${displayName}`}
                              disabled={loading}
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
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
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1 rounded-md border border-green-200"
                                aria-label={`Atribuir pessoa à função ${STAFF_ROLE_LABELS[staff.staff_role]}`}
                              >
                                Atribuir
                              </Button>
                            )
                          } else {
                            return (
                              <Button
                                onClick={() => openAssignModalFor({ eventStaffId: staff.id, role: staff.staff_role, personName: displayName, profileId: staff.profile_id, hourlyRate: staff.hourly_rate })}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                aria-label={`Editar atribuição de ${displayName}`}
                              >
                                <Edit className="w-4 h-4 text-gray-700" />
                              </Button>
                            )
                          }
                        })()
                      }

                     <Button
                        variant="outline"
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
                        aria-label={`Remover ${displayName || 'função'}`}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
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
              <CardTitle>Adicionar Nova Função</CardTitle>
            </CardHeader>
            <CardContent size="md">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
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
              <CardTitle>Atribuir Pessoa à Função</CardTitle>
            </CardHeader>
            <CardContent size="md">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Função: <strong>{STAFF_ROLE_LABELS[selectedRoleForAssignment as keyof typeof STAFF_ROLE_LABELS]}</strong>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Pessoa</label>
                    <input
                      type="text"
                      placeholder="Digite o nome..."
                      className="w-full px-3 py-2 border rounded-md"
                      value={assignPersonName}
                      onChange={(e) => setAssignPersonName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile ID (opcional - apenas para usuários registrados)</label>
                    <input
                      type="text"
                      placeholder="ID do perfil (se houver)"
                      className="w-full px-3 py-2 border rounded-md"
                      value={assignProfileId}
                      onChange={(e) => setAssignProfileId(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Deixe em branco para pessoas sem conta no sistema</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor por Hora (opcional)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-md"
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
                    <Plus className="w-4 h-4 mr-1" /> Atribuir
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
          <CardTitle>Templates de Equipe</CardTitle>
        </CardHeader>
        <CardContent size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_STAFF_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => applyTemplate(template.id)}
              >
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
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
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-center">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
