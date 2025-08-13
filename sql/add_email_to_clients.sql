-- Adicionar campo email na tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Criar índice para o email (útil para buscas)
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Verificar a estrutura atualizada da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;
