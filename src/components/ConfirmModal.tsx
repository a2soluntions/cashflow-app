import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transform scale-100">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-rose-50 dark:bg-rose-500/10 rounded-full border-4 border-rose-100 dark:border-rose-500/20 shadow-inner">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
        </div>
        <h3 className="text-center font-black text-xl text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 leading-relaxed">{message}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="py-4 rounded-2xl bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-500/30 transition-all active:scale-95">
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;