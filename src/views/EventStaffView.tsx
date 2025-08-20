import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useStaff } from '../hooks/useStaff'
import { 
  STAFF_ROLE_LABELS,
  type StaffRole,
  type EventStaffDetailed,
  type EventStaffSummary,
  getRoleRank
} from '../types/staff'
import { DEFAULT_STAFF_TEMPLATES } from '../config/staffTemplates'
import { summarizeTemplate, formatRolesByType } from '../utils/staffUtils'
import { pageTokens, getCardItemClasses } from '../components/ui/theme'
import { useProfiles } from '../hooks/useProfiles'
// Update the import path if the card components are located elsewhere, for example:
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/Modal'
// Or, if you do not have these components, create them or install a UI library (like shadcn/ui or Material UI) and import from there.

// badge removed — status is shown as a colored dot next to the person name

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
  getEventStaffById,
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
  const [assignArrivalTime, setAssignArrivalTime] = useState<string | undefined>(undefined)
  const [assignNotes, setAssignNotes] = useState<string>('')

  // state for clearing all roles
  const [clearingAll, setClearingAll] = useState(false)

  // profiles helper
  const { getOrganizers, loading: organizersLoading, error: organizersError } = useProfiles()
  const [organizers, setOrganizers] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      loadEventData()
    }
    // warm fetch organizers
    ;(async () => {
      try {
        const o = await getOrganizers()
        setOrganizers(o || [])
      } catch (e) {
        console.warn('Erro ao buscar organizers:', e)
        setOrganizers([])
      }
    })()
  }, [id])

  // Prevent body scroll when modals are open
  useEffect(() => {
    const locked = showAssignPerson || showAddRole
    if (locked) {
      // simple approach: hide overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    // cleanup on unmount
    return () => { document.body.style.overflow = '' }
  }, [showAssignPerson, showAddRole])

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

  const openAssignModalFor = async (opts: { eventStaffId: string, role: StaffRole, personName?: string, profileId?: string }) => {
    setSelectedEventStaffId(opts.eventStaffId)
    setSelectedRoleForAssignment(opts.role)
    setAssignPersonName(opts.personName || '')
    setAssignProfileId(opts.profileId || '')
    // Pre-fill arrival time: 2 hours before event time when event has a time component.
    const computeDefaultArrival = (): string | undefined => {
      if (!event?.event_date) return undefined
      const raw = String(event.event_date)
      // If the stored date string doesn't include a time (e.g. 'YYYY-MM-DD'), leave undefined
      if (!raw.includes('T')) return undefined
      const dt = new Date(raw)
      if (isNaN(dt.getTime())) return undefined
      dt.setHours(dt.getHours() - 2)
      const hh = String(dt.getHours()).padStart(2, '0')
      const mm = String(dt.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    }
    // Prefer arrival_time from the existing eventStaff record when editing.
    let existing = eventStaff.find((s:any) => s.id === opts.eventStaffId)
    // If we don't have the record locally (stale state), fetch the single record to ensure freshest data
    if (!existing) {
      try {
        const fresh = await getEventStaffById(opts.eventStaffId)
        existing = fresh || undefined
        // If still not found, fall back to reloading full event data
        if (!existing) {
          await loadEventData()
          existing = eventStaff.find((s:any) => s.id === opts.eventStaffId)
        }
      } catch (e) {
        // keep going — we'll compute defaults below
        console.warn('Falha ao buscar registro de staff por id:', e)
      }
    }
    if (existing && existing.arrival_time) {
      // DB may return 'HH:MM:SS' — normalize to 'HH:MM'
      const parts = String(existing.arrival_time).split(':')
      const hhmm = parts.length >= 2 ? `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}` : String(existing.arrival_time)
      setAssignArrivalTime(hhmm)
      setAssignNotes(existing.notes || '')
    } else {
      // Only set default when DB has no arrival_time
      setAssignArrivalTime(computeDefaultArrival())
      setAssignNotes('')
    }
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

  const handleClearAllRoles = async () => {
    if (!id) return
    if (!eventStaff || eventStaff.length === 0) return
    if (!confirm('Remover todas as funções deste evento? Esta ação não pode ser desfeita.')) return
    setClearingAll(true)
    try {
      const ops = eventStaff.map(s => removeStaffFromEvent(s.id).catch(e => ({ ok: false, error: String(e) })))
      const results = await Promise.all(ops)
      const anyFailed = results.some(r => r === false || (r && (r as any).ok === false))
      if (anyFailed) {
        console.error('handleClearAllRoles results:', results)
        alert('Algumas remoções falharam. Verifique o console para detalhes.')
      }
      await loadEventData()
    } catch (err) {
      console.error('Erro ao limpar funções:', err)
      alert('Erro ao limpar funções. Verifique o console para mais detalhes.')
    } finally {
      setClearingAll(false)
    }
  }

  const applyTemplate = async (templateId: string) => {
    if (!id) return

    const template = DEFAULT_STAFF_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    try {
  console.log('applyTemplate start', { templateId, eventId: id, template })
  // Fetch the freshest staff list for the event to reconcile counts
      const current = await getEventStaff(id)
      const byRole: Record<string, EventStaffDetailed[]> = {}
      for (const s of current) {
        const role = s.staff_role || (s as any).role_name || 'unknown'
        if (!byRole[role]) byRole[role] = []
        byRole[role].push(s)
      }

      const ops: Promise<any>[] = []

      // Handle roles defined in template
      for (const tplRole of template.default_roles) {
        const roleKeyRaw = tplRole.staff_role
        const roleKey = String(roleKeyRaw).trim()
        const desired = tplRole.quantity || 0
        const existing = byRole[roleKey] || []
        const currentCount = existing.length

  // Debug log: show counts and planned actions
  console.log('applyTemplate: role', { role: roleKey, desired, currentCount })

        if (currentCount < desired) {
          const toAdd = desired - currentCount
          console.log('applyTemplate: will add', { role: roleKey, toAdd })
          for (let i = 0; i < toAdd; i++) {
            ops.push(addRoleToEvent(id, roleKey as StaffRole))
          }
        } else if (currentCount > desired) {
          // remove excess roles: prefer unconfirmed ones
          let removable = existing.filter(r => !r.confirmed)
          // if not enough unconfirmed, include confirmed as last resort (avoid if possible)
          if (removable.length < (currentCount - desired)) {
            const needed = (currentCount - desired) - removable.length
            const confirmedOnes = existing.filter(r => r.confirmed).slice(0, needed)
            removable = removable.concat(confirmedOnes)
          }
          // remove the oldest removable entries first
          removable = removable.sort((a,b) => {
            const ta = new Date(a.assigned_at || '').getTime() || 0
            const tb = new Date(b.assigned_at || '').getTime() || 0
            return ta - tb
          }).slice(0, currentCount - desired)
          console.log('applyTemplate: will remove', { role: roleKey, removeIds: removable.map(r => r.id) })
          for (const rem of removable) {
            ops.push(removeStaffFromEvent(rem.id))
          }
        }
      }

      // Handle roles present in current but not in template -> remove extras (prefer unconfirmed)
      const templateRoles = new Set(template.default_roles.map(r => r.staff_role))
      for (const [role, list] of Object.entries(byRole)) {
        if (!templateRoles.has(role as any)) {
          // remove all unconfirmed instances for roles not in template
          const toRemove = list.filter(r => !r.confirmed)
          for (const rem of toRemove) ops.push(removeStaffFromEvent(rem.id))
        }
      }

  const results = await Promise.all(ops.map(p => p.catch(e => ({ ok: false, error: String(e) }))))
  console.log('applyTemplate ops results', results)
  await loadEventData()
    } catch (err) {
  console.error('Erro ao aplicar template:', err)
    }
  }

  // Sort staff by configured hierarchy. Filter first if a specific role is selected.
  const filteredStaff = (selectedRole === 'all' 
    ? eventStaff 
    : eventStaff.filter(s => s.staff_role === selectedRole))
    .slice()
    .sort((a, b) => getRoleRank(a.staff_role) - getRoleRank(b.staff_role))

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
  <div className={`${pageTokens.headerPadding}`}>
    <div className="flex items-center justify-between">
  <h1 className="text-h3 md:text-h1 font-bold text-text">Equipe Fascinar</h1>
      <Button
        variant="outline"
        onClick={() => navigate(`/eventos/${id}`)}
      >
        Voltar ao Evento
      </Button>
    </div>
    <div className="mt-4 space-y-1">
  <p className="text-h4 md:text-h3 text-text font-bold truncate">{event?.title}</p>
      <p className="text-small text-text-muted truncate">
        {(() => {
          try {
            const parts: string[] = []
            const raw = event?.event_date
            if (raw) {
              const d = new Date(raw)
              if (!isNaN(d.getTime())) {
                parts.push(d.toLocaleDateString('pt-BR'))
                const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                if (time) parts.push(time)
              }
            }
            if (event?.location) parts.push(String(event.location))
            return parts.join(' • ')
          } catch {
            return ''
          }
        })()}
      </p>
    </div>
  </div>
  {/* Resumo */}
  {summary && (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <Card className="w-full resume-card" strong tone="emphasized">
        <CardContent size="md">
          <div className="flex items-center">
            <Users className="icon-2xl text-icon-3 mr-3" />
            <div>
              <p className="text-h3 font-bold text-text">{summary.total_roles} {summary.total_roles === 1 ? 'profissional' : 'profissionais'}</p>
              <p className="text-xs text-text-muted mt-0">
                {formatRolesByType(summary.roles_by_type)}
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
              <Users className="icon-sm text-icon-3" />
              Equipe e Funções
            </span>
            {/* show Add button inside card header when there is at least one member */}
            {filteredStaff.length > 0 && (
              <div className="hidden md:flex">
                <Button onClick={() => setShowAddRole(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Função
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
  <CardContent size="md">
          {filteredStaff.length === 0 ? (
            <div className="text-center text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-icon-3" />
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
                            <HelpCircle className="w-4 h-4 text-text-muted mr-1.5" aria-hidden />
                            Não atribuído
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            {staff.confirmed ? (
                              <span aria-label="Confirmado" className="mr-1.5"><CheckCircle className="w-4 h-4 text-success" aria-hidden /></span>
                            ) : (
                              <span aria-label="Aguardando" className="mr-1.5"><AlertTriangle className="w-4 h-4 text-warning" aria-hidden /></span>
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
                                size="icon"
                                className="rounded-full"
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
                                variant="outline"
                                className="text-success hover:text-success/80 hover:bg-success/10"
                                aria-label={`Atribuir pessoa à função ${STAFF_ROLE_LABELS[staff.staff_role]}`}
                              >
                                Atribuir
                              </Button>
                            )
                          } else {
                            return (
                              <Button
                                onClick={() => openAssignModalFor({ eventStaffId: staff.id, role: staff.staff_role, personName: displayName, profileId: staff.profile_id })}
                                variant="edit"
                                size="icon"
                                className="rounded-full"
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
                        size="icon"
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="rounded-full"
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
          {/* Mobile full-width add button */}
          {filteredStaff.length > 0 && (
            <div className="mt-4 md:hidden flex gap-2">
              <Button
                onClick={() => setShowAddRole(true)}
                className="flex-1 justify-center py-3"
              >
                <Plus className="w-5 h-5 inline mr-2" /> Adicionar Função
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllRoles}
                disabled={clearingAll}
                className="flex-1 justify-center py-3 bg-danger bg-gradient-button"
              >
                {clearingAll ? 'Limpando...' : (<><Trash2 className="w-5 h-5 inline mr-2" /> Limpar</>)}
              </Button>
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
      <Modal open={showAssignPerson} onClose={() => setShowAssignPerson(false)}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-text">Atribuir Pessoa à Função</CardTitle>
          </CardHeader>
          <CardContent size="md">
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Função: <strong className="text-icon-3 text-lg font-semibold">{STAFF_ROLE_LABELS[selectedRoleForAssignment as keyof typeof STAFF_ROLE_LABELS]}</strong>
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="assignPersonName" className="block text-sm font-medium mb-2 text-text">Nome da Pessoa</label>
                  <input
                    id="assignPersonName"
                    type="text"
                    placeholder="Digite o nome..."
                    className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text placeholder-text-muted`}
                    value={assignPersonName}
                    onChange={(e) => {
                      const v = e.target.value
                      // If user types a free-text name, clear any selected profile assignment
                      if (assignProfileId) setAssignProfileId('')
                      setAssignPersonName(v)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-text">Escolha um dos usuários disponíveis</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto mb-2">
                    {organizers && organizers.length > 0 ? (
                      // Sort organizers: available (not disabled) first, then by role rank (null max_role = highest capability), then by name
                      organizers
                        .filter((p:any) => p && p.id)
                        .slice()
                        .map((p:any) => {
                          const assignedIds = new Set(eventStaff.map(s => s.profile_id).filter(Boolean))
                          const alreadyAssigned = assignedIds.has(p.id)
                          const insufficientRole = p.max_role ? getRoleRank(p.max_role) > getRoleRank(selectedRoleForAssignment as StaffRole) : false
                          const disabled = alreadyAssigned || insufficientRole
                          return { profile: p, disabled, alreadyAssigned }
                        })
                        .sort((a: any, b: any) => {
                          // available first
                          if (a.disabled !== b.disabled) return a.disabled ? 1 : -1
                          // rank: null max_role => treat as highest capability (rank -1)
                          const rankA = a.profile.max_role ? getRoleRank(a.profile.max_role) : -1
                          const rankB = b.profile.max_role ? getRoleRank(b.profile.max_role) : -1
                          if (rankA !== rankB) return rankA - rankB
                          // fallback by name
                          return (a.profile.full_name || '').localeCompare(b.profile.full_name || '')
                        })
                        .map((item:any) => {
                          const p = item.profile
                          const alreadyAssigned = item.alreadyAssigned
                          const disabled = item.disabled
                          
                          // smaller, compact button using theme colors
                          return (
                            <div key={p.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  // if disabled do nothing
                                  if (disabled) return
                                  // if clicking the already selected profile, deselect and clear assignment
                                  if (assignProfileId === p.id) {
                                    setAssignProfileId('')
                                    setAssignPersonName('')
                                    return
                                  }
                                  setAssignProfileId(p.id)
                                  setAssignPersonName(p.full_name || '')
                                }}
                                disabled={disabled}
                                className={
                                  // styles: unavailable -> muted; available -> primary with hover; selected -> primary-light with thicker border
                                  `w-full text-left px-2 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20 ` +
                                  (disabled
                                    ? 'bg-transparent text-text-muted border border-border cursor-not-allowed'
                                    : (assignProfileId === p.id
                                        ? 'bg-primary-light bg-gradient-button text-white border-2 border-primary-light shadow-sm'
                                        : 'bg-primary bg-gradient-button text-white border border-primary hover:bg-primary-hover')
                                  )
                                }
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className={`truncate ${alreadyAssigned ? 'opacity-70' : ''}`}>{p.full_name}</div>
                                  {alreadyAssigned ? <div className="text-xs opacity-70 ml-2">●</div> : null}
                                </div>
                              </button>
                            </div>
                          )
                        })
                    ) : (
                      <div className="col-span-2 p-3 text-sm text-text-muted">
                        {organizersLoading ? (
                          <div>Carregando usuários...</div>
                        ) : (
                          <div>
                            <div>Nenhum organizer ou admin disponível para exibir.</div>
                            {organizersError ? (
                              <div className="mt-1 text-xxs text-text-muted">Erro: {organizersError}</div>
                            ) : (
                              <div className="mt-1 text-xxs text-text-muted">Possíveis causas: RLS/permissões no banco, usuário não autenticado, ou não existem organizers/admins no DB.</div>
                            )}
                            <div className="mt-2">
                              <Button variant="outline" onClick={async () => { const o = await getOrganizers(); setOrganizers(o || []) }}>Recarregar</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Profile ID input removed per request — keep hidden input to preserve selected profile id in state */}
                <input type="hidden" id="assignProfileId" value={assignProfileId} />
                <div>
                  <label htmlFor="assignArrivalTime" className="block text-sm font-medium mb-2 text-text">Horário de chegada</label>
                  <input
                    id="assignArrivalTime"
                    type="time"
                    className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text`}
                    value={assignArrivalTime ?? ''}
                    onChange={(e) => setAssignArrivalTime(e.target.value || undefined)}
                  />
                  <div className="mt-3">
                    <label htmlFor="assignNotes" className="block text-sm font-medium mb-2 text-text">Observações e instruções</label>
                    <textarea
                      id="assignNotes"
                      rows={4}
                      className={`w-full px-3 py-2 border border-border rounded-md ${getCardItemClasses()} text-text`}
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignPerson(false)
                    setSelectedEventStaffId('')
                    setSelectedRoleForAssignment('')
                    setAssignArrivalTime(undefined)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    const profileId = assignProfileId?.trim() || ''
                    const personName = assignPersonName?.trim()
                    const arrivalTime = assignArrivalTime

                    if (!personName && !profileId) {
                      alert('Por favor, escolha um usuário ou digite o nome da pessoa.')
                      return
                    }

                    const success = await assignPersonToRoleWithName(
                      selectedEventStaffId,
                      personName || '',
                      profileId || undefined,
                      arrivalTime || undefined,
                      assignNotes || undefined
                    )

                    if (success) {
                      await loadEventData()
                      setShowAssignPerson(false)
                      setSelectedEventStaffId('')
                      setSelectedRoleForAssignment('')
                      setAssignPersonName('')
                      setAssignProfileId('')
                      setAssignArrivalTime(undefined)
                      setAssignNotes('')
                    }
                  }}
                >
                  <Plus className="w-5 h-5 mr-1" /> Atribuir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      {/* Templates Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text">Templates de Equipe</CardTitle>
        </CardHeader>
        <CardContent size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_STAFF_TEMPLATES.map((template) => {
              const { total, breakdown } = summarizeTemplate(template)
              return (
                <div
                  key={template.id}
                  className={`border border-border rounded-lg cursor-pointer p-3 ${getCardItemClasses()}`}
                  onClick={() => applyTemplate(template.id)}
                >
                  <h3 className="font-semibold border-border bg-surface px-2 rounded text-info">{template.name}</h3>
                  {/* <p className="text-sm text-text-secondary mt-1">{template.description}</p> */}
                  <div className="mt-3">
                    <p className="text-sm text-text">{total} {total === 1 ? 'profissional' : 'profissionais'}</p>
                    <p className="text-xs text-text-muted mt-1">{breakdown}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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
