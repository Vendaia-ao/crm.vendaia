import React, { useState, useMemo } from 'react';
import { Projecto, Empresa, EstadoProjecto, Cliente, User, ServicoDisponivel } from '../types';
import { 
  Briefcase, Clock, CheckCircle, Search, FileText, 
  X, Plus, Trash2, ArrowRight, ArrowLeft, MoreVertical, LayoutGrid, List
} from 'lucide-react';

interface ProjectosProps {
  projectos: Projecto[];
  empresas: Empresa[];
  clientes: Cliente[];
  profiles: User[];
  servicosConfig: ServicoDisponivel[];
  onUpdateProjectoStatus: (id: string, novoEstado: EstadoProjecto) => void;
  onUpdateProjectoPrazoObs: (id: string, novoPrazo: string, novasObs: string) => void;
  onAddProjecto: (projecto: Omit<Projecto, 'id' | 'data_inicio'>) => void;
  onDeleteProjecto: (id: string) => void;
}

export default function Projectos({
  projectos, empresas, clientes, profiles, servicosConfig,
  onUpdateProjectoStatus, onUpdateProjectoPrazoObs, onAddProjecto, onDeleteProjecto
}: ProjectosProps) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit fields modal
  const [editingProj, setEditingProj] = useState<Projecto | null>(null);
  const [editPrazo, setEditPrazo] = useState('');
  const [editObs, setEditObs] = useState('');

  // Create modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpresaId, setNewEmpresaId] = useState('');
  const [newClienteId, setNewClienteId] = useState('');
  const [newServico, setNewServico] = useState('');
  const [newValor, setNewValor] = useState(0);
  const [newResponsavel, setNewResponsavel] = useState('');
  const [newPrazo, setNewPrazo] = useState('');
  const [newObs, setNewObs] = useState('');

  // Dropdown states for rows in table view
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  function toggleDropdown(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      setOpenDropdownId(id);
    }
  }

  // Drag State for Kanban
  const [draggedProjId, setDraggedProjId] = useState<string | null>(null);

  const listEstados: EstadoProjecto[] = ['Em Produção', 'Em Revisão', 'Pronto para Entrega'];

  // Default initializers for Create Form
  React.useEffect(() => {
    if (showAddModal) {
      if (empresas.length > 0 && !newEmpresaId) setNewEmpresaId(empresas[0].id);
      if (servicosConfig.length > 0 && !newServico) setNewServico(servicosConfig[0]);
      if (profiles.length > 0 && !newResponsavel) setNewResponsavel(profiles[0].nome);
      
      // Prazo by default + 30 dias
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNewPrazo(d.toISOString().split('T')[0]);
    }
  }, [showAddModal, empresas, servicosConfig, profiles]);

  // Derived Filters
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

  // Pagination bounds
  const totalItems = filteredProjectos.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProjectos = viewMode === 'table' 
    ? filteredProjectos.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredProjectos; // kanban shows all filtered

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, pageSize]);

  // KPIs
  const stats = useMemo(() => {
    return {
      totalProjetos: projectos.length,
      emProducao: projectos.filter(p => p.estado === 'Em Produção').length,
      emRevisao: projectos.filter(p => p.estado === 'Em Revisão').length,
      prontoEntrega: projectos.filter(p => p.estado === 'Pronto para Entrega').length,
      totalAOA: projectos.reduce((sum, p) => sum + p.valor, 0)
    };
  }, [projectos]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;
    onUpdateProjectoPrazoObs(editingProj.id, editPrazo, editObs);
    setEditingProj(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProjecto({
      empresa_id: newEmpresaId,
      cliente_id: newClienteId || undefined,
      oportunidade_id: 'manual',
      servico: newServico,
      valor: newValor,
      prazo: newPrazo,
      responsavel: newResponsavel,
      estado: 'Em Produção',
      observacoes: newObs
    });
    setShowAddModal(false);
  };

  const formatKwanza = (num: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  function estadoBadge(estado: string) {
    if (estado === 'Em Produção') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (estado === 'Em Revisão') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (estado === 'Pronto para Entrega') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  // Kanban Drag and Drop Logic
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
      onUpdateProjectoStatus(draggedProjId, novaEtapa);
      setDraggedProjId(null);
    }
  };

  return (
    <div id="projectos-module" className="space-y-6">
      
      {/* KPI Top board */}
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

      {/* Filter and Top Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-none px-2.5 py-1.5 focus:outline-none"
            >
              <option value="todos">Todos</option>
              {listEstados.map(est => <option key={est} value={est}>{est}</option>)}
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
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-none flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            Adicionar Projeto
          </button>
        </div>
      </div>

      {/* VIEWS */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {listEstados.map(etapa => {
            const cols = filteredProjectos.filter(p => p.estado === etapa);
            
            return (
              <div
                key={etapa}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, etapa)}
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
                        onDragStart={(e) => handleDragStart(e, proj.id)}
                        className="bg-white p-4 rounded-none border border-slate-200 shadow-sm hover:shadow transition cursor-grab active:cursor-grabbing text-left group"
                      >
                        <h4 className="font-extrabold text-sm text-slate-800 mb-1 leading-tight">{emp?.nome_empresa || 'Desconhecida'}</h4>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">{proj.servico}</p>
                        
                        <div className="space-y-1.5 text-[10px] text-slate-500">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Responsável:</span>
                            <span className="text-slate-700 font-bold">{proj.responsavel}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Prazo:</span>
                            <span className="text-orange-600 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> {formatDate(proj.prazo)}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-xs font-black text-slate-800">{formatKwanza(proj.valor)}</span>
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
        <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden text-left flex flex-col">
          {/* Table Toolbar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mostrar</span>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
                          <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500"/> {formatDate(proj.data_inicio)}</span>
                          <span className="text-orange-600 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> {formatDate(proj.prazo)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-1 rounded-none text-[9px] uppercase font-black tracking-wider border ${estadoBadge(proj.estado)}`}>
                          {proj.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => toggleDropdown(proj.id, e)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-none">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isDropdownOpen && dropdownPos && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }}></div>
                              <div
                                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                                className="fixed w-52 bg-white border border-slate-200 rounded-none shadow-xl z-50 py-1 flex flex-col text-left font-semibold text-xs"
                              >
                                <button onClick={() => { setOpenDropdownId(null); setDropdownPos(null); setEditingProj(proj); setEditPrazo(proj.prazo); setEditObs(proj.observacoes || ''); }} className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-500" /> Notas &amp; Prazos
                                </button>
                                <div className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex flex-col gap-1 border-t border-slate-100 mt-1 pt-2">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mudar Estado</span>
                                  <select
                                    value={proj.estado}
                                    onChange={(e) => { setOpenDropdownId(null); setDropdownPos(null); onUpdateProjectoStatus(proj.id, e.target.value as EstadoProjecto); }}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-1"
                                  >
                                    {listEstados.map(et => <option key={et} value={et}>{et}</option>)}
                                  </select>
                                </div>
                                <button onClick={() => { setOpenDropdownId(null); setDropdownPos(null); if(confirm('Eliminar projecto?')) onDeleteProjecto(proj.id); }} className="px-4 py-2 mt-1 border-t border-slate-100 hover:bg-red-50 text-red-600 flex items-center gap-2">
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

          {/* Pagination Controls */}
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

      {/* EDIT MODAL */}
      {editingProj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setEditingProj(null)}>
          <div className="bg-white rounded-none shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> Editar Prazos & Notas</h3>
              <button onClick={() => setEditingProj(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Novo Prazo Acordado *</label>
                <input type="date" required value={editPrazo} onChange={e => setEditPrazo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Notas de Entrega / Detalhes</label>
                <textarea rows={4} value={editObs} onChange={e => setEditObs(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="Ex: Cliente solicitou mudança nas cores..."/>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold transition">Guardar Modificações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-none shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-500"/> Criar Projecto Manualmente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs font-semibold max-h-[80vh] overflow-y-auto">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-none text-[10px] font-bold border border-blue-100 mb-2">
                Nota: Geralmente os projectos são criados automaticamente pelo CRM quando um Lead fecha negócio.
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Empresa Associada *</label>
                  <select required value={newEmpresaId} onChange={e => setNewEmpresaId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_empresa}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Serviço Solicitado *</label>
                  <select required value={newServico} onChange={e => setNewServico(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    {servicosConfig.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Valor Contratual (AOA) *</label>
                  <input type="number" required min={0} value={newValor} onChange={e => setNewValor(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Responsável Técnico *</label>
                  <select required value={newResponsavel} onChange={e => setNewResponsavel(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none">
                    {profiles.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Prazo Inicial de Entrega *</label>
                  <input type="date" required value={newPrazo} onChange={e => setNewPrazo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Observações de Produção</label>
                <textarea rows={3} value={newObs} onChange={e => setNewObs(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-none resize-none" placeholder="..." />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-bold transition">Adicionar Projecto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
