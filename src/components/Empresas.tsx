import React, { useState, useMemo } from 'react';
import { Empresa, Contacto, HistoricoItem } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Edit2, 
  History, 
  UserPlus, 
  Notebook, 
  Trash2,
  ExternalLink,
  ChevronRight,
  User,
  Mail,
  SlidersHorizontal,
  X,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface EmpresasProps {
  empresas: Empresa[];
  contactos: Contacto[];
  historico: HistoricoItem[];
  currentUser: string;
  onAddEmpresa: (empresa: Omit<Empresa, 'id' | 'data_cadastro'>, contacts?: Omit<Contacto, 'id' | 'empresa_id'>[]) => void;
  onUpdateEmpresa: (empresa: Empresa) => void;
  onAddContacto: (contacto: Omit<Contacto, 'id'>) => void;
  onAddHistorico: (item: Omit<HistoricoItem, 'id' | 'data'>) => void;
}

export default function Empresas({
  empresas,
  contactos,
  historico,
  currentUser,
  onAddEmpresa,
  onUpdateEmpresa,
  onAddContacto,
  onAddHistorico
}: EmpresasProps) {
  // Navigation & Modals status
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNicho, setSelectedNicho] = useState('todos');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(empresas[0]?.id || null);
  const [isSubmenuCollapsed, setIsSubmenuCollapsed] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.innerWidth < 1024;
    } catch {
      return false;
    }
  });

  // Modal forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Dynamic Inline Contacts during Empresa creation
  const [inlineContacts, setInlineContacts] = useState<Omit<Contacto, 'id' | 'empresa_id'>[]>([]);
  const [currConNome, setCurrConNome] = useState('');
  const [currConCargo, setCurrConCargo] = useState('');
  const [currConTel, setCurrConTel] = useState('');
  const [currConWhats, setCurrConWhats] = useState('');
  const [currConEmail, setCurrConEmail] = useState('');
  const [currConObs, setCurrConObs] = useState('');

  // Expand state for individual contacts listed under a company
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  // Form Fields - New Empresa
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNicho, setNewEmpNicho] = useState('');
  const [newEmpCidade, setNewEmpCidade] = useState('');
  const [newEmpEndereco, setNewEmpEndereco] = useState('');
  const [newEmpWeb, setNewEmpWeb] = useState('');
  const [newEmpInsta, setNewEmpInsta] = useState('');
  const [newEmpFb, setNewEmpFb] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpObs, setNewEmpObs] = useState('');

  // Form Fields - Edit Empresa
  const [editEmpId, setEditEmpId] = useState('');
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpNicho, setEditEmpNicho] = useState('');
  const [editEmpCidade, setEditEmpCidade] = useState('');
  const [editEmpEndereco, setEditEmpEndereco] = useState('');
  const [editEmpWeb, setEditEmpWeb] = useState('');
  const [editEmpInsta, setEditEmpInsta] = useState('');
  const [editEmpFb, setEditEmpFb] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpObs, setEditEmpObs] = useState('');

  // Form Fields - New Contacto
  const [newConNome, setNewConNome] = useState('');
  const [newConCargo, setNewConCargo] = useState('');
  const [newConTel, setNewConTel] = useState('');
  const [newConWhats, setNewConWhats] = useState('');
  const [newConEmail, setNewConEmail] = useState('');
  const [newConObs, setNewConObs] = useState('');

  // Form Fields - New Note in Historico
  const [newNoteText, setNewNoteText] = useState('');

  // Extract niches for filter
  const nichesList = useMemo(() => {
    const list = new Set(empresas.map(e => e.nicho).filter(Boolean));
    return Array.from(list);
  }, [empresas]);

  // Filtered List
  const filteredEmpresas = useMemo(() => {
    return empresas.filter(emp => {
      const matchSearch = emp.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (emp.nicho && emp.nicho.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.cidade && emp.cidade.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchNicho = selectedNicho === 'todos' || emp.nicho === selectedNicho;
      return matchSearch && matchNicho;
    });
  }, [empresas, searchTerm, selectedNicho]);

  // Selected Company Details
  const selectedEmpresa = useMemo(() => {
    return empresas.find(e => e.id === selectedEmpresaId) || empresas[0] || null;
  }, [empresas, selectedEmpresaId]);

  // Contacts associated with the selected company
  const associatedContacts = useMemo(() => {
    if (!selectedEmpresa) return [];
    return contactos.filter(c => c.empresa_id === selectedEmpresa.id);
  }, [contactos, selectedEmpresa]);

  // History timeline associated with the selected company
  const associatedHistory = useMemo(() => {
    if (!selectedEmpresa) return [];
    return historico
      .filter(h => h.empresa_id === selectedEmpresa.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [historico, selectedEmpresa]);

  const handleAddInlineContact = () => {
    if (!currConNome || !currConEmail) {
      alert('Nome e Email do contacto são obrigatórios!');
      return;
    }
    setInlineContacts([
      ...inlineContacts,
      {
        nome: currConNome,
        cargo: currConCargo,
        telefone: currConTel,
        whatsapp: currConWhats,
        email: currConEmail,
        observacoes: currConObs
      }
    ]);
    // Clear elements
    setCurrConNome('');
    setCurrConCargo('');
    setCurrConTel('');
    setCurrConWhats('');
    setCurrConEmail('');
    setCurrConObs('');
  };

  const handleRemoveInlineContact = (index: number) => {
    setInlineContacts(inlineContacts.filter((_, i) => i !== index));
  };

  // Submit operations
  const handleCreateEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPhone) {
      alert('Nome da Empresa e Telefone Principal são obrigatórios!');
      return;
    }

    // Capture any unsaved contact typed into inputs
    let contactsToSubmit = [...inlineContacts];
    if (currConNome.trim() && currConEmail.trim()) {
      contactsToSubmit.push({
        nome: currConNome,
        cargo: currConCargo,
        telefone: currConTel,
        whatsapp: currConWhats,
        email: currConEmail,
        observacoes: currConObs
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
    setInlineContacts([]);
    setCurrConNome('');
    setCurrConCargo('');
    setCurrConTel('');
    setCurrConWhats('');
    setCurrConEmail('');
    setCurrConObs('');
    setShowCreateModal(false);
  };

  const handleEditEmpresaClick = (emp: Empresa) => {
    setEditEmpId(emp.id);
    setEditEmpName(emp.nome_empresa);
    setEditEmpNicho(emp.nicho || '');
    setEditEmpCidade(emp.cidade || '');
    setEditEmpEndereco(emp.endereco || '');
    setEditEmpWeb(emp.website_actual || '');
    setEditEmpInsta(emp.instagram || '');
    setEditEmpFb(emp.facebook || '');
    setEditEmpPhone(emp.telefone_principal);
    setEditEmpObs(emp.observacoes || '');
    setShowEditModal(true);
  };

  const handleUpdateEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmpName || !editEmpPhone) {
      alert('Nome da empresa e Telefone Principal são obrigatórios.');
      return;
    }
    const origin = empresas.find(em => em.id === editEmpId);
    if (!origin) return;

    onUpdateEmpresa({
      ...origin,
      nome_empresa: editEmpName,
      nicho: editEmpNicho,
      cidade: editEmpCidade,
      endereco: editEmpEndereco,
      website_actual: editEmpWeb,
      instagram: editEmpInsta,
      facebook: editEmpFb,
      telefone_principal: editEmpPhone,
      observacoes: editEmpObs
    });

    // Logging edit
    onAddHistorico({
      empresa_id: editEmpId,
      autor: currentUser,
      tipo: 'nota',
      descricao: `Editou as informações principais da empresa.`
    });

    setShowEditModal(false);
  };

  const handleAddContactoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;
    if (!newConNome || !newConEmail) {
      alert('Nome e Email são obrigatórios para os contactos.');
      return;
    }

    onAddContacto({
      empresa_id: selectedEmpresa.id,
      nome: newConNome,
      cargo: newConCargo,
      telefone: newConTel,
      whatsapp: newConWhats,
      email: newConEmail,
      observacoes: newConObs
    });

    // Logging Contact
    onAddHistorico({
      empresa_id: selectedEmpresa.id,
      autor: currentUser,
      tipo: 'contacto',
      descricao: `Adicionou um novo contacto: ${newConNome} (${newConCargo})`
    });

    // Reset
    setNewConNome('');
    setNewConCargo('');
    setNewConTel('');
    setNewConWhats('');
    setNewConEmail('');
    setNewConObs('');
    setShowAddContactModal(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa || !newNoteText.trim()) return;

    onAddHistorico({
      empresa_id: selectedEmpresa.id,
      autor: currentUser,
      tipo: 'nota',
      descricao: `${newNoteText}`
    });

    setNewNoteText('');
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-AO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div id="empresas-module" className="flex flex-col lg:flex-row gap-6 relative transition-all duration-300">
      
      {/* LEFT SECTION: Search & Company List / Collapsible Submenu */}
      {isSubmenuCollapsed ? (
        /* On mobile, when collapsed, we do not render any block in the left section column to fully release screen space. 
           On desktop, we render the slim collapsible bar of 48px (w-12). */
        <div className="hidden lg:flex w-12 bg-slate-900 text-white rounded-xl shadow-sm flex-col items-center py-6 h-[calc(100vh-220px)] min-h-[500px] transition-all duration-300 shrink-0 border border-slate-900 gap-6 select-none animate-fade-in">
          <button
            onClick={() => setIsSubmenuCollapsed(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-orange-500 hover:text-white rounded-lg transition-all shadow cursor-pointer"
            title="Expandir Diretório de Clientes"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-[10px] uppercase tracking-widest font-extrabold font-mono writing-mode-vertical py-4">
            <span className="transform -rotate-90 origin-center whitespace-nowrap text-orange-500/80 tracking-widest">
              DIRETÓRIO
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full lg:w-[32%] bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-220px)] min-h-[500px] transition-all duration-300 shrink-0">
          {/* Header Tools */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSubmenuCollapsed(true)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-orange-500 transition cursor-pointer"
                  title="Recolher Diretório"
                  id="collapse-directory-btn"
                >
                  <Menu className="w-4 h-4 text-orange-500" />
                </button>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider select-none">Diretório</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-0.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-orange-500" />
                Adicionar
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar nome, nicho, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <select
                value={selectedNicho}
                onChange={(e) => setSelectedNicho(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded px-2 py-1 focus:outline-none"
              >
                <option value="todos">Todos os nichos</option>
                {nichesList.map(nich => (
                  <option key={nich} value={nich}>{nich}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Scrolling List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredEmpresas.map(emp => {
               const isSelected = selectedEmpresa && emp.id === selectedEmpresa.id;
               return (
                 <div
                   key={emp.id}
                   onClick={() => {
                     setSelectedEmpresaId(emp.id);
                     // Automatically collapse directory list on mobile to save space
                     if (window.innerWidth < 1024) {
                       setIsSubmenuCollapsed(true);
                     }
                   }}
                   className={`p-4 cursor-pointer text-left transition flex items-center justify-between group ${
                     isSelected ? 'bg-orange-50/50 border-r-2 border-orange-500' : 'hover:bg-slate-50'
                   }`}
                 >
                  <div className="space-y-1 pr-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition">
                      {emp.nome_empresa}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600 bg-slate-100 rounded px-1.5 py-0.2">{emp.nicho || 'Sem nicho'}</span>
                      <span>•</span>
                      <span>{emp.cidade || 'Sem cidade'}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 opacity-60 group-hover:translate-x-0.5 transition ${isSelected ? 'text-orange-500' : ''}`} />
                </div>
              );
            })}

            {filteredEmpresas.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                Nenhuma empresa localizada com os critérios correntes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT SECTION: Detailed Deep View (2 cols wide equivalent) */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Mobile Directory Re-opener Bar (Displayed only on mobile when list is hidden/collapsed) */}
        {isSubmenuCollapsed && (
          <div className="lg:hidden w-full bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-between p-3.5 border border-slate-950 gap-3 mb-2 select-none animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-350">
                Diretório Oculto
              </span>
            </div>
            <button
              onClick={() => setIsSubmenuCollapsed(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Expandir Diretório de Clientes"
            >
              <Menu className="w-3.5 h-3.5 text-orange-500" />
              Ver Empresas
            </button>
          </div>
        )}

        {selectedEmpresa ? (
          <div className="space-y-6">
            
            {/* Main Premium Banner info */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-xl flex items-center justify-center font-bold text-xl text-orange-500 shadow">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{selectedEmpresa.nome_empresa}</h2>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 font-bold">
                      Cliente Registado
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cadastrado em {formatDate(selectedEmpresa.data_cadastro)} • Cidade: {selectedEmpresa.cidade || 'Benguela'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleEditEmpresaClick(selectedEmpresa)}
                className="px-3.5 py-2 border border-slate-200 hover:border-orange-500 hover:text-orange-500 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar Dados
              </button>
            </div>

            {/* Core Info & Digital Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  Contactos e Localização Princial
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Telefone Central</span>
                    <span className="text-slate-800 font-bold text-sm">{selectedEmpresa.telefone_principal}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Nicho de Actuação</span>
                    <span className="text-slate-800 font-bold">{selectedEmpresa.nicho || 'Geral'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5 font-semibold">Endereço Completo</span>
                    <span className="text-slate-800 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      {selectedEmpresa.endereco || 'Sem endereço físico associado'}
                    </span>
                  </div>
                </div>

                {selectedEmpresa.observacoes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                    <span className="font-extrabold text-slate-500 block uppercase mb-1">Notas Operacionais</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{selectedEmpresa.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Digital channels */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-orange-400" />
                  Canais Digitais
                </h3>

                <div className="space-y-2.5">
                  
                  {/* Website */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 font-medium">Website</span>
                    </div>
                    {selectedEmpresa.website_actual ? (
                      <a 
                        href={`http://${selectedEmpresa.website_actual.replace(/(^\w+:|^)\/\//, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-500 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Visitar <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-slate-400 font-medium font-mono">Não tem</span>}
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-purple-600" />
                      <span className="text-slate-600 font-medium">Instagram</span>
                    </div>
                    {selectedEmpresa.instagram ? (
                      <a 
                        href={`https://instagram.com/${selectedEmpresa.instagram}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-500 font-bold hover:underline flex items-center gap-0.5"
                      >
                        @{selectedEmpresa.instagram} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-slate-400 font-medium font-mono">Não associado</span>}
                  </div>

                  {/* Facebook */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600 font-medium">Facebook</span>
                    </div>
                    {selectedEmpresa.facebook ? (
                      <a 
                        href={`https://facebook.com/${selectedEmpresa.facebook}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-500 font-bold hover:underline flex items-center gap-0.5"
                      >
                        {selectedEmpresa.facebook} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-slate-400 font-medium font-mono">Não associado</span>}
                  </div>

                </div>
              </div>

            </div>

            {/* Contacts & Activity History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Associated Contacts */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                      Contactos Associados ({associatedContacts.length})
                    </h3>
                    <button
                      onClick={() => setShowAddContactModal(true)}
                      className="text-xs text-orange-500 font-bold hover:text-orange-600 cursor-pointer"
                    >
                      + Novo
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {associatedContacts.map(con => {
                      const isExpanded = expandedContactId === con.id;
                      return (
                        <div key={con.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 transition">
                          <div className="flex justify-between items-start">
                            <div className="cursor-pointer flex-1 text-left" onClick={() => setExpandedContactId(isExpanded ? null : con.id)}>
                              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 hover:text-orange-600 transition">
                                {con.nome}
                                <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full select-none">
                                  {isExpanded ? '▲ Recolher' : '▼ Expandir'}
                                </span>
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">{con.cargo || 'Contacto Directo'}</span>
                            </div>
                            {con.whatsapp && (
                              <a
                                href={`https://wa.me/${con.whatsapp.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] bg-green-500 hover:bg-green-600 text-white font-bold px-1.5 py-0.5 rounded transition"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-200/50 space-y-2 mt-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-medium">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{con.email}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {con.telefone}
                                </span>
                              </div>
                              {con.observacoes && (
                                <div className="p-2 bg-white rounded border border-slate-100 text-[10px] text-slate-550 italic font-medium">
                                  Obs: {con.observacoes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {associatedContacts.length === 0 && (
                      <span className="text-slate-400 text-xs italic block py-4 text-center">
                        Nenhum contacto cadastrado nesta empresa ainda.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                    <History className="w-3.5 h-3.5 text-orange-400" />
                    Histórico da Empresa & Log
                  </h3>

                  {/* Add direct note form */}
                  <form onSubmit={handleAddNoteSubmit} className="mb-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar nota rápida de reunião ou ligação..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      Salvar
                    </button>
                  </form>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {associatedHistory.map(hist => {
                      const badgeColor = 
                        hist.tipo === 'cadastro' ? 'bg-blue-50 text-blue-700' :
                        hist.tipo === 'contacto' ? 'bg-purple-50 text-purple-700' :
                        hist.tipo === 'oportunidade' ? 'bg-amber-50 text-amber-700' :
                        hist.tipo === 'etapa_mudança' ? 'bg-orange-50 text-orange-700' :
                        hist.tipo === 'projeto' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700';

                      return (
                        <div key={hist.id} className="text-xs border-l-2 border-slate-200 pl-3 py-0.5 space-y-0.5 text-left relative">
                          <div className="absolute w-2 h-2 rounded-full bg-slate-300 -left-[5px] top-1.5"></div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800">{hist.autor}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{formatDate(hist.data)}</span>
                          </div>
                          <p className="text-slate-600 font-medium mt-0.5">{hist.descricao}</p>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.1.5 rounded-full ${badgeColor}`}>
                            {hist.tipo.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}

                    {associatedHistory.length === 0 && (
                      <span className="text-slate-400 text-xs italic block text-center py-4">No activity logged yet.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
            <p className="italic text-xs text-slate-400">
              Selecione uma empresa à esquerda para ver suas notas operacionais, canais, contactos e histórico.
            </p>
            {isSubmenuCollapsed && (
              <button
                onClick={() => setIsSubmenuCollapsed(false)}
                className="lg:hidden px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Menu className="w-4 h-4 text-orange-500" />
                Abrir Diretório
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Registar Nova Empresa
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmpresa} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">NOME DA EMPRESA *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sodiba S.A."
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NICHO COMERCIAL</label>
                  <input
                    type="text"
                    placeholder="Ex: Alimentar, Imobiliário"
                    value={newEmpNicho}
                    onChange={(e) => setNewEmpNicho(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TELEFONE PRINCIPAL *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +244 9..."
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CIDADE</label>
                  <input
                    type="text"
                    placeholder="Ex: Luanda, Talatona"
                    value={newEmpCidade}
                    onChange={(e) => setNewEmpCidade(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ENDEREÇO COMPLETO</label>
                  <input
                    type="text"
                    placeholder="Ex: Avenida Deolinda Rodrigues"
                    value={newEmpEndereco}
                    onChange={(e) => setNewEmpEndereco(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WEBSITE</label>
                  <input
                    type="text"
                    placeholder="Ex: www.empresa.com"
                    value={newEmpWeb}
                    onChange={(e) => setNewEmpWeb(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">INSTAGRAM</label>
                  <input
                    type="text"
                    placeholder="username do instagram"
                    value={newEmpInsta}
                    onChange={(e) => setNewEmpInsta(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">OBSERVAÇÕES OPERACIONAIS / BREVE TEXTO</label>
                  <textarea
                    rows={2}
                    placeholder="Alguma nota chave?"
                    value={newEmpObs}
                    onChange={(e) => setNewEmpObs(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  ></textarea>
                </div>

                {/* Dynamically Add Multiple Contacts Inline */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-500" />
                    Contactos Directos da Empresa (Lead)
                  </h4>
                  <p className="text-[11px] text-slate-450">Ao cadastrar a empresa, pode adicionar um ou mais contactos directos que deseja associar na nossa base.</p>

                  {/* Inline Contacts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">NOME COMPLETO *</label>
                      <input
                        type="text"
                        placeholder="Ex: Manuel Antunes"
                        value={currConNome}
                        onChange={(e) => setCurrConNome(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">CARGO / FUNÇÃO</label>
                      <input
                        type="text"
                        placeholder="Ex: Sócio-Gerente"
                        value={currConCargo}
                        onChange={(e) => setCurrConCargo(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">EMAIL DIRECTO *</label>
                      <input
                        type="email"
                        placeholder="Ex: m.antunes@empresa.com"
                        value={currConEmail}
                        onChange={(e) => setCurrConEmail(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">TELEFONE DIRECTO</label>
                      <input
                        type="text"
                        placeholder="Ex: +244 9..."
                        value={currConTel}
                        onChange={(e) => setCurrConTel(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">WHATSAPP</label>
                      <input
                        type="text"
                        placeholder="Ex: +244 9..."
                        value={currConWhats}
                        onChange={(e) => setCurrConWhats(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 font-sans">OBSERVAÇÕES DO CONTACTO</label>
                      <input
                        type="text"
                        placeholder="Ex: Prefere ligação directa"
                        value={currConObs}
                        onChange={(e) => setCurrConObs(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddInlineContact}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-orange-500" />
                        Adicionar à Lista
                      </button>
                    </div>
                  </div>

                  {/* Inline Contacts List */}
                  {inlineContacts.length > 0 && (
                    <div className="space-y-2 pt-2 text-left">
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Contactos adicionados ({inlineContacts.length}):</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {inlineContacts.map((c, i) => (
                          <div key={i} className="p-2 bg-slate-50 border border-slate-250 rounded flex justify-between items-center text-xs">
                            <div>
                              <p className="font-extrabold text-slate-800">{c.nome} <span className="font-normal text-slate-500 text-[10px]">({c.cargo || 'Geral'})</span></p>
                              <p className="text-[10px] text-slate-500 font-mono">{c.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveInlineContact(i)}
                              className="text-red-500 hover:text-red-700 p-1 font-bold text-xs"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setInlineContacts([]);
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-500" />
                  Salvar Registo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-orange-500" />
                Editar Dados da Empresa
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmpresaSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">NOME DA EMPRESA *</label>
                  <input
                    type="text"
                    required
                    value={editEmpName}
                    onChange={(e) => setEditEmpName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NICHO COMERCIAL</label>
                  <input
                    type="text"
                    value={editEmpNicho}
                    onChange={(e) => setEditEmpNicho(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TELEFONE CENTRAL *</label>
                  <input
                    type="text"
                    required
                    value={editEmpPhone}
                    onChange={(e) => setEditEmpPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CIDADE</label>
                  <input
                    type="text"
                    value={editEmpCidade}
                    onChange={(e) => setEditEmpCidade(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ENDEREÇO COMPLETO</label>
                  <input
                    type="text"
                    value={editEmpEndereco}
                    onChange={(e) => setEditEmpEndereco(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WEBSITE</label>
                  <input
                    type="text"
                    value={editEmpWeb}
                    onChange={(e) => setEditEmpWeb(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">INSTAGRAM</label>
                  <input
                    type="text"
                    value={editEmpInsta}
                    onChange={(e) => setEditEmpInsta(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">OBSERVAÇÕES</label>
                  <textarea
                    rows={3}
                    value={editEmpObs}
                    onChange={(e) => setEditEmpObs(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Confirmar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-5 h-5 text-orange-500" />
                Novo Contacto para {selectedEmpresa?.nome_empresa}
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactoSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">NOME DO CONTACTO DIRECTO *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Solange Neto"
                  value={newConNome}
                  onChange={(e) => setNewConNome(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">CARGO / FUNÇÃO</label>
                <input
                  type="text"
                  placeholder="Ex: Directora Comercial"
                  value={newConCargo}
                  onChange={(e) => setNewConCargo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">TELEFONE *</label>
                  <input
                    type="text"
                    required
                    placeholder="+244"
                    value={newConTel}
                    onChange={(e) => setNewConTel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">WHATSAPP</label>
                  <input
                    type="text"
                    placeholder="+244"
                    value={newConWhats}
                    onChange={(e) => setNewConWhats(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">EMAIL PROFISSIONAL *</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@empresa.com"
                  value={newConEmail}
                  onChange={(e) => setNewConEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">OBSERVAÇÕES DO CONTACTO</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prefere contacto por email"
                  value={newConObs}
                  onChange={(e) => setNewConObs(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
