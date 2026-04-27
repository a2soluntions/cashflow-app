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
 id: crypto.randomUUID(),
 user_id: currentUserId,
 title: newTitle.toUpperCase(),
 target_amount: numericValue,
 current_amount: 0
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
 <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 gap-6">
 <div>
 <h2 className="text-[10px] font-black text-emerald-500 dark:text-[#00d06c] uppercase tracking-[0.5em] mb-2 flex items-center gap-2">
 <Brain size={14} className="text-emerald-500 dark:text-[#00d06c]" /> Vitta Intelligence
 </h2>
 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Vitta Horizons</h1>
 </div>

 <button 
 onClick={() => setIsAdding(true)}
 className="flex items-center gap-3 px-8 py-4 bg-[#00d06c] text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all -[#00d06c]/20"
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
  <div key={goal.id} className={`group p-6 transition-all duration-500 flex flex-col border border-white/20 ${isCompleted ? 'bg-amber-500/10 dark:bg-amber-500/[0.05] backdrop-blur-2xl' : 'bg-white dark:bg-white/10 backdrop-blur-2xl'}`}>
 
 <div className="flex justify-between items-start mb-5">
 <div className={`p-3 ${isCompleted ? 'text-amber-500 border-amber-500/20' : 'text-emerald-500 dark:text-[#00d06c] border-emerald-100 dark:border-[#00d06c]/20 bg-emerald-50 dark:bg-transparent'}`}>
 {isCompleted ? <Trophy size={20} className="animate-pulse" /> : <Target size={20} />}
 </div>
 {!isCompleted && impactLevel > 40 && (
 <span className="px-3 py-1 text-xs px-1 font-black uppercase tracking-widest border-rose-500/20 text-rose-500 bg-rose-500/5 animate-pulse">
 ⚠️ Alerta de Impulso
 </span>
 )}
 </div>

 <h3 className={`text-4xl font-black uppercase italic tracking-tighter mb-4 ${isCompleted ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{goal.title}</h3>
 
 <div className="space-y-4">
 <div>
 <div className="flex justify-between items-end mb-2">
 <span className="text-xs font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest italic">Conquista</span>
 <span className={`text-4xl font-black italic ${isCompleted ? 'text-amber-500' : 'text-emerald-500 dark:text-[#00d06c]'}`}>{percent}%</span>
 </div>
 <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 overflow-hidden ">
 <div 
 className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600' : 'bg-emerald-500 dark:bg-[#00d06c]'}`} 
 style={{ width: `${percent}%` }} 
 />
 </div>
 </div>

 {!isCompleted ? (
 <div className={`p-4 ${impactLevel > 40 ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10' : 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10'}`}>
 <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${impactLevel > 40 ? 'text-rose-500' : 'text-indigo-500 dark:text-indigo-400'}`}>Vitta Analysis</p>
 <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed italic">
 {impactLevel > 40 
 ? `Este desejo compromete ${impactLevel.toFixed(0)}% da sua sobra mensal. Cuidado com o impulso.` 
 : `Viável! Aporte R$ ${monthlyEffort.toFixed(0)}/mês para realizar em 1 ano.`
 }
 </p>
 </div>
 ) : (
 <div className="p-4 bg-amber-500/10 border-amber-500/20 text-center">
 <p className="text-sm font-black text-amber-500 uppercase tracking-widest">Horizonte Alcançado!</p>
 </div>
 )}

 <div className="flex gap-2">
 {!isCompleted && (
 <button onClick={() => setContributeTo(goal)} className="flex-1 py-3 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white dark:hover:bg-[#00d06c] dark:hover:text-black transition-all group-hover:bg-emerald-100 dark:group-hover:bg-[#00d06c]/20">
 Aportar
 </button>
 )}
 <button onClick={() => setConfirmDelete(goal.id)} className="px-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-zinc-600 hover:text-rose-500 transition-all">
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
 <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
  <div className="bg-white dark:bg-white/10 backdrop-blur-2xl border border-white/20 p-10 w-full max-w-sm animate-in zoom-in duration-300">
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2 leading-none">Avançar<br/>Missão</h2>
 <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-8 italic">Para: {contributeTo.title}</p>
 <div className="space-y-6">
 <input 
 type="text"
 placeholder="R$ 0,00" 
 className="w-full bg-slate-50 dark:bg-white/[0.03] p-5 text-emerald-500 dark:text-[#00d06c] text-3xl font-black outline-none"
 value={contributionDisplay}
 onChange={(e) => handleCurrencyChange(e, setContributionDisplay, setContributionNumeric)}
 autoFocus
 />
 <div className="flex flex-col gap-3">
 <button onClick={handleContribute} className="w-full py-5 bg-emerald-500 dark:bg-[#00d06c] text-white dark:text-black font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Confirmar Aporte</button>
 <button onClick={() => setContributeTo(null)} className="w-full py-3 text-slate-500 dark:text-zinc-600 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 dark:hover:text-white">Voltar</button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* MODAL DE ADIÇÃO */}
 {isAdding && (
 <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
  <div className="bg-white dark:bg-white/10 backdrop-blur-2xl border border-white/20 p-10 w-full max-w-md animate-in zoom-in duration-300 ">
 <div className="flex justify-between mb-8 items-center">
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Novo<br/>Horizonte</h2>
 <button onClick={() => setIsAdding(false)}><X className="text-slate-500 dark:text-zinc-500" /></button>
 </div>
 <div className="space-y-6">
 <input 
 placeholder="NOME DO SONHO" 
 className="w-full bg-slate-50 dark:bg-white/[0.03] p-4 text-slate-900 dark:text-white outline-none   uppercase font-black"
 value={newTitle}
 onChange={e => setNewTitle(e.target.value.toUpperCase())}
 />
 <input 
 type="text"
 placeholder="R$ 0,00" 
 className="w-full bg-slate-50 dark:bg-white/[0.03] p-4 text-emerald-500 dark:text-[#00d06c] text-xl font-black outline-none"
 value={displayValue}
 onChange={(e) => handleCurrencyChange(e, setDisplayValue, setNumericValue)}
 />
 <select 
 className="w-full bg-slate-50 dark:bg-[#111] p-4 text-slate-900 dark:text-white outline-none appearance-none cursor-pointer font-bold uppercase text-[11px]"
 value={newCategory}
 onChange={e => setNewCategory(e.target.value as any)}
 >
 <option value="other">OUTRO</option>
 <option value="car">VEÍCULO</option>
 <option value="travel">VIAGEM</option>
 <option value="home">IMÓVEL</option>
 <option value="retirement">APOSENTADORIA</option>
 </select>
 <button onClick={addGoal} className="w-full py-5 mt-4 bg-emerald-500 dark:bg-[#00d06c] text-white dark:text-black font-black uppercase text-xs tracking-widest ">Confirmar Missão</button>
 </div>
 </div>
 </div>
 )}

 {/* MODAL DE SUCESSO */}
 {showSuccess && (
 <div className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500">
 <div className="bg-emerald-500 dark:bg-[#00d06c] text-white dark:text-black px-12 py-10 flex flex-col items-center gap-4 -2xl">
 <CheckCircle2 size={60} strokeWidth={3} className="animate-bounce" />
 <h3 className="font-black uppercase italic text-2xl tracking-tighter">Registrado!</h3>
 </div>
 </div>
 )}

 {/* CONFIRMAÇÃO DE EXCLUSÃO */}
 {confirmDelete && (
 <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
 <div className="bg-white dark:bg-white/10 backdrop-blur-2xl border border-white/20  dark:border-rose-500/20 p-10 w-full max-w-sm text-center animate-in zoom-in ">
 <AlertTriangle size={40} className="text-rose-500 mx-auto mb-6" />
 <h2 className="text-slate-900 dark:text-white font-black uppercase italic text-xl mb-2">Abortar Missão?</h2>
 <div className="flex gap-4 mt-8">
 <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-zinc-400 font-black uppercase text-[10px] tracking-widest">Não</button>
 <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 bg-rose-500 dark:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest">Sim</button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default HorizonsManager;



