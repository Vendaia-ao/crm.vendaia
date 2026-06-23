-- =================================================================
-- MIGRAÇÃO: CORRIGIR COLUNA permissoes E ACESSO DO UTILIZADOR edkassocota
-- =================================================================

-- 1. Garantir que a coluna permissoes existe na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissoes TEXT DEFAULT 'dashboard,empresas,pipeline,projectos';

-- 2. Garantir que o utilizador edkassocota@gmail.com tem acesso completo
-- Se não existir, inserir. Se existir, atualizar.
INSERT INTO profiles (id, email, nome, perfil, permissoes)
VALUES (
  gen_random_uuid()::text,
  'edkassocota@gmail.com',
  'Edgar Kassocota',
  'Comercial',
  'dashboard,empresas,pipeline,projectos,utilizadores'
)
ON CONFLICT (email) DO UPDATE
SET
  permissoes = 'dashboard,empresas,pipeline,projectos,utilizadores';

-- 3. Garantir que os dois sócios fundadores têm acesso total
UPDATE profiles
SET permissoes = 'dashboard,empresas,pipeline,projectos,utilizadores'
WHERE id IN ('comercial', 'operacional');

-- 4. Garantir que todos os profiles existentes sem permissoes têm o valor padrão
UPDATE profiles
SET permissoes = 'dashboard,empresas,pipeline,projectos'
WHERE permissoes IS NULL;
