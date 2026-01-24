import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentDate, onMonthChange }) => {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // Formata: "JANEIRO 2026"
  const formattedDate = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
      <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2 px-6 min-w-[160px] justify-center">
        <Calendar size={16} className="text-indigo-500 mb-0.5" />
        <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-widest">
          {formattedDate}
        </span>
      </div>

      <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default MonthSelector;