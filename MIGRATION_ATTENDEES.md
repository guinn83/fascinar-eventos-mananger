# Migração: Simplificação de Convidados + Equipe de Organização

## Resumo das Alterações

### ❌ **Removido**:
- `max_attendees` (número máximo de convidados)
- `current_attendees` (número atual de convidados)

### ✅ **Adicionado**:
- `attendees` (número de convidados - campo único)
- `staff` (número de pessoas da equipe de organização)

## Arquivos Atualizados

### 📱 **Frontend**:
- `src/types/event.ts` - Tipos atualizados
- `src/views/EventDetailView.tsx` - UI simplificada para um campo único
- `src/utils/testConnection.ts` - Testes atualizados

### 🗄️ **Database**:
- `sql/migrate_attendees_to_single_field.sql` - Script de migração criado
- `SUPABASE_SETUP.md` - Documentação atualizada

## ⚠️ **Próximos Passos**:

1. **Execute o script SQL** no Supabase:
   ```sql
   -- 1. Adicionar novas colunas
   ALTER TABLE public.events ADD COLUMN attendees INTEGER DEFAULT 0;
   ALTER TABLE public.events ADD COLUMN staff INTEGER DEFAULT 0;
   
   -- 2. Migrar dados existentes
   UPDATE public.events SET attendees = COALESCE(current_attendees, 0);
   
   -- 3. Após confirmação, remover colunas antigas
   ALTER TABLE public.events DROP COLUMN max_attendees;
   ALTER TABLE public.events DROP COLUMN current_attendees;
   ```

2. **Teste a aplicação** para verificar se tudo funciona corretamente

3. **Atualize dados de teste** se necessário

## 🎯 **Benefícios**:
- ✅ Interface mais simples e clara
- ✅ Menos confusão entre "atual" vs "máximo"
- ✅ Foco no número planejado de convidados
- ✅ Controle da equipe de organização
- ✅ Código mais limpo e fácil de manter
