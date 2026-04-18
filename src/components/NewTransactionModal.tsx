import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, ArrowUpCircle, ArrowDownCircle, 
  CreditCard, Wallet, Divide, X as Multiply, 
  Clock, Percent, AlertTriangle, Zap
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface Budget {
  id: string;
  category: string;
  limitAmount: number;
}

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: any[]) => void;
}

export default function NewTransactionModal({ isOpen, onClose, onSave }: NewTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [displayValue, setDisplayValue] = useState(''); 
  const [rawValue, setRawValue] = useState(0); 
  const [cashPrice, setCashPrice] = useState<number | ''>(''); 
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'installment'>('cash');
  const [installments, setInstallments] = useState<number>(2);
  const [amountType, setAmountType] = useState<'total' | 'installment'>('installment'); 

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // === A MÁGICA FOI CORRIGIDA AQUI ===
  // Agora o formulário lê exatamente o mesmo cofre que a página de categorias usa
  useEffect(() => {
    if (isOpen) {
      setCategories(JSON.parse(localStorage.getItem('vittacash_pro_categories') || '[]'));
      setBudgets(JSON.parse(localStorage.getItem('vittacash_pro_budgets') || '[]'));
      setAllTransactions(JSON.parse(localStorage.getItem('vittacash_pro_transactions') || '[]'));
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); 
    const numberValue = Number(value) / 100; 
    setRawValue(numberValue);
    setDisplayValue(numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const budgetStatus = useMemo(() => {
    if (type !== 'expense' || !selectedCategory || rawValue <= 0) return null;
    
    const targetCat = selectedCategory.trim().toLowerCase();
    const budget = budgets.find(b => (b.category || '').trim().toLowerCase() === targetCat);
    
    if (!budget) return null;

    const currentMonth = date.slice(0, 7);
    
    const alreadySpent = allTransactions
      .filter(t => t.type === 'expense' && (t.category || '').trim().toLowerCase() === targetCat && (t.date || '').startsWith(currentMonth))
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const projectedNewExpense = amountType === 'total' ? rawValue : rawValue * installments;
    const projectedTotal = alreadySpent + projectedNewExpense;
    
    const percent = (projectedTotal / budget.limitAmount) * 100;

    return {
      percent,
      isOver: percent > 100,
      isWarning: percent >= 80 && percent <= 100
    };
  }, [type, selectedCategory, rawValue, budgets, allTransactions, date, amountType, installments]);

  const calculateInterest = () => {
      if (paymentMethod === 'cash' || cashPrice === '' || rawValue === 0) return 0;
      let totalFinanced = amountType === 'total' ? rawValue : rawValue * installments;
      const interest = totalFinanced - Number(cashPrice);
      return interest > 0 ? interest : 0;
  };

  const handleSave = () => {
    if (!rawValue || !description || !selectedCategory) return;

    const generatedTransactions = [];
    const totalInterest = calculateInterest();
    const interestPerInstallment = totalInterest / installments;

    if (paymentMethod === 'cash') {
        generatedTransactions.push({
            id: Math.random().toString(),
            type,
            amount: rawValue,
            description: description.toUpperCase(),
            category: selectedCategory,
            date,
            status: 'COMPLETED',
            interest: 0,
            installment: null
        });
    } else {
        let finalInstallmentValue = amountType === 'total' ? rawValue / installments : rawValue; 

        for (let i = 0; i < installments; i++) {
            const futureDate = new Date(date);
            futureDate.setMonth(futureDate.getMonth() + i);
            
            generatedTransactions.push({
                id: Math.random().toString(),
                type,
                amount: finalInstallmentValue,
                description: `${description.toUpperCase()} (${i + 1}/${installments})`,
                category: selectedCategory,
                date: futureDate.toISOString().split('T')[0],
                status: 'PENDING',
                interest: interestPerInstallment,
                installment: { current: i + 1, total: installments }
            });
        }
    }

    onSave(generatedTransactions);
    
    setDisplayValue('');
    setRawValue(0);
    setCashPrice('');
    setDescription('');
    setSelectedCategory('');
    setPaymentMethod('cash');
    setInstallments(2);
    onClose();
  };

  if (!isOpen) return null;

  const activeColorClass = type === 'income' 
    ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-white'
    : 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500 dark:text-white';

  return (
    // O evento onClick no fundo escuro permite fechar clicando fora
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      
      {/* O stopPropagation impede que o clique dentro do modal feche ele */}
      <div 
        className={`relative w-full max-w-md rounded-[2.5rem] shadow-2xl border bg-white dark:bg-[#09090b] dark:border-white/10 ${type === 'income' ? 'shadow-emerald-500/20' : 'shadow-rose-500/20'}`}
        onClick={(e) => e.stopPropagation()}
      >
          
          {/* ÍCONE FLUTUANTE DE ALERTA GIGANTE */}
          {budgetStatus && (budgetStatus.isOver || budgetStatus.isWarning) && (
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-[#09090b] z-[110] transition-all duration-300
              ${budgetStatus.isOver 
                ? 'bg-rose-600 animate-[pulse_1s_infinite] scale-105' 
                : 'bg-amber-500 animate-bounce'}`}>
              
              {budgetStatus.isOver ? (
                <>
                  <AlertTriangle size={24} className="text-white mb-0.5" />
                  <span className="text-[9px] font-black text-white leading-none uppercase tracking-widest mt-1">Estourado</span>
                </>
              ) : (
                <>
                  <Zap size={24} className="text-white mb-0.5" />
                  <span className="text-[9px] font-black text-white leading-none uppercase tracking-widest mt-1">Atenção</span>
                </>
              )}
              
              <span className="text-xl font-black text-white leading-none mt-1 drop-shadow-md">
                {budgetStatus.percent.toFixed(0)}%
              </span>
            </div>
          )}

          {/* HEADER */}
          <div className={`px-6 py-5 flex justify-between items-center rounded-t-[2.5rem] relative overflow-hidden transition-colors duration-500 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <div className="relative z-10 text-white">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Novo Lançamento</h2>
                  <p className="text-xl font-black uppercase tracking-tight">{type === 'income' ? 'Entrada' : 'Saída'}</p>
              </div>
              <button onClick={onClose} className="relative z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                  <X size={18} strokeWidth={3} />
              </button>
          </div>

          <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* TIPO */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl">
                  <button onClick={() => setType('income')} className={`py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-lg dark:bg-emerald-500 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                      <ArrowUpCircle size={16} /> Receita
                  </button>
                  <button onClick={() => setType('expense')} className={`py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-lg dark:bg-rose-500 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                      <ArrowDownCircle size={16} /> Despesa
                  </button>
              </div>

              {/* SELETOR DE MODO DE CÁLCULO */}
              {paymentMethod === 'installment' && (
                  <div className="flex gap-2 justify-center pb-2 border-b border-slate-100 dark:border-white/5">
                      <button onClick={() => setAmountType('installment')} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${amountType === 'installment' ? (type === 'income' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'text-slate-400 border-slate-200 dark:border-white/10 dark:text-white/40 hover:bg-slate-100'}`}>
                          <Divide size={10} /> Por Parcela
                      </button>
                      <button onClick={() => setAmountType('total')} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${amountType === 'total' ? (type === 'income' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'text-slate-400 border-slate-200 dark:border-white/10 dark:text-white/40 hover:bg-slate-100'}`}>
                          <Multiply size={10} /> Valor Total
                      </button>
                  </div>
              )}

              {/* VALOR */}
              <div>
                  <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-slate-400 dark:text-white/40 mb-1 block">
                      {paymentMethod === 'cash' ? 'Valor Total' : (amountType === 'total' ? 'Valor Total Parcelado' : 'Valor da Parcela')}
                  </label>
                  <input type="text" value={displayValue} onChange={handleAmountChange} placeholder="R$ 0,00" className="w-full text-center py-4 rounded-2xl text-3xl font-black outline-none border transition-all bg-slate-50 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:border-indigo-500 dark:bg-white/5 dark:border-white/5 dark:text-white dark:placeholder:text-white/10 dark:focus:border-white/20" />
              </div>

              {/* CÁLCULO DE JUROS */}
              {paymentMethod === 'installment' && rawValue > 0 && (
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Percent size={14} className="text-orange-500"/>
                        <span className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400">Cálculo de Juros (Opcional)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 whitespace-nowrap">Se fosse à vista:</span>
                        <input 
                            type="number" 
                            placeholder="Digite o valor à vista..."
                            value={cashPrice}
                            onChange={(e) => setCashPrice(Number(e.target.value))}
                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold outline-none text-slate-700 dark:text-white"
                        />
                    </div>
                    {calculateInterest() > 0 && (
                        <p className="text-[9px] font-bold text-orange-500 mt-2 text-right">
                            Você está pagando <span className="underline decoration-2">{calculateInterest().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> de juros.
                        </p>
                    )}
                </div>
              )}

              {/* DESCRIÇÃO E DATA */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-slate-400 dark:text-white/40">Descrição</label>
                      <input type="text" value={description} onChange={(e) => setDescription(e.target.value.toUpperCase())} placeholder="EX: TV SMART" className="w-full pl-4 pr-3 py-3 rounded-xl text-xs font-bold uppercase outline-none border bg-slate-50 border-slate-100 text-slate-700 dark:bg-white/5 dark:border-white/5 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-slate-400 dark:text-white/40">Data Início</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-4 pr-3 py-3 rounded-xl text-xs font-bold outline-none border bg-slate-50 border-slate-100 text-slate-700 dark:bg-white/5 dark:border-white/5 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                  </div>
              </div>

              {/* FORMA DE PAGAMENTO */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <button onClick={() => { setPaymentMethod('cash'); setInstallments(1); setCashPrice(''); }} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'cash' ? activeColorClass : 'border-slate-100 text-slate-400 dark:border-white/5 dark:text-white/40'}`}>
                    <Wallet size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">À Vista</span>
                </button>
                <button onClick={() => { setPaymentMethod('installment'); setInstallments(2); }} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'installment' ? activeColorClass : 'border-slate-100 text-slate-400 dark:border-white/5 dark:text-white/40'}`}>
                    {type === 'income' ? <Clock size={18} /> : <CreditCard size={18} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{type === 'income' ? 'A Prazo' : 'Parcelado'}</span>
                </button>
              </div>

              {/* PARCELAS */}
              {paymentMethod === 'installment' && (
                  <div className="relative animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-slate-400 dark:text-white/40 mb-1 block">Qtd. Parcelas</label>
                      <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full pl-4 pr-4 py-3 rounded-xl text-xs font-bold outline-none border appearance-none bg-slate-50 border-slate-100 text-slate-700 dark:bg-white/5 dark:border-white/5 dark:text-white">
                        {Array.from({ length: 71 }, (_, i) => i + 2).map(num => (<option key={num} value={num} className="text-black">{num}x Meses</option>))}
                      </select>
                  </div>
              )}

              {/* CATEGORIA */}
              <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-slate-400 dark:text-white/40">Categoria</label>
                   <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                      {filteredCategories.length === 0 ? <div className="col-span-3 text-center py-2 opacity-50"><p className="text-[9px]">Sem categorias</p></div> : filteredCategories.map(cat => (
                          <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider border transition-all truncate ${selectedCategory === cat.name ? `bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-black` : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 dark:bg-white/5 dark:text-white/50 dark:border-white/5 dark:hover:bg-white/10'}`}>{cat.name}</button>
                      ))}
                   </div>
              </div>

              {/* BOTÕES DE AÇÃO (CANCELAR / CONFIRMAR) */}
              <div className="flex gap-3 mt-2">
                  <button 
                      onClick={onClose} 
                      className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  >
                      Cancelar
                  </button>
                  
                  <button 
                      onClick={handleSave} 
                      className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
                  >
                      <Check size={18} strokeWidth={3} /> {paymentMethod === 'installment' ? 'Confirmar Parcelamento' : 'Confirmar'}
                  </button>
              </div>

          </div>
      </div>
    </div>
  );
}