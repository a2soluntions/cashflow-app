import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  compact?: boolean;
  trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, compact, trend }) => {
  return (
    <div className={`bg-white dark:bg-slate-900/40 rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden transition-transform hover:scale-[1.02] ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-indigo-500/10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        {/* AQUI ESTÁ A MUDANÇA: Aumentei para text-xs (12px) e o padding */}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-black uppercase px-2.5 py-1.5 rounded-xl ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;