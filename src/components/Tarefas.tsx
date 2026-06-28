import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Tarefa, Empresa, User, Oportunidade, EstadoTarefa, PrioridadeTarefa } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  CheckSquare, Clock, Search, X, Plus, Trash2, LayoutGrid, List, AlertCircle, Loader2, Calendar, User as UserIcon
} from 'lucide-react';

interface TarefasProps {
  empresas: Empresa[];
  profiles: User[];
  oportunidades: Oportunidade[];
}

const LIST_ESTADOS: EstadoTarefa[] = ['Pendente', 'Em andamento', 'Concluída'];
const LIST_PRIORIDADES: PrioridadeTarefa[] = ['Baixa', 'Média', 'Alta'];

function prioridadeColor(prioridade: string) {
  if (prioridade === 'Alta') return 'text-red-600 bg-red-50 border-red-200';
  if (prioridade === 'Média') return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
}

function formatDate(isoStr?: string) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Tarefas({ empresas, profiles, oportunidades }: TarefasProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitulo, setNewTitulo] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newResponsavel, setNewResponsavel] = useState('');
  const [newPrioridade, setNewPrioridade] = useState<PrioridadeTarefa>('Média');
  const [newData, setNewData] = useState('');
  const [newEmpresaId, setNewEmpresaId] = useState('');
  const [newOportunidadeId, setNewOportunidadeId] = useState('');

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError('Supabase não configurado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (tarefasError) throw tarefasError;
      
      setTarefas(data || []);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('tarefas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, () => {
        loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  useEffect(() => {
    if (showAddModal) {
      if (profiles.length > 0 && !newResponsavel) setNewResponsavel(profiles[0].nome);
      setNewPrioridade('Média');
      const d = new Date();
      setNewData(d.toISOString().split('T')[0]);
    }
  }, [showAddModal, profiles]);

  const filteredTarefas = useMemo(() => {
    return tarefas.filter(t => {
      const matchesSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || t.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tarefas, searchTerm, statusFilter]);

  const handleSaveTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo || !newResponsavel) return;

    setIsSaving(true);
    try {
      const novaTarefa = {
        id: crypto.randomUUID(),
        titulo: newTitulo,
        descricao: newDescricao,
        responsavel: newResponsavel,
        data: newData ? new Date(newData).toISOString() : null,
        prioridade: newPrioridade,
        estado: 'Pendente',
        empresa_id: newEmpresaId || null,
        oportunidade_id: newOportunidadeId || null
      };

      const { error: err } = await supabase.from('tarefas').insert([novaTarefa]);
      if (err) throw err;

      setShowAddModal(false);
      setNewTitulo('');
      setNewDescricao('');
      setNewEmpresaId('');
      setNewOportunidadeId('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEstado = async (id: string, novoEstado: EstadoTarefa) => {
    try {
      const { error: err } = await supabase.from('tarefas').update({ estado: novoEstado }).eq('id', id);
      if (err) throw err;
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta tarefa?')) return;
    try {
      const { error: err } = await supabase.from('tarefas').delete().eq('id', id);
      if (err) throw err;
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Drag and drop setup for Kanban
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 border border-slate-200 rounded">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            <option value="todos">Todos os Estados</option>
            {LIST_ESTADOS.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded flex gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition ${viewMode === 'kanban' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-orange-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {LIST_ESTADOS.map(estado => {
            const colTarefas = filteredTarefas.filter(t => t.estado === estado);
            return (
              <div 
                key={estado} 
                className="w-80 shrink-0 flex flex-col bg-slate-100/50 rounded border border-slate-200/60"
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) {
                    handleUpdateEstado(draggedId, estado);
                    setDraggedId(null);
                  }
                }}
              >
                <div className="p-3 flex items-center justify-between border-b border-slate-200 bg-slate-100/80">
                  <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                    {estado}
                  </h3>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {colTarefas.length}
                  </span>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colTarefas.map(tarefa => (
                    <div
                      key={tarefa.id}
                      draggable
                      onDragStart={() => setDraggedId(tarefa.id)}
                      className="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${prioridadeColor(tarefa.prioridade)}`}>
                          {tarefa.prioridade}
                        </span>
                        <button onClick={() => handleDelete(tarefa.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">{tarefa.titulo}</h4>
                      {tarefa.descricao && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{tarefa.descricao}</p>}
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px]" title={tarefa.responsavel}>{tarefa.responsavel}</span>
                        </div>
                        {tarefa.data && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(tarefa.data)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600 w-10">Estado</th>
                  <th className="p-4 font-bold text-slate-600">Título</th>
                  <th className="p-4 font-bold text-slate-600">Prioridade</th>
                  <th className="p-4 font-bold text-slate-600">Responsável</th>
                  <th className="p-4 font-bold text-slate-600">Data</th>
                  <th className="p-4 font-bold text-slate-600 w-16 text-right">Acções</th>
                </tr>
              </thead>
              <tbody>
                {filteredTarefas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma tarefa encontrada.</td>
                  </tr>
                ) : (
                  filteredTarefas.map(tarefa => (
                    <tr key={tarefa.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4">
                        <select
                          value={tarefa.estado}
                          onChange={(e) => handleUpdateEstado(tarefa.id, e.target.value as EstadoTarefa)}
                          className="bg-transparent border-0 text-xs font-semibold focus:ring-0 cursor-pointer w-28"
                        >
                          {LIST_ESTADOS.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{tarefa.titulo}</div>
                        {tarefa.descricao && <div className="text-xs text-slate-500 mt-1 truncate max-w-sm">{tarefa.descricao}</div>}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${prioridadeColor(tarefa.prioridade)}`}>
                          {tarefa.prioridade}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          {tarefa.responsavel}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {tarefa.data ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(tarefa.data)}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(tarefa.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nova Tarefa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-4 flex justify-between items-center shrink-0">
              <h2 className="text-white font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-400" /> Nova Tarefa
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTarefa} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  value={newTitulo}
                  onChange={e => setNewTitulo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Ex: Ligar para Geratec"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Descrição (opcional)</label>
                <textarea
                  rows={2}
                  value={newDescricao}
                  onChange={e => setNewDescricao(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Responsável *</label>
                  <select
                    value={newResponsavel}
                    onChange={e => setNewResponsavel(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {profiles.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Data de Conclusão</label>
                  <input
                    type="date"
                    value={newData}
                    onChange={e => setNewData(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Prioridade *</label>
                <div className="flex gap-2">
                  {LIST_PRIORIDADES.map(pri => (
                    <label key={pri} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border cursor-pointer transition ${newPrioridade === pri ? prioridadeColor(pri) + ' ring-1 ring-current' : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="radio" name="prioridade" value={pri} checked={newPrioridade === pri} onChange={() => setNewPrioridade(pri)} className="sr-only" />
                      <span className="text-xs font-bold">{pri}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">🔗</span>
                  Relacionar com (Opcional)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Empresa</label>
                    <select value={newEmpresaId} onChange={e => setNewEmpresaId(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs">
                      <option value="">-- Nenhuma --</option>
                      {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_empresa}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Oportunidade</label>
                    <select value={newOportunidadeId} onChange={e => setNewOportunidadeId(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs">
                      <option value="">-- Nenhuma --</option>
                      {oportunidades.map(o => <option key={o.id} value={o.id}>{o.servico} - {empresas.find(emp => emp.id === o.empresa_id)?.nome_empresa}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-orange-600 text-white rounded font-bold text-sm hover:bg-orange-700 transition disabled:opacity-70 flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'A guardar...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
