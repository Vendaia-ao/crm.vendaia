-- Enable Realtime for all core tables in the CRM
-- This allows the frontend to subscribe to changes using supabase.channel('...')

BEGIN;

-- Check if publication exists, and add tables to it.
-- Supabase automatically creates the 'supabase_realtime' publication on new projects.
ALTER PUBLICATION supabase_realtime ADD TABLE empresas;
ALTER PUBLICATION supabase_realtime ADD TABLE oportunidades;
ALTER PUBLICATION supabase_realtime ADD TABLE contactos;
ALTER PUBLICATION supabase_realtime ADD TABLE projectos;
ALTER PUBLICATION supabase_realtime ADD TABLE historico;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE documentos_cliente;
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;

COMMIT;
