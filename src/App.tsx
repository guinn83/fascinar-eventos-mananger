import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginView from './views/LoginView'
import ResetPasswordView from './views/ResetPasswordView'
import DashboardView from './views/DashboardView'
import EventsView from './views/EventsView'
import EventDetailView from './views/EventDetailView'
import { EventStaffView } from './views/EventStaffView'
import { StaffAvailabilityView } from './views/StaffAvailabilityView'
import ClientsView from './views/ClientsView'
import SupabaseTest from './components/SupabaseTest'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  const { user, loading, initialized, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Loading screen with modern design
  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Loading content */}
        <div className="text-center">
          <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-border/40">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin border-t-transparent"></div>
                <div className="absolute inset-4 rounded-full bg-primary/20"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">
              Fascinar Eventos
            </h2>
            <p className="text-text-secondary font-medium">
              Carregando sua experiência...
            </p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!initialized) {
    return null
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Reset password route - sempre disponível independente do estado de autenticação */}
          <Route path="/reset-password" element={<ResetPasswordView />} />
          
          {/* Rota de teste para diagnóstico */}
          <Route path="/test-supabase" element={<SupabaseTest />} />
          
          {user ? (
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardView />} />
                  <Route path="/clientes" element={<ClientsView />} />
                  <Route path="/eventos" element={<EventsView />} />
                  <Route path="/eventos/:id" element={<EventDetailView />} />
                  <Route path="/eventos/:id/staff" element={<EventStaffView />} />
                  <Route path="/disponibilidade" element={<StaffAvailabilityView />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            } />
          ) : (
            <>
              <Route path="/" element={<LoginView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
        
        {/* PWA Install Prompt - mostra em todas as telas */}
        <PWAInstallPrompt />
      </div>
    </Router>
  )
}

export default App

