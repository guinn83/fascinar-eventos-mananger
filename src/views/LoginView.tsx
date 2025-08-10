import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState<'login' | 'forgot-password'>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const { signIn, resetPassword, loading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMessage('')

    try {
      const result = await resetPassword(resetEmail)
      if (result.error) {
        setResetMessage(`Erro: ${result.error}`)
      } else {
        setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
      }
    } catch {
      setResetMessage('Erro ao enviar email de recuperação. Tente novamente.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-primary/20 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-300/20 border border-white/20 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <i className="fas fa-calendar-star text-white text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Fascinar Eventos
            </h2>
            <p className="mt-2 text-slate-600 font-medium">
              {currentView === 'login' ? 'Entre na sua conta' : 'Recupere sua senha'}
            </p>
          </div>

          {/* Login Form */}
          {currentView === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <i className="fas fa-envelope text-sm"></i>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <i className="fas fa-lock text-sm"></i>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('forgot-password')}
                  className="w-full text-primary hover:text-primary-hover text-sm font-semibold py-2 transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {resetMessage && (
                <div className={`border px-4 py-3 rounded-2xl text-sm ${
                  resetMessage.includes('erro') || resetMessage.includes('Erro')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {resetMessage}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email para recuperação
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <i className="fas fa-envelope text-sm"></i>
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {resetLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar email de recuperação'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('login')
                    setResetMessage('')
                    setResetEmail('')
                  }}
                  className="w-full text-slate-600 hover:text-slate-800 text-sm font-semibold py-2 transition-colors"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginView
