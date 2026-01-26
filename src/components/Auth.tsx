import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="w-full max-w-sm bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="w-44 h-44 bg-black rounded-full p-3 flex items-center justify-center border-2 border-zinc-800 overflow-hidden shadow-xl shadow-emerald-500/10">
             <img src="/logo.png" alt="VittaCash" className="w-full h-full object-contain scale-95" />
          </div>
        </div>
        
        {/* === MUDANÇA 1: Cores do Título === */}
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="text-emerald-500">Vitta</span>
          <span className="text-orange-500">Cash</span>
        </h1>

        {/* === MUDANÇA 2: Subtítulo Verde === */}
        <p className="text-emerald-500 text-center mb-8 font-medium tracking-wide">
          Saúde financeira para sua empresa
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none placeholder:text-zinc-700"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              
              <input
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none placeholder:text-zinc-700"
                placeholder="••••••••"
              />

              {/* === MUDANÇA 3: Olhinho Verde === */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-600/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Entrar no Sistema <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={handleSignUp} className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors font-medium">
            Ainda não tem conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
}