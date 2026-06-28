-- ==========================================
-- 1. NOTIFICAÇÕES PARA PIPELINE (OPORTUNIDADES)
-- ==========================================
CREATE OR REPLACE FUNCTION notificar_mudanca_etapa_oportunidade()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_id bigint;
  id_responsavel text;
  nome_da_empresa text;
BEGIN
  -- Se a etapa não mudou, não faz nada
  IF NEW.etapa = OLD.etapa THEN
    RETURN NEW;
  END IF;

  -- Obter o UUID do responsável
  SELECT id INTO id_responsavel FROM profiles WHERE nome = NEW.responsavel LIMIT 1;
  IF id_responsavel IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obter o nome da empresa
  SELECT nome_empresa INTO nome_da_empresa FROM empresas WHERE id = NEW.empresa_id LIMIT 1;
  IF nome_da_empresa IS NULL THEN
    nome_da_empresa := 'Empresa Desconhecida';
  END IF;

  payload := json_build_object(
    'app_id', 'de95ea0a-a6c1-4d73-bc6e-d7416fb86a34',
    'include_aliases', json_build_object('external_id', ARRAY[id_responsavel]),
    'target_channel', 'push',
    'headings', json_build_object('en', 'Oportunidade Atualizada', 'pt', 'Oportunidade Atualizada'),
    'contents', json_build_object('en', 'A oportunidade de ' || NEW.servico || ' para a empresa "' || nome_da_empresa || '" avançou para a etapa "' || NEW.etapa || '".', 
                                  'pt', 'A oportunidade de ' || NEW.servico || ' para a empresa "' || nome_da_empresa || '" avançou para a etapa "' || NEW.etapa || '".')
  );

  SELECT net.http_post(
      url:='https://onesignal.com/api/v1/notifications',
      -- ATENÇÃO: COLA A TUA REST API KEY AQUI:
      headers:='{"Content-Type": "application/json", "Authorization": "Basic SUA_REST_API_KEY"}'::jsonb,
      body:=payload::jsonb
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_mudanca_etapa ON oportunidades;
CREATE TRIGGER trigger_mudanca_etapa
AFTER UPDATE OF etapa ON oportunidades
FOR EACH ROW
EXECUTE FUNCTION notificar_mudanca_etapa_oportunidade();

-- ==========================================
-- 2. NOTIFICAÇÕES PARA PROJECTOS
-- ==========================================
CREATE OR REPLACE FUNCTION notificar_mudanca_estado_projecto()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_id bigint;
  id_responsavel text;
  nome_da_empresa text;
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  SELECT id INTO id_responsavel FROM profiles WHERE nome = NEW.responsavel LIMIT 1;
  IF id_responsavel IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obter o nome da empresa
  SELECT nome_empresa INTO nome_da_empresa FROM empresas WHERE id = NEW.empresa_id LIMIT 1;
  IF nome_da_empresa IS NULL THEN
    nome_da_empresa := 'Empresa Desconhecida';
  END IF;

  payload := json_build_object(
    'app_id', 'de95ea0a-a6c1-4d73-bc6e-d7416fb86a34',
    'include_aliases', json_build_object('external_id', ARRAY[id_responsavel]),
    'target_channel', 'push',
    'headings', json_build_object('en', 'Estado do Projecto', 'pt', 'Estado do Projecto'),
    'contents', json_build_object('en', 'O projeto ' || NEW.servico || ' da empresa "' || nome_da_empresa || '" mudou para "' || NEW.estado || '".', 
                                  'pt', 'O projeto ' || NEW.servico || ' da empresa "' || nome_da_empresa || '" mudou para "' || NEW.estado || '".')
  );

  SELECT net.http_post(
      url:='https://onesignal.com/api/v1/notifications',
      -- ATENÇÃO: COLA A TUA REST API KEY AQUI:
      headers:='{"Content-Type": "application/json", "Authorization": "Basic SUA_REST_API_KEY"}'::jsonb,
      body:=payload::jsonb
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_mudanca_estado ON projectos;
CREATE TRIGGER trigger_mudanca_estado
AFTER UPDATE OF estado ON projectos
FOR EACH ROW
EXECUTE FUNCTION notificar_mudanca_estado_projecto();

-- ==========================================
-- 3. NOTIFICAÇÕES PARA CLIENTES (DOCUMENTOS)
-- ==========================================
CREATE OR REPLACE FUNCTION notificar_novo_documento_cliente()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_id bigint;
BEGIN
  -- Documentos não têm um "responsável" directo, por isso vamos notificar todos os utilizadores subscritos
  -- Pode ser útil quando um gestor anexa um contrato importante e toda a equipa precisa saber
  
  -- Ignorar se for apenas uma pasta (tipo = '__pasta__')
  IF NEW.tipo = '__pasta__' THEN
    RETURN NEW;
  END IF;

  payload := json_build_object(
    'app_id', 'de95ea0a-a6c1-4d73-bc6e-d7416fb86a34',
    'included_segments', ARRAY['Subscribed Users'],
    'target_channel', 'push',
    'headings', json_build_object('en', 'Novo Documento Anexado', 'pt', 'Novo Documento Anexado'),
    'contents', json_build_object('en', 'O documento "' || NEW.nome_ficheiro || '" foi adicionado para a empresa ' || NEW.nome_empresa, 
                                  'pt', 'O documento "' || NEW.nome_ficheiro || '" foi adicionado para a empresa ' || NEW.nome_empresa)
  );

  SELECT net.http_post(
      url:='https://onesignal.com/api/v1/notifications',
      -- ATENÇÃO: COLA A TUA REST API KEY AQUI:
      headers:='{"Content-Type": "application/json", "Authorization": "Basic SUA_REST_API_KEY"}'::jsonb,
      body:=payload::jsonb
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_novo_documento ON documentos_cliente;
CREATE TRIGGER trigger_novo_documento
AFTER INSERT ON documentos_cliente
FOR EACH ROW
EXECUTE FUNCTION notificar_novo_documento_cliente();
