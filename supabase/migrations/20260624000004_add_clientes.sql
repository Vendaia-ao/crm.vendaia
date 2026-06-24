-- =================================================================
-- SCRIPT DE MIGRAÇÃO: CRIAÇÃO DA TABELA DE CLIENTES
-- Localização Recomendada: /supabase/migrations/20260624000004_add_clientes.sql
-- =================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  contacto_principal TEXT,
  telefone TEXT,
  email TEXT,
  servico_contratado TEXT NOT NULL,
  valor_negocio NUMERIC NOT NULL DEFAULT 0,
  data_fecho TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  projeto_associado TEXT,
  estado TEXT NOT NULL DEFAULT 'Aguardando Apresentação',
  
  -- Dados da Reunião
  data_reuniao TEXT,
  hora_reuniao TEXT,
  local_reuniao TEXT,
  observacoes_reuniao TEXT,
  
  -- Próxima Ação
  proxima_acao TEXT DEFAULT ''
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso total
DROP POLICY IF EXISTS "Acesso total Clientes" ON clientes;
CREATE POLICY "Acesso total Clientes" ON clientes 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);
