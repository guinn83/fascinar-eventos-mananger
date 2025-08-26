import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { Card, CardContent } from './ui/card'

const SupabaseTest: React.FC = () => {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('🔍 Iniciando teste de conexão...')
      
      // 1. Testar autenticação
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setResult({ error: 'Erro de autenticação: ' + userError.message })
        return
      }
      
      if (!user) {
        setResult({ error: 'Usuário não autenticado' })
        return
      }

      console.log('✅ Usuário autenticado:', user.email)

      // 2. Testar acesso à tabela events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(5)

      if (error) {
        console.error('❌ Erro na consulta:', error)
        setResult({ 
          error: `Erro ao acessar tabela events: ${error.message}`,
          details: error,
          user: user
        })
        return
      }

      console.log('✅ Consulta bem-sucedida:', data)
      setResult({ 
        success: true, 
        data: data, 
        user: user,
        message: `Conexão OK! Encontrados ${data?.length || 0} eventos.`
      })

    } catch (err: any) {
      console.error('💥 Erro inesperado:', err)
      setResult({ error: 'Erro inesperado: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent size="md">
          <h2 className="text-2xl font-bold mb-4">🧪 Teste de Conexão Supabase</h2>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-surface-hover text-primary disabled:opacity-60 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
            {loading ? 'Testando...' : 'Executar Teste'}
          </button>

          {result && (
            <div className="mt-4">
                <Card>
                <CardContent size="md" className={`${result.success ? 'bg-surface-hover border border-border text-success' : 'bg-surface-hover border border-border text-danger'}`}>
                  <h3 className={`font-bold mb-2 ${result.success ? 'text-success' : 'text-danger'}`}>
                    {result.success ? '✅ Sucesso!' : '❌ Erro'}
                  </h3>

                  <p className={`mb-3 ${result.success ? 'text-success' : 'text-danger'}`}>
                    {result.message || result.error}
                  </p>

                  {result.user && (
                    <div className="bg-surface p-3 rounded border border-border mb-3">
                      <h4 className="font-semibold text-sm">Usuário Autenticado:</h4>
                      <p className="text-sm">Email: {result.user.email}</p>
                      <p className="text-sm">ID: {result.user.id}</p>
                    </div>
                  )}

                  {result.data && (
                    <div className="bg-surface p-3 rounded border border-border mb-3">
                      <h4 className="font-semibold text-sm">Dados Retornados:</h4>
                      <pre className="text-xs mt-1 overflow-auto bg-surface px-2 py-1 rounded text-text">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Detalhes do Erro
                      </summary>
                      <pre className="mt-2 text-xs bg-surface p-3 rounded border border-border overflow-auto text-text">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SupabaseTest
