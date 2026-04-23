import React, { useState, useEffect } from 'react';
import { 
 CalendarDays, ArrowUpCircle, ArrowDownCircle, CheckCircle2, 
 AlertCircle, Search, Calendar, Filter, BellRing
} from 'lucide-react';

interface Transaction {
 id: string;
 type: 'income' | 'expense';
 amount: number;
 description: string;
 category: string;
 date: string;
 status: 'COMPLETED' | 'PENDING';
 installment?: { current: number; total: number };
}

interface BillsManagerProps {
 mode?: 'normal' | 'overdue';
}

export default function BillsManager({ mode = 'normal' }: BillsManagerProps) {
 const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
 const [bills, setBills] = useState<Transaction[]>([]);
 const [searchTerm, setSearchTerm] = useState('');

 // Sincroniza aba padrao quando em modo overdue
 useEffect(() => {
 if (mode === 'overdue') setActiveTab('expense');
 }, [mode]);

 // Carrega e Filtra (Apenas PENDING) do novo Cofre PRO
 useEffect(() => {
 const loadData = () => {
 const saved = localStorage.getItem('vittacash_pro_transactions');
 if (saved) {
 const allTxs: Transaction[] = JSON.parse(saved);
 // Filtra apenas o que está Pendente
 const pending = allTxs.filter(t => t.status === 'PENDING');
 // Ordena por data (mais antigas/próximas primeiro)
 pending.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 setBills(pending);
 }
 };
 loadData();
 
 window.addEventListener('storage', loadData);
 return () => window.removeEventListener('storage', loadData);
 }, []);

 const handleMarkAsPaid = (id: string) => {
 const saved = localStorage.getItem('vittacash_pro_transactions');
 if (saved) {
 const allTxs: Transaction[] = JSON.parse(saved);
 const updatedTxs = allTxs.map(t => 
 t.id === id ? { ...t, status: 'COMPLETED' } : t
 );
 
 localStorage.setItem('vittacash_pro_transactions', JSON.stringify(updatedTxs));
 setBills(prev => prev.filter(b => b.id !== id));
 window.dispatchEvent(new Event('storage')); // Avisa o resto do app para atualizar
 }
 };

 const filteredBills = bills.filter(b => {
 let isMatch = b.type === activeTab && b.description.toLowerCase().includes(searchTerm.toLowerCase());
 if (!isMatch) return false;
 
 if (mode === 'overdue') {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return new Date(b.date) < today;
 }
 
 return true;
 });

 const totalValue = filteredBills.reduce((acc, b) => acc + b.amount, 0);

 const formatCurrency = (val: number) => 
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

 const formatDate = (dateString: string) => {
 const [year, month, day] = dateString.split('-');
 return `${day}/${month}`; 
 };

 const handleNotify = (bill: Transaction) => {
 const channel = localStorage.getItem('vittacash_notification_channel') || 'both';
 const phone = localStorage.getItem('vittacash_user_phone')?.replace(/\D/g, '') || '';
 const email = localStorage.getItem('vittacash_user_email') || '';

 const text = `Aviso VittaCash:\nA conta *${bill.description.toUpperCase()}* no valor de *${formatCurrency(bill.amount)}* venceu no dia ${formatDate(bill.date)}.`;
 
 const sendWhatsApp = () => {
 if (!phone) return alert('Cadastre o WhatsApp na aba Ajustes antes de notificar!');
 window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank');
 };

 const sendEmail = () => {
 if (!email) return alert('Cadastre o E-mail na aba Ajustes antes de notificar!');
 window.open(`mailto:${email}?subject=Alerta de Vencimento VittaCash&body=${encodeURIComponent(text)}`);
 };

 if (channel === 'whatsapp') { sendWhatsApp(); }
 else if (channel === 'email') { sendEmail(); }
 else {
 if (phone) sendWhatsApp();
 else sendEmail();
 }
 };

 return (
 <div className="h-full w-full flex flex-col gap-4 overflow-hidden font-sans">
 
 {/* 🔝 CABEÇALHO AJUSTADO */}
 <div className="flex justify-between items-end shrink-0 px-2 h-[8%] min-h-[60px]">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'expense' ? 'bg-rose-500 -rose-500/50' : 'bg-emerald-500 -emerald-500/50'} `}/>
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
 {mode === 'overdue' ? (
 <span className="text-rose-500 font-black animate-pulse">Alertas de Atraso Ativo</span>
 ) : (
 'Gestão de Vencimentos'
 )}
 </span>
 </div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
 {activeTab === 'expense' ? 'Contas a Pagar' : 'Valores a Receber'}
 {mode === 'overdue' && <span className="text-sm bg-rose-500/20 text-rose-500 px-3 py-1 rounded-lg ml-2">Atrasadas</span>}
 </h2>
 </div>

 {/* Toggle de Abas */}
 <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl ">
 <button 
 onClick={() => setActiveTab('expense')}
 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2
 ${activeTab === 'expense' 
 ? 'bg-white text-rose-600 dark:bg-rose-500 dark:text-white' 
 : 'text-slate-400 hover:text-rose-500 dark:text-white/40'}
 `}
 >
 <ArrowDownCircle size={12} /> A Pagar
 </button>
 <button 
 onClick={() => setActiveTab('income')}
 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2
 ${activeTab === 'income' 
 ? 'bg-white text-emerald-600 dark:bg-emerald-500 dark:text-white' 
 : 'text-slate-400 hover:text-emerald-500 dark:text-white/40'}
 `}
 >
 <ArrowUpCircle size={12} /> A Receber
 </button>
 </div>
 </div>

 {/* ⚡ CONTEÚDO PRINCIPAL */}
 <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-4">
 
 {/* COLUNA ESQUERDA: Resumo e Filtros */}
 <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0">
 {/* Card de Total */}
 <div className={`p-6 relative overflow-hidden group transition-all shrink-0
 bg-white/5
 `}>
 <div className={`absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-500
 ${activeTab === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}
 `} />
 
 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60 mb-2">Total Pendente</p>
 <h1 className={`text-3xl font-black tracking-tighter ${activeTab === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
 {formatCurrency(totalValue)}
 </h1>
 <p className="text-[9px] font-bold uppercase mt-2 text-slate-400 dark:text-white/30">
 {filteredBills.length} lançamentos futuros
 </p>
 </div>

 {/* Filtros / Busca */}
 <div className="flex-1 p-6 flex flex-col gap-4 min-h-0
 bg-white/5
 ">
 <div className="relative group shrink-0">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Buscar conta..." 
 className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold uppercase outline-none transition-all
 bg-slate-50  text-slate-600 
 dark:bg-white/5  dark:text-white 
 "
 />
 </div>
 
 {/* Dica Visual */}
 <div className="mt-auto p-4 rounded-xl bg-slate-50 dark:bg-white/5 flex gap-3 items-start overflow-hidden">
 <AlertCircle size={20} className="text-indigo-500 shrink-0 mt-0.5"/>
 <div>
 <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">Dica Pro</p>
 <p className="text-[9px] text-slate-500 dark:text-white/60 leading-relaxed">
 Use o botão ao lado da conta para confirmar o pagamento.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* COLUNA DIREITA: Lista de Contas */}
 <div className="col-span-12 md:col-span-8 p-6 flex flex-col min-h-0
 bg-white/5
 ">
 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
 {filteredBills.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center opacity-40">
 <CheckCircle2 size={40} className={`mb-3 ${activeTab === 'expense' ? 'text-rose-300' : 'text-emerald-300'}`} />
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">
 {searchTerm ? 'Nenhum resultado' : 'Tudo em dia por aqui!'}
 </p>
 </div>
 ) : (
 filteredBills.map((bill) => {
 const isOverdue = new Date(bill.date) < new Date() && new Date(bill.date).toDateString() !== new Date().toDateString();
 
 return (
 <div key={bill.id} className="group flex items-center justify-between p-3 rounded-2xl transition-all hover:scale-[1.01]
 bg-slate-50  hover:bg-white hover: dark:bg-white/5  dark:hover:bg-white/10 
 ">
 {/* Data e Ícone */}
 <div className="flex items-center gap-4">
 <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border
 ${isOverdue 
 ? 'bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400' 
 : 'bg-white  text-slate-500 dark:bg-white/5  dark:text-white/60'}
 `}>
 <span className="text-[9px] font-black uppercase">{formatDate(bill.date).split('/')[1]}</span> {/* Mês */}
 <span className="text-sm font-black">{formatDate(bill.date).split('/')[0]}</span> {/* Dia */}
 </div>
 
 <div>
 <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase mb-0.5">{bill.description}</h4>
 <div className="flex items-center gap-2">
 <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 px-1.5 py-0.5 rounded ">
 {bill.category}
 </span>
 {bill.installment && (
 <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded">
 {bill.installment.current}/{bill.installment.total}
 </span>
 )}
 {isOverdue && (
 <span className="text-[8px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 animate-pulse">
 Atrasado
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Valor e Ação */}
 <div className="flex items-center gap-2">
 <span className={`text-sm font-black mr-2 ${activeTab === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
 {formatCurrency(bill.amount)}
 </span>
 
 {isOverdue && (
 <button 
 onClick={() => handleNotify(bill)}
 title="Enviar Notificação"
 className="p-3 rounded-xl transition-all active:scale-95 bg-white border-indigo-100 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 dark:bg-white/5  dark:hover:bg-indigo-500"
 >
 <BellRing size={18} />
 </button>
 )}
 
 <button 
 onClick={() => handleMarkAsPaid(bill.id)}
 title={activeTab === 'expense' ? "Pagar Conta" : "Confirmar Recebimento"}
 className={`p-3 rounded-xl transition-all active:scale-95
 ${activeTab === 'expense'
 ? 'bg-white border-rose-100 text-rose-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:bg-white/5  dark:hover:bg-rose-500'
 : 'bg-white border-emerald-100 text-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:bg-white/5  dark:hover:bg-emerald-500'}
 `}
 >
 <CheckCircle2 size={18} />
 </button>
 </div>
 </div>
 )})
 )}
 </div>
 </div>

 </div>
 </div>
 );
}


