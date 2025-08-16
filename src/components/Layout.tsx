import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { pageTokens } from './ui/theme'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user, userProfile } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Fascinar
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Logout"
          >
            <i className="fas fa-sign-out-alt text-lg"></i>
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-xl shadow-xl border-r border-slate-200/60 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-calendar-star text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Fascinar
                </h1>
                <p className="text-xs text-slate-500 font-medium">Eventos</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'text-slate-700 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <i className="fas fa-chart-line mr-3 text-lg group-hover:scale-110 transition-transform"></i>
              Dashboard
            </button>

            <button
              onClick={() => handleNavigation('/clientes')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/clientes'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'text-slate-700 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <i className="fas fa-users mr-3 text-lg group-hover:scale-110 transition-transform"></i>
              Clientes
            </button>

            <button
              onClick={() => handleNavigation('/eventos')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/eventos'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'text-slate-700 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <i className="fas fa-calendar-alt mr-3 text-lg group-hover:scale-110 transition-transform"></i>
              Eventos
            </button>

            <button
              onClick={() => handleNavigation('/disponibilidade')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/disponibilidade'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'text-slate-700 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <i className="fas fa-calendar-check mr-3 text-lg group-hover:scale-110 transition-transform"></i>
              Minha Disponibilidade
            </button>
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-slate-200/60 flex flex-col gap-0">
            <div className="group flex items-center px-2.5 py-0 gap-2 min-w-0 mb-0">
              <i className="fas fa-user-circle text-slate-700 text-xl" title="Usuário"></i>
              <span className="truncate text-slate-700 text-sm font-medium" title={userProfile?.full_name || user?.email || ''}>
                {userProfile?.full_name && userProfile.full_name.trim() !== '' ? userProfile.full_name : user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-slate-700 hover:text-red-500 hover:bg-red-50"
              title="Sair"
            >
              <i className="fas fa-sign-out-alt mr-2 text-lg group-hover:scale-110 transition-transform"></i>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className={pageTokens.container.md}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
