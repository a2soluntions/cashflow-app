import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Search, LayoutGrid, Target, Edit3 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  limit?: number;
}

export default function CategoryManager() {
  // === AQUI ESTÁ A MÁGICA DA LIMPEZA ===
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('vittacash_pro_categories');
    // Se não tiver nada salvo, retorna VAZIO [] (Sem categorias fantasma)
    return saved ? JSON.parse(saved) : []; 
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [selectedColor, setSelectedColor] = useState('bg-rose-500');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Salvando no novo cofre PRO
    localStorage.setItem('vittacash_pro_categories', JSON.stringify(categories));
    
    const budgets = categories
      .filter(c => c.type === 'expense' && (c.limit || 0) > 0)
      .map(c => ({ id: c.id, category: c.name, limitAmount: Number(c.limit) }));
    
    // Salvando orçamentos no novo cofre PRO também
    localStorage.setItem('vittacash_pro_budgets', JSON.stringify(budgets));
    window.dispatchEvent(new Event('storage'));
  }, [categories]);

  const colors = [
    'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500',
    'bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500',
    'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-amber-500',
    'bg-orange-500', 'bg-red-500', 'bg-stone-500', 'bg-slate-500', 'bg-zinc-800'
  ];

  const handleSave = () => {
    if (!newName) return;
    if (editingId) {
      setCategories(categories.map(c => c.id === editingId ? {
        ...c, name: newName.toUpperCase(), type: newType, color: selectedColor, limit: newType === 'expense' ? Number(newLimit) || 0 : undefined
      } : c));
      setEditingId(null);
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName.toUpperCase(),
        type: newType,
        color: selectedColor,
        limit: newType === 'expense' ? Number(newLimit) || 0 : undefined
      };
      setCategories([...categories, newCat]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewLimit('');
    setNewType('expense');
    setEditingId(null);
    setSelectedColor(colors[0]);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewType(cat.type);
    setSelectedColor(cat.color);
    setNewLimit(cat.limit?.toString() || '');
  };

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-hidden font-sans">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="flex justify-between items-end shrink-0 px-2 h-[45px]">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Configuração de Fluxos
        </h2>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 pb-2">
        {/* FORMULÁRIO */}
        <div className="col-span-12 md:col-span-4 flex flex-col min-h-0">
            <div className={`flex-1 p-5 rounded-[2rem] border-2 bg-white dark:bg-black/20 flex flex-col transition-all ${newType === 'income' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-5 text-slate-400 flex items-center gap-2">
                        {editingId ? <Edit3 size={14} className="text-amber-500"/> : <Plus size={14} className="text-indigo-500"/>}
                        {editingId ? 'Editando Registro' : 'Novo Registro'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Identificação</label>
                            <input 
                                type="text" value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="EX: ALIMENTAÇÃO"
                                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setNewType('income')} className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase transition-all ${newType === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                <ArrowUpCircle size={14} /> Receita
                            </button>
                            <button onClick={() => setNewType('expense')} className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase transition-all ${newType === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                <ArrowDownCircle size={14} /> Despesa
                            </button>
                        </div>

                        {newType === 'expense' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[8px] font-black uppercase text-rose-500 ml-2">Teto Mensal (R$)</label>
                                <input 
                                    type="number" value={newLimit}
                                    onChange={(e) => setNewLimit(e.target.value)}
                                    placeholder="Digite o valor..."
                                    className="w-full bg-rose-50/50 dark:bg-rose-500/5 border-none rounded-xl px-4 py-3 text-xs font-black text-rose-600 outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-2 block">Cores Disponíveis</label>
                            <div className="flex flex-wrap gap-2.5 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                {colors.map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setSelectedColor(c)} 
                                        className={`w-5 h-5 rounded-full ${c} transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-md' : 'opacity-40 hover:opacity-100'}`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    {editingId && (
                        <button onClick={resetForm} className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] bg-slate-100 text-slate-500">Sair</button>
                    )}
                    <button onClick={handleSave} className={`flex-[2] py-4 rounded-xl font-black uppercase text-[10px] text-white shadow-xl ${newType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {editingId ? 'Atualizar Dados' : 'Criar Categoria'}
                    </button>
                </div>
            </div>
        </div>

        {/* LISTA (CATÁLOGO) */}
        <div className="col-span-12 md:col-span-8 p-6 rounded-[2rem] border bg-white dark:bg-black/20 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-indigo-500"/> Registros Ativos
                </h3>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="BUSCAR..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 rounded-xl text-[9px] font-black border-none bg-slate-50 dark:bg-white/5 dark:text-white outline-none w-32 focus:w-44 transition-all" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 group hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${cat.color}`}>
                                {cat.type === 'income' ? <ArrowUpCircle size={16}/> : <ArrowDownCircle size={16}/>}
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{cat.name}</h4>
                                <span className={`text-[7px] font-black uppercase ${cat.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {cat.type === 'income' ? 'Entrada' : 'Saída'}
                                </span>
                            </div>
                        </div>

                        {/* VALOR DA META NA LINHA */}
                        {cat.type === 'expense' && (
                            <div className="mr-6 text-right">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Teto Mensal</p>
                                <p className="text-[11px] font-black text-rose-600">
                                    R$ {cat.limit ? Number(cat.limit).toLocaleString('pt-BR') : '0'}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => startEdit(cat)} className="p-2.5 rounded-lg bg-white dark:bg-black/40 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                                <Edit3 size={14} />
                            </button>
                            <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="p-2.5 rounded-lg bg-white dark:bg-black/40 text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}