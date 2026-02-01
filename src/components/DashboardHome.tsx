import React, { useMemo, useState } from 'react';
import { 
  Wallet, TrendingUp, Flame, CalendarClock, PieChart as PieChartIcon, AlertCircle, BarChart3, Hourglass, Target, Globe, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import { Transaction, Investment, TransactionType, TransactionStatus } from '../types';

interface DashboardHomeProps {
  transactions: Transaction[];        
  investments: Investment[];          
  filteredTransactions: Transaction[]; 
  currentDate: Date;
}

const CORES_VITTACASH = ['#22C55E', '#FF8A00', '#06b6d4', '#8b5cf6', '#f43f5e', '#eab308'];

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  const [showMonthlyBalance, setShowMonthlyBalance] = useState(false);
  const [showMonthlyPayable, setShowMonthlyPayable] = useState(true);

  // --- HELPER DE FORMATAÇÃO (CORRIGIDO) ---
  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- CÁLCULOS GLOBAIS ---
  const globalBalance = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + (t.paid_amount || t.amount), 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => acc + (t.paid_amount || t.amount), 0);
    return income - expense;
  }, [transactions]);

  const globalPayable = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PENDING)
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // --- CÁLCULOS DO MÊS ---
  const completedFiltered = useMemo(() => filteredTransactions.filter(t => t.status === TransactionStatus.COMPLETED), [filteredTransactions]);
  const pendingFiltered = useMemo(() => filteredTransactions.filter(t => t.status === TransactionStatus.PENDING), [filteredTransactions]);

  const monthRealIncome = completedFiltered.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
  const monthRealExpense = completedFiltered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
  const monthBalance = monthRealIncome - monthRealExpense;

  const forecastExpense = pendingFiltered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const forecastIncome = pendingFiltered.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);

  const displayBalance = showMonthlyBalance ? monthBalance : globalBalance;
  const displayPayable = showMonthlyPayable ? forecastExpense : globalPayable;

  // --- DADOS PARA GRÁFICOS ---
  const evolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset());
            return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear() && t.status === TransactionStatus.COMPLETED;
        });
        const ent = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
        const sai = monthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + (curr.paid_amount || curr.amount), 0);
        result.push({ name: months[d.getMonth()], entrada: ent, saida: sai });
    }
    return result;
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    completedFiltered.filter(t => t.type === TransactionType.EXPENSE).forEach(t => { 
        data[t.category || 'Outros'] = (data[t.category || 'Outros'] || 0) + (t.paid_amount || t.amount); 
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [completedFiltered]);

  const jurosData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset());
            return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear() && t.status === TransactionStatus.COMPLETED && t.type === TransactionType.EXPENSE;
        });
        const totalInterest = monthExpenses.reduce((acc, t) => {
            const original = t.amount || 0;
            const paid = t.paid_amount || 0;
            return paid > original ? acc + (paid - original) : acc;
        }, 0);
        result.push({ name: months[d.getMonth()], valor: totalInterest });
    }
    return result;
  }, [transactions]);

  const totalInterestPeriod = jurosData.reduce((acc, item) => acc + item.valor, 0);

  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);

  const totalExpenseMonth = expenseByCategory.reduce((acc, cur) => acc + cur.value, 0);
  const totalInvested = investmentAllocation.reduce((acc, cur) => acc + (cur.name !== 'Sem ativos' ? cur.value : 0), 0);

  const getCenterLabel = (data: any[], selectedIndex: number | null, defaultLabel: string, totalValue: number) => {
      if (selectedIndex !== null && data[selectedIndex]) return { label: data[selectedIndex].name, value: data[selectedIndex].value };
      return { label: defaultLabel, value: totalValue };
  };

  const centerCategory = getCenterLabel(expenseByCategory, selectedCategoryIndex, "Total Mês", totalExpenseMonth);
  const centerAsset = getCenterLabel(investmentAllocation, selectedAssetIndex, "Patrimônio", totalInvested);

  // Estilos
  const cardStyle = "bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col justify-center min-h-[90px]";
  const iconBoxStyle = "p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 shrink-0";
  const labelStyle = "text-[9px] font-black uppercase tracking-widest ml-2 opacity-70";
  const valueStyle = "text-lg font-black tracking-tighter mt-1 truncate";

  return (
    <div className="flex flex-col gap-3 h-full w-full overflow-y-auto lg:overflow-hidden p-1 pb-20 lg:pb-1">
      
      {/* LINHA 1: CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        
        {/* CARD 1: SALDO */}
        <div className={`${cardStyle} ${displayBalance >= 0 ? 'border-emerald-500/30' : 'border-orange-500/30'} relative group`}>
            <button onClick={() => setShowMonthlyBalance(!showMonthlyBalance)} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-emerald-500 transition-all z-10" title={showMonthlyBalance ? "Ver Saldo Global" : "Ver Saldo do Mês"}>
                {showMonthlyBalance ? <Globe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            </button>
            <div className="flex items-center mb-1"><div className={iconBoxStyle}><Wallet className={`w-4 h-4 ${displayBalance >= 0 ? 'text-emerald-500' : 'text-orange-500'}`} /></div><span className={`${labelStyle} ${displayBalance >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>{showMonthlyBalance ? "Saldo Mês" : "Saldo Global"}</span></div>
            <h3 className={`${valueStyle} ${displayBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-orange-600 dark:text-orange-400'}`}>{formatCurrency(displayBalance)}</h3>
        </div>

        {/* CARD 2: RECEITAS */}
        <div className={cardStyle}>
            <div className="flex items-center mb-1"><div className={iconBoxStyle}><TrendingUp className="w-4 h-4 text-emerald-500" /></div><span className={`${labelStyle} text-emerald-500`}>Receitas (Mês)</span></div>
            <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>{formatCurrency(monthRealIncome)}</h3>
        </div>

        {/* CARD 3: PAGOS */}
        <div className={cardStyle}>
            <div className="flex items-center mb-1"><div className={iconBoxStyle}><Flame className="w-4 h-4 text-orange-500" /></div><span className={`${labelStyle} text-orange-500`}>Pagos (Mês)</span></div>
            <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>{formatCurrency(monthRealExpense)}</h3>
        </div>

        {/* CARD 4: A RECEBER */}
        <div className={cardStyle}>
            <div className="flex items-center mb-1"><div className={iconBoxStyle}><Hourglass className="w-4 h-4 text-emerald-400" /></div><span className={`${labelStyle} text-emerald-400`}>A Receber</span></div>
            <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>{formatCurrency(forecastIncome)}</h3>
        </div>
        
        {/* CARD 5: A PAGAR */}
        <div className={`${cardStyle} relative group`}>
             <button onClick={() => setShowMonthlyPayable(!showMonthlyPayable)} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-orange-500 transition-all z-10" title={showMonthlyPayable ? "Ver A Pagar do Mês" : "Ver Dívida Total"}>
                {showMonthlyPayable ? <Globe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
             </button>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><CalendarClock className="w-4 h-4 text-orange-400" /></div><span className={`${labelStyle} text-orange-400`}>{showMonthlyPayable ? "A Pagar (Mês)" : "Dívida Global"}</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>{formatCurrency(displayPayable)}</h3>
        </div>

        {/* CARD 6: STATUS */}
        <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-3 flex flex-col justify-center relative overflow-hidden min-h-[90px]">
            <div className="absolute top-2 right-2"><AlertCircle className="w-3 h-3 text-zinc-400" /></div>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Previsão Mês</p>
            <p className={`text-xs font-bold leading-tight ${forecastIncome > forecastExpense ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>{(monthRealIncome + forecastIncome) > (monthRealExpense + forecastExpense) ? "Sobra prevista! 🤑" : "Atenção contas"}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Saldo Mês: {formatCurrency((monthRealIncome + forecastIncome) - (monthRealExpense + forecastExpense))}</p>
        </div>
      </div>

      {/* LINHA 2: GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          
          {/* Evolução */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Evolução Semestral</h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionData} barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} formatter={(value: any) => [formatCurrency(Number(value)), '']} />
                          <Bar dataKey="entrada" fill="#22C55E" radius={[4, 4, 0, 0]} name="Receitas" />
                          <Bar dataKey="saida" fill="#FF8A00" radius={[4, 4, 0, 0]} name="Despesas" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Categorias */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[280px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><PieChartIcon className="w-3 h-3" /> Categorias (Mês)</h3>
              <div className="flex-1 flex flex-col items-center justify-between min-h-0">
                   <div className="h-[180px] w-full relative">
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{centerCategory.label}</span>
                           <span className="text-xl font-black text-slate-900 dark:text-white">{centerCategory.value >= 1000 ? `${(centerCategory.value / 1000).toFixed(1)}k` : formatCurrency(centerCategory.value)}</span>
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={expenseByCategory} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none" onClick={(_, index) => setSelectedCategoryIndex(index === selectedCategoryIndex ? null : index)}>
                                  {expenseByCategory.map((_, index) => (<Cell key={`cell-${index}`} fill={CORES_VITTACASH[index % CORES_VITTACASH.length]} opacity={selectedCategoryIndex === null || selectedCategoryIndex === index ? 1 : 0.3} style={{cursor: 'pointer'}} />))}
                              </Pie>
                          </PieChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-full flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto custom-scrollbar max-h-[80px]">
                       {expenseByCategory.map((item, i) => { 
                           const isSelected = selectedCategoryIndex === i; 
                           return (
                               <button key={i} onClick={() => setSelectedCategoryIndex(isSelected ? null : i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isSelected ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 scale-105 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
                                   <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CORES_VITTACASH[i % CORES_VITTACASH.length]}}></div>
                                   <span className={`text-[9px] font-bold uppercase truncate max-w-[80px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{item.name}</span>
                               </button>
                           )
                       })}
                   </div>
              </div>
          </div>

          {/* Juros */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Flame className="w-3 h-3 text-orange-500" /> Juros Pagos</h3>
                  {totalInterestPeriod > 0 && <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg">Total: {formatCurrency(totalInterestPeriod)}</span>}
              </div>
              <div className="flex-1 w-full min-h-0 relative">
                  {totalInterestPeriod === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs font-medium">Sem juros no período! 🎉</div>}
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={jurosData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" hide />
                          <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '10px'}} formatter={(value: any) => [formatCurrency(Number(value)), 'Juros']} />
                          <Line type="monotone" dataKey="valor" stroke="#f97316" strokeWidth={3} dot={{r: 3, fill: "#f97316"}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* LINHA 3: PATRIMÔNIO E FLUXO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Fluxo de Caixa</h3>
               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                          <defs>
                              <linearGradient id="colorFlowEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
                              <linearGradient id="colorFlowSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF8A00" stopOpacity={0.2}/><stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '10px'}} formatter={(value: any) => formatCurrency(Number(value))} />
                          <Area type="monotone" dataKey="entrada" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowEntrada)" name="Receitas" />
                          <Area type="monotone" dataKey="saida" stroke="#FF8A00" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowSaida)" name="Despesas" />
                      </AreaChart>
                  </ResponsiveContainer>
               </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[280px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
               <div className="flex justify-between items-center mb-2"><h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Patrimônio</h3></div>
               <div className="flex-1 flex flex-col items-center justify-between min-h-0">
                   <div className="h-[180px] w-full relative">
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10"><span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{centerAsset.label}</span><span className="text-xl font-black text-slate-900 dark:text-white">{centerAsset.value >= 1000 ? `${(centerAsset.value / 1000).toFixed(1)}k` : formatCurrency(centerAsset.value)}</span></div>
                       <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={investmentAllocation} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" onClick={(_, index) => setSelectedAssetIndex(index === selectedAssetIndex ? null : index)}>{investmentAllocation.map((_, index) => (<Cell key={`cell-${index}`} fill={CORES_VITTACASH[index % CORES_VITTACASH.length]} opacity={selectedAssetIndex === null || selectedAssetIndex === index ? 1 : 0.3} style={{cursor: 'pointer'}} />))}</Pie></PieChart></ResponsiveContainer>
                   </div>
                   <div className="w-full flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto custom-scrollbar max-h-[80px]">{investmentAllocation.map((item, i) => { const isSelected = selectedAssetIndex === i; return (<button key={i} onClick={() => setSelectedAssetIndex(isSelected ? null : i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isSelected ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 scale-105 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CORES_VITTACASH[i % CORES_VITTACASH.length]}}></div><span className={`text-[9px] font-bold uppercase truncate max-w-[80px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{item.name}</span></button>) })}</div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardHome;