import React, { useState, useEffect } from 'react';
import { 
 ArrowUpCircle, ArrowDownCircle, CheckCircle2, 
 AlertCircle, Search, BellRing, X, Loader2, TrendingUp
} from 'lucide-react';
import { appApi } from '../services/api';
import { CustomAlert } from './CustomAlert';

interface Transaction {
 id: string;
 user_id?: string;
 type: 'income' | 'expense';
 amount: number;
 description: string;
 category: string;
 date: string;
 status: 'completed' | 'pending' | 'COMPLETED' | 'PENDING';
 installment?: { current: number; total: number };
 interest?: number;
}

interface BillsManagerProps {
 mode?: 'normal' | 'overdue';
}

export default function BillsManager({ mode = 'normal' }: BillsManagerProps) {
 const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
 const [bills, setBills] = useState<Transaction[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 
 // Estados do Modal de Pagamento
 const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
 const [selectedBill, setSelectedBill] = useState<Transaction | null>(null);
 const [totalPaid, setTotalPaid] = useState<string>('');
 const [isProcessing, setIsProcessing] = useState(false);

 // Estado para Alerta Customizado
 const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; title: string; message: string }>({
   isOpen: false,
   title: '',
   message: ''
 });

 useEffect(() => {
 if (mode === 'overdue') setActiveTab('expense');
 }, [mode]);

 const loadData = () => {
 const saved = localStorage.getItem('a2financas_pro_transactions');
 if (saved) {
 const allTxs: Transaction[] = JSON.parse(saved);
 const pending = allTxs.filter(t => t.status === 'PENDING' || t.status === 'pending');
 pending.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 setBills(pending);
 }
 };

 useEffect(() => {
 loadData();
 window.addEventListener('storage', loadData);
 return () => window.removeEventListener('storage', loadData);
 }, []);

 const handleOpenPayment = (bill: Transaction) => {
 setSelectedBill(bill);
 setTotalPaid(bill.amount.toString());
 setIsPaymentModalOpen(true);
 };

 // Cálculos Dinâmicos de Juros
 const originalAmount = selectedBill?.amount || 0;
 const currentTotalPaid = parseFloat(totalPaid.replace(',', '.')) || 0;
 const interestAmount = Math.max(currentTotalPaid - originalAmount, 0);
 const interestPercent = originalAmount > 0 ? (interestAmount / originalAmount) * 100 : 0;

  const handleConfirmPayment = async () => {
    if (!selectedBill) return;
    
    setIsProcessing(true);
    const originalId = selectedBill.id;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Cálculo de dias de atraso e formatação da tag com juros
    let delayTag = "";
    if (selectedBill.date) {
      const due = new Date(selectedBill.date);
      const diffTime = now.getTime() - due.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 || interestAmount > 0) {
        const interestText = interestAmount > 0 ? ` | R$ ${interestAmount.toFixed(2)} juros` : "";
        delayTag = `(${diffDays > 0 ? diffDays : 0} d atraso${interestText}) `;
      }
    }

    // 1. Prepara o objeto atualizado
    const updatedTransaction = {
      ...selectedBill,
      status: 'completed' as any,
      interest: Number(interestAmount || 0),
      amount: Number(currentTotalPaid || 0),
      date: todayStr,
      description: delayTag + selectedBill.description
    };

    try {
      // 2. ATUALIZAÇÃO OTIMISTA (Local)
      setBills(prev => prev.filter(b => b.id !== originalId));
      
      const saved = localStorage.getItem('a2financas_pro_transactions');
      if (saved) {
        const allTxs: Transaction[] = JSON.parse(saved);
        const updatedTxs = allTxs.map(t => t.id === originalId ? updatedTransaction : t);
        localStorage.setItem('a2financas_pro_transactions', JSON.stringify(updatedTxs));
      }

      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      window.dispatchEvent(new Event('storage'));

      // 3. SINCRONIZAÇÃO COM O BANCO (Com campos limpos)
      const dbPayload = {
        id: updatedTransaction.id,
        amount: updatedTransaction.amount,
        status: 'completed',
        description: updatedTransaction.description,
        category: updatedTransaction.category,
        date: updatedTransaction.date, // Data de hoje no banco
        type: updatedTransaction.type
      };

      await appApi.updateTransaction(dbPayload as any);
      
    } catch (error) {
      console.error("Erro ao sincronizar com o banco, mas mantido localmente:", error);
      // Se falhar a rede, o ApiService já deve ter jogado pra fila offline.
      // Não voltamos a conta pra tela para não confundir o usuário.
    } finally {
      setIsProcessing(false);
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
 const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 const formatDate = (dateString: string) => {
 const [year, month, day] = dateString.split('-');
 return `${day}/${month}`; 
 };

 return (
 <div className="min-h-full w-full flex flex-col gap-4 font-sans">
  
  <CustomAlert 
    isOpen={errorAlert.isOpen}
    onClose={() => setErrorAlert(prev => ({ ...prev, isOpen: false }))}
    title={errorAlert.title}
    message={errorAlert.message}
    type="error"
  />

  <div className="flex justify-between items-end shrink-0 px-2 h-[8%] min-h-[60px]">
  <div>
  <div className="flex items-center gap-2 mb-1">
  <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'expense' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} `}/>
  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
  {mode === 'overdue' ? 'Alertas de Atraso Ativo' : 'Gestão de Vencimentos'}
  </span>
  <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 ml-2">v2.9</span>
  </div>
  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
  {activeTab === 'expense' ? 'Contas a Pagar' : 'Valores a Receber'}
  </h2>
  </div>

  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl ">
  <button onClick={() => setActiveTab('expense')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'expense' ? 'bg-white text-rose-600 dark:bg-rose-500 dark:text-white shadow-lg' : 'text-slate-400 dark:text-white/40'}`}><ArrowDownCircle size={12} /> A Pagar</button>
  <button onClick={() => setActiveTab('income')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'income' ? 'bg-white text-emerald-600 dark:bg-emerald-500 dark:text-white shadow-lg' : 'text-slate-400 dark:text-white/40'}`}><ArrowUpCircle size={12} /> A Receber</button>
  </div>
  </div>

  <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-4">
  <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0">
  <div className={`p-6 relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl`}>
  <div className={`absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-20 ${activeTab === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Pendente</p>
  <h1 className={`text-3xl font-black tracking-tighter ${activeTab === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatCurrency(totalValue)}</h1>
  </div>

  <div className="flex-1 p-6 flex flex-col gap-4 min-h-0 bg-white/5 border border-white/5 rounded-2xl">
  <div className="relative group shrink-0">
  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar conta..." className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold uppercase bg-slate-50 dark:bg-white/5 dark:text-white outline-none" />
  </div>
  <div className="mt-auto p-4 rounded-xl bg-indigo-500/10 flex gap-3 items-start border border-indigo-500/20">
  <AlertCircle size={20} className="text-indigo-500 mt-0.5"/>
  <div><p className="text-[9px] font-black uppercase text-indigo-500 mb-1">Dica Pro</p><p className="text-[9px] text-slate-500 dark:text-white/60 leading-relaxed">Confirme o pagamento para mover ao histórico.</p></div>
  </div>
  </div>
  </div>

  <div className="col-span-12 md:col-span-8 p-6 flex flex-col min-h-0 bg-white/5 border border-white/5 rounded-2xl">
  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
  {filteredBills.length === 0 ? (
  <div className="h-full flex flex-col items-center justify-center opacity-40">
  <CheckCircle2 size={40} className={`mb-3 ${activeTab === 'expense' ? 'text-rose-300' : 'text-emerald-300'}`} />
  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tudo em dia!</p>
  </div>
  ) : (
  filteredBills.map((bill) => {
  const isOverdue = new Date(bill.date) < new Date() && new Date(bill.date).toDateString() !== new Date().toDateString();
  return (
  <div key={bill.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
  <div className="flex items-center gap-4">
  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${isOverdue ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/5 text-white/60'}`}>
  <span className="text-[9px] font-black uppercase">{formatDate(bill.date).split('/')[1]}</span>
  <span className="text-sm font-black">{formatDate(bill.date).split('/')[0]}</span>
  </div>
  <div>
  <h4 className="text-xs font-black text-white uppercase mb-0.5">{bill.description}</h4>
  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">{bill.category}</span>
  {isOverdue && <span className="ml-2 text-[8px] font-black uppercase text-rose-400 animate-pulse">Atrasado</span>}
  </div>
  </div>
  <div className="flex items-center gap-2">
  <span className={`text-sm font-black mr-2 ${activeTab === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(bill.amount)}</span>
  <button onClick={() => handleOpenPayment(bill)} className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-black transition-all"><CheckCircle2 size={18} /></button>
  </div>
  </div>
  );
  })
  )}
  </div>
  </div>
  </div>

  {isPaymentModalOpen && selectedBill && (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
  <div className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
  <div className="flex justify-between items-center mb-6">
  <h4 className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Confirmar Pagamento</h4>
  <button onClick={() => setIsPaymentModalOpen(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
  </div>

  <div className="space-y-5 mb-8">
  <div className="flex justify-between gap-3">
  <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/5">
  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Original</p>
  <p className="text-xs font-black text-white">{formatCurrency(selectedBill.amount)}</p>
  </div>
  {interestAmount > 0 && (
  <div className="flex-1 p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 animate-in slide-in-from-right-4 duration-300">
  <p className="text-[8px] font-black uppercase text-rose-500 mb-1 flex items-center gap-1"><TrendingUp size={10}/> Juros (+{interestPercent.toFixed(1)}%)</p>
  <p className="text-xs font-black text-rose-500">+{formatCurrency(interestAmount)}</p>
  </div>
  )}
  </div>

  <div className="p-5 bg-black border border-white/5 rounded-2xl">
  <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Quanto você pagou no total?</label>
  <div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
  <input 
  type="text" 
  autoFocus
  value={totalPaid} 
  onChange={(e) => setTotalPaid(e.target.value)} 
  placeholder="0,00" 
  className="w-full bg-transparent p-4 pl-12 text-xl font-black text-white outline-none" 
  />
  </div>
  </div>
  
  <p className="text-[8px] text-slate-500 font-bold uppercase italic text-center">
  * O histórico será registrado com o valor de {formatCurrency(currentTotalPaid)}
  </p>
  </div>

  <button disabled={isProcessing} onClick={handleConfirmPayment} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2">
  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
  {isProcessing ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
  </button>
  </div>
  </div>
  )}
 </div>
 );
}
