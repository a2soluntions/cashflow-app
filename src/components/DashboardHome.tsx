import React, { useState, useEffect } from 'react';
import { 
 TrendingUp, TrendingDown, Wallet, Activity, 
 AlertTriangle, BrainCircuit, Target, CheckCircle2,
 Skull, Percent, ArrowUpRight, Zap, Clock, Lightbulb
} from 'lucide-react';
import { CustomAlert } from './CustomAlert';

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

interface Category {
 id: string;
 name: string;
 type: string;
 limit_amount?: number;
}

interface DashboardProps {
 transactions: Transaction[]; 
 categories?: Category[];
}

const Gauge = ({ value, label, subtitle, type = 'normal' }: { value: number, label: string, subtitle: string, type?: 'normal' | 'inverse' }) => {
 const radius = 40;
 const circ = Math.PI * radius; 
 const boundedValue = Math.min(Math.max(value, 0), 100); 
 const dashoffset = circ - (boundedValue / 100) * circ;

 let color = '#10b981';
 let glow = 'rgba(16, 185, 129, 0.4)';
  
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
  <div className="flex flex-col items-center justify-center p-2 h-full bg-white/5 border border-white/5 w-full relative overflow-hidden group transition-all ">
 <div className="absolute bottom-0 w-24 h-12 blur-2xl opacity-50" style={{ backgroundColor: glow }} />
 <div className="relative w-24 h-14 mt-1">
 <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-slate-100 dark:text-white/5" />
 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" 
 strokeDasharray={circ} strokeDashoffset={dashoffset} 
 className="transition-all duration-1000 ease-out" 
 style={{ filter: `drop-shadow(0 0 5px ${glow})` }} />
 </svg>
 <div className="absolute bottom-0 left-0 w-full text-center flex flex-col translate-y-1">
 <span className="text-xl font-black tracking-tighter" style={{ color }}>{boundedValue.toFixed(0)}%</span>
 </div>
 </div>
  <div className="text-center mt-2 z-10">
  <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white truncate">{label}</p>
  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 truncate">{subtitle}</p>
  </div>
 </div>
 );
};

export default function DashboardHome({ transactions, categories = [] }: DashboardProps) {
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
 totalPendingAmount: 0,
 upcomingBills: [] as Transaction[]
 });

 const [overdueAlert, setOverdueAlert] = useState<{ isOpen: boolean; count: number }>({ isOpen: false, count: 0 });

 useEffect(() => {
 const processData = () => {
 try {
 const rawTxs = localStorage.getItem('vittacash_pro_transactions');
 const allTxs: Transaction[] = rawTxs ? JSON.parse(rawTxs) : (transactions || []);
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

 const budgetComparison = categories.filter(c => c.type === 'expense' && c.limit_amount && c.limit_amount > 0).map(c => {
 const spent = periodTxs.filter(t => t.type === 'expense' && t.category === c.name).reduce((a, b) => a + Number(b.amount), 0);
 const limit = c.limit_amount || 0;
 const percent = limit > 0 ? (spent / limit) * 100 : 0;
 return { category: c.name, limit: limit, spent: spent, percent: percent, isOver: percent > 100, isWarning: percent >= 80 && percent <= 100 };
 }).sort((a, b) => b.percent - a.percent); 

 const expTxs = periodTxs.filter(t => t.type === 'expense');
 const catMap: Record<string, number> = {};
 expTxs.forEach(t => { catMap[t.category || 'GERAL'] = (catMap[t.category || 'GERAL'] || 0) + Number(t.amount); });
 const impact = Object.entries(catMap).map(([category, amount]) => ({
 category, amount, percent: pExp > 0 ? (amount / pExp) * 100 : 0
 })).sort((a,b) => b.amount - a.amount);

 const hasData = pInc > 0 || pExp > 0;
 const currentScore = hasData ? (pInc >= pExp ? 85 : 35) : 0;
 const healthStatus = hasData ? (pInc >= pExp ? 'good' : 'danger') : 'neutral';
 
 setFinancialData({
 balance: realizedAll.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0) - realizedAll.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0),
 cashFlow: pInc - pExp,
 income: pInc,
 expense: pExp,
 savingsRate: pInc > 0 ? Math.max(((pInc - pExp) / pInc) * 100, 0) : 0,
 expenseRatio: pInc > 0 ? (pExp / pInc) * 100 : (pExp > 0 ? 100 : 0),
 debtRatio: pInc > 0 ? (pendingTotal / pInc) * 100 : (pendingTotal > 0 ? 100 : 0),
 totalInterest: realizedAll.reduce((a, b) => a + (Number(b.interest) || 0), 0),
 healthScore: currentScore,
 healthStatus: healthStatus,
 diagnostico: hasData ? (pExp > pInc ? "ALERTA: Gastos > Renda" : "ESTABILIDADE: Ok") : "ZERADO",
 proximosPassos: hasData ? (pExp > pInc ? ["Cortar não essencial", "Revisar assinaturas"] : ["Manter teto", "Investir"]) : ["Adicionar receita", "Registrar"],
 chartData: chartData,
 villains: impact.slice(0, 5),
 categoryImpact: impact.slice(0, 4),
 budgetStatus: budgetComparison,
 totalPendingAmount: pendingTotal,
 upcomingBills: allTxs.filter(t => (t.status === 'PENDING' || t.status === 'pending') && t.type === 'expense').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3)
 });

 // Checa contas atrasadas para o alerta inicial
 const today = new Date(); today.setHours(0,0,0,0);
 const overdueCount = allTxs.filter(t => (t.status === 'PENDING' || t.status === 'pending') && t.type === 'expense' && new Date(t.date) < today).length;
 if (overdueCount > 0) {
   setOverdueAlert({ isOpen: true, count: overdueCount });
 }
 } catch (e) { console.error(e); }
 };
 processData();
 window.addEventListener('storage', processData);
 return () => window.removeEventListener('storage', processData);
 }, [transactions, viewMode, categories]);

 const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
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
  <div className="w-full h-auto flex flex-col gap-2 font-sans bg-transparent px-3 py-1">
 <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
 
 <CustomAlert 
   isOpen={overdueAlert.isOpen}
   onClose={() => setOverdueAlert(prev => ({ ...prev, isOpen: false }))}
   title="Atenção: Contas Atrasadas"
   message={`Você possui ${overdueAlert.count} conta(s) que já venceram. Recomendamos regularizar para evitar juros.`}
   type="warning"
   confirmText="Revisar Agora"
 />

 {/* HEADER COMPACTO */}
 <div className="flex justify-between items-center shrink-0 mb-1">
 <h1 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 italic text-slate-900 dark:text-white">
 <Activity size={16} className="text-emerald-500" /> Cockpit
 </h1>
 <div className="flex bg-slate-100 dark:bg-[#09090b] p-0.5">
 <button onClick={() => setViewMode('monthly')} className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Mensal</button>
 <button onClick={() => setViewMode('yearly')} className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'yearly' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Anual</button>
 </div>
 </div>

  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 mb-1 bg-white/5 p-2 rounded-xl">
  <div className="flex flex-col shrink-0 border-r border-white/10 pr-3 mr-1">
  <div className="flex items-center gap-1.5 text-slate-400">
  <Target size={14} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Metas</span>
  </div>
  <p className="text-[9px] font-bold text-slate-500 uppercase">Teto</p>
  </div>
  <div className="flex gap-2 min-w-0">
  {financialData.budgetStatus.length === 0 ? (
  <div className="flex items-center gap-2 opacity-40">
  <CheckCircle2 size={12} className="text-slate-400" />
  <p className="text-[9px] uppercase font-black text-slate-400">Nenhum Teto</p>
  </div>
  ) : financialData.budgetStatus.map((budget, i) => (
  <div key={i} className={`p-1.5 rounded-lg w-36 shrink-0 transition-all ${budget.isOver ? 'bg-rose-500/10' : 'bg-white/5'}`}>
  <div className="flex justify-between items-center mb-0.5">
  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-white truncate max-w-[60px]">{budget.category}</span>
  <span className={`text-[11px] font-black ${budget.isOver ? 'text-rose-500' : 'text-emerald-500'}`}>{budget.percent.toFixed(0)}%</span>
  </div>
  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-1">
  <div style={{width: `${Math.min(budget.percent, 100)}%`}} className={`h-full ${budget.isOver ? 'bg-rose-500' : 'bg-emerald-500'}`} />
  </div>
  </div>
  ))}
  </div>
 </div>

 {/* VELOCÍMETROS COMPACTOS */}
 <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2 mb-1">
 <Gauge value={financialData.healthScore} label="Saúde" subtitle="Score" />
 <Gauge value={financialData.expenseRatio} label="Uso Renda" subtitle="Gastos" type="inverse" />
 <Gauge value={financialData.debtRatio} label="Dívida" subtitle="Pendentes" type="inverse" />
 <Gauge value={financialData.savingsRate} label="Retenção" subtitle="Economia" />
 </div>

  {/* STATS COMPACTOS */}
  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 shrink-0 mb-1">
  {[
  { label: 'Saldo', val: financialData.balance, icon: Wallet, color: 'text-white' },
  { label: 'Fluxo', val: financialData.cashFlow, icon: ArrowUpRight, color: 'text-emerald-500' },
  { label: 'Entradas', val: financialData.income, icon: TrendingUp, color: 'text-blue-500' },
  { label: 'Saídas', val: financialData.expense, icon: TrendingDown, color: 'text-rose-500' },
  { label: 'Retenção', val: `${financialData.savingsRate.toFixed(1)}%`, icon: Percent, color: 'text-amber-500' },
  { label: 'Juros', val: financialData.totalInterest, icon: AlertTriangle, color: 'text-orange-500' }
  ].map((card, i) => (
  <div key={i} className="bg-transparent transition-all">
  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5 flex items-center gap-1">
  <card.icon size={11}/> {card.label}
  </p>
  <h3 className={`text-lg font-black ${card.color}`}>
  {typeof card.val === 'number' ? formatCurrency(card.val) : card.val}
  </h3>
  </div>
  ))}
  </div>

 {/* CONTEÚDO PRINCIPAL FLEXÍVEL */}
 <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:flex-1 md:min-h-0 md:overflow-hidden">
 {/* ESQUERDA */}
 <div className="md:col-span-3 flex flex-col gap-2">
 <div className="p-3 bg-white/5 flex flex-col justify-between shrink-0 min-h-[100px]">
 <div className="flex items-center justify-between">
  <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5"><BrainCircuit size={14} className="text-emerald-500"/> Saúde</span>
 <span className={`text-base font-black ${financialData.healthStatus === 'good' ? 'text-emerald-500' : 'text-rose-500'}`}>{financialData.healthScore}%</span>
 </div>
 <p className="text-[9px] font-black leading-tight">{financialData.diagnostico}</p>
 <div className="space-y-1">
 {financialData.proximosPassos.map((step, i) => (
 <div key={i} className="p-1 bg-white/5 text-center"><span className="text-[7px] font-bold uppercase text-slate-400">{step}</span></div>
 ))}
 </div>
 </div>
 <div className="p-3 bg-white/5 flex flex-col min-h-[120px]">
  <div className="flex items-center gap-2 mb-2 text-rose-500 shrink-0"><Skull size={16} /><span className="text-[11px] font-black uppercase">Vilões</span></div>
 <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
 {financialData.villains.map((v, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[8px] font-black uppercase"><span className="truncate w-16">{v.category}</span><span>{formatCurrency(v.amount)}</span></div>
 <div className="w-full h-0.5 bg-white/5"><div style={{width: `${v.percent}%`}} className="h-full bg-rose-500" /></div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* CENTRAL */}
 <div className="md:col-span-6 p-3 bg-white/5 flex flex-col relative overflow-hidden min-h-[220px]">
 <div className="flex justify-between items-center mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">
 <span className="flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> {viewMode === 'monthly' ? 'Fluxo Diário' : 'Fluxo Mensal'}</span>
 <div className="flex gap-3 text-[7px]"><div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-emerald-500"/> In</div><div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-rose-500"/> Out</div></div>
 </div>
 <div className="flex-1 relative w-full mb-2 min-h-0">
 <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
 <path d={getAreaPath(financialData.chartData, 'in')} fill="rgba(16, 185, 129, 0.1)" />
 <path d={getAreaPath(financialData.chartData, 'out')} fill="rgba(244, 63, 94, 0.1)" />
 <path d={getLinePath(financialData.chartData, 'in')} fill="none" stroke="#10b981" strokeWidth="0.5" />
 <path d={getLinePath(financialData.chartData, 'out')} fill="none" stroke="#f43f5e" strokeWidth="0.6" />
 </svg>
 </div>
 <div className="grid grid-cols-2 gap-2 shrink-0">
 <div className="p-2 bg-blue-500/10 h-14 flex flex-col justify-between">
 <p className="text-[7px] font-black uppercase opacity-60">Pendente</p>
 <h4 className="text-xs font-black">{formatCurrency(financialData.totalPendingAmount)}</h4>
 </div>
 <div className="p-2 bg-white/5 h-14 flex flex-col justify-between">
 <p className="text-[7px] font-black uppercase opacity-60">Status</p>
 <h4 className={`text-xs font-black ${financialData.totalPendingAmount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{financialData.totalPendingAmount > 0 ? 'Pendências' : 'Em dia'}</h4>
 </div>
 </div>
 </div>

 {/* DIREITA */}
 <div className="md:col-span-3 flex flex-col gap-2">
 <div className="p-3 bg-white/5 flex flex-col shrink-0 min-h-[100px]">
  <div className="flex items-center gap-1.5 mb-2 text-amber-500 shrink-0"><Percent size={16} /><span className="text-[11px] font-black uppercase">Distribuição</span></div>
 <div className="space-y-2 overflow-y-auto no-scrollbar flex-1">
 {financialData.categoryImpact.map((item, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[8px] font-black uppercase"><span className="truncate w-16">{item.category}</span><span>{item.percent.toFixed(1)}%</span></div>
 <div className="w-full h-0.5 bg-white/5"><div style={{width: `${item.percent}%`}} className="h-full bg-amber-500" /></div>
 </div>
 ))}
 </div>
 </div>
 <div className="p-3 bg-white/5 flex flex-col min-h-[120px]">
  <div className="flex items-center gap-1.5 mb-2 text-blue-400 shrink-0"><Clock size={16} /><span className="text-[11px] font-black uppercase">Vencimentos</span></div>
 <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
 {financialData.upcomingBills.map((bill, i) => (
 <div key={i} className="p-1.5 bg-white/5 border border-white/5 flex justify-between items-center">
 <div className="min-w-0"><p className="text-[8px] font-black uppercase truncate">{bill.description}</p><p className="text-[6px] font-bold text-slate-500 uppercase">{new Date(bill.date).toLocaleDateString('pt-BR')}</p></div>
 <span className="text-[8px] font-black text-rose-500 ml-1">{formatCurrency(bill.amount)}</span>
 </div>
 ))}
 </div>
 </div>
  <div className="h-[95px] p-3 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col relative overflow-hidden shrink-0">
  <div className="absolute top-0 right-0 p-2 opacity-10"><Lightbulb size={24} className="text-emerald-500" /></div>
  <div className="flex items-center gap-1.5 mb-1 text-emerald-500 shrink-0"><BrainCircuit size={14} /><span className="text-[11px] font-black uppercase">AI Insight</span></div>
  <p className="text-[12px] font-bold italic leading-tight z-10 text-slate-700 dark:text-zinc-200">{financialData.expense > financialData.income ? "Reduza gastos não essenciais." : "Excelente retenção! Ótimo para investir."}</p>
  </div>
 </div>
 </div>
  </div>
 );
}

