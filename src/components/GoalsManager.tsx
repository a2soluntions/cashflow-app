import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import { Target, Plus, Trash2, TrendingUp, Trophy, Wallet, PiggyBank, X } from 'lucide-react';

interface GoalsManagerProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id' | 'current_amount'>) => void;
  onDeposit: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ goals, onAdd, onDeposit, onDelete }) => {
  const [newGoal, setNewGoal] = useState({ description: '', target_amount: '', date: '' });
  const [depositData, setDepositData] = useState<{ id: string, amount: string } | null>(null);
  
  // Estado para controlar a visibilidade do formulário no mobile
  const [showMobileForm, setShowMobileForm] = useState(false);

  const totalAccumulated = useMemo(() => goals.reduce((acc, g) => acc + g.current_amount, 0), [goals]);
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.target_amount, 0), [goals]);
  const totalProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.description || !newGoal.target_amount) return;
    onAdd({
        description: newGoal.description,
        target_amount: parseFloat(newGoal.target_amount),
        name: ''
    });
    setNewGoal({ description: '', target_amount: '', date: '' });
    setShowMobileForm(false); // Fecha o formulário no mobile após salvar
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositData) {
      onDeposit(depositData.id, parseFloat(depositData.amount));
      setDepositData(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in pb-20 lg:pb-0 overflow-hidden">
      
      {/* 1. LINHA DE RESUMO (TOPO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 overflow-y-auto max-h-[160px] lg:max-h-none custom-scrollbar p-1">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl"><Wallet className="w-5 h-5 text-slate-500" /></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Acumulado</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {totalAccumulated.toLocaleString()}</h3>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><Target className="w-5 h-5 text-emerald-500" /></div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Meta Global</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {totalTarget.toLocaleString()}</h3>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/20 text-white relative flex-col justify-between hidden md:flex">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy className="w-16 h-16" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Progresso Total</span>
              <div>
                  <div className="flex items-end gap-2 mb-2">
                      <h3 className="text-4xl font-black tracking-tighter">{totalProgress.toFixed(0)}%</h3>
                      <span className="text-xs font-bold mb-1.5 opacity-80">Concluído</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/90 rounded-full" style={{ width: `${totalProgress}%` }}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. ÁREA PRINCIPAL */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden relative">
          
          {/* BOTÃO MOBILE PARA ABRIR FORMULÁRIO */}
          <div className="lg:hidden shrink-0">
            <button 
                onClick={() => setShowMobileForm(!showMobileForm)}
                className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
                {showMobileForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showMobileForm ? 'Cancelar' : 'Nova Meta'}
            </button>
          </div>

          {/* NOVA META (Formulário) */}
          {/* Lógica: No Desktop (lg) sempre block. No Mobile, depende do state showMobileForm */}
          <div className={`${showMobileForm ? 'block' : 'hidden'} lg:block lg:col-span-1 shrink-0 overflow-y-auto absolute lg:relative z-20 w-full lg:w-auto h-full lg:h-auto bg-slate-50 dark:bg-black lg:bg-transparent`}>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                          <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Nova Meta</h3>
                          <p className="text-[10px] font-bold text-slate-400">Defina seu próximo sonho.</p>
                      </div>
                  </div>

                  <form onSubmit={handleAdd} className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nome do Objetivo</label>
                          <input 
                              type="text" 
                              placeholder="Ex: Viagem, Carro..." 
                              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 text-sm font-bold text-slate-700 dark:text-white transition-colors placeholder:text-slate-400"
                              value={newGoal.description}
                              onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                              required
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Valor Alvo</label>
                          <input 
                              type="number" 
                              placeholder="R$ 0,00" 
                              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 text-sm font-bold text-slate-700 dark:text-white transition-colors placeholder:text-slate-400"
                              value={newGoal.target_amount}
                              onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})}
                              required
                          />
                      </div>
                      <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-2">Criar Meta</button>
                  </form>
              </div>
          </div>

          {/* LISTA DE METAS */}
          <div className="lg:col-span-2 flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-24 lg:pb-4">
              {goals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50">
                      <Target className="w-16 h-16 mb-4" />
                      <p className="font-bold">Nenhuma meta criada ainda.</p>
                  </div>
              )}

              {goals.map(goal => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  const remaining = goal.target_amount - goal.current_amount;

                  return (
                      <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden shrink-0">
                          
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                                      <Target className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[150px]">{goal.description}</h3>
                                      <p className="text-[10px] font-bold text-slate-400">Em progresso</p>
                                  </div>
                              </div>
                              <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                  Faltam R$ {remaining.toLocaleString()}
                              </span>
                          </div>

                          <div className="mb-6">
                              <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                                  <div 
                                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(249,115,22,0.3)] relative" 
                                      style={{ width: `${progress}%` }}
                                  >
                                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex items-end justify-between">
                              <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Atual</p>
                                  <div className="flex items-baseline gap-1 flex-wrap">
                                      <span className="text-xl font-black text-slate-900 dark:text-white">R$ {goal.current_amount.toLocaleString()}</span>
                                      <span className="text-xs font-bold text-slate-500">/ R$ {goal.target_amount.toLocaleString()}</span>
                                  </div>
                              </div>

                              <div className="flex items-center gap-2">
                                  {depositData?.id === goal.id ? (
                                      <form onSubmit={handleDepositSubmit} className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4">
                                          <input 
                                              autoFocus
                                              type="number" 
                                              className="w-20 sm:w-24 bg-slate-50 dark:bg-black rounded-xl px-3 py-2 text-sm font-bold outline-none border border-emerald-500 text-slate-900 dark:text-white"
                                              placeholder="R$..."
                                              value={depositData.amount}
                                              onChange={e => setDepositData({...depositData, amount: e.target.value})}
                                          />
                                          <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700"><TrendingUp className="w-4 h-4" /></button>
                                          <button type="button" onClick={() => setDepositData(null)} className="text-slate-400 p-2"><Trash2 className="w-4 h-4" /></button>
                                      </form>
                                  ) : (
                                      <div className="flex gap-2">
                                          <button onClick={() => onDelete(goal.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                              <Trash2 className="w-5 h-5" />
                                          </button>
                                          <button 
                                              onClick={() => setDepositData({ id: goal.id, amount: '' })}
                                              className="px-4 sm:px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                          >
                                              <PiggyBank className="w-4 h-4" /> <span className="hidden sm:inline">Depositar</span>
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>

                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default GoalsManager;