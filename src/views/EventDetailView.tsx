import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { useStaff } from '../hooks/useStaff'
import { EventStaffSummary } from '../types/staff'
import { pageTokens } from '../components/ui/theme'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import type { Event } from '../types/event'

// Função para calcular dias até o evento
const getDaysUntilEvent = (eventDate: string): { days: number; status: string } => {
  const today = new Date()
  const event = new Date(eventDate)
  const diffTime = event.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { days: Math.abs(diffDays), status: 'past' }
  } else if (diffDays === 0) {
    return { days: 0, status: 'today' }
  } else {
    return { days: diffDays, status: 'future' }
  }
}

const EventDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getEventStaffSummary } = useStaff()
  const [summary, setSummary] = useState<EventStaffSummary | null>(null)

  useEffect(() => {
    if (id) {
      fetchEvent(id)
    }
  }, [id])

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('events')
        .select(`
          *
        `)
        .eq('id', eventId)
        .single()

      if (error) {
        throw error
      }

      setEvent(data)
      // carregar resumo de staff
      try {
        const s = await getEventStaffSummary(eventId)
        setSummary(s)
      } catch (err) {
        console.warn('Não foi possível carregar resumo de staff:', err)
      }
    } catch (err) {
      console.error('Erro ao buscar evento:', err)
      setError('Erro ao carregar os detalhes do evento')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  
  // Retorna partes separadas para uso específico na UI (Data e Hora separadas)
  const formatDateParts = (dateString: string) => {
    const d = new Date(dateString)
    const datePart = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const timePart = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return { datePart, timePart }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="fas fa-exclamation-triangle text-6xl text-danger mb-4"></i>
          <h2 className="text-2xl font-bold text-text mb-2">Erro</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/eventos')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Voltar aos Eventos
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="fas fa-calendar-times text-6xl text-text-muted mb-4"></i>
          <h2 className="text-2xl font-bold text-text mb-2">Evento não encontrado</h2>
          <p className="text-text-secondary mb-6">O evento que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/eventos')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Voltar aos Eventos
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
  <div className={`max-w-4xl mx-auto bg-background min-h-screen ${pageTokens.cardGap.sm}`}>
        
        {/* Header com imagem circular */}
        <div className="text-center space-y-4 mb-8">
          {/* Imagem circular do evento */}
          <div className="relative inline-block">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-border shadow-lg bg-surface">
              <img
                src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop&auto=format'}
                alt={event.title}
                loading="lazy"
                onError={(e) => { 
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop&auto=format'
                }}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Botão alterar imagem */}
            <button 
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-full text-xs transition-colors shadow-md"
              onClick={() => {/* TODO: implementar upload */}}
              title="Alterar imagem do evento"
            >
              <i className="fas fa-camera"></i>
            </button>
          </div>
          
          {/* Título e descrição centralizados */}
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">{event.title}</h1>
            {/* Status badge abaixo do título */}
            <div className="mb-3">
              {(() => {
                const { days, status } = getDaysUntilEvent(event.event_date)
                const statusText = event.status === 'cancelled' ? 'Cancelado' : 
                                 event.status === 'completed' ? 'Realizado' : 
                                 status === 'today' ? 'HOJE' :
                                 status === 'future' ? (days === 1 ? 'Amanhã' : `Faltam ${days} dias`) :
                                 'Realizado'
                const statusColor = event.status === 'cancelled' ? 'bg-danger/10 text-danger' :
                                  event.status === 'completed' ? 'bg-text-muted/10 text-text-muted' :
                                  status === 'today' ? 'bg-warning/10 text-warning' :
                                  status === 'future' ? 'bg-success/10 text-success' :
                                  'bg-text-muted/10 text-text-muted'
                
                return (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium shadow-sm ${statusColor}`}>
                    {statusText}
                  </span>
                )
              })()}
            </div>
            {event.description && (
              <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">{event.description}</p>
            )}
          </div>
          
          {/* Botão voltar movido para canto superior esquerdo */}
          <button
            onClick={() => navigate('/eventos')}
            className="absolute top-6 left-6 p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Voltar aos eventos"
          >
                    <i className="fas fa-arrow-left text-text-secondary"></i>
          </button>
        </div>

        {/* Event Details Card */}
        <Card className="w-full details-card">
          <CardContent size="md">
              <div className={pageTokens.cardGap.sm}>
              {/* Event Description */}
              {event.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                    <i className="fas fa-align-left text-icon-2"></i>
                    Descrição Detalhada
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Date, Time, Location and Attendees */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                {/* Data */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="w-5 flex items-center justify-center">
                      <i className="fas fa-calendar text-icon-3" aria-hidden></i>
                    </div>
                    <div className="flex-1">
                      {(() => {
                        const { datePart } = formatDateParts(event.event_date)
                        return (
                          <h3 className="text-lg font-semibold text-text">Data: <span className="font-normal text-text-secondary ml-1">{datePart}</span></h3>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Hora */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="w-5 flex items-center justify-center">
                      <i className="fas fa-clock text-icon-3" aria-hidden></i>
                    </div>
                    <div className="flex-1">
                      {(() => {
                        const { timePart } = formatDateParts(event.event_date)
                        return (
                          <h3 className="text-lg font-semibold text-text">Hora: <span className="font-normal text-text-secondary ml-1">{timePart}</span></h3>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="w-5 flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-icon-3" aria-hidden></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text">Local: <span className="font-normal text-text-secondary ml-1">{event.location || 'Local não informado'}</span></h3>
                    </div>
                  </div>
                </div>

                {/* Convidados */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="w-5 flex items-center justify-center">
                      <i className="fas fa-users text-icon-3" aria-hidden></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text">Número de convidados: <span className="font-normal text-text-secondary ml-1">{event.attendees}</span></h3>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Equipe Card (staffCard) - usar layout do resume-card */}
        <Card className="w-full staff-card">
          <CardContent size="md">
              <div className="flex items-center">
              <svg className="w-8 h-8 text-icon-3 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-xl font-bold text-text">{summary ? summary.total_roles : '—'} {summary && summary.total_roles === 1 ? 'profissional' : 'profissionais'}</p>
                <p className="text-xs text-text-muted mt-0">
                  {summary ? Object.entries(summary.roles_by_type).filter(([,c]) => c > 0).map(([role,count]) => `${count} ${role}`).join(', ') : ''}
                </p>
              </div>
            </div>
            
              <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <button
                onClick={() => navigate(`/eventos/${event.id}/staff`)}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <i className="fas fa-users"></i>
                Gerenciar Equipe
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information Card */}
        <Card className="w-full">
          <CardContent size="md">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                <i className="fas fa-dollar-sign text-icon-3"></i>
                Informações Financeiras
              </h3>
              <div>
        <div className="bg-success/10 border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
          <span className="text-success font-medium">Valor do Evento</span>
          <span className="text-2xl font-bold text-success">
                      {formatCurrency(event.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/eventos/${event.id}/editar`)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <i className="fas fa-edit"></i>
            Editar Evento
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover text-text px-6 py-3 rounded-xl transition-colors"
          >
            <i className="fas fa-print"></i>
            Imprimir
          </button>
        </div>

      </div>
    </>
  )
}

export default EventDetailView
