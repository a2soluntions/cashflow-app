import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
 currentDate: Date;
 onMonthChange: (date: Date) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentDate, onMonthChange }) => {
 const handlePrevMonth = () => {
 const newDate = new Date(currentDate);
 newDate.setMonth(newDate.getMonth() - 1);
 onMonthChange(newDate);
 };

 const handleNextMonth = () => {
 const newDate = new Date(currentDate);
 newDate.setMonth(newDate.getMonth() + 1);
 onMonthChange(newDate);
 };

 // Formata o mês e ano (ex: FEV/2026 ou JANEIRO 26)
 const formattedDate = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();

 return (
 <div className="w-full bg-white dark:bg-[#09090b] rounded-xl p-1.5 flex items-center justify-between gap-1">
 {/* Botão Voltar (Tamanho Fixo) */}
 <button
 onClick={handlePrevMonth}
 className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>

 {/* Texto Central (Ocupa o espaço que sobrar) */}
 <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
 Período
 </span>
 <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
 <Calendar className="w-3 h-3 text-emerald-500" />
 <span className="text-xs font-black uppercase tracking-wider truncate">
 {formattedDate}
 </span>
 </div>
 </div>

 {/* Botão Avançar (Tamanho Fixo) */}
 <button
 onClick={handleNextMonth}
 className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 );
};

export default MonthSelector;


