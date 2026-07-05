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
  { id: 'grad0', from: '#6C63FF', to: '#8B84FF', css: 'linear-gradient(to right, #6C63FF, #8B84FF)' },  // violeta premium
  { id: 'grad1', from: '#00D4AA', to: '#00EDBC', css: 'linear-gradient(to right, #00D4AA, #00EDBC)' },  // verde-água
  { id: 'grad2', from: '#FFD60A', to: '#FF9F43', css: 'linear-gradient(to right, #FFD60A, #FF9F43)' },  // âmbar
  { id: 'grad3', from: '#FF4757', to: '#C0392B', css: 'linear-gradient(to right, #FF4757, #C0392B)' },  // danger
  { id: 'grad4', from: '#6C63FF', to: '#00D4AA', css: 'linear-gradient(to right, #6C63FF, #00D4AA)' },  // grad principal
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
  <div className="w-full flex flex-col gap-4 font-sans px-2 py-2 animate-in fade-in duration-500">
    <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

    <CustomAlert
      isOpen={overdueAlert.isOpen}
      onClose={() => setOverdueAlert(prev => ({ ...prev, isOpen: false }))}
      title="Atenção: Contas Atrasadas"
      message={`Você possui ${overdueAlert.count} conta(s) que já venceram. Recomendamos regularizar para evitar juros.`}
      type="warning"
      confirmText="Revisar Agora"
    />

    {/* ── HEADER ─────────────────────────────────── */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Activity size={18} style={{ color: '#00D4AA' }} /> Cockpit Financeiro
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Visão geral das suas finanças</p>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
        {viewMode === 'monthly' && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="pl-2 pr-1 py-1 text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer"
            style={{ color: '#00D4AA' }}
          >
            {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
              <option key={i} value={i + 1} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{m}</option>
            ))}
          </select>
        )}
        {['monthly','yearly'].map(m => (
          <button key={m} onClick={() => setViewMode(m as any)}
            className="px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg"
            style={{
              background: viewMode === m ? 'linear-gradient(135deg,#6C63FF,#00D4AA)' : 'transparent',
              color: viewMode === m ? '#fff' : 'var(--text-muted)',
            }}>
            {m === 'monthly' ? 'Mensal' : 'Anual'}
          </button>
        ))}
      </div>
    </div>

    {/* ── LINHA 1: SALDO + MÉTRICAS ─────────────── */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* Card Saldo Principal */}
      <div className="relative p-6 overflow-hidden xl:col-span-1"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${financialData.balance >= 0 ? 'rgba(0,212,170,0.15)' : 'rgba(255,71,87,0.15)'} 0%, transparent 70%)` }} />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'rgba(108,99,255,0.12)' }}>
              <Wallet size={18} style={{ color: '#6C63FF' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Saldo Atual</p>
              <p className="text-[8px]" style={{ color: 'var(--text-subtle)' }}>Todas as contas</p>
            </div>
          </div>
          <span className="text-xs font-black px-2 py-1 rounded-md"
            style={{
              background: financialData.balance >= 0 ? 'rgba(0,212,170,0.1)' : 'rgba(255,71,87,0.1)',
              color: financialData.balance >= 0 ? '#00D4AA' : '#FF4757',
              border: `1px solid ${financialData.balance >= 0 ? 'rgba(0,212,170,0.2)' : 'rgba(255,71,87,0.2)'}`,
            }}>
            {financialData.balance >= 0 ? '▲' : '▼'} {viewMode === 'monthly' ? 'Mês' : 'Ano'}
          </span>
        </div>
        <h2 className="text-4xl font-black tracking-tighter relative z-10"
          style={{ color: financialData.balance >= 0 ? 'var(--text-primary)' : '#FF4757' }}>
          {formatCurrency(financialData.balance)}
        </h2>
        <div className="mt-4 pt-4 relative z-10" style={{ borderTop: '1px solid var(--bg-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Entradas</p>
              <p className="text-sm font-black" style={{ color: '#00D4AA' }}>{formatCurrency(financialData.income)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Saídas</p>
              <p className="text-sm font-black" style={{ color: '#FF4757' }}>{formatCurrency(financialData.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas (4 donuts) */}
      <div className="xl:col-span-2 relative p-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="absolute -top-16 -left-16 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)' }} />
        <p className="text-[10px] font-black uppercase tracking-widest mb-4 relative z-10" style={{ color: 'var(--text-muted)' }}>Indicadores Financeiros</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
          {[
            { value: financialData.healthScore,  label: 'Saúde',     color: '#00D4AA', icon: Activity   },
            { value: financialData.expenseRatio, label: 'Uso Renda', color: '#FF4757', icon: Wallet     },
            { value: financialData.debtRatio,    label: 'Dívida',    color: '#FFD60A', icon: Skull      },
            { value: financialData.savingsRate,  label: 'Retenção',  color: '#6C63FF', icon: Target     },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <div className="flex items-center gap-1 mb-2">
                <m.icon size={11} style={{ color: m.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
              </div>
              <DonutChart data={[{ percent: m.value }]} color={m.color} size={90} centerValue={m.value.toFixed(0)} centerLabel="%" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── LINHA 2: FLUXO + STATS ────────────────── */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

      {/* Gráfico de Fluxo */}
      <div className="relative p-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)', minHeight: 200 }}>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Activity size={13} style={{ color: '#00D4AA' }} />
            {viewMode === 'monthly' ? 'Fluxo Diário' : 'Fluxo Mensal'}
          </span>
          <div className="flex gap-3 text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#00D4AA', borderRadius: '50%' }} />Entrada</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#FF4757', borderRadius: '50%' }} />Saída</span>
          </div>
        </div>
        <div className="relative z-10" style={{ height: 130 }}>
          <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad-in-new" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="grad-out-new" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4757" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF4757" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={getAreaPath(financialData.chartData, 'in')} fill="url(#grad-in-new)" />
            <path d={getAreaPath(financialData.chartData, 'out')} fill="url(#grad-out-new)" />
            <path d={getLinePath(financialData.chartData, 'in')} fill="none" stroke="#00D4AA" strokeWidth="0.5" strokeLinejoin="round" />
            <path d={getLinePath(financialData.chartData, 'out')} fill="none" stroke="#FF4757" strokeWidth="0.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-between mt-1 relative z-10">
          {financialData.chartData.filter((_, i) => i % Math.ceil(financialData.chartData.length / 6) === 0 || i === financialData.chartData.length - 1).map((d, i) => (
            <span key={i} className="text-[7px] font-bold uppercase" style={{ color: 'var(--text-subtle)' }}>{d.label}</span>
          ))}
        </div>
      </div>

      {/* Grid de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Saldo',    val: financialData.balance,                icon: Wallet,      color: '#6C63FF' },
          { label: 'Fluxo',   val: financialData.cashFlow,               icon: ArrowUpRight, color: '#00D4AA' },
          { label: 'Entradas',val: financialData.income,                  icon: TrendingUp,  color: '#00D4AA' },
          { label: 'Saídas',  val: financialData.expense,                 icon: TrendingDown, color: '#FF4757' },
          { label: 'Retenção',val: `${financialData.savingsRate.toFixed(1)}%`, icon: Percent, color: '#6C63FF' },
          { label: 'Juros',   val: financialData.totalInterest,           icon: Flame,       color: '#FFD60A' },
        ].map((card, i) => (
          <div key={i} className="flex flex-col justify-center p-4 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '18px', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <card.icon size={12} style={{ color: card.color }} />
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            </div>
            <h3 className="text-sm font-black" style={{ color: card.color }}>
              {typeof card.val === 'number' ? formatCurrency(card.val) : card.val}
            </h3>
          </div>
        ))}
      </div>
    </div>

    {/* ── LINHA 3: DISTRIBUIÇÃO + VILÕES + VENCIMENTOS ── */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Distribuição */}
      <div className="relative p-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="absolute -top-12 -left-12 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)' }} />
        <div className="flex items-center gap-1.5 mb-3 relative z-10">
          <Percent size={13} style={{ color: '#6C63FF' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Distribuição</span>
        </div>
        <div className="flex justify-center mb-3 relative z-10">
          <DonutChart data={financialData.categoryImpact} color="#6C63FF" size={120} />
        </div>
        <div className="space-y-1.5 relative z-10">
          {financialData.categoryImpact.slice(0, 4).map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5" style={{ background: DONUT_GRADIENTS[i % DONUT_GRADIENTS.length].from, borderRadius: '50%' }} />
                <span className="text-[9px] font-bold truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
              </div>
              <span className="text-[9px] font-black" style={{ color: 'var(--text-primary)' }}>{item.percent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vilões */}
      <div className="relative p-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="absolute -top-12 -right-12 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,71,87,0.1) 0%, transparent 70%)' }} />
        <div className="flex items-center gap-1.5 mb-3 relative z-10">
          <Skull size={13} style={{ color: '#FF4757' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Maiores Gastos</span>
        </div>
        <div className="flex justify-center mb-3 relative z-10">
          <DonutChart data={financialData.villains} color="#FF4757" size={120} />
        </div>
        <div className="space-y-1.5 relative z-10">
          {financialData.villains.slice(0, 4).map((v, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5" style={{ background: DONUT_GRADIENTS[i % DONUT_GRADIENTS.length].from, borderRadius: '50%' }} />
                <span className="text-[9px] font-bold truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>{v.category}</span>
              </div>
              <span className="text-[9px] font-black" style={{ color: '#FF4757' }}>{formatCurrency(v.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Saúde + Vencimentos + Insight */}
      <div className="flex flex-col gap-3">

        {/* Saúde */}
        <div className="relative p-4 overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${financialData.healthStatus === 'good' ? 'rgba(0,212,170,0.25)' : financialData.healthStatus === 'danger' ? 'rgba(255,71,87,0.25)' : 'var(--bg-border)'}`,
            borderRadius: '20px',
          }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: financialData.healthStatus === 'good' ? '#00D4AA' : financialData.healthStatus === 'danger' ? '#FF4757' : 'var(--text-muted)' }}>
              <BrainCircuit size={12} /> Saúde
            </span>
            <span className="text-base font-black"
              style={{ color: financialData.healthStatus === 'good' ? '#00D4AA' : financialData.healthStatus === 'danger' ? '#FF4757' : 'var(--text-muted)' }}>
              {financialData.healthScore}%
            </span>
          </div>
          <p className="text-[9px] leading-tight" style={{ color: 'var(--text-muted)' }}>{financialData.diagnostico}</p>
        </div>

        {/* Vencimentos */}
        <div className="relative p-4 overflow-hidden flex-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '20px' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} style={{ color: '#6C63FF' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Vencimentos</span>
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar" style={{ maxHeight: 90 }}>
            {financialData.upcomingBills.length === 0
              ? <p className="text-[9px]" style={{ color: 'var(--text-subtle)' }}>Nenhuma conta pendente</p>
              : financialData.upcomingBills.map((bill, i) => (
                <div key={i} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  <div>
                    <p className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{bill.description}</p>
                    <p className="text-[8px]" style={{ color: 'var(--text-subtle)' }}>{new Date(bill.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="text-[10px] font-black" style={{ color: '#FF4757' }}>{formatCurrency(bill.amount)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="relative p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,170,0.06))',
            border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: '20px',
          }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <BrainCircuit size={12} style={{ color: '#6C63FF' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6C63FF' }}>A2 Insight</span>
          </div>
          <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
            {financialData.expense > financialData.income
              ? 'Gastos superam a receita. Reavalie suas saídas e corte despesas não essenciais.'
              : 'Saúde financeira em dia! Ótimo momento para novos aportes e investimentos.'}
          </p>
        </div>
      </div>
    </div>

    {/* ── LINHA 4: METAS DE ORÇAMENTO ──────────── */}
    {financialData.budgetStatus.length > 0 && (
      <div className="relative p-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} style={{ color: '#00D4AA' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Controle de Teto por Categoria</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {financialData.budgetStatus.map((budget, i) => (
            <div key={i} className="relative flex items-center gap-3 px-4 py-2 shrink-0 overflow-hidden"
              style={{
                background: budget.isOver ? 'rgba(255,71,87,0.08)' : 'rgba(0,212,170,0.08)',
                border: `1px solid ${budget.isOver ? 'rgba(255,71,87,0.2)' : 'rgba(0,212,170,0.2)'}`,
                borderRadius: '12px',
              }}>
              <div className="absolute inset-0 opacity-20" style={{ width: `${Math.min(budget.percent, 100)}%`, background: budget.isOver ? '#FF4757' : '#00D4AA' }} />
              <span className="text-[10px] font-black uppercase z-10" style={{ color: 'var(--text-primary)' }}>{budget.category}</span>
              <span className="text-xs font-black z-10" style={{ color: budget.isOver ? '#FF4757' : '#00D4AA' }}>{budget.percent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
 );
}
