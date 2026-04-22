import React, { useState, useMemo, useEffect } from 'react';
import { 
 Target, TrendingUp, AlertTriangle, CheckCircle2, 
 Edit3, Save, X, PieChart as PieIcon, Wallet 
} from 'lucide-react';
import { 
 PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Transaction } from '../types';

interface BudgetModuleProps {
 transactions: Transaction[];
}

interface BudgetGoal {
 category: string;
 limit: number;
}

// Configuração inicial de metas (pode vir de um banco de dados depois)
const INITIAL_GOALS: BudgetGoal[] = [
 { category: 'Moradia', limit: 2000 },
 { category: 'Alimentação', limit: 1200 },
 { category: 'Transporte', limit: 500 },
 { category: 'Lazer', limit: 400 },
 { category: 'Saúde', limit: 300 },
 { category: 'Educação', limit: 200 },
 { category: 'Outros', limit: 150 },
];

export const BudgetModule: React.FC<BudgetModuleProps> = ({ transactions }) => {
 const [goals, setGoals] = useState<BudgetGoal[]>(() => {
 const saved = localStorage.getItem('vittacash_budgets');
 return saved ? JSON.parse(saved) : INITIAL_GOALS;
 });
 
 const [editingCategory, setEditingCategory] = useState<string | null>(null);
 const [tempLimit, setTempLimit] = useState<string>('');

 // Salvar no LocalStorage sempre que atualizar
 useEffect(() => {
 localStorage.setItem('vittacash_budgets', JSON.stringify(goals));
 }, [goals]);

 // Cálculos em Tempo Real
 const budgetData = useMemo(() => {
 const currentMonth = new Date().getMonth();
 const currentYear = new Date().getFullYear();

 // 1. Calcular gastos reais por categoria (apenas despesas do mês atual)
 const actualSpending = transactions
 .filter(t => 
 t.type === 'expense' && 
 new Date(t.date).getMonth() === currentMonth &&
 new Date(t.date).getFullYear() === currentYear
 )
 .reduce((acc, t) => {
 acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
 return acc;
 }, {} as Record<string, number>);

 // 2. Mesclar com as metas
 const comparison = goals.map(goal => {
 const spent = actualSpending[goal.category] || 0;
 const percentage = (spent / goal.limit) * 100;
 const remaining = goal.limit - spent;
 
 let status: 'good' | 'warning' | 'danger' = 'good';
 if (percentage >= 100) status = 'danger';
 else if (percentage >= 80) status = 'warning';

 return { ...goal, spent, percentage, remaining, status };
 });

 // 3. Totais Gerais
 const totalBudget = goals.reduce((acc, g) => acc + g.limit, 0);
 const totalSpent = Object.values(actualSpending).reduce((acc, val) => acc + val, 0);
 const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

 return { comparison, totalBudget, totalSpent, totalProgress };
 }, [transactions, goals]);

 // Handlers de Edição
 const startEditing = (category: string, currentLimit: number) => {
 setEditingCategory(category);
 setTempLimit(currentLimit.toString());
 };

 const saveGoal = () => {
 if (!editingCategory) return;
 const newGoals = goals.map(g => 
 g.category === editingCategory ? { ...g, limit: Number(tempLimit) } : g
 );
 setGoals(newGoals);
 setEditingCategory(null);
 };

 return (
 <div className="h-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 p-2">
 {/* CABEÇALHO */}
 <div className="flex justify-between items-end    pb-4">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl lue-100 dark:lue-900/30">
 <Target size={32} className="text-blue-600 dark:text-blue-400" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Metas & Orçamento</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Planejamento Mensal</p>
 </div>
 </div>
 
 {/* Card Resumo Global */}
 <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-6">
 <div className="text-right">
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orçamento Total</p>
 <p className="text-xl font-bold">R$ {budgetData.totalBudget.toLocaleString()}</p>
 </div>
 <div className="h-8 w-px bg-slate-700"></div>
 <div className="text-right">
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gasto Real</p>
 <p className={`text-xl font-bold ${budgetData.totalSpent > budgetData.totalBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
 R$ {budgetData.totalSpent.toLocaleString()}
 </p>
 </div>
 <div className="w-12 h-12 relative flex items-center justify-center">
 <PieIcon size={24} className={budgetData.totalProgress > 100 ? "text-rose-500" : "text-emerald-500"}/>
 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
 <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
 <path className={budgetData.totalProgress > 100 ? "text-rose-500" : "text-emerald-500"} strokeDasharray={`${Math.min(budgetData.totalProgress, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
 </svg>
 </div>
 </div>
 </div>

 <div className="flex gap-6 h-full overflow-hidden">
 
 {/* LISTA DE CATEGORIAS (Esquerda) */}
 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
 {budgetData.comparison.map((item) => (
 <div key={item.category} className="bg-white dark:bg-[#09090b] rounded-3xl p-5 hover: transition-all group">
 <div className="flex justify-between items-center mb-3">
 
 {/* Nome e Ícone */}
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-xl ${item.status === 'danger' ? 'bg-rose-100 text-rose-600' : item.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'} dark:bg-[#09090b]/40`}>
 {item.status === 'danger' ? <AlertTriangle size={20}/> : item.status === 'warning' ? <TrendingUp size={20}/> : <Wallet size={20}/>}
 </div>
 <div>
 <h3 className="font-bold text-slate-800 dark:text-white text-sm">{item.category}</h3>
 <p className="text-[10px] text-slate-400 font-bold uppercase">{item.percentage.toFixed(0)}% Utilizado</p>
 </div>
 </div>

 {/* Edição de Limite */}
 <div className="flex items-center gap-3">
 {editingCategory === item.category ? (
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#09090b] p-1 rounded-lg border-indigo-200 animate-in fade-in zoom-in">
 <input 
 type="number" 
 autoFocus
 className="w-20 bg-transparent text-right text-sm font-bold outline-none dark:text-white"
 value={tempLimit}
 onChange={(e) => setTempLimit(e.target.value)}
 />
 <button onClick={saveGoal} className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"><Save size={14}/></button>
 <button onClick={() => setEditingCategory(null)} className="p-1 hover:bg-rose-100 text-rose-600 rounded"><X size={14}/></button>
 </div>
 ) : (
 <div className="text-right group/edit cursor-pointer" onClick={() => startEditing(item.category, item.limit)}>
 <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1">
 Meta <Edit3 size={10} className="opacity-0 group-hover/edit:opacity-100 transition-opacity"/>
 </p>
 <p className="font-bold text-slate-700 dark:text-slate-300">R$ {item.limit.toLocaleString()}</p>
 </div>
 )}
 </div>
 </div>

 {/* Barra de Progresso */}
 <div className="relative h-4 w-full bg-slate-100 dark:bg-[#09090b] rounded-full overflow-hidden mb-2">
 <div 
 className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
 item.status === 'danger' ? 'bg-rose-500' : 
 item.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
 }`}
 style={{ width: `${Math.min(item.percentage, 100)}%` }}
 ></div>
 {/* Linha da meta (opcional, visual) */}
 <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 right-0 z-10"></div> 
 </div>

 {/* Rodapé do Card */}
 <div className="flex justify-between items-center text-xs">
 <span className="font-bold text-slate-500">Gasto: <span className="text-slate-800 dark:text-white">R$ {item.spent.toLocaleString()}</span></span>
 <span className={`font-bold ${item.remaining < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
 {item.remaining < 0 ? `Estourou R$ ${Math.abs(item.remaining).toLocaleString()}` : `Resta R$ ${item.remaining.toLocaleString()}`}
 </span>
 </div>
 </div>
 ))}
 </div>

 {/* PAINEL LATERAL (Insights) */}
 <div className="w-1/3 flex flex-col gap-4">
 
 {/* Gráfico de Distribuição */}
 <div className="bg-white dark:bg-[#09090b] p-6 rounded-[2rem] flex-1 flex flex-col">
 <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><PieIcon size={18}/> Distribuição Ideal</h3>
 <div className="flex-1 w-full min-h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <RechartsPie>
 <Pie 
 data={budgetData.comparison.filter(g => g.limit > 0)} 
 dataKey="limit" 
 nameKey="category" 
 cx="50%" 
 cy="50%" 
 innerRadius={60} 
 outerRadius={80} 
 paddingAngle={5}
 >
 {budgetData.comparison.map((_, index) => (
 <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#6366f1'][index % 7]} />
 ))}
 </Pie>
 <Tooltip />
 </RechartsPie>
 </ResponsiveContainer>
 </div>
 <div className="text-center mt-2">
 <p className="text-xs text-slate-400">Total Planejado</p>
 <p className="text-2xl font-black text-slate-800 dark:text-white">R$ {budgetData.totalBudget.toLocaleString()}</p>
 </div>
 </div>

 {/* Card de Alerta */}
 <div className={`p-6 rounded-[2rem] ${budgetData.totalProgress > 90 ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20' : 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20'}`}>
 <div className="flex items-start gap-4">
 <div className={`p-3 rounded-full ${budgetData.totalProgress > 90 ? 'bg-white text-rose-500' : 'bg-white text-indigo-500'}`}>
 {budgetData.totalProgress > 90 ? <AlertTriangle size={24}/> : <CheckCircle2 size={24}/>}
 </div>
 <div>
 <h4 className={`font-bold text-sm mb-1 ${budgetData.totalProgress > 90 ? 'text-rose-700 dark:text-rose-300' : 'text-indigo-700 dark:text-indigo-300'}`}>
 {budgetData.totalProgress > 90 ? 'Cuidado com o Teto!' : 'Tudo sob controle'}
 </h4>
 <p className={`text-xs leading-relaxed ${budgetData.totalProgress > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
 {budgetData.totalProgress > 90 
 ? `Você já usou ${budgetData.totalProgress.toFixed(0)}% do seu orçamento total. Considere frear os gastos supérfluos.` 
 : `Você usou apenas ${budgetData.totalProgress.toFixed(0)}% do planejado. Continue assim para sobrar dinheiro para investir!`}
 </p>
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
};



