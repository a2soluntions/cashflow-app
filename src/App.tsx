import './index.css';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, TrendingUp, Plus, Menu, X,
  CalendarDays, LineChart, Search, Coins,
  Calendar, Tag, Edit3, Target, LogOut, Wallet, 
  PieChart as PieChartIcon, Sun, Moon, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Layers, BarChart3, 
  CheckCircle2, Clock, Settings, GraduationCap 
} from 'lucide-react';
import { 
  ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Area, ComposedChart
} from 'recharts';
import { supabase } from './supabase'; 
import { Session } from '@supabase/supabase-js';
import { TransactionType, TransactionStatus, Transaction, Investment, Category, Goal } from './types';

// Componentes
import TransactionTable from './components/TransactionTable';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import MonthSelector from './components/MonthSelector';
import CategoryManager from './components/CategoryManager';
import GoalsManager from './components/GoalsManager';
import BillsManager from './components/BillsManager';
import DashboardHome from './components/DashboardHome';
import ProfileSettings from './components/ProfileSettings';
import FinancialAdvisor from './components/FinancialAdvisor';
import Auth from './components/Auth';

const OPCOES_PARCELAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48, 60, 72];
const CORES_VITTACASH = ['#22C55E', '#FF8A00', '#06b6d4', '#8b5cf6', '#f43f5e', '#eab308'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado de navegação principal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transacoes' | 'contas' | 'investimentos' | 'categorias' | 'metas' | 'perfil' | 'ajuda'>('dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ description: '', amountString: '', date: '', category: '', type: TransactionType.EXPENSE });

  const [deleteData, setDeleteData] = useState<{ id: string; type: 'transaction' | 'category' | 'goal' } | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Perfil
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null);
  const [realValueInput, setRealValueInput] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const formatCurrencyInput = (val: string) => { if (!val || val === '0') return 'R$ 0,00'; const numberValue = parseFloat(val) / 100; return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue); };

  const [newTx, setNewTx] = useState({
    description: '', totalAmount: '', installmentAmount: '', inputMode: 'total' as 'total' | 'installment',
    type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0], installments: '1', category: '', isPaid: true
  });

  const [newInv, setNewInv] = useState({
    name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Ações'
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (theme === 'dark') {
      root.classList.add('dark');
      metaThemeColor?.setAttribute("content", "#000000");
    } else {
      root.classList.remove('dark');
      metaThemeColor?.setAttribute("content", "#f8fafc"); 
    }
  }, [theme]);

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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        setUserAvatar(profileData.avatar_url);
        setUserName(profileData.full_name);
      }

    } catch (error) { console.error(error); showToast('Erro de conexão.', 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchData(); }, [session, activeTab]);
  
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

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'current_amount'>) => { if (!session?.user) return; const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: session.user.id, current_amount: 0 }]).select(); if (error) showToast('Erro ao criar.', 'error'); else { setGoals([data[0], ...goals]); showToast('Meta criada!', 'success'); } };
  const handleDepositGoal = async (id: string, amount: number) => { const goal = goals.find(g => g.id === id); if (!goal) return; const newAmount = goal.current_amount + amount; const { error } = await supabase.from('goals').update({ current_amount: newAmount }).eq('id', id); if (error) showToast('Erro ao depositar.', 'error'); else { setGoals(goals.map(g => g.id === id ? { ...g, current_amount: newAmount } : g)); showToast('Depósito realizado!', 'success'); } };
  const openEditModal = (tx: Transaction) => { setEditingTransaction(tx); const amountStr = (tx.amount * 100).toFixed(0); setEditForm({ description: tx.description, amountString: amountStr, date: tx.date, category: tx.category || '', type: tx.type }); };
  const handleUpdateTransaction = async (e: React.FormEvent) => { e.preventDefault(); if (!editingTransaction) return; const updatedAmount = parseFloat(editForm.amountString) / 100; const { error } = await supabase.from('transactions').update({ description: editForm.description, amount: updatedAmount, date: editForm.date, category: editForm.category, type: editForm.type }).eq('id', editingTransaction.id); if (error) showToast('Erro ao atualizar.', 'error'); else { showToast('Atualizado!', 'success'); setEditingTransaction(null); fetchData(); } };
  const handleAddCategory = async (name: string, type: TransactionType) => { const { data, error } = await supabase.from('categories').insert([{ name, type }]).select(); if (error) showToast('Erro ao criar categoria.', 'error'); else if (data) { setCategories([...categories, data[0]]); showToast('Categoria criada!', 'success'); } };
  
  const handleValueChange = (val: string, mode: 'total' | 'installment') => {
      const numeric = val.replace(/\D/g, '');
      const installments = parseInt(newTx.installments) || 1;
      setNewTx(prev => {
          const newState = { ...prev, inputMode: mode };
          if (mode === 'total') {
              newState.totalAmount = numeric;
              const totalVal = parseFloat(numeric);
              if (!isNaN(totalVal)) newState.installmentAmount = Math.round(totalVal / installments).toString();
          } else {
              newState.installmentAmount = numeric;
              const instVal = parseFloat(numeric);
              if (!isNaN(instVal)) newState.totalAmount = (instVal * installments).toString();
          }
          return newState;
      });
  };

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const countStr = e.target.value;
      const count = parseInt(countStr) || 1;
      setNewTx(prev => {
          const newState = { ...prev, installments: countStr };
          if (prev.inputMode === 'total') {
              const totalVal = parseFloat(prev.totalAmount);
              if (!isNaN(totalVal)) newState.installmentAmount = Math.round(totalVal / count).toString();
          } else {
              const instVal = parseFloat(prev.installmentAmount);
              if (!isNaN(instVal)) newState.totalAmount = (instVal * count).toString();
          }
          return newState;
      });
  };

  const handleAddTransaction = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!session?.user) return;
    const numParcelas = parseInt(newTx.installments);
    const qtdFinal = numParcelas > 0 ? numParcelas : 1;
    let valorFinalParcela = 0;
    if (newTx.inputMode === 'total') valorFinalParcela = (parseFloat(newTx.totalAmount) / 100) / qtdFinal;
    else valorFinalParcela = parseFloat(newTx.installmentAmount) / 100;

    const newEntries = [];
    const finalCategory = newTx.category || (categories.find(c => c.type === newTx.type)?.name || 'Geral'); 
    const [year, month, day] = newTx.date.split('-').map(Number);
    for (let i = 0; i < qtdFinal; i++) { 
      const txDate = new Date(year, (month - 1) + i, day);
      const dateString = txDate.toLocaleDateString('en-CA'); 
      newEntries.push({ 
        user_id: session.user.id, 
        account_id: 'acc1', 
        category: finalCategory, 
        amount: valorFinalParcela, 
        description: qtdFinal > 1 ? `${newTx.description} (${i + 1}/${qtdFinal})` : newTx.description, 
        type: newTx.type, 
        status: newTx.isPaid ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
        paid_amount: newTx.isPaid ? valorFinalParcela : 0,
        date: dateString, 
        is_recurring: qtdFinal > 1 
      }); 
    } 
    const { error } = await supabase.from('transactions').insert(newEntries); 
    if (error) { 
        showToast('Erro ao salvar.', 'error'); 
    } 
    else { 
        setIsModalOpen(false); 
        setNewTx({ description: '', category: '', totalAmount: '', installmentAmount: '', type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0], installments: '1', inputMode: 'total', isPaid: true }); 
        showToast(`Lançado ${qtdFinal}x com sucesso!`, 'success'); 
        await fetchData(); 
    } 
  };

  const handleAddInvestment = async (e: React.FormEvent) => { e.preventDefault(); if (!session?.user) return; const amount = parseFloat(newInv.amount) / 100; const investment = { user_id: session.user.id, name: newInv.name, category: newInv.category, invested_amount: amount, current_amount: amount, created_at: new Date(newInv.date).toISOString() }; const { error } = await supabase.from('investments').insert([investment]); if (error) showToast('Erro ao salvar.', 'error'); else { fetchData(); setIsInvestmentModalOpen(false); setNewInv({ name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Ações' }); showToast('Salvo!', 'success'); } };
  const confirmPayment = async () => { if (!payingTransaction) return; const paid = parseFloat(realValueInput) / 100; const { error } = await supabase.from('transactions').update({ status: TransactionStatus.COMPLETED, paid_amount: paid }).eq('id', payingTransaction.id); if (error) showToast('Erro ao confirmar.', 'error'); else { fetchData(); setPayingTransaction(null); showToast('Confirmado!', 'success'); } };

  const filteredTransactions = useMemo(() => { return transactions.filter(t => { const tDate = new Date(t.date); tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset()); return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear(); }); }, [transactions, currentDate]);
  const totalApplied = useMemo(() => investments.reduce((acc, curr) => acc + curr.invested_amount, 0), [investments]);
  const totalCurrent = useMemo(() => investments.reduce((acc, curr) => acc + curr.current_amount, 0), [investments]);
  const totalProfit = totalCurrent - totalApplied;
  
  const urgencies = useMemo(() => { 
      const today = new Date(); 
      today.setHours(0,0,0,0);
      const pendingExpenses = transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === TransactionType.EXPENSE);
      const delayed = pendingExpenses.filter(t => { const tDate = new Date(t.date + 'T12:00:00'); return tDate < today; }); 
      return { delayedCount: delayed.length }; 
  }, [transactions]);

  const currentBalance = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + t.amount, 0);
      
    return income - expense;
  }, [transactions]);
  
  const navButtonClass = (active: boolean) => `w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest ${active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-200/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-100/5'}`;
  
  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);
  
  const patrimonyData = useMemo(() => {
      if (investments.length === 0) return [];
      const sortedInv = [...investments].sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
      let cumulative = 0;
      return sortedInv.map(inv => {
          cumulative += inv.current_amount;
          return { name: new Date(inv.created_at || '').toLocaleDateString('pt-BR', {month: 'short'}), total: cumulative, aporte: inv.current_amount };
      });
  }, [investments]);
  
  const comparativeData = useMemo(() => {
      const data: Record<string, {name: string, Investido: number, Atual: number}> = {};
      investments.forEach(inv => {
          if (!data[inv.category]) data[inv.category] = { name: inv.category, Investido: 0, Atual: 0 };
          data[inv.category].Investido += inv.invested_amount;
          data[inv.category].Atual += inv.current_amount;
      });
      return Object.values(data);
  }, [investments]);

  const totalInvested = investmentAllocation.reduce((acc, cur) => acc + (cur.name !== 'Sem ativos' ? cur.value : 0), 0);
  const centerAsset = useMemo(() => {
      if (selectedAssetIndex !== null && investmentAllocation[selectedAssetIndex]) {
          return { label: investmentAllocation[selectedAssetIndex].name, value: investmentAllocation[selectedAssetIndex].value };
      }
      return { label: 'Total', value: totalInvested };
  }, [selectedAssetIndex, investmentAllocation, totalInvested]);

  const modalAccentColor = newTx.type === TransactionType.EXPENSE ? 'orange' : 'emerald';
  const modalBorderClass = newTx.type === TransactionType.EXPENSE ? 'focus:border-orange-500' : 'focus:border-emerald-500';

  if (!session) return <Auth />;

  const renderContent = () => {
    if (activeTab === 'dashboard') return <DashboardHome transactions={transactions} investments={investments} filteredTransactions={filteredTransactions} currentDate={currentDate} />;
    
    if (activeTab === 'perfil') return <ProfileSettings session={session} />;
    if (activeTab === 'ajuda') return <FinancialAdvisor transactions={transactions} currentBalance={currentBalance} />;
    
    if (activeTab === 'categorias') return <CategoryManager categories={categories} onAdd={handleAddCategory} onDelete={(id) => requestDelete(id, 'category')} />;
    if (activeTab === 'metas') return <GoalsManager goals={goals} onAdd={handleAddGoal} onDeposit={handleDepositGoal} onDelete={(id) => requestDelete(id, 'goal')} />;
    
    if (activeTab === 'contas') {
        const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PENDING);
        return ( <BillsManager transactions={expenseTransactions} onDelete={(id) => requestDelete(id, 'transaction')} onEdit={openEditModal} onAddClick={() => setIsModalOpen(true)} onPay={(id) => { const tx = transactions.find(t => t.id === id); if (tx) { setPayingTransaction(tx); setRealValueInput((tx.amount * 100).toString()); } }} /> );
    }

    if (activeTab === 'investimentos') {
      return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto lg:overflow-hidden p-1 pb-20 lg:pb-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl"><Layers className="w-5 h-5 text-slate-500" /></div>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg uppercase">Aplicado</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {totalApplied.toLocaleString()}</h3>
                </div>
                <div className="bg-emerald-600 rounded-[2rem] p-5 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Coins className="w-16 h-16" /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><TrendingUp className="w-5 h-5" /></div>
                            <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase">Patrimônio</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tighter mt-4">R$ {totalCurrent.toLocaleString()}</h3>
                    </div>
                </div>
                <div className={`rounded-[2rem] p-5 shadow-sm border flex flex-col justify-center relative overflow-hidden ${totalProfit >= 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-500/20'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>Rentabilidade</span>
                        <div className={`p-1.5 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-200/50 text-emerald-700' : 'bg-rose-200/50 text-rose-700'}`}>
                            {totalProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                    </div>
                    <h3 className={`text-2xl font-black tracking-tighter ${totalProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {totalProfit >= 0 ? '+' : ''} R$ {Math.abs(totalProfit).toLocaleString()}
                    </h3>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 shrink-0 lg:h-[250px]">
                
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] shadow-sm flex flex-col h-[300px] lg:h-full overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Evolução</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={patrimonyData}>
                                <defs>
                                    <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} 
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`, '']}
                                />
                                <Bar dataKey="aporte" barSize={12} fill="#FF8A00" radius={[4, 4, 0, 0]} name="Aporte Mês" />
                                <Area type="monotone" dataKey="total" stroke="#22C55E" strokeWidth={3} fill="url(#gradPatrimonio)" name="Patrimônio Total" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] flex flex-col shadow-sm h-[300px] lg:h-full overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><PieChartIcon className="w-4 h-4" /> Alocação</h3>
                    <div className="flex-1 flex flex-col items-center justify-between min-h-0">
                        <div className="h-[150px] w-full relative">
                             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{centerAsset.label}</span>
                                 <span className="text-lg font-black text-slate-900 dark:text-white">
                                      {centerAsset.value >= 1000 ? `${(centerAsset.value / 1000).toFixed(1)}k` : centerAsset.value.toLocaleString()}
                                 </span>
                             </div>
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                      data={investmentAllocation} 
                                      innerRadius={50} 
                                      outerRadius={65} 
                                      paddingAngle={4}
                                      dataKey="value" 
                                      stroke="none"
                                      onClick={(_, index) => setSelectedAssetIndex(index === selectedAssetIndex ? null : index)}
                                    >
                                        {investmentAllocation.map((_, index) => (
                                            <Cell 
                                              key={`cell-${index}`} 
                                              fill={CORES_VITTACASH[index % CORES_VITTACASH.length]} 
                                              opacity={selectedAssetIndex === null || selectedAssetIndex === index ? 1 : 0.3}
                                              style={{cursor: 'pointer'}}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="w-full flex flex-wrap justify-center gap-1.5 overflow-y-auto custom-scrollbar max-h-[60px]">
                             {investmentAllocation.map((item, i) => {
                                 const isSelected = selectedAssetIndex === i;
                                 return (
                                     <button 
                                         key={i} 
                                         onClick={() => setSelectedAssetIndex(isSelected ? null : i)}
                                         className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                                             isSelected 
                                             ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 scale-105 shadow-sm' 
                                             : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                         }`}
                                     >
                                         <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor: CORES_VITTACASH[i % CORES_VITTACASH.length]}}></div>
                                         <span className={`text-[8px] font-bold uppercase truncate max-w-[60px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                             {item.name}
                                         </span>
                                     </button>
                                 )
                             })}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] shadow-sm flex flex-col h-[300px] lg:h-full overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><LineChart className="w-4 h-4" /> Performance</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparativeData} barGap={2} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.05} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={50} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} 
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`, '']}
                                />
                                <Bar dataKey="Investido" fill="#64748b" radius={[0, 4, 4, 0]} barSize={8} name="Investido" />
                                <Bar dataKey="Atual" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={8} name="Atual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col min-h-0 shadow-sm border border-slate-100 dark:border-zinc-800 lg:h-auto h-auto shrink-0">
                <div className="flex items-center justify-between p-6 pb-4 shrink-0">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div><h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Meus Ativos</h2></div>
                    <button onClick={() => setIsInvestmentModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30"><Plus className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-wider">Nova Aplicação</span></button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-orange-50 dark:bg-orange-900/10 z-10">
                            <tr>
                                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 rounded-tl-2xl">Ativo</th>
                                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Categoria</th>
                                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Aplicado</th>
                                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Atual</th>
                                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 text-right rounded-tr-2xl">Rent.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map((inv) => { 
                                const profit = ((inv.current_amount / inv.invested_amount) - 1) * 100; 
                                return (
                                    <tr key={inv.id} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-4 px-4 font-normal text-sm text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{inv.name}</td>
                                        <td className="py-4 px-4 text-xs font-normal text-slate-500">{inv.category}</td>
                                        <td className="py-4 px-4 text-sm font-normal text-slate-500">R$ {inv.invested_amount.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-sm font-medium text-emerald-600">R$ {inv.current_amount.toLocaleString()}</td>
                                        <td className={`py-4 px-4 text-xs font-medium text-right ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{profit >= 0 ? '↑' : '↓'} {Math.abs(profit).toFixed(1)}%</td>
                                    </tr>
                                ); 
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      );
    }

    const isHistory = activeTab === 'transacoes';
    const list = isHistory ? filteredTransactions.filter(t => t.status === TransactionStatus.COMPLETED) : [];
    return (
      <div className="h-full flex flex-col min-h-0 min-w-0 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-y-auto p-3 md:p-6 custom-scrollbar min-h-0 shadow-sm border border-slate-100 dark:border-zinc-800">
            {loading ? <p className="text-center p-10 text-slate-400">Carregando...</p> : <TransactionTable transactions={list} onDelete={!isHistory ? (id) => requestDelete(id, 'transaction') : undefined} onEdit={!isHistory ? openEditModal : undefined} onPay={!isHistory ? (id) => { const tx = transactions.find(t => t.id === id); if (tx) { setPayingTransaction(tx); setRealValueInput((tx.amount * 100).toString()); } } : undefined} />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-200 flex overflow-hidden font-inter">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal isOpen={!!deleteData} onClose={() => setDeleteData(null)} onConfirm={handleConfirmDelete} title={`Excluir ${deleteData?.type === 'category' ? 'Categoria' : deleteData?.type === 'goal' ? 'Meta' : 'Lançamento'}?`} message="Esta ação não pode ser desfeita." />
      {isSidebarOpen && ( <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" ></div> )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-black lg:relative lg:translate-x-0 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-8 flex flex-col h-full">
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                    <img src="/logo.png" alt="VittaCash" className="w-full h-full object-contain" />
                 </div>
                 <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">VittaCash</h1>
               </div>
               <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="w-6 h-6" /></button>
             </div>
             <nav className="space-y-3 flex-1">
                <button onClick={() => { setIsModalOpen(true); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm"><Plus className="w-5 h-5" /><span>Lançamento</span></button>
                <div className="py-2"><MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} /></div>
                <div className="h-px bg-slate-200 dark:bg-zinc-800 my-4 opacity-30"></div>
                <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'dashboard')}><LayoutDashboard className="w-5 h-5" /><span>Dashboard</span></button>
                <button onClick={() => { setActiveTab('ajuda'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'ajuda')}><GraduationCap className="w-5 h-5" /><span>Consultor</span></button>
                <button onClick={() => { setActiveTab('categorias'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'categorias')}><Tag className="w-5 h-5" /><span>Categorias</span></button>
                <button onClick={() => { setActiveTab('metas'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'metas')}><Target className="w-5 h-5" /><span>Metas</span></button>
                <button onClick={() => { setActiveTab('investimentos'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'investimentos')}><LineChart className="w-5 h-5" /><span>Aplicações</span></button>
                <button onClick={() => { setActiveTab('contas'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'contas')}><CalendarDays className="w-5 h-5" /><span>Contas</span></button>
                <button onClick={() => { setActiveTab('transacoes'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'transacoes')}><ArrowLeftRight className="w-5 h-5" /><span>Histórico</span></button>
                <div className="h-px bg-slate-200 dark:bg-zinc-800 my-2 opacity-30"></div>
                <button onClick={() => { setActiveTab('perfil'); setSidebarOpen(false); }} className={navButtonClass(activeTab === 'perfil')}><Settings className="w-5 h-5" /><span>Configurações</span></button>
             </nav>
             <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-black text-[12px] uppercase tracking-widest mt-auto"><LogOut className="w-5 h-5" /><span>Sair</span></button>
           </div>
      </aside>
      <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden relative min-w-0">
        <header className="h-20 flex items-center justify-between px-8 lg:px-12 shrink-0 z-40">
           <div className="flex items-center gap-6"><button className="lg:hidden p-3 text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button><div className="hidden lg:flex items-center gap-2"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] opacity-50">Portal Financeiro Inteligente</span></div></div>
           <div className="flex-1"></div>
           <div className="flex items-center gap-3">
              {urgencies.delayedCount > 0 && (<button onClick={() => setActiveTab('contas')} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all shadow-sm group"><AlertCircle className="w-4 h-4 group-hover:animate-shake" /><span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{urgencies.delayedCount} Atrasos</span></button>)}
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm active:scale-90">{theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}</button>
              <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-500/30">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-emerald-500/30">
                  {userAvatar ? (
                      <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                      session?.user?.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-black uppercase truncate max-w-[200px] text-slate-700 dark:text-slate-200">
                      {userName || session?.user?.email}
                    </p>
                </div>
              </div>
           </div>
        </header>
        <div className="flex-1 px-4 lg:px-12 pb-8 overflow-hidden flex flex-col min-h-0">{renderContent()}</div>
      </main>

      {/* MODAIS (EDIÇÃO, NOVO, INVEST, PAGAR) */}
      {/* ... (O código dos modais continua igual ao que você já tinha, mantido aqui para brevidade e não causar erro de 'missing jsx') ... */}
      
      {editingTransaction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="font-black text-xl uppercase tracking-tighter text-amber-500 flex items-center gap-2"><Edit3 className="w-5 h-5"/> Editar</h3><button onClick={() => setEditingTransaction(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all bg-slate-50 dark:bg-zinc-900 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Descrição</label><input type="text" className="w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Valor</label><input type="text" className="w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={formatCurrencyInput(editForm.amountString)} onChange={(e) => setEditForm({...editForm, amountString: e.target.value.replace(/\D/g, '')})} required /></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Data</label><input type="date" className="w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-xs font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} required /></div></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-amber-500 shadow-inner" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}><option value="">Sem categoria</option>{categories.filter(c => c.type === editForm.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 mt-2">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4"><h3 className={`font-black text-xl uppercase tracking-tighter ${newTx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-orange-500'}`}>Novo Lançamento</h3><button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all bg-slate-50 dark:bg-zinc-900 rounded-xl"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Descrição</label><input type="text" className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium outline-none border-2 border-transparent ${modalBorderClass} shadow-inner`} value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} required /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium outline-none border-2 border-transparent ${modalBorderClass} shadow-inner`} value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})}><option value="">Selecione uma Categoria...</option>{categories.filter(c => c.type === newTx.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="flex gap-2 mb-1">
                        <button type="button" onClick={() => setNewTx({...newTx, inputMode: 'total'})} className={`flex-1 text-[9px] font-black uppercase py-2 rounded-lg transition-all ${newTx.inputMode === 'total' ? `bg-${modalAccentColor}-100 text-${modalAccentColor}-600 dark:bg-${modalAccentColor}-900/30 dark:text-${modalAccentColor}-400` : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Valor Total</button>
                        <button type="button" onClick={() => setNewTx({...newTx, inputMode: 'installment'})} className={`flex-1 text-[9px] font-black uppercase py-2 rounded-lg transition-all ${newTx.inputMode === 'installment' ? `bg-${modalAccentColor}-100 text-${modalAccentColor}-600 dark:bg-${modalAccentColor}-900/30 dark:text-${modalAccentColor}-400` : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Valor Parcela</button>
                    </div>
                    {newTx.inputMode === 'total' ? ( <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Valor Total</label><input type="text" className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-${modalAccentColor}-500 shadow-inner`} value={formatCurrencyInput(newTx.totalAmount)} onChange={(e) => handleValueChange(e.target.value, 'total')} required /></div> ) : ( <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Valor da Parcela</label><input type="text" className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-${modalAccentColor}-500 shadow-inner`} value={formatCurrencyInput(newTx.installmentAmount)} onChange={(e) => handleValueChange(e.target.value, 'installment')} required /></div> )}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Parcelas</label>
                            <select className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium outline-none border-2 border-transparent ${modalBorderClass} appearance-none shadow-inner cursor-pointer`} value={newTx.installments} onChange={handleInstallmentsChange}>
                                <option value="1">À Vista</option>
                                {OPCOES_PARCELAS.map(n => <option key={n} value={n}>{n}x</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Vencimento</label><input type="date" className={`w-full bg-slate-50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-xs font-medium outline-none border-2 border-transparent ${modalBorderClass} shadow-inner`} value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} required /></div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 h-[48px]"><button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.INCOME})} className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${newTx.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}>Receita</button><button type="button" onClick={() => setNewTx({...newTx, type: TransactionType.EXPENSE})} className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500'}`}>Despesa</button></div>
                    
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setNewTx({...newTx, isPaid: true})} className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${newTx.isPaid ? `border-${modalAccentColor}-500 bg-${modalAccentColor}-50 dark:bg-${modalAccentColor}-900/20 text-${modalAccentColor}-600 dark:text-${modalAccentColor}-400` : 'border-slate-200 dark:border-zinc-800 text-slate-400'}`}><CheckCircle2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Confirmado</span></button>
                        <button type="button" onClick={() => setNewTx({...newTx, isPaid: false})} className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${!newTx.isPaid ? `border-${modalAccentColor}-500 bg-${modalAccentColor}-50 dark:bg-${modalAccentColor}-900/20 text-${modalAccentColor}-600 dark:text-${modalAccentColor}-400` : 'border-slate-200 dark:border-zinc-800 text-slate-400'}`}><Clock className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Agendado</span></button>
                    </div>

                    <button type="submit" className={`w-full py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.1em] shadow-xl active:scale-95 transition-all mt-2 ${newTx.type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'}`}>Lançar Agora</button>
                </form>
              </div>
        </div>
      )}

      {isInvestmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[3.5rem] shadow-3xl border border-slate-100 dark:border-zinc-800 p-10 transform scale-100">
                <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4"><div className="p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-500/30"><Coins className="w-8 h-8 text-white" /></div><h3 className="font-black text-2xl lg:text-3xl uppercase tracking-tighter text-slate-900 dark:text-white">Nova Aplicação</h3></div><button onClick={() => setIsInvestmentModalOpen(false)} className="p-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all bg-slate-50 dark:bg-zinc-900 rounded-3xl"><X className="w-7 h-7" /></button></div>
                <form onSubmit={handleAddInvestment} className="space-y-8">
                     <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Search className="w-4 h-4 text-emerald-500" /> Ativo Selecionado</label><input type="text" placeholder="Ticker ou Nome" className="w-full bg-slate-50 dark:bg-zinc-900 rounded-3xl px-8 py-6 text-lg font-medium outline-none" value={newInv.name} onChange={(e) => setNewInv({...newInv, name: e.target.value})} required /></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" /> Valor</label><input type="text" className="w-full bg-emerald-50/50 dark:bg-emerald-500/10 rounded-3xl px-6 py-6 text-xl font-medium outline-none text-emerald-600" value={formatCurrencyInput(newInv.amount)} onChange={(e) => setNewInv({...newInv, amount: e.target.value.replace(/\D/g, '')})} required /></div><div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Data</label><input type="date" className="w-full bg-slate-50 dark:bg-zinc-900 rounded-3xl px-6 py-6 text-sm font-medium outline-none dark:text-white" value={newInv.date} onChange={(e) => setNewInv({...newInv, date: e.target.value})} required /></div></div>
                     <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full bg-slate-50 dark:bg-zinc-900 rounded-3xl px-8 py-6 text-sm font-medium outline-none dark:text-white" value={newInv.category} onChange={(e) => setNewInv({...newInv, category: e.target.value})}><option>Ações</option><option>Renda Fixa</option><option>FIIs</option><option>Cripto</option><option>Tesouro</option><option>Fundos</option></select></div>
                     <button type="submit" className="w-full bg-emerald-600 py-7 rounded-[2.5rem] text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl mt-6">Salvar Aplicação</button>
                </form>
             </div>
        </div>
      )}

      {payingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-zinc-950 w-full max-w-xs rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-zinc-800 p-8">
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-center text-slate-500">Confirmar Pagamento</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800"><p className="text-[9px] font-black uppercase text-slate-400 mb-2">Lançamento</p><p className="font-medium text-sm text-slate-900 dark:text-white">{payingTransaction.description}</p></div>
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/20"><p className="text-[9px] font-black uppercase text-emerald-500 mb-2">Valor Real</p><input autoFocus type="text" className="w-full bg-transparent border-none p-0 font-medium text-lg text-emerald-600 outline-none" value={formatCurrencyInput(realValueInput)} onChange={(e) => setRealValueInput(e.target.value.replace(/\D/g, ''))} /></div>
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <button onClick={() => setPayingTransaction(null)} className="py-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors">Voltar</button>
                    <button onClick={confirmPayment} className="py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-95">Confirmar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;