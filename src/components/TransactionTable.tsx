import React from 'react';
import { Trash2, Edit3, DollarSign, ArrowUpCircle, ArrowDownCircle, Calendar, Tag } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onPay?: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit, onPay }) => {
  
  if (transactions.length === 0) {
    return (
      <div className="h-full w-full bg-white dark:bg-slate-900/40 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
            <Tag className="w-8 h-8" />
        </div>
        <p className="font-bold text-sm uppercase tracking-widest">Sem registros</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* CABEÇALHO FIXO - NÃO ROLA */}
      <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm shrink-0 items-center">
          <div className="col-span-6 sm:col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descrição</div>
          <div className="hidden sm:block sm:col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</div>
          <div className="hidden sm:block sm:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</div>
          <div className="col-span-4 sm:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</div>
          <div className="col-span-2 sm:col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</div>
      </div>

      {/* LISTA ROLÁVEL */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="grid grid-cols-12 gap-4 p-3 mb-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center group border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
              
              {/* Descrição */}
              <div className="col-span-6 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl shrink-0 ${tx.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {tx.type === TransactionType.INCOME ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 sm:hidden flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
              </div>

              {/* Categoria */}
              <div className="hidden sm:block sm:col-span-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {tx.category}
                </span>
              </div>

              {/* Data */}
              <div className="hidden sm:block sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Valor */}
              <div className={`col-span-4 sm:col-span-2 text-right font-black text-sm whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {tx.type === TransactionType.EXPENSE ? '- ' : '+ '}
                R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              {/* Ações */}
              <div className="col-span-2 sm:col-span-1 flex justify-center">
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {onPay && (
                        <button onClick={() => onPay(tx.id)} title="Pagar" className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition-colors">
                            <DollarSign className="w-4 h-4" />
                        </button>
                    )}
                    {onEdit && (
                        <button onClick={() => onEdit(tx)} title="Editar" className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(tx.id)} title="Excluir" className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TransactionTable;