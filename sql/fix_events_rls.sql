-- ==========================================
-- FIX: Corrigir Policies RLS para tabela `events`
-- Objetivo: Garantir que usuários autenticados consigam consultar/gerenciar eventos
-- quando forem admin/organizer, quando forem o cliente proprietário (client_profile_id),
-- quando forem o criador (created_by_profile_id), ou quando o campo legacy profile_id = auth.uid().
-- Executar este script no editor SQL do Supabase.
-- ==========================================

-- 0. Segurança: habilitar RLS caso não esteja habilitado
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- 1. Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;

-- 2. Criar nova policy para SELECT mais abrangente e explicada
CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT USING (
    (
      -- Admins e organizers (via tabela profiles)
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'organizer')
      )
    )
    OR
    (
      -- Cliente proprietário do evento (client_profile_id aponta para profiles.id)
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.id = public.events.client_profile_id
      )
    )
    OR
    (
      -- Criador do evento: created_by_profile_id pertence a profile do usuário
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.id = public.events.created_by_profile_id
      )
    )
    OR
    (
      -- Backward compatibility: se o evento usar profile_id (referência para auth.users)
      public.events.profile_id = auth.uid()
    )
  );

-- 3. Criar policy para INSERT
-- Regras: admin/organizer podem inserir qualquer evento; usuário autenticado pode criar eventos
-- desde que created_by_profile_id ou profile_id referencie-o (ou seja, esteja colocando seu próprio id)
CREATE POLICY "events_insert_policy" ON public.events
  FOR INSERT WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'organizer')
      )
    )
    OR
    (
      -- Permitir que um usuário crie um evento apontando created_by_profile_id para seu profile
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.id = public.events.created_by_profile_id
      )
    )
    OR
    (
      -- Legacy: permite inserir com profile_id = auth.uid()
      public.events.profile_id = auth.uid()
    )
  );

-- 4. Criar policy para UPDATE
-- Regras: admins/organizers podem atualizar; criador do evento (created_by_profile_id) pode atualizar;
-- legacy creator (profile_id) também pode.
CREATE POLICY "events_update_policy" ON public.events
  FOR UPDATE USING (
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'organizer')
      )
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.id = public.events.created_by_profile_id
      )
    )
    OR
    (
      public.events.profile_id = auth.uid()
    )
  ) WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'organizer')
      )
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.id = public.events.created_by_profile_id
      )
    )
    OR
    (
      public.events.profile_id = auth.uid()
    )
  );

-- 5. Notas e verificações rápidas
-- a) Se o usuário autenticado não possuir uma linha em `profiles` (user_id = auth.uid()),
--    muitas das clauses acima (admin/organizer/created_by check) falharão.
--    Nesse caso você deve criar um profile inicial para o usuário ao efetuar signup.
--    Exemplo de criação segura (executar apenas para testar):
--
-- INSERT INTO public.profiles (user_id, full_name, email, role)
-- VALUES ('<USER_UUID_HERE>', 'Nome', 'email@example.com', 'client')
-- ON CONFLICT (user_id) DO NOTHING;
--
-- b) Verificações recomendadas (execute no SQL editor após aplicar as policies):
--  - Testar como o usuário autenticado: SELECT * FROM public.events LIMIT 10;
--  - Confirmar que admins veem todos: (login como admin) SELECT COUNT(*) FROM public.events;
--  - Verificar eventos cujo client_profile_id aponta para o perfil do usuário.

-- 6. Mensagem final
SELECT 'Policies de events atualizadas. Teste no Supabase SQL Editor com diferentes usuários.' as message;
