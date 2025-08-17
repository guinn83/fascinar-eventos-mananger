import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useAuthStore } from '../store/authStore'
import { testSupabaseConnection } from '../utils/testConnection'
import { Card, CardContent } from '../components/ui/card'
import { pageTokens } from '../components/ui/theme'
import { canViewAllEvents } from '../types/user'

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

// Função para formatar data e hora
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit' 
  }
  
  // Formato de data reduzido: 24/jan/2026
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toLowerCase().replace('.', '')
  const year = date.getFullYear()
  const compactDate = `${day}/${month}/${year}`
  
  return {
    date: compactDate,
    time: date.toLocaleTimeString('pt-BR', timeOptions)
  }
}

const EventsView: React.FC = () => {
  const { events, loading, error } = useEvents()
  const { getUserRole } = useAuthStore()
  const navigate = useNavigate()
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const userRole = getUserRole()
  const canViewAll = canViewAllEvents(userRole)

  // Otimização: memoizar função de teste de conexão
  const handleTestConnection = useCallback(async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
    } catch (err) {
      setTestResult({ success: false, error: 'Erro ao executar teste', details: err })
    } finally {
      setTesting(false)
    }
  }, [])

  if (loading) {
    return (
      <div className={pageTokens.cardGap.sm}>
        {/* Header */}
    <Card className="w-full bg-surface rounded-3xl border border-border">
          <CardContent size="lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 text-text">Eventos</h1>
                <p className="text-text-secondary mt-2 font-medium">Carregando seus eventos...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent size="md">
                <div className="flex items-start gap-6">
                  <div className="w-32 h-24 bg-surface rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-surface rounded w-1/3"></div>
                    <div className="h-3 bg-surface rounded w-2/3"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-surface rounded w-20"></div>
                      <div className="h-3 bg-surface rounded w-20"></div>
                    </div>
                  </div>
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
        {/* Header */}
  <Card className="w-full bg-surface rounded-3xl border border-border">
          <CardContent size="lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 text-text">Eventos</h1>
                <p className="text-text-secondary mt-2 font-medium">
                  {canViewAll ? `Visualizando todos os eventos (${userRole})` : 'Gerencie seus eventos'}
                </p>
                {/* Indicador de nível de acesso */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    userRole === 'admin' ? 'bg-danger/10 text-danger' : userRole === 'organizer' ? 'bg-info/10 text-info' : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    <i className={`fas ${
                      userRole === 'admin' ? 'fa-crown' 
                      : userRole === 'organizer' ? 'fa-users-cog'
                      : 'fa-user'
                    } mr-1`}></i>
                    {userRole === 'admin' ? 'Administrador' 
                     : userRole === 'organizer' ? 'Organizador'
                     : 'Cliente'}
                  </span>
                  {canViewAll && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <i className="fas fa-globe mr-1"></i>
                      Acesso Total
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {error?.includes('tabela "events" não foi criada') ? (
          <Card className="w-full">
            <CardContent size="lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <i className="fas fa-database text-warning text-xl"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h4 text-warning mb-2">
                    Configuração do Banco de Dados Necessária
                  </h3>
                  <p className="text-text-secondary mb-4">
                    A tabela "events" ainda não foi criada no seu projeto Supabase. 
                    É necessário executar o script SQL para criar a estrutura do banco de dados.
                  </p>
                  <div className="bg-warning/5 rounded-xl px-3 py-2 mb-4">
                    <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                      <i className="fas fa-list-ol"></i>
                      Passos para Configuração:
                    </h4>
                    <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                      <li>Acesse o dashboard do Supabase</li>
                      <li>Vá para o <strong>SQL Editor</strong></li>
                      <li>Execute o script do arquivo <code>sql/create_events_table.sql</code></li>
                      <li>Recarregue esta página</li>
                    </ol>
                  </div>
                    <div className="flex gap-3">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-warning hover:bg-warning/90 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                    >
                      <i className="fas fa-redo"></i>
                      Recarregar Página
                    </button>
                    <button 
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                    >
                      <i className={`fas ${testing ? 'fa-spinner fa-spin' : 'fa-stethoscope'}`}></i>
                      {testing ? 'Testando...' : 'Diagnosticar'}
                    </button>
                    <a 
                      href="https://app.supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-surface border border-warning/40 hover:bg-surface-hover text-warning font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Abrir Supabase
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full">
            <CardContent size="md">
              <div className="flex items-start gap-3 text-danger mb-4">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="flex-1">
                  <h3 className="font-semibold">Erro ao carregar eventos</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="bg-danger hover:bg-danger-hover disabled:bg-danger/50 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <i className={`fas ${testing ? 'fa-spinner fa-spin' : 'fa-stethoscope'}`}></i>
                  {testing ? 'Diagnosticando...' : 'Diagnosticar Problema'}
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-surface text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Recarregar
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados do Teste de Diagnóstico */}
        {testResult && (
          <Card className="w-full">
            <CardContent size="md">
              <div className="flex items-start gap-3">
                <i className={`fas ${
                  testResult.success 
                    ? 'fa-check-circle text-success' 
                    : 'fa-times-circle text-danger'
                } text-xl`}></i>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${
                    testResult.success ? 'text-success' : 'text-danger'
                  }`}>
                    {testResult.success ? '✅ Diagnóstico Completo' : '❌ Problema Identificado'}
                  </h3>
                  <p className={`mb-3 ${
                    testResult.success ? 'text-success' : 'text-danger'
                  }`}>
                    {testResult.message || testResult.error}
                  </p>
                  {testResult.user && (
                    <div className="bg-surface rounded-lg px-3 py-2 mb-3 border border-border">
                      <h4 className="font-semibold text-sm text-text mb-1">Informações da Sessão:</h4>
                      <p className="text-sm text-text-secondary">Email: {testResult.user.email}</p>
                      <p className="text-sm text-text-secondary">User ID: {testResult.user.id}</p>
                    </div>
                  )}
                  {testResult.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Ver detalhes técnicos
                      </summary>
                      <pre className="mt-2 text-xs bg-surface px-3 py-2 rounded border overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  <button 
                    onClick={() => setTestResult(null)}
                    className="mt-3 text-sm text-text-secondary hover:text-text underline"
                  >
                    Fechar diagnóstico
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 overflow-visible">
      {/* Header */}
      <Card className="w-full">
        <CardContent size="lg">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-h2 font-bold text-text">
                Eventos
              </h1>
              <p className="text-text-secondary mt-2 font-medium">
                Gerencie todos os seus eventos
              </p>
            </div>
              <button className="bg-primary text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full">
              <i className="fas fa-plus mr-2"></i>
              Novo Evento
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Events List - Layout Horizontal */}
      <div className="space-y-4 pb-6 w-full overflow-visible">
        {events.length === 0 ? (
          /* Empty state */
            <div className="bg-surface backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center shadow-lg mb-6">
                <i className="fas fa-calendar-plus text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-text mb-2">Nenhum evento encontrado</h3>
              <p className="text-text-secondary mb-6">Comece criando seu primeiro evento</p>
              <button className="bg-primary text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <i className="fas fa-plus mr-2"></i>
                Criar Primeiro Evento
              </button>
            </div>
          </div>
        ) : (
          events.map((event) => {
            const { days, status } = getDaysUntilEvent(event.event_date)
            const { date, time } = formatDateTime(event.event_date)
            
            return (
              <Card
                key={event.id}
                className="cursor-pointer"
                size="md"
                padding="px-3 py-2"
              >
                <div
                  onClick={() => navigate(`/eventos/${event.id}`)}
                  className="w-full relative"
                >
                  {/* Status no canto superior direito - mobile */}
                  <div className="absolute top-0 right-1 md:hidden z-10">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-small ${
                      event.status === 'cancelled'
                        ? 'bg-danger/10 text-danger'
                        : event.status === 'completed'
                        ? 'bg-danger/10 text-danger'
                        : status === 'today'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {event.status === 'cancelled' ? 'Cancelado' :
                        event.status === 'completed' ? 'Realizado' :
                        status === 'today' ? 'HOJE' :
                        status === 'future' ? (days === 1 ? 'Amanhã' : `${days} dias`) :
                        'Realizado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Imagem do Evento */}
                    <div className="flex-shrink-0">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-20 h-20 object-cover rounded-full border-4 border-border/20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border-4 border-border">
                          <i className="fas fa-calendar-alt text-primary text-xl"></i>
                        </div>
                      )}
                    </div>

                    {/* Informações do evento */}
                    <div className="flex-1 min-w-0 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-20 md:pr-4">
                          {/* Título */}
                          <h3 className="text-lg font-bold text-text mb-0 truncate">
                            {event.title}
                          </h3>

                          {/* Data e hora (sem contagem de dias) */}
                          <div className="flex items-center text-text-secondary text-sm mb-0">
                            <i className="fas fa-calendar mr-2"></i>
                            <span className="mr-2">{date}</span>
                            <i className="fas fa-clock mr-2"></i>
                            <span className="mr-2">{time}</span>
                          </div>

                          {/* Localização */}
                          <div className="flex items-center text-text-secondary text-sm">
                            <i className="fas fa-map-marker-alt mr-2 flex-shrink-0"></i>
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Status no canto direito - desktop */}
                        <div className="hidden md:flex flex-col items-end ml-4">
                          <span className={`px-1 py-1 rounded-full text-xs font-medium ${
                            event.status === 'cancelled' ? 'bg-danger/10 text-danger' : event.status === 'completed' ? 'bg-surface text-text-secondary' : status === 'today' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
                          }`}>
                            {event.status === 'cancelled' ? 'Cancelado' :
                             event.status === 'completed' ? 'Realizado' :
                             status === 'today' ? 'HOJE' :
                             status === 'future' ? (days === 1 ? 'Amanhã' : `Faltam ${days} dias`) :
                             'Realizado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ícone de seta */}
                    <div className="flex-shrink-0">
                      <i className="fas fa-chevron-right text-text-muted text-lg"></i>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}

        {/* Card para Adicionar Novo Evento */}
        {events.length > 0 && (
          <Card className="group bg-surface backdrop-blur-sm hover:bg-surface-hover rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.01] border-2 border-dashed border-border hover:border-primary cursor-pointer overflow-hidden">
            <CardContent size="md">
              <div className="flex items-center justify-center gap-6">
                <div className="w-16 h-16 bg-surface group-hover:bg-primary rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
                  <i className="fas fa-plus text-primary text-xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-text-secondary group-hover:text-primary transition-colors mb-1">
                    Criar Novo Evento
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Clique aqui para adicionar um novo evento ao seu calendário
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default EventsView
