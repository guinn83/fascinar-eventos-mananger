import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const ClientsTest: React.FC = () => {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 Testando conexão com tabela clients...')
      
      // Teste 1: Verificar se a tabela existe (query simples)
      const { data: countData, error: countError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
      
      console.log('📊 Teste de contagem:', { countData, countError })
      
      if (countError) {
        throw new Error(`Erro na contagem: ${countError.message}`)
      }
      
      // Teste 2: Buscar dados simples
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(5)
      
      console.log('📋 Teste de select:', { data, error })
      
      if (error) {
        throw new Error(`Erro no select: ${error.message}`)
      }
      
      setResult({
        tableExists: true,
        totalRows: countData?.length || 0,
        sampleData: data,
        message: 'Tabela clients acessível com sucesso!'
      })
      
    } catch (err) {
      console.error('❌ Erro no teste:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setResult({
        tableExists: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const testCreateClient = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 Testando criação de cliente...')
      
      const testClient = {
        name: 'Cliente Teste',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00'
      }
      
      const { data, error } = await supabase
        .from('clients')
        .insert(testClient)
        .select()
        .single()
      
      console.log('📝 Teste de insert:', { data, error })
      
      if (error) {
        throw new Error(`Erro no insert: ${error.message}`)
      }
      
      setResult({
        action: 'create',
        success: true,
        data,
        message: 'Cliente teste criado com sucesso!'
      })
      
    } catch (err) {
      console.error('❌ Erro no teste de criação:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teste da Tabela Clients</h1>
      
      <div className="grid gap-4 mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        <button
          onClick={testCreateClient}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Criar Cliente'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Resultado do Teste:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ClientsTest
