import React, { useState, useMemo } from 'react';
import { Oportunidade, Empresa, ServicoDisponivel, PipelineEtapa } from '../types';
import { INITIAL_OPORTUNIDADES, INITIAL_EMPRESAS } from '../mockData';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Layers, 
  Percent, 
  Calendar, 
  User, 
  Briefcase, 
  Tag, 
  MapPin, 
  Activity,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface DashboardProps {
  oportunidades: Oportunidade[];
  empresas: Empresa[];
}

export default function Dashboard({ oportunidades, empresas }: DashboardProps) {
  // Filters setup
  const [filterResponsavel, setFilterResponsavel] = useState<string>('todos');
  const [filterServico, setFilterServico] = useState<string>('todos');
  const [filterNicho, setFilterNicho] = useState<string>('todos');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('todos'); // todos, este_mes, este_ano

  // Extract unique values for drop-downs
  const responsaveis = useMemo(() => {
    const set = new Set(oportunidades.map(o => o.responsavel));
    return Array.from(set);
  }, [oportunidades]);

  const servicos: ServicoDisponivel[] = [
    'Website',
    'Branding',
    'Social Media',
    'Tráfego Pago',
    'Sistema Personalizado',
    'Consultoria Tecnológica'
  ];

  const nichos = useMemo(() => {
    const set = new Set(empresas.map(e => e.nicho).filter(Boolean));
    return Array.from(set);
  }, [empresas]);

  // Filter logic
  const filteredOportunidades = useMemo(() => {
    return oportunidades.filter(opt => {
      // Responsavel filter
      if (filterResponsavel !== 'todos' && opt.responsavel !== filterResponsavel) {
        return false;
      }
      // Servico filter
      if (filterServico !== 'todos' && opt.servico !== filterServico) {
        return false;
      }
      // Nicho filter
      if (filterNicho !== 'todos') {
        const emp = empresas.find(e => e.id === opt.empresa_id);
        if (!emp || emp.nicho !== filterNicho) {
          return false;
        }
      }
      // Periodo filter (checking input dates)
      if (filterPeriodo !== 'todos') {
        const date = new Date(opt.data_entrada);
        const now = new Date();
        if (filterPeriodo === 'este_mes') {
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (filterPeriodo === 'este_ano') {
          if (date.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }
      return true;
    });
  }, [oportunidades, empresas, filterResponsavel, filterServico, filterNicho, filterPeriodo]);

  // Clean values helper in Kwanzas
  const formatKwanza = (v: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalLeads = filteredOportunidades.length;

    // Leads by specific pipeline stages
    const captadosEsteMesCount = filteredOportunidades.filter(o => {
      const d = new Date(o.data_entrada);
      const now = new Date();
      return o.etapa === 'Lead Captado' || (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
    }).length;

    const contactosRealizadosCount = filteredOportunidades.filter(o => 
      !['Lead Captado'].includes(o.etapa)
    ).length;

    const reunioesAgendadasCount = filteredOportunidades.filter(o => o.etapa === 'Reunião Agendada').length;
    
    const reunioesRealizadasCount = filteredOportunidades.filter(o => 
      ['Reunião Realizada', 'Proposta Apresentada', 'Negociação', 'Fechado'].includes(o.etapa)
    ).length;

    const propostasApresentadasCount = filteredOportunidades.filter(o => 
      ['Proposta Apresentada', 'Negociação', 'Fechado'].includes(o.etapa)
    ).length;

    const negociacoesCount = filteredOportunidades.filter(o => 
      ['Negociação', 'Fechado'].includes(o.etapa)
    ).length;

    const fechamentosCount = filteredOportunidades.filter(o => o.etapa === 'Fechado').length;

    // Financial KPI
    // Receita prevista = Sum of estimated values of active progress leads (stages except Fechado and Perdido)
    const receitaPrevista = filteredOportunidades
      .filter(o => !['Fechado', 'Perdido'].includes(o.etapa))
      .reduce((sum, o) => sum + o.valor_estimado, 0);

    // Receita Fechada = Sum of estimated values of closed leads
    const receitaFechada = filteredOportunidades
      .filter(o => o.etapa === 'Fechado')
      .reduce((sum, o) => sum + o.valor_estimado, 0);

    const ticketMedio = fechamentosCount > 0 ? (receitaFechada / fechamentosCount) : 0;

    // Conversion Rates
    // Leads -> Reuniões (All that got scheduled or completed / total leads)
    const totalReunioesAtleast = filteredOportunidades.filter(o => 
      ['Reunião Agendada', 'Reunião Realizada', 'Proposta Apresentada', 'Negociação', 'Fechado'].includes(o.etapa)
    ).length;
    const leadsParaReunioes = totalLeads > 0 ? (totalReunioesAtleast / totalLeads) * 100 : 0;

    // Reuniões -> Propostas (Proposta Apresentada / Reunião Realizada-or-above counts)
    const reunioesRealizadasPlus = filteredOportunidades.filter(o => 
      ['Reunião Realizada', 'Proposta Apresentada', 'Negociação', 'Fechado'].includes(o.etapa)
    ).length;
    const reunioesParaPropostas = reunioesRealizadasPlus > 0 ? (propostasApresentadasCount / reunioesRealizadasPlus) * 100 : 0;

    // Propostas -> Fechamentos (Fechado / Propostas count)
    const propostasParaFechamentos = propostasApresentadasCount > 0 ? (fechamentosCount / propostasApresentadasCount) * 100 : 0;

    return {
      totalLeads,
      captadosEsteMesCount,
      contactosRealizadosCount,
      reunioesAgendadasCount,
      reunioesRealizadasCount,
      propostasApresentadasCount,
      negociacoesCount,
      fechamentosCount,
      receitaPrevista,
      receitaFechada,
      ticketMedio,
      leadsParaReunioes,
      reunioesParaPropostas,
      propostasParaFechamentos
    };
  }, [filteredOportunidades]);

  // Leads by source statistics
  const origensStats = useMemo(() => {
    const stats: Record<string, { count: number; value: number }> = {};
    filteredOportunidades.forEach(o => {
      if (!stats[o.origem]) {
        stats[o.origem] = { count: 0, value: 0 };
      }
      stats[o.origem].count += 1;
      stats[o.origem].value += o.valor_estimado;
    });
    return Object.entries(stats).sort((a,b) => b[1].count - a[1].count);
  }, [filteredOportunidades]);

  // Service breakdown
  const servicosStats = useMemo(() => {
    const stats: Record<string, { count: number; value: number }> = {};
    filteredOportunidades.forEach(o => {
      if (!stats[o.servico]) {
        stats[o.servico] = { count: 0, value: 0 };
      }
      stats[o.servico].count += 1;
      stats[o.servico].value += o.valor_estimado;
    });
    return Object.entries(stats).sort((a,b) => b[1].count - a[1].count);
  }, [filteredOportunidades]);

  // Clear filters
  const resetFilters = () => {
    setFilterResponsavel('todos');
    setFilterServico('todos');
    setFilterNicho('todos');
    setFilterPeriodo('todos');
  };

  return (
    <div id="dashboard-module" className="space-y-6">
      
      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-orange-500" />
            Filtros Ativos:
          </div>

          {/* Periodo */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Período</span>
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="todos">Todo o histórico</option>
              <option value="este_mes">Este Mês</option>
              <option value="este_ano">Este Ano</option>
            </select>
          </div>

          {/* Responsável */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Responsável</span>
            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="todos">Todos os Sócios</option>
              {responsaveis.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Serviço</span>
            <select
              value={filterServico}
              onChange={(e) => setFilterServico(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="todos">Todos os Serviços</option>
              {servicos.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Nicho */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Nicho Comercial</span>
            <select
              value={filterNicho}
              onChange={(e) => setFilterNicho(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="todos">Todos os Nichos</option>
              {nichos.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {(filterResponsavel !== 'todos' || filterServico !== 'todos' || filterNicho !== 'todos' || filterPeriodo !== 'todos') && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100/50 px-3 py-1.5 rounded-lg transition"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Top Level KPIs - Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Fechada</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatKwanza(metrics.receitaFechada)}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Valor dos negócios em etapa <span className="font-semibold text-emerald-600">Fechado</span>.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Prevista (Gatilho)</p>
          <h3 className="text-2xl font-bold text-amber-500 mt-1">{formatKwanza(metrics.receitaPrevista)}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Valor acumulado de leads activos em negociação.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Briefcase className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Médio (AOA)</p>
          <h3 className="text-2xl font-bold text-indigo-900 mt-1">{formatKwanza(metrics.ticketMedio)}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Faturamento fechado dividido pelo total de fechamentos.</p>
        </div>
      </div>

      {/* Leads Workflow Status Pipeline metrics */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          Etapas do Funil de Leads
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          
          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Captados (Mês)</span>
            <span className="text-xl font-black text-slate-800">{metrics.captadosEsteMesCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Contactados</span>
            <span className="text-xl font-black text-slate-800">{metrics.contactosRealizadosCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">R. Agendadas</span>
            <span className="text-xl font-black text-slate-800">{metrics.reunioesAgendadasCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">R. Realizadas</span>
            <span className="text-xl font-black text-slate-800">{metrics.reunioesRealizadasCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">P. Apresentadas</span>
            <span className="text-xl font-black text-slate-800">{metrics.propostasApresentadasCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Negociações</span>
            <span className="text-xl font-black text-slate-800">{metrics.negociacoesCount}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100 bg-emerald-50/50">
            <span className="text-[10px] font-bold text-emerald-600 block uppercase">Fechados</span>
            <span className="text-xl font-black text-emerald-700">{metrics.fechamentosCount}</span>
          </div>

        </div>
      </div>

      {/* CONVERSÃO FUNNEL SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Conversão do Processo */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <Percent className="w-4 h-4 text-orange-500" />
              Taxas de Conversão do Funil
            </h4>
            
            <div className="space-y-6">
              
              {/* Leads -> Reuniões */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Leads ➔ Reuniões Marcadas/Realizadas</span>
                  <span className="text-orange-500">{metrics.leadsParaReunioes.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(metrics.leadsParaReunioes, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Porcentagem de leads captadas que avançaram pelo menos até o agendamento de reuniões.
                </p>
              </div>

              {/* Reuniões -> Propostas */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Reuniões ➔ Propostas Apresentadas</span>
                  <span className="text-indigo-600">{metrics.reunioesParaPropostas.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(metrics.reunioesParaPropostas, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  De todas as reuniões agendadas ou realizadas, quantas resultaram numa proposta formalizada.
                </p>
              </div>

              {/* Propostas -> Fechamentos */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Propostas ➔ Negócios Fechados</span>
                  <span className="text-emerald-600">{metrics.propostasParaFechamentos.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(metrics.propostasParaFechamentos, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Taxa de conversão de fechamento sobre propostas ativas apresentadas aos clientes.
                </p>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl flex items-center justify-between text-[11px] text-slate-500">
            <span>Conversão Geral (Leads ➔ Fechados)</span>
            <span className="font-extrabold text-emerald-600 text-sm">
              {metrics.totalLeads > 0 ? ((metrics.fechamentosCount / metrics.totalLeads) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Breakdown of Origen / Serviços */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              Origem dos Leads & Serviços Mais Vendidos
            </h4>

            {/* Origem */}
            <div className="mb-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Desempenho por Origem do Lead</span>
              <div className="space-y-2">
                {origensStats.slice(0, 4).map(([origem, stat]) => (
                  <div key={origem} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{origem}</span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stat.count} leads</span>
                      <span className="font-semibold text-slate-800">{formatKwanza(stat.value)}</span>
                    </div>
                  </div>
                ))}
                {origensStats.length === 0 && (
                  <span className="text-slate-400 text-xs italic">Sem dados de origem disponíveis.</span>
                )}
              </div>
            </div>

            {/* Serviços */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Serviços Propostos</span>
              <div className="space-y-2">
                {servicosStats.slice(0, 4).map(([servico, stat]) => (
                  <div key={servico} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{servico}</span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stat.count} propostas</span>
                      <span className="font-semibold text-slate-800">{formatKwanza(stat.value)}</span>
                    </div>
                  </div>
                ))}
                {servicosStats.length === 0 && (
                  <span className="text-slate-400 text-xs italic">Sem dados de serviços propostos.</span>
                )}
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-100 mt-4">
            Dados filtrados com base na selecção corrente. Todas as métricas actualizam em tempo-real.
          </div>
        </div>

      </div>

    </div>
  );
}
