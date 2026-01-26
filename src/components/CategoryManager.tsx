import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Tag, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, type: TransactionType) => void;
  onDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onDelete }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>(TransactionType.EXPENSE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAdd(newCatName, newCatType);
      setNewCatName('');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Formulário de Adição */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-end">
         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nova Categoria</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
               <Tag className="w-5 h-5 text-slate-400" />
               <input 
                 type="text" 
                 className="bg-transparent outline-none w-full text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400"
                 placeholder="Ex: Marketing, Lazer..."
                 value={newCatName}
                 onChange={(e) => setNewCatName(e.target.value)}
               />
            </div>
         </div>
         
         <div className="flex bg-slate-100 dark:bg-black p-1 rounded-xl h-[48px] shrink-0">
            <button 
              type="button"
              onClick={() => setNewCatType(TransactionType.INCOME)} 
              className={`px-4 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase transition-all ${newCatType === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}
            >
              <ArrowUpRight className="w-4 h-4" /> Rec
            </button>
            <button 
              type="button"
              onClick={() => setNewCatType(TransactionType.EXPENSE)} 
              className={`px-4 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase transition-all ${newCatType === TransactionType.EXPENSE ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}
            >
              <ArrowDownRight className="w-4 h-4" /> Desp
            </button>
         </div>

         <button type="submit" className="h-[48px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 transition-all shrink-0">
            Adicionar
         </button>
      </form>

      {/* Lista de Categorias */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {categories.map(cat => (
               <div key={cat.id} className="group bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                     <div className={`p-2.5 rounded-xl ${cat.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500'}`}>
                        <Tag className="w-4 h-4" />
                     </div>
                     <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CategoryManager;