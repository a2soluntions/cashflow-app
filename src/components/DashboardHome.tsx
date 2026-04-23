import React, { useState, useEffect } from 'react';
import { 
 TrendingUp, TrendingDown, Wallet, Activity, 
 AlertTriangle, BrainCircuit, Target, CheckCircle2,
 Skull, Percent, ArrowUpRight, Zap
} from 'lucide-react';

interface Transaction {
 id: string;
 type: 'income' | 'expense';
 amount: number;
 description: string;
 category: string;
 date: string;
 status?: 'COMPLETED' | 'PENDING' | 'pending'; 
 interest?: number;
}

interface BudgetGoal {
 id: string;
 category: string;
 limitAmount: number;
}

interface DashboardProps {
 transactions: Transaction[]; 
}

// --- COMPONENTE DE VELOCÍMETRO ---
const Gauge = ({ value, label, subtitle, type = 'normal' }: { value: number, label: string, subtitle: string, type?: 'normal' | 'inverse' }) => {
 const radius = 40;
 const circ = Math.PI * radius; 
 const boundedValue = Math.min(Math.max(value, 0), 100); 
 const dashoffset = circ - (boundedValue / 100) * circ;

 let color = '#10b981'; // verde
 let glow = 'rgba(16, 185, 129, 0.4)';
 
 // SE O SISTEMA ESTIVER ZERADO, FICA NEUTRO (CINZA) PARA NÃO ASSUSTAR
 if (value === 0) {
 color = '#64748b'; 
 glow = 'rgba(100, 116, 139, 0.4)';
 } else if (type === 'normal') {
 if (boundedValue < 40) { color = '#f43f5e'; glow = 'rgba(244, 63, 94, 0.4)'; } 
 else if (boundedValue < 70) { color = '#f59e0b'; glow = 'rgba(245, 158, 11, 0.4)'; } 
 } else {
 if (boundedValue > 85) { color = '#f43f5e'; glow = 'rgba(244, 63, 94, 0.4)'; }
 else if (boundedValue > 60) { color = '#f59e0b'; glow = 'rgba(245, 158, 11, 0.4)'; }
 }

 return (
  <div className="flex flex-col items-center justify-center p-3 h-full bg-white/5 border border-white/5 w-full relative overflow-hidden group transition-all ">
 <div className="absolute bottom-0 w-24 h-12 blur-2xl opacity-50 transition-colors duration-1000" style={{ backgroundColor: glow }} />
 
 <div className="relative w-28 h-16 mt-2">
 <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" 
 strokeDasharray={circ} strokeDashoffset={dashoffset} 
 className="transition-all duration-1000 ease-out" 
 style={{ filter: `drop- (0 0 6px ${glow})` }} />
 </svg>
 <div className="absolute bottom-0 left-0 w-full text-center flex flex-col translate-y-2">
 <span className="text-2xl font-black tracking-tighter" style={{ color }}>{boundedValue.toFixed(0)}%</span>
 </div>
 </div>
 <div className="text-center mt-3 z-10">
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white truncate px-1">{label}</p>
 <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 truncate">{subtitle}</p>
 </div>
 </div>
 );
};

export default function DashboardHome({ transactions }: DashboardProps) {
 const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
 const [financialData, setFinancialData] = useState({
 balance: 0,
 cashFlow: 0,
 income: 0,
 expense: 0,
 savingsRate: 0,
 expenseRatio: 0, 
 debtRatio: 0, 
 totalInterest: 0,
 healthScore: 0,
 healthStatus: 'neutral',
 diagnostico: '',
 proximosPassos: [] as string[],
 chartData: [] as any[], 
 villains: [] as { category: string, amount: number, percent: number }[],
 categoryImpact: [] as { category: string, percent: number }[],
 budgetStatus: [] as any[], 
 totalPendingAmount: 0
 });

 useEffect(() => {
 const processData = () => {
 try {
 const rawTxs = localStorage.getItem('vittacash_pro_transactions');
 const allTxs: Transaction[] = rawTxs ? JSON.parse(rawTxs) : (transactions || []);
 
 const rawBudgets = localStorage.getItem('vittacash_pro_budgets');
 const budgetGoals: BudgetGoal[] = rawBudgets ? JSON.parse(rawBudgets) : [];
 
 const now = new Date();
 const curYear = now.getFullYear();
 const curMonth = now.getMonth() + 1;
 const curMonthKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
 
 const periodTxs = allTxs.filter(t => {
 if (viewMode === 'monthly') return t.date && t.date.startsWith(curMonthKey);
 return t.date && t.date.startsWith(String(curYear));
 });

 const realizedAll = allTxs.filter(t => t.status === 'COMPLETED' || !t.status);
 const pendingTxs = allTxs.filter(t => (t.status === 'PENDING' || t.status === 'pending') && t.type === 'expense');

 const pInc = periodTxs.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
 const pExp = periodTxs.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
 const pendingTotal = pendingTxs.reduce((a, b) => a + Number(b.amount), 0);

 // --- GRÁFICO ---
 const chartData = [];
 if (viewMode === 'monthly') {
 const daysInMonth = new Date(curYear, curMonth, 0).getDate();
 for (let i = 1; i <= daysInMonth; i++) {
 const dayStr = String(i).padStart(2, '0');
 const datePrefix = `${curMonthKey}-${dayStr}`;
 const dayTxs = periodTxs.filter(t => t.date && t.date.startsWith(datePrefix));
 chartData.push({
 label: dayStr,
 in: dayTxs.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0),
 out: dayTxs.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0),
 });
 }
 } else {
 for (let i = 1; i <= 12; i++) {
 const monthStr = String(i).padStart(2, '0');
 const monthPrefix = `${curYear}-${monthStr}`;
 const monthTxs = periodTxs.filter(t => t.date && t.date.startsWith(monthPrefix));
 const mDate = new Date(curYear, i - 1, 1);
 chartData.push({
 label: mDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
 in: monthTxs.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0),
 out: monthTxs.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0),
 });
 }
 }

 // Metas e Vilões
 const budgetComparison = budgetGoals.map(bg => {
 const spent = periodTxs.filter(t => t.type === 'expense' && t.category === bg.category).reduce((a, b) => a + Number(b.amount), 0);
 const percent = bg.limitAmount > 0 ? (spent / bg.limitAmount) * 100 : 0;
 return { category: bg.category, limit: bg.limitAmount, spent: spent, percent: percent, isOver: percent > 100, isWarning: percent >= 80 && percent <= 100 };
 }).sort((a, b) => b.percent - a.percent); 

 const expTxs = periodTxs.filter(t => t.type === 'expense');
 const catMap: Record<string, number> = {};
 expTxs.forEach(t => { catMap[t.category || 'GERAL'] = (catMap[t.category || 'GERAL'] || 0) + Number(t.amount); });
 const impact = Object.entries(catMap).map(([category, amount]) => ({
 category, amount, percent: pExp > 0 ? (amount / pExp) * 100 : 0
 })).sort((a,b) => b.amount - a.amount);

 // --- CÁLCULOS MATEMÁTICOS BLINDADOS ---
 const hasData = pInc > 0 || pExp > 0;
 
 const currentScore = hasData ? (pInc >= pExp ? 85 : 35) : 0;
 const currentExpenseRatio = pInc > 0 ? (pExp / pInc) * 100 : (pExp > 0 ? 100 : 0);
 const currentDebtRatio = pInc > 0 ? (pendingTotal / pInc) * 100 : (pendingTotal > 0 ? 100 : 0);
 
 const healthStatus = hasData ? (pInc >= pExp ? 'good' : 'danger') : 'neutral';
 const diagnosticoTexto = hasData 
 ? (pExp > pInc ? "ALERTA: Seus gastos superaram sua renda." : "ESTABILIDADE: Orçamento sob controle.")
 : "SISTEMA ZERADO: Aguardando lançamentos.";
 
 const passosTexto = hasData 
 ? (pExp > pInc ? ["Cortar compras não essenciais", "Revisar assinaturas ativas"] : ["Manter tetos de gastos", "Aumentar valor investido"])
 : ["Adicionar primeira receita", "Registrar despesas"];

 setFinancialData({
 balance: realizedAll.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0) - realizedAll.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0),
 cashFlow: pInc - pExp,
 income: pInc,
 expense: pExp,
 savingsRate: pInc > 0 ? Math.max(((pInc - pExp) / pInc) * 100, 0) : 0,
 expenseRatio: currentExpenseRatio,
 debtRatio: currentDebtRatio,
 totalInterest: realizedAll.reduce((a, b) => a + (Number(b.interest) || 0), 0),
 healthScore: currentScore,
 healthStatus: healthStatus,
 diagnostico: diagnosticoTexto,
 proximosPassos: passosTexto,
 chartData: chartData,
 villains: impact.slice(0, 5),
 categoryImpact: impact.slice(0, 4),
 budgetStatus: budgetComparison,
 totalPendingAmount: pendingTotal
 });
 } catch (e) { console.error(e); }
 };

 processData();
 window.addEventListener('storage', processData);
 return () => window.removeEventListener('storage', processData);
 }, [transactions, viewMode]);

 const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
 
 // SVGs Gráfico
 const maxVal = Math.max(...financialData.chartData.map(d => Math.max(d.in, d.out))) || 1;
 const getLinePath = (data: any[], type: 'in' | 'out') => {
 if(data.length === 0) return "";
 const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - ((d[type] / maxVal) * 40)}`);
 return `M ${points.join(' L ')}`;
 };
 const getAreaPath = (data: any[], type: 'in' | 'out') => {
 if(data.length === 0) return "";
 const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - ((d[type] / maxVal) * 40)}`);
 return `M 0,40 L ${points.join(' L ')} L 100,40 Z`;
 };

 const peakOutIndex = financialData.chartData.reduce((maxIdx, d, i, arr) => d.out > arr[maxIdx].out ? i : maxIdx, 0);
 const peakOutData = financialData.chartData[peakOutIndex];
 const peakOutX = financialData.chartData.length > 1 ? (peakOutIndex / (financialData.chartData.length - 1)) * 100 : 0;
 const peakOutY = peakOutData ? 40 - ((peakOutData.out / maxVal) * 40) : 40;

  return (
  <div className="w-full h-auto flex flex-col gap-6 font-sans transition-colors duration-500 bg-transparent px-4">
 
 <style>{`
 .no-scrollbar::-webkit-scrollbar {
 display: none;
 }
 .no-scrollbar {
 -ms-overflow-style: none;
 scrollbar-width: none;
 }
 `}</style>

 {/* 1. TOP HEADER */}
 <div className="flex justify-between items-center shrink-0 mb-2">
 <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 italic text-slate-900 dark:text-white">
 <Activity className="text-emerald-500" /> Cockpit
 </h1>
 <div className="flex bg-slate-100 dark:bg-[#09090b] p-1 ">
 <button onClick={() => setViewMode('monthly')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-emerald-500'}`}>Mensal</button>
 <button onClick={() => setViewMode('yearly')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'yearly' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-emerald-500'}`}>Anual</button>
 </div>
 </div>

 {/* 2. CARDS SUPERIORES */}
 <div className="grid grid-cols-2 md:grid-cols-6 gap-6 shrink-0 mb-4">
 {[
 { label: 'Saldo Total', val: financialData.balance, icon: Wallet, textColor: 'text-slate-900 dark:text-white', iconColor: 'text-slate-500' },
 { label: 'Fluxo Caixa', val: financialData.cashFlow, icon: ArrowUpRight, textColor: 'text-emerald-500', iconColor: 'text-emerald-500' },
 { label: 'Entradas', val: financialData.income, icon: TrendingUp, textColor: 'text-blue-500', iconColor: 'text-blue-500' },
 { label: 'Saídas', val: financialData.expense, icon: TrendingDown, textColor: 'text-rose-500', iconColor: 'text-rose-500' },
 { label: 'Retenção', val: `${financialData.savingsRate.toFixed(1)}%`, icon: Percent, textColor: 'text-amber-500', iconColor: 'text-amber-500' },
 { label: 'Juros Pagos', val: financialData.totalInterest, icon: AlertTriangle, textColor: 'text-orange-500', iconColor: 'text-orange-500' }
 ].map((card, i) => (
 <div key={i} className="bg-transparent pb-4 transition-all ">
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
 <card.icon size={12} className={card.iconColor}/> {card.label}
 </p>
 <h3 className={`text-2xl font-black ${card.textColor}`}>
 {typeof card.val === 'number' ? formatCurrency(card.val) : card.val}
 </h3>
 </div>
 ))}
 </div>

 {/* 3. CONTEÚDO PRINCIPAL (BLINDADO COM MIN-H-0 PARA EVITAR VAZAMENTOS) */}
 <div className="flex flex-col md:grid md:grid-cols-12 gap-4 flex-1 md:min-h-0">
 
 {/* COLUNA ESQUERDA */}
 <div className="col-span-12 md:col-span-3 flex flex-col gap-4 md:min-h-0">
 <div className="shrink-0 h-[150px] p-5 bg-white dark:bg-[#09090b]/20 flex flex-col justify-between transition-all ">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><BrainCircuit size={16} className="text-emerald-500"/> Saúde</span>
 <span className={`text-xl font-black ${financialData.healthStatus === 'neutral' ? 'text-slate-500' : (financialData.healthStatus === 'good' ? 'text-emerald-500' : 'text-rose-500')}`}>{financialData.healthScore}%</span>
 </div>
 <p className="text-[10px] font-black leading-tight text-slate-800 dark:text-white">{financialData.diagnostico}</p>
 <div className="flex gap-2">
 {financialData.proximosPassos.map((step, i) => (
 <div key={i} className="flex-1 p-2 bg-slate-50 dark:bg-white/5 flex items-center justify-center text-center gap-2 ">
 <span className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-400">{step}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="flex-1 p-5 bg-white dark:bg-[#09090b]/20 overflow-hidden flex flex-col min-h-[200px] md:min-h-0 transition-all ">
 <div className="flex items-center gap-2 mb-4 text-rose-500 shrink-0">
 <Skull size={18} /><span className="text-[10px] font-black uppercase">Maiores Gastos</span>
 </div>
 <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
 {financialData.villains.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <p className="text-[8px] uppercase font-black text-center text-slate-400">Sem dados</p>
 </div>
 ) : financialData.villains.map((v, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[10px] font-black uppercase">
 <span className="text-slate-500 truncate w-24">{v.category}</span>
 <span className="text-rose-600">{formatCurrency(v.amount)}</span>
 </div>
 <div className="w-full h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
 <div style={{width: `${v.percent}%`}} className="h-full bg-rose-500" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* COLUNA CENTRAL (A GRANDE CULPADA RESOLVIDA) */}
 <div className="col-span-12 md:col-span-6 p-5 bg-white dark:bg-[#09090b]/20 flex flex-col relative overflow-hidden min-h-[300px] md:min-h-0 transition-all ">
 <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest relative z-10 shrink-0 text-slate-400">
 <span className="flex items-center gap-2">
 <Activity size={16} className="text-emerald-500" /> 
 {viewMode === 'monthly' ? 'Fluxo Diário' : 'Fluxo Mensal'}
 </span>
 <div className="flex gap-4 text-[8px]">
 <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-emerald-500"/> Entradas</div>
 <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-rose-500"/> Saídas</div>
 </div>
 </div>

 {/* GRÁFICO SVG COM GAIOLA (ABSOLUTE INSET-0) */}
 <div className="flex-1 min-h-0 relative w-full group mb-4">
 <div className="absolute inset-0">
 <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
 <defs>
 <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
 <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
 </linearGradient>
 <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2"/>
 <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
 </linearGradient>
 </defs>
 <path d={getAreaPath(financialData.chartData, 'in')} fill="url(#gradIn)" className="transition-all duration-700" />
 <path d={getAreaPath(financialData.chartData, 'out')} fill="url(#gradOut)" className="transition-all duration-700" />
 <path d={getLinePath(financialData.chartData, 'in')} fill="none" stroke="#10b981" strokeWidth="0.3" className="transition-all duration-700" />
 <path d={getLinePath(financialData.chartData, 'out')} fill="none" stroke="#f43f5e" strokeWidth="0.4" className="transition-all duration-700 drop- -[0_0_5px_rgba(244,63,94,0.5)]" />

 {peakOutData && peakOutData.out > 0 && (
 <g className="transition-all duration-700 origin-center" style={{ transform: `translate(${peakOutX}px, ${peakOutY}px) scale(0.1)` }}>
 <circle cx="0" cy="0" r="1.5" fill="#f43f5e" className="animate-ping" opacity="0.5"/>
 <circle cx="0" cy="0" r="0.8" fill="#f43f5e" />
 </g>
 )}
 </svg>
 
 {peakOutData && peakOutData.out > 0 && (
 <div 
 className="absolute flex flex-col items-center pointer-events-none transition-all duration-700 -translate-x-1/2 -translate-y-[120%]"
 style={{ left: `${peakOutX}%`, top: `${(peakOutY / 40) * 100}%` }}
 >
 <div className="bg-rose-500 text-white px-2 py-0.5 text-[6px] font-black uppercase whitespace-nowrap">
 {viewMode === 'monthly' ? `Dia ${peakOutData.label}` : peakOutData.label} • {formatCurrency(peakOutData.out)}
 </div>
 <div className="w-[1px] h-4 bg-rose-500/50 mt-1" />
 </div>
 )}

 <div className="absolute bottom-0 left-0 w-full flex justify-between px-1 translate-y-full pt-2 text-[6px] font-black text-slate-400 uppercase tracking-widest">
 <span>{financialData.chartData[0]?.label}</span>
 <span>{financialData.chartData[financialData.chartData.length - 1]?.label}</span>
 </div>
 </div>
 </div>
 
 {/* STATUS PENDENTE */}
 <div className="shrink-0 grid grid-cols-2 gap-3 relative z-10 mt-auto">
 <div className="p-4 bg-blue-500/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex flex-col justify-between h-20">
 <p className="text-[8px] font-black uppercase opacity-80">Pendente no Período</p>
 <h4 className="text-sm font-black">{formatCurrency(financialData.totalPendingAmount)}</h4>
 </div>
 <div className="p-4 bg-slate-50 dark:bg-white/5 flex flex-col justify-between h-20">
 <p className="text-[8px] font-black uppercase text-slate-400">Status Quitação</p>
 <h4 className={`text-sm font-black ${financialData.totalPendingAmount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
 {financialData.totalPendingAmount > 0 ? 'Existem Pendências' : 'Tudo em dia'}
 </h4>
 </div>
 </div>
 </div>

 {/* COLUNA DIREITA */}
 <div className="col-span-12 md:col-span-3 flex flex-col gap-4 md:min-h-0">
 <div className="shrink-0 h-[150px] p-5 bg-white dark:bg-[#09090b]/20 flex flex-col transition-all ">
 <div className="flex items-center gap-2 mb-4 text-amber-500 shrink-0">
 <Percent size={18} /><span className="text-[10px] font-black uppercase tracking-widest">% Distribuição</span>
 </div>
 <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 flex-1">
 {financialData.categoryImpact.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <p className="text-[8px] uppercase font-black text-center text-slate-400">Sem dados</p>
 </div>
 ) : financialData.categoryImpact.map((item, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[9px] font-black uppercase">
 <span className="text-slate-500 truncate w-20">{item.category}</span>
 <span className="text-amber-500">{item.percent.toFixed(1)}%</span>
 </div>
 <div className="w-full h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
 <div style={{width: `${item.percent}%`}} className="h-full bg-amber-500" />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="flex-1 p-5 bg-white dark:bg-[#09090b]/20 flex flex-col min-h-[200px] md:min-h-0 transition-all ">
 <div className="flex items-center gap-2 mb-4 text-slate-400 shrink-0">
 <Target size={18} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Monitor de Metas</span>
 </div>
 <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
 {financialData.budgetStatus.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <CheckCircle2 size={24} className="mb-2 text-slate-400" />
 <p className="text-[8px] uppercase font-black text-center text-slate-400">Nenhum Teto</p>
 </div>
 ) : financialData.budgetStatus.map((budget, i) => (
 <div key={i} className={`p-3 rounded-2xl transition-all ${budget.isOver ? 'bg-rose-50 dark:bg-rose-500/10 ' : budget.isWarning ? 'bg-amber-50 dark:bg-amber-500/10 ' : 'bg-slate-50 dark:bg-white/5'}`}>
 <div className="flex justify-between items-center mb-1.5">
 <div className="flex items-center gap-1.5">
 {(budget.isOver || budget.isWarning) && (
 <Zap size={10} className={budget.isOver ? 'text-rose-500' : 'text-amber-500'} />
 )}
 <span className="text-[9px] font-black uppercase text-slate-600 dark:text-white truncate max-w-[80px]">{budget.category}</span>
 </div>
 <span className={`text-[10px] font-black ${budget.isOver ? 'text-rose-600' : budget.isWarning ? 'text-amber-600' : 'text-emerald-500'}`}>{budget.percent.toFixed(0)}%</span>
 </div>
 <div className="w-full h-1.5 bg-slate-200 dark:bg-[#09090b]/40 rounded-full overflow-hidden mb-2">
 <div style={{width: `${Math.min(budget.percent, 100)}%`}} className={`h-full transition-all duration-1000 ${budget.isOver ? 'bg-rose-500' : budget.isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
 </div>
 <div className="flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest">
 <span>G: {formatCurrency(budget.spent)}</span>
 <span>T: {formatCurrency(budget.limit)}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* 4. ÁREA: 4 VELOCÍMETROS */}
 <div className="shrink-0 h-auto md:h-[120px] grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
 <Gauge 
 value={financialData.healthScore} 
 label="Saúde Financeira" 
 subtitle="Score do Mês" 
 type="normal" 
 />
 <Gauge 
 value={financialData.expenseRatio} 
 label="Uso da Renda" 
 subtitle="Despesas vs Receitas" 
 type="inverse" 
 />
 <Gauge 
 value={financialData.debtRatio} 
 label="Endividamento" 
 subtitle="Pendentes vs Renda" 
 type="inverse" 
 />
 <Gauge 
 value={financialData.savingsRate} 
 label="Poder de Retenção" 
 subtitle="Economia Gerada" 
 type="normal" 
 />
 </div>

 </div>
 );
}



