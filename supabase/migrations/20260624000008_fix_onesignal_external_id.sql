CREATE OR REPLACE FUNCTION notificar_nova_tarefa()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_id bigint;
  id_responsavel text;
BEGIN
  -- 1. Descobrir o ID (UUID) do perfil do responsável pelo Nome
  -- O OneSignal está registado com o ID (external_id), mas a Tarefa guarda o Nome.
  SELECT id INTO id_responsavel FROM profiles WHERE nome = NEW.responsavel LIMIT 1;
  
  -- Se o responsável não tiver perfil correspondente, não envia notificação
  IF id_responsavel IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Construir o JSON (Payload) para o OneSignal usando o ID
  payload := json_build_object(
    'app_id', 'de95ea0a-a6c1-4d73-bc6e-d7416fb86a34',
    'include_aliases', json_build_object('external_id', ARRAY[id_responsavel]),
    'target_channel', 'push',
    'headings', json_build_object('en', 'Nova Tarefa', 'pt', 'Nova Tarefa'),
    'contents', json_build_object('en', NEW.titulo, 'pt', NEW.titulo)
  );

  -- 3. Fazer o POST assíncrono para o OneSignal usando pg_net
  SELECT net.http_post(
      url:='https://onesignal.com/api/v1/notifications',
      -- ATENÇÃO: COLA A TUA REST API KEY AQUI EM BAIXO OUTRA VEZ!
      headers:='{"Content-Type": "application/json", "Authorization": "Basic SUA_REST_API_KEY"}'::jsonb,
      body:=payload::jsonb
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
