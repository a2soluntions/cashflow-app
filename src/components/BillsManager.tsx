import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { CalendarClock, CheckCircle2, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

interface BillsManagerProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onAddClick: () => void;
  onPay: (id: string) => void;
}

const BillsManager: React.FC<BillsManagerProps> = ({ transactions, onDelete, onEdit, onAddClick, onPay }) => {
  const [filter, setFilter] = useState<'all' | 'late' | 'today'>('all');
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const getFilteredBills = () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const sorted = [...localTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.filter(t => {
      const tDate = new Date(t.date + 'T12:00:00');
      if (filter === 'late') return tDate < today;
      if (filter === 'today') {
        return tDate.getDate() === today.getDate() && 
               tDate.getMonth() === today.getMonth() && 
               tDate.getFullYear() === today.getFullYear();
      }
      return true;
    });
  };

  const filteredBills = getFilteredBills();
  const totalValue = filteredBills.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
              <CalendarClock className="w-6 h-6 text-orange-600 dark:text-orange-500" />
           </div>
           <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">A Pagar</h2>
              <p className="text-xl font-black text-slate-900 dark:text-white">R$ {totalValue.toLocaleString()}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-black p-1.5 rounded-2xl">
           <div className="flex bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-1">
               <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filter === 'all' ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Todas</button>
               <button onClick={() => setFilter('today')} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filter === 'today' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>Hoje</button>
               <button onClick={() => setFilter('late')} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filter === 'late' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500' : 'text-slate-400 hover:text-orange-500'}`}>Atrasadas</button>
           </div>
           
           <button onClick={onAddClick} className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Adicionar Conta">
             <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
             <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-orange-50 dark:bg-orange-900/10 z-10 rounded-t-2xl">
                   <tr>
                      <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 rounded-tl-2xl">Descrição</th>
                      <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 hidden sm:table-cell">Categoria</th>
                      <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Vencimento</th>
                      <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 text-right">Valor</th>
                      <th className="py-4 px-4 w-[100px] rounded-tr-2xl"></th>
                   </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                   {filteredBills.map(t => {
                      const tDate = new Date(t.date + 'T12:00:00');
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const isLate = tDate < today;
                      const isToday = tDate.getTime() === today.getTime();

                      return (
                        <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                           <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl shrink-0 ${isLate ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                                    {isLate ? <AlertCircle className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                                 </div>
                                 <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{t.description}</span>
                              </div>
                           </td>
                           <td className="py-3 px-4 hidden sm:table-cell">
                              <span className="text-[10px] font-normal uppercase text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">{t.category}</span>
                           </td>
                           <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                 <span className={`text-xs font-normal ${isLate ? 'text-orange-500' : isToday ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {tDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                 </span>
                                 {isLate && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                              </div>
                           </td>
                           <td className="py-3 px-4 text-right">
                              <span className="font-medium text-sm text-slate-900 dark:text-white">R$ {t.amount.toLocaleString()}</span>
                           </td>
                           <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => onPay(t.id)} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 rounded-lg transition-colors" title="Pagar">
                                    <CheckCircle2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => onEdit(t)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => onDelete(t.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
             {filteredBills.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    {filter === 'all' ? 'Nenhuma conta encontrada.' : 
                     filter === 'today' ? 'Nenhuma conta para hoje.' : 'Nenhuma conta atrasada.'}
                </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default BillsManager;