# 🚀 Setup do Supabase - Fascinar Eventos

## 📋 Pré-requisitos
- Projeto criado no [Supabase](https://app.supabase.com)
- Variáveis de ambiente configuradas no arquivo `.env`

## ⚡ Setup Rápido

### 1. **Execute o Script Completo**
Copie e cole todo o conteúdo do arquivo `sql/complete_database_setup.sql` no **SQL Editor** do Supabase.

### 2. **Verificar Configuração**
Execute o arquivo `sql/verify_setup.sql` para verificar se tudo foi criado corretamente.

## 🗃️ Estrutura do Banco

### **Tabelas Principais:**
- ✅ `events` - Eventos e celebrações
- ✅ `clients` - Clientes e contratos  
- ✅ `profiles` - Perfis de usuários

### **Relacionamentos:**
- ✅ `events.created_by` → `auth.users.id`
- ✅ `clients.profile_id` → `auth.users.id`
- ✅ `clients.related_client_id` → `clients.id`
- ✅ `profiles.user_id` → `auth.users.id`

## 🔒 Segurança (RLS)

### **Políticas Configuradas:**
- ✅ Usuários autenticados podem ver todos os eventos
- ✅ Usuários podem criar/editar apenas seus próprios eventos
- ✅ Administradores têm acesso total aos clientes
- ✅ Usuários podem gerenciar apenas seu próprio perfil

## 🚨 Resolução de Problemas

### **Erro: "Tabela não existe"**
```bash
# Execute o setup completo novamente
# Arquivo: sql/complete_database_setup.sql
```

### **Erro: "Sem permissão"**
```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar políticas
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### **Erro: "Relacionamento não encontrado"**
```sql
-- Recriar foreign keys
ALTER TABLE public.clients 
ADD CONSTRAINT clients_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE SET NULL;
```

## 🔧 Variáveis de Ambiente

Certifique-se de ter estas variáveis no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

## ✅ Checklist de Verificação

- [ ] Projeto Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Script SQL executado sem erros
- [ ] Tabelas criadas (events, clients, profiles)
- [ ] Políticas RLS configuradas
- [ ] App conectando sem erros

---

**🎯 Após o setup, reinicie o app e todas as funcionalidades estarão disponíveis!**

```sql
INSERT INTO public.events (title, description, event_date, attendees, staff, status, profile_id) VALUES
(
    'Festival de Música de Verão',
    'Um evento incrível com os melhores artistas da região',
    '2025-12-15 20:00:00+00',
    120,
    8,
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
- `attendees` (integer, padrão 0) - Número de convidados
- `staff` (integer, padrão 0) - Número de pessoas da equipe de organização
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
