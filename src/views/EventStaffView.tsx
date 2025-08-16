import React, { useState, useEffect, type ButtonHTMLAttributes } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useStaff } from '../hooks/useStaff'
import { 
  STAFF_ROLE_LABELS, 
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  DEFAULT_STAFF_TEMPLATES,
  type StaffRole,
  type EventStaffDetailed,
  type StaffSuggestion,
  type EventStaffSummary
} from '../types/staff'
// Update the import path if the card components are located elsewhere, for example:
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
// Or, if you do not have these components, create them or install a UI library (like shadcn/ui or Material UI) and import from there.

// Local Badge fallback when ../components/ui/badge is not available.
type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline'
}
const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-yellow-100 text-yellow-800',
    outline: 'border border-gray-200 bg-white text-gray-700'
  }
  const classes = `${base} ${variantClasses[variant] ?? ''} ${className}`
  return <span {...props} className={classes}>{children}</span>
}

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
  Clock, 
  Search,
  Filter,
  AlertCircle
} from 'lucide-react'

export function EventStaffView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEvent } = useEvents()
  const {
    getEventStaff,
    getStaffSuggestions,
    assignStaffToEvent,
    confirmStaffAssignment,
    removeStaffFromEvent,
    getEventStaffSummary,
    loading,
    error,
    getAvailableStaff
  } = useStaff()

  const [event, setEvent] = useState<any>(null)
  const [eventStaff, setEventStaff] = useState<EventStaffDetailed[]>([])
  const [staffSuggestions, setStaffSuggestions] = useState<StaffSuggestion[]>([])
  const [summary, setSummary] = useState<EventStaffSummary | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsFallback, setSuggestionsFallback] = useState(false)
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'all'>('all')

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

  const loadSuggestions = async () => {
    if (!id) return
    try {
      setSuggestionsFallback(false)
      const suggestions = await getStaffSuggestions(id)
      if (!suggestions || suggestions.length === 0) {
        console.info('Nenhuma sugestão retornada para o evento', id)
        // try fallback to available staff for the event date
        if (event?.event_date) {
          const available = await getAvailableStaff(event.event_date, selectedRole === 'all' ? undefined : (selectedRole as StaffRole))
          if (available && available.length > 0) {
            setStaffSuggestions(available)
            setSuggestionsFallback(true)
            setShowSuggestions(true)
            return
          }
        }
      }

      setStaffSuggestions(suggestions)
      setShowSuggestions(true)
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err)
      // try fallback to available staff
      try {
        if (event?.event_date) {
          const available = await getAvailableStaff(event.event_date, selectedRole === 'all' ? undefined : (selectedRole as StaffRole))
          setStaffSuggestions(available)
          setSuggestionsFallback(true)
        } else {
          setStaffSuggestions([])
        }
      } catch (inner) {
        console.error('Fallback também falhou:', inner)
        setStaffSuggestions([])
      }
      setShowSuggestions(true)
    }
  }

  const handleAssignStaff = async (
    profileId: string, 
    staffRole: StaffRole, 
    hourlyRate?: number
  ) => {
    if (!id) return

    try {
      const success = await assignStaffToEvent(id, profileId, staffRole, hourlyRate)
      if (success) {
        await loadEventData()
        setShowSuggestions(false)
      }
    } catch (err) {
      console.error('Erro ao atribuir staff:', err)
    }
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

  const filteredSuggestions = selectedRole === 'all'
    ? staffSuggestions
    : staffSuggestions.filter(s => s.staff_role === selectedRole)

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipe</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{summary.total_roles} {summary.total_roles === 1 ? 'profissional' : 'profissionais'}</p>
                  {/* breakdown small text */}
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.entries(summary.roles_by_type)
                      .filter(([,count]) => count > 0)
                      .map(([role, count]) => `${count} ${STAFF_ROLE_LABELS[role as keyof typeof STAFF_ROLE_LABELS]}`)
                      .join(', ')}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent size="md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">{summary.confirmed_staff}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <div className="flex-1 flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{summary.pending_confirmation}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* cost summary removed by request - preserved in DB if needed later */}
        </div>
      )}

      {/* Filtros */}
      <Card>
  <CardContent size="md">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              title="Filtrar por função"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as StaffRole | 'all')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas as Funções</option>
              {Object.entries(STAFF_ROLE_LABELS).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipe Alocada
            </span>
            {/* show Add button inside card header when there is at least one member */}
            {filteredStaff.length > 0 && (
              <Button onClick={loadSuggestions}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Membro
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent size="md">
          {filteredStaff.length === 0 ? (
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro da equipe alocado ainda.</p>
              <div className="mt-4">
                <Button onClick={loadSuggestions}>Adicionar Primeiro Membro</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
                {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">{staff.staff_name || 'Nome não informado'}</h3>
                        <p className="text-sm text-gray-600">{STAFF_ROLE_LABELS[staff.staff_role]}</p>
                      </div>
                      <Badge
                        variant={staff.confirmed ? 'default' : 'secondary'}
                        className={staff.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {staff.confirmed ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{staff.hours_planned}h planejadas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!staff.confirmed && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmStaff(staff.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {loading ? '...' : 'Confirmar'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveStaff(staff.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={loading}
                    >
                      {loading ? '...' : 'Remover'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões de Staff */}
      {showSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Sugestões de Staff
                {suggestionsFallback && (
                  <span className="ml-2 text-xs text-slate-500">(fonte: disponibilidade)</span>
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(false)}
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent size="md">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sugestão disponível para esta função.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => (
                  <div
                    key={`${suggestion.profile_id}-${suggestion.staff_role}`}
                    className="flex items-center justify-between border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{suggestion.full_name}</h3>
                          <p className="text-sm text-gray-600">{STAFF_ROLE_LABELS[suggestion.staff_role]}</p>
                        </div>
                        <Badge className={AVAILABILITY_STATUS_COLORS[suggestion.availability_status]}>
                          {AVAILABILITY_STATUS_LABELS[suggestion.availability_status]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Nível {suggestion.experience_level}/5</span>
                        <span>Score: {suggestion.priority_score}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAssignStaff(
                        suggestion.profile_id,
                        suggestion.staff_role,
                        suggestion.hourly_rate
                      )}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Atribuir
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
