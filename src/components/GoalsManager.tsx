import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Gauge, AlertCircle } from 'lucide-react';

interface BudgetGoal {
 id: string;
 category: string;
 limitAmount: number;
}

export default function GoalsManager() {
 const [budgets, setBudgets] = useState<BudgetGoal[]>([]);
 const [isAdding, setIsAdding] = useState(false);
 const [newBudget, setNewBudget] = useState({ category: '', limit: '' });

 // Categorias padrão para facilitar
 const categories = ["Lazer", "Alimentação", "Transporte", "Saúde", "Educação", "Moradia", "Outros"];

 useEffect(() => {
 const saved = localStorage.getItem('a2financas_pro_budgets');
 if (saved) setBudgets(JSON.parse(saved));
 }, []);

 const saveBudgets = (updated: BudgetGoal[]) => {
 setBudgets(updated);
 localStorage.setItem('a2financas_pro_budgets', JSON.stringify(updated));
 window.dispatchEvent(new Event('storage'));
 };

 const addBudget = () => {
 if (!newBudget.category || !newBudget.limit) return;
 const budget: BudgetGoal = {
 id: crypto.randomUUID(),
 category: newBudget.category,
 limitAmount: Number(newBudget.limit),
 };
 saveBudgets([...budgets, budget]);
 setNewBudget({ category: '', limit: '' });
 setIsAdding(false);
 };

 const deleteBudget = (id: string) => {
 saveBudgets(budgets.filter(b => b.id !== id));
 };

 return (
 <div className="p-6 space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Limites de Gastos</h2>
 <p className="text-[10px] font-bold text-slate-400 uppercase">Defina quanto pretende gastar por categoria</p>
 </div>
 <button 
 onClick={() => setIsAdding(!isAdding)}
 className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-2xl transition-all "
 >
 <Plus size={20} />
 </button>
 </div>

 {isAdding && (
 <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border-2 border-dashed border-rose-200 dark:border-rose-500/30 animate-in fade-in zoom-in duration-300">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <select 
 className="bg-white dark:bg-[#09090b]/20 border-none rounded-xl p-3 text-xs font-bold"
 value={newBudget.category}
 onChange={e => setNewBudget({...newBudget, category: e.target.value})}
 >
 <option value="">Selecione a Categoria</option>
 {categories.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 <input 
 type="number" 
 placeholder="Limite Máximo (R$)"
 className="bg-white dark:bg-[#09090b]/20 border-none rounded-xl p-3 text-xs font-bold"
 value={newBudget.limit}
 onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
 />
 </div>
 <button 
 onClick={addBudget}
 className="w-full mt-4 bg-rose-500 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 transition-colors"
 >
 Fixar Limite de Gasto
 </button>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {budgets.map(budget => (
 <div key={budget.id} className="bg-white dark:bg-[#09090b]/20  p-5 rounded-[2rem] group relative">
 <div className="flex justify-between items-center mb-2">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-500">
 <AlertCircle size={16} />
 </div>
 <span className="text-xs font-black uppercase text-slate-700 dark:text-white">{budget.category}</span>
 </div>
 <button onClick={() => deleteBudget(budget.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
 <Trash2 size={16} />
 </button>
 </div>
 <p className="text-[9px] font-bold text-slate-400 uppercase">Teto definido:</p>
 <p className="text-lg font-black text-slate-900 dark:text-white">
 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.limitAmount)}
 </p>
 </div>
 ))}
 </div>
 </div>
 );
}


