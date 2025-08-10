# � Configuração das Políticas RLS - Supabase

A tabela `events` já existe, mas precisa das **políticas RLS (Row Level Security)** configuradas corretamente.

## ⚠️ **Problema Identificado**
O erro `400 Bad Request` indica que as políticas RLS não estão configuradas para usar o campo `profile_id`.

## �️ **Solução: Configure as Políticas RLS**

### 1. Acesse o SQL Editor do Supabase
- Vá para [app.supabase.com](https://app.supabase.com)
- Faça login e acesse seu projeto
- Clique em **SQL Editor** (menu lateral)

### 2. Execute o Script de Configuração
Copie e cole este SQL no editor:

```sql
-- Habilitar RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- Criar políticas corretas usando profile_id
CREATE POLICY "Users can view own events" ON public.events
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own events" ON public.events
    FOR DELETE USING (auth.uid() = profile_id);
```

### 3. (Opcional) Inserir Dados de Teste
Para testar, primeiro obtenha seu User ID:

```sql
SELECT auth.uid();
```

Depois insira alguns eventos de exemplo (substitua `SEU_USER_ID_AQUI`):

```sql
INSERT INTO public.events (title, description, event_date, max_attendees, status, profile_id) VALUES
(
    'Festival de Música de Verão',
    'Um evento incrível com os melhores artistas da região',
    '2025-12-15 20:00:00+00',
    120,
    'active',
    'SEU_USER_ID_AQUI'
),
(
    'Workshop de Tecnologia',
    'Aprenda as tecnologias mais modernas do mercado',
    '2025-12-20 14:30:00+00',
    50,
    'active',
    'SEU_USER_ID_AQUI'
);
```

## ✅ **Verificação**

Após executar o script:

1. **Recarregue a aplicação**: `http://localhost:5174/eventos`
2. **Use o diagnóstico**: Clique no botão "Diagnosticar Problema"
3. **Verifique os logs**: Abra o Console (F12) para ver detalhes

## 🔍 **Estrutura da Tabela Atual**

Sua tabela tem esta estrutura:
- `id` (UUID)
- `title` (text)
- `description` (text, opcional)  
- `event_date` (timestamp)
- `end_date` (timestamp, opcional)
- `location` (text, opcional)
- `max_attendees` (integer, opcional)
- `current_attendees` (integer, padrão 0)
- `price` (numeric, padrão 0)
- `image_url` (text, opcional)
- `status` (event_status: active/inactive/cancelled/completed)
- `profile_id` (UUID, referência ao usuário)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🚀 **Resultado Esperado**

Após a configuração:
- ✅ Lista de eventos carrega sem erros
- ✅ Apenas eventos do usuário logado são exibidos
- ✅ Layout horizontal funcional com contagem de dias
- ✅ Todos os campos da tabela são exibidos corretamente

---

**💡 Dica**: Se ainda houver problemas, use a página de teste em `/test-supabase` para diagnóstico detalhado!
