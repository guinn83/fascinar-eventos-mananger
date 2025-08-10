import { supabase } from '../services/supabase'

export const testSupabaseConnection = async () => {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...')
    const { error: healthError } = await supabase
      .from('_temp_health_check_')
      .select('*')
      .limit(1)
    
    if (healthError && !healthError.message.includes('does not exist')) {
      console.error('❌ Erro de conexão:', healthError)
      return { success: false, error: 'Erro de conexão com Supabase' }
    }
    console.log('✅ Conexão com Supabase OK')

    // 2. Verificar autenticação
    console.log('2️⃣ Verificando autenticação...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erro de autenticação:', userError)
      return { success: false, error: 'Erro de autenticação' }
    }
    
    if (!user) {
      console.log('⚠️ Usuário não autenticado')
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    console.log('👤 User ID:', user.id)

    // 3. Verificar se a tabela events existe
    console.log('3️⃣ Verificando tabela events...')
    const { data, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1)
    
    if (eventsError) {
      console.error('❌ Erro ao acessar tabela events:', eventsError)
      
      // Verificar se é erro de tabela não existe
      if (eventsError.message?.includes('does not exist') || 
          eventsError.code === 'PGRST116') {
        return { 
          success: false, 
          error: 'Tabela events não existe',
          details: eventsError
        }
      }
      
      // Verificar se é erro de RLS
      if (eventsError.message?.includes('RLS') || 
          eventsError.message?.includes('policy')) {
        return { 
          success: false, 
          error: 'Erro de política RLS - verificar permissões',
          details: eventsError
        }
      }
      
      return { 
        success: false, 
        error: 'Erro desconhecido ao acessar events',
        details: eventsError
      }
    }
    
    console.log('✅ Tabela events acessível')
    console.log('📊 Eventos encontrados:', data?.length || 0)

    // 4. Testar inserção (rollback)
    console.log('4️⃣ Testando permissões de inserção...')
    const testEvent = {
      title: 'TESTE_CONEXAO_DELETE_ME',
      description: 'Evento de teste - pode deletar',
      event_date: new Date().toISOString(),
      max_attendees: 1,
      profile_id: user.id
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('events')
      .insert([testEvent])
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir evento de teste:', insertError)
      return { 
        success: false, 
        error: 'Sem permissão para inserir eventos',
        details: insertError
      }
    }
    
    console.log('✅ Inserção OK')
    
    // 5. Deletar evento de teste
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', insertData[0].id)
      
      if (deleteError) {
        console.warn('⚠️ Erro ao deletar evento de teste:', deleteError)
      } else {
        console.log('✅ Cleanup OK')
      }
    }

    return { 
      success: true, 
      user: user,
      message: 'Todas as verificações passaram!' 
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error)
    return { 
      success: false, 
      error: 'Erro inesperado durante teste',
      details: error
    }
  }
}
