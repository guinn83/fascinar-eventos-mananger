# 🔧 Configuração do Sistema de Roles e Políticas RLS - Supabase

A aplicação agora suporta **3 níveis de usuário**: `user`, `organizer` e `admin`. Usuários **admin** e **organizer** podem ver todos os eventos, enquanto usuários comuns veem apenas os próprios.

## ⚠️ **Problema Atual**
- As políticas RLS atuais só permitem que usuários vejam seus próprios eventos
- Não existe diferenciação de roles (todos são tratados como usuários comuns)
- Falta tabela `profiles` para armazenar o role de cada usuário

## 🛠️ **Solução Completa: Sistema de Roles**

### 1. Acesse o SQL Editor do Supabase
- Vá para [app.supabase.com](https://app.supabase.com)
- Faça login e acesse seu projeto
- Clique em **SQL Editor** (menu lateral)

### 2. Execute PRIMEIRO: Criar Tabela Profiles com Roles

```sql
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

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

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

-- Trigger para criar perfil automaticamente quando usuário se registra
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();
```

### 3. Execute SEGUNDO: Criar Perfil para Usuários Existentes

```sql
-- Para usuários que já existem, criar perfil manualmente
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'user' as role,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### 4. Execute TERCEIRO: Atualizar Políticas RLS da Tabela Events

```sql
-- Habilitar RLS na tabela events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Users can view events based on role" ON public.events;
DROP POLICY IF EXISTS "Users can insert events" ON public.events;
DROP POLICY IF EXISTS "Users can update events based on role" ON public.events;
DROP POLICY IF EXISTS "Users can delete events based on role" ON public.events;

-- NOVA POLÍTICA: Visualização com suporte a roles
-- Usuários comuns veem apenas seus eventos
-- Organizadores e admins veem todos os eventos
CREATE POLICY "Users can view events based on role" ON public.events
    FOR SELECT USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );

-- NOVA POLÍTICA: Inserção de eventos
CREATE POLICY "Users can insert events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- NOVA POLÍTICA: Atualização com suporte a roles
CREATE POLICY "Users can update events based on role" ON public.events
    FOR UPDATE USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );

-- NOVA POLÍTICA: Exclusão com suporte a roles
CREATE POLICY "Users can delete events based on role" ON public.events
    FOR DELETE USING (
        auth.uid() = profile_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'organizer')
        )
    );
```

### 5. Promover seu Usuário (Escolha um Role)

Para se tornar **ADMIN** (acesso total):
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'seu_email@exemplo.com';
```

Para se tornar **ORGANIZER** (vê todos eventos):
```sql
UPDATE public.profiles 
SET role = 'organizer' 
WHERE email = 'seu_email@exemplo.com';
```

Para verificar seu role atual:
```sql
SELECT email, role FROM public.profiles WHERE email = 'seu_email@exemplo.com';
```

## ✅ **Verificação do Sistema**

Após executar todos os scripts:

1. **Recarregue a aplicação**: `http://localhost:5174/eventos`
2. **Verifique o header**: Deve mostrar seu role e nível de acesso
3. **Teste as permissões**:
   - **👤 user**: Vê apenas seus eventos
   - **👥 organizer**: Vê todos os eventos + badge "Acesso Total"
   - **👑 admin**: Vê todos os eventos + badge "Acesso Total"

## 🔍 **Sistema de Roles Implementado**

### Tipos de Usuário:
| Role | Icone | Descrição | Eventos Visíveis |
|------|-------|-----------|------------------|
| **user** | 👤 | Usuário comum | Apenas próprios |
| **organizer** | 👥 | Organizador | Todos os eventos |
| **admin** | 👑 | Administrador | Todos os eventos |

### Permissões Detalhadas:
| Ação | User | Organizer | Admin |
|------|------|-----------|-------|
| Ver próprios eventos | ✅ | ✅ | ✅ |
| **Ver todos eventos** | ❌ | ✅ | ✅ |
| Criar eventos | ✅ | ✅ | ✅ |
| Editar próprios eventos | ✅ | ✅ | ✅ |
| **Editar qualquer evento** | ❌ | ✅ | ✅ |
| Deletar próprios eventos | ✅ | ✅ | ✅ |
| **Deletar qualquer evento** | ❌ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |

## 🚀 **Resultado Esperado**

Após a configuração completa:
- ✅ Sistema de roles funcionando
- ✅ **Admins/Organizers**: Veem todos os eventos (sem filtros)
- ✅ **Users**: Veem apenas seus eventos
- ✅ Badge de role visível no header
- ✅ Indicador "Acesso Total" para admins/organizers
- ✅ Políticas RLS aplicadas corretamente

## 💡 **Dicas Importantes**

1. **Novos usuários** são automaticamente criados como `user`
2. **Apenas admins** podem promover outros usuários (futuramente)
3. **Organizadores e admins** não têm filtros na visualização
4. **Backup**: Sempre faça backup antes de executar scripts SQL

---

**🔧 Troubleshooting**: Use `/test-supabase` para diagnósticos se houver problemas!
