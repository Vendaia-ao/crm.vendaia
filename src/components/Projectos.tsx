import React, { useState, useMemo } from 'react';
import { Projecto, Empresa, EstadoProjecto, ServicoDisponivel } from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  TrendingUp, 
  FileText,
  Search,
  Sliders,
  Notebook,
  Building2,
  X
} from 'lucide-react';

interface ProjectosProps {
  projectos: Projecto[];
  empresas: Empresa[];
  onUpdateProjectoStatus: (id: string, novoEstado: EstadoProjecto) => void;
  onUpdateProjectoPrazoObs: (id: string, novoPrazo: string, novasObs: string) => void;
}

export default function Projectos({
  projectos,
  empresas,
  onUpdateProjectoStatus,
  onUpdateProjectoPrazoObs
}: ProjectosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Edit fields modal
  const [editingProj, setEditingProj] = useState<Projecto | null>(null);
  const [editPrazo, setEditPrazo] = useState('');
  const [editObs, setEditObs] = useState('');

  // States available
  const listEstados: EstadoProjecto[] = [
    'Em Produção',
    'Em Revisão',
    'Entregue',
    'Cliente Activo'
  ];

  // Filters
  const filteredProjectos = useMemo(() => {
    return projectos.filter(proj => {
      const emp = empresas.find(e => e.id === proj.empresa_id);
      const companyName = emp ? emp.nome_empresa.toLowerCase() : '';
      const matchSearch = companyName.includes(searchTerm.toLowerCase()) || 
        proj.servico.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || proj.estado === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projectos, empresas, searchTerm, statusFilter]);

  // KPIs
  const stats = useMemo(() => {
    const emProducao = projectos.filter(p => p.estado === 'Em Produção').length;
    const emRevisao = projectos.filter(p => p.estado === 'Em Revisão').length;
    const entregues = projectos.filter(p => p.estado === 'Entregue').length;
    const clientesActivos = projectos.filter(p => p.estado === 'Cliente Activo').length;
    const totalAOA = projectos.reduce((sum, p) => sum + p.valor, 0);

    return {
      emProducao,
      emRevisao,
      entregues,
      clientesActivos,
      totalAOA
    };
  }, [projectos]);

  const handleEditClick = (proj: Projecto) => {
    setEditingProj(proj);
    setEditPrazo(proj.prazo);
    setEditObs(proj.observacoes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;

    onUpdateProjectoPrazoObs(editingProj.id, editPrazo, editObs);
    setEditingProj(null);
  };

  const formatKwanza = (num: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div id="projectos-module" className="space-y-6">
      
      {/* KPI Top board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Produção</span>
          <span className="text-xl font-extrabold text-orange-500 block mt-1">{stats.emProducao}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Revisão</span>
          <span className="text-xl font-extrabold text-indigo-500 block mt-1">{stats.emRevisao}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Entregues</span>
          <span className="text-xl font-extrabold text-emerald-500 block mt-1">{stats.entregues}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Clientes Activos</span>
          <span className="text-xl font-extrabold text-slate-800 block mt-1">{stats.clientesActivos}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Filiado Acumulado</span>
          <span className="text-xs font-black text-slate-500 mt-1 truncate block">{formatKwanza(stats.totalAOA)}</span>
        </div>

      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar por empresa ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="todos">Todos os estados</option>
              {listEstados.map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic">
          Projectos são gerados automaticamente quando um lead é marcado como 'Fechado'.
        </div>

      </div>

      {/* Projects Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjectos.map(proj => {
          const emp = empresas.find(e => e.id === proj.empresa_id);
          
          let stateBadge = '';
          if (proj.estado === 'Em Produção') stateBadge = 'bg-orange-50 text-orange-700 border-orange-200';
          else if (proj.estado === 'Em Revisão') stateBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
          else if (proj.estado === 'Entregue') stateBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          else if (proj.estado === 'Cliente Activo') stateBadge = 'bg-slate-900 text-slate-100 border-slate-900';

          return (
            <div key={proj.id} className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              
              {/* Header section card */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${stateBadge}`}>
                    {proj.estado}
                  </span>
                  
                  {/* Select status changes */}
                  <select
                    value={proj.estado}
                    onChange={(e) => onUpdateProjectoStatus(proj.id, e.target.value as EstadoProjecto)}
                    className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 font-bold focus:outline-none cursor-pointer"
                  >
                    {listEstados.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {emp ? emp.nome_empresa : 'Empresa não encontrada'}
                  </h4>
                  <p className="text-xs text-orange-600 font-extrabold">{proj.servico}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold uppercase text-[9px]">Valor Contratual:</span>
                    <span className="font-bold text-slate-800">{formatKwanza(proj.valor)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold uppercase text-[9px]">Responsável Técnico:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {proj.responsavel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold uppercase text-[9px]">Início do Trabalho:</span>
                    <span className="font-medium text-slate-600">{formatDate(proj.data_inicio)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold uppercase text-[9px]">Prazo Acordado:</span>
                    <span className="text-orange-655 font-bold flex items-center gap-1 bg-orange-50/50 px-1.5 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      {proj.prazo}
                    </span>
                  </div>
                </div>

                {proj.observacoes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-400 block mb-0.5 uppercase text-[9px]">Observações de Entrega:</span>
                    <p className="italic leading-relaxed font-medium">"{proj.observacoes}"</p>
                  </div>
                )}
              </div>

              {/* Operations Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleEditClick(proj)}
                  className="text-xs text-orange-500 font-bold hover:text-orange-600 cursor-pointer"
                >
                  Modificar Prazo & Notas
                </button>
              </div>

            </div>
          );
        })}

        {filteredProjectos.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 italic rounded-xl border border-slate-100">
            Nenhum projeto em andamento corresponde ao filtro selecionado.
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingProj && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-500" />
                Atualizar Projecto
              </h3>
              <button onClick={() => setEditingProj(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prazo Estimado de Conclusão *</label>
                <input
                  type="date"
                  required
                  value={editPrazo}
                  onChange={(e) => setEditPrazo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Observações / Notas de Entrega</label>
                <textarea
                  rows={4}
                  placeholder="Guarde o estado actual de revisão, links do figma, credenciais do sistema ou notas urgentes do cliente..."
                  value={editObs}
                  onChange={(e) => setEditObs(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProj(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                >
                  Guardar Projecto
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
