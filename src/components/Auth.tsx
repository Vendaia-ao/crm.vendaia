import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onLogin: (user: User) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Helper para traduzir erros técnicos do Supabase Auth para mensagens amigáveis
      const mapAuthError = (message: string): string => {
        const msg = message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
          return "E-mail ou palavra-passe errados. Por favor, verifique as suas credenciais.";
        }
        if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
          return "Este e-mail ainda não foi confirmado. Por favor, valide o seu e-mail.";
        }
        if (msg.includes("user not found")) {
          return "Este e-mail não está cadastrado no sistema.";
        }
        if (msg.includes("too many requests") || msg.includes("rate limit")) {
          return "Demasiadas tentativas de login. Por favor, tente mais tarde.";
        }
        return "Não foi possível realizar a autenticação. Verifique a sua ligação à internet ou tente novamente.";
      };

      // 1. Tentar autenticação usando Supabase Auth se o cliente estiver configurado
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        // Se autenticado com sucesso no Supabase Auth, buscar o perfil
        if (!authError && data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

          if (!profileError && profile) {
            onLogin({
              id: profile.id,
              email: profile.email,
              nome: profile.nome,
              perfil: profile.perfil,
              permissoes: profile.permissoes || 'dashboard,empresas,pipeline,projectos',
            });
            return;
          } else {
            throw new Error('Conta autenticada, mas o seu perfil de utilizador não foi encontrado. Contacte o administrador.');
          }
        } else if (authError) {
          throw new Error(mapAuthError(authError.message));
        }
      }

      // 2. Fallback institucional local (compatibilidade / desenvolvimento)
      if (password === 'vendaia@2026') {
        if (normalizedEmail === 'comercial@vendaia.com') {
          onLogin({
            id: 'comercial',
            email: 'comercial@vendaia.com',
            nome: 'Director Comercial',
            perfil: 'Comercial',
            permissoes: 'dashboard,empresas,pipeline,projectos,utilizadores',
          });
          return;
        } else if (normalizedEmail === 'operacional@vendaia.com') {
          onLogin({
            id: 'operacional',
            email: 'operacional@vendaia.com',
            nome: 'Director Operacional',
            perfil: 'Operacional',
            permissoes: 'dashboard,empresas,pipeline,projectos,utilizadores',
          });
          return;
        }
      }

      throw new Error(
        'E-mail ou palavra-passe errados. Por favor, verifique as suas credenciais.'
      );
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao tentar ligar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-none shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Branding */}
        <div className="px-8 pt-8 pb-8 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-none blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="flex items-center justify-center">
            <img 
              src="/assets/logo%20branco.png" 
              className="h-12 object-contain" 
              alt="VENDAIA SOLUTIONS" 
              onError={(e) => { 
                (e.currentTarget as HTMLImageElement).style.display = 'none'; 
              }} 
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider">EMAIL INSTITUCIONAL</label>
              <input
                type="email"
                placeholder="colaborador@vendaia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-slate-800 text-sm bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider">PALAVRA-PASSE</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-slate-800 text-sm bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm rounded-none transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-orange-500" />
              {isLoading ? 'A autenticar...' : 'Entrar no CRM'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[10px] text-slate-400 font-semibold italic">
              Seja bem-vindo. Introduza o seu email da VENDAIA e a sua senha para aceder ao pipeline.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
          <span>VENDAIA Angola © 2026</span>
          <span className="flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-orange-400" />
            Empower Sales
          </span>
        </div>

      </div>
    </div>
  );
}
