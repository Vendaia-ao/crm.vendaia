import React, { useState } from 'react';
import { DocumentoCliente, TipoDocumentoCliente, Empresa } from '../types';
import { Folder, FolderOpen, FileText, Link as LinkIcon, Trash2, ChevronLeft, Search, ExternalLink, Plus, X } from 'lucide-react';

interface ClientesProps {
  empresas?: Empresa[];
  servicosConfig?: string[];
  documentosCliente?: DocumentoCliente[];
  onAddDocumento?: (doc: Omit<DocumentoCliente, 'id' | 'data_upload'>) => void;
  onDeleteDocumento?: (id: string) => void;
}

const TIPOS_DOCUMENTO: { tipo: TipoDocumentoCliente; multi: boolean }[] = [
  { tipo: 'Proposta', multi: false },
  { tipo: 'Contrato', multi: false },
  { tipo: 'Factura Recibo', multi: false },
  { tipo: 'Termo de Entrega', multi: false },
  { tipo: 'Factura Genérica', multi: true },
];

export default function Clientes({
  empresas = [],
  servicosConfig = [],
  documentosCliente = [],
  onAddDocumento = () => {},
  onDeleteDocumento = () => {},
}: ClientesProps) {
  // Navigation State (3-level drill-down)
  const [selectedEmpresaName, setSelectedEmpresaName] = useState<string | null>(null);
  const [selectedServico, setSelectedServico] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Modal: Add service folder
  const [showAddPastaModal, setShowAddPastaModal] = useState(false);
  const [newPastaEmpresaId, setNewPastaEmpresaId] = useState('');
  const [newPastaServico, setNewPastaServico] = useState('');

  // Modal: Add Drive link
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [linkTargetTipo, setLinkTargetTipo] = useState<TipoDocumentoCliente | null>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkNome, setNewLinkNome] = useState('');

  // Derive unique empresa+servico pairs from documentosCliente (including __pasta__ markers)
  const servicoPairs = Array.from(
    new Map(
      documentosCliente.map(d => [`${d.nome_empresa}|||${d.servico_contratado}`, { nome_empresa: d.nome_empresa, servico_contratado: d.servico_contratado }])
    ).values()
  );

  // Level 1: unique empresa names
  const uniqueEmpresaNames = Array.from(new Set(servicoPairs.map(p => p.nome_empresa)));
  const filteredEmpresaNames = uniqueEmpresaNames.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()));

  // Level 2: services for selected empresa
  const servicosDaEmpresa = servicoPairs.filter(p => p.nome_empresa === selectedEmpresaName);

  // Level 3: documents for selected empresa+servico (exclude __pasta__ markers)
  const docsDoPar = (tipo: TipoDocumentoCliente) =>
    documentosCliente.filter(
      d => d.nome_empresa === selectedEmpresaName && d.servico_contratado === selectedServico && d.tipo === tipo
    );

  const handleCreatePasta = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empresas.find(e => e.id === newPastaEmpresaId);
    if (!emp) return;

    const alreadyExists = servicoPairs.some(
      p => p.nome_empresa === emp.nome_empresa && p.servico_contratado === newPastaServico
    );
    if (alreadyExists) {
      alert('Já existe uma pasta para esta empresa e serviço.');
      return;
    }

    // Insert a __pasta__ marker
    onAddDocumento({
      nome_empresa: emp.nome_empresa,
      servico_contratado: newPastaServico,
      tipo: '__pasta__',
      nome_ficheiro: '',
      url_ficheiro: '',
    });

    setShowAddPastaModal(false);
    setNewPastaEmpresaId('');
    setNewPastaServico('');
  };

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTargetTipo || !selectedEmpresaName || !selectedServico) return;

    let finalUrl = newLinkUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onAddDocumento({
      nome_empresa: selectedEmpresaName,
      servico_contratado: selectedServico,
      tipo: linkTargetTipo,
      nome_ficheiro: newLinkNome.trim() || linkTargetTipo,
      url_ficheiro: finalUrl,
    });

    setShowAddLinkModal(false);
    setLinkTargetTipo(null);
    setNewLinkUrl('');
    setNewLinkNome('');
  };

  const triggerAddLink = (tipo: TipoDocumentoCliente) => {
    setLinkTargetTipo(tipo);
    setNewLinkUrl('');
    setNewLinkNome('');
    setShowAddLinkModal(true);
  };

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  const renderEmpresasView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Directório de Clientes</h2>
          <p className="text-xs text-slate-500 mt-1">Gestão de documentos partilhados por empresa e serviço.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar empresa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition"
            />
          </div>
          <button
            onClick={() => setShowAddPastaModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>

      {filteredEmpresaNames.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-slate-300">
          <Folder className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Nenhuma pasta encontrada.</p>
          <p className="text-xs text-slate-400 mt-1">Pastas são criadas automaticamente quando um negócio é fechado no Pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredEmpresaNames.map(nomeEmpresa => {
            const count = servicoPairs.filter(p => p.nome_empresa === nomeEmpresa).length;
            return (
              <div
                key={nomeEmpresa}
                onClick={() => { setSelectedEmpresaName(nomeEmpresa); setSearchTerm(''); }}
                className="group bg-white p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors pointer-events-none" />
                <Folder className="w-14 h-14 text-slate-300 group-hover:text-blue-500 transition-colors mb-3" />
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors" title={nomeEmpresa}>{nomeEmpresa}</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold bg-slate-100 px-2 py-0.5">
                  {count} {count === 1 ? 'Serviço' : 'Serviços'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderServicosView = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 shadow-sm border border-slate-200 flex items-center gap-4">
        <button onClick={() => setSelectedEmpresaName(null)} className="p-2 hover:bg-slate-100 text-slate-500 transition cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" /> {selectedEmpresaName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Selecione o serviço para aceder aos documentos.</p>
        </div>
      </div>

      {servicosDaEmpresa.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-slate-300">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Nenhum serviço encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {servicosDaEmpresa.map(par => {
            const docsCount = documentosCliente.filter(d => d.nome_empresa === par.nome_empresa && d.servico_contratado === par.servico_contratado && d.tipo !== '__pasta__').length;
            return (
              <div
                key={par.servico_contratado}
                onClick={() => setSelectedServico(par.servico_contratado)}
                className="group bg-white p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-amber-50/0 group-hover:bg-amber-50/50 transition-colors pointer-events-none" />
                <FolderOpen className="w-14 h-14 text-amber-200 group-hover:text-amber-500 transition-colors mb-3" />
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors" title={par.servico_contratado}>{par.servico_contratado}</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold bg-slate-100 px-2 py-0.5">
                  {docsCount} {docsCount === 1 ? 'Link' : 'Links'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDocumentsView = () => {
    // All real docs (excluding __pasta__ markers) for this service
    const allDocs = documentosCliente.filter(
      d => d.nome_empresa === selectedEmpresaName && d.servico_contratado === selectedServico && d.tipo !== '__pasta__'
    );

    const totalLinks = allDocs.length;

    return (
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedServico(null)} className="p-2 hover:bg-slate-100 text-slate-500 transition cursor-pointer border border-transparent hover:border-slate-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
                <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
                {selectedEmpresaName}
                <span className="text-slate-400 font-normal mx-1">/</span>
                <span className="text-blue-700">{selectedServico}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {totalLinks === 0 ? 'Nenhum link adicionado.' : `${totalLinks} ${totalLinks === 1 ? 'link' : 'links'} guardados`}
              </p>
            </div>
          </div>
          {/* Quick-add buttons per category */}
          <div className="flex flex-wrap gap-2 pl-14 sm:pl-0">
            {TIPOS_DOCUMENTO.map(({ tipo }) => (
              <button
                key={tipo}
                onClick={() => triggerAddLink(tipo)}
                className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-2 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 hover:border-blue-200"
              >
                <Plus className="w-3 h-3" /> {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          {allDocs.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <LinkIcon className="w-10 h-10 text-slate-200" />
              <div>
                <p className="text-sm font-semibold text-slate-500">Nenhum documento associado ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Utilize os botões acima para adicionar links do Google Drive.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-36">Categoria</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Nome do Documento</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-32 text-center">Data</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-28 text-center">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {TIPOS_DOCUMENTO.map(({ tipo, multi }) => {
                    const rows = allDocs.filter(d => d.tipo === tipo);
                    if (rows.length === 0) {
                      // Show empty placeholder row per category
                      return (
                        <tr key={tipo} className="border-b border-slate-100 last:border-0 bg-slate-50/40">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-sm">
                              <FileText className="w-3 h-3" />{tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 italic">— sem link —</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => triggerAddLink(tipo)}
                              className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 transition cursor-pointer flex items-center gap-1 mx-auto"
                            >
                              <Plus className="w-3 h-3" /> Adicionar
                            </button>
                          </td>
                          <td className="px-4 py-3" />
                        </tr>
                      );
                    }

                    return rows.map((doc, idx) => (
                      <tr key={doc.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 align-middle">
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-sm whitespace-nowrap">
                              <FileText className="w-3 h-3 shrink-0" />{tipo}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <button
                            onClick={() => window.open(doc.url_ficheiro, '_blank', 'noopener,noreferrer')}
                            className="flex items-center gap-2 text-left group/link cursor-pointer"
                            title={doc.url_ficheiro}
                          >
                            <div className="w-7 h-7 shrink-0 bg-blue-50 border border-blue-100 flex items-center justify-center group-hover/link:bg-blue-100 transition rounded-sm">
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover/link:text-blue-600 transition truncate max-w-xs">
                              {doc.nome_ficheiro || doc.url_ficheiro}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 align-middle text-center">
                          <span className="text-xs text-slate-400 tabular-nums">
                            {new Date(doc.data_upload).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(multi || rows.length === 1) && idx === rows.length - 1 && (
                              <button
                                onClick={() => triggerAddLink(tipo)}
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition cursor-pointer rounded-sm opacity-0 group-hover:opacity-100"
                                title={`Adicionar outro ${tipo}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteDocumento(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer rounded-sm opacity-0 group-hover:opacity-100"
                              title="Remover Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── MODALS ─────────────────────────────────────────────────────────────────

  const addPastaModal = showAddPastaModal && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddPastaModal(false)}>
      <div className="bg-white shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" /> Criar Pasta de Serviço
          </h2>
          <button onClick={() => setShowAddPastaModal(false)} className="text-slate-300 hover:text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleCreatePasta} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Empresa Cliente</label>
            <select required value={newPastaEmpresaId} onChange={e => setNewPastaEmpresaId(e.target.value)} className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
              <option value="">Selecione a empresa...</option>
              {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome_empresa}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Serviço Contratado</label>
            <select required value={newPastaServico} onChange={e => setNewPastaServico(e.target.value)} className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
              <option value="">Selecione o serviço...</option>
              {servicosConfig.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="pt-3 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAddPastaModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200 transition cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition cursor-pointer">Criar Pasta</button>
          </div>
        </form>
      </div>
    </div>
  );

  const addLinkModal = showAddLinkModal && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddLinkModal(false)}>
      <div className="bg-white shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-400" /> Adicionar Link — {linkTargetTipo}
          </h2>
          <button onClick={() => setShowAddLinkModal(false)} className="text-slate-300 hover:text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleAddLinkSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Nome do Documento (Opcional)</label>
            <input type="text" placeholder={`Ex: ${linkTargetTipo} — ${new Date().getFullYear()}`} value={newLinkNome} onChange={e => setNewLinkNome(e.target.value)} className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Link do Google Drive</label>
            <input type="url" required placeholder="https://drive.google.com/..." value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="w-full border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white" />
            <p className="text-[10px] text-slate-500 mt-1">Certifique-se que o link está partilhado correctamente no Drive.</p>
          </div>
          <div className="pt-3 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAddLinkModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200 transition cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition cursor-pointer">Guardar Link</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {!selectedEmpresaName
        ? renderEmpresasView()
        : !selectedServico
          ? renderServicosView()
          : renderDocumentsView()}
      {addPastaModal}
      {addLinkModal}
    </div>
  );
}
