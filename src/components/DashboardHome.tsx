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

const CORES_MODERNAS = ['#090ce6ff', '#5adf0cff', '#f00a31ff', '#e608a3fa', '#f5dd0bff', '#9bf509ff', '#ec4899', '#84cc16'];

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  // --- 1. SEPARAÇÃO DE DADOS (REAL vs PREVISTO) ---
  
  // Apenas transações confirmadas (PAGAS)
  const completedTransactions = useMemo(() => 
    filteredTransactions.filter(t => t.status === TransactionStatus.COMPLETED), 
  [filteredTransactions]);

  // Apenas transações pendentes (A PAGAR/RECEBER)
  const pendingTransactions = useMemo(() => 
    filteredTransactions.filter(t => t.status === TransactionStatus.PENDING), 
  [filteredTransactions]);

  // --- 2. CÁLCULOS FINANCEIROS ---

  // Fluxo Real (Dinheiro que realmente entrou ou saiu)
  const realIncome = completedTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const realExpense = completedTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Saldo Real (O que tem no bolso)
  const realBalance = realIncome - realExpense;

  // Previsão DESPESA (O que ainda tenho que pagar este mês)
  const forecastExpense = pendingTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Previsão RECEITA (O que tenho para receber este mês) - NOVO CÁLCULO
  const forecastIncome = pendingTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // --- 3. DADOS PARA GRÁFICOS ---

  // Evolução (Baseado no histórico real completado)
  const evolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        
        // Filtra transações do mês histórico E que foram PAGAS
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset());
            return tDate.getMonth() === d.getMonth() && 
                   tDate.getFullYear() === d.getFullYear() &&
                   t.status === TransactionStatus.COMPLETED;
        });

        const ent = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
        const sai = monthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
        
        result.push({ name: months[d.getMonth()], entrada: ent, saida: sai });
    }
    return result;
  }, [transactions]);

  // Distribuição de Gastos (Baseado no Real pago)
  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    completedTransactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
        data[t.category || 'Outros'] = (data[t.category || 'Outros'] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [completedTransactions]);

  // Juros/Linha
  const jurosData = useMemo(() => {
     return evolutionData.map(item => ({
         name: item.name,
         valor: item.saida * 0.1 
     }));
  }, [evolutionData]);

  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-24 lg:pb-0 custom-scrollbar">
      
      {/* --- CARDS SUPERIORES (Agora em Grid de 3 colunas para caber os 6 cards) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
        
        {/* 1. SALDO REAL */}
        <div className={`bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border transition-all ${realBalance >= 0 ? 'border-emerald-500/50' : 'border-rose-500/50'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${realBalance >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <Wallet className={`w-5 h-5 ${realBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${realBalance >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>SALDO REAL</span>
            </div>
            <h3 className={`text-xl font-black tracking-tighter mt-4 ${realBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>R$ {realBalance.toLocaleString()}</h3>
        </div>

        {/* 2. RECEITAS REAIS (Pagas) */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div><span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">RECEITAS (OK)</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {realIncome.toLocaleString()}</h3>
        </div>

        {/* 3. DESPESAS REAIS (Pagas) */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-rose-500/10 rounded-xl"><Flame className="w-5 h-5 text-rose-500" /></div><span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg">PAGOS</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {realExpense.toLocaleString()}</h3>
        </div>

        {/* 4. A RECEBER (NOVO CARD) */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-cyan-500/10 rounded-xl"><Hourglass className="w-5 h-5 text-cyan-500" /></div><span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-lg">A RECEBER</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {forecastIncome.toLocaleString()}</h3>
        </div>

        {/* 5. A PAGAR (Previsão Despesa) */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-4"><div className="p-2 bg-amber-500/10 rounded-xl"><CalendarClock className="w-5 h-5 text-amber-500" /></div><span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">A PAGAR</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">R$ {forecastExpense.toLocaleString()}</h3>
        </div>
        
        {/* 6. DIAGNÓSTICO */}
        <div className="bg-slate-100 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-[2rem] p-5 flex flex-col justify-center relative overflow-hidden transition-colors">
            <div className="absolute top-2 right-2"><AlertCircle className="w-4 h-4 text-slate-400" /></div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {forecastIncome > forecastExpense ? "Sobra prevista! 🤑" : forecastExpense > 0 ? "Atenção às contas" : "Mês tranquilo"}
            </p>
            <p className="text-xs text-slate-500/80 dark:text-slate-400/60 mt-1">
               Previsto: R$ {(forecastIncome - forecastExpense).toLocaleString()}
            </p>
        </div>
      </div>

      {/* --- LINHA DO MEIO: 3 GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 min-h-[300px]">
          {/* Gráfico 1: Evolução */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Evolução (Real)</h3>
              <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionData} barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Bar dataKey="entrada" fill="#55f809ff" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="saida" fill="#f7072fff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Gráfico 2: Distribuição */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Gastos Pagos</h3>
              <div className="flex-1 w-full min-h-[200px] relative">
                   <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-2xl font-black text-slate-900 dark:text-white">{expenseByCategory.length}</span>
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
                          <Line type="monotone" dataKey="valor" stroke="#ee05eec0" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* --- LINHA INFERIOR: 2 GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 min-h-[300px]">
          {/* Gráfico 4: Fluxo */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-[300px]">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Fluxo de Caixa</h3>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                          <defs>
                              <linearGradient id="colorFlowEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#b6db10ff" stopOpacity={0.1}/><stop offset="95%" stopColor="#5ae00bff" stopOpacity={0}/></linearGradient>
                              <linearGradient id="colorFlowSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f70e35ff" stopOpacity={0.1}/><stop offset="95%" stopColor="#f30f35ff" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="entrada" stroke="#52ec0aff" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowEntrada)" />
                          <Area type="monotone" dataKey="saida" stroke="#f73808ff" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowSaida)" />
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