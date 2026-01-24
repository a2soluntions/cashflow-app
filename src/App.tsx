import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, TrendingUp as TrendingUpIcon, Plus, Menu, X,
  CalendarDays, LineChart, Search, Coins,
  Calendar, Tag, Edit3, Target, LogOut, Wallet, PieChart as PieChartIcon, Sun, Moon, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Session } from '@supabase/supabase-js'; 
import { supabase } from './supabase'; 
import { TransactionType, TransactionStatus, Transaction, Investment, Category, Goal } from './types';
import TransactionTable from './components/TransactionTable';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import MonthSelector from './components/MonthSelector';
import CategoryManager from './components/CategoryManager';
import GoalsManager from './components/GoalsManager';
import DashboardHome from './components/DashboardHome';
import Auth from './components/Auth';

const OPCOES_PARCELAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48, 60, 72];
const CORES_MODERNAS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transacoes' | 'contas' | 'investimentos' | 'categorias' | 'metas'>('dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ description: '', amountString: '', date: '', category: '', type: TransactionType.EXPENSE });

  const [deleteData, setDeleteData] = useState<{ id: string; type: 'transaction' | 'category' | 'goal' } | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null);
  const [realValueInput, setRealValueInput] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const formatCurrencyInput = (val: string) => { if (!val || val === '0') return 'R$ 0,00'; const numberValue = parseFloat(val) / 100; return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue); };

  const [newTx, setNewTx] = useState({
    description: '', totalAmount: '', installmentAmount: '',
    type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0],
    installments: '1', inputMode: 'total' as 'total' | 'installment',
    category: ''
  });

  const [newInv, setNewInv] = useState({
    name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Ações'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).order('date', { ascending: false });
      if (txData) setTransactions(txData.map((t: any) => ({ ...t, amount: Number(t.amount || 0), paid_amount: Number(t.paid_amount || 0) })));

      const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (catData) setCategories(catData);

      const { data: invData } = await supabase.from('investments').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (invData) setInvestments(invData.map((i: any) => ({ ...i, invested_amount: Number(i.invested_amount || 0), current_amount: Number(i.current_amount || 0) })));

      const { data: goalData } = await supabase.from('goals').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (goalData) setGoals(goalData.map((g: any) => ({ ...g, target_amount: Number(g.target_amount), current_amount: Number(g.current_amount) })));
    } catch (error) { console.error(error); showToast('Erro de conexão.', 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { if (session) fetchData(); }, [session]);
  useEffect(() => { const root = window.document.documentElement; if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark'); }, [theme]);

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

  const requestDelete = (id: string, type: 'transaction' | 'category' | 'goal') => { setDeleteData({ id, type }); };

  const handleConfirmDelete = async () => {
    if (!deleteData) return;
    const { id, type } = deleteData;
    let table = '';
    if (type === 'transaction') table = 'transactions';
    if (type === 'category') table = 'categories';
    if (type === 'goal') table = 'goals';

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { showToast('Erro ao excluir.', 'error'); } 
    else {
      if (type === 'transaction') setTransactions(prev => prev.filter(t => t.id !== id));
      if (type === 'category') setCategories(prev => prev.filter(c => c.id !== id));
      if (type === 'goal') setGoals(prev => prev.filter(g => g.id !== id));
      showToast('Item removido!', 'success');
    }
    setDeleteData(null);
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'current_amount'>) => {
    if (!session?.user) return;
    const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: session.user.id, current_amount: 0 }]).select();
    if (error) showToast('Erro ao criar.', 'error'); else { setGoals([data[0], ...goals]); showToast('Meta criada!', 'success'); }
  };
  const handleDepositGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id); if (!goal) return;
    const newAmount = goal.current_amount + amount;
    const { error } = await supabase.from('goals').update({ current_amount: newAmount }).eq('id', id);
    if (error) showToast('Erro ao depositar.', 'error'); else { setGoals(goals.map(g => g.id === id ? { ...g, current_amount: newAmount } : g)); showToast('Depósito realizado!', 'success'); }
  };

  const openEditModal = (tx: Transaction) => { setEditingTransaction(tx); const amountStr = (tx.amount * 100).toFixed(0); setEditForm({ description: tx.description, amountString: amountStr, date: tx.date, category: tx.category || '', type: tx.type }); };
  const handleUpdateTransaction = async (e: React.FormEvent) => { e.preventDefault(); if (!editingTransaction) return; const updatedAmount = parseFloat(editForm.amountString) / 100; const { error } = await supabase.from('transactions').update({ description: editForm.description, amount: updatedAmount, date: editForm.date, category: editForm.category, type: editForm.type }).eq('id', editingTransaction.id); if (error) showToast('Erro ao atualizar.', 'error'); else { showToast('Atualizado!', 'success'); setEditingTransaction(null); fetchData(); } };
  const handleAddCategory = async (name: string, type: TransactionType) => { const { data, error } = await supabase.from('categories').insert([{ name, type }]).select(); if (error) showToast('Erro ao criar categoria.', 'error'); else if (data) { setCategories([...categories, data[0]]); showToast('Categoria criada!', 'success'); } };
  
  const handleAddTransaction = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!session?.user) return;
    
    const total = parseFloat(newTx.totalAmount) / 100;
    const installmentsCount = parseInt(newTx.installments);
    const newEntries = [];
    
    // Garante uma categoria padrão se o usuário não selecionou
    const finalCategory = newTx.category || (categories.find(c => c.type === newTx.type)?.name || 'Geral'); 
    
    for (let i = 0; i < installmentsCount; i++) { 
      const txDate = new Date(newTx.date); 
      txDate.setMonth(txDate.getMonth() + i); 
      
      newEntries.push({ 
        user_id: session.user.id, 
        account_id: 'acc1', 
        category: finalCategory, 
        amount: total / installmentsCount, 
        description: installmentsCount > 1 ? `${newTx.description} (${i + 1}/${installmentsCount})` : newTx.description, 
        type: newTx.type, 
        status: TransactionStatus.PENDING, 
        date: txDate.toISOString().split('T')[0], 
        is_recurring: installmentsCount > 1 
      }); 
    } 
    
    const { error } = await supabase.from('transactions').insert(newEntries); 
    
    if (error) {
      showToast('Erro ao salvar.', 'error'); 
    } else { 
      fetchData(); 
      setIsModalOpen(false); 
      
      // CORRIGIDO: Removida a duplicata de category no objeto
      setNewTx({ 
        description: '', 
        category: '', 
        totalAmount: '', 
        installmentAmount: '', 
        type: TransactionType.EXPENSE, 
        date: new Date().toISOString().split('T')[0], 
        installments: '1', 
        inputMode: 'total'
      }); 
      
      showToast('Salvo!', 'success'); 
    } 
  };

  const handleAddInvestment = async (e: React.FormEvent) => { e.preventDefault(); if (!session?.user) return; const amount = parseFloat(newInv.amount) / 100; const investment = { user_id: session.user.id, name: newInv.name, category: newInv.category, invested_amount: amount, current_amount: amount, created_at: new Date(newInv.date).toISOString() }; const { error } = await supabase.from('investments').insert([investment]); if (error) showToast('Erro ao salvar.', 'error'); else { fetchData(); setIsInvestmentModalOpen(false); setNewInv({ name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Ações' }); showToast('Salvo!', 'success'); } };
  const confirmPayment = async () => { if (!payingTransaction) return; const paid = parseFloat(realValueInput) / 100; const { error } = await supabase.from('transactions').update({ status: TransactionStatus.COMPLETED, paid_amount: paid }).eq('id', payingTransaction.id); if (error) showToast('Erro ao confirmar.', 'error'); else { fetchData(); setPayingTransaction(null); showToast('Confirmado!', 'success'); } };
  const handleAmountChange = (val: string, mode: 'total' | 'installment') => { const numeric = val.replace(/\D/g, ''); const instCount = parseInt(newTx.installments) || 1; if (mode === 'total') { const total = parseFloat(numeric); const perInst = Math.round(total / instCount); setNewTx(prev => ({ ...prev, totalAmount: numeric, installmentAmount: perInst.toString(), inputMode: 'total' })); } else { const perInst = parseFloat(numeric); const total = perInst * instCount; setNewTx(prev => ({ ...prev, installmentAmount: numeric, totalAmount: total.toString(), inputMode: 'installment' })); } };

  const filteredTransactions = useMemo(() => { return transactions.filter(t => { const tDate = new Date(t.date); tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset()); return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear(); }); }, [transactions, currentDate]);
  const totalInvested = useMemo(() => investments.reduce((acc, curr) => acc + curr.current_amount, 0), [investments]);
  const urgencies = useMemo(() => { const today = new Date(); today.setHours(0,0,0,0); const pending = transactions.filter(t => t.status === TransactionStatus.PENDING); const delayed = pending.filter(t => new Date(t.date) < today); return { delayedCount: delayed.length }; }, [transactions]);
  const navButtonClass = (active: boolean) => `w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest ${active ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-200/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-100/5'}`;
  const investmentAllocation = useMemo(() => { const allocation: Record<string, number> = {}; investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; return data; }, [investments]);

  if (!session) return <Auth />;

  const renderContent = () => {
    if (activeTab === 'dashboard') return <DashboardHome transactions={transactions} investments={investments} filteredTransactions={filteredTransactions} currentDate={currentDate} />;
    if (activeTab === 'categorias') return <CategoryManager categories={categories} onAdd={handleAddCategory} onDelete={(id) => requestDelete(id, 'category')} />;
    if (activeTab === 'metas') return <GoalsManager goals={goals} onAdd={handleAddGoal} onDeposit={handleDepositGoal} onDelete={(id) => requestDelete(id, 'goal')} />;
    
    if (activeTab === 'investimentos') {
      return (
        <div className="h-full flex flex-col space-y-4 min-h-0 min-w-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="h-[200px] w-full bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-5 shadow-sm flex flex-col shrink-0 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4 z-10"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUpIcon className="w-4 h-4 text-indigo-500" /> Evolução Patrimonial</h3><div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-400 uppercase">Patrimônio Atual:</span><span className="text-sm font-black text-indigo-600">R$ {totalInvested.toLocaleString()}</span></div></div>
                <div className="flex-1 relative min-h-0 min-w-0 w-full mt-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[]} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}><defs><linearGradient id="gradPatri" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} /><YAxis hide /><Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', fontWeight: 'black', background: '#1e293b', color: '#fff' }} /><Area type="monotone" dataKey="patrimonio" stroke="#6366f1" fill="url(#gradPatri)" strokeWidth={4} /></AreaChart></ResponsiveContainer></div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden flex flex-col min-h-0 shadow-sm">
                <div className="flex items-center justify-between p-6 pb-4 shrink-0"><div className="flex items-center gap-2"><div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div><h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Meus Ativos</h2></div><button onClick={() => setIsInvestmentModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30"><Plus className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-wider">Nova Aplicação</span></button></div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 custom-scrollbar"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900/90 backdrop-blur-md z-10"><th className="py-4 px-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Ativo</th><th className="py-4 px-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Categoria</th><th className="py-4 px-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Investido</th><th className="py-4 px-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Atual</th><th className="py-4 px-2 text-slate-500 text-[10px] font-black uppercase tracking-widest text-right">Rent.</th></tr></thead><tbody>{investments.map((inv) => { const profit = ((inv.current_amount / inv.invested_amount) - 1) * 100; return (<tr key={inv.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"><td className="py-5 px-2 font-bold text-sm truncate max-w-[150px]">{inv.name}</td><td className="py-5 px-2 text-xs font-bold text-slate-500">{inv.category}</td><td className="py-5 px-2 text-sm font-bold text-slate-500">R$ {inv.invested_amount.toLocaleString()}</td><td className="py-5 px-2 text-sm font-black text-indigo-600">R$ {inv.current_amount.toLocaleString()}</td><td className={`py-5 px-2 text-xs font-black text-right ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{profit >= 0 ? '↑' : '↓'} {Math.abs(profit).toFixed(1)}%</td></tr>); })}</tbody></table></div>
            </div>
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] flex flex-col shadow-sm h-full overflow-hidden min-w-0 mt-4"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><PieChartIcon className="w-4 h-4" /> Alocação</h3><div className="flex-1 flex items-center gap-8 min-h-0 w-full relative"><div className="flex-1 h-full relative min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={investmentAllocation} innerRadius="55%" outerRadius="85%" dataKey="value" stroke="none">{investmentAllocation.map((_, i) => <Cell key={i} fill={CORES_MODERNAS[i % CORES_MODERNAS.length]} />)}</Pie><Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer></div><div className="w-1/2 space-y-3 pr-6 overflow-y-auto custom-scrollbar h-full py-2">{investmentAllocation.map((item, i) => (<div key={i} className="flex flex-col border-l-4 pl-4 py-2 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-2xl" style={{ borderColor: CORES_MODERNAS[i % CORES_MODERNAS.length] }}><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">{item.name}</span><span className="text-sm font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span></div>))}</div></div></div>
        </div>
      );
    }

    const isHistory = activeTab === 'transacoes';
    const list = activeTab === 'contas' ? filteredTransactions.filter(t => t.status === TransactionStatus.PENDING) : isHistory ? filteredTransactions.filter(t => t.status === TransactionStatus.COMPLETED) : [];
    return (
      <div className="h-full flex flex-col min-h-0 min-w-0 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[2.5rem] overflow-y-auto p-6 custom-scrollbar min-h-0 shadow-sm">
            {loading ? <p className="text-center p-10 text-slate-400">Carregando...</p> : <TransactionTable transactions={list} onDelete={!isHistory ? (id) => requestDelete(id, 'transaction') : undefined} onEdit={!isHistory ? openEditModal : undefined} onPay={!isHistory ? (id) => { const tx = transactions.find(t => t.id === id); if (tx) { setPayingTransaction(tx); setRealValueInput((tx.amount * 100).toString()); } } : undefined} />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden font-inter">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal isOpen={!!deleteData} onClose={() => setDeleteData(null)} onConfirm={handleConfirmDelete} title={`Excluir ${deleteData?.type === 'category' ? 'Categoria' : deleteData?.type === 'goal' ? 'Meta' : 'Lançamento'}?`} message="Esta ação não pode ser desfeita." />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-950 lg:relative lg:translate-x-0 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-8 flex flex-col h-full">
             <div className="flex items-center gap-4 mb-10"><div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/40"><PieChartIcon className="w-6 h-6 text-white" /></div><h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">CashFlow</h1></div>
             <nav className="space-y-3 flex-1">
                <button onClick={() => { setIsModalOpen(true); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shadow-sm"><Plus className="w-5 h-5" /><span>Lançamento</span></button>
                <div className="py-2"><MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} /></div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4 opacity-30"></div>
                <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'dashboard')}><LayoutDashboard className="w-5 h-5" /><span>Dashboard</span></button>
                <button onClick={() => { setActiveTab('categorias'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'categorias')}><Tag className="w-5 h-5" /><span>Categorias</span></button>
                <button onClick={() => { setActiveTab('metas'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'metas')}><Target className="w-5 h-5" /><span>Metas</span></button>
                <button onClick={() => { setActiveTab('investimentos'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'investimentos')}><LineChart className="w-5 h-5" /><span>Aplicações</span></button>
                <button onClick={() => { setActiveTab('contas'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'contas')}><CalendarDays className="w-5 h-5" /><span>Contas</span></button>
                <button onClick={() => { setActiveTab('transacoes'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'transacoes')}><ArrowLeftRight className="w-5 h-5" /><span>Histórico</span></button>
             </nav>
             <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-black text-[12px] uppercase tracking-widest mt-auto"><LogOut className="w-5 h-5" /><span>Sair</span></button>
           </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative min-w-0">
        <header className="h-20 flex items-center justify-between px-8 lg:px-12 shrink-0 z-40">
           <div className="flex items-center gap-6"><button className="lg:hidden p-3 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl shadow-sm" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button><h2 className="lg:hidden text-lg font-black uppercase text-slate-900 dark:text-white tracking-widest">{activeTab}</h2><div className="hidden lg:flex items-center gap-2"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] opacity-50">Portal Financeiro Inteligente</span></div></div>
           <div className="flex-1"></div>
           <div className="flex items-center gap-3">
              {urgencies.delayedCount > 0 && (<button onClick={() => setActiveTab('contas')} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all shadow-sm group"><AlertCircle className="w-4 h-4 group-hover:animate-shake" /><span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{urgencies.delayedCount} Atrasos</span></button>)}
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-90">{theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}</button>
              <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/30"><div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">{session?.user?.email?.charAt(0).toUpperCase()}</div><p className="hidden md:block text-[11px] font-black uppercase truncate max-w-[120px] text-slate-700 dark:text-slate-200">{session?.user?.email}</p></div>
           </div>
        </header>
        <div className="flex-1 px-8 lg:px-12 pb-8 overflow-hidden flex flex-col min-h-0">{renderContent()}</div>
      </main>

      {editingTransaction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="font-black text-xl uppercase tracking-tighter text-amber-500 flex items-center gap-2"><Edit3 className="w-5 h-5"/> Editar</h3><button onClick={() => setEditingTransaction(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all bg-slate-50 dark:bg-slate-900 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Descrição</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Valor</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={formatCurrencyInput(editForm.amountString)} onChange={(e) => setEditForm({...editForm, amountString: e.target.value.replace(/\D/g, '')})} required /></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Data</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-xs font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} required /></div></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}><option value="">Sem categoria</option>{categories.filter(c => c.type === editForm.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 mt-2">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-black text-xl uppercase tracking-tighter text-indigo-600">Novo Lançamento</h3><button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all bg-slate-50 dark:bg-slate-900 rounded-xl"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Descrição</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} required /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})}><option value="">Selecione uma Categoria...</option>{categories.filter(c => c.type === newTx.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Total</label><input type="text" className={`w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 ${newTx.inputMode === 'total' ? 'border-indigo-500' : 'border-transparent'} shadow-inner`} value={formatCurrencyInput(newTx.totalAmount)} onChange={(e) => handleAmountChange(e.target.value, 'total')} /></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Parcela</label><input type="text" className={`w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 ${newTx.inputMode === 'installment' ? 'border-indigo-500' : 'border-transparent'} shadow-inner`} value={formatCurrencyInput(newTx.installmentAmount)} onChange={(e) => handleAmountChange(e.target.value, 'installment')} /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Parcelas</label><select className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500 appearance-none shadow-inner cursor-pointer" value={newTx.installments} onChange={(e) => { const count = e.target.value; const mode = newTx.inputMode; if (mode === 'total') { const totalNum = parseFloat(newTx.totalAmount) || 0; const perInst = Math.round(totalNum / parseInt(count)); setNewTx(prev => ({...prev, installments: count, installmentAmount: perInst.toString()})); } else { const perNum = parseFloat(newTx.installmentAmount) || 0; const total = perNum * parseInt(count); setNewTx(prev => ({...prev, installments: count, totalAmount: total.toString()})); } }}><option value="1">À Vista</option>{OPCOES_PARCELAS.map(n => <option key={n} value={n}>{n}x</option>)}</select></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Vencimento</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-xs font-black outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} required /></div></div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 h-[48px]"><button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.INCOME})} className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${newTx.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}>Receita</button><button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.EXPENSE})} className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}>Despesa</button></div>
                    <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.1em] shadow-xl active:scale-95 transition-all mt-2 hover:bg-indigo-700">Lançar Agora</button>
                </form>
              </div>
        </div>
      )}

      {isInvestmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-[3.5rem] shadow-3xl border border-slate-100 dark:border-slate-800 p-10 transform scale-100">
                <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4"><div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/30"><Coins className="w-8 h-8 text-white" /></div><h3 className="font-black text-2xl lg:text-3xl uppercase tracking-tighter text-slate-900 dark:text-white">Nova Aplicação</h3></div><button onClick={() => setIsInvestmentModalOpen(false)} className="p-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all bg-slate-50 dark:bg-slate-900 rounded-3xl"><X className="w-7 h-7" /></button></div>
                <form onSubmit={handleAddInvestment} className="space-y-8">
                     <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500" /> Ativo Selecionado</label><input type="text" placeholder="Ticker ou Nome" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl px-8 py-6 text-lg font-black outline-none" value={newInv.name} onChange={(e) => setNewInv({...newInv, name: e.target.value})} required /></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Wallet className="w-4 h-4 text-indigo-500" /> Valor</label><input type="text" className="w-full bg-indigo-50/50 dark:bg-indigo-500/10 rounded-3xl px-6 py-6 text-xl font-black outline-none text-indigo-600" value={formatCurrencyInput(newInv.amount)} onChange={(e) => setNewInv({...newInv, amount: e.target.value.replace(/\D/g, '')})} required /></div><div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> Data</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl px-6 py-6 text-sm font-black outline-none dark:text-white" value={newInv.date} onChange={(e) => setNewInv({...newInv, date: e.target.value})} required /></div></div>
                     <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl px-8 py-6 text-sm font-black outline-none dark:text-white" value={newInv.category} onChange={(e) => setNewInv({...newInv, category: e.target.value})}><option>Ações</option><option>Renda Fixa</option><option>FIIs</option><option>Cripto</option><option>Tesouro</option><option>Fundos</option></select></div>
                     <button type="submit" className="w-full bg-indigo-600 py-7 rounded-[2.5rem] text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl mt-6">Salvar Aplicação</button>
                </form>
             </div>
        </div>
      )}

      {payingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-950 w-full max-w-xs rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-slate-800 p-8">
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-center text-slate-500">Confirmar Pagamento</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"><p className="text-[9px] font-black uppercase text-slate-400 mb-2">Lançamento</p><p className="font-black text-sm text-slate-900 dark:text-white">{payingTransaction.description}</p></div>
                 <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/20"><p className="text-[9px] font-black uppercase text-indigo-500 mb-2">Valor Real</p><input autoFocus type="text" className="w-full bg-transparent border-none p-0 font-black text-lg text-indigo-600 outline-none" value={formatCurrencyInput(realValueInput)} onChange={(e) => setRealValueInput(e.target.value.replace(/\D/g, ''))} /></div>
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <button onClick={() => setPayingTransaction(null)} className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors">Voltar</button>
                    <button onClick={confirmPayment} className="py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Confirmar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;