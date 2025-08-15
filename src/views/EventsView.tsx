import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useAuthStore } from '../store/authStore'
import { testSupabaseConnection } from '../utils/testConnection'
import { Card, CardContent } from '../components/ui/card'
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Eventos
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                Carregando seus eventos...
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="flex items-start gap-6">
                <div className="w-32 h-24 bg-gray-300 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Eventos
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                {canViewAll 
                  ? `Visualizando todos os eventos (${userRole})`
                  : 'Gerencie seus eventos'
                }
              </p>
              {/* Indicador de nível de acesso */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  userRole === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : userRole === 'organizer'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-globe mr-1"></i>
                    Acesso Total
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error?.includes('tabela "events" não foi criada') ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-database text-amber-600 text-xl"></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-2">
                  Configuração do Banco de Dados Necessária
                </h3>
                <p className="text-amber-700 mb-4">
                  A tabela "events" ainda não foi criada no seu projeto Supabase. 
                  É necessário executar o script SQL para criar a estrutura do banco de dados.
                </p>
                <div className="bg-amber-100 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-list-ol"></i>
                    Passos para Configuração:
                  </h4>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Acesse o dashboard do Supabase</li>
                    <li>Vá para o <strong>SQL Editor</strong></li>
                    <li>Execute o script do arquivo <code>sql/create_events_table.sql</code></li>
                    <li>Recarregue esta página</li>
                  </ol>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-redo"></i>
                    Recarregar Página
                  </button>
                  <button 
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                  >
                    <i className={`fas ${testing ? 'fa-spinner fa-spin' : 'fa-stethoscope'}`}></i>
                    {testing ? 'Testando...' : 'Diagnosticar'}
                  </button>
                  <a 
                    href="https://app.supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Abrir Supabase
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 text-red-700 mb-4">
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
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <i className={`fas ${testing ? 'fa-spinner fa-spin' : 'fa-stethoscope'}`}></i>
                {testing ? 'Diagnosticando...' : 'Diagnosticar Problema'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <i className="fas fa-redo"></i>
                Recarregar
              </button>
            </div>
          </div>
        )}

        {/* Resultados do Teste de Diagnóstico */}
        {testResult && (
          <div className={`rounded-2xl p-6 border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <i className={`fas ${
                testResult.success 
                  ? 'fa-check-circle text-green-600' 
                  : 'fa-times-circle text-red-600'
              } text-xl`}></i>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? '✅ Diagnóstico Completo' : '❌ Problema Identificado'}
                </h3>
                <p className={`mb-3 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message || testResult.error}
                </p>
                {testResult.user && (
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Informações da Sessão:</h4>
                    <p className="text-sm text-slate-600">Email: {testResult.user.email}</p>
                    <p className="text-sm text-slate-600">User ID: {testResult.user.id}</p>
                  </div>
                )}
                {testResult.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Ver detalhes técnicos
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
                <button 
                  onClick={() => setTestResult(null)}
                  className="mt-3 text-sm text-slate-600 hover:text-slate-800 underline"
                >
                  Fechar diagnóstico
                </button>
              </div>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Eventos
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                Gerencie todos os seus eventos
              </p>
            </div>
            <button className="bg-gradient-to-r from-primary to-primary-hover text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 transform hover:scale-[1.02] w-full">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-400/25 mb-6">
                <i className="fas fa-calendar-plus text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-slate-500 mb-6">
                Comece criando seu primeiro evento
              </p>
              <button className="bg-gradient-to-r from-primary to-primary-hover text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 transform hover:scale-[1.02]">
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
                        ? 'bg-red-100 text-red-700'
                        : event.status === 'completed'
                        ? 'bg-red-100 text-red-700'
                        : status === 'today'
                        ? 'bg-red-100 text-red-700'
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
                          className="w-20 h-20 object-cover rounded-full border-4 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center border-4 border-primary/20">
                          <i className="fas fa-calendar-alt text-primary text-xl"></i>
                        </div>
                      )}
                    </div>

                    {/* Informações do evento */}
                    <div className="flex-1 min-w-0 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-20 md:pr-4">
                          {/* Título */}
                          <h3 className="text-lg font-bold text-slate-800 mb-0 truncate">
                            {event.title}
                          </h3>

                          {/* Data e hora (sem contagem de dias) */}
                          <div className="flex items-center text-slate-600 text-sm mb-0">
                            <i className="fas fa-calendar mr-2"></i>
                            <span className="mr-2">{date}</span>
                            <i className="fas fa-clock mr-2"></i>
                            <span className="mr-2">{time}</span>
                          </div>

                          {/* Localização */}
                          <div className="flex items-center text-slate-600 text-sm">
                            <i className="fas fa-map-marker-alt mr-2 flex-shrink-0"></i>
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Status no canto direito - desktop */}
                        <div className="hidden md:flex flex-col items-end ml-4">
                          <span className={`px-1 py-1 rounded-full text-xs font-medium ${
                            event.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : event.status === 'completed'
                              ? 'bg-gray-100 text-gray-700'
                              : status === 'today'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-primary/10 text-primary'
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
                      <i className="fas fa-chevron-right text-slate-400 text-lg"></i>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}

        {/* Card para Adicionar Novo Evento */}
        {events.length > 0 && (
          <div className="group bg-white/50 backdrop-blur-sm hover:bg-white/70 rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:scale-[1.01] border-2 border-dashed border-slate-300 hover:border-primary cursor-pointer overflow-hidden">
            <div className="flex items-center justify-center p-8 gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-500 group-hover:from-primary group-hover:to-primary-hover rounded-2xl flex items-center justify-center shadow-lg shadow-slate-400/25 group-hover:shadow-primary/25 transition-all duration-300">
                <i className="fas fa-plus text-white text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-600 group-hover:text-primary transition-colors mb-1">
                  Criar Novo Evento
                </h3>
                <p className="text-slate-500 text-sm">
                  Clique aqui para adicionar um novo evento ao seu calendário
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsView
