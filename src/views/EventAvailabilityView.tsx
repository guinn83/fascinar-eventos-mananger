import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useEventAvailability, EventAvailability } from '../hooks/useEventAvailability'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/Modal'
import { pageTokens, cardTokens, uiTokens } from '../components/ui/theme'
import { Icon } from '../components/ui/icons'

interface EventGroupByMonth {
  monthKey: string
  monthName: string
  events: EventAvailability[]
}

// Estados visuais de disponibilidade com melhorias da Fase 2
const getAvailabilityStatus = (availability?: EventAvailability) => {
  if (!availability) {
    return {
      color: 'border border-border bg-surface hover:border-border',
    icon: <Icon name="HelpCircle" className="w-4 h-4" />,
      text: 'NÃO DEFINIDO',
      textColor: 'text-text-secondary',
      badgeColor: 'bg-surface text-text-secondary',
      canEdit: true,
      actionText: 'Definir Disponibilidade',
    actionIcon: <Icon name="Edit" className="w-4 h-4" />,
      priority: 'high' // Precisa definir urgentemente
    }
  }

  if (availability.is_scheduled) {
    return {
      color: 'border border-border bg-surface-2 hover:border-border',
  icon: <Icon name="Lock" className="w-4 h-4" />,
      text: 'ESCALADO',
      textColor: 'text-text-secondary',
      badgeColor: 'bg-surface-2 text-text-secondary',
      canEdit: false,
      actionText: 'Contactar Admin',
    actionIcon: <Icon name="MessageCircle" className="w-4 h-4" />,
      priority: 'locked' // Não pode alterar
    }
  }

  if (availability.is_available) {
    return {
      color: 'border border-border bg-surface-2 hover:border-border',
  icon: <Icon name="CheckCircle" className="w-4 h-4" />,
      text: 'DISPONÍVEL',
      textColor: 'text-text',
      badgeColor: 'bg-surface text-text',
      canEdit: true,
      actionText: 'Alterar Disponibilidade',
  actionIcon: <Icon name="Edit" className="w-4 h-4" />,
      priority: 'normal' // Já definido
    }
  }

  return {
  color: 'border border-border bg-surface-2 hover:border-border',
  icon: <Icon name="XCircle" className="w-4 h-4" />,
    text: 'INDISPONÍVEL',
    textColor: 'text-text-secondary',
    badgeColor: 'bg-surface text-text-secondary',
    canEdit: true,
    actionText: 'Alterar Disponibilidade',
  actionIcon: <Icon name="Edit" className="w-4 h-4" />,
    priority: 'normal' // Já definido
  }
}

const formatEventDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  
  const dayName = weekdays[date.getDay()]
  const day = date.getDate().toString().padStart(2, '0')
  const month = months[date.getMonth()]
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  
  return {
    dayName,
    dayMonth: `${day}/${month}`,
    time
  }
}

const formatTimeRange = (event: any) => {
  const start = formatEventDateTime(event.event_date).time
  if (event.end_date) {
    const end = formatEventDateTime(event.end_date).time
    return `${start}-${end}`
  }
  return start
}

export const EventAvailabilityView: React.FC = () => {
  const {
    loading: availabilityLoading,
    error: availabilityError,
    getUpcomingEventsWithAvailability,
    setEventAvailability
  } = useEventAvailability()

  const [eventAvailabilities, setEventAvailabilities] = useState<EventAvailability[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<EventAvailability | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable' | null>(null)
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableUntil, setAvailableUntil] = useState('')
  const [notes, setNotes] = useState('')
  
  // Estados para animações e UX da Fase 2
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set())
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'normal' | 'locked'>('all')

  const loading = availabilityLoading
  const error = availabilityError

  // Carregar eventos iniciais
  useEffect(() => {
    loadInitialEvents()
  }, [])

  const loadInitialEvents = async () => {
    try {
      const result = await getUpcomingEventsWithAvailability(12, 0)
      setEventAvailabilities(result.events || [])
      setHasMore(result.hasMore || false)
      setCurrentOffset(12)
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
      setEventAvailabilities([])
      setHasMore(false)
    }
  }

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore || loading) return
    
    try {
      const result = await getUpcomingEventsWithAvailability(12, currentOffset)
      setEventAvailabilities(prev => [...prev, ...result.events])
      setHasMore(result.hasMore)
      setCurrentOffset(prev => prev + 12)
    } catch (err) {
      console.error('Erro ao carregar mais eventos:', err)
    }
  }, [hasMore, loading, currentOffset, getUpcomingEventsWithAvailability])

  // Scroll infinito
  const observer = useRef<IntersectionObserver>()
  const lastEventElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreEvents()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadMoreEvents])

  // Agrupar eventos por mês com filtro de prioridade
  const groupEventsByMonth = (): EventGroupByMonth[] => {
    const groups: { [key: string]: EventGroupByMonth } = {}
    
    // Filtrar por prioridade se necessário
    const filteredEvents = eventAvailabilities.filter(eventAvailability => {
      if (filterPriority === 'all') return true
      const status = getAvailabilityStatus(eventAvailability)
      return status.priority === filterPriority
    })
    
    filteredEvents.forEach((eventAvailability: EventAvailability) => {
      const date = new Date(eventAvailability.event.event_date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      
      if (!groups[monthKey]) {
        const monthNames = [
          'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
          'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
        ]
        const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        
        groups[monthKey] = {
          monthKey,
          monthName,
          events: []
        }
      }
      
      groups[monthKey].events.push(eventAvailability)
    })
    
    Object.values(groups).forEach(group => {
      group.events.sort((a: EventAvailability, b: EventAvailability) => 
        new Date(a.event.event_date).getTime() - new Date(b.event.event_date).getTime()
      )
    })
    
    return Object.values(groups).sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  }

  const handleCardClick = (eventAvailability: EventAvailability) => {
    const status = getAvailabilityStatus(eventAvailability)
    if (!status.canEdit) return // Não pode editar se escalado
    
    setSelectedEvent(eventAvailability)
    setAvailabilityStatus(eventAvailability.is_available ? 'available' : 'unavailable')
    setAvailableFrom(eventAvailability.available_from || '')
    setAvailableUntil(eventAvailability.available_until || '')
    setNotes(eventAvailability.notes || '')
    setIsModalOpen(true)
  }

  const handleSaveAvailability = async () => {
    if (!selectedEvent || availabilityStatus === null) return false

    setIsSubmitting(true)
    
    try {
      await setEventAvailability({
        event_id: selectedEvent.event.id,
        is_available: availabilityStatus === 'available',
        available_from: availableFrom || undefined,
        available_until: availableUntil || undefined,
        notes: notes || undefined
      })
      
      // Adicionar animação de sucesso
      const eventKey = `${selectedEvent.event.id}-${selectedEvent.id || 'new'}`
      setRecentlyUpdated(prev => new Set(prev.add(eventKey)))
      
      // Remover destaque após 3 segundos
      setTimeout(() => {
        setRecentlyUpdated(prev => {
          const newSet = new Set(prev)
          newSet.delete(eventKey)
          return newSet
        })
      }, 3000)
      
      // Recarregar dados
      await loadInitialEvents()
      setIsModalOpen(false)
      setSelectedEvent(null)
      return true
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const groupedEvents = groupEventsByMonth()

  if (loading && eventAvailabilities.length === 0) {
    return (
      <div className={pageTokens.cardGap.sm}>
        <Card className="w-full bg-surface rounded-3xl border border-border" strong>
          <CardContent size="lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h4 text-text">📅 Minha Disponibilidade</h2>
                <p className="text-text-secondary mt-1 text-small">Carregando eventos…</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse min-h-[180px]">
              <CardContent size="md" className="p-3">
                <div className="space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4"></div>
                  <div className="h-3 bg-surface rounded w-1/2"></div>
                  <div className="h-12 bg-surface rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={pageTokens.cardGap.sm}>
        <Card className="w-full bg-surface rounded-3xl border border-border" strong>
          <CardContent size="lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 text-text">📅 Minha Disponibilidade para Eventos</h1>
                <p className="text-text-secondary mt-2 font-medium">Erro ao carregar</p>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card className="w-full bg-error-background border border-error-border rounded-3xl">
          <CardContent size="md">
            <div className="flex items-center gap-3">
        <Icon name="AlertCircle" className="w-5 h-5 text-error-text flex-shrink-0" />
              <div>
                <h3 className="text-error-text font-medium">Erro ao carregar eventos</h3>
                <p className="text-error-text-secondary text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={pageTokens.cardGap.sm}>
      {/* Header compacto com filtros */}
      <Card className="w-full bg-surface rounded-2xl border border-border" strong>
        <CardContent size="lg" className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className={cardTokens.title}>📅 Minha Disponibilidade</h2>
              {/* <p className="text-text-secondary mt-1 text-small">Gerencie sua disponibilidade para os próximos eventos</p> */}

              {/* Contadores por status (compactos) */}
              <div className="flex gap-3 mt-2 text-sm">
                {(() => {
                  const pendingCount = eventAvailabilities.filter(e => !e.is_available && e.is_available !== false).length
                  const availableCount = eventAvailabilities.filter(e => e.is_available === true).length
                  const unavailableCount = eventAvailabilities.filter(e => e.is_available === false).length
                  const scheduledCount = eventAvailabilities.filter(e => e.is_scheduled).length
                  
                  return (
                    <>
                      <span className="text-text-secondary">⭕ {pendingCount} pendentes</span>
                      <span className="text-success">✅ {availableCount} disponível</span>
                          <span className="text-danger">❌ {unavailableCount} ocupado</span>
                          <span className="text-info">🔒 {scheduledCount} escalado</span>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3">
              <Icon name="Calendar" className="w-6 h-6 text-icon-2" />
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterPriority('all')}
                  variant={filterPriority === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  onClick={() => setFilterPriority('high')}
                  variant={filterPriority === 'high' ? 'default' : 'outline'}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button
                  onClick={() => setFilterPriority('locked')}
                  variant={filterPriority === 'locked' ? 'default' : 'outline'}
                  size="sm"
                >
                  Escalados
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de eventos agrupados por mês */}
      {groupedEvents.length > 0 && (
        <div className="space-y-8">
          {groupedEvents.map((group, groupIndex) => (
            <div key={group.monthKey}>
              {/* Header do mês */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text border-b-2 border-border/20 pb-2">
                  📅 {group.monthName}
                </h2>
              </div>

              {/* Grid responsivo de eventos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.events.map((eventAvailability: EventAvailability, eventIndex: number) => {
                  const isLastGroup = groupIndex === groupedEvents.length - 1
                  const isLastEvent = eventIndex === group.events.length - 1
                  const isLastOverall = isLastGroup && isLastEvent
                  
                  const status = getAvailabilityStatus(eventAvailability)
                  const { dayName, dayMonth } = formatEventDateTime(eventAvailability.event.event_date)
                  const timeRange = formatTimeRange(eventAvailability.event)
                  const eventKey = `${eventAvailability.event.id}-${eventAvailability.id || 'new'}`
                  const isRecentlyUpdated = recentlyUpdated.has(eventKey)
                  
                  return (
                      <div
                        key={eventKey}
                        ref={isLastOverall ? lastEventElementRef : null}
                        onClick={() => handleCardClick(eventAvailability)}
                        className={`cursor-pointer transition-all duration-300 ${!status.canEdit ? 'cursor-not-allowed' : ''}`}
                      >
                        <Card 
                            className={`
                              min-h-[160px] border transition-all duration-200 
                              ${status.color} 
                              ${!status.canEdit ? 'opacity-80' : 'hover:shadow-md'} 
                              ${isRecentlyUpdated ? 'ring-2 ring-success/40 shadow-md' : ''}
                              ${status.priority === 'high' ? 'ring-1 ring-warning/30' : ''}
                            `}
                          >
                          <CardContent size="md" className="h-full flex flex-col p-3">
                            {/* Header com status badge compacto */}
                            <div className="flex justify-between items-center mb-2 gap-2">
                              <h3 className="text-body font-semibold text-text truncate flex-1 mr-2">
                                {eventAvailability.event.title}
                              </h3>
                              <div className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 ${status.badgeColor}`}>
                                {status.icon}
                                <span className="hidden sm:inline">{status.text}</span>
                              </div>
                            </div>

                            {/* Data e horário (compacto) */}
                            <div className="mb-2 text-sm text-text-secondary space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="Calendar" className="w-4 h-4" />
                                <span className="text-small">{dayName}, {dayMonth}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="Clock" className="w-4 h-4" />
                                <span className="text-small">{timeRange}</span>
                              </div>
                              {eventAvailability.event.location && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Icon name="MapPin" className="w-4 h-4" />
                                  <span className="truncate text-small">{eventAvailability.event.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Área de disponibilidade compacta */}
                            <div className="mt-auto">
                              <div className="border-t pt-2">
                                <div className={`flex items-center gap-2 mb-2 ${status.textColor}`}>
                                  {status.icon}
                                  <span className="font-semibold text-sm">{status.text}</span>
                                  {isRecentlyUpdated && (
                                    <span className="animate-pulse text-success text-xs">✨</span>
                                  )}
                                </div>
                              
                                {/* Horário específico se definido */}
                                {eventAvailability.available_from || eventAvailability.available_until ? (
                                  <div className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                                      <Icon name="Clock" className="w-3 h-3" />
                                    <span className="text-small">
                                      {eventAvailability.available_from && eventAvailability.available_until 
                                        ? `${eventAvailability.available_from}-${eventAvailability.available_until}`
                                        : eventAvailability.available_from 
                                        ? `A partir ${eventAvailability.available_from}`
                                        : `Até ${eventAvailability.available_until}`
                                      }
                                    </span>
                                  </div>
                                ) : eventAvailability.is_available ? (
                                  <div className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                                      <Icon name="Clock" className="w-3 h-3" />
                                    <span className="text-small">Dia todo</span>
                                  </div>
                                ) : null}

                                {/* Notas se houver (compact) */}
                                {eventAvailability.notes && (
                                  <div className="text-xs text-text-secondary mb-2 p-2 bg-surface-secondary rounded-md">
                                    <div className="flex items-start gap-1">
                                      <Icon name="MessageCircle" className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-2 text-small">{eventAvailability.notes}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Botão de ação compacto */}
                                <Button 
                                  variant={status.canEdit ? "outline" : "ghost"}
                                  size="sm" 
                                  className={`w-full transition-all duration-150 text-xs py-2 ${
                                    status.priority === 'high' ? 'border-border text-warning bg-surface-2' : ''
                                  }`}
                                  disabled={!status.canEdit}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    {status.actionIcon}
                                    <span className="text-xs">{status.actionText}</span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading do scroll infinito */}
      {loading && eventAvailabilities.length > 0 && (
      <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-border"></div>
            <span className="text-sm">Carregando mais eventos...</span>
          </div>
        </div>
      )}

      {/* Indicador fim da lista */}
      {!hasMore && eventAvailabilities.length > 0 && (
        <div className="text-center py-8 text-text-secondary">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-sm">Você chegou ao final da lista!</p>
        </div>
      )}

      {/* Estado vazio */}
      {!loading && eventAvailabilities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="text-lg font-bold text-text mb-2">Nenhum evento encontrado</h3>
            <p className="text-text-secondary">Não há eventos programados para os próximos meses.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de disponibilidade melhorado da Fase 2 */}
      {selectedEvent && (
        <Modal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEvent(null)
          }}
        >
          <div className="bg-surface rounded-3xl p-6 max-w-md mx-auto space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <Icon name="Edit" className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Definir Disponibilidade</h2>
            </div>
            
            {/* Info do evento melhorada */}
            <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-text">{selectedEvent.event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Icon name="Calendar" className="w-4 h-4" />
                <span>
                  {formatEventDateTime(selectedEvent.event.event_date).dayName}, {formatEventDateTime(selectedEvent.event.event_date).dayMonth}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Icon name="Clock" className="w-4 h-4" />
                <span>{formatTimeRange(selectedEvent.event)}</span>
              </div>
              {selectedEvent.event.location && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Icon name="MapPin" className="w-4 h-4" />
                  <span className="truncate">{selectedEvent.event.location}</span>
                </div>
              )}
            </div>

            {/* Status de disponibilidade melhorado */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">Status:</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setAvailabilityStatus('available')}
                  variant={availabilityStatus === 'available' ? 'confirm' : 'outline'}
                  className={`flex-1 h-12 transition-all duration-200 ${
                    availabilityStatus === 'available' ? 'scale-105 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="w-4 h-4" />
                    <span>Disponível</span>
                  </div>
                </Button>
                <Button
                  onClick={() => setAvailabilityStatus('unavailable')}
                  variant={availabilityStatus === 'unavailable' ? 'destructive' : 'outline'}
                  className={`flex-1 h-12 transition-all duration-200 ${
                    availabilityStatus === 'unavailable' ? 'scale-105 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="XCircle" className="w-4 h-4" />
                    <span>Ocupado</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Horários específicos com validação */}
            {availabilityStatus === 'available' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-text mb-3">Horário (opcional):</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Das:</label>
                      <input
                        type="time"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        title="Horário de início da disponibilidade"
                        placeholder="00:00"
                        className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text ${uiTokens.focusRing} transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Até:</label>
                      <input
                        type="time"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        title="Horário de fim da disponibilidade"
                        placeholder="23:59"
                        className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text ${uiTokens.focusRing} transition-colors`}
                      />
                    </div>
                  </div>
                  
                  {/* Validação de horário */}
                  {availableFrom && availableUntil && availableFrom >= availableUntil && (
                    <div className="text-xs text-danger flex items-center gap-1">
                          <Icon name="AlertCircle" className="w-3 h-3" />
                      <span>Horário de início deve ser anterior ao fim</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-text-secondary">💡 Deixe em branco para disponibilidade o dia todo</p>
                </div>
              </div>
            )}

            {/* Observações melhoradas */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Observações (opcional):</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre sua disponibilidade..."
                className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary resize-none ${uiTokens.focusRing} transition-colors`}
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-text-secondary mt-1 text-right">
                {notes.length}/200 caracteres
              </div>
            </div>

            {/* Botões de ação melhorados */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedEvent(null)
                }}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAvailability}
                variant="default"
                className="flex-1"
                disabled={
                  !availabilityStatus || 
                  isSubmitting ||
                  (availableFrom && availableUntil && availableFrom >= availableUntil) ||
                  false
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-border"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
