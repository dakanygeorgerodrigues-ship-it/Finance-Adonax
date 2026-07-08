import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, LogIn, UserPlus } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import adonaxLogo from '../assets/images/adonax_logo_1783458543607.jpg';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!hasSupabaseConfig) {
      onLogin({ email, user_metadata: { full_name: email.split('@')[0] } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        if (data.user) {
          onLogin(data.user);
        } else {
          setError('Cadastro realizado! Verifique seu e-mail para confirmar a conta e ativar seu acesso.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        if (data.user) {
          onLogin(data.user);
        }
      }
    } catch (err: any) {
      console.warn("[Login Auth Error]", err.message || err);
      
      const errMsg = err.message || '';
      
      if (isSignUp) {
        if (errMsg.toLowerCase().includes('already') || err.status === 400 || err.status === 422) {
          setError('Este e-mail já está cadastrado. Por favor, tente fazer login.');
        } else {
          setError(errMsg || 'Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
        }
      } else {
        if (errMsg === 'Email not confirmed' || errMsg.toLowerCase().includes('confirm')) {
          setError('Seu e-mail não foi confirmado ainda. Por favor, verifique sua caixa de entrada para ativar sua conta.');
        } else if (errMsg === 'Invalid login credentials' || errMsg.toLowerCase().includes('credentials') || errMsg.toLowerCase().includes('invalid')) {
          setError('E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.');
        } else if (errMsg.includes('rate limit') || err.status === 429) {
          setError('Muitas tentativas de login. Por favor, aguarde um momento antes de tentar novamente.');
        } else {
          setError(errMsg || 'Erro ao conectar ou autenticar. Por favor, tente novamente.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Limpar dados do visitante para vir zerado e forçar o tour
    const guestKeys = [
      'org_accounts_guest',
      'org_transactions_guest',
      'org_budgets_guest',
      'org_goals_guest',
      'org_card_invoices_guest',
      'org_categories_guest',
      'org_tour_completed_guest'
    ];
    guestKeys.forEach(key => localStorage.removeItem(key));

    onLogin({ 
      id: 'guest',
      email: 'visitante@app.com', 
      user_metadata: { full_name: 'Visitante' } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-modal w-full max-w-md p-6 sm:p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 overflow-hidden shadow-lg shadow-indigo-500/20 bg-[#040613]">
            <img 
              src={adonaxLogo} 
              alt="Adonax Finance Pro" 
              className="w-full h-full object-cover scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            ADONAX <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-medium">Finance</span>
          </h2>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold tracking-widest text-indigo-600 dark:text-indigo-300 uppercase">
            PRO EDITION
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-semibold">
            {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'} para continuar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-indigo-500/50"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-indigo-500/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-900/10 dark:border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">OU</span>
            <div className="flex-grow border-t border-slate-900/10 dark:border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-5 h-5 text-indigo-400" />
            Entrar como Visitante
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-semibold">
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          </p>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Fazer login' : 'Criar uma conta agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
