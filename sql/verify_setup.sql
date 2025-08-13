-- ==========================================
-- VERIFICAÇÃO DO SETUP DO BANCO
-- ==========================================

-- 1. Verificar se as tabelas existem
SELECT 
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ Todas as tabelas criadas'
    ELSE '❌ Faltam tabelas: ' || (3 - COUNT(*)::text)
  END as status_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'clients', 'profiles');

-- 2. Verificar colunas da tabela events
SELECT 
  'events' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'events'
ORDER BY ordinal_position;

-- 3. Verificar colunas da tabela clients
SELECT 
  'clients' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients'
ORDER BY ordinal_position;

-- 4. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Desabilitado'
  END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('events', 'clients', 'profiles');

-- 5. Contar registros
SELECT 'events' as tabela, COUNT(*) as registros FROM public.events
UNION ALL
SELECT 'clients' as tabela, COUNT(*) as registros FROM public.clients
UNION ALL  
SELECT 'profiles' as tabela, COUNT(*) as registros FROM public.profiles;

-- 6. Verificar usuário atual
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado: ' || auth.uid()::text
    ELSE '❌ Nenhum usuário autenticado'
  END as auth_status;

-- 7. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅'
    ELSE '❌'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('events', 'clients', 'profiles')
ORDER BY tablename, policyname;
