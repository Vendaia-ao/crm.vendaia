import React, { useState, useMemo } from 'react';
import { Oportunidade, Empresa, Contacto, PipelineEtapa, ServicoDisponivel, OrigemLead, MotivoPerda, User as UserType } from '../types';
import {
  Plus,
  Trash2,
  Filter,
  DollarSign,
  User,
  FileText,
  HelpCircle,
  HelpCircle as QuestionMark,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  AlertOctagon,
  X,
  Share2,
  Phone,
  Mail,
  MoreVertical,
  MapPin,
  Building2
} from 'lucide-react';

interface PipelineProps {
  oportunidades: Oportunidade[];
  empresas: Empresa[];
  contactos: Contacto[];
  currentUser: string;
  onAddOportunidade: (oportunidade: Omit<Oportunidade, 'id' | 'data_entrada'>) => void;
  onUpdateOportunidadeEtapa: (id: string, novaEtapa: PipelineEtapa, motivoPerda?: MotivoPerda, perdaDetalhe?: string) => void;
  onDeleteOportunidade: (id: string) => void;
  onAddEmpresa: (empresa: Omit<Empresa, 'id' | 'data_cadastro'>, contacts?: Omit<Contacto, 'id' | 'empresa_id'>[]) => void;
  profiles: UserType[];
  servicosConfig: string[];
}

const ETAPAS_ORDENADAS: PipelineEtapa[] = [
  'Lead Captado',
  'Primeiro Contacto',
  'Reunião Agendada',
  'Reunião Realizada',
  'Proposta Apresentada',
  'Negociação',
  'Fechado',
  'Perdido'
];

export default function Pipeline({
  oportunidades,
  empresas,
  contactos = [],
  currentUser,
  onAddOportunidade,
  onUpdateOportunidadeEtapa,
  onDeleteOportunidade,
  onAddEmpresa,
  profiles,
  servicosConfig
}: PipelineProps) {

  // State variables
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerdaModal, setShowPerdaModal] = useState(false);
  const [perdaLeadId, setPerdaLeadId] = useState<string | null>(null);
  const [pendingEtapaChange, setPendingEtapaChange] = useState<PipelineEtapa | null>(null);
  const [phoneModalLead, setPhoneModalLead] = useState<Oportunidade | null>(null);

  const handleAdvanceEtapa = (lead: Oportunidade) => {
    const currentIndex = ETAPAS_ORDENADAS.indexOf(lead.etapa);
    if (currentIndex >= 0 && currentIndex < ETAPAS_ORDENADAS.length - 1) {
      const nextEtapa = ETAPAS_ORDENADAS[currentIndex + 1];
      if (nextEtapa === 'Perdido') {
        requestStageUpdate(lead.id, 'Perdido');
      } else {
        onUpdateOportunidadeEtapa(lead.id, nextEtapa);
      }
    }
  };

  // Filters within pipeline
  const [filterResponsavel, setFilterResponsavel] = useState('todos');
  const [filterServico, setFilterServico] = useState('todos');
  const [filterEtapa, setFilterEtapa] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Open dropdown states for rows
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form fields for new Oportunidade
  const [newOptEmpresaId, setNewOptEmpresaId] = useState('');
  const [newOptServico, setNewOptServico] = useState<string>('');
  const [newOptValor, setNewOptValor] = useState<number>(1200000);
  const [newOptResponsavel, setNewOptResponsavel] = useState('');
  const [newOptOrigem, setNewOptOrigem] = useState<OrigemLead>('Instagram');
  const [newOptObs, setNewOptObs] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form fields for new Empresa in Pipeline
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNicho, setNewEmpNicho] = useState('');
  const [newEmpCidade, setNewEmpCidade] = useState('');
  const [newEmpEndereco, setNewEmpEndereco] = useState('');
  const [newEmpWeb, setNewEmpWeb] = useState('');
  const [newEmpInsta, setNewEmpInsta] = useState('');
  const [newEmpFb, setNewEmpFb] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpObs, setNewEmpObs] = useState('');
  
  // Optional contact fields inside company registration
  const [newEmpConNome, setNewEmpConNome] = useState('');
  const [newEmpConCargo, setNewEmpConCargo] = useState('');
  const [newEmpConEmail, setNewEmpConEmail] = useState('');
  const [newEmpConTel, setNewEmpConTel] = useState('');

  // Auto initialize responsible and services if empty
  React.useEffect(() => {
    if (profiles && profiles.length > 0 && !newOptResponsavel) {
      newOptResponsavel || setNewOptResponsavel(profiles[0].nome);
    }
  }, [profiles]);

  React.useEffect(() => {
    if (servicosConfig && servicosConfig.length > 0 && !newOptServico) {
      newOptServico || setNewOptServico(servicosConfig[0]);
    }
  }, [servicosConfig]);

  // Form fields for Motivo de Perda
  const [perdaMotivo, setPerdaMotivo] = useState<MotivoPerda>('Sem orçamento');
  const [perdaMotivoDetalhe, setPerdaMotivoDetalhe] = useState('');

  // Drag State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Services available
  const listServicos = servicosConfig;

  // Lead Origins
  const listOrigens: OrigemLead[] = [
    'Instagram',
    'Facebook',
    'LinkedIn',
    'Indicação',
    'Website',
    'Evento',
    'Ligação fria',
    'Outro'
  ];

  // Loss Reasons
  const listMotivosPerda: MotivoPerda[] = [
    'Sem orçamento',
    'Não vê necessidade',
    'Vai pensar',
    'Concorrente',
    'Sem resposta',
    'Outro'
  ];

  // Filter opportunities
  const filteredOportunidades = useMemo(() => {
    return oportunidades.filter(opt => {
      if (filterResponsavel !== 'todos' && opt.responsavel !== filterResponsavel) return false;
      if (filterServico !== 'todos' && opt.servico !== filterServico) return false;
      if (filterEtapa !== 'todos' && opt.etapa !== filterEtapa) return false;
      
      // Date filtering
      if (dataInicio && opt.data_entrada < dataInicio) return false;
      if (dataFim && opt.data_entrada > dataFim) return false;

      return true;
    });
  }, [oportunidades, filterResponsavel, filterServico, filterEtapa, dataInicio, dataFim]);

  // Grouped by stage
  const colsData = useMemo(() => {
    const map: Record<PipelineEtapa, { leads: Oportunidade[]; totalValue: number }> = {
      'Lead Captado': { leads: [], totalValue: 0 },
      'Primeiro Contacto': { leads: [], totalValue: 0 },
      'Reunião Agendada': { leads: [], totalValue: 0 },
      'Reunião Realizada': { leads: [], totalValue: 0 },
      'Proposta Apresentada': { leads: [], totalValue: 0 },
      'Negociação': { leads: [], totalValue: 0 },
      'Fechado': { leads: [], totalValue: 0 },
      'Perdido': { leads: [], totalValue: 0 }
    };

    filteredOportunidades.forEach(opt => {
      if (map[opt.etapa]) {
        map[opt.etapa].leads.push(opt);
        map[opt.etapa].totalValue += opt.valor_estimado;
      }
    });

    return map;
  }, [filteredOportunidades]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Trigger stage update request
  const requestStageUpdate = (id: string, targetEtapa: PipelineEtapa) => {
    if (targetEtapa === 'Perdido') {
      // Must prompt reason for loss
      setPerdaLeadId(id);
      setPendingEtapaChange(targetEtapa);
      setPerdaMotivo('Sem orçamento');
      setPerdaMotivoDetalhe('');
      setShowPerdaModal(true);
    } else {
      onUpdateOportunidadeEtapa(id, targetEtapa);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent, targetEtapa: PipelineEtapa) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!id) return;

    requestStageUpdate(id, targetEtapa);
    setDraggedLeadId(null);
  };

  // Submit opportunity addition
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptEmpresaId) {
      alert('Selecione uma empresa válida para a oportunidade!');
      return;
    }

    onAddOportunidade({
      empresa_id: newOptEmpresaId,
      servico: newOptServico as any,
      valor_estimado: Number(newOptValor),
      responsavel: newOptResponsavel || currentUser,
      origem: newOptOrigem,
      observacoes: newOptObs,
      etapa: 'Lead Captado'
    });

    // Reset
    setNewOptEmpresaId('');
    setNewOptServico(servicosConfig[0] || '');
    setNewOptValor(1200000);
    setNewOptResponsavel(profiles[0]?.nome || '');
    setNewOptOrigem('Instagram');
    setNewOptObs('');
    setShowAddModal(false);
  };

  const handleCreateEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPhone) {
      alert('Nome da Empresa e Telefone Principal são obrigatórios!');
      return;
    }
    
    let contactsToSubmit = [];
    if (newEmpConNome.trim()) {
      contactsToSubmit.push({
        nome: newEmpConNome.trim(),
        cargo: newEmpConCargo || '',
        telefone: newEmpConTel || '',
        whatsapp: '',
        email: newEmpConEmail || '',
        observacoes: ''
      });
    }

    onAddEmpresa({
      nome_empresa: newEmpName,
      nicho: newEmpNicho,
      cidade: newEmpCidade,
      endereco: newEmpEndereco,
      website_actual: newEmpWeb,
      instagram: newEmpInsta,
      facebook: newEmpFb,
      telefone_principal: newEmpPhone,
      observacoes: newEmpObs
    }, contactsToSubmit);

    // Reset fields
    setNewEmpName('');
    setNewEmpNicho('');
    setNewEmpCidade('');
    setNewEmpEndereco('');
    setNewEmpWeb('');
    setNewEmpInsta('');
    setNewEmpFb('');
    setNewEmpPhone('');
    setNewEmpObs('');
    setNewEmpConNome('');
    setNewEmpConCargo('');
    setNewEmpConEmail('');
    setNewEmpConTel('');
    setShowCreateModal(false);
  };

  // Submit Loss Reason validation
  const handlePerdaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perdaLeadId) return;

    onUpdateOportunidadeEtapa(
      perdaLeadId,
      'Perdido',
      perdaMotivo,
      perdaMotivoDetalhe
    );

    setShowPerdaModal(false);
    setPerdaLeadId(null);
    setPendingEtapaChange(null);
  };

  // Currency helper
  const formatKwanzaShort = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M AOA`;
    }
    return `${(val / 1000).toFixed(0)}k AOA`;
  };

  const formatKwanzaFull = (v: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);
  };

  return (
    <div id="pipeline-module" className="space-y-6">

      {/* Top filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-450 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-orange-500" />
            Filtrar Kanban:
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Responsável:</span>
            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-650 font-bold rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="todos">Todos os Responsáveis</option>
              {profiles.map(p => (
                <option key={p.id} value={p.nome}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Serviço:</span>
            <select
              value={filterServico}
              onChange={(e) => setFilterServico(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="todos">Todos os Serviços</option>
              {listServicos.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Fase/Estágio:</span>
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-650 font-bold rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="todos">Todas as Fases</option>
              {ETAPAS_ORDENADAS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-slate-400 font-bold uppercase">De:</span>
            <input 
              type="date" 
              value={dataInicio} 
              onChange={e => setDataInicio(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded px-2.5 py-1.5 focus:outline-none"
            />
            <span className="text-xs text-slate-400 font-bold uppercase">Até:</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={e => setDataFim(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded px-2.5 py-1.5 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Visual Mode Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-[11px] font-black rounded text-slate-800 transition cursor-pointer select-none ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tabela (Fácil Avanço)
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-[11px] font-black rounded text-slate-800 transition cursor-pointer select-none ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Kanban Board
            </button>
          </div>

          <button
            onClick={() => {
              if (empresas.length > 0) {
                setNewOptEmpresaId(empresas[0].id);
              }
              // Set default service and responsible
              setNewOptServico(servicosConfig[0] || '');
              setNewOptResponsavel(profiles[0]?.nome || '');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-orange-500" />
            Captar Lead
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-0.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Interactive Layout Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Serviço</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Responsável</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-5 py-3 text-center">Fase/Estágio</th>
                  <th className="px-5 py-3 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-705">
                {filteredOportunidades.map(lead => {
                  const empVal = empresas.find(e => e.id === lead.empresa_id);
                  const currentIndex = ETAPAS_ORDENADAS.indexOf(lead.etapa);
                  const canAdvance = currentIndex < ETAPAS_ORDENADAS.length - 2;
                  const isDropdownOpen = openDropdownId === lead.id;

                  let badgeBg = 'bg-slate-100 text-slate-700';
                  if (lead.etapa === 'Fechado') {
                    badgeBg = 'bg-emerald-100 text-emerald-800 font-extrabold';
                  } else if (lead.etapa === 'Perdido') {
                    badgeBg = 'bg-red-100 text-red-800 font-extrabold';
                  } else if (lead.etapa === 'Negociação' || lead.etapa === 'Proposta Apresentada') {
                    badgeBg = 'bg-amber-100 text-amber-800 font-bold';
                  } else if (lead.etapa === 'Reunião Agendada' || lead.etapa === 'Reunião Realizada') {
                    badgeBg = 'bg-purple-100 text-purple-800 font-bold';
                  } else if (lead.etapa === 'Primeiro Contacto') {
                    badgeBg = 'bg-blue-100 text-blue-800 font-bold';
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3">
                        <p className="font-extrabold text-slate-900 truncate max-w-[150px]">{empVal ? empVal.nome_empresa : 'Desconhecida'}</p>
                        {empVal?.cidade && <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{empVal.cidade}</p>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(lead.data_entrada).toLocaleDateString('pt-AO')}
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                          {lead.servico}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-extrabold text-slate-900">
                        {formatKwanzaFull(lead.valor_estimado)}
                      </td>
                      <td className="px-5 py-4 text-slate-650 font-bold">
                        {lead.responsavel}
                      </td>
                      <td className="px-4 py-4 text-slate-500 font-medium">
                        <span className="text-[10px] uppercase font-mono bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                          {lead.origem}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${badgeBg}`}>
                            {lead.etapa}
                          </span>
                          {lead.etapa === 'Perdido' && lead.motivo_perda && (
                            <span className="text-[9px] text-red-500 italic block">
                              ({lead.motivo_perda})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(isDropdownOpen ? null : lead.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 flex flex-col text-left font-semibold text-xs">
                                
                                <button
                                  onClick={() => { setOpenDropdownId(null); setPhoneModalLead(lead); }}
                                  className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 w-full text-left"
                                >
                                  <Phone className="w-4 h-4 text-orange-500" /> Detalhes & Contactos
                                </button>

                                {canAdvance && (
                                  <button
                                    onClick={() => { setOpenDropdownId(null); handleAdvanceEtapa(lead); }}
                                    className="px-4 py-2 hover:bg-slate-50 text-emerald-600 flex items-center gap-2 w-full text-left"
                                  >
                                    <ArrowRight className="w-4 h-4" /> Avançar Fase
                                  </button>
                                )}

                                <div className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex flex-col gap-1 border-t border-slate-100 mt-1 pt-2">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mudar Etapa Manual</span>
                                  <select
                                    value={lead.etapa}
                                    onChange={(e) => { setOpenDropdownId(null); requestStageUpdate(lead.id, e.target.value as PipelineEtapa); }}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1"
                                  >
                                    {ETAPAS_ORDENADAS.map(et => (
                                      <option key={et} value={et}>{et}</option>
                                    ))}
                                  </select>
                                </div>

                                {lead.etapa !== 'Fechado' && lead.etapa !== 'Perdido' && (
                                  <button
                                    onClick={() => { setOpenDropdownId(null); requestStageUpdate(lead.id, 'Perdido'); }}
                                    className="px-4 py-2 mt-1 hover:bg-red-50 text-red-600 flex items-center gap-2 w-full text-left border-t border-slate-100"
                                  >
                                    ✕ Marcar como Perdido
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    if (confirm('Eliminar esta oportunidade do histórico?')) {
                                      onDeleteOportunidade(lead.id);
                                    }
                                  }}
                                  className="px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" /> Eliminar Registo
                                </button>

                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOportunidades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic bg-white">
                      Nenhum negócio ativo ou correspondente aos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[550px]">
          {ETAPAS_ORDENADAS.map(etapa => {
            const col = colsData[etapa];
            const isClosedWon = etapa === 'Fechado';
            const isClosedLost = etapa === 'Perdido';

            let columnHeaderBg = 'bg-slate-50';
            let titleColor = 'text-slate-800';
            if (isClosedWon) {
              columnHeaderBg = 'bg-emerald-50/70 border border-emerald-100';
              titleColor = 'text-emerald-800';
            } else if (isClosedLost) {
              columnHeaderBg = 'bg-red-50/70 border border-red-100';
              titleColor = 'text-red-800';
            }

            return (
              <div
                key={etapa}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, etapa)}
                className="w-72 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 min-h-[500px] flex flex-col transition-all duration-200"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl mb-3 space-y-1 ${columnHeaderBg}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black tracking-tight uppercase ${titleColor}`}>
                      {etapa}
                    </span>
                    <span className="text-[10px] bg-white font-bold text-slate-500 px-1.5 py-0.5 rounded-full shadow-sm">
                      {col.leads.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-extrabold">
                    <TrendingUp className="w-3 h-3 text-orange-400" />
                    <span>{formatKwanzaShort(col.totalValue)}</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
                  {col.leads.map(lead => {
                    const empObj = empresas.find(e => e.id === lead.empresa_id);
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition cursor-grab active:cursor-grabbing text-left space-y-2.5 group relative"
                      >
                        {/* Top labels */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.5 rounded">
                            {lead.servico}
                          </span>

                          {/* Quick controls to move stage easily */}
                          <div className="flex gap-1">
                            <select
                              value={lead.etapa}
                              onChange={(e) => requestStageUpdate(lead.id, e.target.value as PipelineEtapa)}
                              className="text-[9px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1 text-slate-600 focus:outline-none cursor-pointer"
                            >
                              {ETAPAS_ORDENADAS.map(et => (
                                <option key={et} value={et}>{et}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                if (confirm('Eliminar esta oportunidade do histórico?')) {
                                  onDeleteOportunidade(lead.id);
                                }
                              }}
                              className="text-slate-350 hover:text-red-500 rounded p-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              title="Remover Lead"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-orange-500 transition">
                            {empObj ? empObj.nome_empresa : 'Empresa Indefinida'}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <User className="w-2.5 h-2.5 text-slate-300" />
                            <span>{lead.responsavel}</span>
                          </div>
                        </div>

                        {/* Financial Value */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                          <span className="text-xs font-black text-indigo-950 font-mono">
                            {formatKwanzaFull(lead.valor_estimado)}
                          </span>
                          <span className="text-[9px] bg-orange-50 text-orange-655 font-bold px-1.5 rounded-full uppercase tracking-wider">
                            {lead.origem}
                          </span>
                        </div>

                        {/* Ligar action button on card */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoneModalLead(lead);
                          }}
                          className="w-full mt-1.5 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-extrabold text-[10px] uppercase rounded-lg border border-slate-205 hover:border-orange-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Ligar para Contactos"
                        >
                          <Phone className="w-3 h-3 text-orange-500" />
                          Ligar
                        </button>

                        {/* Loss Reason details display on card */}
                        {lead.etapa === 'Perdido' && lead.motivo_perda && (
                          <div className="p-1 px-2 bg-red-50 rounded text-[9px] text-red-650 font-medium">
                            Motivo: <span className="font-bold">{lead.motivo_perda}</span>
                            {lead.motivo_perda_detalhe && (
                              <p className="italic text-[8px] mt-0.5">"{lead.motivo_perda_detalhe}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {col.leads.length === 0 && (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-350 text-[11px] italic">
                      Nenhum negócio ativo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standalone Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase">
                <Building2 className="w-5 h-5 text-orange-500" />
                Captar Nova Oportunidade
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Empresa de Destino *</label>
                <select
                  required
                  value={newOptEmpresaId}
                  onChange={(e) => setNewOptEmpresaId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="" disabled>Escolha do directório...</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome_empresa}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Serviço Proposto</label>
                <select
                  value={newOptServico}
                  onChange={(e) => setNewOptServico(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium"
                >
                  {listServicos.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Valor Estimado do Negócio (AOA) *</label>
                <input
                  type="number"
                  required
                  value={newOptValor}
                  onChange={(e) => setNewOptValor(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Responsável Comercial</label>
                  <select
                    value={newOptResponsavel}
                    onChange={(e) => setNewOptResponsavel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.nome}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Origem do Lead</label>
                  <select
                    value={newOptOrigem}
                    onChange={(e) => setNewOptOrigem(e.target.value as OrigemLead)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {listOrigens.map(ori => (
                      <option key={ori} value={ori}>{ori}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Observações Chave</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pediram orçamento urgente."
                  value={newOptObs}
                  onChange={(e) => setNewOptObs(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Confirmar Captura
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MOTIVO DE PERDA MODAL */}
      {showPerdaModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left"
          onClick={() => {
            setShowPerdaModal(false);
            setPerdaLeadId(null);
            setPendingEtapaChange(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-red-600 text-white flex justify-between items-center">
              <h3 className="font-extrabold flex items-center gap-2 text-xs uppercase tracking-wider">
                <AlertOctagon className="w-5 h-5" />
                Especificar Motivo de Perda
              </h3>
              <button onClick={() => {
                setShowPerdaModal(false);
                setPerdaLeadId(null);
                setPendingEtapaChange(null);
              }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePerdaSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 font-medium leading-relaxed">
                Antes de marcar esta oportunidade como <span className="font-bold text-red-655">Perdida</span>, indique obrigatoriamente a justificativa para futuras métricas de melhoria de conversão da Vendaia.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Motivo Chave *</label>
                <select
                  required
                  value={perdaMotivo}
                  onChange={(e) => setPerdaMotivo(e.target.value as MotivoPerda)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {listMotivosPerda.map(mot => (
                    <option key={mot} value={mot}>{mot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Feedback Adicional / Detalhes</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Disse que o concorrente X ofereceu plano gratuito de redes sociais."
                  value={perdaMotivoDetalhe}
                  onChange={(e) => setPerdaMotivoDetalhe(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPerdaModal(false);
                    setPerdaLeadId(null);
                    setPendingEtapaChange(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50"
                >
                  Voltar atrás
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition uppercase cursor-pointer"
                >
                  Marcar Negócio Perdido
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Contact Picker Modal for Calling */}
      {phoneModalLead && (() => {
        const companyId = phoneModalLead.empresa_id;
        const currentEmpresa = empresas.find(e => e.id === companyId);
        const relatedContacts = contactos.filter(c => c.empresa_id === companyId);

        return (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left"
            onClick={() => setPhoneModalLead(null)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-900 rounded-lg text-orange-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                      Escolha o Contacto para Ligar
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Empresa: <span className="text-orange-400 font-extrabold">{currentEmpresa?.nome_empresa}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPhoneModalLead(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                  Contacto Geral da Empresa
                </div>

                {currentEmpresa?.telefone_principal ? (
                  <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-orange-50/20 border border-slate-200 rounded-xl transition">
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Linha Principal / Geral</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Telefone Comercial Registado</p>
                      <p className="text-xs font-mono text-slate-705 mt-1 font-bold">{currentEmpresa.telefone_principal}</p>
                    </div>
                    <div>
                      <a
                        href={`tel:${currentEmpresa.telefone_principal}`}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Ligar
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">Nenhum telefone comercial geral registado.</p>
                )}

                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pt-2 pb-1.5">
                  Contactos de Decisores / Pontos de Contacto ({relatedContacts.length})
                </div>

                {relatedContacts.length > 0 ? (
                  <div className="space-y-2.5">
                    {relatedContacts.map(con => (
                      <div key={con.id} className="p-3 border border-slate-200 rounded-xl bg-white hover:border-orange-200 hover:bg-orange-50/10 transition space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{con.cargo || 'Directório'}</span>
                            <h4 className="font-black text-slate-900 text-xs mt-1">{con.nome}</h4>
                            <p className="text-[10.5px] font-mono text-slate-700 font-bold mt-1">{con.telefone}</p>
                            {con.email && (
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {con.email}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            {con.whatsapp && (
                              <a
                                href={`https://wa.me/${con.whatsapp.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg border border-emerald-200 transition cursor-pointer flex items-center justify-center"
                                title="WhatsApp Directo"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.988 3.311 1.485 5.351 1.486 5.4 0 9.79-4.386 9.793-9.782.002-2.614-1.011-5.071-2.854-6.914-1.841-1.841-4.29-2.854-6.907-2.855-5.399 0-9.789 4.387-9.792 9.785-.001 1.91.49 3.775 1.42 5.41L1.948 22.1l6.099-1.6l.6.354z" />
                                </svg>
                              </a>
                            )}
                            <a
                              href={`tel:${con.telefone}`}
                              className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1 cursor-pointer"
                              title="Ligar para telemóveis"
                            >
                              <Phone className="w-3.5 h-3.5" /> Ligar
                            </a>
                          </div>
                        </div>

                        {con.observacoes && (
                          <div className="text-[9px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                            Obs: "{con.observacoes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">Esta empresa ainda não possui decisores/contactos secundários registados no diretório comercial.</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPhoneModalLead(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition overflow-hidden cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CREATE COMPANY MODAL IN PIPELINE */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase">
                <Building2 className="w-5 h-5 text-orange-500" />
                Adicionar Nova Empresa
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmpresaSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Nome da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sodiba S.A."
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Nicho Comercial</label>
                  <input
                    type="text"
                    placeholder="Ex: Alimentar, Imobiliário"
                    value={newEmpNicho}
                    onChange={(e) => setNewEmpNicho(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Telefone Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +244 9..."
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Cidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Luanda"
                    value={newEmpCidade}
                    onChange={(e) => setNewEmpCidade(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Talatona"
                    value={newEmpEndereco}
                    onChange={(e) => setNewEmpEndereco(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Website</label>
                  <input
                    type="text"
                    placeholder="Ex: www.empresa.com"
                    value={newEmpWeb}
                    onChange={(e) => setNewEmpWeb(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Instagram</label>
                  <input
                    type="text"
                    placeholder="Ex: @empresa"
                    value={newEmpInsta}
                    onChange={(e) => setNewEmpInsta(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Observações Operacionais</label>
                  <textarea
                    rows={2}
                    placeholder="Alguma nota chave?"
                    value={newEmpObs}
                    onChange={(e) => setNewEmpObs(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  ></textarea>
                </div>

                {/* Optional Contact Fields */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-500" />
                    Contacto Associado (Opcional)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-650 mb-0.5">Nome do Contacto</label>
                      <input
                        type="text"
                        placeholder="Ex: Pedro Santos"
                        value={newEmpConNome}
                        onChange={(e) => setNewEmpConNome(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-650 mb-0.5">Cargo</label>
                      <input
                        type="text"
                        placeholder="Ex: Gestor"
                        value={newEmpConCargo}
                        onChange={(e) => setNewEmpConCargo(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-650 mb-0.5">Email</label>
                      <input
                        type="email"
                        placeholder="Ex: pedro@empresa.com"
                        value={newEmpConEmail}
                        onChange={(e) => setNewEmpConEmail(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-650 mb-0.5">Telefone</label>
                      <input
                        type="text"
                        placeholder="Ex: 923..."
                        value={newEmpConTel}
                        onChange={(e) => setNewEmpConTel(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
