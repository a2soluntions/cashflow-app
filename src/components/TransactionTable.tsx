import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { Trash2, Edit2, Search, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onPay?: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit, onPay }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 bg-slate-100 dark:bg-zinc-900/50 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shrink-0">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Buscar no histórico..." 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-orange-50 dark:bg-orange-900/10 z-10 shadow-sm backdrop-blur-sm">
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
            {filtered.map((t) => (
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
                <td className={`py-4 px-4 text-right font-medium text-sm whitespace-nowrap ${
                  t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-500' : 'text-orange-600 dark:text-orange-500'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            ))}
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