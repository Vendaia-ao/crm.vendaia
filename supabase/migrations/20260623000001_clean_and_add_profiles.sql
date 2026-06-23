-- =================================================================
-- SCRIPT DE MIGRAÇÃO: LIMPEZA DE DADOS & GESTÃO DE PROFILES
-- Localização Recomendada: /supabase/migrations/20260623000001_clean_and_add_profiles.sql
-- =================================================================

-- 1. Limpar todos os dados anteriores para garantir que o CRM inicia totalmente vazio e sem ruído
TRUNCATE TABLE historico, projectos, contactos, oportunidades, empresas CASCADE;

-- 2. Criar a Tabela de Perfis/Utilizadores (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL, -- 'Comercial' ou 'Operacional'
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Habilitar Row Level Security (RLS) na tabela de profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Definir Políticas de Segurança para permitir leitura e escrita autorizada via API do CRM
DROP POLICY IF EXISTS "Acesso total Profiles" ON profiles;
CREATE POLICY "Acesso total Profiles" ON profiles 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. Registar os dois Sócios Directores fundadores da VENDAIA de forma definitiva
INSERT INTO profiles (id, email, nome, perfil)
VALUES 
  ('comercial', 'comercial@vendaia.com', 'Director Comercial', 'Comercial'),
  ('operacional', 'operacional@vendaia.com', 'Director Operacional', 'Operacional')
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email, 
  nome = EXCLUDED.nome, 
  perfil = EXCLUDED.perfil;
