import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

interface Transaction {
 id: string;
 category: string;
 amount: number;
 type: 'income' | 'expense';
 date: string;
}

interface Budget {
 id: string;
 category: string;
 limitAmount: number;
}

export default function BudgetAlerts() {
 const alerts = useMemo(() => {
 const transactions: Transaction[] = JSON.parse(localStorage.getItem('vittacash_pro_transactions') || '[]');
 const budgets: Budget[] = JSON.parse(localStorage.getItem('vittacash_pro_budgets') || '[]');
 
 const currentMonth = new Date().getMonth();
 const currentYear = new Date().getFullYear();

 return budgets.map(budget => {
 // Soma gastos da categoria no mês atual
 const spent = transactions
 .filter(t => 
 t.category === budget.category && 
 t.type === 'expense' &&
 new Date(t.date).getMonth() === currentMonth &&
 new Date(t.date).getFullYear() === currentYear
 )
 .reduce((acc, t) => acc + t.amount, 0);

 const percent = (spent / budget.limitAmount) * 100;
 
 return {
 ...budget,
 spent,
 percent,
 isOver: spent > budget.limitAmount,
 isWarning: percent >= 80 && spent <= budget.limitAmount
 };
 }).filter(b => b.isOver || b.isWarning); // Só mostra o que for crítico
 }, []);

 if (alerts.length === 0) {
 return (
 <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center justify-center text-center">
 <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 -emerald-500/20">
 <CheckCircle2 size={24} />
 </div>
 <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Orçamento Seguro</h4>
 <p className="text-[9px] font-bold text-emerald-600/60 dark:text-emerald-400/40 mt-1 uppercase">Todas as metas estão dentro do planejado.</p>
 </div>
 );
 }

 return (
 <div className="flex flex-col gap-3">
 {/* HEADER DO WIDGET */}
 <div className="flex items-center gap-2 px-2">
 <Zap size={14} className="text-amber-500 fill-amber-500" />
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
 Monitor de Teto de Gastos
 </h3>
 </div>

 <div className="grid gap-3">
 {alerts.map((alert) => (
 <div 
 key={alert.id}
 className={`p-4 rounded-[1.8rem] border-2 transition-all ${
 alert.isOver 
 ? 'bg-white dark:bg-rose-500/5 border-rose-500/20 -rose-500/5' 
 : 'bg-white dark:bg-amber-500/5 border-amber-500/20 -amber-500/5'
 }`}
 >
 <div className="flex justify-between items-start mb-3">
 <div>
 <div className="flex items-center gap-2">
 <span className={`w-2 h-2 rounded-full animate-pulse ${alert.isOver ? 'bg-rose-500' : 'bg-amber-500'}`} />
 <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
 {alert.category}
 </h4>
 </div>
 <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">
 {alert.isOver ? 'Limite Ultrapassado' : 'Aproximando-se do Limite'}
 </p>
 </div>
 
 <div className="text-right">
 <span className={`text-xs font-black ${alert.isOver ? 'text-rose-600' : 'text-amber-600'}`}>
 {alert.percent.toFixed(0)}%
 </span>
 </div>
 </div>

 {/* BARRA DE PROGRESSO */}
 <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-3">
 <div 
 className={`h-full transition-all duration-1000 ${alert.isOver ? 'bg-rose-500' : 'bg-amber-500'}`}
 style={{ width: `${Math.min(alert.percent, 100)}%` }}
 />
 </div>

 <div className="flex justify-between items-center bg-slate-50 dark:bg-[#09090b]/20 p-2.5 rounded-xl">
 <div className="flex flex-col">
 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Gasto Atual</span>
 <span className="text-[10px] font-black text-slate-700 dark:text-white">R$ {alert.spent.toLocaleString('pt-BR')}</span>
 </div>
 <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10" />
 <div className="flex flex-col items-end">
 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Teto Máximo</span>
 <span className="text-[10px] font-black text-slate-500 uppercase">R$ {alert.limitAmount.toLocaleString('pt-BR')}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}


