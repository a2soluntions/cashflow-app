import React, { useMemo } from 'react';
import { 
  Wallet, TrendingUp, Flame, CalendarClock, PieChart as PieChartIcon, AlertCircle, BarChart3, Hourglass
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import { Transaction, Investment, TransactionType, TransactionStatus } from '../types';

interface DashboardHomeProps {
  transactions: Transaction[];
  investments: Investment[];
  filteredTransactions: Transaction[];
  currentDate: Date;
}

const CORES_MODERNAS = ['#0e12e7ff', '#4dee0dff', '#f50c33ff', '#f38e09ff', '#f13f09ff', '#0bd3f7ff', '#d847b9ff', '#f5f109ff'];

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  // --- CÁLCULOS ---
  const completedTransactions = useMemo(() => filteredTransactions.filter(t => t.status === TransactionStatus.COMPLETED), [filteredTransactions]);
  const pendingTransactions = useMemo(() => filteredTransactions.filter(t => t.status === TransactionStatus.PENDING), [filteredTransactions]);

  const realIncome = completedTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const realExpense = completedTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const realBalance = realIncome - realExpense;
  const forecastExpense = pendingTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const forecastIncome = pendingTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);

  // --- DADOS GRÁFICOS ---
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
        const ent = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
        const sai = monthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
        result.push({ name: months[d.getMonth()], entrada: ent, saida: sai });
    }
    return result;
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    completedTransactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => { data[t.category || 'Outros'] = (data[t.category || 'Outros'] || 0) + t.amount; });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [completedTransactions]);

  const jurosData = useMemo(() => { return evolutionData.map(item => ({ name: item.name, valor: item.saida * 0.1 })); }, [evolutionData]);

  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);

  // Estilos
  const cardStyle = "bg-white dark:bg-slate-900/40 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center min-h-[90px]";
  const iconBoxStyle = "p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0";
  const labelStyle = "text-[9px] font-black uppercase tracking-widest ml-2 opacity-70";
  const valueStyle = "text-lg font-black tracking-tighter mt-1 truncate";

  return (
    <div className="flex flex-col gap-3 h-full w-full overflow-y-auto lg:overflow-hidden p-1 pb-20 lg:pb-1">
      
      {/* LINHA 1: CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        <div className={`${cardStyle} ${realBalance >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
            <div className="flex items-center mb-1"><div className={iconBoxStyle}><Wallet className={`w-4 h-4 ${realBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} /></div><span className={`${labelStyle} ${realBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Saldo</span></div>
            <h3 className={`${valueStyle} ${realBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>R$ {realBalance.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><TrendingUp className="w-4 h-4 text-emerald-500" /></div><span className={`${labelStyle} text-emerald-500`}>Receitas</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {realIncome.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><Flame className="w-4 h-4 text-rose-500" /></div><span className={`${labelStyle} text-rose-500`}>Pagos</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {realExpense.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><Hourglass className="w-4 h-4 text-cyan-500" /></div><span className={`${labelStyle} text-cyan-500`}>A Receber</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {forecastIncome.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><CalendarClock className="w-4 h-4 text-amber-500" /></div><span className={`${labelStyle} text-amber-500`}>A Pagar</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {forecastExpense.toLocaleString()}</h3>
        </div>
        <div className="bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-500/10 rounded-3xl p-3 flex flex-col justify-center relative overflow-hidden min-h-[90px]">
            <div className="absolute top-2 right-2"><AlertCircle className="w-3 h-3 text-amber-500/50" /></div>
            <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Status</p>
            <p className="text-xs font-bold text-amber-900 dark:text-amber-100 leading-tight">
                {forecastIncome > forecastExpense ? "Sobra prevista! 🤑" : forecastExpense > 0 ? "Atenção contas" : "Mês em dia"}
            </p>
            <p className="text-[10px] text-amber-700/60 dark:text-amber-500/50 mt-1">Prev: R$ {(forecastIncome - forecastExpense).toLocaleString()}</p>
        </div>
      </div>

      {/* LINHA 2: GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          
          {/* Evolução */}
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Evolução</h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionData} barSize={8}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Bar dataKey="entrada" fill="#72f10aff" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="saida" fill="#f8560bff" radius={[2, 2, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Categorias - AUMENTADO PARA OCUPAR MAIS ESPAÇO */}
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><PieChartIcon className="w-3 h-3" /> Categorias</h3>
              <div className="flex-1 flex items-center gap-2 min-h-0">
                   
                   {/* Gráfico 70% */}
                   <div className="h-full w-[70%] relative min-w-[120px]">
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                           <span className="text-2xl font-black text-slate-900 dark:text-white">{expenseByCategory.length}</span>
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={expenseByCategory} innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                  {expenseByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={CORES_MODERNAS[index % CORES_MODERNAS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          </PieChart>
                       </ResponsiveContainer>
                   </div>
                   
                   {/* Lista 30% */}
                   <div className="w-[30%] h-full overflow-y-auto custom-scrollbar pr-1 flex flex-col justify-center space-y-1">
                       {expenseByCategory.map((item, i) => (
                           <div key={i} className="flex flex-col p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border-l-2" style={{ borderLeftColor: CORES_MODERNAS[i % CORES_MODERNAS.length] }}>
                               <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate w-full">{item.name}</span>
                               <span className="text-[9px] font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span>
                           </div>
                       ))}
                   </div>
              </div>
          </div>

          {/* Juros */}
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Flame className="w-3 h-3" /> Juros</h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={jurosData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Line type="monotone" dataKey="valor" stroke="#ee650aff" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* LINHA 3: PATRIMÔNIO E FLUXO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden">
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Fluxo</h3>
               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                          <defs>
                              <linearGradient id="colorFlowEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#53f109ff" stopOpacity={0.1}/><stop offset="95%" stopColor="#62f70cff" stopOpacity={0}/></linearGradient>
                              <linearGradient id="colorFlowSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f33b0cff" stopOpacity={0.1}/><stop offset="95%" stopColor="#ee2c0aff" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="entrada" stroke="#5ef00aff" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowEntrada)" />
                          <Area type="monotone" dataKey="saida" stroke="#f30b32ff" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowSaida)" />
                      </AreaChart>
                  </ResponsiveContainer>
               </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChartIcon className="w-3 h-3" /> Patrimônio</h3>
               </div>
               <div className="flex-1 flex items-center gap-4 min-h-0">
                   <div className="h-full w-1/2 min-w-[100px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={investmentAllocation} innerRadius={45} outerRadius={65} dataKey="value" stroke="none">
                                  {investmentAllocation.map((_, index) => <Cell key={`cell-${index}`} fill={CORES_MODERNAS[index % CORES_MODERNAS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          </PieChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="flex-1 space-y-1 h-full overflow-y-auto custom-scrollbar pr-1 flex flex-col justify-center">
                       {investmentAllocation.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                               <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CORES_MODERNAS[i % CORES_MODERNAS.length]}}></div>
                                   <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[60px]">{item.name}</span>
                               </div>
                               <span className="text-[9px] font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardHome;