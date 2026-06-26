-- =================================================================
-- SCRIPT DE MIGRAÇÃO: TABELA UNIFICADA DE DOCUMENTOS DO CLIENTE
-- Versão: 2 — Unificação de 'clientes' e 'documentos_cliente'
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =================================================================

-- 1. Eliminar tabela antiga de documentos (tinha FK para clientes)
DROP TABLE IF EXISTS documentos_cliente CASCADE;

-- 2. Eliminar tabela de clientes (já não é necessária)
DROP TABLE IF EXISTS clientes CASCADE;

-- 3. Criar nova tabela unificada
--    'tipo' pode ser: 'Proposta', 'Contrato', 'Factura Genérica',
--    'Factura Recibo', 'Termo de Entrega', ou '__pasta__' (marcador de pasta vazia)
CREATE TABLE IF NOT EXISTS documentos_cliente (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  servico_contratado TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nome_ficheiro TEXT NOT NULL DEFAULT '',
  url_ficheiro TEXT NOT NULL DEFAULT '',
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- 5. Criar política de acesso total
DROP POLICY IF EXISTS "Acesso total Documentos Cliente" ON documentos_cliente;
CREATE POLICY "Acesso total Documentos Cliente" ON documentos_cliente
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);
