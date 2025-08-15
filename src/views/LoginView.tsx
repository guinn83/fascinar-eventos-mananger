
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

type LoginStep = 'email' | 'create-password' | 'enter-password' | 'forgot-password';

const LoginView: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { checkEmail, login, resetPassword } = useAuthStore();


  // 1. Verifica email e decide próximo passo
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await checkEmail(email);
      if (!result.exists) {
        setError('Email não encontrado.');
      } else if (result.firstAccess) {
        // Envia email de recuperação de senha automaticamente
        const resetResult = await resetPassword(email);
        if (resetResult.error) {
          setError(resetResult.error);
        } else {
          setMessage('Enviamos um link para você criar sua senha. Verifique seu email.');
        }
      } else {
        setStep('enter-password');
      }
    } catch {
      setError('Erro ao verificar email.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Criação de senha no primeiro acesso
  // Removido handleCreatePassword: agora o fluxo é sempre pelo ResetPasswordView

  // 3. Login normal
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Login realizado com sucesso!');
        // Redirecionar ou atualizar app
      }
    } catch {
      setError('Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Esqueceu a senha
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Email de recuperação enviado!');
      }
    } catch {
      setError('Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  // Removidos handleSubmit e handlePasswordReset não utilizados


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-primary/20 blur-3xl"></div>
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-300/20 border border-white/20 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <i className="fas fa-calendar-star text-white text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Fascinar Eventos
            </h2>
            <p className="mt-2 text-slate-600 font-medium">
              {step === 'email' && 'Digite seu email para continuar'}
              {step === 'create-password' && 'Crie sua senha'}
              {step === 'enter-password' && 'Digite sua senha'}
              {step === 'forgot-password' && 'Recupere sua senha'}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm mb-4">
              {message}
            </div>
          )}
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-6">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          )}
          {/* Step 2a: Criar senha removido, agora sempre usa ResetPasswordView */}
          {/* Step 2b: Digitar senha */}
          {step === 'enter-password' && (
            <form onSubmit={handleLogin} className="space-y-6">
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
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <button
                type="button"
                onClick={() => setStep('forgot-password')}
                className="w-full text-primary hover:text-primary-hover text-sm font-semibold py-2 transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </form>
          )}
          {/* Step 3: Esqueceu a senha */}
          {step === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="email-forgot" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  id="email-forgot"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                  placeholder="seu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Enviando...' : 'Enviar email de recuperação'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-slate-600 hover:text-slate-800 text-sm font-semibold py-2 transition-colors"
              >
                Voltar para o início
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginView
