-- 1. Activar a extensão pg_net (Necessário para fazer chamadas HTTP seguras dentro do Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Criar a função que chama a API do OneSignal
CREATE OR REPLACE FUNCTION notificar_nova_tarefa()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_id bigint;
BEGIN
  -- Construir o JSON (Payload) para o OneSignal
  payload := json_build_object(
    'app_id', 'de95ea0a-a6c1-4d73-bc6e-d7416fb86a34',
    'include_aliases', json_build_object('external_id', ARRAY[NEW.responsavel]),
    'target_channel', 'push',
    'headings', json_build_object('en', 'Nova Tarefa Atribuída', 'pt', 'Nova Tarefa Atribuída'),
    'contents', json_build_object('en', NEW.titulo, 'pt', NEW.titulo)
  );

  -- Fazer o POST assíncrono para o OneSignal usando pg_net
  SELECT net.http_post(
      url:='https://onesignal.com/api/v1/notifications',
      -- ATENÇÃO: SUBSTITUIR "SUA_REST_API_KEY" PELA TUA CHAVE REAL
      headers:='{"Content-Type": "application/json", "Authorization": "Basic SUA_REST_API_KEY"}'::jsonb,
      body:=payload::jsonb
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o Trigger que escuta INSERTS na tabela "tarefas"
DROP TRIGGER IF EXISTS trigger_notificar_nova_tarefa ON tarefas;
CREATE TRIGGER trigger_notificar_nova_tarefa
AFTER INSERT ON tarefas
FOR EACH ROW
EXECUTE FUNCTION notificar_nova_tarefa();
