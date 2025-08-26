import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ThemeToggle } from './ThemeToggle'
import { Icon } from './ui/icons'
import { pageTokens, uiTokens } from './ui/theme'
import { Modal } from './ui/Modal'

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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
  <header className="md:hidden bg-surface -webkit-backdrop-filter backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className={`flex items-center justify-between ${pageTokens.headerPadding} py-3`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-surface-hover text-icon-2 hover:bg-surface-hover transition-colors"
              aria-label="Toggle sidebar"
            >
              <Icon name="AlignLeft" className="text-lg" />
            </button>
              <h1 className="text-xl font-bold text-text">
                Fascinar
              </h1>
          </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-icon-1 hover:text-text hover:bg-surface-hover transition-colors"
              aria-label="Logout"
            >
              <Icon name="ArrowLeft" className="text-lg" />
            </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
  <Modal open={sidebarOpen} onClose={() => setSidebarOpen(false)} backdropClassName={`md:hidden ${uiTokens.backdrop} z-40`} className="p-0">
        <div />
      </Modal>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-surface backdrop-blur-xl shadow-xl border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
        <div className={`flex items-center space-x-3 ${pageTokens.headerPadding} py-6 border-b border-border`}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="CalendarCheck" className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text">
                    Fascinar
                  </h1>
                  <p className="text-xs text-text-secondary font-medium">Eventos</p>
                </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
              aria-label="Close sidebar"
            >
              <Icon name="XCircle" className="" />
            </button>
          

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-surface-title text-text shadow-lg'
                  : 'text-text hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon name="TrendingUp" className="mr-3 text-lg group-hover:scale-110 transition-transform" />
              Dashboard
            </button>

            <button
              onClick={() => handleNavigation('/clientes')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/clientes'
                  ? 'bg-surface-title text-text shadow-lg'
                  : 'text-text hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon name="Users" className="mr-3 text-lg group-hover:scale-110 transition-transform" />
              Clientes
            </button>

            <button
              onClick={() => handleNavigation('/eventos')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/eventos'
                  ? 'bg-surface-title text-text shadow-lg'
                  : 'text-text hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon name="Calendar" className="mr-3 text-lg group-hover:scale-110 transition-transform" />
              Eventos
            </button>

            <button
              onClick={() => handleNavigation('/disponibilidade')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/disponibilidade'
                  ? 'bg-surface-title text-text shadow-lg'
                  : 'text-text hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon name="CalendarCheck" className="mr-3 text-lg group-hover:scale-110 transition-transform" />
              Minha Disponibilidade
            </button>

            <button
              onClick={() => handleNavigation('/admin/disponibilidades')}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/admin/disponibilidades'
                  ? 'bg-surface-title text-text shadow-lg'
                  : 'text-text hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon name="UserCheck" className="mr-3 text-lg group-hover:scale-110 transition-transform" />
              Admin - Disponibilidades
            </button>
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-border flex flex-col gap-0">
            <div className="group flex items-center px-2.5 py-0 gap-2 min-w-0 mb-0">
              <Icon name="User" className="text-text text-xl" title="Usuário" />
              <span className="truncate text-text text-sm font-medium" title={userProfile?.full_name || user?.email || ''}>
                {userProfile?.full_name && userProfile.full_name.trim() !== '' ? userProfile.full_name : user?.email}
              </span>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text">Tema</span>
              <ThemeToggle className="h-8 w-8" />
            </div>

            <button
              onClick={handleLogout}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-text hover:text-danger hover:bg-surface-2`}
              title="Sair"
            >
              <Icon name="ArrowLeft" className="mr-2 text-lg group-hover:scale-110 transition-transform" />
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
