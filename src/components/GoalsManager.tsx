import React, { useState } from 'react'; // Removido useEffect
import { Target, Plus, Trophy, X, Calendar, Wallet, CheckCircle2, PartyPopper, TrendingUp } from 'lucide-react'; // Removido AlertTriangle
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
  
  // Estado para controlar animação de celebração simples
  const [celebrating, setCelebrating] = useState<string | null>(null);

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
      
      // Verifica se completou para celebrar
      const goal = goals.find(g => g.id === depositModal);
      if (goal && (goal.current_amount + amount) >= goal.target_amount) {
          setCelebrating(goal.id);
          setTimeout(() => setCelebrating(null), 5000); // 5s de festa
      }

      setDepositModal(null);
      setDepositValue('');
    }
  };

  const totalGuardado = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const metaGlobal = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const percentualGlobal = metaGlobal > 0 ? (totalGuardado / metaGlobal) * 100 : 0;

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-24 lg:pb-0 custom-scrollbar p-1">
      
      {/* CARDS DE RESUMO (TOPO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Acumulado</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(totalGuardado)}</h3>
         </div>

         <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl"><Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Global</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(metaGlobal)}</h3>
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-16 h-16" /></div>
            <div className="relative z-10">
               <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">Progresso Total</span>
               <div className="mt-3 flex items-end gap-2">
                   <h3 className="text-3xl font-black tracking-tighter">{percentualGlobal.toFixed(0)}%</h3>
                   <span className="text-xs font-bold mb-1 opacity-80">Concluído</span>
               </div>
               <div className="w-full h-1.5 bg-black/20 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-white transition-all duration-1000" style={{ width: `${percentualGlobal}%` }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Formulário Fixo */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm h-fit sticky top-0">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-widest">Nova Meta</h3>
                        <p className="text-xs text-slate-500">Defina seu próximo sonho.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome do Objetivo</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Viagem Disney, Carro Novo..." 
                          className="w-full bg-slate-50 dark:bg-slate-950/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                          value={newGoal.name} 
                          onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} 
                          required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valor Alvo</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 dark:bg-slate-950/50 rounded-2xl px-5 py-4 text-lg font-black text-indigo-600 dark:text-indigo-400 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-all" 
                          value={formatInputCurrency(newGoal.target_amount)} 
                          onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value.replace(/\D/g, '')})} 
                          required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Data Limite</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 dark:bg-slate-950/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-all" 
                          value={newGoal.deadline} 
                          onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} 
                          required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all mt-2">
                        Criar Meta
                    </button>
                </form>
            </div>
        </div>

        {/* Lista de Metas */}
        <div className="lg:col-span-2 space-y-4">
            {goals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50 min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-full mb-4"><Target className="w-12 h-12 text-slate-400" /></div>
                    <p className="text-sm font-bold text-slate-500">Nenhuma meta criada ainda.</p>
                    <p className="text-xs text-slate-400 mt-1">Use o formulário ao lado para começar a poupar.</p>
                </div>
            ) : (
                goals.map((goal) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  const isCompleted = progress >= 100;
                  const isCelebrating = celebrating === goal.id;
                  
                  // CORREÇÃO: Fallback seguro
                  const goalName = (goal as any).name || (goal as any).description || 'Meta';
                  const dateString = goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : '--/--/----';
                  
                  return (
                    <div key={goal.id} className={`p-6 rounded-[2.5rem] shadow-sm border relative group transition-all duration-500 overflow-hidden ${isCompleted ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-500/30' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30'}`}>
                        {/* EFEITO DE CELEBRAÇÃO */}
                        {isCelebrating && (
                            <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                <div className="text-6xl animate-bounce">🎉</div>
                            </div>
                        )}

                        <button onClick={() => onDelete(goal.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"><X className="w-4 h-4" /></button>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isCompleted ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10'}`}>
                                    {isCompleted ? <Trophy className="w-7 h-7 animate-pulse" /> : <Target className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h4 className={`font-black text-lg ${isCompleted ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-white'}`}>{goalName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                                       <Calendar className="w-3 h-3" /> {dateString}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto">
                                {isCompleted ? (
                                    <span className="inline-flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                                        <CheckCircle2 className="w-3 h-3" /> Conquista!
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
                                        Faltam {formatCurrency(goal.target_amount - goal.current_amount)}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* BARRA DE PROGRESSO APRIMORADA */}
                        <div className="relative h-6 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-slate-800/50 p-1">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${isCompleted ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`} 
                                style={{ width: `${progress}%` }}
                            >
                                {progress > 15 && <span className="text-[9px] font-black text-white/90 drop-shadow-md">{progress.toFixed(0)}%</span>}
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Atual</span>
                                <span className="text-sm font-black text-slate-700 dark:text-white flex items-baseline gap-1">
                                    {formatCurrency(goal.current_amount)} 
                                    <span className="text-slate-400 text-xs font-bold">/ {formatCurrency(goal.target_amount)}</span>
                                </span>
                            </div>
                            
                            {!isCompleted ? (
                                <button onClick={() => setDepositModal(goal.id)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Depositar
                                </button>
                            ) : (
                                <button disabled className="px-5 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default flex items-center gap-2 opacity-70">
                                    <PartyPopper className="w-3 h-3" /> Finalizada
                                </button>
                            )}
                        </div>
                    </div>
                  );
                })
            )}
        </div>
      </div>

      {depositModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 w-full sm:max-w-xs rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400"><Wallet className="w-8 h-8" /></div>
                    <h3 className="font-black text-lg uppercase tracking-widest text-slate-900 dark:text-white">Fazer Depósito</h3>
                    <p className="text-xs text-slate-500 mt-1">Quanto você vai guardar hoje?</p>
                </div>
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <input autoFocus type="text" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-6 text-center text-2xl font-black outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-inner" value={formatInputCurrency(depositValue)} onChange={(e) => setDepositValue(e.target.value.replace(/\D/g, ''))} />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={() => { setDepositModal(null); setDepositValue(''); }} className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors">Cancelar</button>
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