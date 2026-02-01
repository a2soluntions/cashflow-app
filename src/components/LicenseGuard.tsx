import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Lock, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
// Importe a logo aqui também para garantir
import logoVitta from '../assets/logo.png'; 

const APP_VERSION = "1.0.0"; 

interface LicenseGuardProps {
  onUnlock: () => void;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ onUnlock }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [machineId, setMachineId] = useState<string>('');

  // Inicialização
  useEffect(() => {
    // 1. Garante um ID de máquina persistente
    let id = localStorage.getItem('vittacash_machine_id');
    if (!id) {
      id = Math.random().toString(36).substring(7);
      localStorage.setItem('vittacash_machine_id', id);
    }
    setMachineId(id);

    // 2. Verifica se já tem chave salva
    const savedKey = localStorage.getItem('vittacash_saved_key');
    if (savedKey) {
      console.log("Chave encontrada na memória:", savedKey);
      setLicenseKey(savedKey); // Preenche o campo visualmente
      validateKey(savedKey, id); // Tenta validar
    } else {
      setLoading(false); // Libera para digitar
    }
  }, []);

  const validateKey = async (key: string, currentId: string) => {
    setError('');
    const cleanKey = key.trim();

    try {
      // Consulta ao Banco
      const { data, error: dbError } = await supabase
        .from('licenses')
        .select('*')
        .eq('key', cleanKey)
        .single();

      if (dbError) throw new Error("Erro de conexão com o servidor. Verifique sua internet.");
      if (!data) throw new Error("Esta chave não existe.");
      if (data.status !== 'active') throw new Error("Licença inativa ou bloqueada.");

      // Verificação de Máquina
      // Se a licença já tem um ID gravado E ele é diferente do atual -> BLOQUEIA
      if (data.machine_id && data.machine_id !== currentId) {
        throw new Error(`Licença vinculada a outro PC. (ID Atual: ${currentId})`);
      }

      // Se passou por tudo, vincula a máquina (se for a primeira vez) e libera
      if (!data.machine_id) {
        await supabase.from('licenses').update({ machine_id: currentId }).eq('key', cleanKey);
      }

      // SUCESSO ABSOLUTO
      localStorage.setItem('vittacash_saved_key', cleanKey); // Garante que salvou
      setLoading(false);
      onUnlock(); // Entra no App

    } catch (err: any) {
      console.error("Erro de validação:", err);
      // AQUI ESTÁ A MUDANÇA: Não apagamos a chave, apenas mostramos o erro
      setError(err.message || "Erro desconhecido");
      setLoading(false); // Para o loading para mostrar o erro
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    validateKey(licenseKey, machineId);
  };

  // Tela de Loading Silencioso (só aparece se estiver tudo dando certo)
  if (loading && !error) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center font-inter text-white">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm tracking-widest uppercase">Validando licença...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4 font-inter text-white">
      <div className="bg-[#0f172a] w-full max-w-md p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* LOGO */}
        <div className="flex justify-center mb-6">
           <img src={logoVitta} className="h-12 object-contain" alt="Logo" />
        </div>

        <div className="text-center mb-6">
  <h1 className="text-xl font-black text-white mb-1 uppercase">Ativação</h1>
  <p className="text-slate-400 text-xs font-medium">
    Insira sua chave de acesso. <span className="opacity-50">v{APP_VERSION}</span>
  </p>
</div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <ShieldCheck className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-[#1e293b] border-2 border-slate-800 focus:border-emerald-500 rounded-xl py-4 pl-12 pr-4 text-white font-mono text-center text-sm tracking-wider placeholder:text-slate-600 outline-none transition-all shadow-inner uppercase"
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-rose-200 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            disabled={loading || !licenseKey}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/50 text-center">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            ID: <span className="text-slate-500 font-mono">{machineId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseGuard;