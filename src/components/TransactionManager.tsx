import React, { useState, useEffect, useMemo } from 'react';
import { 
 Plus, Search, ArrowUpRight, ArrowDownRight, 
 Calendar, CheckCircle2, Clock, AlertTriangle, 
 Wallet, Tag, X, Trash2, Zap
} from 'lucide-react';

interface Transaction {
 id: string; type: 'income' | 'expense'; amount: number; description: string; category: string; date: string; status: 'COMPLETED' | 'PENDING';
}

interface Category {
 id: string; name: string; color: string;
}

interface Budget {
 id: string; category: string; limitAmount: number;
}

export function TransactionManager() {
 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [categories, setCategories] = useState<Category[]>([]);
 const [budgets, setBudgets] = useState<Budget[]>([]);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

 const [formData, setFormData] = useState<Partial<Transaction>>({
 type: 'expense', amount: 0, description: '', category: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED'
 });

 useEffect(() => {
 const loadData = () => {
 // Sincronizado para o cofre PRO
 setTransactions(JSON.parse(localStorage.getItem('a2financas_pro_transactions') || '[]'));
 const savedCats = JSON.parse(localStorage.getItem('a2financas_pro_categories') || '[]');
 if (savedCats.length > 0) {
 setCategories(savedCats);
 } else {
 setCategories([
 { id: '1', name: 'Alimentação', color: '#f59e0b' },
 { id: '2', name: 'Moradia', color: '#3b82f6' },
 { id: '3', name: 'Lazer', color: '#ec4899' },
 { id: '4', name: 'Salário', color: '#10b981' }
 ]);
 }
 setBudgets(JSON.parse(localStorage.getItem('a2financas_pro_budgets') || '[]'));
 };
 loadData();
 window.addEventListener('storage', loadData);
 return () => window.removeEventListener('storage', loadData);
 }, []);

 // --- PAINEL INTERATIVO DE ORÇAMENTO ---
 const budgetStatus = useMemo(() => {
 if (formData.type !== 'expense' || !formData.category || !formData.date) return null;

 // Remove espaços em branco e ignora maiúsculas/minúsculas para evitar bugs
 const targetCat = formData.category.trim().toLowerCase();
 const budget = budgets.find(b => (b.category || '').trim().toLowerCase() === targetCat);
 
 if (!budget) return { hasBudget: false }; 

 const txMonth = formData.date.slice(0, 7); 
 const limit = Number(budget.limitAmount) || 0;
 
 // Calcula o que JÁ FOI GASTO no mês
 const spentThisMonth = transactions
 .filter(t => t.type === 'expense' && (t.category || '').trim().toLowerCase() === targetCat && (t.date || '').startsWith(txMonth))
 .reduce((acc, t) => acc + Number(t.amount || 0), 0);

 // Soma com o valor que você está digitando AGORA no formulário
 const projectedTotal = spentThisMonth + Number(formData.amount || 0);
 const percent = limit > 0 ? (projectedTotal / limit) * 100 : 0;

 return {
 hasBudget: true,
 isOver: percent > 100,
 isWarning: percent >= 80 && percent <= 100,
 isGood: percent < 80,
 spent: spentThisMonth,
 limit: limit,
 projectedTotal: projectedTotal,
 percent: percent,
 };
 }, [formData.amount, formData.category, formData.type, formData.date, transactions, budgets]);

 const filteredTransactions = transactions.filter(t => {
 const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
 const matchesType = filterType === 'all' || t.type === filterType;
 return matchesSearch && matchesType;
 }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

 const handleSave = () => {
 if (!formData.description || !formData.amount || !formData.category) {
 alert("Preencha todos os campos obrigatórios (Descrição, Valor e Categoria)!");
 return;
 }

 const newTx: Transaction = {
 id: crypto.randomUUID(),
 type: formData.type as 'income' | 'expense',
 amount: Number(formData.amount),
 description: formData.description,
 category: formData.category,
 date: formData.date as string,
 status: formData.status as 'COMPLETED' | 'PENDING'
 };

 const updated = [newTx, ...transactions];
 setTransactions(updated);
 localStorage.setItem('a2financas_pro_transactions', JSON.stringify(updated));
 window.dispatchEvent(new Event('storage')); 
 
 setIsModalOpen(false);
 setFormData({ type: 'expense', amount: 0, description: '', category: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED' });
 };

 const handleDelete = (id: string) => {
 if (confirm('Tem certeza que deseja excluir este lançamento?')) {
 const updated = transactions.filter(t => t.id !== id);
 setTransactions(updated);
 localStorage.setItem('a2financas_pro_transactions', JSON.stringify(updated));
 window.dispatchEvent(new Event('storage'));
 }
 };

 const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(val);

 return (
 <div className="h-full flex flex-col gap-6 text-white animate-in fade-in zoom-in-95 duration-500">
 
 <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-6 border-white/10">
 <div>
 <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
 <Wallet className="text-indigo-400" /> Histórico de Lançamentos
 </h2>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gerencie suas entradas e saídas</p>
 </div>
 
 <button 
 onClick={() => setIsModalOpen(true)}
 className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 font-black uppercase text-xs tracking-widest transition-all hover:scale-105 flex items-center gap-2"
 >
 <Plus size={16} /> Novo Lançamento
 </button>
 </div>

 <div className="flex gap-4 items-center">
 <div className="flex-1 bg-white/5 border-white/10 px-4 py-3 flex items-center gap-3 focus-within:border-indigo-500/50 transition-colors">
 <Search size={18} className="text-slate-400" />
 <input 
 type="text" 
 placeholder="Buscar por descrição ou categoria..." 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-600"
 />
 </div>
 <div className="flex bg-white/5 border-white/10 p-1">
 <button onClick={() => setFilterType('all')} className={`px-4 py-2 text-[10px] font-black uppercase transition-all ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>Todos</button>
 <button onClick={() => setFilterType('income')} className={`px-4 py-2 text-[10px] font-black uppercase transition-all ${filterType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}>Receitas</button>
 <button onClick={() => setFilterType('expense')} className={`px-4 py-2 text-[10px] font-black uppercase transition-all ${filterType === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}>Despesas</button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto no-scrollbar bg-white/5 border-white/10 p-4">
 {filteredTransactions.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <Wallet size={60} className="mb-4 text-slate-500" />
 <p className="font-black uppercase tracking-widest text-slate-400">Nenhuma transação encontrada</p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredTransactions.map(tx => {
 const catColor = categories.find(c => (c.name || '').toLowerCase() === (tx.category || '').toLowerCase())?.color || '#64748b';
 const isIncome = tx.type === 'income';
 
 return (
 <div key={tx.id} className="group bg-slate-900/50 hover:bg-slate-800/80 border-white/5 p-4 flex items-center justify-between transition-all">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
 {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
 </div>
 <div>
 <h4 className="font-black text-sm uppercase tracking-tight text-slate-200">{tx.description}</h4>
 <div className="flex items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
 <span className="flex items-center gap-1"><Tag size={10} style={{color: catColor}}/> {tx.category}</span>
 <span className="flex items-center gap-1"><Calendar size={10}/> {tx.date.split('-').reverse().join('/')}</span>
 <span className={`flex items-center gap-1 ${tx.status === 'COMPLETED' ? 'text-emerald-500/70' : 'text-amber-500/70'}`}>
 {tx.status === 'COMPLETED' ? <CheckCircle2 size={10}/> : <Clock size={10}/>} 
 {tx.status === 'COMPLETED' ? 'Pago' : 'Pendente'}
 </span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-6">
 <span className={`text-lg font-black tracking-tighter ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
 {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
 </span>
 <button onClick={() => handleDelete(tx.id)} className="w-8 h-8 bg-rose-500/10 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all">
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-[#0f172a] w-full max-w-md border-white/10 overflow-hidden flex flex-col">
 
 <div className="p-6 border-white/5 flex justify-between items-center bg-white/5">
 <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
 <Plus size={16} className="text-indigo-400"/> Lançamento Rápido
 </h3>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
 </div>

 <div className="p-6 flex flex-col gap-5">
 <div className="flex bg-slate-900 rounded-xl p-1 border-white/5">
 <button 
 onClick={() => setFormData({...formData, type: 'expense'})} 
 className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.type === 'expense' ? 'bg-rose-500 text-white -rose-500/20' : 'text-slate-500 hover:text-rose-400'}`}
 >
 <ArrowDownRight size={14}/> Despesa
 </button>
 <button 
 onClick={() => setFormData({...formData, type: 'income'})} 
 className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.type === 'income' ? 'bg-emerald-500 text-white -emerald-500/20' : 'text-slate-500 hover:text-emerald-400'}`}
 >
 <ArrowUpRight size={14}/> Receita
 </button>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Valor (R$)</label>
 <input 
 type="number" 
 value={formData.amount || ''}
 onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
 className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 mt-1 text-lg font-black text-white focus:border-indigo-500 focus:bg-indigo-500/5 outline-none transition-all"
 placeholder="0.00"
 />
 </div>
 <div>
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Descrição</label>
 <input 
 type="text" 
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 mt-1 text-sm font-bold text-white focus:border-indigo-500 focus:bg-indigo-500/5 outline-none transition-all"
 placeholder="Ex: Mercado"
 />
 </div>
 </div>

 {/* BARRA DE ORÇAMENTO INTERATIVA */}
 {budgetStatus && budgetStatus.hasBudget && (
 <div className={`p-4 rounded-xl animate-in slide-in-from-top-2 flex items-start gap-4 transition-colors
 ${budgetStatus.isOver ? 'bg-rose-500/20 border-rose-500/50' : 
 budgetStatus.isWarning ? 'bg-amber-500/20 border-amber-500/50' : 
 'bg-indigo-500/10 border-indigo-500/30'}`}
 >
 {budgetStatus.isOver ? <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5 animate-pulse"/> : 
 budgetStatus.isWarning ? <Zap size={20} className="text-amber-400 shrink-0 mt-0.5 animate-pulse"/> :
 <CheckCircle2 size={20} className="text-indigo-400 shrink-0 mt-0.5"/>}
 
 <div className="flex-1">
 <div className="flex justify-between items-center mb-1.5">
 <h4 className={`text-[10px] font-black uppercase tracking-widest 
 ${budgetStatus.isOver ? 'text-rose-300' : budgetStatus.isWarning ? 'text-amber-300' : 'text-indigo-300'}`}>
 {budgetStatus.isOver ? 'Teto Ultrapassado!' : budgetStatus.isWarning ? 'Atenção ao Orçamento' : 'Orçamento Saudável'}
 </h4>
 <span className={`text-[10px] font-black ${budgetStatus.isOver ? 'text-rose-400' : budgetStatus.isWarning ? 'text-amber-400' : 'text-indigo-400'}`}>
 {budgetStatus.percent?.toFixed(0)}%
 </span>
 </div>
 
 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
 <div 
 className={`h-full transition-all duration-300 ${budgetStatus.isOver ? 'bg-rose-500' : budgetStatus.isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`}
 style={{ width: `${Math.min(budgetStatus.percent || 0, 100)}%` }}
 />
 </div>

 <div className="flex justify-between text-[9px] font-bold text-slate-300">
 <span>Projetado: {formatCurrency(budgetStatus.projectedTotal || 0)}</span>
 <span>Teto: {formatCurrency(budgetStatus.limit || 0)}</span>
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-3 gap-3">
 <div className="col-span-1">
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
 <select 
 value={formData.category}
 onChange={(e) => setFormData({...formData, category: e.target.value})}
 className="w-full bg-white/5 border-white/10 rounded-xl px-2 py-3 mt-1 text-[11px] font-bold text-white focus:border-indigo-500 outline-none appearance-none"
 >
 <option value="" disabled className="bg-slate-900">Selecione...</option>
 {categories.map(c => (
 <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>
 ))}
 </select>
 </div>
 
 <div className="col-span-1">
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Data</label>
 <input 
 type="date" 
 value={formData.date}
 onChange={(e) => setFormData({...formData, date: e.target.value})}
 className="w-full bg-white/5 border-white/10 rounded-xl px-2 py-3 mt-1 text-[11px] font-bold text-white focus:border-indigo-500 outline-none appearance-none cursor-text"
 />
 </div>

 <div className="col-span-1">
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Status</label>
 <select 
 value={formData.status}
 onChange={(e) => setFormData({...formData, status: e.target.value as any})}
 className={`w-full bg-white/5 border-white/10 rounded-xl px-2 py-3 mt-1 text-[11px] font-bold focus:border-indigo-500 outline-none appearance-none
 ${formData.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}
 >
 <option value="COMPLETED" className="bg-slate-900 text-white">✅ Efetuado</option>
 <option value="PENDING" className="bg-slate-900 text-white">⏳ Pendente</option>
 </select>
 </div>
 </div>

 </div>

 <div className="p-6 border-t border-white/5 bg-black/20">
 <button 
 onClick={handleSave}
 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all -indigo-500/20 active:scale-95"
 >
 Registrar Transação
 </button>
 </div>

 </div>
 </div>
 )}

 </div>
 );
}

