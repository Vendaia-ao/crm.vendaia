export type UserProfile = 'Comercial' | 'Operacional';

export interface User {
  id: string;
  email: string;
  nome: string;
  perfil: UserProfile;
  permissoes?: string; // Comma separated allowed modules (e.g. 'dashboard,empresas,pipeline,projectos,utilizadores')
}

export interface Empresa {
  id: string;
  nome_empresa: string;
  nicho: string;
  cidade: string;
  endereco: string;
  website_actual?: string;
  instagram?: string;
  facebook?: string;
  telefone_principal: string;
  observacoes?: string;
  data_cadastro: string; // ISO string
}

export interface Contacto {
  id: string;
  empresa_id: string;
  nome: string;
  cargo: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  observacoes?: string;
}

export type ServicoDisponivel =
  | 'Website'
  | 'Email Corporativo'
  | 'Branding'
  | 'Social Media'
  | 'Tráfego Pago'
  | 'Sistema Personalizado'
  | 'Consultoria Tecnológica';

export type PipelineEtapa =
  | 'Lead Captado'
  | 'Primeiro Contacto'
  | 'Reunião Agendada'
  | 'Reunião Realizada'
  | 'Proposta Apresentada'
  | 'Negociação'
  | 'Fechado'
  | 'Perdido';

export type MotivoPerda =
  | 'Sem orçamento'
  | 'Não vê necessidade'
  | 'Vai pensar'
  | 'Concorrente'
  | 'Sem resposta'
  | 'Outro';

export type OrigemLead =
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'Indicação'
  | 'Website'
  | 'Evento'
  | 'Ligação fria'
  | 'Outro';

export interface Oportunidade {
  id: string;
  empresa_id: string;
  servico: ServicoDisponivel;
  valor_estimado: number;
  responsavel: string; // 'Director Comercial' | 'Director Operacional'
  data_entrada: string; // ISO string
  observacoes?: string;
  etapa: PipelineEtapa;
  motivo_perda?: MotivoPerda;
  motivo_perda_detalhe?: string; // If 'Outro' or extra commentary
  origem: OrigemLead;
}

export type EstadoProjecto =
  | 'Em Produção'
  | 'Em Revisão'
  | 'Pronto para Entrega'
  | 'Apresentação Agendada'
  | 'Entregue';

export interface Projecto {
  id: string;
  empresa_id: string;
  cliente_id?: string;
  servico: ServicoDisponivel | string;
  valor: number;
  data_inicio: string; // ISO string
  prazo: string; // Date string or ISO
  responsavel: string; // Technical lead name
  estado: EstadoProjecto;
  observacoes?: string;
  oportunidade_id: string;
}

export type EstadoCliente =
  | 'Aguardando Apresentação'
  | 'Apresentação Agendada'
  | 'Apresentação Realizada'
  | 'Cliente Ativo'
  | 'Cliente Inativo';

export type ProximaAcaoComercial =
  | 'Ligar para Cliente'
  | 'Agendar Reunião'
  | 'Apresentar Projeto'
  | 'Solicitar Feedback'
  | 'Propor Novo Serviço'
  | '';

export interface Cliente {
  id: string;
  nome_empresa: string;
  contacto_principal: string;
  telefone: string;
  email: string;
  servico_contratado: string;
  valor_negocio: number;
  data_fecho: string; // ISO string
  projeto_associado?: string;
  estado: EstadoCliente;
  data_reuniao?: string;
  hora_reuniao?: string;
  local_reuniao?: string;
  observacoes_reuniao?: string;
  proxima_acao?: ProximaAcaoComercial;
}

export interface HistoricoItem {
  id: string;
  empresa_id: string;
  autor: string;
  data: string; // ISO string
  tipo: 'cadastro' | 'contacto' | 'oportunidade' | 'etapa_mudança' | 'projeto' | 'nota' | 'cliente';
  descricao: string;
}

