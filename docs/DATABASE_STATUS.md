# Status do Banco de Dados vs Código

## ✅ Arquivo `complete_database_setup_v2.sql` Atualizado

### Tabela `event_staff` (corrigida):
```sql
CREATE TABLE event_staff (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  profile_id UUID REFERENCES profiles(id), -- NULLABLE
  person_name TEXT, -- NOVA COLUNA
  staff_role staff_role NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  -- ... outros campos
  CHECK (profile_id IS NOT NULL OR person_name IS NOT NULL)
);
```

### View `event_staff_details` (corrigida):
```sql
CREATE OR REPLACE VIEW event_staff_details AS
SELECT 
  es.id,
  es.event_id,
  es.profile_id,
  COALESCE(p.full_name, es.person_name, 'Não atribuído') as staff_name,
  -- ... outros campos
FROM event_staff es
JOIN events e ON e.id = es.event_id
LEFT JOIN profiles p ON p.id = es.profile_id  -- LEFT JOIN (corrigido)
LEFT JOIN profiles assigner ON assigner.id = es.assigned_by;
```

## ⚠️ Ações Necessárias no Supabase

### 1. Corrigir a View (URGENTE):
```sql
-- Execute este SQL no Supabase
CREATE OR REPLACE VIEW public.event_staff_details AS
SELECT
  es.id,
  es.event_id,
  e.title as event_title,
  e.event_date,
  es.profile_id,
  COALESCE(p.full_name, es.person_name, 'Não atribuído'::text) as staff_name,
  p.email as staff_email,
  p.phone as staff_phone,
  es.staff_role,
  es.confirmed,
  es.hourly_rate,
  es.hours_planned,
  es.hours_worked,
  es.assigned_at,
  es.confirmed_at,
  es.hourly_rate * es.hours_planned as planned_cost,
  es.hourly_rate * COALESCE(es.hours_worked, es.hours_planned) as actual_cost,
  assigner.full_name as assigned_by_name
FROM
  event_staff es
  JOIN events e ON e.id = es.event_id
  LEFT JOIN profiles p ON p.id = es.profile_id  -- ← MUDANÇA CRÍTICA
  LEFT JOIN profiles assigner ON assigner.id = es.assigned_by;
```

### 2. Verificar se a coluna `person_name` existe:
```sql
-- Execute para verificar
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'event_staff' AND column_name = 'person_name';
```

### 3. Se não existir, adicionar:
```sql
ALTER TABLE event_staff ADD COLUMN person_name TEXT;
ALTER TABLE event_staff ADD CONSTRAINT check_person_assignment 
  CHECK (profile_id IS NOT NULL OR person_name IS NOT NULL);
```

## 🎯 Resultado Esperado

Após essas correções:

**Função não atribuída:**
- `profile_id` = NULL
- `person_name` = NULL  
- `staff_name` = "Não atribuído"

**Função com nome (sem profile):**
- `profile_id` = NULL
- `person_name` = "João Silva"
- `staff_name` = "João Silva"

**Função com profile real:**
- `profile_id` = uuid
- `person_name` = NULL
- `staff_name` = dados do profile
