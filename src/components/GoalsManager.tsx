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
  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '', date: '' });
  const [depositData, setDepositData] = useState<{ id: string, amount: string } | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);

  // --- HELPER DE FORMATAÇÃO (PADRÃO VITTACASH) ---
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalAccumulated = useMemo(() => goals.reduce((acc, g) => acc + g.current_amount, 0), [goals]);
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.target_amount, 0), [goals]);
  const totalProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) return;
    
    // Envia para o App.tsx
    onAdd({
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        deadline: newGoal.date
    });
    
    setNewGoal({ title: '', target_amount: '', date: '' });
    setShowMobileForm(false);
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
      
      {/* 1. LINHA DE RESUMO (TOPO - ESTILO DASHBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 overflow-y-auto max-h-[160px] lg:max-h-none custom-scrollbar p-1">
          
          {/* Card 1: Total Acumulado */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet className="w-24 h-24" /></div>
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-slate-500">
                      <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Acumulado</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatCurrency(totalAccumulated)}
              </h3>
          </div>

          {/* Card 2: Meta Global */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative hidden md:block overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Target className="w-24 h-24 text-emerald-500" /></div>
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500">
                      <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Meta Global</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatCurrency(totalTarget)}
              </h3>
          </div>

          {/* Card 3: Progresso (Com Gradiente) */}
          <div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 text-white relative flex flex-col justify-between md:flex overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20"><Trophy className="w-24 h-24" /></div>
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Trophy className="w-6 h-6" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Progresso Geral</span>
              </div>

              <div className="relative z-10">
                  <div className="flex items-end gap-2 mb-2">
                      <h3 className="text-3xl font-black tracking-tighter">{totalProgress.toFixed(0)}%</h3>
                      <span className="text-xs font-bold mb-1.5 opacity-80 uppercase tracking-wide">Concluído</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalProgress}%` }}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. ÁREA PRINCIPAL (GRID) */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden relative">
          
          {/* BOTÃO MOBILE */}
          <div className="lg:hidden shrink-0">
            <button 
                onClick={() => setShowMobileForm(!showMobileForm)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
                {showMobileForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showMobileForm ? 'Cancelar' : 'Nova Meta'}
            </button>
          </div>

          {/* COLUNA 1: FORMULÁRIO DE NOVA META */}
          <div className={`lg:block lg:col-span-1 shrink-0 overflow-y-auto absolute lg:relative z-20 w-full lg:w-auto h-full lg:h-auto bg-slate-50 dark:bg-black lg:bg-transparent ${showMobileForm ? 'block' : 'hidden'}`}>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm sticky top-0">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Plus className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                          <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">Nova Meta</h3>
                          <p className="text-xs font-bold text-slate-400">Defina seu próximo sonho.</p>
                      </div>
                  </div>

                  <form onSubmit={handleAdd} className="space-y-5">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Objetivo</label>
                          <input 
                              type="text" 
                              placeholder="Ex: Viagem, Carro..." 
                              className="w-full bg-slate-50 dark:bg-black border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none text-sm font-bold text-slate-700 dark:text-white transition-all placeholder:text-slate-400 shadow-inner"
                              value={newGoal.title}
                              onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Valor Alvo</label>
                          <input 
                              type="number" 
                              placeholder="R$ 0,00" 
                              className="w-full bg-slate-50 dark:bg-black border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none text-sm font-bold text-slate-700 dark:text-white transition-all placeholder:text-slate-400 shadow-inner"
                              value={newGoal.target_amount}
                              onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})}
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Prazo (Opcional)</label>
                          <input 
                              type="date" 
                              className="w-full bg-slate-50 dark:bg-black border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none text-xs font-bold text-slate-700 dark:text-white transition-all shadow-inner"
                              value={newGoal.date}
                              onChange={e => setNewGoal({...newGoal, date: e.target.value})}
                          />
                      </div>
                      
                      {/* BOTÃO CORRIGIDO PARA VERDE */}
                      <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4">
                          Criar Meta
                      </button>
                  </form>
              </div>
          </div>

          {/* COLUNA 2 e 3: LISTA DE METAS */}
          <div className="lg:col-span-2 flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-24 lg:pb-4">
              {goals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50 h-full">
                      <Target className="w-20 h-20 mb-6" />
                      <p className="font-black text-lg uppercase tracking-widest">Nenhuma meta criada</p>
                  </div>
              )}

              {goals.map(goal => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  const remaining = goal.target_amount - goal.current_amount;

                  return (
                      <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden shrink-0 transition-all hover:border-emerald-500/30">
                          
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shadow-sm">
                                      <Target className="w-7 h-7" />
                                  </div>
                                  <div>
                                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-[200px]">{goal.title}</h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                                      </p>
                                  </div>
                              </div>
                              <span className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap shadow-inner">
                                  Faltam {formatCurrency(remaining)}
                              </span>
                          </div>

                          <div className="mb-6">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                  <span>Progresso</span>
                                  <span>{progress.toFixed(1)}%</span>
                              </div>
                              <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-1 shadow-inner">
                                  <div 
                                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-sm relative" 
                                      style={{ width: `${progress}%` }}
                                  >
                                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex items-end justify-between bg-slate-50 dark:bg-black/50 p-4 rounded-2xl">
                              <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                  <div className="flex items-baseline gap-1 flex-wrap">
                                      <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(goal.current_amount)}</span>
                                      <span className="text-xs font-bold text-slate-400">/ {formatCurrency(goal.target_amount)}</span>
                                  </div>
                              </div>

                              <div className="flex items-center gap-2">
                                  {depositData?.id === goal.id ? (
                                      <form onSubmit={handleDepositSubmit} className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4">
                                          <input 
                                              autoFocus
                                              type="number" 
                                              className="w-24 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-sm font-bold outline-none border-2 border-emerald-500 text-slate-900 dark:text-white shadow-sm"
                                              placeholder="R$..."
                                              value={depositData.amount}
                                              onChange={e => setDepositData({...depositData, amount: e.target.value})}
                                          />
                                          <button type="submit" className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 shadow-md"><TrendingUp className="w-4 h-4" /></button>
                                          <button type="button" onClick={() => setDepositData(null)} className="text-slate-400 p-2.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
                                      </form>
                                  ) : (
                                      <div className="flex gap-2">
                                          <button onClick={() => onDelete(goal.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Excluir">
                                              <Trash2 className="w-5 h-5" />
                                          </button>
                                          <button 
                                              onClick={() => setDepositData({ id: goal.id, amount: '' })}
                                              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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