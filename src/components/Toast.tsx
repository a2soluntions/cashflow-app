import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-right-full duration-300 border backdrop-blur-xl ${
      type === 'success' 
        ? 'bg-white/90 dark:bg-slate-900/90 border-emerald-500/20' 
        : 'bg-white/90 dark:bg-slate-900/90 border-rose-500/20'
    }`}>
      <div className={`p-3 rounded-2xl ${type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600'}`}>
        {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
      </div>
      <div>
        <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {type === 'success' ? 'Sucesso' : 'Atenção'}
        </h4>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;