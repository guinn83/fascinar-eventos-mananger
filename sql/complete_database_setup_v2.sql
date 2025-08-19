-- ==========================================
-- SETUP COMPLETO DO BANCO DE DADOS - FASCINAR EVENTOS V2.0
-- ==========================================
-- Data: 15/08/2025
-- Versão: 2.0 (com estrutura unificada e sistema de staff)

-- CREATE TABLE IF NOT EXISTS event_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  person_name TEXT, -- Nome da pessoa quando não há profile
  staff_role staff_role NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(8,2),
  hours_planned DECIMAL(4,1) DEFAULT 8.0,
  hours_worked DECIMAL(4,1),
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES profiles(id),
  
  UNIQUE(event_id, profile_id, staff_role),
  CHECK (hours_planned > 0),
  CHECK (hours_worked >= 0 OR hours_worked IS NULL),
  CHECK (profile_id IS NOT NULL OR person_name IS NOT NULL) -- Pelo menos um deve estar preenchido
);========================
-- 1. ENUMS E TIPOS PERSONALIZADOS
-- ==========================================

-- Enum para roles de usuário
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de eventos
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('active', 'inactive', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para tipos de relacionamento entre clientes
DO $$ BEGIN
  CREATE TYPE relationship AS ENUM ('spouse', 'parent', 'child', 'sibling', 'partner', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para roles de staff
DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM (
    'cerimonialista',
    'coordenador',
    'planner',
    'assistente',
    'recepcionista',
    'monitora',
    'produtor_camarim',
    'mestre_cerimonia',
    'seguranca'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de disponibilidade
DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'busy', 'maybe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. FUNÇÕES AUXILIARES
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para atualizar contagem de participantes
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET current_attendees = (
      SELECT COUNT(*) FROM event_registrations 
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET current_attendees = (
      SELECT COUNT(*) FROM event_registrations 
      WHERE event_id = OLD.event_id AND status = 'confirmed'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. TABELA PRINCIPAL: PROFILES (UNIFICADA)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NULL, -- Nullable para clientes sem login
  full_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  phone TEXT NULL,
  bio TEXT NULL,
  role user_role NOT NULL DEFAULT 'client'::user_role,
  max_role staff_role NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  has_password BOOLEAN NOT NULL DEFAULT false,
  email CHARACTER VARYING NULL,
  
  -- Campos adicionados para clientes
  cpf VARCHAR(14) NULL,
  address TEXT NULL,
  company_name VARCHAR(255) NULL,
  related_profile_id UUID NULL,
  
  -- Constraints
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_cpf_key UNIQUE (cpf),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_related_profile_id_fkey FOREIGN KEY (related_profile_id) REFERENCES profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ==========================================
-- 4. TABELA DE EVENTOS (ATUALIZADA)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NULL,
  location TEXT NULL,
  max_attendees INTEGER NULL,
  current_attendees INTEGER NULL DEFAULT 0,
  price NUMERIC(10, 2) NULL DEFAULT 0,
  image_url TEXT NULL,
  status event_status NOT NULL DEFAULT 'active'::event_status,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendees INTEGER NULL DEFAULT 0,
  staff INTEGER NULL DEFAULT 0,
  
  -- Relacionamentos atualizados
  profile_id UUID NULL, -- Mantido para backward compatibility
  client_profile_id UUID NULL,
  created_by_profile_id UUID NULL,
  
  -- Constraints
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT events_client_profile_id_fkey FOREIGN KEY (client_profile_id) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT events_created_by_profile_id_fkey FOREIGN KEY (created_by_profile_id) REFERENCES profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Trigger para updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_client_profile_id ON events(client_profile_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by_profile_id ON events(created_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- ==========================================
-- 5. TABELA DE REGISTROS DE EVENTOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NULL DEFAULT 'confirmed'::text,
  
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_user_id_key UNIQUE (event_id, user_id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Triggers para atualizar contagem de participantes
CREATE TRIGGER update_attendees_on_registration
  AFTER INSERT ON event_registrations 
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees();

CREATE TRIGGER update_attendees_on_cancellation
  AFTER DELETE ON event_registrations 
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees();

-- ==========================================
-- 6. TABELAS DO SISTEMA DE STAFF
-- ==========================================

-- Tabela de disponibilidade de staff
CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status availability_status DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profile_id, available_date),
  CHECK (start_time < end_time OR (start_time IS NULL AND end_time IS NULL))
);

-- Tabela de roles padrão para staff
CREATE TABLE IF NOT EXISTS default_staff_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_role staff_role NOT NULL,
  experience_level INTEGER DEFAULT 1 CHECK (experience_level BETWEEN 1 AND 5),
  hourly_rate DECIMAL(8,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profile_id, staff_role)
);

-- Tabela de staff alocado para eventos
CREATE TABLE IF NOT EXISTS event_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  person_name TEXT, -- Nome da pessoa quando não há profile
  staff_role staff_role NOT NULL,
  arrival_time TIME,
  confirmed BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(8,2),
  hours_planned DECIMAL(4,1) DEFAULT 8.0,
  hours_worked DECIMAL(4,1),
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES profiles(id),
  
  UNIQUE(event_id, profile_id, staff_role),
  CHECK (hours_planned > 0),
  CHECK (hours_worked >= 0 OR hours_worked IS NULL),
  CHECK (profile_id IS NOT NULL OR person_name IS NOT NULL) -- Pelo menos um deve estar preenchido
);

-- Triggers para updated_at nas tabelas de staff
CREATE TRIGGER update_staff_availability_updated_at 
  BEFORE UPDATE ON staff_availability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_default_staff_roles_updated_at 
  BEFORE UPDATE ON default_staff_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_staff_availability_profile_id ON staff_availability(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_date ON staff_availability(available_date);
CREATE INDEX IF NOT EXISTS idx_default_staff_roles_profile_id ON default_staff_roles(profile_id);
CREATE INDEX IF NOT EXISTS idx_default_staff_roles_role ON default_staff_roles(staff_role);
CREATE INDEX IF NOT EXISTS idx_event_staff_event_id ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_profile_id ON event_staff(profile_id);

-- ==========================================
-- 7. MANTIDO PARA BACKWARD COMPATIBILITY: CLIENTS
-- ==========================================
-- (Será removido após migração completa)

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name CHARACTER VARYING(255) NOT NULL,
  phone CHARACTER VARYING(20) NULL,
  cpf CHARACTER VARYING(14) NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  profile_id UUID NULL,
  related_client_id UUID NULL,
  relationship_type relationship NULL,
  
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_cpf_key UNIQUE (cpf),
  CONSTRAINT clients_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT clients_related_client_id_fkey FOREIGN KEY (related_client_id) REFERENCES clients (id) ON DELETE SET NULL,
  CONSTRAINT chk_relationship_consistency CHECK (
    ((related_client_id IS NULL) AND (relationship_type IS NULL))
    OR ((related_client_id IS NOT NULL) AND (relationship_type IS NOT NULL))
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_related_client_id ON public.clients USING btree (related_client_id) TABLESPACE pg_default;

-- ==========================================
-- 8. RLS (ROW LEVEL SECURITY)
-- ==========================================

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'organizer' AND profiles.role IN ('organizer', 'client'))
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- RLS para events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_policy" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = events.client_profile_id)
    OR profile_id = auth.uid()
  );

CREATE POLICY "events_insert_policy" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
  );

CREATE POLICY "events_update_policy" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR profile_id = auth.uid()
  );

-- RLS para staff tables
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;

-- Policies básicas para staff
CREATE POLICY "staff_select_policy" ON staff_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = profile_id)
  );

CREATE POLICY "staff_roles_select_policy" ON default_staff_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = profile_id)
  );

CREATE POLICY "event_staff_select_policy" ON event_staff
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = profile_id)
    OR EXISTS (SELECT 1 FROM profiles p JOIN events e ON e.client_profile_id = p.id WHERE p.user_id = auth.uid() AND e.id = event_id)
  );

-- Allow deletes on event_staff for admins/organizers, the staff profile itself, the event client, or the user who assigned the staff
CREATE POLICY "event_staff_delete_policy" ON event_staff
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ==========================================
-- 9. VIEWS ÚTEIS
-- ==========================================

-- View para eventos com informações completas
CREATE OR REPLACE VIEW events_with_profiles AS
SELECT 
  e.*,
  client.full_name as client_name,
  client.email as client_email,
  client.phone as client_phone,
  client.company_name as client_company,
  creator.full_name as creator_name,
  creator.role as creator_role
FROM events e
LEFT JOIN profiles client ON client.id = e.client_profile_id
LEFT JOIN profiles creator ON creator.id = e.created_by_profile_id;

-- View para staff de eventos com detalhes
CREATE OR REPLACE VIEW event_staff_details AS
SELECT 
  es.id,
  es.event_id,
  e.title as event_title,
  e.event_date,
  es.profile_id,
  COALESCE(p.full_name, es.person_name, 'Não atribuído') as staff_name,
  p.email as staff_email,
  p.phone as staff_phone,
  es.staff_role,
  es.confirmed,
  es.hourly_rate,
  es.arrival_time,
  es.hours_planned,
  es.hours_worked,
  es.assigned_at,
  es.confirmed_at,
  COALESCE(es.hourly_rate,0) * COALESCE(es.hours_planned,0) as planned_cost,
  COALESCE(es.hourly_rate,0) * COALESCE(es.hours_worked, es.hours_planned,0) as actual_cost,
  assigner.full_name as assigned_by_name
FROM event_staff es
JOIN events e ON e.id = es.event_id
LEFT JOIN profiles p ON p.id = es.profile_id
LEFT JOIN profiles assigner ON assigner.id = es.assigned_by;

-- ==========================================
-- 10. FUNÇÕES ÚTEIS
-- ==========================================

-- Função para criar cliente
CREATE OR REPLACE FUNCTION create_client_profile(
  p_full_name TEXT,
  p_email VARCHAR DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_cpf VARCHAR(14) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_company_name VARCHAR(255) DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  INSERT INTO profiles (
    user_id, full_name, email, phone, cpf, role, company_name, address
  ) VALUES (
    p_user_id, p_full_name, p_email, p_phone, p_cpf, 'client'::user_role, p_company_name, p_address
  ) RETURNING id INTO new_profile_id;
  
  RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular custo de staff
CREATE OR REPLACE FUNCTION calculate_event_staff_cost(event_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(hourly_rate * hours_planned) FROM event_staff WHERE event_id = event_uuid AND confirmed = true),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar staff disponível
CREATE OR REPLACE FUNCTION get_available_staff_for_date(
  target_date DATE,
  required_role staff_role DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  staff_role staff_role,
  experience_level INTEGER,
  hourly_rate DECIMAL(8,2),
  availability_status availability_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    dsr.staff_role,
    dsr.experience_level,
    dsr.hourly_rate,
    COALESCE(sa.status, 'available'::availability_status)
  FROM profiles p
  JOIN default_staff_roles dsr ON dsr.profile_id = p.id
  LEFT JOIN staff_availability sa ON sa.profile_id = p.id AND sa.available_date = target_date
  WHERE 
    dsr.is_active = true
    AND (required_role IS NULL OR dsr.staff_role = required_role)
    AND COALESCE(sa.status, 'available'::availability_status) IN ('available', 'maybe')
    AND NOT EXISTS (
      SELECT 1 FROM event_staff es
      JOIN events e ON e.id = es.event_id
      WHERE es.profile_id = p.id
      AND DATE(e.event_date) = target_date
      AND es.confirmed = true
    )
  ORDER BY dsr.experience_level DESC, dsr.hourly_rate ASC;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ==========================================

COMMENT ON TABLE profiles IS 'Tabela unificada para todos os usuários: admins, organizers e clients';
COMMENT ON TABLE events IS 'Eventos com relacionamentos para a tabela profiles unificada';
COMMENT ON TABLE staff_availability IS 'Disponibilidade de cada membro da staff por data';
COMMENT ON TABLE default_staff_roles IS 'Roles padrão e experiência de cada membro da staff';
COMMENT ON TABLE event_staff IS 'Staff alocado para eventos específicos';

COMMENT ON COLUMN profiles.cpf IS 'CPF do cliente (pode ser null para usuários não-brasileiros)';
COMMENT ON COLUMN profiles.company_name IS 'Nome da empresa para eventos corporativos';
COMMENT ON COLUMN profiles.related_profile_id IS 'Relacionamento com outro perfil (parente, sócio, etc.)';
COMMENT ON COLUMN events.client_profile_id IS 'Perfil do cliente que contratou o evento';
COMMENT ON COLUMN events.created_by_profile_id IS 'Perfil de quem criou o evento no sistema';

-- ==========================================
-- FINALIZAÇÃO
-- ==========================================

SELECT 'Setup completo do banco de dados V2.0 finalizado!' as status;
