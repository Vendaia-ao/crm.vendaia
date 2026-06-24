import React, { useState, useMemo } from 'react';
import { Cliente, Projecto, Empresa, EstadoCliente, ProximaAcaoComercial, ServicoDisponivel } from '../types';
import {
  Users, Search, Phone, Mail, Calendar, CheckCircle2, Clock, X,
  TrendingUp, Briefcase, Star, ArrowRight, Info, Plus, Trash2, MoreVertical
} from 'lucide-react';

interface ClientesProps {
  clientes: Cliente[];
  projectos: Projecto[];
  empresas: Empresa[];
  servicosConfig: ServicoDisponivel[];
  onUpdateClienteEstado: (id: string, estado: EstadoCliente, reuniaoData?: { data?: string; hora?: string; local?: string; obs?: string }) => void;
  onUpdateClienteProximaAcao: (id: string, acao: ProximaAcaoComercial) => void;
  onAddCliente: (cliente: Omit<Cliente, 'id' | 'data_fecho'>) => void;
  onDeleteCliente: (id: string) => void;
}

const ESTADOS: EstadoCliente[] = ['Aguardando Apresentação', 'Apresentação Agendada', 'Apresentação Realizada', 'Cliente Ativo', 'Cliente Inativo'];
const ACOES: ProximaAcaoComercial[] = ['Ligar para Cliente', 'Agendar Reunião', 'Apresentar Projeto', 'Solicitar Feedback', 'Propor Novo Serviço', ''];

function estadoBadge(estado: EstadoCliente) {
  switch (estado) {
    case 'Cliente Ativo': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Aguardando Apresentação': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Apresentação Agendada': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Apresentação Realizada': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Cliente Inativo': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function formatKwanza(num: number) {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(num);
}

function formatDate(isoStr?: string) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Clientes({
  clientes, projectos, empresas, servicosConfig,
  onUpdateClienteEstado, onUpdateClienteProximaAcao, onAddCliente, onDeleteCliente
}: ClientesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Manage details modal
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [tempEstado, setTempEstado] = useState<EstadoCliente>('Aguardando Apresentação');
  const [tempAcao, setTempAcao] = useState<ProximaAcaoComercial>('');

  // Quick Meeting Modal
  const [meetingCliente, setMeetingCliente] = useState<Cliente | null>(null);
  const [dataReuniao, setDataReuniao] = useState('');
  const [horaReuniao, setHoraReuniao] = useState('');
  const [localReuniao, setLocalReuniao] = useState('');
  const [obsReuniao, setObsReuniao] = useState('');

  // Create Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpresaId, setNewEmpresaId] = useState('');
  const [newServico, setNewServico] = useState('');
  const [newValor, setNewValor] = useState(0);

  React.useEffect(() => {
    if (showAddModal) {
      if (empresas.length > 0 && !newEmpresaId) setNewEmpresaId(empresas[0].id);
      if (servicosConfig.length > 0 && !newServico) setNewServico(servicosConfig[0]);
    }
  }, [showAddModal, empresas, servicosConfig]);

  const totalFaturacao = useMemo(() => clientes.reduce((s, c) => s + (c.valor_negocio || 0), 0), [clientes]);
  const ativos = useMemo(() => clientes.filter(c => c.estado === 'Cliente Ativo').length, [clientes]);
  const aguardando = useMemo(() => clientes.filter(c => c.estado === 'Aguardando Apresentação' || c.estado === 'Apresentação Agendada').length, [clientes]);

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchSearch = c.nome_empresa.toLowerCase().includes(q) || c.servico_contratado.toLowerCase().includes(q) || (c.contacto_principal || '').toLowerCase().includes(q);
      const matchEstado = estadoFilter === 'todos' || c.estado === estadoFilter;
      const matchDateInit = dataInicio ? c.data_fecho >= dataInicio : true;
      const matchDateEnd = dataFim ? c.data_fecho <= dataFim : true;
      return matchSearch && matchEstado && matchDateInit && matchDateEnd;
    });
  }, [clientes, searchTerm, estadoFilter, dataInicio, dataFim]);

  function openDetails(c: Cliente) {
    setSelectedCliente(c);
    setTempEstado(c.estado);
    setTempAcao(c.proxima_acao || '');
    setOpenDropdownId(null);
  }

  function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCliente) return;
    onUpdateClienteEstado(selectedCliente.id, tempEstado);
    onUpdateClienteProximaAcao(selectedCliente.id, tempAcao);
    setSelectedCliente(null);
  }

  function openMeetingModal(c: Cliente) {
    setMeetingCliente(c);
    setDataReuniao(c.data_reuniao || '');
    setHoraReuniao(c.hora_reuniao || '');
    setLocalReuniao(c.local_reuniao || '');
    setObsReuniao(c.observacoes_reuniao || '');
    setOpenDropdownId(null);
  }

  function saveMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingCliente) return;
    onUpdateClienteEstado(meetingCliente.id, 'Apresentação Agendada', {
      data: dataReuniao,
      hora: horaReuniao,
      local: localReuniao,
      obs: obsReuniao
    });
    setMeetingCliente(null);
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emp = empresas.find(e => e.id === newEmpresaId);
    const con = emp ? null : null; // simplified logic, contacts are in global state but not strictly needed here
    onAddCliente({
      nome_empresa: emp ? emp.nome_empresa : 'Desconhecida',
      contacto_principal: '',
      telefone: emp ? emp.telefone_principal : '',
      email: '',
      servico_contratado: newServico,
      valor_negocio: newValor,
      estado: 'Cliente Ativo',
      proxima_acao: ''
    });
    setShowAddModal(false);
  }

  return (
    <div id="clientes-module" className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total de Clientes</p>
            <p className="text-2xl font-black text-slate-900">{clientes.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Clientes Ativos</p>
            <p className="text-2xl font-black text-emerald-700">{ativos}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Facturação Acumulada</p>
            <p className="text-lg font-black text-amber-700 leading-tight">{formatKwanza(totalFaturacao)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Estado:</span>
            <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
              <option value="todos">Todos</option>
              {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">De:</span>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 rounded px-2 py-1.5 focus:outline-none" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Até:</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 rounded px-2 py-1.5 focus:outline-none" />
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-500" />
          Adicionar Cliente
        </button>
      </div>

      {clientes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3.5">Empresa / Projecto</th>
                  <th className="px-5 py-3.5">Contacto</th>
                  <th className="px-5 py-3.5">Serviço & Facturação</th>
                  <th className="px-5 py-3.5">Data de Fecho</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5">Próxima Ação</th>
                  <th className="px-5 py-3.5 text-right">Gerir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredClientes.map(c => {
                  const clientProj = projectos.find(p => p.id === c.projeto_associado || p.cliente_id === c.id);
                  const isDropdownOpen = openDropdownId === c.id;
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-slate-900 text-sm truncate max-w-[150px]">{c.nome_empresa}</p>
                        {clientProj ? (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Proj: <span className="text-blue-600 font-semibold ml-0.5">{clientProj.servico}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-300 mt-0.5 italic">Sem projecto associado</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{c.contacto_principal || '—'}</p>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {c.telefone && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefone}</span>}
                          {c.email && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase border border-blue-100">
                          {c.servico_contratado}
                        </span>
                        <p className="text-[11px] font-mono font-bold text-slate-800 mt-1.5">{formatKwanza(c.valor_negocio)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-slate-500 text-[11px]">{formatDate(c.data_fecho)}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase border tracking-wider font-bold ${estadoBadge(c.estado)}`}>
                          {c.estado}
                        </span>
                        {c.data_reuniao && (
                          <div className="text-[9px] text-purple-600 font-bold mt-1 flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" /> {c.data_reuniao} {c.hora_reuniao}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {c.proxima_acao ? (
                          <span className="bg-orange-50 text-orange-700 font-extrabold px-2 py-1 rounded text-[10px] border border-orange-100">{c.proxima_acao}</span>
                        ) : <span className="text-[10px] text-slate-300 italic">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={() => setOpenDropdownId(isDropdownOpen ? null : c.id)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 flex flex-col text-left font-semibold text-xs">
                                <button onClick={() => openMeetingModal(c)} className="px-4 py-2 hover:bg-purple-50 text-purple-700 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" /> Agendar Reunião
                                </button>
                                <button onClick={() => openDetails(c)} className="px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                                  <Star className="w-4 h-4" /> Alterar Relação
                                </button>
                                <button onClick={() => { setOpenDropdownId(null); if(confirm('Eliminar cliente?')) onDeleteCliente(c.id); }} className="px-4 py-2 mt-1 border-t border-slate-100 hover:bg-red-50 text-red-600 flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" /> Eliminar Cliente
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredClientes.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic">Nenhum cliente corresponde ao filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REUNIÃO MODAL (Fast Action) */}
      {meetingCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setMeetingCliente(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-purple-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-300"/> Agendar Apresentação</h3>
              <button onClick={() => setMeetingCliente(null)} className="text-purple-300 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={saveMeeting} className="p-5 space-y-4 text-xs font-semibold">
              <p className="text-[10px] text-slate-500 mb-2">Cliente: <strong className="text-slate-800">{meetingCliente.nome_empresa}</strong></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Data</label>
                  <input type="date" required value={dataReuniao} onChange={e => setDataReuniao(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Hora</label>
                  <input type="time" required value={horaReuniao} onChange={e => setHoraReuniao(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Local / Link Virtual</label>
                <input type="text" value={localReuniao} onChange={e => setLocalReuniao(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl" placeholder="Ex: Google Meet" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Notas Internas</label>
                <textarea rows={2} value={obsReuniao} onChange={e => setObsReuniao(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl resize-none" placeholder="Ex: Levar portfólio..." />
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition">Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELATION MODAL */}
      {selectedCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setSelectedCliente(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4 text-orange-400"/> Relação Comercial</h3>
              <button onClick={() => setSelectedCliente(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={saveDetails} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Estado do Cliente *</label>
                <select value={tempEstado} onChange={e => setTempEstado(e.target.value as EstadoCliente)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl">
                  {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Próxima Ação Comercial</label>
                <select value={tempAcao} onChange={e => setTempAcao(e.target.value as ProximaAcaoComercial)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl">
                  {ACOES.map(ac => <option key={ac} value={ac}>{ac || 'Nenhuma'}</option>)}
                </select>
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500"/> Adicionar Cliente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-[10px] font-bold border border-blue-100 mb-2">
                Nota: Geralmente clientes são gerados automaticamente pelo CRM quando um Lead fecha negócio. Use isto para excepções.
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Empresa Associada *</label>
                <select required value={newEmpresaId} onChange={e => setNewEmpresaId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl">
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_empresa}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Serviço Principal *</label>
                <select required value={newServico} onChange={e => setNewServico(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl">
                  {servicosConfig.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Valor do Contrato (AOA) *</label>
                <input type="number" required min={0} value={newValor} onChange={e => setNewValor(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl" />
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">Gravar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
