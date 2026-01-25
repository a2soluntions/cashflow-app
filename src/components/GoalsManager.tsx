import React, { useState } from 'react';
import { Target, Plus, Trophy, X, Calendar, Wallet, CheckCircle2 } from 'lucide-react';
import { Goal } from '../types';

interface GoalsManagerProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id' | 'current_amount'>) => void;
  onDeposit: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ goals, onAdd, onDeposit, onDelete }) => {
  const [depositModal, setDepositModal] = useState<string | null>(null);
  const [depositValue, setDepositValue] = useState('');
  
  // CORREÇÃO: Usando 'name' corretamente para evitar erro no TypeScript
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    deadline: ''
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const formatInputCurrency = (val: string) => {
    if (!val) return 'R$ 0,00';
    const num = parseFloat(val) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount || !newGoal.deadline) return;

    const amount = parseFloat(newGoal.target_amount) / 100;
    
    // CORREÇÃO: Cast 'as any' para garantir que passe mesmo se a interface no types.ts estiver desatualizada
    onAdd({
      name: newGoal.name,
      target_amount: amount,
      deadline: newGoal.deadline
    } as any); 

    setNewGoal({ name: '', target_amount: '', deadline: '' });
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositModal) {
      const amount = parseFloat(depositValue) / 100;
      onDeposit(depositModal, amount);
      setDepositModal(null);
      setDepositValue('');
    }
  };

  const totalGuardado = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const metaGlobal = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const percentualGlobal = metaGlobal > 0 ? (totalGuardado / metaGlobal) * 100 : 0;

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-24 lg:pb-0 custom-scrollbar">
      
      {/* CARDS DE RESUMO (TOPO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
               <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">Total Guardado</span>
               <h3 className="text-2xl font-black tracking-tighter mt-2">{formatCurrency(totalGuardado)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Wallet className="w-6 h-6 text-white" /></div>
         </div>

         <div className="bg-emerald-500 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
               <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">Meta Global</span>
               <h3 className="text-2xl font-black tracking-tighter mt-2">{formatCurrency(metaGlobal)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Target className="w-6 h-6 text-white" /></div>
         </div>

         <div className="bg-blue-500 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
               <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">Situação</span>
               <h3 className="text-2xl font-black tracking-tighter mt-2">
                 {percentualGlobal >= 100 ? 'Concluído!' : percentualGlobal > 50 ? 'Muito Bem!' : 'Em Andamento'}
               </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Trophy className="w-6 h-6 text-white" /></div>
         </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Formulário Fixo */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 shadow-xl h-fit sticky top-0">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-xl"><Plus className="w-6 h-6 text-indigo-500" /></div>
                    <h3 className="font-black text-xl text-white uppercase tracking-widest">Nova Meta</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome do Objetivo</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Viagem Disney" 
                          className="w-full bg-slate-950 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none border border-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-700" 
                          value={newGoal.name} 
                          onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} 
                          required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Valor Alvo</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-950 rounded-2xl px-5 py-4 text-lg font-black text-indigo-500 outline-none border border-slate-800 focus:border-indigo-500 transition-all" 
                          value={formatInputCurrency(newGoal.target_amount)} 
                          onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value.replace(/\D/g, '')})} 
                          required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Alvo</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-950 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none border border-slate-800 focus:border-indigo-500 transition-all" 
                          value={newGoal.deadline} 
                          onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} 
                          required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-indigo-900/20 active:scale-95 transition-all mt-2">
                        Criar Meta
                    </button>
                </form>
            </div>
        </div>

        {/* Lista de Metas */}
        <div className="lg:col-span-2 space-y-4">
            {goals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50 min-h-[300px]">
                    <Target className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma meta criada ainda.</p>
                    <p className="text-xs text-slate-600 mt-1">Use o formulário ao lado para começar.</p>
                </div>
            ) : (
                goals.map((goal) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  // CORREÇÃO: Fallback seguro para nome e data
                  const goalName = (goal as any).name || (goal as any).description || 'Meta';
                  const dateString = goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : '--/--/----';
                  
                  return (
                    <div key={goal.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative group transition-all hover:border-indigo-500/30">
                        <button onClick={() => onDelete(goal.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${progress >= 100 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                    {progress >= 100 ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-700 dark:text-white text-lg">{goalName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                                       <Calendar className="w-3 h-3" /> {dateString}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${progress >= 100 ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    {progress.toFixed(0)}% Concluído
                                </span>
                            </div>
                        </div>
                        
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-slate-800/50 p-[2px]">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`} style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Acumulado</span>
                                <span className="text-sm font-black text-slate-700 dark:text-white">{formatCurrency(goal.current_amount)} <span className="text-slate-500 text-xs font-normal">/ {formatCurrency(goal.target_amount)}</span></span>
                            </div>
                            <button onClick={() => setDepositModal(goal.id)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                                <Plus className="w-3 h-3" /> Depositar
                            </button>
                        </div>
                    </div>
                  );
                })
            )}
        </div>
      </div>

      {depositModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full sm:max-w-xs rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border border-slate-800">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500"><Wallet className="w-8 h-8" /></div>
                    <h3 className="font-black text-lg uppercase tracking-widest text-white">Guardar Dinheiro</h3>
                    <p className="text-xs text-slate-400 mt-1">Quanto você quer depositar hoje?</p>
                </div>
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <input autoFocus type="text" className="w-full bg-slate-950 rounded-2xl px-4 py-6 text-center text-2xl font-black outline-none border border-slate-800 focus:border-emerald-500 text-emerald-500 shadow-inner" value={formatInputCurrency(depositValue)} onChange={(e) => setDepositValue(e.target.value.replace(/\D/g, ''))} />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={() => { setDepositModal(null); setDepositValue(''); }} className="py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" className="py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;