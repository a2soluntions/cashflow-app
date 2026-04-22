import React, { useMemo, useState } from 'react';
import { 
 FileText, Brain, TrendingUp, TrendingDown, Target, 
 PieChart, CheckCircle2, XCircle, 
 Wallet, Clock
} from 'lucide-react';

interface ConsultantReportProps {
 theme: string;
 transactions: any[];
 currentBalance?: number;
}

export default function ConsultantReport({ theme, transactions }: ConsultantReportProps) {
 const isLight = theme === 'light';
 const [timeFilter, setTimeFilter] = useState<'month' | 'year'>('month');

 const analysis = useMemo(() => {
 const today = new Date();
 // Filtro temporal
 const targetTransactions = transactions.filter(t => {
 if (!t.date) return true; // fallback
 const parts = t.date.split('-');
 const tDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
 
 if (timeFilter === 'month') {
 return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
 } else {
 return tDate.getFullYear() === today.getFullYear(); // year filter or all-time if you prefer
 }
 });

 // 1. CÁLCULO DE RECEITAS E DESPESAS
 const income = targetTransactions
 .filter(t => t.type === 'income' || t.type === 'receita' || t.type === 'entrada')
 .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
 
 const expense = targetTransactions
 .filter(t => t.type === 'expense' || t.type === 'despesa' || t.type === 'saída')
 .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
 
 const realBalance = income - expense;

 // 2. IDENTIFICAÇÃO DE DÍVIDAS (Comprometimento de Renda)
 const debtKeywords = ['empréstimo', 'financiamento', 'parcela', 'fatura', 'dívida', 'consignado', 'juros', 'banco', 'cartão'];
 const debtPayments = targetTransactions
 .filter(t => t.type === 'expense' || t.type === 'despesa' || t.type === 'saída')
 .filter(t => 
 debtKeywords.some(kw => (t.description || '').toLowerCase().includes(kw)) || 
 debtKeywords.some(kw => (t.category || '').toLowerCase().includes(kw))
 )
 .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

 const debtRatio = income > 0 ? (debtPayments / income) * 100 : 0;

 // 3. REGRA 50/30/20
 const needsKeywords = ['moradia', 'casa', 'aluguel', 'mercado', 'supermercado', 'saúde', 'saude', 'farmácia', 'transporte', 'combustível', 'contas', 'luz', 'água', 'internet', 'educação', 'imposto'];
 let actualNeeds = 0; 
 let actualWants = 0;

 const expensesByCategory = targetTransactions
 .filter(t => t.type === 'expense' || t.type === 'despesa' || t.type === 'saída')
 .reduce((acc, t) => {
 const catName = t.category || 'Outros';
 const amt = Number(t.amount) || 0;
 acc[catName] = (acc[catName] || 0) + amt;
 const isNeed = needsKeywords.some(keyword => catName.toLowerCase().includes(keyword));
 if (isNeed) actualNeeds += amt;
 else actualWants += amt;
 return acc;
 }, {} as Record<string, number>);

 // Base de cálculo flexível: Se o usuário não registrou Receita, o gráfico usa a Despesa Total para mostrar a proporção de vazamento!
 const baseValue = income > 0 ? income : (expense > 0 ? expense : 1);

 const rule503020 = {
 needs: { actual: actualNeeds, percent: (actualNeeds / baseValue) * 100, targetPercent: 50 },
 wants: { actual: actualWants, percent: (actualWants / baseValue) * 100, targetPercent: 30 },
 savings: { actual: Math.max(0, income - expense), percent: income > 0 ? ((Math.max(0, income - expense)) / income) * 100 : 0, targetPercent: 20 }
 };

 const topCategories = Object.entries(expensesByCategory)
 .map(([name, val]) => ({
 name, 
 amount: val as number, 
 percent: expense > 0 ? ((val as number) / expense) * 100 : 0 
 })).sort((a, b) => b.amount - a.amount).slice(0, 5);

 const savingsRate = rule503020.savings.percent;
 const survivalMonths = expense > 0 ? (realBalance / (expense)) : 0;
 
 // SCORE DE SAÚDE VITTA (Lógica ponderada)
 let healthScore = 0;
 if (income === 0 && expense === 0) healthScore = 0;
 else {
 healthScore = 50 + (savingsRate * 1.5) - (debtRatio * 0.5);
 healthScore = Math.min(100, Math.max(0, healthScore + (Math.min(survivalMonths, 6) * 2)));
 }

 let message = ""; 
 let status: 'danger' | 'warning' | 'success' | 'neutral' = 'neutral';

 if (income === 0 && expense === 0) {
 message = "Aristides, aguardando dados para gerar o diagnóstico.";
 status = 'neutral';
 } else if (debtRatio > 35) {
 message = `Risco de Insolvência! ${debtRatio.toFixed(0)}% da sua renda está comprometida com dívidas.`;
 status = 'danger';
 } else if (expense > income) {
 message = `Déficit Detectado! Você operou no negativo em R$ ${(expense - income).toLocaleString('pt-BR')}.`;
 status = 'danger';
 } else {
 message = "Parabéns Aristides! Sua estrutura de fluxo está simétrica e sob controle.";
 status = 'success';
 }

 return { income, expense, realBalance, topCategories, savingsRate, healthScore, survivalMonths, message, status, rule503020, debtRatio };
 }, [transactions, timeFilter]);

 // COMPONENTE INTERNO: VELOCÍMETRO
 const MiniGauge = ({ value, label, color }: any) => (
 <div className="flex flex-col items-center gap-2">
 <div className="relative w-24 h-12 overflow-hidden">
 <svg className="w-24 h-24 transform -rotate-180" viewBox="0 0 100 100">
 <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="14" strokeDasharray="125.6" className={isLight ? 'text-slate-100' : 'text-white/5'} />
 <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${(Math.min(value, 100) / 100) * 125.6} 251.2`} strokeLinecap="round" className="transition-all duration-1000" />
 </svg>
 <div className="absolute inset-0 flex items-end justify-center pb-1">
 <span className={`text-[13px] font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>{Math.round(value)}%</span>
 </div>
 </div>
 <span className="text-[8px] font-black uppercase tracking-widest opacity-60 italic text-center leading-tight">{label}</span>
 </div>
 );

 // COMPONENTE INTERNO: BARRA DE PROGRESSO
 const ProgressBar = ({ label, actualPercent, targetPercent, color, value }: any) => {
 // Para investimentos/poupança o ideal é poupar MAIS que a meta. Para despesas/necessidades, o ideal é gastar MENOS.
 const isGood = label.includes('Investir') || label.includes('Poupar') ? actualPercent >= targetPercent : actualPercent <= targetPercent;
 
 // Alerta visual de estouro
 const barColor = isGood ? color : 'bg-rose-500';
 const safePercent = Math.max(0, Math.min(Number(actualPercent) || 0, 100));
 
 // Cálculo do desvio da meta
 const diff = actualPercent - targetPercent;
 let feedbackText = `Atual: ${actualPercent.toFixed(1)}%`;
 
 if (label.includes('Investir') || label.includes('Poupar')) {
 if (diff > 0) feedbackText += ` (+${diff.toFixed(1)}% Acima da Meta)`;
 else if (diff < 0) feedbackText += ` (${Math.abs(diff).toFixed(1)}% Abaixo da Meta)`;
 } else {
 if (diff > 0) feedbackText += ` (+${diff.toFixed(1)}% Excedido)`;
 }

 return (
 <div className="space-y-2">
 <div className="flex justify-between items-end">
 <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
 {label} {isGood ? <CheckCircle2 size={12} className="text-emerald-500"/> : <XCircle size={12} className="text-rose-500"/>}
 </span>
 <div className="text-right">
 <span className={`text-xs font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>R$ {value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
 <span className={`text-[9px] font-black tracking-widest uppercase ${isGood ? 'text-emerald-500' : 'text-rose-500 -rose-500/50'}`}>
 {actualPercent > 0 ? feedbackText : '0%'}
 </span>
 </div>
 </div>
 <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
 <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${safePercent}%` }} />
 </div>
 </div>
 );
 };

 return (
 <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full min-h-0 overflow-hidden pr-2">
 
 {/* 1. HEADER (Título e Filtro temporal) */}
 <div className={`shrink-0 p-5 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${isLight ? 'bg-white  ' : 'bg-white/5 border-white/10 backdrop-blur-xl'}`}>
 <div>
 <h2 className={`text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
 <FileText className="text-indigo-500" size={28} /> Raio-X Financeiro
 </h2>
 <p className="text-indigo-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Inteligência & Simetria de Dados</p>
 </div>

 {/* MENSAL / ANUAL TOGGLE */}
 <div className={`flex gap-2 p-2 rounded-2xl ${isLight ? 'bg-slate-50 ' : 'bg-black/20 border-white/5'}`}>
 <button 
 onClick={() => setTimeFilter('month')}
 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'month' ? 'bg-indigo-500 text-white -indigo-500/20' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}
 >
 Mês Atual
 </button>
 <button 
 onClick={() => setTimeFilter('year')}
 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'year' ? 'bg-indigo-500 text-white -indigo-500/20' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}
 >
 Longo Prazo (Anual)
 </button>
 </div>
 </div>

 {/* 2. LINHA DE VELOCÍMETROS (4 Itens) */}
 <div className={`p-5 rounded-[2.5rem] grid grid-cols-2 md:grid-cols-4 gap-4 items-center shrink-0 transition-all ${isLight ? 'bg-white ' : 'bg-white/5 border-white/10 -2xl'}`}>
 <MiniGauge value={analysis.savingsRate} label="Retenção (Lucro)" color="#6366f1" />
 <MiniGauge value={analysis.rule503020.needs.percent} label="Custo Fixo" color={analysis.rule503020.needs.percent > 55 ? "#f43f5e" : "#10b981"} />
 <MiniGauge value={analysis.debtRatio} label="Dívidas/Renda" color={analysis.debtRatio > 30 ? "#f43f5e" : "#10b981"} />
 <MiniGauge value={analysis.healthScore} label="Score Vitta" color="#8b5cf6" />
 </div>

 {/* 3. GRID PRINCIPAL (12 Colunas para alinhamento perfeito) */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pb-2">
 
 {/* LADO ESQUERDO: PARECER E DISTRIBUIÇÃO (5 colunas) */}
 <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
 {/* PARECER */}
 <div className={`p-5 rounded-[2rem] flex items-center gap-4 shrink-0 transition-all ${isLight ? 'bg-white  ' : 'bg-white/5 border-white/10'}`}>
 <div className={`p-3 rounded-full shrink-0 ${analysis.status === 'danger' ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
 <Brain size={24} />
 </div>
 <div className="flex-1">
 <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Análise do Consultor</h3>
 <p className={`text-[11px] font-bold leading-snug ${isLight ? 'text-slate-700' : 'text-white/70'}`}>{analysis.message}</p>
 </div>
 </div>

 {/* DISTRIBUIÇÃO 50/30/20 */}
 <div className={`flex-1 flex flex-col p-6 rounded-[2.5rem] min-h-0 transition-all ${isLight ? 'bg-white  ' : 'bg-indigo-900/10 border-indigo-500/20'}`}>
 <h3 className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
 <PieChart size={14}/> Distribuição de Fluxo
 </h3>
 <div className="flex-1 flex flex-col justify-around">
 <ProgressBar label="Custos Essenciais (50%)" actualPercent={analysis.rule503020.needs.percent} targetPercent={50} color="bg-indigo-500" value={analysis.rule503020.needs.actual} />
 <ProgressBar label="Estilo de Vida (30%)" actualPercent={analysis.rule503020.wants.percent} targetPercent={30} color="bg-amber-500" value={analysis.rule503020.wants.actual} />
 <ProgressBar label="Poupar & Investir (20%)" actualPercent={analysis.rule503020.savings.percent} targetPercent={20} color="bg-emerald-500" value={analysis.rule503020.savings.actual} />
 </div>
 </div>
 </div>

 {/* LADO DIREITO: CARDS E VAZAMENTOS (7 colunas) */}
 <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
 {/* GRID DE CARDS 2x2 */}
 <div className="grid grid-cols-2 gap-3 shrink-0">
 <div className={`p-5 rounded-[2rem] flex flex-col justify-center min-h-[90px] transition-all ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
 <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1.5 flex items-center gap-1.5"><TrendingUp size={12}/> Receita</p>
 <h3 className="text-xl font-black tracking-tighter">R$ {analysis.income.toLocaleString('pt-BR')}</h3>
 </div>

 <div className={`p-5 rounded-[2rem] flex flex-col justify-center min-h-[90px] transition-all ${isLight ? 'bg-rose-50 border-rose-100' : 'bg-rose-500/10 border-rose-500/20'}`}>
 <p className="text-[8px] font-black uppercase tracking-widest text-rose-600 mb-1.5 flex items-center gap-1.5"><TrendingDown size={12}/> Saídas</p>
 <h3 className="text-xl font-black tracking-tighter">R$ {analysis.expense.toLocaleString('pt-BR')}</h3>
 </div>

 <div className={`p-5 rounded-[2rem] flex flex-col justify-center min-h-[90px] transition-all ${isLight ? 'bg-slate-50 ' : 'bg-white/5 border-white/10'}`}>
 <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5"><Wallet size={12}/> Saldo Real</p>
 <h3 className="text-xl font-black tracking-tighter">R$ {analysis.realBalance.toLocaleString('pt-BR')}</h3>
 </div>

 <div className={`p-5 rounded-[2rem] flex flex-col justify-center min-h-[90px] transition-all ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
 <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500 mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Oxigênio</p>
 <h3 className="text-xl font-black tracking-tighter uppercase">{analysis.survivalMonths.toFixed(1)} <span className="text-[9px] opacity-50">Meses</span></h3>
 </div>
 </div>

 {/* TOP VAZAMENTOS COM SCROLL INVISÍVEL */}
 <div className={`flex-1 flex flex-col min-h-0 rounded-[2.5rem] p-5 transition-all ${isLight ? 'bg-white  ' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
 <h3 className={`text-[9px] font-black uppercase tracking-widest mb-4 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Top Vazamentos de Riqueza</h3>
 
 {/* CONTAINER DE SCROLL INVISÍVEL */}
 <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
 {analysis.topCategories.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-20">
 <Target size={40} />
 <p className="text-[10px] font-black uppercase tracking-widest mt-2">Sem dados registrados</p>
 </div>
 ) : (
 analysis.topCategories.map((cat, index) => (
 <div key={index} className="space-y-1.5">
 <div className="flex justify-between items-end text-[11px] font-black uppercase">
 <span className={isLight ? 'text-slate-900' : 'text-white'}>{cat.name}</span>
 <span className="text-slate-500 text-[10px]">R$ {cat.amount.toLocaleString('pt-BR')}</span>
 </div>
 <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
 <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${cat.percent}%` }} />
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

