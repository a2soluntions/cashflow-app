import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, X, CheckCircle2, AlertTriangle, TrendingUp, Wallet, Zap, Trophy, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';

import { appApi } from '../services/api';
import { Goal } from '../types';

interface Props {
  goals: Goal[];
  onUpdate: () => void;
  currentUserId?: string;
}

const HorizonsManager: React.FC<Props> = ({ goals, onUpdate, currentUserId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [contributeTo, setContributeTo] = useState<Goal | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [numericValue, setNumericValue] = useState(0);
  const [newCategory, setNewCategory] = useState<'travel' | 'car' | 'home' | 'retirement' | 'other'>('other');

  const [contributionDisplay, setContributionDisplay] = useState('');
  const [contributionNumeric, setContributionNumeric] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Aqui você conectará com o saldo real vindo do seu context ou Firebase/Supabase futuramente
  const monthlyDisposableIncome = 2500; 

  // Removido useEffect e saveGoals, porque os gols vêm via prop e o api.ts salva

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setDisplay: any, setNumeric: any) => {
    let value = e.target.value.replace(/\D/g, "");
    const num = Number(value) / 100;
    setNumeric(num);
    setDisplay(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num));
  };

  const addGoal = async () => {
    if (!newTitle || numericValue <= 0 || !currentUserId) return;
    const goal: Goal = {
      id: Date.now().toString(),
      user_id: currentUserId,
      title: newTitle.toUpperCase(),
      target_amount: numericValue,
      current_amount: 0,
      category: newCategory
    };
    try {
      await appApi.addGoal(goal);
      onUpdate();
    } catch (err) {
      console.error("Erro ao salvar objetivo", err);
    }
    setIsAdding(false);
    setNewTitle(''); setDisplayValue(''); setNumericValue(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleContribute = async () => {
    if (contributionNumeric <= 0 || !contributeTo || !currentUserId) return;
    
    const wasCompleted = contributeTo.current_amount >= contributeTo.target_amount;
    const newTotal = contributeTo.current_amount + contributionNumeric;
    const isNowCompleted = newTotal >= contributeTo.target_amount;

    try {
       await appApi.updateGoal({ ...contributeTo, current_amount: newTotal });
       onUpdate();
    } catch (err) {
       console.error("Erro ao contribuir", err);
    }

    setContributeTo(null);
    setContributionNumeric(0);
    setContributionDisplay('');

    if (isNowCompleted && !wasCompleted) {
      fireConfetti();
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
       await appApi.deleteGoal(id);
       onUpdate();
    } catch (err) {
       console.error("Erro ao apagar", err);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="h-full w-full flex flex-col gap-8 animate-in fade-in duration-700 no-scrollbar overflow-y-auto pb-24 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div>
          <h2 className="text-[10px] font-black text-[#00d06c] uppercase tracking-[0.5em] mb-2 flex items-center gap-2">
            <Brain size={14} className="text-[#00d06c]" /> Vitta Intelligence
          </h2>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Vitta Horizons</h1>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00d06c] text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d06c]/20"
        >
          <Plus size={16} strokeWidth={3} /> Novo Sonho
        </button>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
        {goals.map(goal => {
          const percent = goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0;
          const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
          const isCompleted = percent === 100;
          
          const monthlyEffort = remaining / 12;
          const impactLevel = (monthlyEffort / monthlyDisposableIncome) * 100;

          return (
            <div key={goal.id} className={`group p-8 rounded-[3.5rem] border transition-all duration-500 flex flex-col ${isCompleted ? 'border-amber-500/40 bg-amber-500/[0.03] shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'border-white/5 bg-white/[0.01]'}`}>
              
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl border ${isCompleted ? 'text-amber-500 border-amber-500/20' : 'text-[#00d06c] border-[#00d06c]/20'}`}>
                   {isCompleted ? <Trophy size={24} className="animate-pulse" /> : <Target size={24} />}
                </div>
                {!isCompleted && impactLevel > 40 && (
                   <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-500/20 text-rose-500 bg-rose-500/5 animate-pulse">
                      ⚠️ Alerta de Impulso
                   </span>
                )}
              </div>

              <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-6 ${isCompleted ? 'text-amber-500' : 'text-white'}`}>{goal.title}</h3>
              
              <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Conquista</span>
                        <span className={`text-2xl font-black italic ${isCompleted ? 'text-amber-500' : 'text-[#00d06c]'}`}>{percent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-[#00d06c]'}`} 
                          style={{ width: `${percent}%` }} 
                        />
                    </div>
                </div>

                {!isCompleted ? (
                    <div className={`p-5 rounded-3xl border ${impactLevel > 40 ? 'bg-rose-500/5 border-rose-500/10' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${impactLevel > 40 ? 'text-rose-500' : 'text-indigo-400'}`}>Vitta Analysis</p>
                        <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                            {impactLevel > 40 
                                ? `Este desejo compromete ${impactLevel.toFixed(0)}% da sua sobra mensal. Cuidado com o impulso.` 
                                : `Viável! Aporte R$ ${monthlyEffort.toFixed(0)}/mês para realizar em 1 ano.`
                            }
                        </p>
                    </div>
                ) : (
                  <div className="p-5 rounded-3xl border bg-amber-500/10 border-amber-500/20 text-center">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Horizonte Alcançado!</p>
                  </div>
                )}

                <div className="flex gap-2">
                    {!isCompleted && (
                        <button onClick={() => setContributeTo(goal)} className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#00d06c] hover:text-black transition-all group-hover:bg-[#00d06c]/20">
                            Aportar
                        </button>
                    )}
                    <button onClick={() => setConfirmDelete(goal.id)} className="p-4 bg-white/5 text-zinc-600 hover:text-rose-500 rounded-2xl transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE APORTE */}
      {contributeTo && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[3rem] w-full max-w-sm animate-in zoom-in duration-300 shadow-2xl">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Avançar<br/>Missão</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-8 italic">Para: {contributeTo.title}</p>
                <div className="space-y-6">
                    <input 
                        type="text"
                        placeholder="R$ 0,00" 
                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-[#00d06c] text-3xl font-black outline-none"
                        value={contributionDisplay}
                        onChange={(e) => handleCurrencyChange(e, setContributionDisplay, setContributionNumeric)}
                        autoFocus
                    />
                    <div className="flex flex-col gap-3">
                        <button onClick={handleContribute} className="w-full py-5 bg-[#00d06c] text-black font-black uppercase text-xs tracking-widest rounded-2xl active:scale-95 transition-all">Confirmar Aporte</button>
                        <button onClick={() => setContributeTo(null)} className="w-full py-3 text-zinc-600 font-black uppercase text-[10px] tracking-widest hover:text-white">Voltar</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DE ADIÇÃO */}
      {isAdding && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[3rem] w-full max-w-md animate-in zoom-in duration-300">
            <div className="flex justify-between mb-8 items-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Novo<br/>Horizonte</h2>
              <button onClick={() => setIsAdding(false)}><X className="text-zinc-500" /></button>
            </div>
            <div className="space-y-6">
              <input 
                placeholder="NOME DO SONHO" 
                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#00d06c]/40 uppercase font-black"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value.toUpperCase())}
              />
              <input 
                type="text"
                placeholder="R$ 0,00" 
                className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-[#00d06c] text-xl font-black outline-none"
                value={displayValue}
                onChange={(e) => handleCurrencyChange(e, setDisplayValue, setNumericValue)}
              />
              <select 
                className="w-full bg-[#111] border-none p-4 rounded-2xl text-white outline-none appearance-none cursor-pointer font-bold uppercase text-[11px]"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
              >
                <option value="other">OUTRO</option>
                <option value="car">VEÍCULO</option>
                <option value="travel">VIAGEM</option>
                <option value="home">IMÓVEL</option>
                <option value="retirement">APOSENTADORIA</option>
              </select>
              <button onClick={addGoal} className="w-full py-5 mt-4 bg-[#00d06c] text-black font-black uppercase text-xs tracking-widest rounded-2xl">Confirmar Missão</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500">
          <div className="bg-[#00d06c] text-black px-12 py-10 rounded-[4rem] flex flex-col items-center gap-4 shadow-[0_0_150px_rgba(0,208,108,0.4)]">
            <CheckCircle2 size={60} strokeWidth={3} className="animate-bounce" />
            <h3 className="font-black uppercase italic text-2xl tracking-tighter">Registrado!</h3>
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
          <div className="bg-[#0a0a0a] border border-rose-500/20 p-10 rounded-[3rem] w-full max-w-sm text-center animate-in zoom-in">
            <AlertTriangle size={40} className="text-rose-500 mx-auto mb-6" />
            <h2 className="text-white font-black uppercase italic text-xl mb-2">Abortar Missão?</h2>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest">Não</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizonsManager;