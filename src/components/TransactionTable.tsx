import React, { useState, useEffect } from 'react';
import { 
 Search, ArrowUpCircle, ArrowDownCircle, Trash2, 
 CheckCircle2, CalendarDays, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { appApi } from '../services/api';

interface Transaction {
 id: string;
 type: 'income' | 'expense';
 amount: number;
 description: string;
 category: string;
 date: string;
 status?: 'COMPLETED' | 'PENDING';
 installment?: { current: number; total: number };
}

export default function TransactionTable() {
 const { session } = useAuth();
 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

 // Carrega Dados do Backend/Offline
 useEffect(() => {
 const loadData = async () => {
 try {
 if (!session?.user?.id) return;
 const allTxs = await appApi.getTransactions(session.user.id);
 const validTxs = allTxs.filter((t: any) => t && t.date);
 
 validTxs.sort((a: any, b: any) => {
 const dateA = new Date(a.date).getTime() || 0;
 const dateB = new Date(b.date).getTime() || 0;
 return dateB - dateA;
 });
 
 setTransactions(validTxs as any);
 } catch (error) {
 console.error("Erro ao carregar transações:", error);
 setTransactions([]);
 }
 };
 if (session) loadData();
 }, [session]);

 const handleDelete = async (id: string) => {
 const updated = transactions.filter(t => t.id !== id);
 setTransactions(updated);
 await appApi.deleteTransaction(id);
 };

 // Filtra apenas PAGOS
 const filteredTransactions = transactions.filter(t => {
 const isCompleted = t.status === 'COMPLETED' || !t.status; 
 const desc = t.description ? t.description.toLowerCase() : '';
 const cat = t.category ? t.category.toLowerCase() : '';
 const search = searchTerm.toLowerCase();
 
 const matchesSearch = desc.includes(search) || cat.includes(search);
 const matchesMonth = t.date ? t.date.startsWith(selectedMonth) : false;
 
 return isCompleted && matchesSearch && matchesMonth;
 });

 // Cálculos do Mês
 const income = filteredTransactions
 .filter(t => t.type === 'income')
 .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

 const expense = filteredTransactions
 .filter(t => t.type === 'expense')
 .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

 const balance = income - expense;

 const formatCurrency = (val: number) => 
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

 const formatDate = (dateString: string) => {
 if (!dateString) return '--/--';
 const parts = dateString.split('-');
 if (parts.length < 3) return dateString;
 return `${parts[2]}/${parts[1]}`; 
 };

 return (
 <div className="h-full w-full flex flex-col gap-4 overflow-hidden font-sans">
 
 {/* 🔝 CABEÇALHO */}
 <div className="flex justify-between items-end shrink-0 px-2 h-[8%] min-h-[60px]">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="w-2 h-2 bg-cyan-500 animate-pulse"/>
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
 Banco de Dados
 </span>
 </div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
 Extrato Realizado <CheckCircle2 size={20} className="text-emerald-500" />
 </h2>
 </div>

 {/* Seletor de Mês (TRANSPARENTE E MINIMALISTA) */}
 <div className="relative group">
 <CalendarDays size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
 
 <input 
 type="month" 
 value={selectedMonth}
 onChange={(e) => setSelectedMonth(e.target.value)}
 className="bg-transparent pl-6 pr-2 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:text-white/60 dark:hover:text-white outline-none border-none cursor-pointer transition-colors dark:[color-scheme:dark]"
 />
 </div>
 </div>

 {/* ⚡ CONTEÚDO PRINCIPAL */}
 <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-4">
 
 {/* ESQUERDA: Resumo */}
 <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0">
 
 {/* Card Saldo */}
 <div className="p-6 relative overflow-hidden transition-all shrink-0 bg-white/5">
 <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 blur-3xl pointer-events-none" />
 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60 mb-2">Fluxo de Caixa (Mês)</p>
 <h1 className={`text-3xl font-black tracking-tighter ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
 {formatCurrency(balance)}
 </h1>
 </div>

 {/* Cards Entrada/Saída */}
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10">
 <div className="flex items-center gap-2 mb-1">
 <ArrowUpCircle size={14} className="text-emerald-500"/>
 <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Entrou</span>
 </div>
 <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(income)}</p>
 </div>
 <div className="p-4 bg-rose-50 dark:bg-rose-500/10">
 <div className="flex items-center gap-2 mb-1">
 <ArrowDownCircle size={14} className="text-rose-500"/>
 <span className="text-[8px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Saiu</span>
 </div>
 <p className="text-sm font-black text-rose-700 dark:text-rose-300">{formatCurrency(expense)}</p>
 </div>
 </div>

 {/* Busca */}
 <div className="flex-1 p-6 flex flex-col gap-4 min-h-0 bg-white/5">
 <div className="relative group">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Buscar..." 
 className="w-full pl-10 pr-4 py-3 text-xs font-bold uppercase outline-none transition-all bg-slate-50 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
 />
 </div>
 </div>
 </div>

 {/* DIREITA: Lista */}
 <div className="col-span-12 md:col-span-8 p-6 flex flex-col min-h-0 bg-white/5">
 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
 {filteredTransactions.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <CheckCircle2 size={40} className="mb-3 text-emerald-500/50" />
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">
 Nenhum pagamento registrado neste mês
 </p>
 </div>
 ) : (
 filteredTransactions.map((t) => (
 <div key={t.id} className="group flex items-center justify-between p-3 transition-all hover:bg-slate-100 dark:hover:bg-white/5">
 <div className="flex items-center gap-4">
 <div className={`w-10 h-10 flex items-center justify-center ${t.type === 'income' 
 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
 : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
 {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
 </div>

 <div>
 <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase flex items-center gap-2">
 {t.description || 'SEM DESCRIÇÃO'}
 </h4>
 <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
 <span>{formatDate(t.date)}</span>
 <span className="w-1 h-1 bg-slate-300 dark:bg-white/20" />
 <span>{t.category || 'GERAL'}</span>
 <span className="w-1 h-1 bg-slate-300 dark:bg-white/20" />
 <span className={t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>
 {t.type === 'income' ? 'REALIZADO' : 'PAGO'}
 </span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="text-right">
 <p className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
 {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
 </p>
 {t.installment && (
 <p className="text-[7px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-tighter">
 Parcela {t.installment.current}/{t.installment.total}
 </p>
 )}
 </div>
 
 <button 
 onClick={() => handleDelete(t.id)}
 className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:text-white/20 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
