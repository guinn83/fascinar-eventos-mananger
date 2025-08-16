import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Erro</h2>
          <p className="text-slate-600 mb-6">{error}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="fas fa-calendar-times text-6xl text-slate-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Evento não encontrado</h2>
          <p className="text-slate-600 mb-6">O evento que você está procurando não existe ou foi removido.</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header com imagem circular */}
        <div className="text-center space-y-4 mb-8">
          {/* Imagem circular do evento */}
          <div className="relative inline-block">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{event.title}</h1>
            {/* Status badge abaixo do título */}
            <div className="mb-3">
              {(() => {
                const { days, status } = getDaysUntilEvent(event.event_date)
                const statusText = event.status === 'cancelled' ? 'Cancelado' : 
                                 event.status === 'completed' ? 'Realizado' : 
                                 status === 'today' ? 'HOJE' :
                                 status === 'future' ? (days === 1 ? 'Amanhã' : `Faltam ${days} dias`) :
                                 'Realizado'
                const statusColor = event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  status === 'today' ? 'bg-orange-100 text-orange-800' :
                                  status === 'future' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-600'
                
                return (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium shadow-sm ${statusColor}`}>
                    {statusText}
                  </span>
                )
              })()}
            </div>
            {event.description && (
              <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">{event.description}</p>
            )}
          </div>
          
          {/* Botão voltar movido para canto superior esquerdo */}
          <button
            onClick={() => navigate('/eventos')}
            className="absolute top-6 left-6 p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Voltar aos eventos"
          >
            <i className="fas fa-arrow-left text-slate-600"></i>
          </button>
        </div>

        {/* Event Details Card */}
        <Card className="w-full">
          <CardContent size="lg">
            <div className="space-y-6">
              {/* Event Description */}
              {event.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-align-left text-primary"></i>
                    Descrição Detalhada
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Date, Location and Attendees */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-calendar text-primary"></i>
                    Data e Horário: <span className="font-normal text-slate-700">{formatDate(event.event_date)}</span>
                  </h3>
                  {event.end_date && (
                    <div className="flex items-center gap-3 mt-2">
                      <i className="fas fa-calendar-check w-4 text-slate-500"></i>
                      <span className="text-slate-700">Até: {formatDate(event.end_date)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-primary"></i>
                    Local: <span className="font-normal text-slate-700">{event.location || 'Local não informado'}</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-users text-primary"></i>
                    Número de convidados: <span className="font-normal text-slate-700">{event.attendees}</span>
                  </h3>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Equipe Card (staffCard) */}
        <Card className="w-full staff-card">
          <CardContent size="md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <i className="fas fa-user-tie text-primary"></i>
                Equipe
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-medium">Número de Pessoas</span>
                      <span className="text-2xl font-bold text-purple-800">
                        {event.staff}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/eventos/${event.id}/staff`)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  <i className="fas fa-users"></i>
                  Gerenciar Equipe
                </button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Financial Information Card */}
        <Card className="w-full">
          <CardContent size="md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <i className="fas fa-dollar-sign text-primary"></i>
                Informações Financeiras
              </h3>
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Valor do Evento</span>
                    <span className="text-2xl font-bold text-green-800">
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
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl transition-colors"
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
