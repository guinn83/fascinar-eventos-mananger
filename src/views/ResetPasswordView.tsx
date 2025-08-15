import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usePWAWindowManager } from '../hooks/usePWA'

const ResetPasswordView: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()
  const { updatePassword, verifyPasswordResetToken } = useAuthStore()
  const [canSubmit, setCanSubmit] = useState(false)
  const { focusExistingWindow, hasOtherWindows } = usePWAWindowManager()

  // Verificar se há outras janelas abertas na inicialização
  useEffect(() => {
    if (hasOtherWindows()) {
      // Aguardar um pouco para garantir que a detecção está completa
      setTimeout(() => {
        const focused = focusExistingWindow()
        if (focused) {
          // Janela existente foi focada e esta será fechada
        }
      }, 500)
    }
  }, [hasOtherWindows, focusExistingWindow])

  // Função para extrair tokens da URL e verificar erros
  const extractTokensFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    // Verificar primeiro se há erros na URL
    const error = params.get('error') || hashParams.get('error')
    const errorCode = params.get('error_code') || hashParams.get('error_code')
    const errorDescription = params.get('error_description') || hashParams.get('error_description')
    
    if (error) {
      let userMessage = 'Ocorreu um erro com o link de recuperação.'
      
      if (errorCode === 'otp_expired' || error === 'access_denied') {
        userMessage = 'O link de recuperação de senha expirou. Por favor, solicite um novo link na tela de login.'
      } else if (errorDescription) {
        userMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      }
      
      return { error: userMessage }
    }
    
    // Procurar tokens válidos
    let accessToken = params.get('access_token') || hashParams.get('access_token')
    let refreshToken = params.get('refresh_token') || hashParams.get('refresh_token')
    let type = params.get('type') || hashParams.get('type')
    
    // Também verificar por outros formatos de token que o Supabase pode usar
    if (!accessToken) {
      accessToken = params.get('token') || hashParams.get('token')
    }
    
    // Procurar especificamente por tokens que começam com 'sb-'
    if (!accessToken) {
      // Verificar em todos os parâmetros
      const allParams = [...params.entries(), ...hashParams.entries()]
      for (const [, value] of allParams) {
        if (value.startsWith('sb-') || value.startsWith('sb_')) {
          accessToken = value
          break
        }
      }
    }
    
    return { accessToken, refreshToken, type }
  }

  // Capturar token imediatamente quando a página carrega
  useEffect(() => {
    const captureTokenImmediately = async () => {
      // Primeiro tentar verificar se o Supabase já processou o token
      const tokenResult = await verifyPasswordResetToken()
      if (tokenResult.success) {
        setError('')
        setCanSubmit(true)
        return
      }
      // Se não, tentar extrair da URL
      const result = extractTokensFromUrl()
      if (result.error) {
        setError(result.error)
        setCanSubmit(false)
        return
      }
      if (result.accessToken) {
        setError('') // Limpar qualquer erro anterior
        // Mesmo assim, não há sessão válida, então não permite submit
        setCanSubmit(false)
        return
      }
      // Se chegou aqui, não há token válido
      setError('Link inválido ou expirado. Solicite um novo link.');
      setCanSubmit(false)
    }
    captureTokenImmediately()
  }, [verifyPasswordResetToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (!canSubmit) {
      setError('Link inválido ou expirado. Solicite um novo link.');
      setLoading(false);
      return;
    }
    try {
      const result = await updatePassword(password)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    } catch {
      setError('Erro inesperado ao atualizar senha.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardContent size="lg">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Senha criada!
              </h2>
              <p className="text-slate-600 mb-6">
                Sua senha foi criada com sucesso. Agora você já pode acessar o app normalmente.
              </p>
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] mt-4"
                onClick={() => navigate('/')}
              >
                Abrir o app
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-primary/20 blur-3xl"></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative w-full max-w-md">
        <Card className="w-full">
          <CardContent size="md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                <i className="fas fa-key text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Nova Senha
              </h2>
              <p className="mt-2 text-slate-600 font-medium">
                {error ? 'Problema com o link?' : 'Digite sua nova senha'}
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                  {error}
                  {error.includes('expirou') && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Voltar ao login para solicitar novo link
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nova Senha
                  </label>
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
                      placeholder="Mínimo 6 caracteres"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <i className="fas fa-lock text-sm"></i>
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                      placeholder="Digite a senha novamente"
                    />
                    <button
                      type="button"
                      title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Atualizando...
                      </div>
                    ) : (
                      'Atualizar Senha'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full text-slate-600 hover:text-slate-800 text-sm font-semibold py-2 transition-colors"
                  >
                    Voltar para o login
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordView
