import React, { useState } from 'react';
import { Investment } from '../types';
import { TrendingUp, Trash2, Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface Props {
  investments: Investment[];
  onAdd: (inv: any) => void; // 'any' para evitar conflito de nomes no payload
  onDelete: (id: string) => void;
}

const InvestmentsManager: React.FC<Props> = ({ investments, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [investedDisplay, setInvestedDisplay] = useState('');
  const [investedValue, setInvestedValue] = useState(0);
  const [currentDisplay, setCurrentDisplay] = useState('');
  const [currentValue, setCurrentValue] = useState(0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleCurrencyInput = (val: string, setDisplay: (v: string) => void, setValue: (v: number) => void) => {
    const raw = val.replace(/\D/g, '');
    const num = parseFloat(raw) / 100;
    setValue(num);
    setDisplay(raw ? formatCurrency(num) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && investedValue > 0) {
      // Enviamos 'name' e 'description' para garantir que um deles o banco aceite
      onAdd({ 
        name: name.toUpperCase(),
        description: name.toUpperCase(),
        invested_amount: investedValue, 
        current_amount: currentValue || investedValue 
      });
      setName(''); setInvestedDisplay(''); setCurrentDisplay('');
      setInvestedValue(0); setCurrentValue(0);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 p-2">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-3 mb-6 px-2 shrink-0">
         <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
            <TrendingUp size={22} />
         </div>
         <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Carteira de Ativos</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Patrimônio Investido</p>
         </div>
      </div>

      {/* FORMULÁRIO INLINE */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-6 mb-8 px-2 shrink-0">
         <input 
            type="text" placeholder="NOME DO ATIVO"
            className="flex-[2] w-full bg-transparent border-b-2 border-slate-200 dark:border-white/10 focus:border-blue-500 px-1 py-3 outline-none text-sm font-black text-slate-700 dark:text-white placeholder:text-slate-400 uppercase transition-all"
            value={name} onChange={(e) => setName(e.target.value)}
         />
         <input 
            type="text" placeholder="VALOR INVESTIDO"
            className="flex-1 w-full bg-transparent border-b-2 border-slate-200 dark:border-white/10 focus:border-blue-500 py-3 outline-none text-sm font-black text-slate-700 dark:text-white placeholder:text-slate-400 transition-all"
            value={investedDisplay} onChange={(e) => handleCurrencyInput(e.target.value, setInvestedDisplay, setInvestedValue)}
         />
         <input 
            type="text" placeholder="VALOR ATUAL"
            className="flex-1 w-full bg-transparent border-b-2 border-slate-200 dark:border-white/10 focus:border-blue-500 py-3 outline-none text-sm font-black text-slate-700 dark:text-white placeholder:text-slate-400 transition-all"
            value={currentDisplay} onChange={(e) => handleCurrencyInput(e.target.value, setCurrentDisplay, setCurrentValue)}
         />
         <button type="submit" className="w-full lg:w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all active:scale-95 shrink-0">
            <Plus size={24} />
         </button>
      </form>

      {/* LISTA EM LINHA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-100 dark:divide-white/5">
            {investments.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-2">
                    <Wallet size={40} className="text-slate-400" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sua carteira está vazia</p>
                </div>
            ) : (
                investments.map(inv => {
                    const profit = inv.current_amount - inv.invested_amount;
                    const isPositive = profit >= 0;
                    const percent = ((profit / inv.invested_amount) * 100).toFixed(2);
                    
                    // CORREÇÃO TS: Usa 'name' ou 'description' dinamicamente
                    const displayName = (inv as any).name || (inv as any).description || (inv as any).title || "ATIVO";

                    return (
                        <div key={inv.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-4 py-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-tight">{displayName}</h4>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ativo Financeiro</span>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-3 text-right">
                                <span className="text-xs font-bold text-slate-500">{formatCurrency(inv.invested_amount)}</span>
                            </div>

                            <div className="col-span-1 md:col-span-4 flex items-center justify-end gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(inv.current_amount)}</p>
                                    <p className={`text-[10px] font-black uppercase flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {isPositive ? '+' : ''}{percent}%
                                    </p>
                                </div>
                                <button 
                                    onClick={() => onDelete(inv.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentsManager;