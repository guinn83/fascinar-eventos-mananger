# Configuração da Tabela Profiles

## Esquema da Tabela

A tabela `profiles` segue o seguinte esquema:

```sql
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
);
```

## Roles de Usuário

O sistema suporta três tipos de roles:

- **`client`** (padrão): Usuários normais que podem ver apenas seus próprios eventos
- **`organizer`**: Organizadores que podem ver todos os eventos
- **`admin`**: Administradores com acesso total ao sistema

## Configuração Manual

### 1. Execute o Script SQL

No Supabase Dashboard, vá para **SQL Editor** e execute o script:
```
sql/create_profiles_table_v2.sql
```

Este script irá:
- Criar o tipo ENUM `user_role`
- Criar a tabela `profiles`
- Configurar triggers para `updated_at`
- Configurar Row Level Security (RLS)
- Criar trigger para criar perfil automaticamente quando usuário se registra

### 2. Verificar Configuração

Após executar o script, você pode usar o componente `ProfilesTest` para verificar se tudo está funcionando corretamente.

### 3. Atribuir Roles

Para alterar o role de um usuário, você pode executar SQL diretamente:

```sql
-- Tornar um usuário admin
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'user-uuid-here';

-- Tornar um usuário organizer
UPDATE profiles 
SET role = 'organizer' 
WHERE user_id = 'user-uuid-here';
```

## Comportamento do Sistema

### Com Tabela Configurada
- Usuários `client`: Veem apenas seus próprios eventos
- Usuários `organizer` e `admin`: Veem todos os eventos sem filtros

### Sem Tabela Configurada
- Todos os usuários são tratados como `client` por padrão
- Sistema funciona normalmente, mas sem diferenciação de roles
- Alerta é exibido para indicar configuração pendente

## Estrutura de Dados

### UserProfile Interface

```typescript
interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  phone?: string
  bio?: string
  role: UserRole
  created_at: string
  updated_at: string
}
```

### UserRole Type

```typescript
type UserRole = 'client' | 'organizer' | 'admin'
```

## Permissões por Role

| Permissão | Client | Organizer | Admin |
|-----------|--------|-----------|-------|
| Ver todos eventos | ❌ | ✅ | ✅ |
| Criar eventos | ✅ | ✅ | ✅ |
| Editar próprios eventos | ✅ | ✅ | ✅ |
| Editar todos eventos | ❌ | ✅ | ✅ |
| Deletar próprios eventos | ✅ | ✅ | ✅ |
| Deletar todos eventos | ❌ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |
