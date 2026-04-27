import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, History, Zap, Snowflake, ShieldAlert, CalendarCheck, Coins, Timer, Calculator } from 'lucide-react';

export interface Debt {
 id: string;
 name: string;
 balance: number;
 interestRate: number; 
 minPayment: number;
}

export default function DebtManager({ theme }: { theme: string }) {
 const isLight = theme === 'light';
 
 const [debts, setDebts] = useState<Debt[]>([]);
 const [extraPayment, setExtraPayment] = useState<number>(0);
 const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
 
 const [newDebt, setNewDebt] = useState({ 
 name: '', balanceDisplay: '', balanceRaw: 0, 
 interestDisplay: '', minPaymentDisplay: '', minPaymentRaw: 0 
 });

 useEffect(() => {
 const saved = localStorage.getItem('vitta_debts');
 if (saved) setDebts(JSON.parse(saved));
 }, []);

 const saveDebts = (updated: Debt[]) => {
 setDebts(updated);
 localStorage.setItem('vitta_debts', JSON.stringify(updated));
 };

 const handleAddDebt = () => {
 if (!newDebt.name || newDebt.balanceRaw <= 0 || newDebt.minPaymentRaw <= 0) return;
 const interestConverted = parseFloat(newDebt.interestDisplay.replace(',', '.')) || 0;
 const debt: Debt = {
 id: crypto.randomUUID(),
 name: newDebt.name,
 balance: newDebt.balanceRaw,
 interestRate: interestConverted,
 minPayment: newDebt.minPaymentRaw
 };
 saveDebts([...debts, debt]);
 setNewDebt({ name: '', balanceDisplay: '', balanceRaw: 0, interestDisplay: '', minPaymentDisplay: '', minPaymentRaw: 0 });
 };

 const handleDelete = (id: string) => {
 saveDebts(debts.filter(d => d.id !== id));
 };

 const simulation = useMemo(() => {
 if (debts.length === 0) return null;

 const simulate = (applyExtra: boolean) => {
 let currentDebts = debts.map(d => ({ ...d }));
 
 if (strategy === 'snowball') currentDebts.sort((a, b) => a.balance - b.balance); 
 else currentDebts.sort((a, b) => b.interestRate - a.interestRate); 

 let months = 0;
 let totalInterestPaid = 0;
 const maxMonths = 360; 

 while (currentDebts.some(d => d.balance > 0) && months < maxMonths) {
 months++;
 let availableCash = currentDebts.reduce((sum, d) => sum + d.minPayment, 0) + (applyExtra ? extraPayment : 0);
 
 currentDebts.forEach(d => {
 if (d.balance > 0) {
 const interest = d.balance * (d.interestRate / 100);
 d.balance += interest;
 totalInterestPaid += interest;
 }
 });

 for (let i = 0; i < currentDebts.length; i++) {
 if (currentDebts[i].balance <= 0) continue;
 const isTarget = currentDebts.findIndex(debt => debt.balance > 0) === i;
 let payment = currentDebts[i].minPayment;
 if (isTarget) payment = availableCash; 

 if (payment > currentDebts[i].balance) {
 availableCash -= currentDebts[i].balance; 
 currentDebts[i].balance = 0;
 } else {
 currentDebts[i].balance -= payment;
 availableCash -= payment;
 }
 }
 }
 return { months, totalInterestPaid, isInfinite: months >= maxMonths };
 };

 const base = simulate(false); 
 const accelerated = simulate(true); 

 return {
 base, accelerated,
 savedTime: base.months - accelerated.months,
 savedMoney: base.totalInterestPaid - accelerated.totalInterestPaid
 };
 }, [debts, extraPayment, strategy]);

 const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);

 return (
 <div className="h-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-0">
 <div className={`shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-[2rem] transition-all ${isLight ? 'bg-white  ' : 'bg-black/30 border-white/5 backdrop-blur-xl border'}`}>
 <div>
 <h2 className={`text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
 <History className="text-indigo-500" size={24} /> Máquina do Tempo
 </h2>
 <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Simulador Tático de Quitação</p>
 </div>
 </div>

 <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
 <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
 <div className={`shrink-0 p-4 rounded-[1.5rem] transition-all ${isLight ? 'bg-white  ' : 'bg-black/30 border-white/5 backdrop-blur-xl border'}`}>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2"><Plus size={14}/> Novo Passivo</h3>
 <div className="space-y-4">
 <div>
 <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Descrição</label>
 <input type="text" placeholder="EX: CARTÃO NUBANK" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value.toUpperCase()})} className={`w-full rounded-xl px-3 py-2.5 mt-1 text-xs font-bold outline-none transition-colors ${isLight ? 'bg-slate-50  text-slate-900 focus:border-indigo-500' : 'bg-black/20 border-white/10 text-white focus:border-indigo-500'}`} />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Saldo Total</label>
 <div className="relative mt-1">
 <span className="absolute left-3 top-2.5 text-xs font-black text-slate-500">R$</span>
 <input type="text" placeholder="0,00" value={newDebt.balanceDisplay} onChange={e => { const raw = Number(e.target.value.replace(/\D/g, "")) / 100; setNewDebt({ ...newDebt, balanceRaw: raw, balanceDisplay: raw > 0 ? raw.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '' }); }} className={`w-full rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold outline-none ${isLight ? 'bg-slate-50  text-slate-900' : 'bg-black/20 border-white/10 text-white'}`} />
 </div>
 </div>
 <div>
 <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Juros / Mês</label>
 <div className="relative mt-1">
 <input type="text" placeholder="0,00" value={newDebt.interestDisplay} onChange={e => setNewDebt({...newDebt, interestDisplay: e.target.value.replace(/[^0-9,]/g, '')})} className={`w-full rounded-xl pl-3 pr-6 py-2.5 text-xs font-bold outline-none text-right ${isLight ? 'bg-slate-50  text-slate-900' : 'bg-black/20 border-white/10 text-white'}`} />
 <span className="absolute right-3 top-2.5 text-xs font-black text-slate-500">%</span>
 </div>
 </div>
 </div>
 <div>
 <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Parcela Mínima</label>
 <div className="relative mt-1">
 <span className="absolute left-3 top-2.5 text-xs font-black text-slate-500">R$</span>
 <input type="text" placeholder="0,00" value={newDebt.minPaymentDisplay} onChange={e => { const raw = Number(e.target.value.replace(/\D/g, "")) / 100; setNewDebt({ ...newDebt, minPaymentRaw: raw, minPaymentDisplay: raw > 0 ? raw.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '' }); }} className={`w-full rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold outline-none ${isLight ? 'bg-slate-50  text-slate-900' : 'bg-black/20 border-white/10 text-white'}`} />
 </div>
 </div>
 <button onClick={handleAddDebt} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all -indigo-500/20 active:scale-95">Gravar Passivo</button>
 </div>
 </div>
 <div className={`shrink-0 p-4 rounded-[1.5rem] transition-all flex-1 ${isLight ? 'bg-white  ' : 'bg-black/30 border-white/5 backdrop-blur-xl border'}`}>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2"><Calculator size={14}/> Tática de Guerra</h3>
 <div className="flex flex-col gap-2 mb-6">
 <button onClick={() => setStrategy('avalanche')} className={`p-3 rounded-xl flex items-center gap-3 transition-all ${strategy === 'avalanche' ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-transparent   text-slate-400'}`}><Zap size={16} /><span className="text-[10px] font-black uppercase tracking-widest text-left w-full">Avalanche <span className="block text-[8px] opacity-70 mt-0.5 normal-case tracking-normal">Foca no maior juro primeiro.</span></span></button>
 <button onClick={() => setStrategy('snowball')} className={`p-3 rounded-xl flex items-center gap-3 transition-all ${strategy === 'snowball' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-transparent   text-slate-400'}`}><Snowflake size={16} /><span className="text-[10px] font-black uppercase tracking-widest text-left w-full">Bola de Neve <span className="block text-[8px] opacity-70 mt-0.5 normal-case tracking-normal">Foca na menor dívida primeiro.</span></span></button>
 </div>
 <div>
 <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 ml-1">Aporte Mensal Extra</label>
 <div className="flex items-center gap-3 mt-2">
 <input type="range" min="0" max="2000" step="50" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} className="flex-1 accent-indigo-500 h-1.5 rounded-full bg-slate-200 dark:bg-[#09090b]/30 appearance-none cursor-pointer" />
 <span className={`text-xs font-black px-3 py-1.5 rounded-lg w-20 text-center ${isLight ? 'bg-slate-50  text-slate-900' : 'bg-black/30 border-white/10 text-white'}`}>{extraPayment}</span>
 </div>
 </div>
 </div>
 {simulation?.base.isInfinite && (
 <div className="shrink-0 p-4 bg-rose-500/10 border-rose-500/50 rounded-3xl animate-in slide-in-from-top-2 text-center">
 <ShieldAlert size={24} className="mx-auto mb-1 text-rose-500 animate-pulse" />
 <h3 className="text-xs font-black uppercase text-rose-500">Risco Matemático</h3>
 <p className="text-[9px] font-bold text-rose-600 dark:text-rose-200 mt-1">A parcela atual não cobre os juros. Aumente o valor ou a dívida será eterna.</p>
 </div>
 )}
 </div>

 <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 min-h-0 h-full">
 {simulation && !simulation.base.isInfinite && debts.length > 0 && (
 <div className="shrink-0 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-4 -2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-4">
 <Timer className="absolute right-[-20px] top-[-20px] size-48 text-white/10 rotate-12" />
 <div className="text-center bg-black/20 p-5 rounded-3xl border-white/10 shrink-0 min-w-[150px] relative z-10 text-white">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block mb-1">Quitação em</span>
 <div className="flex items-baseline justify-center gap-1">
 <h1 className="text-5xl font-black leading-none tracking-tighter">{simulation.accelerated.months}</h1>
 <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Meses</span>
 </div>
 </div>
 <div className="flex-1 relative z-10 w-full">
 <p className="text-xs font-bold text-indigo-100 flex items-center gap-2 mb-3"><CalendarCheck size={16} className="text-emerald-400"/> Livre em: <strong className="text-white uppercase tracking-widest">{new Date(new Date().setMonth(new Date().getMonth() + simulation.accelerated.months)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong></p>
 {extraPayment > 0 && simulation.savedTime > 0 ? (
 <div className="flex items-center gap-6 bg-emerald-500/20 border-emerald-500/30 p-3 rounded-2xl animate-in zoom-in-95">
 <div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1"><Coins size={10}/> Juros Salvos</p><p className="text-lg font-black text-white mt-0.5">R$ {simulation.savedMoney.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
 <div className="w-px h-8 bg-emerald-500/30"></div>
 <div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Tempo Salvo</p><p className="text-lg font-black text-white mt-0.5">{simulation.savedTime} meses</p></div>
 </div>
 ) : (<div className="text-[10px] font-bold text-indigo-200 mt-2"><p>Pagando o mínimo, você gastará <strong className="text-rose-300">R$ {simulation.accelerated.totalInterestPaid.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</strong> em juros.</p></div>)}
 </div>
 </div>
 )}
 <div className={`flex-1 flex flex-col min-h-0 rounded-[2rem] p-4 transition-all ${isLight ? 'bg-white/60 /50 ' : 'bg-black/30 border-white/5 backdrop-blur-xl border'}`}>
 <div className="flex justify-between items-center mb-6 shrink-0">
 <h3 className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Seu Passivo Atual</h3>
 {debts.length > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border-rose-500/20">Total: R$ {totalBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>}
 </div>
 {debts.length === 0 ? (
 <div className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[2rem] opacity-40 ${isLight ? 'border-slate-300' : 'border-white/10'}`}><ShieldAlert size={32} className={`mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} /><p className={`uppercase font-black text-[9px] tracking-[0.3em] ${isLight ? 'text-slate-900' : 'text-white'}`}>Zero dívidas cadastradas</p></div>
 ) : (
 <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
 {debts.map(d => (
 <div key={d.id} className={`shrink-0 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between group transition-all ${isLight ? 'bg-white  hover: ' : 'bg-black/20 border-white/10 hover:bg-white/10'}`}>
 <div className="flex-1 pr-4 mb-2 md:mb-0"><h4 className={`font-black text-xs uppercase tracking-tighter mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.name}</h4><div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-slate-500"><span>Saldo: <strong className={isLight ? 'text-slate-900' : 'text-slate-300'}>R$ {d.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span><span>Juros: <strong className="text-rose-500">{d.interestRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}%</strong></span><span>Parcela: <strong className="text-indigo-500">R$ {d.minPayment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span></div></div>
 <button onClick={() => handleDelete(d.id)} className="text-rose-500 opacity-100 md:opacity-0 group-hover:opacity-100 p-2.5 hover:bg-rose-500/10 rounded-xl transition-all self-end md:self-auto"><Trash2 size={16}/></button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}


