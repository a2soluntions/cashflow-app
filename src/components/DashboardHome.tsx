import React, { useMemo, useState } from 'react';
import { 
  Wallet, TrendingUp, Flame, CalendarClock, PieChart as PieChartIcon, AlertCircle, BarChart3, Hourglass, Target
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

// CORES VITTACASH
const CORES_VITTACASH = ['#22C55E', '#FF8A00', '#06b6d4', '#8b5cf6', '#f43f5e', '#eab308'];

const DashboardHome: React.FC<DashboardHomeProps> = ({ transactions, investments, filteredTransactions }) => {
  
  // --- ESTADOS DE SELEÇÃO (Para o centro do gráfico) ---
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);

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
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6
  }, [completedTransactions]);

  const jurosData = useMemo(() => { return evolutionData.map(item => ({ name: item.name, valor: item.saida * 0.1 })); }, [evolutionData]);

  const investmentAllocation = useMemo(() => { 
      const allocation: Record<string, number> = {}; 
      investments.forEach(inv => { allocation[inv.category] = (allocation[inv.category] || 0) + inv.current_amount; }); 
      const data = Object.entries(allocation).map(([name, value]) => ({ name, value })); 
      if (data.length === 0) return [{ name: 'Sem ativos', value: 1 }]; 
      return data; 
  }, [investments]);

  // Totais para o centro do gráfico (Default)
  const totalExpense = expenseByCategory.reduce((acc, cur) => acc + cur.value, 0);
  const totalInvested = investmentAllocation.reduce((acc, cur) => acc + (cur.name !== 'Sem ativos' ? cur.value : 0), 0);

  // Helpers para exibição do centro
  const getCenterLabel = (data: any[], selectedIndex: number | null, defaultLabel: string, totalValue: number) => {
      if (selectedIndex !== null && data[selectedIndex]) {
          return { label: data[selectedIndex].name, value: data[selectedIndex].value };
      }
      return { label: defaultLabel, value: totalValue };
  };

  const centerCategory = getCenterLabel(expenseByCategory, selectedCategoryIndex, "Total", totalExpense);
  const centerAsset = getCenterLabel(investmentAllocation, selectedAssetIndex, "Total", totalInvested);

  // Estilos
  const cardStyle = "bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col justify-center min-h-[90px]";
  const iconBoxStyle = "p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 shrink-0";
  const labelStyle = "text-[9px] font-black uppercase tracking-widest ml-2 opacity-70";
  const valueStyle = "text-lg font-black tracking-tighter mt-1 truncate";

  return (
    <div className="flex flex-col gap-3 h-full w-full overflow-y-auto lg:overflow-hidden p-1 pb-20 lg:pb-1">
      
      {/* LINHA 1: CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        <div className={`${cardStyle} ${realBalance >= 0 ? 'border-emerald-500/30' : 'border-orange-500/30'}`}>
            <div className="flex items-center mb-1">
                <div className={iconBoxStyle}><Wallet className={`w-4 h-4 ${realBalance >= 0 ? 'text-emerald-500' : 'text-orange-500'}`} /></div>
                <span className={`${labelStyle} ${realBalance >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>Saldo</span>
            </div>
            <h3 className={`${valueStyle} ${realBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-orange-600 dark:text-orange-400'}`}>R$ {realBalance.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><TrendingUp className="w-4 h-4 text-emerald-500" /></div><span className={`${labelStyle} text-emerald-500`}>Receitas</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {realIncome.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><Flame className="w-4 h-4 text-orange-500" /></div><span className={`${labelStyle} text-orange-500`}>Pagos</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {realExpense.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><Hourglass className="w-4 h-4 text-emerald-400" /></div><span className={`${labelStyle} text-emerald-400`}>A Receber</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {forecastIncome.toLocaleString()}</h3>
        </div>
        <div className={cardStyle}>
             <div className="flex items-center mb-1"><div className={iconBoxStyle}><CalendarClock className="w-4 h-4 text-orange-400" /></div><span className={`${labelStyle} text-orange-400`}>A Pagar</span></div>
             <h3 className={`${valueStyle} text-slate-900 dark:text-white`}>R$ {forecastExpense.toLocaleString()}</h3>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-3 flex flex-col justify-center relative overflow-hidden min-h-[90px]">
            <div className="absolute top-2 right-2"><AlertCircle className="w-3 h-3 text-zinc-400" /></div>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
            <p className={`text-xs font-bold leading-tight ${forecastIncome > forecastExpense ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {forecastIncome > forecastExpense ? "Sobra prevista! 🤑" : forecastExpense > 0 ? "Atenção contas" : "Mês em dia"}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Prev: R$ {(forecastIncome - forecastExpense).toLocaleString()}</p>
        </div>
      </div>

      {/* LINHA 2: GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          
          {/* Evolução */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Evolução</h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionData} barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Bar dataKey="entrada" fill="#22C55E" radius={[4, 4, 0, 0]} name="Receitas" />
                          <Bar dataKey="saida" fill="#FF8A00" radius={[4, 4, 0, 0]} name="Despesas" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Categorias - MODO INTERATIVO */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[280px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><PieChartIcon className="w-3 h-3" /> Categorias</h3>
              
              <div className="flex-1 flex flex-col items-center justify-between min-h-0">
                   
                   {/* GRÁFICO MAIOR */}
                   <div className="h-[180px] w-full relative">
                       {/* Texto Centralizado */}
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{centerCategory.label}</span>
                           <span className="text-xl font-black text-slate-900 dark:text-white">
                                {centerCategory.value >= 1000 
                                    ? `${(centerCategory.value / 1000).toFixed(1)}k` 
                                    : centerCategory.value.toLocaleString()}
                           </span>
                       </div>
                       
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                data={expenseByCategory} 
                                innerRadius={60} // Raio interno maior
                                outerRadius={80} // Raio externo maior
                                paddingAngle={4} 
                                dataKey="value" 
                                stroke="none"
                                onClick={(_, index) => setSelectedCategoryIndex(index === selectedCategoryIndex ? null : index)} // Click no gráfico
                              >
                                  {expenseByCategory.map((_, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={CORES_VITTACASH[index % CORES_VITTACASH.length]} 
                                        opacity={selectedCategoryIndex === null || selectedCategoryIndex === index ? 1 : 0.3}
                                        style={{cursor: 'pointer'}}
                                      />
                                  ))}
                              </Pie>
                          </PieChart>
                       </ResponsiveContainer>
                   </div>
                   
                   {/* LISTA COMPACTA DE BOTÕES */}
                   <div className="w-full flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto custom-scrollbar max-h-[80px]">
                       {expenseByCategory.map((item, i) => {
                           const isSelected = selectedCategoryIndex === i;
                           return (
                               <button 
                                   key={i} 
                                   onClick={() => setSelectedCategoryIndex(isSelected ? null : i)}
                                   className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                                       isSelected 
                                       ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 scale-105 shadow-sm' 
                                       : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                   }`}
                               >
                                   <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CORES_VITTACASH[i % CORES_VITTACASH.length]}}></div>
                                   <span className={`text-[9px] font-bold uppercase truncate max-w-[80px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                       {item.name}
                                   </span>
                               </button>
                           )
                       })}
                   </div>
              </div>
          </div>

          {/* Juros */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Flame className="w-3 h-3" /> Juros</h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={jurosData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Line type="monotone" dataKey="valor" stroke="#FF8A00" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* LINHA 3: PATRIMÔNIO E FLUXO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0 lg:flex-1 lg:min-h-[180px]">
          {/* Fluxo */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[250px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Fluxo</h3>
               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                          <defs>
                              <linearGradient id="colorFlowEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
                              <linearGradient id="colorFlowSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF8A00" stopOpacity={0.2}/><stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="entrada" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowEntrada)" name="Receitas" />
                          <Area type="monotone" dataKey="saida" stroke="#FF8A00" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorFlowSaida)" name="Despesas" />
                      </AreaChart>
                  </ResponsiveContainer>
               </div>
          </div>

          {/* Patrimônio - MODO INTERATIVO */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm flex flex-col h-[280px] lg:h-auto overflow-hidden border border-slate-100 dark:border-zinc-800">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Patrimônio</h3>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-between min-h-0">
                   {/* GRÁFICO MAIOR */}
                   <div className="h-[180px] w-full relative">
                       {/* Texto Centralizado */}
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{centerAsset.label}</span>
                           <span className="text-xl font-black text-slate-900 dark:text-white">
                                {centerAsset.value >= 1000 
                                    ? `${(centerAsset.value / 1000).toFixed(1)}k` 
                                    : centerAsset.value.toLocaleString()}
                           </span>
                       </div>

                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                data={investmentAllocation} 
                                innerRadius={60} 
                                outerRadius={80} 
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
                   
                   {/* LISTA COMPACTA DE BOTÕES */}
                   <div className="w-full flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto custom-scrollbar max-h-[80px]">
                       {investmentAllocation.map((item, i) => {
                           const isSelected = selectedAssetIndex === i;
                           return (
                               <button 
                                   key={i} 
                                   onClick={() => setSelectedAssetIndex(isSelected ? null : i)}
                                   className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                                       isSelected 
                                       ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 scale-105 shadow-sm' 
                                       : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                   }`}
                               >
                                   <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: CORES_VITTACASH[i % CORES_VITTACASH.length]}}></div>
                                   <span className={`text-[9px] font-bold uppercase truncate max-w-[80px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                       {item.name}
                                   </span>
                               </button>
                           )
                       })}
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardHome;