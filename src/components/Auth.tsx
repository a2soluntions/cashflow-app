import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Por favor, preencha e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message || 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
        alert('Para cadastrar, preencha e-mail e senha.');
        return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Cadastro realizado! Verifique seu e-mail.');
    } catch (error: any) {
      alert(error.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800">
        <div className="flex justify-center mb-8">
          {/* AQUI ESTÁ A SUA LOGO NOVA */}
          <img 
            src="/logo.png" 
            alt="VittaCash" 
            className="w-40 h-40 object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">VittaCash</h1>
        <p className="text-zinc-400 text-center mb-8">Saúde financeira para sua empresa</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Entrar no Sistema <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={handleSignUp} className="text-sm text-green-500 hover:text-green-400">
            Ainda não tem conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
}