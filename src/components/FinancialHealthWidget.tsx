
import React from 'react';
import { AlertTriangle, CheckCircle2, Info, TrendingUp } from 'lucide-react';

interface FinancialHealthProps {
  income: number;
  expense: number;
  balance: number;
  debts: number;
  lazerGrowth: number;
  isCompact?: boolean;
}

const FinancialHealthWidget: React.FC<FinancialHealthProps> = ({ 
  income, 
  expense, 
  balance, 
  debts,
  lazerGrowth,
  isCompact
}) => {
  const expenseRatio = income > 0 ? (expense / income) : 0;
  const alerts = [];

  if (expenseRatio > 0.8) {
    alerts.push({
      type: 'danger',
      title: 'Crítico',
      message: 'Gastos acima de 80%',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />
    });
  }

  if (balance > 5000 && debts === 0) {
    alerts.push({
      type: 'success',
      title: 'Oportunidade',
      message: 'Considere investir.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    });
  }

  if (lazerGrowth > 20) {
    alerts.push({
      type: 'warning',
      title: 'Alerta Lazer',
      message: `Alta de ${lazerGrowth}%`,
      icon: <Info className="w-4 h-4 text-amber-500" />
    });
  }

  if (isCompact) {
    const mainAlert = alerts[0] || { 
      type: 'success', 
      title: 'Saudável', 
      message: 'Contas em ordem.', 
      icon: <TrendingUp className="w-4 h-4 text-indigo-500" /> 
    };

    return (
      <div className={`h-full flex items-center gap-3 p-3 md:p-4 rounded-3xl transition-all shadow-sm border border-transparent ${
        mainAlert.type === 'danger' ? 'bg-rose-100/30 dark:bg-rose-500/10' : 
        mainAlert.type === 'success' ? 'bg-emerald-100/30 dark:bg-emerald-500/10' : 
        'bg-amber-100/30 dark:bg-amber-500/10'
      }`}>
        <div className="shrink-0">{mainAlert.icon}</div>
        <div className="min-w-0">
          <h4 className={`text-[10px] font-black uppercase tracking-widest ${
            mainAlert.type === 'danger' ? 'text-rose-600 dark:text-rose-400' : 
            mainAlert.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 
            'text-amber-600 dark:text-amber-400'
          }`}>
            Diagnóstico: {mainAlert.title}
          </h4>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] font-bold truncate leading-none mt-1">{mainAlert.message}</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="p-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl shadow-sm border border-transparent text-center">
        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest">Saúde financeira estável</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-3xl flex items-center gap-3 shadow-sm border border-white/10 ${
            alert.type === 'danger' ? 'bg-rose-100/50 dark:bg-rose-500/10' : 
            alert.type === 'success' ? 'bg-emerald-100/50 dark:bg-emerald-500/10' : 
            'bg-amber-100/50 dark:bg-amber-500/10'
          }`}
        >
          <div className="shrink-0">{alert.icon}</div>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${
              alert.type === 'danger' ? 'text-rose-600 dark:text-rose-400' : 
              alert.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 
              'text-amber-600 dark:text-amber-400'
            }`}>
              {alert.title}
            </h4>
            <p className="text-slate-700 dark:text-slate-300 text-[11px] font-bold mt-0.5 leading-tight">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialHealthWidget;
