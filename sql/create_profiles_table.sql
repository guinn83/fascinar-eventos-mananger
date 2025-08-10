-- Script SQL para criar a tabela profiles com suporte a roles

-- Criar tipo enum para roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'organizer', 'admin');
    END IF;
END $$;

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role public.user_role DEFAULT 'user' NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Usuários podem ver e editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver e editar todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        new.id,
        new.email,
        'user',  -- Role padrão
        COALESCE(new.raw_user_meta_data->>'full_name', new.email)
    );
    RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Inserir perfil admin padrão (opcional)
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário que deve ser admin
-- Para obter o ID: SELECT id FROM auth.users WHERE email = 'seu_email@exemplo.com';

/*
INSERT INTO public.profiles (id, email, role, full_name) 
VALUES (
    'SEU_USER_ID_AQUI',
    'admin@exemplo.com',
    'admin',
    'Administrador'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
*/

-- Exemplo de como promover um usuário existente para admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'seu_email@exemplo.com';

-- Exemplo de como promover para organizer:
-- UPDATE public.profiles SET role = 'organizer' WHERE email = 'organizador@exemplo.com';
