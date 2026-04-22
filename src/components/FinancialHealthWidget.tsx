import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, PiggyBank, Target } from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../types';

interface FinancialAdvisorProps {
 transactions: Transaction[];
 currentBalance: number;
}

const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ transactions }) => {
 
 const analysis = useMemo(() => {
 const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.COMPLETED);
 const income = transactions.filter(t => t.type === TransactionType.INCOME && t.status === TransactionStatus.COMPLETED);
 
 const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
 const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
 
 const categories: Record<string, number> = {};
 expenses.forEach(t => {
 const cat = t.category || 'Outros';
 categories[cat] = (categories[cat] || 0) + t.amount;
 });
 
 const sortedCategories = Object.entries(categories)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 3);

 const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

 return { totalExpenses, totalIncome, sortedCategories, savingsRate };
 }, [transactions]);

 return (
 <div className="h-full overflow-y-auto p-1 pb-20 lg:pb-1 flex flex-col gap-6">
 
 <div className="shrink-0">
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
 <Lightbulb className="w-8 h-8 text-amber-500" />
 Consultor Inteligente
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
 Análise baseada apenas nos seus registros locais.
 </p>
 </div>

 {/* BLOCO DE MERCADO REMOVIDO DAQUI */}

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 <div className="bg-white dark:bg-[#09090b] p-6 rounded-[2.5rem] relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
 <PiggyBank className="w-32 h-32" />
 </div>
 
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-4">
 <div className={`p-3 rounded-2xl ${analysis.savingsRate > 20 ? 'bg-emerald-100 text-emerald-600' : analysis.savingsRate > 0 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
 <Target className="w-6 h-6" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saúde Financeira</span>
 </div>

 <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
 {analysis.savingsRate.toFixed(1)}%
 </h3>
 <p className="text-sm font-medium text-slate-500">
 da sua renda está sendo poupada.
 </p>

 <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 ">
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
 {analysis.savingsRate > 20 
 ? "Excelente! Você está construindo patrimônio rapidamente." 
 : analysis.savingsRate > 0 
 ? "Bom começo. Tente reduzir gastos supérfluos para chegar a 20%."
 : "Atenção: Você está gastando mais do que ganha."}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white dark:bg-[#09090b] p-6 rounded-[2.5rem] ">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
 <TrendingDown className="w-6 h-6" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Maiores Vilões</span>
 </div>

 <div className="space-y-4">
 {analysis.sortedCategories.length > 0 ? (
 analysis.sortedCategories.map(([cat, amount], idx) => (
 <div key={cat} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors  border-slate-50  last:border-0">
 <div className="flex items-center gap-3">
 <span className="font-black text-slate-300 text-lg">#{idx + 1}</span>
 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cat}</span>
 </div>
 <span className="text-sm font-black text-rose-500">
 R$ {amount.toLocaleString()}
 </span>
 </div>
 ))
 ) : (
 <p className="text-center text-slate-400 py-8 text-xs font-medium">Ainda não há despesas suficientes para análise.</p>
 )}
 </div>
 </div>

 </div>
 </div>
 );
};

export default FinancialAdvisor;



