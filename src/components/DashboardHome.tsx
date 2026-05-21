import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Activity, 
  AlertTriangle, BrainCircuit, Target, CheckCircle2,
  Skull, Percent, ArrowUpRight, Zap, Clock, Lightbulb,
  Flame
} from 'lucide-react';
import { CustomAlert } from './CustomAlert';

interface Transaction {
 id: string;
 type: 'income' | 'expense';
 amount: number;
 description: string;
 category: string;
 date: string;
 status?: 'COMPLETED' | 'completed' | 'PENDING' | 'pending'; 
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

const ModernSlider = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const boundedValue = Math.min(Math.max(value, 0), 100);
  return (
    <div className="flex flex-col gap-1 w-full p-2 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-white/10">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white/60">{label}</span>
        <span className="text-xs font-black" style={{ color }}>{boundedValue.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none rounded-full relative overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{ 
            width: `${boundedValue}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}66`
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </div>
      </div>
    </div>
  );
};

export const DONUT_GRADIENTS = [
  { id: 'grad0', from: '#FF5722', to: '#FF8A00', css: 'linear-gradient(to right, #FF5722, #FF8A00)' },
  { id: 'grad1', from: '#00E676', to: '#10B981', css: 'linear-gradient(to right, #00E676, #10B981)' },
  { id: 'grad2', from: '#D500F9', to: '#9C27B0', css: 'linear-gradient(to right, #D500F9, #9C27B0)' },
  { id: 'grad3', from: '#FF5722', to: '#D500F9', css: 'linear-gradient(to right, #FF5722, #D500F9)' },
  { id: 'grad4', from: '#00E676', to: '#D500F9', css: 'linear-gradient(to right, #00E676, #D500F9)' },
];

const DonutChart = ({ data, color, size = 100, centerValue, centerLabel }: { data: any[], color: string, size?: number, centerValue?: string | number, centerLabel?: string }) => {
  const radius = size / 2;
  const stroke = Math.max(size * 0.16, 8);
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  let cumulativePercent = 0;

  return (
    <div className="relative flex items-center justify-center transition-all duration-500" style={{ width: size, height: size }}>
      <svg height={size} width={size} className="transform -rotate-90 overflow-visible">
        <defs>
          {DONUT_GRADIENTS.map(g => (
            <linearGradient key={g.id} id={g.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g.from} />
              <stop offset="100%" stopColor={g.to} />
            </linearGradient>
          ))}
        </defs>
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {data.map((item, i) => {
          const gradientId = DONUT_GRADIENTS[i % DONUT_GRADIENTS.length].id;
          
          const dashoffset = circumference - (item.percent / 100) * circumference;
          const rotation = (cumulativePercent / 100) * 360;
          cumulativePercent += item.percent;
          
          return (
            <circle
              key={i}
              stroke={`url(#${gradientId})`}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ 
                strokeDashoffset: dashoffset + 8, 
                transformOrigin: 'center',
                transform: `rotate(${rotation}deg)`
              }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[9px] font-normal text-slate-900 dark:text-slate-500 dark:text-white/50 mb-0.5">{centerLabel || 'Status'}</span>
        <div className="flex items-baseline leading-none">
          <span className="text-xl font-light text-slate-900 dark:text-white tracking-tighter" style={{ fontSize: size * 0.25 }}>{centerValue !== undefined ? centerValue : 100}</span>
          <span className="text-[9px] font-light text-slate-900 dark:text-slate-500 dark:text-white/50 ml-0.5">%</span>
        </div>
      </div>
    </div>
  );
};

export default function DashboardHome({ transactions, categories = [] }: DashboardProps) {
 const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
 const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
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
 const rawTxs = localStorage.getItem('a2mentor_pro_transactions');
 const allTxs: Transaction[] = rawTxs ? JSON.parse(rawTxs) : (transactions || []);
 const now = new Date();
 const curYear = now.getFullYear();
 const curMonth = selectedMonth;
 const curMonthKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
 
 const periodTxs = allTxs.filter(t => {
 if (viewMode === 'monthly') return t.date && t.date.startsWith(curMonthKey);
 return t.date && t.date.startsWith(String(curYear));
 });

 const realizedAll = allTxs.filter(t => t.status === 'COMPLETED' || t.status === 'completed' || !t.status);
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
 }, [transactions, viewMode, categories, selectedMonth]);

 const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
 const maxVal = Math.max(...financialData.chartData.map(d => Math.max(d.in, d.out))) || 1;
 const getLinePath = (data: any[], type: 'in' | 'out') => {
 if(data.length === 0) return "";
 const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d[type] / maxVal) * 30)}`);
 return `M ${points.join(' L ')}`;
 };
 const getAreaPath = (data: any[], type: 'in' | 'out') => {
 if(data.length === 0) return "";
 const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d[type] / maxVal) * 30)}`);
 return `M 0,30 L ${points.join(' L ')} L 100,30 Z`;
 };

 return (
  <div className="w-full h-auto flex flex-col gap-1 font-sans bg-transparent px-3 py-1">
 <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
 
 <CustomAlert 
   isOpen={overdueAlert.isOpen}
   onClose={() => setOverdueAlert(prev => ({ ...prev, isOpen: false }))}
   title="Atenção: Contas Atrasadas"
   message={`Você possui ${overdueAlert.count} conta(s) que já venceram. Recomendamos regularizar para evitar juros.`}
   type="warning"
   confirmText="Revisar Agora"
 />

  {/* HEADER & TOGGLE */}
  <div className="flex justify-between items-center shrink-0 mb-1">
  <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 italic text-slate-900 dark:text-white">
  <Activity size={20} className="text-emerald-500" /> Cockpit
  </h1>
  <div className="flex bg-[#09090b] p-0.5 rounded-lg border border-slate-200 dark:border-white/5 items-center">
  {viewMode === 'monthly' && (
    <>
      <select 
        value={selectedMonth} 
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="pl-3 pr-2 py-1.5 text-[10px] font-black uppercase tracking-widest bg-transparent text-emerald-500 outline-none cursor-pointer hover:text-emerald-400"
      >
        {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
          <option key={i} value={i + 1} className="bg-[#09090b] text-slate-900 dark:text-white">{m}</option>
        ))}
      </select>
      <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>
    </>
  )}
  <button onClick={() => setViewMode('monthly')} className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${viewMode === 'monthly' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}>Mensal</button>
  <button onClick={() => setViewMode('yearly')} className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${viewMode === 'yearly' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}>Anual</button>
  </div>
  </div>

  {/* METAS HORIZONTAIS */}
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 mb-1 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none p-1 rounded-xl border border-slate-200 dark:border-white/5">
  <div className="flex flex-col shrink-0 border-r border-white/10 pr-4 mr-2">
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
  <div key={i} className={`px-4 py-2 rounded-lg flex items-center gap-4 shrink-0 transition-all border border-slate-200 dark:border-white/5 relative overflow-hidden ${budget.isOver ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
  <div className="absolute inset-0 opacity-10" style={{width: `${Math.min(budget.percent, 100)}%`, backgroundColor: budget.isOver ? '#f43f5e' : '#10b981'}} />
  <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white truncate max-w-[90px] z-10">{budget.category}</span>
  <span className={`text-[12px] font-black z-10 ${budget.isOver ? 'text-rose-500' : 'text-emerald-500'}`}>{budget.percent.toFixed(0)}%</span>
  </div>
  ))}
  </div>
 </div>

  {/* M É T R I C A S   S U P E R I O R E S */}
  <div className="grid grid-cols-12 gap-2 mb-1 shrink-0">
    {/* DISTRIBUIÇÃO */}
    <div className="col-span-12 lg:col-span-3 p-3 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl flex flex-col min-h-[220px]">
      <div className="flex-1 flex flex-col items-center justify-center p-1">
        <div className="flex items-center gap-1.5 text-brand-purple mb-2"><Percent size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Distribuição</span></div>
        <DonutChart data={financialData.categoryImpact} color="#D500F9" size={130} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-2 border-t border-slate-200 dark:border-white/5 mt-1 shrink-0 overflow-y-auto no-scrollbar max-h-[60px]">
        {financialData.categoryImpact.map((item, i) => {
          const bg = DONUT_GRADIENTS[i % DONUT_GRADIENTS.length].css;
          return (
            <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundImage: bg}} />
                <span className="truncate">{item.category}</span>
              </div>
              <span className="text-slate-900 dark:text-white opacity-40 ml-1">{item.percent.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* PROGRESS SLIDERS E SAÚDE (CENTRAL) */}
    <div className="col-span-12 lg:col-span-6 flex flex-col gap-2">
      <div className="flex justify-around items-center flex-1 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl p-2 min-h-[220px] overflow-x-auto no-scrollbar">
        {[
          { value: financialData.healthScore, label: 'Saúde', color: '#00E676', icon: Activity },
          { value: financialData.expenseRatio, label: 'Uso Renda', color: '#FF5722', icon: Wallet },
          { value: financialData.debtRatio, label: 'Dívida', color: '#FF8A00', icon: Skull },
          { value: financialData.savingsRate, label: 'Retenção', color: '#D500F9', icon: Target },
        ].map((metric, i) => (
          <div key={i} className="flex flex-col items-center justify-center shrink-0 min-w-[90px]">
            <div className="flex items-center gap-1 text-slate-900 dark:text-slate-600 dark:text-white/70 mb-2">
              <metric.icon size={12} style={{color: metric.color}} />
              <span className="text-[9px] font-black uppercase tracking-widest">{metric.label}</span>
            </div>
            <DonutChart 
              data={[{ percent: metric.value }]} 
              color={metric.color} 
              size={110} 
              centerValue={metric.value.toFixed(0)} 
              centerLabel="%" 
            />
          </div>
        ))}
      </div>
    </div>

    {/* VILÕES */}
    <div className="col-span-12 lg:col-span-3 p-3 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl flex flex-col min-h-[220px]">
      <div className="flex-1 flex flex-col items-center justify-center p-1">
        <div className="flex items-center gap-1.5 text-brand-orange mb-2"><Skull size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Vilões</span></div>
        <DonutChart data={financialData.villains} color="#FF5722" size={130} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-2 border-t border-slate-200 dark:border-white/5 mt-1 shrink-0 overflow-y-auto no-scrollbar max-h-[60px]">
        {financialData.villains.map((v, i) => {
          const bg = DONUT_GRADIENTS[i % DONUT_GRADIENTS.length].css;
          return (
            <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundImage: bg}} />
                <span className="truncate">{v.category}</span>
              </div>
              <span className="text-slate-900 dark:text-white opacity-40 ml-1">{v.amount > 999 ? (v.amount/1000).toFixed(1)+'k' : v.amount.toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* FLUXO E STATS (LINHA DO MEIO) */}
  <div className="grid grid-cols-12 gap-2 mb-1 shrink-0">
    {/* FLUXO (50%) */}
    <div className="col-span-12 lg:col-span-6 p-3 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl flex flex-col relative min-h-[160px]">
      <div className="flex justify-between items-center mb-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400 shrink-0 z-10">
        <span className="flex items-center gap-1.5"><Activity size={14} className="text-[#00E676]" /> {viewMode === 'monthly' ? 'Fluxo Diário' : 'Fluxo Mensal'}</span>
        <div className="flex gap-3 text-[7px]"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-[#00E676] bg-transparent"/> In</div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-[#FF5722] bg-transparent"/> Out</div></div>
      </div>
      
      <div className="flex-1 relative w-full mt-1 min-h-0 flex flex-col">
        <svg viewBox="0 0 100 30" className="w-full flex-1 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient-in" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradient-out" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5722" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF5722" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* AXES */}
          <polyline points="0,0 0,30 100,30" fill="none" stroke="#00E676" strokeWidth="0.4" opacity="0.8" />

          <path d={getAreaPath(financialData.chartData, 'in')} fill="url(#gradient-in)" />
          <path d={getAreaPath(financialData.chartData, 'out')} fill="url(#gradient-out)" />
          <path d={getLinePath(financialData.chartData, 'in')} fill="none" stroke="#00E676" strokeWidth="0.4" strokeLinejoin="round" />
          <path d={getLinePath(financialData.chartData, 'out')} fill="none" stroke="#FF5722" strokeWidth="0.4" strokeLinejoin="round" />
        </svg>
        
        {/* LABELS DO EIXO X */}
        <div className="flex justify-between w-full text-[6px] font-bold text-slate-900 dark:text-white/30 uppercase mt-1.5 px-0.5">
          {financialData.chartData.map((_, i) => {
             let label = '';
             let visible = true;
             if (viewMode === 'monthly') {
               label = (i + 1).toString();
               visible = i === 0 || i === financialData.chartData.length - 1 || (i + 1) % 5 === 0;
             } else {
               const m = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
               label = m[i % 12];
             }
             return <span key={i} className={visible ? '' : 'opacity-0'}>{label}</span>;
          })}
        </div>
      </div>
    </div>

    {/* STATS (50%) */}
    <div className="col-span-12 lg:col-span-6 grid grid-cols-3 gap-2 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl p-3 min-h-[160px]">
      {[
        { label: 'Saldo', val: financialData.balance, icon: Wallet, color: 'text-slate-900 dark:text-white' },
        { label: 'Fluxo', val: financialData.cashFlow, icon: ArrowUpRight, color: 'text-[#00E676]' },
        { label: 'Entradas', val: financialData.income, icon: TrendingUp, color: 'text-[#00E676]' },
        { label: 'Saídas', val: financialData.expense, icon: TrendingDown, color: 'text-[#FF5722]' },
        { label: 'Retenção', val: (financialData.savingsRate).toFixed(1)+'%', icon: Percent, color: 'text-[#D500F9]' },
        { label: 'Juros', val: 0, icon: Flame, color: 'text-[#FF8A00]' },
      ].map((card, i) => (
        <div key={i} className="flex flex-col justify-center items-center bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none rounded-lg border border-slate-200 dark:border-white/5 p-2 transition-all hover:bg-white/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1.5">
            <card.icon size={12}/> {card.label}
          </p>
          <h3 className={`text-[13px] font-black ${card.color}`}>
            {typeof card.val === 'number' ? formatCurrency(card.val) : card.val}
          </h3>
        </div>
      ))}
    </div>
  </div>

  {/* RODAPÉ (SAÚDE, VENCIMENTOS, INSIGHT) */}
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 shrink-0">
    {/* SAÚDE */}
    <div className={`md:col-span-4 p-3 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border ${financialData.healthStatus === 'good' ? 'border-emerald-500/20' : financialData.healthStatus === 'danger' ? 'border-rose-500/20' : 'border-slate-200 dark:border-white/5'} rounded-xl flex flex-col justify-between min-h-[90px]`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
          <BrainCircuit size={14} className={financialData.healthStatus === 'good' ? 'text-emerald-500' : financialData.healthStatus === 'danger' ? 'text-rose-500' : 'text-slate-400'}/> 
          Saúde
        </span>
        <span className={`text-base font-black ${financialData.healthStatus === 'good' ? 'text-emerald-500' : financialData.healthStatus === 'danger' ? 'text-rose-500' : 'text-slate-400'}`}>
          {financialData.healthScore}%
        </span>
      </div>
      <p className={`text-[9px] font-black leading-tight mb-2 ${financialData.healthStatus === 'good' ? 'text-emerald-400' : financialData.healthStatus === 'danger' ? 'text-rose-400' : 'text-slate-300'}`}>
        {financialData.diagnostico}
      </p>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {financialData.proximosPassos.map((step, i) => (
          <div key={i} className={`px-2 py-1 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border ${financialData.healthStatus === 'good' ? 'border-emerald-500/20' : financialData.healthStatus === 'danger' ? 'border-rose-500/20' : 'border-slate-200 dark:border-white/5'} rounded whitespace-nowrap`}>
            <span className={`text-[9px] font-bold uppercase ${financialData.healthStatus === 'good' ? 'text-emerald-500/70' : financialData.healthStatus === 'danger' ? 'text-rose-500/70' : 'text-slate-400'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* VENCIMENTOS */}
    <div className="md:col-span-4 p-3 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl flex flex-col min-h-[90px]">
      <div className="flex items-center gap-1.5 mb-1.5 text-blue-400 shrink-0"><Clock size={16} /><span className="text-[10px] font-black uppercase">Vencimentos</span></div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {financialData.upcomingBills.length === 0 ? (
           <p className="text-[9px] font-black text-slate-500 uppercase">Nenhum pendente</p>
        ) : financialData.upcomingBills.map((bill, i) => (
          <div key={i} className="p-2 bg-white shadow-xl border-slate-200 dark:bg-white/5 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-lg flex flex-col min-w-[110px] shrink-0">
            <p className="text-[9px] font-black uppercase truncate text-slate-900 dark:text-white mb-0.5">{bill.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(bill.date).toLocaleDateString('pt-BR')}</span>
              <span className="text-[10px] font-black text-rose-500">{formatCurrency(bill.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI INSIGHT */}
    <div className={`md:col-span-4 p-3 bg-gradient-to-br ${financialData.healthStatus === 'good' ? 'from-emerald-500/10 to-blue-500/10 border-emerald-500/20' : financialData.healthStatus === 'danger' ? 'from-rose-500/10 to-orange-500/10 border-rose-500/20' : 'from-white/5 to-white/5 border-slate-200 dark:border-white/5'} border rounded-xl flex flex-col relative overflow-hidden min-h-[90px]`}>
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Lightbulb size={24} className={financialData.healthStatus === 'good' ? 'text-emerald-500' : financialData.healthStatus === 'danger' ? 'text-rose-500' : 'text-slate-400'} />
      </div>
      <div className={`flex items-center gap-2 mb-1.5 shrink-0 ${financialData.healthStatus === 'good' ? 'text-emerald-500' : financialData.healthStatus === 'danger' ? 'text-rose-500' : 'text-slate-400'}`}>
        <BrainCircuit size={16} />
        <span className="text-[10px] font-black uppercase">AI Insight</span>
      </div>
      <p className="text-[11px] font-bold italic leading-tight z-10 text-zinc-100 mt-auto">
        {financialData.expense > financialData.income ? "Atenção: Gastos superam a receita. Reavalie suas saídas imediatamente." : "Excelente! Sua saúde financeira está em dia. Ótimo momento para novos aportes."}
      </p>
    </div>
  </div>
  </div>
 );
}
