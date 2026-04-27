import React from 'react';
import { AlertCircle, CheckCircle2, X, Info, AlertTriangle } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
}

export function CustomAlert({ isOpen, onClose, title, message, type = 'info', confirmText = 'Entendido' }: CustomAlertProps) {
  if (!isOpen) return null;

  const colors = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-500',
      icon: <CheckCircle2 size={32} className="text-emerald-500" />,
      button: 'bg-emerald-500 text-black hover:bg-emerald-400'
    },
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-500',
      icon: <AlertCircle size={32} className="text-rose-500" />,
      button: 'bg-rose-500 text-white hover:bg-rose-400'
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      icon: <AlertTriangle size={32} className="text-amber-500" />,
      button: 'bg-amber-500 text-black hover:bg-amber-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      icon: <Info size={32} className="text-blue-500" />,
      button: 'bg-blue-500 text-white hover:bg-blue-400'
    }
  };

  const style = colors[type];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-sm border ${style.bg} ${style.border} shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 overflow-hidden`}>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6 p-4 rounded-full bg-black/20">
            {style.icon}
          </div>
          
          <h3 className={`text-xl font-black uppercase italic tracking-tighter mb-2 ${style.text}`}>
            {title}
          </h3>
          
          <p className="text-xs font-medium text-slate-400 leading-relaxed mb-8 px-4">
            {message}
          </p>
          
          <button 
            onClick={onClose}
            className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
