import React, { useMemo } from 'react';
import { 
  Wallet, TrendingUp, Flame, BarChart3, PieChart as PieChartIcon, AlertCircle
} from 'lucide-react';
// CORREÇÃO: YAxis importado para não dar erro
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import { Transaction, Investment, TransactionType } from '../types';

interface DashboardHomeProps {
  transactions: Transaction[];
  investments: Investment[];
  filteredTransactions: Transaction[];
  currentDate: Date;
}

const CORES_MODERNAS = ['#090ce6ff', '#5adf0cff', '#f00a31ff', '#e608a3fa', '#f5dd0bff', '#9bf509ff', '#ec4899', '#84cc16'];

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  // 1. Cálculos dos Cards
  const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const total = income - expense;
  const interestPaid = filteredTransactions.filter(t => t.description.toLowerCase().includes('juros')).reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Dados para o Gráfico de Evolução (Últimos 6 meses)
  const evolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset());
            return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
        });

        const ent = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
        const sai = monthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
        
        result.push({ name: months[d.getMonth()], entrada: ent, saida: sai });
    }
    return result;
  }, [transactions]);

  // 3. Dados para Distribuição de Gastos (Pie)
  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
        data[t.category || 'Outros'] = (data[t.category || 'Outros'] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredTransactions]);

  // 4. Dados para Gráfico de Juros (Linha)
  const jurosData = useMemo(() => {
     return evolutionData.map(item => ({
         name: item.name,
         valor: item.saida * 0.1 // Simulação ou cálculo real se houver
     }));
  }, [evolutionData]);

  // 5. Dados de Alocação (Investimentos)
  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-24 lg:pb-0 custom-scrollbar">
      
      {/* --- CARDS SUPERIORES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        <div className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="w-16 h-16" /></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Wallet className="w-5 h-5" /></div><span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">SALDO</span></div>
                <h3 className="text-xl font-black tracking-tighter mt-4">R$ {total.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div><span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">RECEITAS</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {income.toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-rose-500/10 rounded-xl"><Flame className="w-5 h-5 text-rose-500" /></div><span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg">DESPESAS</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {expense.toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-amber-500/10 rounded-xl"><BarChart3 className="w-5 h-5 text-amber-500" /></div><span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">JUROS</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {interestPaid.toLocaleString()}</h3>
        </div>
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-[2rem] p-5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Diagnóstico</p>
            <p className="text-sm font-bold text-amber-100">Alerta de Lazer</p>
            <p className="text-xs text-amber-500/60 mt-1">Gastos 25% acima da meta.</p>
        </div>
      </div>

      {/* --- LINHA DO MEIO: 3 GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 min-h-[300px]">
          
          {/* Gráfico 1: Evolução */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Evolução</h3>
              <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionData} barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Bar dataKey="entrada" fill="#81eb09ff" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="saida" fill="#f80931ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Gráfico 2: Distribuição */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Gastos</h3>
              <div className="flex-1 w-full min-h-[200px] relative">
                   <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-2xl font-black text-slate-900 dark:text-white">5</span>
                       <span className="text-[8px] uppercase tracking-widest text-slate-400">Categorias</span>
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie data={expenseByCategory} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {expenseByCategory.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CORES_MODERNAS[index % CORES_MODERNAS.length]} />
                              ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                      </PieChart>
                   </ResponsiveContainer>
              </div>
          </div>

          {/* Gráfico 3: Juros */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Flame className="w-4 h-4" /> Juros</h3>
              <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={jurosData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Line type="monotone" dataKey="valor" stroke="#f59e0b" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* --- LINHA INFERIOR: 2 GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 min-h-[300px]">
          
          {/* Gráfico 4: Fluxo de Caixa */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Fluxo de Caixa</h3>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                          <defs>
                              <linearGradient id="colorFlowEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                              <linearGradient id="colorFlowSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="entrada" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowEntrada)" />
                          <Area type="monotone" dataKey="saida" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowSaida)" />
                      </AreaChart>
                  </ResponsiveContainer>
               </div>
          </div>

          {/* Gráfico 5: Alocação */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Alocação</h3>
                  <div className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700"><span className="text-[10px] font-bold text-slate-300">Patrimônio</span></div>
               </div>
               <div className="flex-1 flex items-center gap-6">
                   <div className="h-[200px] w-1/2 min-w-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={investmentAllocation} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                  {investmentAllocation.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={CORES_MODERNAS[index % CORES_MODERNAS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          </PieChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="flex-1 space-y-2 h-[200px] overflow-y-auto custom-scrollbar pr-2">
                       {investmentAllocation.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: CORES_MODERNAS[i % CORES_MODERNAS.length]}}></div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px]">{item.name}</span>
                               </div>
                               <span className="text-xs font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span>
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