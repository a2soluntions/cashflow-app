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
 const saved = localStorage.getItem('a2mentor_pro_transactions');
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
      
      const saved = localStorage.getItem('a2mentor_pro_transactions');
      if (saved) {
        const allTxs: Transaction[] = JSON.parse(saved);
        const updatedTxs = allTxs.map(t => t.id === originalId ? updatedTransaction : t);
        localStorage.setItem('a2mentor_pro_transactions', JSON.stringify(updatedTxs));
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
  <div className="min-h-full w-full flex flex-col gap-4 font-sans p-2">
   
   <CustomAlert 
     isOpen={errorAlert.isOpen}
     onClose={() => setErrorAlert(prev => ({ ...prev, isOpen: false }))}
     title={errorAlert.title}
     message={errorAlert.message}
     type="error"
   />

   {/* 🔝 CABEÇALHO */}
    <div className="flex justify-between items-center shrink-0">
    <div>
      <h2 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        {activeTab === 'expense' ? 'Contas a Pagar' : 'Valores a Receber'}
      </h2>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {mode === 'overdue' ? 'Alertas de Atraso Ativo' : 'Gestão de Vencimentos'}
      </p>
    </div>

    <div className="flex items-center gap-1 p-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '12px' }}>
      <button onClick={() => setActiveTab('expense')} 
        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
        style={{
          background: activeTab === 'expense' ? '#FF4757' : 'transparent',
          color: activeTab === 'expense' ? '#fff' : 'var(--text-muted)',
        }}>
        <ArrowDownCircle size={11} /> A Pagar
      </button>
      <button onClick={() => setActiveTab('income')} 
        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
        style={{
          background: activeTab === 'income' ? '#00D4AA' : 'transparent',
          color: activeTab === 'income' ? '#fff' : 'var(--text-muted)',
        }}>
        <ArrowUpCircle size={11} /> A Receber
      </button>
    </div>
    </div>

    {/* ⚡ CONTEÚDO PRINCIPAL */}
    <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 pb-2">
      <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0 shrink-0">
        
        {/* Card Resumo Valor */}
        <div className="p-6 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${activeTab === 'expense' ? 'rgba(255,71,87,0.12)' : 'rgba(0,212,170,0.12)'} 0%, transparent 70%)` }} />
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10" style={{ color: 'var(--text-muted)' }}>Total Pendente</p>
          <h1 className="text-3xl font-black tracking-tighter relative z-10" style={{ color: activeTab === 'expense' ? '#FF4757' : '#00D4AA' }}>
            {formatCurrency(totalValue)}
          </h1>
        </div>

        {/* Busca */}
        <div className="p-4 flex flex-col justify-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="BUSCAR CONTA..." 
              className="w-full pl-9 pr-3 py-2.5 text-[10px] font-black uppercase tracking-wider outline-none rounded-lg text-slate-900 dark:text-white" 
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
            />
          </div>
        </div>

        {/* Dica Pro */}
        <div className="p-4 flex gap-3 items-start border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)', borderRadius: '20px' }}>
          <AlertCircle size={16} style={{ color: '#6C63FF' }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] font-black uppercase mb-1" style={{ color: '#6C63FF' }}>Dica de Gestão</p>
            <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Confirme o pagamento de cada conta para registrá-las no histórico realizado.</p>
          </div>
        </div>
      </div>

      {/* DIREITA: Lista de Contas */}
      <div className="col-span-12 md:col-span-8 p-5 flex flex-col min-h-0"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {filteredBills.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <CheckCircle2 size={36} style={{ color: activeTab === 'expense' ? '#FF4757' : '#00D4AA' }} className="mb-3" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tudo em dia por aqui!</p>
            </div>
          ) : (
            filteredBills.map((bill) => {
              const isOverdue = new Date(bill.date) < new Date() && new Date(bill.date).toDateString() !== new Date().toDateString();
              return (
                <div key={bill.id} className="flex items-center justify-between p-3"
                  style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Calendário miniatura */}
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0"
                      style={{ 
                        background: isOverdue ? 'rgba(255,71,87,0.1)' : 'var(--bg-surface)', 
                        border: `1.5px solid ${isOverdue ? 'rgba(255,71,87,0.3)' : 'var(--bg-border)'}`, 
                        color: isOverdue ? '#FF4757' : 'var(--text-muted)' 
                      }}>
                      <span className="text-[8px] font-bold uppercase">{formatDate(bill.date).split('/')[1]}</span>
                      <span className="text-xs font-black">{formatDate(bill.date).split('/')[0]}</span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black uppercase truncate" style={{ maxWidth: '280px', color: 'var(--text-primary)' }}>{bill.description}</h4>
                      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest mt-0.5">
                        <span style={{ color: 'var(--text-muted)' }}>{bill.category}</span>
                        {isOverdue && (
                          <>
                            <span style={{ color: '#FF4757' }}>•</span>
                            <span style={{ color: '#FF4757' }} className="animate-pulse">ATRASADO</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black" style={{ color: activeTab === 'expense' ? '#FF4757' : '#00D4AA' }}>{formatCurrency(bill.amount)}</span>
                    <button onClick={() => handleOpenPayment(bill)} 
                      className="p-2 rounded-lg transition-all"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
       </div>
     </div>
   </div>

   {/* Modal de Pagamento */}
   {isPaymentModalOpen && selectedBill && (
     <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="w-full max-w-sm bg-[#10111A] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
         <div className="flex justify-between items-center mb-6">
           <h4 className="text-[#00D4AA] font-black uppercase tracking-widest text-[9px]">Confirmar Pagamento</h4>
           <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
         </div>

         <div className="space-y-4 mb-6">
           <div className="flex justify-between gap-3">
             <div className="flex-1 p-3 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
               <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Original</p>
               <p className="text-xs font-black text-white">{formatCurrency(selectedBill.amount)}</p>
             </div>
             {interestAmount > 0 && (
               <div className="flex-1 p-3 rounded-2xl border bg-rose-500/10 border-rose-500/20 animate-in slide-in-from-right-4 duration-300">
                 <p className="text-[8px] font-black uppercase text-[#FF4757] mb-1 flex items-center gap-1"><TrendingUp size={10}/> Juros (+{interestPercent.toFixed(1)}%)</p>
                 <p className="text-xs font-black text-[#FF4757]">+{formatCurrency(interestAmount)}</p>
               </div>
             )}
           </div>

           <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <label className="text-[9px] font-black uppercase text-slate-500 mb-1.5 block">Valor Total Pago</label>
             <div className="relative flex items-center">
               <span className="text-slate-500 font-bold text-sm absolute left-1">R$</span>
               <input 
                 type="text" 
                 autoFocus
                 value={totalPaid} 
                 onChange={(e) => setTotalPaid(e.target.value)} 
                 placeholder="0,00" 
                 className="w-full bg-transparent py-2 pl-7 text-lg font-black text-white outline-none" 
               />
             </div>
           </div>
           
           <p className="text-[7px] text-slate-500 font-bold uppercase italic text-center">
             * A transação será consolidada com o valor de {formatCurrency(currentTotalPaid)}
           </p>
         </div>

         <button disabled={isProcessing} onClick={handleConfirmPayment} 
           className="w-full py-3.5 text-black font-black uppercase text-[9px] tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
           style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
           {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
           {isProcessing ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
         </button>
       </div>
     </div>
   )}
  </div>
 );
}
