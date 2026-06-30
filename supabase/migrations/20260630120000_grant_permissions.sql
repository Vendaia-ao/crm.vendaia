-- Atribuir permissões padrão de acesso às tabelas para as roles principais do Supabase
-- Isto é necessário para testes no ambiente local, visto que a criação via Dashboard
-- aplica automaticamente estes grants na produção, mas nas migrações locais é preciso ser explícito.

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Se no futuro criares tabelas novas por script localmente, garante que este comportamento se mantém
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
