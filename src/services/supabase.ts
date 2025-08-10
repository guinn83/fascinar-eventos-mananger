import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zpxhrkybttkkgofjiibz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweGhya3lidHRra2dvZmppaWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODYzMjEsImV4cCI6MjA3MDM2MjMyMX0.Xr_ehLau8A-kmvkZo4J-9XfX79tHBvoQ4qOX9DUt7NM'

// Log de debug para verificar configuração
console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Teste de conexão inicial
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro ao obter sessão:', error)
  } else {
    console.log('✅ Sessão obtida:', data.session ? 'Logado' : 'Não logado')
  }
})
