import React, { useState, useMemo } from 'react';
import { 
 BarChart3, 
 TrendingUp, 
 AlertCircle, 
 Calendar,
 ArrowUpRight,
 ArrowDownRight,
 Zap,
 ChevronRight,
 ChevronLeft,
 Printer,
 ListOrdered,
 Receipt
} from 'lucide-react';

// 1. IMPORTAÇÃO E EXPANSÃO DO TYPE (Resolve o erro do status)
import { Transaction as BaseTransaction } from '../types'; 

interface Transaction extends Omit<BaseTransaction, 'status'> {
 status?: string;
 installment?: { current: number; total: number };
}

interface ReportsProps {
 transactions?: Transaction[];
}

// 2. VARIÁVEL DECLARADA UMA ÚNICA VEZ (Resolve o erro do monthNames)
const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Reports: React.FC<ReportsProps> = ({ transactions = [] }) => {
 const [activeTab, setActiveTab] = useState<'summary' | 'statement' | 'bills'>('summary');

 const [selectedDate, setSelectedDate] = useState(() => {
 const now = new Date();
 return { month: now.getMonth(), year: now.getFullYear() };
 });

 const [printMenuOpen, setPrintMenuOpen] = useState(false);
 const [printMode, setPrintMode] = useState<'color' | 'bw'>('color');

 const handlePrevMonth = () => {
 setSelectedDate(prev => {
 if (prev.month === 0) return { month: 11, year: prev.year - 1 };
 return { ...prev, month: prev.month - 1 };
 });
 };

 const handleNextMonth = () => {
 setSelectedDate(prev => {
 if (prev.month === 11) return { month: 0, year: prev.year + 1 };
 return { ...prev, month: prev.month + 1 };
 });
 };

 const executePrint = (mode: 'color' | 'bw') => {
 setPrintMode(mode);
 setPrintMenuOpen(false);
 setTimeout(() => {
 window.print();
 }, 300); 
 };

 // ==========================================
 // LÓGICA DE SEPARAÇÃO (EXTRATO VS CONTAS)
 // ==========================================

 // Filtra apenas transações COMPLETED (ou sem status) do mês
 const currentMonthTxs = useMemo(() => {
 return transactions.filter(t => {
  if (!t || !t.date) return false; 
  if (t.status?.toUpperCase() === 'PENDING') return false; // Ignora pendentes

 const txDate = new Date(t.date);
 if (isNaN(txDate.getTime())) return false;
 return txDate.getMonth() === selectedDate.month && txDate.getFullYear() === selectedDate.year;
 });
 }, [transactions, selectedDate]);

 // Filtra apenas transações PENDING do mês (Contas a Pagar)
 const currentMonthBills = useMemo(() => {
 return transactions.filter(t => {
  if (!t || !t.date) return false;
  if (t.status?.toUpperCase() !== 'PENDING') return false; // Exige que seja pendente

 const txDate = new Date(t.date);
 if (isNaN(txDate.getTime())) return false;
 return txDate.getMonth() === selectedDate.month && txDate.getFullYear() === selectedDate.year;
 });
 }, [transactions, selectedDate]);

 // ==========================================

 const stats = useMemo(() => {
 let income = 0;
 let expenses = 0;
 
 currentMonthTxs.forEach(t => {
 if (!t) return;
 const amount = Number(t.amount) || 0;
 if (t.type === 'income') income += amount;
 if (t.type === 'expense') expenses += amount;
 });

 let score = 500; 
 if (income > 0) {
 const ratio = expenses / income;
 score = Math.max(0, Math.min(1000, Math.round((1 - ratio) * 1000)));
 } else if (expenses > 0 && income === 0) {
 score = 250; 
 } else if (income === 0 && expenses === 0) {
 score = 0;
 }

 const expenseMap: Record<string, number> = {};
 currentMonthTxs.forEach(t => {
 if (t && t.type === 'expense') {
 const cat = t.category || 'Outros';
 expenseMap[cat] = (expenseMap[cat] || 0) + (Number(t.amount) || 0);
 }
 });

 const colors = ['#ef4444', '#f59e0b', '#3b82f6'];
 const topExpenses = Object.entries(expenseMap)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 3)
 .map((entry, index) => ({
 category: entry[0],
 value: entry[1],
 color: colors[index] || '#6366f1'
 }));

 const historyData = [];
 let maxAbsValue = 1; 

 for (let i = 4; i >= 0; i--) {
 let m = selectedDate.month - i;
 let y = selectedDate.year;
 
 if (m < 0) {
 m += 12;
 y -= 1;
 }

 const histTxs = transactions.filter(t => {
  if (!t || !t.date || t.status?.toUpperCase() === 'PENDING') return false; 
 const d = new Date(t.date);
 return d.getMonth() === m && d.getFullYear() === y;
 });

 let mInc = 0, mExp = 0;
 histTxs.forEach(t => {
 if (t.type === 'income') mInc += Number(t.amount) || 0;
 if (t.type === 'expense') mExp += Number(t.amount) || 0;
 });

 const net = mInc - mExp; 
 if (Math.abs(net) > maxAbsValue) maxAbsValue = Math.abs(net);

 historyData.push({
 monthName: monthNames[m],
 netValue: net,
 heightPercent: 0 
 });
 }

 const history = historyData.map(d => ({
 ...d,
 heightPercent: maxAbsValue > 0 ? (Math.abs(d.netValue) / maxAbsValue) * 100 : 0
 }));

 return {
 vittaScore: score,
 monthlyIncome: income,
 monthlyExpenses: expenses,
 topExpenses,
 history,
 hasData: income > 0 || expenses > 0,
 scoreText: score >= 800 ? 'Elite' : score >= 600 ? 'Excelente' : score >= 400 ? 'Estável' : score === 0 ? 'Sem Dados' : 'Atenção'
 };
 }, [currentMonthTxs, transactions, selectedDate]);

 const formatK = (value: number) => {
 if (Math.abs(value) >= 1000) {
 return (value / 1000).toFixed(1) + 'k';
 }
 return value.toString();
 };

 const formatDate = (dateString: string) => {
 try {
 const d = new Date(dateString);
 return d.toLocaleDateString('pt-BR');
 } catch {
 return dateString;
 }
 };

 return (
 <>
 <style type="text/css">
 {`
 @media print {
 @page { margin: 1cm; size: A4; }
 html, body, #root { background-color: white !important; }
 body * { visibility: hidden; }
 #vitta-printable-report, #vitta-printable-report * { visibility: visible; }
 
 #vitta-printable-report {
 position: absolute !important; left: 0 !important; top: 0 !important;
 width: 100% !important; background: white !important;
 padding: 0 !important; margin: 0 !important; overflow: visible !important;
 }

 * {
 -webkit-print-color-adjust: exact !important;
 print-color-adjust: exact !important;
 }

 table { width: 100%; border-collapse: collapse; margin-top: 20px; }
 th, td { ottom: 1px solid #e5e7eb; padding: 12px 8px; text-align: left; color: black !important; font-size: 12px; }
 th { ottom: 2px solid #000; font-weight: bold; background-color: transparent !important; }
 }
 `}
 </style>

 <div id="vitta-printable-report" className={`h-full w-full flex flex-col gap-4 animate-in fade-in duration-700 pb-2 print:bg-white print:text-black print:overflow-visible print:h-auto ${printMode === 'bw' ? 'print:grayscale print:contrast-125' : ''}`}>
 
 {/* HEADER DA CENTRAL */}
 <div className="flex flex-col border-white/5 pb-4 shrink-0 gap-3 print:lack/10">
 <div>
 <h2 className="text-[9px] font-black text-[#00d06c] uppercase tracking-[0.5em] mb-1 flex items-center gap-2 print:text-emerald-700">
 <BarChart3 size={12} /> Central de Documentos
 </h2>
 <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none print:text-black">
 Vitta Reports
 </h1>
 </div>

 <div className="flex flex-col gap-3 print:hidden">
 
 {/* TABS E BOTÃO EXPORTAR */}
 <div className="flex flex-wrap items-center gap-2 md:gap-4">
 <div className="flex gap-1 bg-slate-50 dark:bg-[#09090b]/40 p-1 flex-wrap">
 <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-white dark:bg-[#00d06c] text-emerald-600 dark:text-black' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white'}`}>
 <BarChart3 size={12} /> Resumo
 </button>
 <button onClick={() => setActiveTab('statement')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'statement' ? 'bg-white dark:bg-[#00d06c] text-emerald-600 dark:text-black' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white'}`}>
 <ListOrdered size={12} /> Extrato
 </button>
 <button onClick={() => setActiveTab('bills')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'bills' ? 'bg-white dark:bg-[#00d06c] text-emerald-600 dark:text-black' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white'}`}>
 <Receipt size={12} /> Contas
 </button>
 </div>

 <div className="relative">
 <button 
 onClick={() => setPrintMenuOpen(!printMenuOpen)}
 className="px-5 py-2 flex items-center justify-center gap-2 bg-[#00d06c] text-black font-black uppercase text-[9px] tracking-[0.2em] -[#00d06c]/10 active:scale-95 transition-all"
 >
 <Printer size={14} /> Exportar
 </button>

 {printMenuOpen && (
  <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-[200px] bg-white dark:bg-[#0a0a0c] p-2 flex flex-col gap-2 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 z-[100] border border-black/5 dark:border-white/5">
  <button onClick={() => executePrint('color')} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all text-left">
  <span className="w-2 h-2 bg-gradient-to-tr from-rose-500 via-amber-500 to-[#00d06c] shrink-0" /> Colorido
  </button>
  <button onClick={() => executePrint('bw')} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 transition-all text-left">
  <span className="w-2 h-2 bg-zinc-400 shrink-0" /> Preto e Branco
  </button>
 </div>
 )}
 </div>
 </div>

 {/* SELETOR DE CALENDÁRIO */}
 <div className="flex items-center gap-2">
 <button onClick={handlePrevMonth} className="p-1.5 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-90">
 <ChevronLeft size={14} />
 </button>
 <div className="px-5 py-1.5 bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center min-w-[110px]">
 <Calendar size={12} className="text-emerald-500 dark:text-[#00d06c] mr-2" />
 <span className="text-slate-900 dark:text-white font-black uppercase text-[9px] tracking-widest italic">
 {monthNames[selectedDate.month]} {selectedDate.year}
 </span>
 </div>
 <button onClick={handleNextMonth} className="p-1.5 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-90">
 <ChevronRight size={14} />
 </button>
 </div>
 </div>
 
 <div className="hidden print:block font-black uppercase text-sm">
 Tipo: {activeTab === 'summary' ? 'Resumo Executivo' : activeTab === 'statement' ? 'Extrato Detalhado' : 'Contas a Pagar'} <br/>
 Período: {monthNames[selectedDate.month]} {selectedDate.year}
 </div>
 </div>

 {/* ÁREA DE CONTEÚDO */}
 <div className="flex-1 overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] print:overflow-visible flex flex-col gap-4">

 {/* ABA 1: RESUMO EXECUTIVO */}
 {activeTab === 'summary' && (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 print:grid-cols-3 print:gap-4 print:mb-6">
 <div className="lg:col-span-2 p-5 bg-white/5 dark:bg-white/5 backdrop-blur-xl relative overflow-hidden group flex flex-col justify-between min-h-[160px] print:lack/20 print:bg-gray-50 border border-white/5">
 <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
 <Zap size={80} className="text-emerald-500 dark:text-[#00d06c] fill-emerald-500 dark:fill-[#00d06c] print:text-gray-300 print:fill-gray-300" />
 </div>
 <div>
 <p className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2 print:text-gray-600">Vitta Score</p>
 <div className="flex items-end gap-3">
 <h3 className={`text-5xl font-black italic leading-none tracking-tighter print:text-black ${stats.hasData ? (stats.vittaScore >= 500 ? 'text-slate-900 dark:text-white' : 'text-rose-500') : 'text-slate-400 dark:text-zinc-700'}`}>{stats.vittaScore}</h3>
 <span className={`${stats.vittaScore >= 500 && stats.hasData ? 'text-emerald-500 dark:text-[#00d06c]' : 'text-rose-500'} font-black text-xs mb-1 uppercase tracking-widest italic print:text-gray-800`}>{stats.scoreText}</span>
 </div>
 </div>
 <div className="space-y-2 relative z-10 mt-4">
 <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 overflow-hidden print:bg-gray-200">
 <div className={`h-full transition-all duration-1000 print:bg-black ${!stats.hasData ? 'bg-slate-300 dark:bg-zinc-800' : stats.vittaScore >= 500 ? 'bg-emerald-500 dark:bg-[#00d06c]' : 'bg-rose-500'}`} style={{ width: `${Math.max(5, (stats.vittaScore / 1000) * 100)}%` }} />
 </div>
 </div>
 </div>

 <div className="p-5 bg-white dark:bg-[#09090b]/30 backdrop-blur-xl flex flex-col justify-between min-h-[160px] print:lack/20 print:bg-gray-50 border border-white/5 ">
 <div>
 <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 border-emerald-100 dark:border-emerald-500/20 print:border-none print:bg-transparent print:p-0"><ArrowUpRight size={18} /></div>
 <p className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1 italic print:text-gray-600">Entradas Reais</p>
 <h4 className="text-xl font-black text-slate-900 dark:text-white italic leading-none tracking-tighter print:text-black">R$ {stats.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
 </div>
 </div>

 <div className="p-5 bg-white dark:bg-[#09090b]/30 backdrop-blur-xl flex flex-col justify-between min-h-[160px] print:lack/20 print:bg-gray-50 border border-white/5 ">
 <div>
 <div className="w-9 h-9 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3 border-rose-100 dark:border-rose-500/20 print:border-none print:bg-transparent print:p-0"><ArrowDownRight size={18} /></div>
 <p className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1 italic print:text-gray-600">Saídas Reais</p>
 <h4 className="text-xl font-black text-slate-900 dark:text-white italic leading-none tracking-tighter print:text-black">R$ {stats.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 print:grid-cols-2 print:mb-6">
 <div className="lg:col-span-2 p-6 bg-white dark:bg-[#09090b]/30 backdrop-blur-xl flex flex-col print:lack/20 print:bg-gray-50 min-h-[220px] border border-white/5 ">
 <div className="flex justify-between items-center mb-4 shrink-0">
 <h3 className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none print:text-black">Crescimento Patrimonial</h3>
 </div>
 <div className="flex-1 flex items-end justify-around gap-2 min-h-0 pt-6">
 {stats.history.map((item, i) => {
 const isPositive = item.netValue >= 0;
 return (
 <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
 <span className={`text-[9px] font-bold italic transition-all ${isPositive ? 'text-emerald-500 dark:text-[#00d06c]' : 'text-rose-500'} print:text-black`}>{item.netValue !== 0 ? formatK(item.netValue) : 'R$ 0'}</span>
 <div className={`w-full max-w-[40px] transition-all duration-700 relative overflow-hidden print:border print:lack/30 print:bg-gray-300 ${isPositive ? 'bg-gradient-to-t from-emerald-100 dark:from-[#00d06c]/5 to-emerald-300 dark:to-[#00d06c]/40' : 'bg-gradient-to-t from-rose-100 dark:from-rose-500/5 to-rose-300 dark:to-rose-500/40'}`} style={{ height: `${Math.max(item.heightPercent, 5)}%` }} />
 <span className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors italic print:text-black">{item.monthName}</span>
 </div>
 );
 })}
 </div>
 </div>

 <div className="p-6 bg-emerald-50 dark:bg-[#00d06c]/30 backdrop-blur-xl border border-emerald-100 dark:border-emerald-500/20 flex flex-col overflow-hidden print:lack/20 print:bg-gray-50 min-h-[220px]">
 <div className="flex items-center gap-2 mb-4 shrink-0">
 <AlertCircle size={20} className="text-emerald-500 dark:text-[#00d06c] print:text-black" />
 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-widest print:text-black">Vitta Analysis</h3>
 </div>
 <div className="flex-1 flex flex-col gap-3 overflow-hidden">
 <div className="p-5 bg-white dark:bg-[#09090b]/40 flex-1 flex flex-col justify-center print:bg-transparent print:lack/10">
 {stats.topExpenses.length > 0 ? (
 <p className="text-sm md:text-base font-medium text-slate-700 dark:text-zinc-200 leading-relaxed italic print:text-gray-900">"A categoria <span className="text-slate-900 dark:text-white font-black print:text-black">{stats.topExpenses[0].category}</span> foi a maior despesa. Avalie se compromete seu <span className="text-emerald-600 dark:text-[#00d06c] font-black print:text-emerald-700">Vitta Horizons</span>."</p>
 ) : (
 <p className="text-sm md:text-base font-medium text-slate-500 dark:text-zinc-400 leading-relaxed italic print:text-gray-800">Sem dados suficientes.</p>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 bg-white dark:bg-[#09090b]/30 backdrop-blur-xl flex flex-col shrink-0 min-h-[100px] justify-center print:lack/20 print:bg-gray-50 border border-white/5 ">
 <div className="flex items-center gap-2 mb-4">
 <AlertCircle size={14} className="text-rose-500 print:text-black" />
 <h3 className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-[0.2em] print:text-black">Top 3 Maiores Despesas (Vilões do Mês)</h3>
 </div>

 {stats.topExpenses.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full print:gap-4">
 {stats.topExpenses.map((expense, index) => {
 const percent = stats.monthlyExpenses > 0 ? (expense.value / stats.monthlyExpenses) * 100 : 0;
 return (
 <div key={index} className="flex flex-col gap-2">
 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest italic text-slate-500 dark:text-zinc-300 truncate print:text-gray-800">
 <span className="truncate mr-2">{index + 1}. {expense.category}</span>
 <span className="text-slate-900 dark:text-white whitespace-nowrap print:text-black">R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
 </div>
 <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden print:bg-gray-200">
 <div className="h-full rounded-full transition-all duration-1000 print:bg-black" style={{ width: `${percent}%`, backgroundColor: expense.color }} />
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 italic print:text-gray-500">
 Nenhuma despesa lançada no mês selecionado.
 </div>
 )}
 </div>
 </>
 )}

 {/* ABA 2: EXTRATO COMPLETO */}
 {activeTab === 'statement' && (
 <div className="bg-white dark:bg-[#09090b]/30 backdrop-blur-xl rounded-[2.5rem] p-6 print:border-none print:p-0 border border-white/5 ">
 <h3 className="text-slate-900 dark:text-white font-black italic uppercase mb-6 tracking-tighter text-xl print:text-black print:mb-2">Extrato de Transações (Realizadas)</h3>
 {currentMonthTxs.length > 0 ? (
 <div className="w-full overflow-x-auto">
 <table className="w-full text-left text-sm text-slate-600 dark:text-zinc-400">
 <thead className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 ">
 <tr>
 <th className="pb-3 font-black">Data</th>
 <th className="pb-3 font-black">Descrição</th>
 <th className="pb-3 font-black">Categoria</th>
 <th className="pb-3 font-black text-right">Valor</th>
 </tr>
 </thead>
 <tbody>
 {currentMonthTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, idx) => (
 <tr key={tx.id || idx} className=" hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
 <td className="py-4">{formatDate(tx.date)}</td>
 <td className="py-4 text-slate-900 dark:text-white print:text-black font-medium">{tx.description}</td>
 <td className="py-4">{tx.category}</td>
 <td className={`py-4 text-right font-black ${tx.type === 'income' ? 'text-emerald-500 dark:text-[#00d06c]' : 'text-rose-500'} print:text-black`}>
 {tx.type === 'income' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 <div className="mt-4 flex justify-end gap-6 text-sm">
 <span className="text-slate-500 dark:text-zinc-500">Entradas: <b className="text-emerald-500 dark:text-[#00d06c] print:text-black">R$ {stats.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></span>
 <span className="text-slate-500 dark:text-zinc-500">Saídas: <b className="text-rose-500 print:text-black">R$ {stats.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></span>
 </div>
 </div>
 ) : (
 <p className="text-slate-500 dark:text-zinc-500 text-sm italic py-10 text-center">Nenhuma transação realizada neste mês.</p>
 )}
 </div>
 )}

 {/* ABA 3: CONTAS A PAGAR */}
 {activeTab === 'bills' && (
 <div className="bg-white dark:bg-[#09090b]/30 backdrop-blur-xl rounded-[2.5rem] p-6 print:border-none print:p-0 border border-white/5 ">
 <h3 className="text-slate-900 dark:text-white font-black italic uppercase mb-6 tracking-tighter text-xl print:text-black print:mb-2">Obrigações e Contas (Pendentes)</h3>
 {currentMonthBills.length > 0 ? (
 <div className="w-full overflow-x-auto">
 <table className="w-full text-left text-sm text-slate-600 dark:text-zinc-400">
 <thead className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 ">
 <tr>
 <th className="pb-3 font-black">Vencimento</th>
 <th className="pb-3 font-black">Conta / Descrição</th>
 <th className="pb-3 font-black text-right">Valor Projetado</th>
 </tr>
 </thead>
 <tbody>
 {currentMonthBills.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((bill, idx) => (
 <tr key={bill.id || idx} className=" hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
 <td className="py-4 text-rose-500 dark:text-rose-400 print:text-black">{formatDate(bill.date)}</td>
 <td className="py-4 text-slate-900 dark:text-white print:text-black font-medium">{bill.description}</td>
 <td className="py-4 text-right font-black text-slate-900 dark:text-white print:text-black">
 R$ {Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <p className="text-zinc-500 text-sm italic py-10 text-center">Nenhuma conta pendente para este mês.</p>
 )}
 </div>
 )}

 </div>
 </div>
 </>
 );
};

export default Reports;




