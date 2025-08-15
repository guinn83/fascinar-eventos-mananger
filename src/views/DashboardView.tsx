import React from 'react'
import { Card, CardContent } from '../components/ui/card'

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2 font-medium">
              Bem-vindo ao painel de controle
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
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
                <p className="text-slate-600 text-sm font-medium">Total de Eventos</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <i className="fas fa-calendar-alt text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Eventos Ativos</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">8</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <i className="fas fa-play-circle text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Convidados</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">247</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <i className="fas fa-users text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent size="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Receita</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">R$ 15.8K</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
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
          <h2 className="text-xl font-bold text-slate-800">Eventos Recentes</h2>
          <a
            href="/eventos"
            className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
          >
            Ver todos
          </a>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent size="md" className="bg-slate-50/50 rounded-2xl border border-slate-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center">
                  <i className="fas fa-music text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Festival de Música</h3>
                  <p className="text-slate-600 text-sm">15 de Dezembro, 2023</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Ativo
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent size="md" className="bg-slate-50/50 rounded-2xl border border-slate-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Workshop de Tecnologia</h3>
                  <p className="text-slate-600 text-sm">20 de Dezembro, 2023</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
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
