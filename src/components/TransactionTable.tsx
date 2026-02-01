import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { Trash2, Edit2, Search, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Flame, ArrowDownCircle, Percent, Globe, Calendar } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];        // Lista filtrada (Mês/Busca)
  allTransactions?: Transaction[];    // Lista Global (Todas as transações)
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onPay?: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, allTransactions = [], onDelete, onEdit, onPay }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showGlobalStats, setShowGlobalStats] = useState(false); // Toggle Global/Atual

  // Filtra a lista principal (Geralmente a do mês)
  const filtered = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper para calcular estatísticas
  const calculateStats = (data: Transaction[]) => {
      const expenses = data.filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.COMPLETED);
      const totalPaid = expenses.reduce((acc, t) => acc + (t.paid_amount || t.amount), 0);
      
      const totalInterest = expenses.reduce((acc, t) => {
          const original = t.amount || 0;
          const paid = t.paid_amount || 0;
          return paid > original ? acc + (paid - original) : acc;
      }, 0);

      const percentInterest = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

      return { totalPaid, totalInterest, percentInterest };
  };

  // Calcula estatísticas para as duas visões
  const currentStats = useMemo(() => calculateStats(filtered), [filtered]);
  const globalStats = useMemo(() => calculateStats(allTransactions), [allTransactions]);

  // Define qual estatística mostrar
  const displayStats = showGlobalStats ? globalStats : currentStats;

  return (
    <div className="h-full flex flex-col gap-4">
      
      {/* --- CARDS DE RESUMO (COM TOGGLE) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            
            {/* Card 1: Total Saídas */}
            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-sm relative group">
                <button 
                    onClick={() => setShowGlobalStats(!showGlobalStats)} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white dark:bg-zinc-800 text-slate-400 hover:text-emerald-500 transition-all z-10 shadow-sm"
                    title={showGlobalStats ? "Ver Atual/Mês" : "Ver Global"}
                >
                    {showGlobalStats ? <Globe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                </button>
                <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{showGlobalStats ? "Saídas (Global)" : "Saídas (Atual)"}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">R$ {displayStats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-slate-400"><ArrowDownCircle className="w-5 h-5"/></div>
            </div>
            
            {/* Card 2: Total Juros */}
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-[2.5rem] border border-orange-100 dark:border-orange-500/20 flex items-center justify-between shadow-sm relative group">
                <button 
                    onClick={() => setShowGlobalStats(!showGlobalStats)} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white dark:bg-zinc-800 text-orange-400 hover:text-orange-600 transition-all z-10 shadow-sm"
                >
                    {showGlobalStats ? <Globe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                </button>
                <div>
                    <p className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest">{showGlobalStats ? "Juros (Global)" : "Juros (Atual)"}</p>
                    <p className="text-lg font-black text-orange-600 dark:text-orange-500">R$ {displayStats.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-orange-500"><Flame className="w-5 h-5"/></div>
            </div>

            {/* Card 3: % Juros */}
            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-sm relative group">
                <button 
                    onClick={() => setShowGlobalStats(!showGlobalStats)} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white dark:bg-zinc-800 text-slate-400 hover:text-emerald-500 transition-all z-10 shadow-sm"
                >
                    {showGlobalStats ? <Globe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                </button>
                <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">% Impacto</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{displayStats.percentInterest.toFixed(2)}%</p>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-slate-400"><Percent className="w-5 h-5"/></div>
            </div>
      </div>

      {/* --- BARRA DE BUSCA --- */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900/50 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shrink-0">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Buscar no histórico..." 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABELA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10 shadow-sm">
            <tr>
              <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 rounded-tl-2xl">Descrição</th>
              <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 hidden md:table-cell">Categoria</th>
              <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 hidden md:table-cell">Data</th>
              <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 hidden md:table-cell">Status</th>
              <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 text-right">Valor</th>
              {(onEdit || onDelete) && <th className="py-4 px-4 text-right rounded-tr-2xl w-[80px]"></th>}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {filtered.map((t) => {
                const originalAmount = t.amount || 0;
                const paidAmount = t.paid_amount || t.amount || 0;
                // Só calcula juros se for despesa E se pagou a mais
                const interest = t.type === TransactionType.EXPENSE && paidAmount > originalAmount ? paidAmount - originalAmount : 0;

                return (
                  <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          t.type === TransactionType.INCOME 
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                            : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500'
                        }`}>
                          {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-normal text-sm text-slate-700 dark:text-slate-200 truncate max-w-[140px] md:max-w-none">{t.description}</span>
                            {/* Data e Status visíveis só no mobile */}
                            <div className="md:hidden flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] text-slate-400">{t.category || 'Geral'}</span>
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-normal uppercase tracking-wider text-slate-500">
                        {t.category || 'Geral'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-normal text-slate-500 hidden md:table-cell">
                      {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                        {t.status === TransactionStatus.COMPLETED ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pago</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pendente</span>
                          </div>
                        )}
                    </td>
                    <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end">
                            <span className={`font-medium text-sm whitespace-nowrap ${
                              t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-500' : 'text-orange-600 dark:text-orange-500'
                            }`}>
                              {t.type === TransactionType.INCOME ? '+' : '-'} {paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            {/* EXIBIÇÃO DO JUROS NA LINHA */}
                            {interest > 0 && (
                                <span className="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 rounded flex items-center gap-1 mt-1">
                                    <Flame className="w-3 h-3"/> + {interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} juros
                                </span>
                            )}
                        </div>
                    </td>
                    
                    {(onEdit || onDelete) && (
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {t.status === TransactionStatus.PENDING && onPay && (
                            <button onClick={() => onPay(t.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg" title="Confirmar">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 font-medium">Nenhum lançamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;