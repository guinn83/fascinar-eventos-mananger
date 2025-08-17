import { useState, useEffect } from 'react'
import { useStaff } from '../hooks/useStaff'
import { useAuthStore } from '../store/authStore'
import { 
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  type AvailabilityStatus
} from '../types/staff'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { pageTokens } from '../components/ui/theme'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Calendar, Clock, Save, X } from 'lucide-react'

export function StaffAvailabilityView() {
  const { user } = useAuthStore()
  const { 
    getStaffAvailability, 
    setStaffAvailability, 
    loading, 
    error 
  } = useStaff()

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [availability, setAvailability] = useState<AvailabilityStatus>('available')
  const [startTime, setStartTime] = useState<string>('08:00')
  const [endTime, setEndTime] = useState<string>('18:00')
  const [notes, setNotes] = useState<string>('')
  const [existingAvailability, setExistingAvailability] = useState<any[]>([])

  useEffect(() => {
    if (selectedDate) {
      loadAvailability()
    }
  }, [selectedDate])

  const loadAvailability = async () => {
    const data = await getStaffAvailability(selectedDate)
    setExistingAvailability(data)

    // Se existe disponibilidade para o usuário atual, preencher o formulário
    if (user) {
      const userAvailability = data.find(a => a.profile_id === user.id)
      if (userAvailability) {
        setAvailability(userAvailability.status)
        setStartTime(userAvailability.start_time || '08:00')
        setEndTime(userAvailability.end_time || '18:00')
        setNotes(userAvailability.notes || '')
      }
    }
  }

  const handleSave = async () => {
    if (!user) return

    const success = await setStaffAvailability(
      user.id,
      selectedDate,
      availability,
      startTime,
      endTime,
      notes
    )

    if (success) {
      await loadAvailability()
      alert('Disponibilidade salva com sucesso!')
    }
  }

  const getDateRange = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  return (
  <div className={`max-w-4xl mx-auto bg-background min-h-screen ${pageTokens.cardGap.sm}`}>
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-text">Minha Disponibilidade</h1>
      </div>

      {/* Seletor de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text">Selecionar Data</CardTitle>
        </CardHeader>
  <CardContent size="md">
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {getDateRange().map((date) => {
              const dateObj = new Date(date)
              const isSelected = date === selectedDate
              const hasAvailability = existingAvailability.some(a => a.available_date === date)
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-2 rounded-lg text-center transition-colors ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : hasAvailability
                      ? 'bg-success/10 text-success hover:bg-success/20'
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {dateObj.toLocaleDateString('pt-BR', { 
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                  <div className="text-xs">
                    {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  {hasAvailability && (
                    <div className="w-2 h-2 bg-success rounded-full mx-auto mt-1"></div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Disponibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilidade para {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
  <CardContent size="md" className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(AVAILABILITY_STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => setAvailability(status as AvailabilityStatus)}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                    availability === status
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <Badge className={AVAILABILITY_STATUS_COLORS[status as AvailabilityStatus]}>
                    {label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Horários (apenas se disponível) */}
          {availability === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Horário de Início
                </label>
                <input
                  type="time"
                  title="Horário de início"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary/30 focus:border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Horário de Término
                </label>
                <input
                  type="time"
                  title="Horário de término"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary/30 focus:border-border"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Adicione observações sobre sua disponibilidade..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary/30 focus:border-border"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAvailability('available')
                setStartTime('08:00')
                setEndTime('18:00')
                setNotes('')
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disponibilidade da Equipe (visão geral) */}
      {existingAvailability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade da Equipe</CardTitle>
          </CardHeader>
          <CardContent size="md">
            <div className="space-y-3">
              {existingAvailability.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-text">{avail.profiles?.full_name || 'Nome não informado'}</p>
                      <p className="text-sm text-text-muted">{avail.profiles?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={AVAILABILITY_STATUS_COLORS[avail.status as AvailabilityStatus]}>
                      {AVAILABILITY_STATUS_LABELS[avail.status as AvailabilityStatus]}
                    </Badge>
                    {avail.start_time && avail.end_time && (
                      <span className="text-sm text-text-muted">
                        {avail.start_time} - {avail.end_time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Loading States */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-danger text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
