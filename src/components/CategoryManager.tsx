import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Plus, Trash2, Tag } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, type: TransactionType) => void;
  onDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName, newType);
    setNewName('');
  };

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        
        {/* COLUNA 1: FORMULÁRIO DE ADICIONAR */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-2xl">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg uppercase text-slate-700 dark:text-white tracking-wide">Nova Categoria</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome da Categoria</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Academia, Mercado..." 
                className="w-full mt-1 bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 mt-1">
                <button 
                  type="button"
                  onClick={() => setNewType(TransactionType.EXPENSE)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newType === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}
                >
                  Despesa
                </button>
                <button 
                  type="button"
                  onClick={() => setNewType(TransactionType.INCOME)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newType === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}
                >
                  Receita
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>
        </div>

        {/* COLUNA 2 e 3: LISTA DE CATEGORIAS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <h3 className="font-black text-sm uppercase text-slate-400 tracking-widest mb-6">Categorias Existentes</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <span className="font-black text-sm text-slate-700 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManager;