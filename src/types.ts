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
  | 'Entregue'
  | 'Cliente Activo';

export interface Projecto {
  id: string;
  empresa_id: string;
  servico: ServicoDisponivel;
  valor: number;
  data_inicio: string; // ISO string
  prazo: string; // Date string or ISO
  responsavel: string; // 'Director Comercial' | 'Director Operacional'
  estado: EstadoProjecto;
  observacoes?: string;
  oportunidade_id: string;
}

export interface HistoricoItem {
  id: string;
  empresa_id: string;
  autor: string;
  data: string; // ISO string
  tipo: 'cadastro' | 'contacto' | 'oportunidade' | 'etapa_mudança' | 'projeto' | 'nota';
  descricao: string;
}
