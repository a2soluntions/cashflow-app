import React, { useMemo } from 'react';
import { Goal } from '../types';
import { Plus, Target, Trophy, Trash2, TrendingUp, Calendar, AlertTriangle, Wallet } from 'lucide-react';

interface GoalsManagerProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id' | 'current_amount'>) => void;
  onDeposit: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ goals, onAdd, onDeposit, onDelete }) => {
  // target agora armazena string de centavos (ex: "1000" = R$ 10,00)
  const [newGoal, setNewGoal] = React.useState({ name: '', target: '', deadline: '' });
  const [depositValues, setDepositValues] = React.useState<Record<string, string>>({});

  // Formata visualmente enquanto digita (ex: "1000" -> "R$ 10,00")
  const formatCurrencyInput = (value: string) => {
    if (!value) return 'R$ 0,00';
    const numberValue = parseFloat(value) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    
    onAdd({
      name: newGoal.name,
      // Converte centavos para real ao salvar
      target_amount: parseFloat(newGoal.target) / 100,
      deadline: newGoal.deadline
    });
    setNewGoal({ name: '', target: '', deadline: '' });
  };

  const handleDeposit = (id: string) => {
    const valStr = depositValues[id];
    if (!valStr) return;

    // Converte centavos para real ao depositar
    const val = parseFloat(valStr) / 100;
    
    if (val > 0) {
      onDeposit(id, val);
      setDepositValues({ ...depositValues, [id]: '' });
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const stats = useMemo(() => {
    const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
    const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const delayedCount = goals.filter(g => {
      if (!g.deadline) return false;
      const deadlineDate = new Date(g.deadline);
      const isComplete = g.current_amount >= g.target_amount;
      return deadlineDate < today && !isComplete;
    }).length;

    return { totalSaved, totalTarget, delayedCount };
  }, [goals]);

  const MiniStatCard = ({ title, value, icon: Icon, color, isCurrency = true }: any) => (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lg transition-all hover:shadow-xl ${color}`}>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">{title}</p>
          <h3 className="text-2xl font-black tracking-tight">
            {isCurrency ? formatCurrency(value) : value}
          </h3>
        </div>
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 gap-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <MiniStatCard title="Total Guardado" value={stats.totalSaved} icon={Wallet} color="bg-indigo-600 shadow-indigo-500/30" />
         <MiniStatCard title="Meta Global" value={stats.totalTarget} icon={Target} color="bg-emerald-600 shadow-emerald-500/30" />
         {stats.delayedCount > 0 ? (
            <MiniStatCard title="Atenção: Atrasadas" value={stats.delayedCount} icon={AlertTriangle} color="bg-rose-600 shadow-rose-500/30" isCurrency={false} />
         ) : (
            <MiniStatCard title="Situação" value="Em Dia!" icon={Trophy} color="bg-blue-500 shadow-blue-500/30" isCurrency={false} />
         )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* FORMULÁRIO */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm h-fit border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-2xl"><Plus className="w-6 h-6" /></div>
            <h3 className="font-black text-lg uppercase text-slate-700 dark:text-white tracking-wide">Nova Meta</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Objetivo</label>
                <input type="text" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="Ex: Viagem Disney" required />
            </div>
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Valor Alvo</label>
                {/* INPUT FORMATADO DE MOEDA */}
                <input 
                    type="text" 
                    value={formatCurrencyInput(newGoal.target)} 
                    onChange={e => setNewGoal({...newGoal, target: e.target.value.replace(/\D/g, '')})} 
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all" 
                    placeholder="R$ 0,00" 
                    required 
                />
            </div>
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data Alvo</label>
                <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all" />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl mt-2 transition-all active:scale-95">Criar Meta</button>
          </form>
        </div>

        {/* LISTA DE METAS */}
        <div className="lg:col-span-2 overflow-y-auto custom-scrollbar pr-2 space-y-4">
           {goals.length === 0 ? (
             <div className="text-center p-10 text-slate-400 font-bold opacity-50 flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full"><Target className="w-8 h-8 text-slate-300" /></div>
                <p>Nenhuma meta criada ainda.</p>
             </div>
           ) : (
             goals.map(goal => {
               const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
               const isExpired = goal.deadline && new Date(goal.deadline) < new Date() && progress < 100;

               return (
                 <div key={goal.id} className={`bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-6 border shadow-sm relative group transition-all ${isExpired ? 'border-rose-500/50 shadow-rose-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500/30'}`}>
                    <button onClick={() => onDelete(goal.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-lg ${isExpired ? 'bg-rose-500 shadow-rose-500/30' : 'bg-indigo-600 shadow-indigo-500/30'}`}>
                              {isExpired ? <AlertTriangle className="w-7 h-7" /> : <Trophy className="w-7 h-7" />}
                          </div>
                          <div>
                             <h3 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tight">{goal.name}</h3>
                             <div className="flex items-center gap-3 mt-1">
                                {goal.deadline && (
                                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        <Calendar className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                                {isExpired && <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Atrasado</span>}
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Progresso</p>
                          <p className={`text-2xl font-black ${isExpired ? 'text-rose-500' : 'text-indigo-600'}`}>{progress.toFixed(1)}%</p>
                       </div>
                    </div>

                    <div className="h-5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-6 p-1">
                       <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isExpired ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${progress}%` }}>
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/30 p-2 pl-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Acumulado / Meta</span>
                          <span className="font-black text-sm text-slate-700 dark:text-slate-200">
                            {formatCurrency(goal.current_amount)} 
                            <span className="text-slate-300 mx-1">/</span> 
                            <span className="text-slate-400">{formatCurrency(goal.target_amount)}</span>
                          </span>
                       </div>
                       <div className="flex items-center gap-2">
                          {/* INPUT DE DEPÓSITO FORMATADO */}
                          <input 
                            type="text" 
                            placeholder="R$ +" 
                            className="w-28 bg-white dark:bg-slate-900 py-3 px-4 rounded-xl text-sm font-bold outline-none text-right border-2 border-transparent focus:border-emerald-500 transition-all text-emerald-600"
                            value={formatCurrencyInput(depositValues[goal.id] || '')}
                            onChange={(e) => setDepositValues({...depositValues, [goal.id]: e.target.value.replace(/\D/g, '')})}
                          />
                          <button onClick={() => handleDeposit(goal.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"><TrendingUp className="w-5 h-5" /></button>
                       </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;