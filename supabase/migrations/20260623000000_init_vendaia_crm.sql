-- =================================================================
-- SCRIPT DE MIGRAÇÃO INICIAL - VENDAIA CRM
-- Localização Recomendada: /supabase/migrations/20260623000000_init_vendaia_crm.sql
-- =================================================================

-- 1. Criar Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  nicho TEXT NOT NULL,
  cidade TEXT NOT NULL,
  endereco TEXT NOT NULL,
  website_actual TEXT,
  instagram TEXT,
  facebook TEXT,
  telefone_principal TEXT NOT NULL,
  observacoes TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar Tabela de Oportunidades (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS oportunidades (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor_estimado NUMERIC NOT NULL,
  responsavel TEXT NOT NULL,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  etapa TEXT NOT NULL,
  motivo_perda TEXT,
  motivo_perda_detalhe TEXT,
  origem TEXT NOT NULL
);

-- 3. Criar Tabela de Contactos (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS contactos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  observacoes TEXT
);

-- 4. Criar Tabela de Projectos (Relacionada a Empresas e Oportunidades)
CREATE TABLE IF NOT EXISTS projectos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  prazo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  estado TEXT NOT NULL,
  observacoes TEXT,
  oportunidade_id TEXT NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE
);

-- 5. Criar Tabela de Histórico (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS historico (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL
);

-- =================================================================
-- CONFIGURAÇÕES DE SEGURANÇA E RLS (ROW LEVEL SECURITY)
-- =================================================================

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para permitir acesso completo às funções do CRM 
-- a partir do servidor do app e de utilizadores autenticados/anon autorizados pela chave de API

-- Políticas para a tabela 'empresas'
DROP POLICY IF EXISTS "Acesso total Empresas" ON empresas;
CREATE POLICY "Acesso total Empresas" ON empresas 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'oportunidades'
DROP POLICY IF EXISTS "Acesso total Oportunidades" ON oportunidades;
CREATE POLICY "Acesso total Oportunidades" ON oportunidades 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'contactos'
DROP POLICY IF EXISTS "Acesso total Contactos" ON contactos;
CREATE POLICY "Acesso total Contactos" ON contactos 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'projectos'
DROP POLICY IF EXISTS "Acesso total Projectos" ON projectos;
CREATE POLICY "Acesso total Projectos" ON projectos 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'historico'
DROP POLICY IF EXISTS "Acesso total Historico" ON historico;
CREATE POLICY "Acesso total Historico" ON historico 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);
