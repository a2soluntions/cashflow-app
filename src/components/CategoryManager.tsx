import React, { useState } from 'react';
import { Tag, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Search, LayoutGrid, Target, Edit3 } from 'lucide-react';

import { appApi } from '../services/api';
import { Category } from '../types';

interface Props {
  categories: Category[];
  onUpdate: () => void;
  currentUserId?: string;
}

export default function CategoryManager({ categories, onUpdate, currentUserId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [selectedColor, setSelectedColor] = useState('bg-rose-500');
  const [searchTerm, setSearchTerm] = useState('');

  const colors = [
    'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500',
    'bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500',
    'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-amber-500',
    'bg-orange-500', 'bg-red-500', 'bg-stone-500', 'bg-slate-500', 'bg-zinc-800'
  ];

  const handleSave = async () => {
    if (!newName) return;
    try {
      if (editingId) {
        await appApi.updateCategory({
          id: editingId,
          name: newName.toUpperCase(),
          type: newType,
          color: selectedColor,
          limit_amount: newType === 'expense' ? Number(newLimit) || 0 : undefined,
          user_id: currentUserId || 'offline',
        });
      } else {
        await appApi.addCategory({
          id: crypto.randomUUID(),
          name: newName.toUpperCase(),
          type: newType,
          color: selectedColor,
          limit_amount: newType === 'expense' ? Number(newLimit) || 0 : undefined,
          user_id: currentUserId || 'offline',
        });
      }
      onUpdate();
    } catch (err) {
      console.error("Erro ao salvar categoria", err);
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    try {
      await appApi.deleteCategory(id);
      onUpdate();
    } catch (err) {
      console.error("Erro ao remover", err);
    }
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
    setNewType(cat.type as any);
    setSelectedColor(cat.color || colors[0]);
    setNewLimit(cat.limit_amount?.toString() || '');
  };

  return (
    <div className="w-full h-auto md:h-full flex flex-col gap-4 md:overflow-hidden font-sans p-2">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Configuração de Fluxos</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gerencie suas categorias de entrada e saída</p>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 flex-1 md:min-h-0 pb-2 overflow-hidden">
        {/* FORMULÁRIO */}
        <div className="col-span-12 md:col-span-4 flex flex-col md:min-h-0">
          <div className="flex-1 p-5 flex flex-col justify-between"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                {editingId ? <Edit3 size={12} style={{ color: '#FFD60A' }}/> : <Plus size={12} style={{ color: '#6C63FF' }}/>}
                {editingId ? 'Editando Categoria' : 'Nova Categoria'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest ml-1 mb-1 block" style={{ color: 'var(--text-muted)' }}>Nome da Categoria</label>
                  <input 
                    type="text" value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="EX: ALIMENTAÇÃO"
                    className="w-full pl-3 pr-3 py-2.5 text-xs font-bold uppercase outline-none rounded-lg text-slate-900 dark:text-white"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                  <button onClick={() => setNewType('income')} 
                    className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase transition-all"
                    style={{
                      background: newType === 'income' ? '#00D4AA' : 'transparent',
                      color: newType === 'income' ? '#fff' : 'var(--text-muted)',
                    }}>
                    <ArrowUpCircle size={12} /> Receita
                  </button>
                  <button onClick={() => setNewType('expense')} 
                    className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase transition-all"
                    style={{
                      background: newType === 'expense' ? '#FF4757' : 'transparent',
                      color: newType === 'expense' ? '#fff' : 'var(--text-muted)',
                    }}>
                    <ArrowDownCircle size={12} /> Despesa
                  </button>
                </div>

                {newType === 'expense' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-1 mb-1 block text-rose-400">Teto Mensal Limite (R$)</label>
                    <input 
                      type="number" value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      placeholder="DIGITE O VALOR LIMITE..."
                      className="w-full pl-3 pr-3 py-2.5 text-xs font-black text-rose-400 outline-none rounded-lg"
                      style={{ background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.15)' }}
                    />
                  </div>
                )}

                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest ml-1 mb-2 block" style={{ color: 'var(--text-muted)' }}>Cores de Identificação</label>
                  <div className="flex flex-wrap gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                    {colors.map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSelectedColor(c)} 
                        className={`w-4 h-4 rounded-full ${c} transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-[#6C63FF] scale-110' : 'opacity-40 hover:opacity-100'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {editingId && (
                <button onClick={resetForm} className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] bg-slate-800 text-slate-400">Cancelar</button>
              )}
              <button onClick={handleSave} 
                className="flex-[2] py-3 rounded-xl font-black uppercase text-[9px] text-black tracking-widest"
                style={{ background: newType === 'income' ? '#00D4AA' : '#FF4757' }}>
                {editingId ? 'Salvar Categoria' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA (CATÁLOGO) */}
        <div className="col-span-12 md:col-span-8 p-5 flex flex-col min-h-[300px] md:min-h-0"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <LayoutGrid size={12} style={{ color: '#6C63FF' }}/> Categorias Ativas
            </h3>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="FILTRAR..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-8 pr-3 py-2 text-[9px] font-black border-none rounded-lg text-slate-900 dark:text-white outline-none w-28 focus:w-36 transition-all"
                style={{ background: 'var(--bg-surface)' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 group transition-all"
                style={{ borderBottom: '1px solid var(--bg-border)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${cat.color || 'bg-slate-500'}`}>
                    {cat.type === 'income' ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black uppercase truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</h4>
                    <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: cat.type === 'income' ? '#00D4AA' : '#FF4757' }}>
                      {cat.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>
                </div>

                {/* VALOR DA META NA LINHA */}
                {cat.type === 'expense' && (
                  <div className="mr-4 text-right">
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Teto Mensal</p>
                    <p className="text-xs font-black text-rose-400">
                      R$ {cat.limit_amount ? Number(cat.limit_amount).toLocaleString('pt-BR') : '0'}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button onClick={() => startEdit(cat)} 
                    className="p-2 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-all">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} 
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Trash2 size={13} />
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
