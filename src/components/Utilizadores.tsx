import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search, 
  Shield, 
  Check, 
  Lock, 
  Unlock, 
  Mail, 
  Briefcase, 
  Info,
  UserCheck
} from 'lucide-react';

interface UtilizadoresProps {
  profiles: User[];
  currentUser: User;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function Utilizadores({
  profiles,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: UtilizadoresProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<UserProfile>('Comercial');
  const [allowedModules, setAllowedModules] = useState<string[]>([
    'dashboard', 'empresas', 'pipeline', 'projectos'
  ]);

  const toggleModulePermission = (mod: string) => {
    if (allowedModules.includes(mod)) {
      setAllowedModules(allowedModules.filter(m => m !== mod));
    } else {
      setAllowedModules([...allowedModules, mod]);
    }
  };

  const handleOpenNewModal = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setPerfil('Comercial');
    setAllowedModules(['dashboard', 'empresas', 'pipeline', 'projectos']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (usr: User) => {
    setEditingUser(usr);
    setNome(usr.nome);
    setEmail(usr.email);
    setPerfil(usr.perfil);
    setAllowedModules(usr.permissoes ? usr.permissoes.split(',') : []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const permissionsString = allowedModules.join(',');

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        nome,
        email: email.trim().toLowerCase(),
        perfil,
        permissoes: permissionsString
      });
    } else {
      onAddUser({
        nome,
        email: email.trim().toLowerCase(),
        perfil,
        permissoes: permissionsString
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (usr: User) => {
    if (usr.id === currentUser.id) {
      alert('Não é possível eliminar o utilizador ativo com o qual está ligado.');
      return;
    }
    if (confirm(`Tem a certeza que deseja eliminar o acesso de ${usr.nome}?`)) {
      onDeleteUser(usr.id);
    }
  };

  // Filter and search
  const filteredProfiles = profiles.filter(usr => {
    const matchesSearch = 
      usr.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : usr.perfil === roleFilter;
    return matchesSearch && matchesRole;
  });

  const availableModulesList = [
    { key: 'dashboard', label: 'Dashboard de Métricas', desc: 'Aceder a relatórios, KPIs e gráficos de conversão.' },
    { key: 'empresas', label: 'Empresas & Contactos', desc: 'Visualizar, registar e editar dados de empresas e contactos.' },
    { key: 'pipeline', label: 'Pipeline Comercial', desc: 'Gerir oportunidades de venda e funil de prospecção.' },
    { key: 'projectos', label: 'Gestão de Projectos', desc: 'Acompanhar os projectos e serviços ativos pós-venda.' },
    { key: 'utilizadores', label: 'Gestão de Utilizadores', desc: 'Adicionar, editar e remover acessos de colaboradores.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Informative Header / Guidelines Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500 rounded-full blur-3xl opacity-10 -mr-12 -mt-12"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-800 rounded-xl text-orange-500 border border-slate-700 shrink-0">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Gestão de Acessos & Utilizadores da VENDAIA</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Como Administrador, pode conceder ou revogar acessos a colaboradores específicos. O acesso é restrito a nível de módulo, garantindo que cada utilizador visualiza e opera apenas com os recursos atribuídos ao seu perfil funcional.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Segurança RLS Ativada no Supabase
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Autenticação Institucional Ativa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar utilizador por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 cursor-pointer"
          >
            <option value="all">Todos os Perfis</option>
            <option value="Comercial">Apenas Comercial</option>
            <option value="Operacional">Apenas Operacional</option>
          </select>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Novo Utilizador
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProfiles.length === 0 ? (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-medium">
            Nenhum utilizador encontrado com os filtros atuais.
          </div>
        ) : (
          filteredProfiles.map((usr) => {
            const permissionsList = usr.permissoes ? usr.permissoes.split(',') : [];
            const isSelf = usr.id === currentUser.id;

            return (
              <div 
                key={usr.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* User Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        usr.perfil === 'Operacional' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                        {usr.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {usr.nome}
                          {isSelf && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded border border-slate-200">
                              Tu
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-450" />
                          {usr.email}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                      usr.perfil === 'Operacional'
                        ? 'bg-blue-50/50 border-blue-100 text-blue-700'
                        : 'bg-orange-50/50 border-orange-100 text-orange-700'
                    }`}>
                      {usr.perfil}
                    </span>
                  </div>

                  {/* Modules Permissions Badges */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Permissões de Acesso:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {availableModulesList.map(mod => {
                        const hasAccess = permissionsList.includes(mod.key);
                        return (
                          <span 
                            key={mod.key} 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md border transition-all ${
                              hasAccess 
                                ? 'bg-slate-900 border-slate-950 text-white shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {hasAccess ? <Unlock className="w-2.5 h-2.5 text-orange-400" /> : <Lock className="w-2.5 h-2.5" />}
                            {mod.label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-400">
                    ID: {usr.id}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(usr)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Editar Utilizador"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(usr)}
                        className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 hover:border-red-600 border border-red-100 rounded-lg transition shadow-sm cursor-pointer"
                        title="Eliminar Acesso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-sm tracking-tight">
                  {editingUser ? `Editar Utilizador: ${editingUser.nome}` : 'Adicionar Novo Utilizador à VENDAIA'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-xs font-bold bg-slate-800 px-2.5 py-1 rounded"
              >
                Fechar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Miguel"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Email Corporativo *</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@vendaia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Perfil de Função *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPerfil('Comercial')}
                    className={`py-2 px-4 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      perfil === 'Comercial'
                        ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Comercial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerfil('Operacional')}
                    className={`py-2 px-4 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      perfil === 'Operacional'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Operacional
                  </button>
                </div>
              </div>

              {/* Advanced Access Management Checkboxes */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-850 tracking-wider uppercase">Gestão de Permissões de Acesso</span>
                </div>
                
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {availableModulesList.map(mod => {
                    const isChecked = allowedModules.includes(mod.key);
                    return (
                      <div 
                        key={mod.key}
                        onClick={() => toggleModulePermission(mod.key)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-white border-slate-250 shadow-sm' 
                            : 'bg-transparent border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition border ${
                          isChecked 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none">{mod.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{mod.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warning note on password */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-[10px] text-amber-800 leading-normal font-semibold">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Nota de Acesso: Após registar, este utilizador poderá entrar no CRM utilizando o respetivo email institucional e a palavra-passe padrão institucional <strong className="font-bold underline">vendaia@2026</strong>.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-md hover:shadow"
                >
                  {editingUser ? 'Guardar Alterações' : 'Criar Utilizador'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
