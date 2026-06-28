-- =================================================================
-- SCRIPT DE MIGRAÇÃO: CRIAÇÃO DA TABELA DE TAREFAS
-- Localização Recomendada: /supabase/migrations/20260624000006_add_tarefas.sql
-- =================================================================

CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
  estado TEXT NOT NULL DEFAULT 'Pendente' CHECK (estado IN ('Pendente', 'Em andamento', 'Concluída')),
  
  -- Relacionamentos (opcionais)
  empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE,
  oportunidade_id TEXT REFERENCES oportunidades(id) ON DELETE CASCADE,
  
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso total
DROP POLICY IF EXISTS "Acesso total Tarefas" ON tarefas;
CREATE POLICY "Acesso total Tarefas" ON tarefas 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);
