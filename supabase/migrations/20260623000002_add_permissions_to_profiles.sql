-- =================================================================
-- SCRIPT DE MIGRAÇÃO: ADICIONAR PERMISSÕES À TABELA DE PROFILES
-- Localização Recomendada: /supabase/migrations/20260623000002_add_permissions_to_profiles.sql
-- =================================================================

-- 1. Adicionar coluna de permissões na tabela profiles
-- Como queremos máxima compatibilidade, usaremos do tipo TEXT (que pode armazenar uma lista em JSON ou CSV das permissões autorizadas)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissoes TEXT DEFAULT 'dashboard,empresas,pipeline,projectos';

-- 2. Atualizar os dois perfis de Sócios originais para terem acesso completo a todos os módulos
UPDATE profiles SET permissoes = 'dashboard,empresas,pipeline,projectos,utilizadores' WHERE id IN ('comercial', 'operacional');
