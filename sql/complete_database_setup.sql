-- ==========================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- ==========================================

-- 1. Criar tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  location varchar(255),
  image_url text,
  status varchar(20) DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- 2. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  email varchar(255),
  phone varchar(20),
  cpf varchar(14) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  profile_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  related_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  relationship_type varchar(50),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_cpf_key UNIQUE (cpf)
);

-- 3. Criar tabela de profiles (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name varchar(255),
  avatar_url text,
  phone varchar(20),
  bio text,
  role varchar(20) DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- 4. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_related_client_id ON public.clients(related_client_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON public.clients(cpf);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança básicas

-- Políticas para events
DROP POLICY IF EXISTS "Users can view events" ON public.events;
CREATE POLICY "Users can view events" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert events" ON public.events;
CREATE POLICY "Users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their events" ON public.events;
CREATE POLICY "Users can update their events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their events" ON public.events;
CREATE POLICY "Users can delete their events" ON public.events
  FOR DELETE USING (auth.uid() = created_by);

-- Políticas para clients
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
CREATE POLICY "Users can view clients" ON public.clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage clients" ON public.clients;
CREATE POLICY "Users can manage clients" ON public.clients
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir dados de exemplo (opcional)
INSERT INTO public.events (title, description, event_date, location, status, created_by)
SELECT 
  'Casamento João & Maria',
  'Celebração do casamento de João e Maria',
  timezone('utc'::text, now()) + interval '30 days',
  'Igreja São José',
  'active',
  auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.events LIMIT 1)
AND auth.uid() IS NOT NULL;

INSERT INTO public.events (title, description, event_date, location, status, created_by)
SELECT 
  'Aniversário de 15 anos',
  'Festa de debutante da Ana Paula',
  timezone('utc'::text, now()) + interval '45 days',
  'Salão de Festas Cristal',
  'active',
  auth.uid()
WHERE (SELECT COUNT(*) FROM public.events) < 2
AND auth.uid() IS NOT NULL;

-- Mostrar status final
SELECT 
  'events' as tabela,
  COUNT(*) as registros
FROM public.events
UNION ALL
SELECT 
  'clients' as tabela,
  COUNT(*) as registros  
FROM public.clients
UNION ALL
SELECT 
  'profiles' as tabela,
  COUNT(*) as registros
FROM public.profiles;
