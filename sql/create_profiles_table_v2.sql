-- Script SQL para criar a tabela profiles com o esquema correto
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Criar tipo ENUM para roles
CREATE TYPE public.user_role AS ENUM ('client', 'organizer', 'admin');

-- 2. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar tabela profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NULL,
  avatar_url text NULL,
  phone text NULL,
  bio text NULL,
  role public.user_role NOT NULL DEFAULT 'client'::user_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 4. Criar trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Configurar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar todos os perfis
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários com informações adicionais e roles';
COMMENT ON COLUMN public.profiles.role IS 'Role do usuário: client (padrão), organizer, admin';
COMMENT ON COLUMN public.profiles.user_id IS 'Referência ao usuário na tabela auth.users';
