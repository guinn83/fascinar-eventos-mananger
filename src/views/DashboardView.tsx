import React from 'react'
import { Card, CardContent } from '../components/ui/card'
import { pageTokens } from '../components/ui/theme'

const DashboardView: React.FC = () => {
  return (
  <div className={`bg-background min-h-screen ${pageTokens.cardGap.sm}`}>
      {/* Header */}
  <div className="bg-background rounded-3xl p-8 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-text">
              Dashboard
            </h1>
            <p className="text-text-secondary mt-2 font-medium">
              Bem-vindo ao painel de controle
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total de Eventos</p>
                <p className="text-h2 text-text mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-calendar-alt text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Eventos Ativos</p>
                <p className="text-h2 text-text mt-1">8</p>
              </div>
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-play-circle text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Convidados</p>
                <p className="text-h2 text-text mt-1">247</p>
              </div>
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Receita</p>
                <p className="text-h2 text-text mt-1">R$ 15.8K</p>
              </div>
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="w-full">
        <CardContent size="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-text">Eventos Recentes</h2>
          <a
            href="/eventos"
            className="text-primary hover:text-primary/90 font-medium text-sm transition-colors"
          >
            Ver todos
          </a>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent size="md" className="bg-surface-hover rounded-2xl border border-border">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
                  <i className="fas fa-music text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-text">Festival de Música</h3>
                  <p className="text-text-secondary text-sm">15 de Dezembro, 2023</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-success/10 text-success">
                <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                Ativo
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent size="md" className="bg-surface-hover rounded-2xl border border-border">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-info rounded-xl flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-text">Workshop de Tecnologia</h3>
                  <p className="text-text-secondary text-sm">20 de Dezembro, 2023</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-info/10 text-info">
                <div className="w-2 h-2 bg-info rounded-full mr-2"></div>
                Planejado
              </span>
            </CardContent>
          </Card>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardView
