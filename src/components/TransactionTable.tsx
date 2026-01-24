import React from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { CheckCircle2, AlertCircle, Trash2, Pencil } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onPay?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void; // Nova prop
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions = [], onPay, onDelete, onEdit }) => {
  
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return <div className="text-center p-10 text-slate-400 font-bold text-sm uppercase">Nenhuma transação encontrada.</div>;
  }

  const isAtrasado = (date: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(date) < today;
  };

  const ehHistorico = transactions.every(tx => tx.status === TransactionStatus.COMPLETED);
  const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Agora mostra ações se tiver Pagar, Deletar OU Editar
  const mostrarAcoes = !!onPay || !!onDelete || !!onEdit;

  return (
    <div className="w-full">
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
          <thead>
            <tr className="border-b border-indigo-100 dark:border-slate-800 bg-indigo-50/80 dark:bg-slate-800/50">
              <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest rounded-l-xl">Descrição</th>
              <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest">{ehHistorico ? 'Previsto' : 'Valor'}</th>
              {ehHistorico && <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest">Pago</th>}
              {ehHistorico && <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest">Dif.</th>}
              <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest">Vencimento</th>
              <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest">Status</th>
              {mostrarAcoes && <th className="py-4 px-4 text-indigo-900 dark:text-indigo-200 text-[10px] font-black uppercase tracking-widest text-right rounded-r-xl">Ações</th>}
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((tx) => {
              const atrasado = tx.status === TransactionStatus.PENDING && isAtrasado(tx.date);
              const diff = (tx.paid_amount || 0) - tx.amount;
              const temDiferenca = ehHistorico && Math.abs(diff) > 0.01;
              
              const statusTexto = tx.status === TransactionStatus.COMPLETED
                ? (tx.type === TransactionType.INCOME ? 'Recebido' : 'Pago')
                : (atrasado ? 'Atrasado' : 'Pendente');

              return (
                <tr key={tx.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-200 font-bold text-xs">{tx.description}</span>
                       <div className="flex items-center gap-2">
                         {tx.category && <span className="text-[9px] text-indigo-500 font-black uppercase tracking-wider">{tx.category}</span>}
                         {tx.is_recurring && <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Recorrente</span>}
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-500 text-xs">
                    {formatarMoeda(tx.amount)}
                  </td>
                  {ehHistorico && (
                    <td className="py-4 px-4">
                      <span className={`font-black text-xs ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                        {formatarMoeda(tx.paid_amount || tx.amount)}
                      </span>
                    </td>
                  )}
                  {ehHistorico && (
                    <td className="py-4 px-4">
                      {temDiferenca ? (
                        <div className={`flex items-center gap-1 text-[10px] font-black ${diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {diff > 0 ? '+' : ''}{formatarMoeda(diff)}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">-</span>
                      )}
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-bold ${atrasado ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </span>
                        {atrasado && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[8px] uppercase font-black px-2 py-1 rounded-md border ${
                      tx.status === TransactionStatus.COMPLETED 
                      ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' 
                      : (atrasado ? 'text-rose-600 bg-rose-100 border-rose-200' : 'text-amber-600 bg-amber-100 border-amber-200')
                    }`}>
                      {statusTexto}
                    </span>
                  </td>
                  
                  {mostrarAcoes && (
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Pagar */}
                        {tx.status === TransactionStatus.PENDING && onPay && (
                          <button onClick={() => onPay(tx.id)} title="Pagar / Receber" className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Botão Editar (NOVO) */}
                        {onEdit && (
                          <button onClick={() => onEdit(tx)} title="Editar" className="p-2 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-90">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {/* Botão Excluir */}
                        {onDelete && (
                          <button onClick={() => onDelete(tx.id)} title="Excluir" className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90">
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
      </div>
    </div>
  );
};

export default TransactionTable;