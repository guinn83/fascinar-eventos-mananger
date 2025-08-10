import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'

const ProfilesTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const { user, userProfile } = useAuthStore()

  const testProfilesTable = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      console.log('🔍 Testando tabela profiles...')
      
      // Teste 1: Verificar se a tabela exists
      const { data: tableExists, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (tableError) {
        setTestResult({
          success: false,
          error: 'Tabela profiles não existe',
          details: tableError,
          solution: 'Execute o script sql/create_profiles_table.sql no Supabase'
        })
        return
      }

      console.log('✅ Tabela profiles existe!')

      // Teste 2: Verificar se o usuário atual tem perfil
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) {
          setTestResult({
            success: false,
            error: 'Erro ao buscar perfil do usuário',
            details: profileError
          })
          return
        }

        if (!profile) {
          setTestResult({
            success: false,
            error: 'Perfil não encontrado para este usuário',
            solution: 'Execute o script SQL manualmente no Supabase Dashboard para criar a tabela profiles e inserir os perfis',
            userInfo: {
              id: user.id,
              email: user.email,
              metadata: user.user_metadata
            }
          })
        } else {
          setTestResult({
            success: true,
            message: 'Perfil encontrado!',
            profile: profile,
            userInfo: {
              id: user.id,
              email: user.email,
              metadata: user.user_metadata
            }
          })
        }
      } else {
        setTestResult({
          success: false,
          error: 'Usuário não logado',
          solution: 'Faça login primeiro'
        })
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: 'Erro inesperado',
        details: err.message
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          🧪 Teste da Tabela Profiles
        </h2>
        <p className="text-slate-600">
          Verificar se o sistema de roles está configurado corretamente
        </p>
      </div>

      {/* Informações do usuário atual */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Usuário Atual:</h3>
        {user ? (
          <div className="text-sm text-blue-700">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Profile Role:</strong> {userProfile?.role || 'Carregando...'}</p>
          </div>
        ) : (
          <p className="text-blue-700">Não logado</p>
        )}
      </div>

      {/* Botões de teste */}
      <div className="flex gap-4">
        <button
          onClick={testProfilesTable}
          disabled={testing}
          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {testing ? '🔄 Testando...' : '🧪 Testar Configuração Profiles'}
        </button>
      </div>

      {/* Resultado do teste */}
      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className={`font-semibold mb-2 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.success ? '✅ Sucesso!' : '❌ Erro'}
          </h3>
          
          <p className={`mb-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message || testResult.error}
          </p>

          {testResult.solution && (
            <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-400 mt-3">
              <p className="text-yellow-800">
                <strong>💡 Solução:</strong> {testResult.solution}
              </p>
            </div>
          )}

          {testResult.profile && (
            <div className="mt-3">
              <h4 className="font-medium text-slate-700 mb-1">Dados do Profile:</h4>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResult.profile, null, 2)}
              </pre>
            </div>
          )}

          {testResult.details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-600">
                Ver detalhes técnicos
              </summary>
              <pre className="text-xs bg-slate-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfilesTest
