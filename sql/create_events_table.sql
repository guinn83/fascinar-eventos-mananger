-- Script SQL para configurar políticas RLS na tabela events existente

-- A tabela já existe, então vamos apenas configurar as políticas RLS

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Admins and organizers can view all events" ON public.events;
DROP POLICY IF EXISTS "Admins and organizers can manage all events" ON public.events;

-- Criar políticas de segurança atualizadas

-- 1. VISUALIZAÇÃO DE EVENTOS
-- Usuários comuns veem apenas seus próprios eventos
CREATE POLICY "Users can view own events" ON public.events
    FOR SELECT USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );

-- 2. INSERÇÃO DE EVENTOS
-- Todos os usuários autenticados podem criar eventos
CREATE POLICY "Users can insert events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 3. ATUALIZAÇÃO DE EVENTOS
-- Usuários podem editar seus próprios eventos
-- Admins e organizadores podem editar qualquer evento
CREATE POLICY "Users can update events" ON public.events
    FOR UPDATE USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );

-- 4. EXCLUSÃO DE EVENTOS
-- Usuários podem deletar seus próprios eventos
-- Admins e organizadores podem deletar qualquer evento
CREATE POLICY "Users can delete events" ON public.events
    FOR DELETE USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );

-- Verificar se o enum event_status existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE public.event_status AS ENUM ('active', 'inactive', 'cancelled', 'completed');
    END IF;
END $$;

-- Inserir alguns eventos de exemplo (opcional)
-- Execute apenas se quiser dados de teste
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário logado

/*
-- Para obter seu user_id, execute primeiro: SELECT auth.uid();

INSERT INTO public.events (title, description, image_url, event_date, max_attendees, status, profile_id) VALUES
(
    'Festival de Música de Verão',
    'Um evento incrível com os melhores artistas da região. Venha curtir uma noite inesquecível!',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop&crop=center',
    '2025-12-15 20:00:00+00',
    120,
    'active',
    'SEU_USER_ID_AQUI'
),
(
    'Workshop de Tecnologia',
    'Aprenda as tecnologias mais modernas do mercado com especialistas da área.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=center',
    '2025-12-20 14:30:00+00',
    50,
    'active',
    'SEU_USER_ID_AQUI'
),
(
    'Conferência de Negócios',
    'Networking e palestras sobre empreendedorismo e inovação.',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&crop=center',
    '2025-11-25 09:00:00+00',
    200,
    'active',
    'SEU_USER_ID_AQUI'
);
*/
