import React, { useState, useEffect, useMemo } from 'react';
import { 
 X, Check, ArrowUpCircle, ArrowDownCircle, 
 CreditCard, Wallet, Divide, X as Multiply, 
 Clock, Percent, AlertTriangle, Zap, MessageSquare
} from 'lucide-react';
import { CustomAlert } from './CustomAlert';

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
 isLimitReached?: boolean;
 theme?: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange';
}

export default function NewTransactionModal({ isOpen, onClose, onSave, isLimitReached = false, theme = 'blue' }: NewTransactionModalProps) {
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
 const [showSuccess, setShowSuccess] = useState(false);
 const [sendToWhatsApp, setSendToWhatsApp] = useState(false);
 const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

 const isLight = theme === 'white' || theme === 'white-orange';

 useEffect(() => {
 if (isOpen) {
  const savedCats = JSON.parse(localStorage.getItem('a2financas_pro_categories') || '[]');
  if (savedCats.length > 0) {
  setCategories(savedCats);
  } else {
  setCategories([
  { id: '1', name: 'Alimentação', color: '#f59e0b' },
  { id: '2', name: 'Moradia', color: '#3b82f6' },
  { id: '3', name: 'Lazer', color: '#ec4899' },
  { id: '4', name: 'Salário', color: '#10b981' },
  { id: '5', name: 'Investimentos', color: '#8b5cf6' }
  ] as any[]);
  }
 setBudgets(JSON.parse(localStorage.getItem('a2financas_pro_budgets') || '[]'));
 setAllTransactions(JSON.parse(localStorage.getItem('a2financas_pro_transactions') || '[]'));
 // Reset whatsapp toggle on open
 setSendToWhatsApp(false);
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

 const handleSave = () => {
 if (!rawValue || !description || !selectedCategory) {
  setErrorAlert({
    isOpen: true,
    title: 'Campos Incompletos',
    message: 'Por favor, preencha o valor, a descrição e selecione uma categoria para prosseguir.'
  });
  return;
 }

 const generatedTransactions = [];

 if (paymentMethod === 'cash') {
 generatedTransactions.push({
 id: crypto.randomUUID(),
 type,
 amount: rawValue,
 description: description.toUpperCase(),
 category: selectedCategory,
 date,
 status: 'completed'
 });
 } else {
 let finalInstallmentValue = amountType === 'total' ? rawValue / installments : rawValue; 

 for (let i = 0; i < installments; i++) {
 const futureDate = new Date(date);
 futureDate.setMonth(futureDate.getMonth() + i);
 
 generatedTransactions.push({
 id: crypto.randomUUID(),
 type,
 amount: finalInstallmentValue,
 description: `${description.toUpperCase()} (${i + 1}/${installments})`,
 category: selectedCategory,
 date: futureDate.toISOString().split('T')[0],
 status: 'pending'
 });
 }
 }

 onSave(generatedTransactions);
 
 // Feedback visual do sistema
 setShowSuccess(true);

 // --- AUTOMAÇÃO WHATSAPP (OPCIONAL) ---
 if (sendToWhatsApp) {
   const savedPhone = localStorage.getItem('a2financas_user_phone');
   if (savedPhone) {
     const cleanPhone = savedPhone.replace(/\D/g, '');
     const formattedAmount = rawValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
     const typeLabel = type === 'income' ? '🟢 ENTRADA' : '🔴 SAÍDA';
     const checkEmoji = '✅';
     
     const messageText = 
       `*A2Finanças - Alerta de Lançamento*\n\n` +
       `*Tipo:* ${typeLabel}\n` +
       `*Identificação:* ${description.toUpperCase()}\n` +
       `*Valor:* ${formattedAmount}\n` +
       `*Data:* ${new Date(date).toLocaleDateString('pt-BR')}\n\n` +
       `${checkEmoji} Registro realizado com sucesso no seu Cockpit.`;
     
     window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
   }
 }

 setTimeout(() => {
   setDisplayValue('');
   setRawValue(0);
   setCashPrice('');
   setDescription('');
   setSelectedCategory('');
   setPaymentMethod('cash');
   setInstallments(2);
   setShowSuccess(false);
   onClose();
 }, 1500);
 };

 if (!isOpen) return null;

 return (
 <div 
 className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/40' : theme === 'blue' ? 'bg-[#1023FF]/40' : 'bg-[#000001]/80'}`}
 onClick={onClose}
 >
 
 <CustomAlert 
   isOpen={errorAlert.isOpen}
   onClose={() => setErrorAlert(prev => ({ ...prev, isOpen: false }))}
   title={errorAlert.title}
   message={errorAlert.message}
   type="warning"
 />

 <div 
 className={`relative w-full max-w-md border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 backdrop-blur-2xl border-white/10'}`}
 onClick={(e) => e.stopPropagation()}
 >
 
 {showSuccess && (
   <div className="absolute inset-0 z-[200] bg-brand-green flex flex-col items-center justify-center text-black animate-in fade-in duration-300">
     <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
       <Check size={48} strokeWidth={4} />
     </div>
     <h3 className="text-xl font-black uppercase italic tracking-tighter">Lançado com Sucesso!</h3>
     <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-70">Sincronizando com o Cockpit...</p>
   </div>
 )}

 {/* ALERTA DE ORÇAMENTO */}
 {budgetStatus && (budgetStatus.isOver || budgetStatus.isWarning) && (
 <div className={`absolute right-0 top-0 px-4 py-1 z-[110] flex items-center gap-2
 ${budgetStatus.isOver ? 'bg-brand-orange' : 'bg-amber-500'}`}>
 {budgetStatus.isOver ? <AlertTriangle size={12} className="text-white" /> : <Zap size={12} className="text-white" />}
 <span className="text-[9px] font-black text-white uppercase tracking-widest">
 {budgetStatus.percent.toFixed(0)}% DO TETO
 </span>
 </div>
 )}

 {/* HEADER */}
 <div className={`px-8 py-5 border-b bg-black/5 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
 <div className="flex justify-between items-start">
 <div>
 <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Cofre de Lançamento</h2>
 <p className={`text-2xl font-black uppercase italic tracking-tighter ${type === 'income' ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-rose-600' : 'text-rose-400')}`}>
 {type === 'income' ? 'Receita' : 'Despesa'}
 </p>
 </div>
 <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}>
 <X size={18} strokeWidth={3} />
 </button>
 </div>
 </div>

 <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
 
 {/* TIPO DE OPERAÇÃO */}
 <div className="grid grid-cols-2 gap-3">
 <button 
 onClick={() => setType('income')} 
 className={`py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border
 ${type === 'income' ? 'bg-brand-green border-brand-green/50 text-white' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/40 hover:bg-black/40')}`}
 >
 <ArrowUpCircle size={16} /> Entrada
 </button>
 <button 
 onClick={() => setType('expense')} 
 className={`py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border
 ${type === 'expense' ? 'bg-brand-orange border-brand-orange/50 text-white' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/40 hover:bg-black/40')}`}
 >
 <ArrowDownCircle size={16} /> Saída
 </button>
 </div>

 {/* VALOR PRINCIPAL */}
 <div className="space-y-1">
 <label className={`text-[9px] font-black uppercase tracking-[0.2em] block ml-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
 {paymentMethod === 'cash' ? 'Montante Total' : (amountType === 'total' ? 'Montante Parcelado' : 'Valor da Parcela')}
 </label>
 <div className="relative group">
 <input 
 type="text" 
 value={displayValue} 
 onChange={handleAmountChange} 
 placeholder="R$ 0,00" 
 className={`w-full text-left px-5 py-4 border text-3xl font-black outline-none transition-all focus:border-brand-blue/50 ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-200' : 'bg-black/40 border-white/10 text-white placeholder:text-white/5'}`} 
 />
 </div>
 </div>

 {/* DESCRIÇÃO E DATA */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Identificação</label>
 <input 
 type="text" 
 value={description} 
 onChange={(e) => setDescription(e.target.value.toUpperCase())} 
 placeholder="EX: INVESTIMENTO" 
 className={`w-full px-4 py-3 border text-xs font-bold uppercase outline-none focus:border-brand-blue/50 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/20 border-white/5 text-white'}`} 
 />
 </div>
 <div className="space-y-1">
 <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Data de Início</label>
 <input 
 type="date" 
 value={date} 
 onChange={(e) => setDate(e.target.value)} 
 className={`w-full px-4 py-3 border text-xs font-bold outline-none focus:border-brand-blue/50 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-700 [color-scheme:light]' : 'bg-black/20 border-white/5 text-white [color-scheme:dark]'}`} 
 />
 </div>
 </div>

 {/* FORMA DE PAGAMENTO */}
 <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
 <button 
 onClick={() => { setPaymentMethod('cash'); setInstallments(1); setCashPrice(''); }} 
 className={`p-4 border transition-all flex flex-col items-center justify-center gap-1
 ${paymentMethod === 'cash' ? 'bg-brand-blue border-brand-blue/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/30 hover:bg-black/40')}`}
 >
 <Wallet size={18} />
 <span className="text-[9px] font-black uppercase tracking-widest">À Vista</span>
 </button>
 <button 
 onClick={() => { setPaymentMethod('installment'); setInstallments(2); }} 
 className={`p-4 border transition-all flex flex-col items-center justify-center gap-1
 ${paymentMethod === 'installment' ? 'bg-brand-blue border-brand-blue/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/30 hover:bg-black/40')}`}
 >
 <Clock size={18} />
 <span className="text-[9px] font-black uppercase tracking-widest">A Prazo</span>
 </button>
 </div>

 {/* PARCELAS */}
 {paymentMethod === 'installment' && (
 <div className="space-y-1 animate-in slide-in-from-top-4 duration-500">
 <div className="flex justify-between items-center px-1">
 <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Ciclos / Parcelas</label>
 <span className={`text-10px font-black ${isLight ? 'text-brand-blue' : 'text-indigo-400'}`}>{installments}x</span>
 </div>
 <input 
 type="range" 
 min="2" 
 max="72" 
 value={installments} 
 onChange={(e) => setInstallments(Number(e.target.value))}
 className={`w-full h-1 rounded-none appearance-none cursor-pointer accent-indigo-500 ${isLight ? 'bg-slate-200' : 'bg-black/40'}`}
 />
 <div className="flex gap-2 mt-2">
 <button onClick={() => setAmountType('installment')} className={`flex-1 py-2 text-[9px] font-black uppercase border transition-all ${amountType === 'installment' ? 'bg-brand-blue text-white border-brand-blue/50' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/40')}`}>Valor Unitário</button>
 <button onClick={() => setAmountType('total')} className={`flex-1 py-2 text-[9px] font-black uppercase border transition-all ${amountType === 'total' ? 'bg-brand-blue text-white border-brand-blue/50' : (isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/20 border-white/5 text-white/40')}`}>Valor Total</button>
 </div>
 </div>
 )}

 {/* CATEGORIA */}
 <div className="space-y-2">
 <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Classificação</label>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
 {filteredCategories.length === 0 ? (
 <div className={`col-span-3 text-center py-4 border border-dashed text-[9px] font-black uppercase tracking-widest ${isLight ? 'bg-white border-slate-200 text-slate-300' : 'bg-black/20 border-white/10 text-white/20'}`}>
 Sem categorias
 </div>
 ) : filteredCategories.map(cat => (
 <button 
 key={cat.id} 
 onClick={() => setSelectedCategory(cat.name)} 
 className={`px-2 py-2 border text-[8px] font-black uppercase tracking-wider transition-all truncate
 ${selectedCategory === cat.name ? (isLight ? 'bg-brand-blue text-white border-brand-blue/50' : 'bg-white text-black border-white') : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20')}`}
 >
 {cat.name}
 </button>
 ))}
 </div>
 </div>

 {/* AÇÕES */}
 <div className={`flex flex-col gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
  {/* TOGGLE WHATSAPP */}
  <div className="flex items-center justify-between px-2 mb-1">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${sendToWhatsApp ? 'bg-brand-green/20 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
        <MessageSquare size={14} />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${sendToWhatsApp ? 'text-emerald-500' : 'text-slate-500'}`}>Notificar WhatsApp</span>
    </div>
    <button 
      onClick={() => setSendToWhatsApp(!sendToWhatsApp)}
      className={`w-10 h-5 rounded-full relative transition-all duration-300 border ${sendToWhatsApp ? 'bg-brand-green border-brand-green/50' : 'bg-white/5 border-white/10'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white transition-all duration-300 ${sendToWhatsApp ? 'left-6' : 'left-1'}`} />
    </button>
  </div>

 {isLimitReached ? (
 <div className={`border p-4 text-center animate-in zoom-in-95 duration-500 ${isLight ? 'bg-rose-50 border-rose-200' : 'bg-brand-orange/10 border-rose-500/30'}`}>
 <AlertTriangle className="text-rose-500 mx-auto mb-1" size={24} />
 <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-tighter italic">Capacidade Máxima</h4>
 <p className={`text-[8px] mt-1 uppercase font-black tracking-widest leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
 Upgrade Premium necessário para ilimitado.
 </p>
 <button 
 onClick={onClose}
 className="w-full mt-3 py-3 bg-brand-orange text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
 >
 Ver Planos
 </button>
 </div>
 ) : (
 <div className="flex gap-3">
 <button 
 onClick={onClose} 
 className={`flex-1 py-4 border font-black uppercase tracking-widest text-[9px] transition-all ${isLight ? 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50' : 'bg-black/20 border-white/5 text-white/40 hover:bg-black/40'}`}
 >
 Cancelar
 </button>
 <button 
 onClick={handleSave} 
 className={`flex-[2] py-4 font-black uppercase tracking-widest text-[9px] text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl
 ${type === 'income' ? 'bg-emerald-600 hover:bg-brand-green shadow-emerald-900/20' : 'bg-brand-orange hover:bg-brand-orange shadow-rose-900/20'}`}
 >
 <Check size={16} strokeWidth={4} /> {paymentMethod === 'installment' ? 'Lançar Parcelas' : 'Lançar'}
 </button>
 </div>
 )}
 </div>

 </div>
 </div>
 </div>
 );
}

