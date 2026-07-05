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
 status?: 'COMPLETED' | 'PENDING' | 'completed' | 'pending';
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
 const isCompleted = t.status === 'COMPLETED' || t.status === 'completed' || !t.status;
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
  <div className="h-full w-full flex flex-col gap-4 overflow-hidden font-sans p-2">
  
  {/* 🔝 CABEÇALHO */}
  <div className="flex justify-between items-center shrink-0">
  <div>
    <h2 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
      Extrato Realizado <CheckCircle2 size={16} className="text-emerald-400" />
    </h2>
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Listagem de transações finalizadas</p>
  </div>

  {/* Seletor de Mês (ESTILIZADO PREMIUM) */}
  <div className="relative flex items-center gap-2 p-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '12px' }}>
    <CalendarDays size={14} style={{ color: '#6C63FF' }} className="ml-2 pointer-events-none" />
    <input 
      type="month" 
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="bg-transparent pl-1 pr-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#00D4AA] outline-none border-none cursor-pointer [color-scheme:dark]"
    />
  </div>
  </div>

  {/* ⚡ CONTEÚDO PRINCIPAL */}
  <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 pb-2 overflow-hidden">
  
  {/* ESQUERDA: Resumo */}
  <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0 shrink-0">
  
    {/* Card Saldo */}
    <div className="p-6 relative overflow-hidden shrink-0"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
      <div className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${balance >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(255,71,87,0.12)'} 0%, transparent 70%)` }} />
      <p className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10" style={{ color: 'var(--text-muted)' }}>Resultado do Período</p>
      <h1 className="text-3xl font-black tracking-tighter relative z-10" style={{ color: balance >= 0 ? '#00D4AA' : '#FF4757' }}>
        {formatCurrency(balance)}
      </h1>
    </div>

    {/* Cards Entrada/Saída */}
    <div className="grid grid-cols-2 gap-4 shrink-0">
      <div className="p-4 flex flex-col justify-between"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <ArrowUpCircle size={12} style={{ color: '#00D4AA' }} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Entradas</span>
        </div>
        <p className="text-sm font-black" style={{ color: '#00D4AA' }}>{formatCurrency(income)}</p>
      </div>

      <div className="p-4 flex flex-col justify-between"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <ArrowDownCircle size={12} style={{ color: '#FF4757' }} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Saídas</span>
        </div>
        <p className="text-sm font-black" style={{ color: '#FF4757' }}>{formatCurrency(expense)}</p>
      </div>
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
          placeholder="BUSCAR TRANSAÇÃO..." 
          className="w-full pl-9 pr-3 py-2.5 text-[10px] font-black uppercase tracking-wider outline-none rounded-lg text-slate-900 dark:text-white"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
        />
      </div>
    </div>
  </div>

  {/* DIREITA: Lista */}
  <div className="col-span-12 md:col-span-8 p-5 flex flex-col min-h-0"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
      {filteredTransactions.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center opacity-40">
          <CheckCircle2 size={36} className="mb-3 text-slate-500" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Nenhuma transação no filtro atual
          </p>
        </div>
      ) : (
        filteredTransactions.map((t) => (
          <div key={t.id} className="group flex items-center justify-between p-3 transition-all hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 flex items-center justify-center shrink-0" 
                style={{ 
                  background: t.type === 'income' ? 'rgba(0,212,170,0.1)' : 'rgba(255,71,87,0.1)', 
                  borderRadius: '10px' 
                }}>
                {t.type === 'income' 
                  ? <ArrowUpRight size={16} style={{ color: '#00D4AA' }} /> 
                  : <ArrowDownRight size={16} style={{ color: '#FF4757' }} />
                }
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase truncate" style={{ maxWidth: '280px', color: 'var(--text-primary)' }}>
                  {t.description || 'SEM DESCRIÇÃO'}
                </h4>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  <span>{formatDate(t.date)}</span>
                  <span>•</span>
                  <span>{t.category || 'GERAL'}</span>
                  <span>•</span>
                  <span style={{ color: t.type === 'income' ? '#00D4AA' : '#FF4757' }}>
                    {t.type === 'income' ? 'RECEBIDO' : 'PAGO'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black" style={{ color: t.type === 'income' ? '#00D4AA' : '#FF4757' }}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                {t.installment && (
                  <p className="text-[7px] font-bold text-slate-600 uppercase tracking-wider">
                    Parcela {t.installment.current}/{t.installment.total}
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => handleDelete(t.id)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 size={13} />
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
