import React, { useState, useEffect } from 'react'
import { useEventAvailability, EventAvailability } from '../hooks/useEventAvailability'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/Modal'
import { pageTokens } from '../components/ui/theme'
import { Icon } from '../components/ui/icons'

interface AdminEventAvailability {
  event: {
    id: string
    title: string
    event_date: string
    end_date?: string
    location?: string
    description?: string
  }
  availabilities: EventAvailability[]
  stats: {
    total: number
    available: number
    unavailable: number
    pending: number
    scheduled: number
  }
}

interface FilterState {
  event: string
  status: 'all' | 'available' | 'unavailable' | 'pending' | 'scheduled'
  dateRange: string
  searchTerm: string
}

export const AdminAvailabilityView: React.FC = () => {
  const { getUpcomingEventsWithAvailability, loading, error } = useEventAvailability()
  
  const [events, setEvents] = useState<AdminEventAvailability[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AdminEventAvailability | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  
  // Filtros
  const [filters, setFilters] = useState<FilterState>({
    event: 'all',
    status: 'all',
    dateRange: 'next30',
    searchTerm: ''
  })

  // Carregar eventos com disponibilidades
  useEffect(() => {
    loadEventsWithAvailabilities()
  }, [filters])

  const loadEventsWithAvailabilities = async () => {
    try {
      // Buscar próximos 50 eventos com suas disponibilidades
      const result = await getUpcomingEventsWithAvailability(50, 0)
      
      // Agrupar por evento e calcular estatísticas
      const eventsMap = new Map<string, AdminEventAvailability>()
      
      result.events.forEach((eventAvailability: EventAvailability) => {
        const eventId = eventAvailability.event.id
        
        if (!eventsMap.has(eventId)) {
          eventsMap.set(eventId, {
            event: eventAvailability.event,
            availabilities: [],
            stats: {
              total: 0,
              available: 0,
              unavailable: 0,
              pending: 0,
              scheduled: 0
            }
          })
        }
        
        const eventData = eventsMap.get(eventId)!
        eventData.availabilities.push(eventAvailability)
        
        // Calcular estatísticas
        eventData.stats.total++
        
        if (eventAvailability.is_scheduled) {
          eventData.stats.scheduled++
        } else if (eventAvailability.is_available === true) {
          eventData.stats.available++
        } else if (eventAvailability.is_available === false) {
          eventData.stats.unavailable++
        } else {
          eventData.stats.pending++
        }
      })
      
      setEvents(Array.from(eventsMap.values()))
    } catch (err) {
      console.error('Erro ao carregar eventos admin:', err)
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
    
    return { dayName, dayMonth: `${day}/${month}`, time }
  }

  const formatTimeRange = (event: any) => {
    const start = formatEventDateTime(event.event_date).time
    if (event.end_date) {
      const end = formatEventDateTime(event.end_date).time
      return `${start}-${end}`
    }
    return start
  }

  const getStatusColor = (status: 'available' | 'unavailable' | 'pending' | 'scheduled') => {
    // Use semantic tokens for text color and neutral surface for background
    switch (status) {
      case 'available': return 'text-success bg-surface-2'
      case 'unavailable': return 'text-danger bg-surface-2'
      case 'pending': return 'text-warning bg-surface-2'
      case 'scheduled': return 'text-info bg-surface-2'
      default: return 'text-text-secondary bg-surface-2'
    }
  }

  const filteredEvents = events.filter(event => {
    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesTitle = event.event.title.toLowerCase().includes(searchLower)
      const matchesLocation = event.event.location?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesLocation) return false
    }
    
    // Filtro por status
    if (filters.status !== 'all') {
      const hasStatus = event.availabilities.some(avail => {
        switch (filters.status) {
          case 'available': return avail.is_available === true && !avail.is_scheduled
          case 'unavailable': return avail.is_available === false && !avail.is_scheduled
          case 'pending': return avail.is_available === null || avail.is_available === undefined
          case 'scheduled': return avail.is_scheduled === true
          default: return true
        }
      })
      if (!hasStatus) return false
    }
    
    return true
  })

  if (loading && events.length === 0) {
    return (
      <div className={pageTokens.cardGap.sm}>
        <Card className="w-full bg-surface rounded-3xl border border-border animate-pulse">
          <CardContent size="lg">
            <div className="h-8 bg-surface-secondary rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-surface-secondary rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={pageTokens.cardGap.sm}>
        <Card className="w-full bg-error-background border border-error-border rounded-3xl">
          <CardContent size="md">
            <div className="flex items-center gap-3">
              <Icon name="AlertCircle" className="w-5 h-5 text-error-text flex-shrink-0" />
              <div>
                <h3 className="text-error-text font-medium">Erro ao carregar disponibilidades</h3>
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
      {/* Header Admin */}
      <Card className="w-full bg-surface rounded-3xl border border-border" strong>
        <CardContent size="lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-text flex items-center gap-3">
                <Icon name="Users" className="w-8 h-8 text-primary" />
                Disponibilidades da Equipe
              </h1>
              <p className="text-text-secondary mt-2 font-medium">
                Gerencie escalação e visualize disponibilidades por evento
              </p>
            </div>
            
            {/* Ações rápidas */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Icon name="Download" className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="default" size="sm">
                <Icon name="Zap" className="w-4 h-4 mr-2" />
                Auto Escalar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="w-full bg-surface rounded-2xl border border-border">
        <CardContent size="md">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar eventos por nome ou local..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-3 py-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Filtrar por status de disponibilidade"
              >
                <option value="all">Todos Status</option>
                <option value="pending">Pendentes</option>
                <option value="available">Disponíveis</option>
                <option value="unavailable">Indisponíveis</option>
                <option value="scheduled">Escalados</option>
              </select>
              
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Filtrar por período de datas"
              >
                <option value="next30">Próximos 30 dias</option>
                <option value="next60">Próximos 60 dias</option>
                <option value="next90">Próximos 90 dias</option>
              </select>
            </div>
          </div>
          
          {/* Resumo */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-text-secondary">
                📊 {filteredEvents.length} eventos encontrados
              </span>
              <span className="text-success">
                ✅ {filteredEvents.reduce((acc, e) => acc + e.stats.available, 0)} disponibilidades
              </span>
              <span className="text-warning">
                ⏳ {filteredEvents.reduce((acc, e) => acc + e.stats.pending, 0)} pendentes
              </span>
              <span className="text-info">
                🔒 {filteredEvents.reduce((acc, e) => acc + e.stats.scheduled, 0)} escalados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {filteredEvents.map((adminEvent) => {
          const { dayName, dayMonth } = formatEventDateTime(adminEvent.event.event_date)
          const timeRange = formatTimeRange(adminEvent.event)
          const isExpanded = expandedEvent === adminEvent.event.id
          
          return (
            <Card key={adminEvent.event.id} className="bg-surface rounded-2xl border border-border hover:shadow-md transition-all duration-200">
              <CardContent size="md">
                {/* Header do evento */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedEvent(isExpanded ? null : adminEvent.event.id)}
                >
                  <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-text">{adminEvent.event.title}</h3>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('available')}`}>
                                  {adminEvent.stats.available} disp.
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('pending')}`}>
                                  {adminEvent.stats.pending} pend.
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('scheduled')}`}>
                                  {adminEvent.stats.scheduled} esc.
                                </span>
                              </div>
                            </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" className="w-4 h-4" />
                        {dayName}, {dayMonth}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" className="w-4 h-4" />
                        {timeRange}
                      </span>
                      {adminEvent.event.location && (
                        <span className="flex items-center gap-1">
                          <Icon name="MapPin" className="w-4 h-4" />
                          {adminEvent.event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setSelectedEvent(adminEvent)
                        setIsDetailModalOpen(true)
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Icon name="Eye" className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                    
                    {isExpanded ? (
                      <Icon name="ChevronUp" className="w-5 h-5 text-text-secondary" />
                    ) : (
                      <Icon name="ChevronDown" className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>
                </div>

                {/* Lista expandida de disponibilidades */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {adminEvent.availabilities.map((availability) => {
                        let statusInfo = { icon: <Icon name="HelpCircle" className="w-4 h-4" />, text: 'Pendente', color: 'text-warning' }
                        
                        if (availability.is_scheduled) {
                          statusInfo = { icon: <Icon name="UserCheck" className="w-4 h-4" />, text: 'Escalado', color: 'text-info' }
                        } else if (availability.is_available === true) {
                          statusInfo = { icon: <Icon name="UserCheck" className="w-4 h-4" />, text: 'Disponível', color: 'text-success' }
                        } else if (availability.is_available === false) {
                          statusInfo = { icon: <Icon name="UserX" className="w-4 h-4" />, text: 'Indisponível', color: 'text-danger' }
                        }
                        
                        return (
                          <div key={availability.id} className="p-3 bg-surface-2 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-text text-sm">
                                {availability.staff_id} {/* Aqui deveria buscar o nome do staff */}
                              </span>
                              <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span className="text-xs">{statusInfo.text}</span>
                              </div>
                            </div>
                            
                            {availability.available_from || availability.available_until ? (
                              <div className="text-xs text-text-secondary mb-1">
                                🕐 {availability.available_from && availability.available_until 
                                  ? `${availability.available_from}-${availability.available_until}`
                                  : availability.available_from 
                                  ? `A partir ${availability.available_from}`
                                  : `Até ${availability.available_until}`
                                }
                              </div>
                            ) : availability.is_available && (
                              <div className="text-xs text-text-secondary mb-1">🕐 Dia todo</div>
                            )}
                            
                            {availability.notes && (
                              <div className="text-xs text-text-secondary truncate">
                                💬 {availability.notes}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Ações para o evento */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm">
                        <Icon name="Download" className="w-4 h-4 mr-1" />
                        Exportar Lista
                      </Button>
                      <Button variant="default" size="sm">
                        <Icon name="Zap" className="w-4 h-4 mr-1" />
                        Auto Escalar Evento
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado vazio */}
      {!loading && filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-lg font-bold text-text mb-2">Nenhum evento encontrado</h3>
            <p className="text-text-secondary">Ajuste os filtros para ver mais resultados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes */}
      {selectedEvent && (
        <Modal
          open={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedEvent(null)
          }}
        >
          <div className="bg-surface rounded-3xl p-6 max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <Icon name="Eye" className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Disponibilidades - {selectedEvent.event.title}</h2>
            </div>
            
            {/* Info do evento */}
            <div className="bg-surface-secondary rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Data:</span>
                  <p className="font-medium text-text">
                    {formatEventDateTime(selectedEvent.event.event_date).dayName}, {formatEventDateTime(selectedEvent.event.event_date).dayMonth}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Horário:</span>
                  <p className="font-medium text-text">{formatTimeRange(selectedEvent.event)}</p>
                </div>
                {selectedEvent.event.location && (
                  <div className="col-span-2">
                    <span className="text-text-secondary">Local:</span>
                    <p className="font-medium text-text">{selectedEvent.event.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface-2 rounded-lg">
                <div className="text-2xl font-bold text-success">{selectedEvent.stats.available}</div>
                <div className="text-xs text-text-secondary">Disponíveis</div>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-lg">
                <div className="text-2xl font-bold text-danger">{selectedEvent.stats.unavailable}</div>
                <div className="text-xs text-text-secondary">Indisponíveis</div>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-lg">
                <div className="text-2xl font-bold text-warning">{selectedEvent.stats.pending}</div>
                <div className="text-xs text-text-secondary">Pendentes</div>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-lg">
                <div className="text-2xl font-bold text-info">{selectedEvent.stats.scheduled}</div>
                <div className="text-xs text-text-secondary">Escalados</div>
              </div>
            </div>

            {/* Lista detalhada */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedEvent.availabilities.map((availability) => {
                let statusInfo = { icon: <Icon name="HelpCircle" className="w-4 h-4" />, text: 'Pendente', bgColor: 'bg-surface-2', textColor: 'text-warning' }
                
                if (availability.is_scheduled) {
                  statusInfo = { icon: <Icon name="UserCheck" className="w-4 h-4" />, text: 'Escalado', bgColor: 'bg-surface-2', textColor: 'text-info' }
                } else if (availability.is_available === true) {
                  statusInfo = { icon: <Icon name="UserCheck" className="w-4 h-4" />, text: 'Disponível', bgColor: 'bg-surface-2', textColor: 'text-success' }
                } else if (availability.is_available === false) {
                  statusInfo = { icon: <Icon name="UserX" className="w-4 h-4" />, text: 'Indisponível', bgColor: 'bg-surface-2', textColor: 'text-danger' }
                }
                
                return (
                  <div key={availability.id} className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-text">
                          Staff #{availability.staff_id.slice(-8)} {/* Simplificado - deveria buscar nome */}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {availability.available_from || availability.available_until ? (
                            <>🕐 {availability.available_from && availability.available_until 
                              ? `${availability.available_from}-${availability.available_until}`
                              : availability.available_from 
                              ? `A partir ${availability.available_from}`
                              : `Até ${availability.available_until}`
                            }</>
                          ) : availability.is_available && '🕐 Dia todo'}
                        </div>
                        {availability.notes && (
                          <div className="text-sm text-text-secondary mt-1">💬 {availability.notes}</div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 ${statusInfo.textColor}`}>
                        {statusInfo.icon}
                        <span className="text-sm font-medium">{statusInfo.text}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedEvent(null)
                }}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              <Button variant="default" className="flex-1">
                <Icon name="Zap" className="w-4 h-4 mr-2" />
                Escalar Automaticamente
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
