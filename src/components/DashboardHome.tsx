import React, { useMemo } from 'react';
import { 
  Wallet, TrendingUp, CreditCard, Flame, BarChart3, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { Transaction, Investment, TransactionType, TransactionStatus } from '../types';
import StatCard from './StatCard';
import FinancialHealthWidget from './FinancialHealthWidget';

const CORES_MODERNAS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

interface DashboardHomeProps {
  transactions: Transaction[];
  investments: Investment[];
  currentDate: Date;
  filteredTransactions: Transaction[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  // CÁLCULOS
  const stats = useMemo(() => {
    const allCompleted = transactions.filter(t => t.status === TransactionStatus.COMPLETED);
    const allIncome = allCompleted.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
    const allExpense = allCompleted.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
    const totalBalance = allIncome - allExpense;

    const monthlyIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
    const monthlyExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
    
    const totalInterests = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE && (t.paid_amount || 0) > t.amount)
                                    .reduce((acc, curr) => acc + ((curr.paid_amount || 0) - curr.amount), 0);
    
    const interestPercent = monthlyExpense > 0 ? (totalInterests / monthlyExpense) * 100 : 0;
    const expensePercent = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
    const balancePercent = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
    
    return { totalBalance, monthlyIncome, monthlyExpense, totalInterests, interestPercent, expensePercent, balancePercent };
  }, [transactions, filteredTransactions]);

  
  const dashboardData = useMemo(() => [
    { name: 'Jan', despesa: 2400, receita: 4000, juros: 120, patrimonio: 15000 },
    { name: 'Fev', despesa: 1398, receita: 3000, juros: 80, patrimonio: 18000 },
    { name: 'Mar', despesa: 4200, receita: 2000, juros: 450, patrimonio: 22000 },
    { name: 'Abr', despesa: 3908, receita: 2780, juros: 210, patrimonio: 25000 },
    { name: 'Mai', despesa: 4800, receita: 1890, juros: 350, patrimonio: 29000 },
    { name: 'Jun', despesa: 3800, receita: 2390, juros: 180, patrimonio: 32000 },
  ], []);

  const realExpenseDistribution = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const dist: Record<string, number> = {};
    expenses.forEach(t => {
      const catName = t.category || 'Outros'; 
      dist[catName] = (dist[catName] || 0) + t.amount;
    });
    const data = Object.entries(dist).map(([name, value]) => ({ name, value }));
    if (data.length === 0) return [{ name: 'Sem dados', value: 1 }];
    return data;
  }, [filteredTransactions]);

  const investmentAllocation = useMemo(() => {
    const allocation: Record<string, number> = {};
    investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; });
    const data = Object.entries(allocation).map(([name, value]) => ({ name, value }));
    if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }];
    return data;
  }, [investments]);

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-w-0">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
        <StatCard title="Saldo Total" value={stats.totalBalance} icon={Wallet} color="bg-indigo-600" compact trend={{ value: parseFloat(stats.balancePercent.toFixed(1)), isPositive: stats.totalBalance >= 0 }} />
        <StatCard title="Receitas" value={stats.monthlyIncome} icon={TrendingUp} color="bg-emerald-600" compact trend={{ value: 100, isPositive: true }} />
        <StatCard title="Despesas" value={stats.monthlyExpense} icon={CreditCard} color="bg-rose-600" compact trend={{ value: parseFloat(stats.expensePercent.toFixed(1)), isPositive: false }} />
        <StatCard title="Juros Pagos" value={stats.totalInterests} icon={Flame} color="bg-orange-600" compact trend={{ value: parseFloat(stats.interestPercent.toFixed(1)), isPositive: false }} />
        <div className="col-span-2 lg:col-span-1"><FinancialHealthWidget income={stats.monthlyIncome} expense={stats.monthlyExpense} balance={stats.totalBalance} debts={0} lazerGrowth={25} isCompact /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[250px] shrink-0 min-w-0">
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-[2.5rem] flex flex-col shadow-sm relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Evolução</h3>
            <div className="flex-1 relative min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <defs><linearGradient id="barInc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={1}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.5}/></linearGradient><linearGradient id="barExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.5}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8 }} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} />
                    <Bar name="Rec" dataKey="receita" fill="url(#barInc)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar name="Desp" dataKey="despesa" fill="url(#barExp)" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-[2.5rem] flex flex-col shadow-sm relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Distribuição de Gastos</h3>
            <div className="flex-1 relative w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie 
                        data={realExpenseDistribution} 
                        innerRadius="40%" 
                        outerRadius="70%" 
                        paddingAngle={4} 
                        dataKey="value" 
                        stroke="none"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        style={{ fontSize: '10px', fontWeight: 'bold' }}
                    >
                        {realExpenseDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={CORES_MODERNAS[index % CORES_MODERNAS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-[2.5rem] flex flex-col shadow-sm relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><Flame className="w-4 h-4" /> Juros</h3>
            <div className="flex-1 relative w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                    <defs><linearGradient id="gradJuros" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="name" hide /><YAxis hide /><Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} /><Area type="monotone" dataKey="juros" stroke="#f59e0b" fill="url(#gradJuros)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 min-w-0 overflow-hidden">
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] flex flex-col shadow-sm h-full relative overflow-hidden min-w-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><TrendingUpIcon className="w-4 h-4" /> Fluxo de Caixa</h3>
            <div className="flex-1 relative w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <defs><linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} /><YAxis hide /><Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} /><Area name="Receita" type="monotone" dataKey="receita" stroke="#10b981" fill="url(#gradRec)" strokeWidth={3} /><Area name="Despesa" type="monotone" dataKey="despesa" stroke="#f43f5e" fill="url(#gradExp)" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] flex flex-col shadow-sm h-full overflow-hidden min-w-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><PieChartIcon className="w-4 h-4" /> Alocação</h3>
            <div className="flex-1 flex items-center gap-8 min-h-0 w-full relative">
                <div className="flex-1 h-full relative min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={investmentAllocation} innerRadius="55%" outerRadius="85%" dataKey="value" stroke="none">
                            {investmentAllocation.map((_, i) => <Cell key={i} fill={CORES_MODERNAS[i % CORES_MODERNAS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3 pr-6 overflow-y-auto custom-scrollbar h-full py-2">
                    {investmentAllocation.map((item, i) => (<div key={i} className="flex flex-col border-l-4 pl-4 py-2 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-2xl" style={{ borderColor: CORES_MODERNAS[i % CORES_MODERNAS.length] }}><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">{item.name}</span><span className="text-sm font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span></div>))}
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default DashboardHome;