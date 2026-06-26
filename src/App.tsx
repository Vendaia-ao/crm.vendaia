import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Empresa,
  Contacto,
  Oportunidade,
  HistoricoItem,
  PipelineEtapa,
  MotivoPerda,
  DocumentoCliente,
  TipoDocumentoCliente
} from './types';

import { supabase } from './lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Empresas from './components/Empresas';
import Pipeline from './components/Pipeline';
import Projectos from './components/Projectos';
import Clientes from './components/Clientes';
import Utilizadores from './components/Utilizadores';
import {
  Building2,
  LayoutDashboard,
  GitBranch,
  FolderLock,
  LogOut,
  ShieldAlert,
  Activity,
  Globe,
  Sparkles,
  RefreshCw,
  Menu,
  Shield,
  Settings,
  Users,
  Plus,
  Trash2,
  Key,
  FileText,
  X
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vendaia_crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Core CRM states initialized directly from database (no local fallback)
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);

  // projectos state is now managed inside <Projectos> via Supabase real-time.
  // We keep a lightweight reference here only for Pipeline automation (auto-create on deal close).
  const [projectos, setProjectos] = useState<{ id: string; oportunidade_id: string }[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  // User profiles state for CRUD and Access Management
  const [profiles, setProfiles] = useState<User[]>([]);

  // Clientes - documentos e pastas de serviço (tabela unificada)
  const [documentosCliente, setDocumentosCliente] = useState<DocumentoCliente[]>([]);

  // Dynamic services configuration
  const DEFAULT_SERVICOS = ['Website', 'Email Corporativo', 'Branding', 'Social Media', 'Tráfego Pago', 'Sistema Personalizado', 'Consultoria Tecnológica'];
  const [servicosConfig, setServicosConfig] = useState<string[]>(DEFAULT_SERVICOS);

  // Dynamic document types configuration for Clientes module
  const DEFAULT_TIPOS_DOCUMENTO = ['Proposta', 'Contrato', 'Factura Recíbo', 'Termo de Entrega', 'Factura Genérica'];
  const [tiposDocumentoConfig, setTiposDocumentoConfig] = useState<string[]>(DEFAULT_TIPOS_DOCUMENTO);

  // Navigation module state
  const [activeModule, setActiveModule] = useState<'dashboard' | 'empresas' | 'pipeline' | 'clientes' | 'projectos' | 'utilizadores'>('dashboard');

  // Main Menu Hamburguer responsive States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Advanced settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newServicoInput, setNewServicoInput] = useState('');
  const [newTipoDocInput, setNewTipoDocInput] = useState('');

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Database status and sync states
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; tablesExist: boolean; error: string | null }>({
    connected: false,
    tablesExist: false,
    error: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Connection check and database hydration
  useEffect(() => {
    const checkDbAndLoad = async () => {
      if (!supabase) {
        setDbStatus({
          connected: false,
          tablesExist: false,
          error: "Identificadores do Supabase ausentes no ficheiro .env. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
        });
        return;
      }

      try {
        // Attempt a lightweight probe query
        const { error: probeError } = await supabase.from("empresas").select("id").limit(1);
        let status = { connected: true, tablesExist: true, error: null as string | null };

        if (probeError) {
          if (probeError.code === "42P01" || probeError.message?.includes("does not exist")) {
            status = { connected: true, tablesExist: false, error: "Tabelas em falta no Supabase. É necessário executar a migração SQL." };
          } else {
            status = { connected: false, tablesExist: false, error: probeError.message };
          }
        }

        setDbStatus(status);

        if (status.connected && status.tablesExist) {
          // Perform concurrent requests to CRM database tables (projectos excluded – managed by <Projectos> component)
          const [empRes, conRes, optRes, projRes, histRes, profRes, docCliRes] = await Promise.all([
            supabase.from("empresas").select("*").order("data_cadastro", { ascending: false }),
            supabase.from("contactos").select("*"),
            supabase.from("oportunidades").select("*").order("data_entrada", { ascending: false }),
            supabase.from("projectos").select("id, oportunidade_id"),
            supabase.from("historico").select("*").order("data", { ascending: false }),
            supabase.from("profiles").select("*").order("data_cadastro", { ascending: false }),
            supabase.from("documentos_cliente").select("*").order("data_upload", { ascending: false }),
          ]);

          // Detect if any table does not exist database-side
          const errors = [empRes.error, conRes.error, optRes.error, projRes.error, histRes.error, docCliRes.error];
          const missingTableError = errors.find(e => e && (e.code === "42P01" || e.message?.includes("does not exist")));

          if (missingTableError) {
            setDbStatus(prev => ({
              ...prev,
              tablesExist: false,
              error: "As tabelas não existem no vosso projeto Supabase. Por favor, utilize o script SQL no Painel para criá-las.",
            }));
            return;
          }

          const cleanEmpresas = empRes.data || [];
          const cleanContactos = conRes.data || [];
          const cleanOportunidades = optRes.data || [];
          const cleanProjectosRef = projRes.data || [];
          const cleanHistorico = histRes.data || [];
          const cleanProfiles = profRes.data || [];
          const cleanDocumentosCliente = docCliRes.data || [];

          setEmpresas(cleanEmpresas);
          setContactos(cleanContactos);
          setOportunidades(cleanOportunidades);

          // Backfill: for every closed opportunity, ensure a folder exists in documentos_cliente
          const oportunidadesFechadas = cleanOportunidades.filter((o: any) => o.etapa === 'Fechado');
          const novasPastas: any[] = [];

          for (const opp of oportunidadesFechadas) {
            const empAssociada = cleanEmpresas.find((e: any) => e.id === opp.empresa_id);
            if (!empAssociada) continue;

            const pastaJaExiste = cleanDocumentosCliente.some(
              (d: any) => d.nome_empresa === empAssociada.nome_empresa && d.servico_contratado === opp.servico
            );

            if (!pastaJaExiste) {
              const marcador = {
                id: `pasta-${opp.id}`,
                nome_empresa: empAssociada.nome_empresa,
                servico_contratado: opp.servico,
                tipo: '__pasta__',
                nome_ficheiro: '',
                url_ficheiro: '',
                data_upload: opp.data_entrada || new Date().toISOString()
              };
              novasPastas.push(marcador);
            }
          }

          // Persist any missing folder markers to Supabase in one batch
          if (novasPastas.length > 0) {
            const { error: pastaError } = await supabase.from('documentos_cliente').upsert(novasPastas);
            if (pastaError) console.warn('Backfill pastas:', pastaError.message);
          }

          // Merge backfilled folders with what was already loaded
          const allDocumentos = [...cleanDocumentosCliente, ...novasPastas];
          setDocumentosCliente(allDocumentos);

          // Lightweight reference for pipeline automation
          setProjectos(cleanProjectosRef);

          setHistorico(cleanHistorico);

          if (cleanProfiles.length > 0) {
            setProfiles(cleanProfiles);

            // If current user's profile is updated in DB, sync local currentUser!
            if (currentUser) {
              const updatedMe = cleanProfiles.find((p: User) => p.email.toLowerCase() === currentUser.email.toLowerCase());
              if (updatedMe) {
                setCurrentUser(updatedMe);
                localStorage.setItem('vendaia_crm_user', JSON.stringify(updatedMe));
              }
            }
          }

          setLastSynced(new Date().toLocaleTimeString('pt-AO'));

        }
      } catch (err: any) {
        console.error("Erro ao comunicar com o Supabase:", err);
        setDbStatus({
          connected: false,
          tablesExist: false,
          error: err.message || "Erro desconhecido ao ligar ao Supabase.",
        });
      }
    };

    checkDbAndLoad();
  }, []);

  // Silent debounced background sync to Supabase when active states change
  // NOTE: projectos are managed by <Projectos> component directly via Supabase – not synced here
  useEffect(() => {
    if (dbStatus.connected && dbStatus.tablesExist && supabase) {
      const delayDebounce = setTimeout(async () => {
        try {
          // Sync Stage A: Empresas
          if (empresas && empresas.length > 0) {
            const { error } = await supabase.from("empresas").upsert(empresas);
            if (error) throw new Error(`[Empresas] ${error.message}`);
          }
          // Sync Stage B: Oportunidades
          if (oportunidades && oportunidades.length > 0) {
            const { error } = await supabase.from("oportunidades").upsert(oportunidades);
            if (error) throw new Error(`[Oportunidades] ${error.message}`);
          }
          // Sync Stage C: Contactos
          if (contactos && contactos.length > 0) {
            const { error } = await supabase.from("contactos").upsert(contactos);
            if (error) throw new Error(`[Contactos] ${error.message}`);
          }
          // Sync Stage D: Historico
          if (historico && historico.length > 0) {
            const { error } = await supabase.from("historico").upsert(historico);
            if (error) throw new Error(`[Historico] ${error.message}`);
          }
          // Sync Stage E: Profiles
          if (profiles && profiles.length > 0) {
            const { error } = await supabase.from("profiles").upsert(profiles);
            if (error) throw new Error(`[Profiles] ${error.message}`);
          }
          // Sync Stage F: Documentos Cliente (unified table)
          if (documentosCliente && documentosCliente.length > 0) {
            const { error } = await supabase.from("documentos_cliente").upsert(documentosCliente);
            if (error) throw new Error(`[Documentos Cliente] ${error.message}`);
          }

          setLastSynced(new Date().toLocaleTimeString('pt-AO'));
        } catch (err: any) {
          console.warn("Background sync error:", err);
        }
      }, 3000);
      return () => clearTimeout(delayDebounce);
    }
  }, [empresas, contactos, oportunidades, historico, profiles, documentosCliente, dbStatus.connected, dbStatus.tablesExist]);

  // Manual Triggered Sync
  const triggerManualSync = async () => {
    if (!supabase) {
      alert("Ligação ao Supabase em falta. Certifique-se de configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setIsSyncing(true);
    try {
      if (empresas && empresas.length > 0) {
        const { error } = await supabase.from("empresas").upsert(empresas);
        if (error) throw error;
      }
      if (oportunidades && oportunidades.length > 0) {
        const { error } = await supabase.from("oportunidades").upsert(oportunidades);
        if (error) throw error;
      }
      if (contactos && contactos.length > 0) {
        const { error } = await supabase.from("contactos").upsert(contactos);
        if (error) throw error;
      }
      // Note: projectos are managed directly by <Projectos> component – not synced here
      if (historico && historico.length > 0) {
        const { error } = await supabase.from("historico").upsert(historico);
        if (error) throw error;
      }
      if (profiles && profiles.length > 0) {
        const { error } = await supabase.from("profiles").upsert(profiles);
        if (error) throw error;
      }
      if (documentosCliente && documentosCliente.length > 0) {
        const { error } = await supabase.from("documentos_cliente").upsert(documentosCliente);
        if (error) throw error;
      }

      setDbStatus(prev => ({ ...prev, tablesExist: true, error: null }));
      setLastSynced(new Date().toLocaleTimeString('pt-AO'));
      alert('Os dados foram sincronizados com sucesso na base de dados!');
    } catch (err: any) {
      alert('Não foi possível sincronizar os dados. Verifique a sua ligação de rede ou a estrutura das tabelas.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth operations
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vendaia_crm_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vendaia_crm_user');
  };

  // User profiles CRUD handlers
  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    try {
      let finalId = 'u_' + Math.random().toString(36).substring(2, 11);

      // Se o Supabase estiver ligado, tentar criar no Supabase Auth primeiro
      if (dbStatus.connected && dbStatus.tablesExist && supabase) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

        if (supabaseUrl && supabaseAnonKey) {
          const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }
          });

          // Registar no Supabase Auth com a senha padrão vendaia@2026
          const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: newUser.email.trim().toLowerCase(),
            password: 'vendaia@2026',
            options: {
              data: {
                nome: newUser.nome,
                perfil: newUser.perfil,
              }
            }
          });

          if (authError) {
            if (!authError.message.includes("already registered") && !authError.message.includes("already exists")) {
              throw new Error(`Erro ao registar credenciais: ${authError.message}`);
            }
          }

          if (authData?.user?.id) {
            finalId = authData.user.id;
          }
        }

        // Criar o registo correspondente na tabela profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          id: finalId,
          email: newUser.email.trim().toLowerCase(),
          nome: newUser.nome,
          perfil: newUser.perfil,
          permissoes: newUser.permissoes || 'dashboard,empresas,pipeline,projectos'
        });

        if (profileError) {
          throw new Error(`Erro ao registar o perfil: ${profileError.message}`);
        }
      }

      const created: User = {
        ...newUser,
        id: finalId
      };
      setProfiles([...profiles, created]);
      alert(`Utilizador '${newUser.nome}' criado com sucesso! O acesso está configurado com a palavra-passe padrão 'vendaia@2026'.`);
    } catch (err: any) {
      alert(`Não foi possível criar o utilizador: ${err.message || 'Verifique se o e-mail já existe ou a sua ligação de rede.'}`);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      if (dbStatus.connected && dbStatus.tablesExist && supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({
            nome: updatedUser.nome,
            email: updatedUser.email.trim().toLowerCase(),
            perfil: updatedUser.perfil,
            permissoes: updatedUser.permissoes
          })
          .eq("id", updatedUser.id);

        if (error) throw error;
      }

      setProfiles(profiles.map(p => p.id === updatedUser.id ? updatedUser : p));

      // Se for o próprio utilizador logado a atualizar, sincronizar localmente
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('vendaia_crm_user', JSON.stringify(updatedUser));
      }
      alert(`Dados de '${updatedUser.nome}' atualizados com sucesso!`);
    } catch (err: any) {
      alert(`Não foi possível atualizar o utilizador: ${err.message || 'Ocorreu um erro ao gravar as alterações.'}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const userToDelete = profiles.find(p => p.id === id);
    const nomeToDelete = userToDelete ? userToDelete.nome : 'Utilizador';

    try {
      if (dbStatus.connected && dbStatus.tablesExist && supabase) {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
      }

      setProfiles(profiles.filter(p => p.id !== id));
      alert(`O acesso de '${nomeToDelete}' foi removido com sucesso.`);
    } catch (err: any) {
      alert(`Não foi possível remover o utilizador: ${err.message || 'Ocorreu um erro de permissão ou rede.'}`);
    }
  };

  // Core Mutation triggers - Empresa
  const handleAddEmpresa = (
    newEmp: Omit<Empresa, 'id' | 'data_cadastro'>,
    associatedCon?: Omit<Contacto, 'id' | 'empresa_id'>[]
  ) => {
    const companyId = `emp-${Date.now()}`;
    const fresh: Empresa = {
      ...newEmp,
      id: companyId,
      data_cadastro: new Date().toISOString()
    };
    const updated = [fresh, ...empresas];
    setEmpresas(updated);

    // Auto historic logging
    const log: HistoricoItem = {
      id: `hist-${Date.now()}`,
      empresa_id: fresh.id,
      autor: currentUser?.nome || 'Sistema',
      data: new Date().toISOString(),
      tipo: 'cadastro',
      descricao: `Adicionou nova empresa '${fresh.nome_empresa}' no diretório.`
    };

    // Add contacts if provided
    if (associatedCon && associatedCon.length > 0) {
      const freshContacts: Contacto[] = associatedCon.map((c, idx) => ({
        ...c,
        id: `con-${Date.now()}-${idx}`,
        empresa_id: companyId
      }));
      setContactos(prev => [...freshContacts, ...prev]);

      const logContactos: HistoricoItem = {
        id: `hist-${Date.now()}-contacts`,
        empresa_id: companyId,
        autor: currentUser?.nome || 'Sistema',
        data: new Date().toISOString(),
        tipo: 'contacto',
        descricao: `Adicionou ${associatedCon.length} contacto(s) inicial(ais) junto ao cadastro da empresa.`
      };
      setHistorico([logContactos, log, ...historico]);
    } else {
      setHistorico([log, ...historico]);
    }
  };

  const handleUpdateEmpresa = (editedEmp: Empresa) => {
    const updated = empresas.map(e => e.id === editedEmp.id ? editedEmp : e);
    setEmpresas(updated);
  };

  // Core Mutation triggers - Contacto
  const handleAddContacto = (newCon: Omit<Contacto, 'id'>) => {
    const fresh: Contacto = {
      ...newCon,
      id: `con-${Date.now()}`
    };
    setContactos([fresh, ...contactos]);
  };

  const handleDeleteContacto = (id: string) => {
    setContactos(contactos.filter(c => c.id !== id));
  };

  // Core Mutation triggers - Opportunity & Pipeline stage update!
  const handleAddOportunidade = (newOpt: Omit<Oportunidade, 'id' | 'data_entrada'>) => {
    const fresh: Oportunidade = {
      ...newOpt,
      id: `oport-${Date.now()}`,
      data_entrada: new Date().toISOString()
    };
    setOportunidades([fresh, ...oportunidades]);

    // History Log
    const log: HistoricoItem = {
      id: `hist-${Date.now()}`,
      empresa_id: fresh.empresa_id,
      autor: currentUser?.nome || 'Sistema',
      data: new Date().toISOString(),
      tipo: 'oportunidade',
      descricao: `Identificou oportunidade de '${fresh.servico}' avaliada em ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(fresh.valor_estimado)}`
    };
    setHistorico([log, ...historico]);
  };

  const handleDeleteOportunidade = async (id: string) => {
    setOportunidades(oportunidades.filter(o => o.id !== id));
    if (dbStatus.connected && dbStatus.tablesExist && supabase) {
      try {
        const { error } = await supabase.from("oportunidades").delete().eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.warn("Erro ao eliminar oportunidade no Supabase:", err);
      }
    }
  };

  const handleUpdateOportunidadeEtapa = async (
    id: string,
    novaEtapa: PipelineEtapa,
    motivoPerda?: MotivoPerda,
    perdaDetalhe?: string,
    notaExtra?: string,
    valorAcordado?: number
  ) => {
    const previousLead = oportunidades.find(o => o.id === id);
    if (!previousLead) return;

    const updated = oportunidades.map(opt => {
      if (opt.id === id) {
        return {
          ...opt,
          etapa: novaEtapa,
          motivo_perda: novaEtapa === 'Perdido' ? motivoPerda : undefined,
          motivo_perda_detalhe: novaEtapa === 'Perdido' ? perdaDetalhe : undefined,
          observacoes: notaExtra ? (opt.observacoes ? `${opt.observacoes}\n${notaExtra}` : notaExtra) : opt.observacoes,
          valor_estimado: valorAcordado !== undefined ? valorAcordado : opt.valor_estimado
        };
      }
      return opt;
    });
    setOportunidades(updated);

    // History change log
    const log: HistoricoItem = {
      id: `hist-${Date.now()}`,
      empresa_id: previousLead.empresa_id,
      autor: currentUser?.nome || 'Sistema',
      data: new Date().toISOString(),
      tipo: 'etapa_mudança',
      descricao: `Alterou etapa de '${previousLead.etapa}' para '${novaEtapa}'` +
        (novaEtapa === 'Perdido' && motivoPerda ? ` (Motivo de Perda: ${motivoPerda})` : '') +
        (notaExtra ? ` - ${notaExtra}` : '')
    };
    setHistorico([log, ...historico]);

    // Automacao: Se 'Fechado', criar Projecto automaticamente no Supabase (sem duplicados)
    if (novaEtapa === 'Fechado') {
      const projectoJaExiste = projectos.some(p => p.oportunidade_id === id);

      if (!projectoJaExiste) {
        const d = new Date();
        const start = d.toISOString();
        d.setDate(d.getDate() + 30);
        const due = d.toISOString().split('T')[0];

        const projId = 'proj-' + Date.now();

        // Dados da empresa e contacto
        const empAssociada = empresas.find(e => e.id === previousLead.empresa_id);

        const newProj = {
          id: projId,
          empresa_id: previousLead.empresa_id,
          servico: previousLead.servico,
          valor: valorAcordado !== undefined ? valorAcordado : previousLead.valor_estimado,
          data_inicio: start,
          prazo: due,
          responsavel: previousLead.responsavel,
          estado: 'Em Produção',
          observacoes: previousLead.observacoes || 'Faturado. Transmitido automaticamente para a equipa técnica.',
          oportunidade_id: id
        };

        // Insert directly into Supabase (Projectos component will pick it up via real-time subscription)
        if (supabase && dbStatus.connected && dbStatus.tablesExist) {
          supabase.from('projectos').insert(newProj).then(({ error }) => {
            if (error) console.warn('Erro ao criar projecto automático:', error.message);
            else {
              // Update lightweight reference
              setProjectos(prev => [...prev, { id: projId, oportunidade_id: id }]);
            }
          });
        } else {
          // Fallback: just update local reference
          setProjectos(prev => [...prev, { id: projId, oportunidade_id: id }]);
        }

        // Automacao: Criar pasta de Cliente/Serviço automaticamente na tabela unificada
        const nomeEmpresa = empAssociada ? empAssociada.nome_empresa : 'Empresa';
        const pastaJaExiste = documentosCliente.some(
          d => d.nome_empresa === nomeEmpresa && d.servico_contratado === previousLead.servico
        );

        if (!pastaJaExiste) {
          const marcadorPasta: DocumentoCliente = {
            id: `pasta-${Date.now()}`,
            nome_empresa: nomeEmpresa,
            servico_contratado: previousLead.servico,
            tipo: '__pasta__',
            nome_ficheiro: '',
            url_ficheiro: '',
            data_upload: new Date().toISOString()
          };
          setDocumentosCliente(prev => [marcadorPasta, ...prev]);
          if (supabase && dbStatus.connected && dbStatus.tablesExist) {
            supabase.from('documentos_cliente').insert(marcadorPasta).then(({ error }) => {
              if (error) console.warn('Erro ao criar pasta no Supabase:', error.message);
            });
          }
        }

        // 3. Log de historico
        const projLog: HistoricoItem = {
          id: 'hist-' + (Date.now() + 1),
          empresa_id: previousLead.empresa_id,
          autor: 'Sistema Vendaia',
          data: new Date().toISOString(),
          tipo: 'cliente',
          descricao: 'Negócio fechado! Projecto e pasta de Cliente de "' + previousLead.servico + '" para "' + nomeEmpresa + '" criados automaticamente.'
        };
        setHistorico(prev => [projLog, log, ...prev]);
      }
    }
  };

  // Projectos mutations are now handled inside <Projectos> component via Supabase.
  // This callback refreshes the lightweight reference used by Pipeline automation.
  const handleProjectosChanged = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('projectos').select('id, oportunidade_id');
      if (data) setProjectos(data);
    } catch (_) { }
  }, []);

  const handleAddDocumentoCliente = async (doc: Omit<DocumentoCliente, 'id' | 'data_upload'>) => {
    const newDoc: DocumentoCliente = {
      ...doc,
      id: `doc-${Date.now()}`,
      data_upload: new Date().toISOString()
    };
    // Optimistic update
    setDocumentosCliente(prev => [newDoc, ...prev]);
    // Persist to Supabase immediately
    if (supabase && dbStatus.connected && dbStatus.tablesExist) {
      const { error } = await supabase.from('documentos_cliente').insert(newDoc);
      if (error) {
        console.warn('Erro ao guardar documento no Supabase:', error.message);
      }
    }
  };

  const handleDeleteDocumentoCliente = async (id: string) => {
    setDocumentosCliente(documentosCliente.filter(d => d.id !== id));
    if (dbStatus.connected && dbStatus.tablesExist && supabase) {
      try {
        const { error } = await supabase.from("documentos_cliente").delete().eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.warn("Erro ao eliminar documento no Supabase:", err);
      }
    }
  };

  // Services configuration handlers
  const handleAddServico = () => {
    const trimmed = newServicoInput.trim();
    if (!trimmed) return;
    if (servicosConfig.includes(trimmed)) {
      alert('Este serviço já existe na lista.');
      return;
    }
    setServicosConfig(prev => [...prev, trimmed]);
    setNewServicoInput('');
  };

  const handleRemoveServico = (s: string) => {
    if (servicosConfig.length <= 1) {
      alert('Tem de existir pelo menos um serviço configurado.');
      return;
    }
    if (confirm(`Remover o serviço '${s}' da configuração?`)) {
      setServicosConfig(prev => prev.filter(x => x !== s));
    }
  };

  const handleAddTipoDocumento = () => {
    const trimmed = newTipoDocInput.trim();
    if (!trimmed) return;
    if (tiposDocumentoConfig.includes(trimmed)) {
      alert('Este tipo de documento já existe na lista.');
      return;
    }
    setTiposDocumentoConfig(prev => [...prev, trimmed]);
    setNewTipoDocInput('');
  };

  const handleRemoveTipoDocumento = (t: string) => {
    if (tiposDocumentoConfig.length <= 1) {
      alert('Tem de existir pelo menos um tipo de documento configurado.');
      return;
    }
    if (confirm(`Remover o tipo de documento '${t}'?`)) {
      setTiposDocumentoConfig(prev => prev.filter(x => x !== t));
    }
  };

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As palavras-passe não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      alert('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsChangingPassword(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      alert('Palavra-passe alterada com sucesso!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(`Erro ao alterar palavra-passe: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateProjectoPrazoObs = (id: string, novoPrazo: string, novasObs: string) => {
    setProjectos(projectos.map(p => p.id === id ? { ...p, prazo: novoPrazo, observacoes: novasObs } : p));
  };

  const handleAddHistorico = (item: Omit<HistoricoItem, 'id' | 'data'>) => {
    const newItem: HistoricoItem = {
      ...item,
      id: `hist-${Date.now()}`,
      data: new Date().toISOString()
    };
    setHistorico([newItem, ...historico]);
  };

  // Check if current user has permission to view a specific module
  const hasPermission = (moduleName: string) => {
    if (!currentUser) return false;
    if (!currentUser.permissoes) return true;
    return currentUser.permissoes.split(',').includes(moduleName);
  };

  // Render Login view if user isn't logged in
  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">

      {/* DESKTOP SIDEBAR - VISIBLE ON MD AND UP */}
      <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0 transition-all duration-300`}>
        {/* Branding Area with Hamburger menu button */}
        <div className="p-4 border-b border-slate-200 relative flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo_horizontal.png"
                className="h-7 object-contain max-w-[130px]"
                alt="VENDAIA SOLUTIONS"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
          ) : (
            <img
              src="/assets/ícone.png"
              className="h-7 w-7 object-contain mx-auto"
              alt="V"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1.5 rounded-none hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            title={isSidebarCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
          >
            <Menu className="w-4 h-4 text-orange-500" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          {hasPermission('dashboard') && (
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'dashboard'
                ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>
          )}

          {hasPermission('empresas') && (
            <button
              onClick={() => setActiveModule('empresas')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'empresas'
                ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              title="Empresas B2B"
            >
              <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
              {!isSidebarCollapsed && <span>Empresas</span>}
            </button>
          )}

          {hasPermission('pipeline') && (
            <button
              onClick={() => setActiveModule('pipeline')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'pipeline'
                ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              title="Pipeline Comercial"
            >
              <GitBranch className="w-4 h-4 shrink-0 text-slate-400" />
              {!isSidebarCollapsed && <span>Pipeline</span>}
            </button>
          )}

          {hasPermission('projectos') && (
            <>
              <button
                onClick={() => setActiveModule('clientes')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'clientes'
                  ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                  : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                title="Clientes Ativos"
              >
                <Users className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>Clientes</span>}
              </button>
              <button
                onClick={() => setActiveModule('projectos')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'projectos'
                  ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                  : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                title="Gestão de Projetos"
              >
                <FolderLock className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>Projectos</span>}
              </button>
            </>
          )}

          {hasPermission('utilizadores') && (
            <button
              onClick={() => setActiveModule('utilizadores')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left ${activeModule === 'utilizadores'
                ? 'bg-blue-50/85 text-blue-700 border-blue-700'
                : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              title="Utilizadores e Acessos"
            >
              <Shield className="w-4 h-4 shrink-0 text-slate-400" />
              {!isSidebarCollapsed && <span>Utilizadores & Acessos</span>}
            </button>
          )}

          {hasPermission('configuracoes') && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-6 py-3'} text-xs font-bold transition-all border-r-4 text-left text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent`}
              title="Configurações Avançadas"
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-400" />
              {!isSidebarCollapsed && <span>Configurações</span>}
            </button>
          )}


        </nav>

        {/* Desktop Sidebar Bottom Partner Profile Card */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/55">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} p-2 bg-white border border-slate-205 rounded-none shadow-sm`}>
            <div className="w-8 h-8 rounded-none bg-slate-900 text-orange-500 font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
              {currentUser.nome.substring(0, 2).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{currentUser.nome}</p>
                  <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">{currentUser.perfil}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="p-1 text-slate-400 hover:text-amber-600 transition rounded-none hover:bg-amber-50 cursor-pointer"
                    title="Alterar Senha"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-slate-400 hover:text-red-650 transition rounded-none hover:bg-red-50 cursor-pointer"
                    title="Encerrar Sessão"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-none flex justify-center transition cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER & HORIZONTAL NAVBAR - VISIBLE ON MOBILE ONLY */}
      <div className="md:hidden flex flex-col bg-slate-900 text-white z-40 shadow-md shrink-0">
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2 py-1">
            <img
              src="/assets/logo%20branco.png"
              className="h-8 object-contain max-w-[125px]"
              alt="VENDAIA SOLUTIONS"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = '0';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-none transition cursor-pointer"
              title="Alterar Senha"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 bg-slate-800 hover:bg-red-655 text-slate-300 hover:text-white rounded-none transition cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal layout pill navigation on mobile */}
        <div className="bg-slate-800 px-3 py-2 flex gap-1.5 overflow-x-auto whitespace-nowrap shadow-inner scrollbar-hide">
          {hasPermission('dashboard') && (
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'dashboard' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                }`}
            >
              Dashboard
            </button>
          )}
          {hasPermission('empresas') && (
            <button
              onClick={() => setActiveModule('empresas')}
              className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'empresas' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                }`}
            >
              Empresas
            </button>
          )}
          {hasPermission('pipeline') && (
            <button
              onClick={() => setActiveModule('pipeline')}
              className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'pipeline' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                }`}
            >
              Pipeline
            </button>
          )}
          {hasPermission('projectos') && (
            <>
              <button
                onClick={() => setActiveModule('clientes')}
                className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'clientes' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                  }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setActiveModule('projectos')}
                className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'projectos' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                  }`}
              >
                Projectos
              </button>
            </>
          )}
          {hasPermission('utilizadores') && (
            <button
              onClick={() => setActiveModule('utilizadores')}
              className={`px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer ${activeModule === 'utilizadores' ? 'bg-orange-500 text-slate-950 font-black shadow-sm' : 'text-slate-305 bg-slate-900/60'
                }`}
            >
              Utilizadores
            </button>
          )}
          {hasPermission('configuracoes') && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-1 rounded-none text-[10px] font-extrabold uppercase transition select-none cursor-pointer text-slate-305 bg-slate-900/60 hover:text-white"
            >
              Configurações
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT SECTION */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* SUB-HEADER USER STATE LINE */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize select-none">
              {activeModule === 'projectos' ? 'Gestão de Projectos'
                : activeModule === 'pipeline' ? 'Pipeline Comercial'
                  : activeModule === 'utilizadores' ? 'Utilizadores & Acessos'
                    : activeModule === 'clientes' ? 'Clientes Ativos'
                      : activeModule === 'empresas' ? 'Base de Empresas'
                        : activeModule === 'dashboard' ? 'Dashboard'
                          : activeModule}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 transition text-[11px] text-slate-600 font-semibold rounded-none border border-slate-200">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              {currentUser.nome}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {/* Sincronização automática e invisível em segundo plano */}
          </div>
        </header>

        {/* SCROLLABLE VIEW STAGE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
          {activeModule === 'dashboard' && (
            <Dashboard
              oportunidades={oportunidades}
              empresas={empresas}
              servicosConfig={servicosConfig}
            />
          )}

          {activeModule === 'empresas' && (
            <Empresas
              empresas={empresas}
              contactos={contactos}
              historico={historico}
              currentUser={currentUser.nome}
              onAddEmpresa={handleAddEmpresa}
              onUpdateEmpresa={handleUpdateEmpresa}
              onAddContacto={handleAddContacto}
              onAddHistorico={handleAddHistorico}
            />
          )}

          {activeModule === 'pipeline' && (
            <Pipeline
              oportunidades={oportunidades}
              empresas={empresas}
              contactos={contactos}
              currentUser={currentUser.nome}
              onAddOportunidade={handleAddOportunidade}
              onUpdateOportunidadeEtapa={handleUpdateOportunidadeEtapa}
              onDeleteOportunidade={handleDeleteOportunidade}
              onAddEmpresa={handleAddEmpresa}
              profiles={profiles}
              servicosConfig={servicosConfig}
            />
          )}

          {activeModule === 'clientes' && (
            <Clientes
              empresas={empresas}
              servicosConfig={servicosConfig}
              tiposDocumentoConfig={tiposDocumentoConfig}
              documentosCliente={documentosCliente}
              onAddDocumento={handleAddDocumentoCliente}
              onDeleteDocumento={handleDeleteDocumentoCliente}
            />
          )}

          {activeModule === 'projectos' && (
            <Projectos
              empresas={empresas}
              profiles={profiles}
              servicosConfig={servicosConfig}
              onProjectosChanged={handleProjectosChanged}
            />
          )}

          {activeModule === 'utilizadores' && (
            <Utilizadores
              profiles={profiles}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser}
            />
          )}
        </main>

        {/* CLEAN SYSTEM FOOTER */}
        <footer className="bg-white text-slate-500 border-t border-slate-200 py-4 px-8 text-xs shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="flex items-center gap-1.5 text-[11px]">

              <span>Vendaia CRM v1.0</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Ambiente Seguro de Auditoria • Luanda, Angola 2026
            </p>
          </div>
        </footer>

      </div>

      {/* Supabase SQL Migration Instructions Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-none shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-905 text-slate-900">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-amber-100 text-amber-700 rounded-none text-[10px] font-black">SQL EDITOR</span>
                  Tabelas em falta no Supabase
                </h3>
                <p className="text-xs text-slate-500 mt-1">Crie a estrutura de dados necessária para persistência segura.</p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-black cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-amber-50 text-amber-900 p-3.5 rounded-none border border-amber-200 flex gap-2">
                <span className="font-bold shrink-0">Passo a Passo:</span>
                <span>Copie o código SQL abaixo, abra o painel do seu projeto no <strong>Supabase (supabase.com)</strong>, vá para o menu <strong>SQL Editor</strong> na barra lateral esquerda, clique em <strong>New Query</strong>, cole o código e clique em <strong>Run</strong> no canto inferior direito.</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded-none border-t border-x border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                  <span>Vendaia CRM Schema (v1.0)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`-- =================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - VENDAIA CRM (SUPABASE)
-- =================================================================

-- 1. Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  nicho TEXT NOT NULL,
  cidade TEXT NOT NULL,
  endereco TEXT NOT NULL,
  website_actual TEXT,
  instagram TEXT,
  facebook TEXT,
  telefone_principal TEXT NOT NULL,
  observacoes TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Oportunidades (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS oportunidades (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor_estimado NUMERIC NOT NULL,
  responsavel TEXT NOT NULL,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  etapa TEXT NOT NULL,
  motivo_perda TEXT,
  motivo_perda_detalhe TEXT,
  origem TEXT NOT NULL
);

-- 3. Tabela de Contactos (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS contactos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  observacoes TEXT
);

-- 4. Tabela de Projectos (Relacionada a Empresas e Oportunidades)
CREATE TABLE IF NOT EXISTS projectos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  prazo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  estado TEXT NOT NULL,
  observacoes TEXT,
  oportunidade_id TEXT NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE
);

-- 5. Tabela de Histórico (Relacionada a Empresas)
CREATE TABLE IF NOT EXISTS historico (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL
);

-- 6. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  contacto_principal TEXT,
  telefone TEXT,
  email TEXT,
  servico_contratado TEXT NOT NULL,
  valor_negocio NUMERIC NOT NULL DEFAULT 0,
  data_fecho TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  projeto_associado TEXT,
  estado TEXT NOT NULL DEFAULT 'Aguardando Apresentação',
  data_reuniao TEXT,
  hora_reuniao TEXT,
  local_reuniao TEXT,
  observacoes_reuniao TEXT,
  proxima_acao TEXT DEFAULT ''
);

-- 7. Tabela de Documentos do Cliente
CREATE TABLE IF NOT EXISTS documentos_cliente (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nome_ficheiro TEXT NOT NULL,
  url_ficheiro TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- POLÍTICAS DE SEGURANÇA E RLS (ROW LEVEL SECURITY)
-- =================================================================

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para permitir acesso ao CRM via chaves de API seguras (anon / authenticated)
-- Como o CRM é de uso interno e sincronizado de forma segura, garantimos controle total para chamadas autorizadas:

-- Políticas para a tabela 'empresas'
DROP POLICY IF EXISTS "Acesso total Empresas" ON empresas;
CREATE POLICY "Acesso total Empresas" ON empresas 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'oportunidades'
DROP POLICY IF EXISTS "Acesso total Oportunidades" ON oportunidades;
CREATE POLICY "Acesso total Oportunidades" ON oportunidades 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'contactos'
DROP POLICY IF EXISTS "Acesso total Contactos" ON contactos;
CREATE POLICY "Acesso total Contactos" ON contactos 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'projectos'
DROP POLICY IF EXISTS "Acesso total Projectos" ON projectos;
CREATE POLICY "Acesso total Projectos" ON projectos 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'historico'
DROP POLICY IF EXISTS "Acesso total Historico" ON historico;
CREATE POLICY "Acesso total Historico" ON historico 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'clientes'
DROP POLICY IF EXISTS "Acesso total Clientes" ON clientes;
CREATE POLICY "Acesso total Clientes" ON clientes 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Políticas para a tabela 'documentos_cliente'
DROP POLICY IF EXISTS "Acesso total Documentos Cliente" ON documentos_cliente;
CREATE POLICY "Acesso total Documentos Cliente" ON documentos_cliente 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);
`);
                      alert('Código SQL copiado!');
                    }}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded-none hover:bg-slate-50 text-[9px] font-extrabold text-slate-800 cursor-pointer"
                  >
                    Copiar SQL
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-none overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[180px] border border-slate-800">
                  {`-- 1. Empresas Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  nicho TEXT NOT NULL,
  cidade TEXT NOT NULL,
  endereco TEXT NOT NULL,
  website_actual TEXT,
  instagram TEXT,
  facebook TEXT,
  telefone_principal TEXT NOT NULL,
  observacoes TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Oportunidades Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS oportunidades (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor_estimado NUMERIC NOT NULL,
  responsavel TEXT NOT NULL,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  etapa TEXT NOT NULL,
  motivo_perda TEXT,
  motivo_perda_detalhe TEXT,
  origem TEXT NOT NULL
);

-- 3. Contactos Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS contactos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  observacoes TEXT
);

-- 4. Projectos Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS projectos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  prazo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  estado TEXT NOT NULL,
  observacoes TEXT,
  oportunidade_id TEXT NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE
);

-- 5. Historico Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS historico (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL
);

-- 6. Clientes Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  contacto_principal TEXT,
  telefone TEXT,
  email TEXT,
  servico_contratado TEXT NOT NULL,
  valor_negocio NUMERIC NOT NULL DEFAULT 0,
  data_fecho TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  projeto_associado TEXT,
  estado TEXT NOT NULL DEFAULT 'Aguardando Apresentação',
  data_reuniao TEXT,
  hora_reuniao TEXT,
  local_reuniao TEXT,
  observacoes_reuniao TEXT,
  proxima_acao TEXT DEFAULT ''
);

-- 7. Documentos Cliente Table (Com RLS habilitado)
CREATE TABLE IF NOT EXISTS documentos_cliente (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nome_ficheiro TEXT NOT NULL,
  url_ficheiro TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HABILITAR RLS EM TODAS AS TABELAS:
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO TOTAL PARA ROLES DO CRM (anon, authenticated):
CREATE POLICY "Acesso total Empresas" ON empresas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Oportunidades" ON oportunidades FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Contactos" ON contactos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Projectos" ON projectos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Historico" ON historico FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Clientes" ON clientes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Documentos Cliente" ON documentos_cliente FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`}
                </pre>
              </div>

              <div className="text-slate-500 italic mt-2">
                Nota: Ao rodar este script, as suas relações serão criadas com sucesso de forma segura e imediata.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-55 flex justify-end gap-2">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-900 border border-transparent text-white rounded-none font-bold cursor-pointer hover:bg-slate-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIGURAÇÕES AVANÇADAS MODAL ===== */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-none shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 sm:p-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Configurações Avançadas
                </h2>
                <p className="text-slate-300 text-xs mt-0.5">Gerir serviços, acessos e preferências do sistema</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
              {/* Services Management */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Serviços Disponíveis
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Estes serviços aparecem em todos os selectores de serviço da plataforma.
                </p>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[44px] bg-slate-50 rounded-none p-3 border border-slate-200">
                  {servicosConfig.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-semibold bg-blue-100 text-blue-800"
                    >
                      {s}
                      <button
                        onClick={() => handleRemoveServico(s)}
                        className="hover:text-red-600 transition ml-1"
                        title={`Remover "${s}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newServicoInput}
                    onChange={e => setNewServicoInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddServico()}
                    placeholder="Novo serviço (ex: SEO, Consultoria...)"
                    className="flex-1 border border-slate-300 rounded-none px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button
                    onClick={handleAddServico}
                    className="bg-blue-600 text-white px-3 py-2 rounded-none hover:bg-blue-700 transition flex items-center gap-1 text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>

              {/* Document Types Management */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Tipos de Documento (Clientes)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Estes tipos de documento estão disponíveis para associar a cada cliente na gestão de clientes.
                </p>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[44px] bg-slate-50 rounded-none p-3 border border-slate-200">
                  {tiposDocumentoConfig.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-semibold bg-green-100 text-green-800"
                    >
                      {t}
                      <button
                        onClick={() => handleRemoveTipoDocumento(t)}
                        className="hover:text-red-600 transition ml-1"
                        title={`Remover "${t}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTipoDocInput}
                    onChange={e => setNewTipoDocInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTipoDocumento()}
                    placeholder="Novo tipo (ex: Adenda, Orçamento...)"
                    className="flex-1 border border-slate-300 rounded-none px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                  />
                  <button
                    onClick={handleAddTipoDocumento}
                    className="bg-green-600 text-white px-3 py-2 rounded-none hover:bg-green-700 transition flex items-center gap-1 text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded-none hover:bg-slate-700 font-semibold text-sm transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ALTERAR PALAVRA-PASSE MODAL ===== */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" /> Alterar Palavra-passe
                </h2>
                <p className="text-amber-100 text-xs mt-0.5">Defina uma nova palavra-passe para a sua conta</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-amber-100 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nova Palavra-passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-slate-300 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Confirmar Palavra-passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repita a nova palavra-passe"
                  className="w-full border border-slate-300 rounded-none px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-none hover:bg-slate-50 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2 bg-amber-600 text-white rounded-none hover:bg-amber-700 text-sm font-bold transition disabled:opacity-60"
                >
                  {isChangingPassword ? 'A alterar...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
