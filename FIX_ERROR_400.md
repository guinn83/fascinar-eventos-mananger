# 🚨 ERRO 400 - Tabela Profiles Não Existe

## ❌ **Problema**
A aplicação está tentando acessar a tabela `profiles` que não existe no Supabase.

## ✅ **Solução Rápida**

### 1. Acesse o Supabase Dashboard
- Vá para [app.supabase.com](https://app.supabase.com)
- Faça login e acesse seu projeto
- Clique em **SQL Editor** (menu lateral esquerdo)

### 2. Execute ESTE Script SQL
Copie e cole exatamente este código:

```sql
-- Criar tipo enum para roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'organizer', 'admin');
    END IF;
END $$;

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role public.user_role DEFAULT 'user' NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Criar perfil para usuários existentes
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

### 3. Clique em "RUN"
- Clique no botão **RUN** no SQL Editor
- Aguarde a execução completar
- Deve aparecer "Success. No rows returned" ou similar

### 4. Recarregue a Aplicação
- Volte para `http://localhost:5174`
- Faça login novamente se necessário
- O erro deve desaparecer

## 🧪 **Teste se Funcionou**

Vá para: `http://localhost:5174/test-profiles`

Esta página vai mostrar:
- ✅ Se a tabela foi criada
- ✅ Se seu perfil existe
- ✅ Qual é seu role atual

## 💡 **O que Este Script Faz**

1. **Cria o tipo `user_role`** com valores: `user`, `organizer`, `admin`
2. **Cria a tabela `profiles`** para armazenar dados dos usuários
3. **Configura permissões RLS** para segurança
4. **Cria perfil automaticamente** para usuários já existentes
5. **Define role padrão como `user`**

## 🔧 **Se Ainda Houver Erro**

1. Verifique se você está no projeto correto no Supabase
2. Verifique se tem permissões para executar SQL
3. Tente executar o script linha por linha
4. Use a página `/test-profiles` para diagnóstico

---

**⚠️ Execute o script SQL ANTES de continuar usando a aplicação!**
