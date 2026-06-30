import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

type View = 'login' | 'forgot' | 'forgot-success';

export default function Auth({ onLogin }: AuthProps) {
  const [view, setView] = useState<View>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotError, setForgotError] = useState('');

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

      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

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
            console.error("Erro ao buscar perfil:", profileError);
            throw new Error(`Conta autenticada, mas o seu perfil de utilizador não foi encontrado. Erro: ${profileError?.message || 'Nenhum perfil retornado'}`);
          }
        } else if (authError) {
          throw new Error(mapAuthError(authError.message));
        }
      }

      // Fallback institucional local
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

      throw new Error('E-mail ou palavra-passe errados. Por favor, verifique as suas credenciais.');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao tentar ligar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail.trim()) {
      setForgotError('Por favor, introduza o seu endereço de e-mail.');
      return;
    }

    if (!supabase) {
      setForgotError('Serviço de autenticação não disponível.');
      return;
    }

    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/`,
        }
      );

      if (error) throw error;

      setView('forgot-success');
    } catch (err: any) {
      setForgotError('Não foi possível enviar o e-mail de recuperação. Verifique o endereço e tente novamente.');
    } finally {
      setIsSendingReset(false);
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

        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
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
                  placeholder="colaborador@vendaia.site"
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

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setForgotEmail(email); setForgotError(''); }}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold transition cursor-pointer"
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm rounded-none transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'A autenticar...' : 'Entrar no CRM'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-[10px] text-slate-400 font-semibold italic">
                Seja bem-vindo. Introduza o seu email da VENDAIA e a sua senha para aceder ao pipeline.
              </span>
            </div>
          </div>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === 'forgot' && (
          <div className="p-8">
            <button
              onClick={() => setView('login')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold mb-6 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
            </button>

            <div className="mb-6">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Recuperar palavra-passe</h2>
              <p className="text-xs text-slate-500 mt-1">
                Introduza o seu e-mail institucional. Receberá um link para redefinir a sua palavra-passe.
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none font-medium">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider">EMAIL INSTITUCIONAL</label>
                <input
                  type="email"
                  placeholder="colaborador@vendaia.site"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isSendingReset}
                  className="w-full px-3 py-2 text-slate-800 text-sm bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingReset}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-sm rounded-none transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                {isSendingReset ? 'A enviar...' : 'Enviar link de recuperação'}
              </button>
            </form>
          </div>
        )}

        {/* ── SUCCESS VIEW ── */}
        {view === 'forgot-success' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">E-mail enviado!</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Se o endereço <span className="font-bold text-slate-700">{forgotEmail}</span> existir no sistema, receberá um link para redefinir a sua palavra-passe em breve.
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                Verifique também a sua pasta de spam.
              </p>
            </div>
            <button
              onClick={() => { setView('login'); setForgotEmail(''); }}
              className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
          <span>VENDAIA Solutions © 2026</span>
        </div>

      </div>
    </div>
  );
}
