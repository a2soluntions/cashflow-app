import React from 'react';
import { CalendarClock, CheckCircle2, AlertTriangle, Clock, Trash2, Edit3, DollarSign, Plus, Calculator } from 'lucide-react';
import { Transaction } from '../types';

interface BillsManagerProps {
  transactions: Transaction[];
  onPay: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

const BillsManager: React.FC<BillsManagerProps> = ({ transactions, onPay, onEdit, onDelete, onAddClick }) => {
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatus = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billDate = new Date(dateString);
    billDate.setMinutes(billDate.getMinutes() + billDate.getTimezoneOffset());
    billDate.setHours(0, 0, 0, 0);

    if (billDate.getTime() < today.getTime()) return 'overdue';
    if (billDate.getTime() === today.getTime()) return 'today';
    return 'future';
  };

  const getRemainingDebt = (description: string, currentAmount: number) => {
      const match = description.match(/\((\d+)\/(\d+)\)/);
      if (match) {
          const currentInst = parseInt(match[1]);
          const totalInst = parseInt(match[2]);
          const remainingInst = totalInst - currentInst + 1; 
          const totalRemaining = currentAmount * remainingInst;
          
          if (remainingInst > 1) {
              return (
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md w-fit">
                      <Calculator className="w-3 h-3" />
                      <span>Restam: R$ {totalRemaining.toLocaleString('pt-BR')} ({remainingInst}x)</span>
                  </div>
              );
          }
      }
      return null;
  };

  const totalPending = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden p-1">
      
      {/* HEADER FIXO - Não rola com a lista */}
      <div className="bg-slate-900 rounded-3xl p-6 shadow-lg shrink-0 flex items-center justify-between relative overflow-hidden z-10">
          <div className="relative z-10">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Pendente</span>
              <h2 className="text-2xl font-black text-white tracking-tighter mt-1">
                  R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
          </div>
          <button onClick={onAddClick} className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2 z-10">
              <Plus className="w-5 h-5" />
              <span className="text-xs font-black uppercase hidden sm:inline">Nova Conta</span>
          </button>
          
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-20 p-3 bg-indigo-500/10 rounded-2xl rotate-12">
              <CalendarClock className="w-12 h-12 text-indigo-500/20" />
          </div>
      </div>

      {/* LISTA DE CONTAS - Apenas esta parte rola agora */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0 space-y-2 pr-1">
        {sortedTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500" />
                <p className="font-bold text-sm">Tudo pago!</p>
            </div>
        ) : (
            sortedTransactions.map((tx) => {
                const status = getStatus(tx.date);
                const config = {
                    overdue: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-l-4 border-l-rose-500', icon: AlertTriangle },
                    today: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-l-4 border-l-amber-500', icon: Clock },
                    future: { text: 'text-indigo-500', bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-l-4 border-l-indigo-500', icon: CalendarClock },
                }[status];

                const Icon = config.icon;
                const formattedDate = new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR');

                return (
                    <div key={tx.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 ${config.border} hover:translate-x-1 transition-transform gap-3`}>
                        
                        {/* Esquerda: Info */}
                        <div className="flex items-start gap-3 overflow-hidden w-full">
                            <div className={`p-2 rounded-lg ${config.bg} ${config.text} shrink-0 mt-1`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{tx.description}</h4>
                                    <span className={`sm:hidden text-[10px] font-bold ${config.text}`}>{formattedDate}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold bg-slate-50 dark:bg-slate-800 px-1.5 rounded">{tx.category}</span>
                                    <span className="hidden sm:inline text-[10px] text-slate-300">•</span>
                                    <span className={`hidden sm:inline text-[10px] font-bold ${config.text}`}>{formattedDate}</span>
                                </div>
                                {getRemainingDebt(tx.description, tx.amount)}
                            </div>
                        </div>

                        {/* Direita: Valor + Ações */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
                            <span className="font-black text-sm text-slate-700 dark:text-slate-200">
                                R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            
                            <div className="flex items-center gap-1">
                                <button onClick={() => onPay(tx.id)} title="Pagar" className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wide">
                                    <DollarSign className="w-3 h-3" /> Pagar
                                </button>
                                <button onClick={() => onEdit(tx)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDelete(tx.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default BillsManager;