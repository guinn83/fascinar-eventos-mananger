-- Script para migrar a estrutura da tabela events
-- Remove colunas max_attendees e current_attendees
-- Adiciona coluna attendees (número de convidados)
-- Adiciona coluna staff (número de pessoas da equipe de organização)

-- Adicionar nova coluna attendees
ALTER TABLE public.events 
ADD COLUMN attendees INTEGER DEFAULT 0;

-- Adicionar nova coluna staff
ALTER TABLE public.events 
ADD COLUMN staff INTEGER DEFAULT 0;

-- Migrar dados existentes (usando current_attendees como base)
UPDATE public.events 
SET attendees = COALESCE(current_attendees, 0)
WHERE attendees = 0;

-- Remover colunas antigas (comentado para segurança - execute apenas quando confirmar a migração)
-- ALTER TABLE public.events DROP COLUMN IF EXISTS max_attendees;
-- ALTER TABLE public.events DROP COLUMN IF EXISTS current_attendees;

-- Verificar resultado
SELECT id, title, attendees, staff FROM public.events LIMIT 5;
