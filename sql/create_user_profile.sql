-- ==========================================
-- CRIAR PERFIL PARA USUÁRIO ATUAL
-- ID do usuário: 7b0fc0ac-2074-4b8c-9b2b-010b6f64c4cf
-- ==========================================

-- 1. Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- 2. Criar perfil para o usuário (ajuste os dados conforme necessário)
INSERT INTO public.profiles (
  user_id, 
  full_name, 
  email, 
  role, 
  has_password,
  created_at,
  updated_at
)
VALUES (
  '7b0fc0ac-2074-4b8c-9b2b-010b6f64c4cf',
  'Administrador',
  'admin@fascinar.com',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Verificar se o perfil foi criado
SELECT * FROM public.profiles WHERE user_id = '7b0fc0ac-2074-4b8c-9b2b-010b6f64c4cf';

-- 4. Verificar se consegue acessar eventos agora
SELECT COUNT(*) as total_events FROM public.events;
