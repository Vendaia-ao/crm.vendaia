import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Projecto, Empresa, EstadoProjecto, User, ServicoDisponivel } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  Briefcase, Clock, CheckCircle, Search, FileText,
  X, Plus, Trash2, ArrowRight, ArrowLeft, MoreVertical,
  LayoutGrid, List, RefreshCw, AlertCircle, Loader2,
  Calendar, DollarSign, User as UserIcon
} from 'lucide-react';

interface ProjectosProps {
  empresas: Empresa[];
  profiles: User[];
  servicosConfig: ServicoDisponivel[];
  /** Called when App.tsx should refresh its local projectos state */
  onProjectosChanged?: () => void;
}

const LIST_ESTADOS: EstadoProjecto[] = ['Em Produção', 'Em Revisão', 'Pronto para Entrega', 'Entregue'];

function estadoBadge(estado: string) {
  if (estado === 'Em Produção') return 'bg-orange-50 text-orange-700 border-orange-200';
  if (estado === 'Em Revisão') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (estado === 'Pronto para Entrega') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (estado === 'Entregue') return 'bg-slate-50 text-slate-500 border-slate-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function formatKwanza(num: number) {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(num);
}

function formatDate(isoStr: string) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Projectos({ empresas, profiles, servicosConfig, onProjectosChanged }: ProjectosProps) {
  // ─── Data state ──────────────────────────────────────────────────
  const [projectos, setProjectos] = useState<Projecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ─── View / filter ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // ─── Pagination ───────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ─── Edit modal ───────────────────────────────────────────────────
  const [editingProj, setEditingProj] = useState<Projecto | null>(null);
  const [editPrazo, setEditPrazo] = useState('');
  const [editObs, setEditObs] = useState('');

  // ─── Create modal ─────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpresaId, setNewEmpresaId] = useState('');
  const [newServico, setNewServico] = useState('');
  const [newValor, setNewValor] = useState(0);
  const [newResponsavel, setNewResponsavel] = useState('');
  const [newPrazo, setNewPrazo] = useState('');
  const [newObs, setNewObs] = useState('');

  // ─── Table dropdown ───────────────────────────────────────────────
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  // ─── Kanban drag ──────────────────────────────────────────────────
  const [draggedProjId, setDraggedProjId] = useState<string | null>(null);

  // ─── Workflow Modals ──────────────────────────────────────────────
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string; estado: EstadoProjecto } | null>(null);
  
  // Apresentação Modal Fields
  const [showApresentacaoModal, setShowApresentacaoModal] = useState(false);
  const [apresentacaoData, setApresentacaoData] = useState('');
  const [apresentacaoHora, setApresentacaoHora] = useState('');
  const [apresentacaoLocal, setApresentacaoLocal] = useState('');

  // Entrega Modal Fields
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [entregaData, setEntregaData] = useState('');

  // ─────────────────────────────────────────────────────────────────
  // LOAD from Supabase
  // ─────────────────────────────────────────────────────────────────
  const loadProjectos = useCallback(async () => {
    if (!supabase) {
      setError('Supabase não configurado. Verifique as variáveis de ambiente.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('projectos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (err) throw err;
      setProjectos(data || []);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar projectos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjectos();
  }, [loadProjectos]);

  // ─── Real-time subscription ───────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('projectos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projectos' }, () => {
        loadProjectos();
        onProjectosChanged?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadProjectos, onProjectosChanged]);

  // ─── Initialize create modal defaults ────────────────────────────
  useEffect(() => {
    if (showAddModal) {
      if (empresas.length > 0 && !newEmpresaId) setNewEmpresaId(empresas[0].id);
      if (servicosConfig.length > 0 && !newServico) setNewServico(servicosConfig[0]);
      if (profiles.length > 0 && !newResponsavel) setNewResponsavel(profiles[0].nome);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNewPrazo(d.toISOString().split('T')[0]);
    }
  }, [showAddModal, empresas, servicosConfig, profiles]);

  // ─── Pagination auto-reset ────────────────────────────────────────
  const filteredProjectos = useMemo(() => {
    return projectos.filter(proj => {
      const emp = empresas.find(e => e.id === proj.empresa_id);
      const companyName = emp ? emp.nome_empresa.toLowerCase() : '';
      const matchSearch = companyName.includes(searchTerm.toLowerCase()) ||
        proj.servico.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || proj.estado === statusFilter;
      const matchDateInit = dataInicio ? proj.data_inicio >= dataInicio : true;
      const matchDateEnd = dataFim ? proj.data_inicio <= dataFim : true;
      return matchSearch && matchStatus && matchDateInit && matchDateEnd;
    });
  }, [projectos, empresas, searchTerm, statusFilter, dataInicio, dataFim]);

  const totalItems = filteredProjectos.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProjectos = viewMode === 'table'
    ? filteredProjectos.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredProjectos;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, pageSize, currentPage]);

  // ─── KPIs ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalProjetos: projectos.length,
    emProducao: projectos.filter(p => p.estado === 'Em Produção').length,
    emRevisao: projectos.filter(p => p.estado === 'Em Revisão').length,
    prontoEntrega: projectos.filter(p => p.estado === 'Pronto para Entrega').length,
    totalAOA: projectos.reduce((sum, p) => sum + p.valor, 0)
  }), [projectos]);

  // ─────────────────────────────────────────────────────────────────
  // MUTATIONS → Supabase only
  // ─────────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, novoEstado: EstadoProjecto) => {
    setOpenDropdownId(null);
    setDropdownPos(null);

    if (novoEstado === 'Pronto para Entrega') {
      setPendingStatusUpdate({ id, estado: novoEstado });
      setApresentacaoData('');
      setApresentacaoHora('');
      setApresentacaoLocal('');
      setShowApresentacaoModal(true);
      return;
    }
    
    if (novoEstado === 'Entregue') {
      setPendingStatusUpdate({ id, estado: novoEstado });
      const d = new Date();
      setEntregaData(d.toISOString().split('T')[0]);
      setShowEntregaModal(true);
      return;
    }

    await executeStatusUpdate(id, novoEstado);
  };

  const executeStatusUpdate = async (id: string, novoEstado: EstadoProjecto, extraClienteData?: any) => {
    if (!supabase) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from('projectos')
        .update({ estado: novoEstado })
        .eq('id', id);
      if (err) throw err;

      // Optimistic UI
      setProjectos(prev => prev.map(p => p.id === id ? { ...p, estado: novoEstado } : p));

      // If we have extra cliente data (reunião, etc)
      if (extraClienteData) {
        // Need to find cliente_id. Clientes table has projeto_associado = id
        await supabase.from('clientes').update(extraClienteData).eq('projeto_associado', id);
      }

    } catch (e: any) {
      alert(`Erro ao actualizar estado: ${e.message}`);
    } finally {
      setIsSaving(false);
      setOpenDropdownId(null);
      setDropdownPos(null);
      setPendingStatusUpdate(null);
      setShowApresentacaoModal(false);
      setShowEntregaModal(false);
    }
  };

  const handleApresentacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingStatusUpdate) return;
    
    const extraData = {
      estado: 'Apresentação Agendada',
      data_reuniao: apresentacaoData,
      hora_reuniao: apresentacaoHora,
      local_reuniao: apresentacaoLocal
    };

    await executeStatusUpdate(pendingStatusUpdate.id, pendingStatusUpdate.estado, extraData);
  };

  const handleEntregaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingStatusUpdate) return;
    
    const extraData = {
      estado: 'Ativo',
      data_fecho: entregaData // storing delivery date in data_fecho/cadastro context if needed, or observacoes
    };

    // We also should save the delivery date on the project if we had the field, but user requested "regista a data de entrega" on cliente / projecto.
    // For now we add it to the cliente's extra data and also update the project's 'observacoes'
    const proj = projectos.find(p => p.id === pendingStatusUpdate.id);
    if (proj) {
      const novaObs = (proj.observacoes || '') + `\n[ENTREGUE em ${formatDate(entregaData)}]`;
      await supabase.from('projectos').update({ observacoes: novaObs, estado: 'Entregue' }).eq('id', proj.id);
    }

    await executeStatusUpdate(pendingStatusUpdate.id, pendingStatusUpdate.estado, extraData);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj || !supabase) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from('projectos')
        .update({ prazo: editPrazo, observacoes: editObs })
        .eq('id', editingProj.id);
      if (err) throw err;
      setProjectos(prev => prev.map(p =>
        p.id === editingProj.id ? { ...p, prazo: editPrazo, observacoes: editObs } : p
      ));
      setEditingProj(null);
    } catch (e: any) {
      alert(`Erro ao guardar: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSaving(true);
    try {
      const newProj = {
        id: `proj-${Date.now()}`,
        empresa_id: newEmpresaId,
        oportunidade_id: 'manual',
        servico: newServico,
        valor: newValor,
        data_inicio: new Date().toISOString(),
        prazo: newPrazo,
        responsavel: newResponsavel,
        estado: 'Em Produção' as EstadoProjecto,
        observacoes: newObs
      };
      const { error: err } = await supabase.from('projectos').insert(newProj);
      if (err) throw err;
      setProjectos(prev => [newProj, ...prev]);
      setShowAddModal(false);
      // Reset fields
      setNewEmpresaId('');
      setNewServico('');
      setNewValor(0);
      setNewResponsavel('');
      setNewPrazo('');
      setNewObs('');
      onProjectosChanged?.();
    } catch (e: any) {
      alert(`Erro ao criar projecto: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Eliminar este projecto? Esta acção é irreversível.')) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase.from('projectos').delete().eq('id', id);
      if (err) throw err;
      setProjectos(prev => prev.filter(p => p.id !== id));
      onProjectosChanged?.();
    } catch (e: any) {
      alert(`Erro ao eliminar: ${e.message}`);
    } finally {
      setIsSaving(false);
      setOpenDropdownId(null);
      setDropdownPos(null);
    }
  };

  // ─── Dropdown helpers ─────────────────────────────────────────────
  function toggleDropdown(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setDropdownPos({ bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right });
      } else {
        setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      }
      setOpenDropdownId(id);
    }
  }

  // ─── Kanban DnD ───────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProjId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, novaEtapa: EstadoProjecto) => {
    e.preventDefault();
    if (draggedProjId) {
      handleUpdateStatus(draggedProjId, novaEtapa);
      setDraggedProjId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div id="projectos-module" className="space-y-6">

      {/* ── Loading / Error banner ── */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm font-semibold">A carregar projectos da base de dados…</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-none p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Erro de ligação</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadProjectos}
            className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-none hover:bg-red-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── KPI Top board ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Projetos</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{stats.totalProjetos}</span>
            </div>
            <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Produção</span>
              <span className="text-xl font-extrabold text-orange-500 block mt-1">{stats.emProducao}</span>
            </div>
            <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Revisão</span>
              <span className="text-xl font-extrabold text-indigo-500 block mt-1">{stats.emRevisao}</span>
            </div>
            <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Prontos para Entrega</span>
              <span className="text-xl font-extrabold text-emerald-500 block mt-1">{stats.prontoEntrega}</span>
            </div>
            <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm text-center col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Faturação Acumulada</span>
              <span className="text-xs font-black text-slate-500 mt-1 truncate block">{formatKwanza(stats.totalAOA)}</span>
            </div>
          </div>

          {/* ── Filter bar ── */}
          <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar empresa ou serviço..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-none px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="todos">Todos</option>
                  {LIST_ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase">De:</span>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 rounded-none px-2 py-1.5 focus:outline-none" />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Até:</span>
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 rounded-none px-2 py-1.5 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={loadProjectos}
                disabled={loading || isSaving}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-none transition disabled:opacity-40"
                title="Recarregar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* View toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-none border border-slate-200">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-none transition ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Vista Kanban"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-none transition ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Vista Tabela"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                disabled={isSaving}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-none flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                Adicionar Projecto
              </button>
            </div>
          </div>

          {/* ── KANBAN VIEW ── */}
          {viewMode === 'kanban' ? (
            <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
              {LIST_ESTADOS.map(etapa => {
                const cols = filteredProjectos.filter(p => p.estado === etapa);
                return (
                  <div
                    key={etapa}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, etapa)}
                    className="w-80 shrink-0 bg-slate-100/50 p-3 rounded-none border border-slate-200 min-h-[500px] flex flex-col"
                  >
                    <div className={`p-2.5 rounded-none mb-3 flex justify-between items-center bg-white border ${estadoBadge(etapa)}`}>
                      <span className="text-[11px] font-black uppercase tracking-widest">{etapa}</span>
                      <span className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded-none">{cols.length}</span>
                    </div>

                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                      {cols.map(proj => {
                        const emp = empresas.find(e => e.id === proj.empresa_id);
                        return (
                          <div
                            key={proj.id}
                            draggable
                            onDragStart={e => handleDragStart(e, proj.id)}
                            className="bg-white p-4 rounded-none border border-slate-200 shadow-sm hover:shadow transition cursor-grab active:cursor-grabbing text-left group"
                          >
                            <h4 className="font-extrabold text-sm text-slate-800 mb-1 leading-tight">{emp?.nome_empresa || 'Empresa desconhecida'}</h4>
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">{proj.servico}</p>

                            <div className="space-y-1.5 text-[10px] text-slate-500">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold flex items-center gap-1"><UserIcon className="w-3 h-3" /> Responsável:</span>
                                <span className="text-slate-700 font-bold">{proj.responsavel}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> Prazo:</span>
                                <span className="text-orange-600 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatDate(proj.prazo)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                {formatKwanza(proj.valor)}
                              </span>
                              <button
                                onClick={() => { setEditingProj(proj); setEditPrazo(proj.prazo); setEditObs(proj.observacoes || ''); }}
                                className="p-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                                title="Editar Notas"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {cols.length === 0 && (
                        <div className="text-center p-4 text-[11px] font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-none">
                          Arraste projectos para aqui.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── TABLE VIEW ── */
            <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden text-left flex flex-col">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Mostrar</span>
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-[10px] border border-slate-200 rounded-none p-1 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">linhas</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems} registos
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3">Projecto / Empresa</th>
                      <th className="px-5 py-3">Serviço</th>
                      <th className="px-5 py-3">Responsável</th>
                      <th className="px-5 py-3">Prazos</th>
                      <th className="px-5 py-3 text-center">Estado</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {paginatedProjectos.map(proj => {
                      const emp = empresas.find(e => e.id === proj.empresa_id);
                      const isDropdownOpen = openDropdownId === proj.id;

                      return (
                        <tr key={proj.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3">
                            <p className="font-extrabold text-slate-900 truncate max-w-[150px]">{emp?.nome_empresa || 'Desconhecida'}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {proj.id.split('-')[1] || proj.id}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-none text-[10px] uppercase">
                              {proj.servico}
                            </span>
                            <p className="font-black text-slate-800 text-[11px] mt-1">{formatKwanza(proj.valor)}</p>
                          </td>
                          <td className="px-5 py-3 font-semibold">{proj.responsavel}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> {formatDate(proj.data_inicio)}</span>
                              <span className="text-orange-600 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(proj.prazo)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`px-2 py-1 rounded-none text-[9px] uppercase font-black tracking-wider border ${estadoBadge(proj.estado)}`}>
                              {proj.estado}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="relative inline-block text-left">
                              <button onClick={e => toggleDropdown(proj.id, e)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-none">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {isDropdownOpen && dropdownPos && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }} />
                                  <div
                                    style={{ top: dropdownPos.top, bottom: dropdownPos.bottom, right: dropdownPos.right }}
                                    className="fixed w-52 bg-white border border-slate-200 rounded-none shadow-xl z-50 py-1 flex flex-col text-left font-semibold text-xs"
                                  >
                                    <button
                                      onClick={() => { setOpenDropdownId(null); setDropdownPos(null); setEditingProj(proj); setEditPrazo(proj.prazo); setEditObs(proj.observacoes || ''); }}
                                      className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                    >
                                      <FileText className="w-4 h-4 text-blue-500" /> Notas & Prazos
                                    </button>
                                    <div className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex flex-col gap-1 border-t border-slate-100 mt-1 pt-2">
                                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mudar Estado</span>
                                      <select
                                        value={proj.estado}
                                        onChange={e => handleUpdateStatus(proj.id, e.target.value as EstadoProjecto)}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-1"
                                      >
                                        {LIST_ESTADOS.map(et => <option key={et} value={et}>{et}</option>)}
                                      </select>
                                    </div>
                                    <button
                                      onClick={() => handleDelete(proj.id)}
                                      className="px-4 py-2 mt-1 border-t border-slate-100 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Eliminar Projecto
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedProjectos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic">
                          Nenhum projecto corresponde à sua pesquisa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 bg-white flex justify-end items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-1.5 rounded-none border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black text-slate-600 px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 rounded-none border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── EDIT MODAL ── */}
      {editingProj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setEditingProj(null)}>
          <div className="bg-white rounded-none shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Editar Prazos & Notas</h3>
              <button onClick={() => setEditingProj(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Novo Prazo Acordado *</label>
                <input type="date" required value={editPrazo} onChange={e => setEditPrazo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Notas de Entrega / Detalhes</label>
                <textarea rows={4} value={editObs} onChange={e => setEditObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Ex: Cliente solicitou mudança nas cores..." />
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button type="submit" disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold transition flex items-center gap-2 disabled:opacity-50">
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Guardar Modificações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-none shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-500" /> Criar Projecto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs font-semibold max-h-[80vh] overflow-y-auto">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-none text-[10px] font-bold border border-blue-100 mb-2">
                Nota: Geralmente os projectos são criados automaticamente pelo CRM quando um Lead fecha negócio. Use isto para excepções manuais.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Empresa Associada *</label>
                  <select required value={newEmpresaId} onChange={e => setNewEmpresaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    <option value="">Selecionar empresa...</option>
                    {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_empresa}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Serviço Solicitado *</label>
                  <select required value={newServico} onChange={e => setNewServico(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    {servicosConfig.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Valor Contratual (AOA) *</label>
                  <input type="number" required min={0} value={newValor} onChange={e => setNewValor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Responsável Técnico *</label>
                  <select required value={newResponsavel} onChange={e => setNewResponsavel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    {profiles.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Prazo Inicial de Entrega *</label>
                  <input type="date" required value={newPrazo} onChange={e => setNewPrazo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Observações de Produção</label>
                <textarea rows={3} value={newObs} onChange={e => setNewObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none resize-none"
                  placeholder="..." />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" disabled={isSaving}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-bold transition flex items-center gap-2 disabled:opacity-50">
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Adicionar Projecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APRESENTACAO */}
      {showApresentacaoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-xl w-full max-w-sm overflow-hidden text-left border border-slate-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-sm">Agendar Apresentação</h3>
              <button onClick={() => setShowApresentacaoModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApresentacaoSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data da Apresentação</label>
                <input
                  type="date"
                  required
                  value={apresentacaoData}
                  onChange={e => setApresentacaoData(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 rounded-none outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                <input
                  type="time"
                  required
                  value={apresentacaoHora}
                  onChange={e => setApresentacaoHora(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 rounded-none outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Local / Link Reunião</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Google Meet ou Escritório"
                  value={apresentacaoLocal}
                  onChange={e => setApresentacaoLocal(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 rounded-none outline-none"
                />
              </div>
              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowApresentacaoModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-none hover:bg-slate-50 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-none hover:bg-emerald-700 text-sm font-bold transition flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENTREGA */}
      {showEntregaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-xl w-full max-w-sm overflow-hidden text-left border border-slate-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-sm">Registar Entrega de Projecto</h3>
              <button onClick={() => setShowEntregaModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEntregaSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Ao marcar como entregue, o estado do cliente mudará automaticamente para "Cliente Ativo".
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Entrega</label>
                <input
                  type="date"
                  required
                  value={entregaData}
                  onChange={e => setEntregaData(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 rounded-none outline-none"
                />
              </div>
              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEntregaModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-none hover:bg-slate-50 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 text-sm font-bold transition flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Registar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
