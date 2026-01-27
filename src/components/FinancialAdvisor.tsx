import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, BookOpen, 
  Target, Lightbulb, CheckCircle2, Calculator, 
  Brain, Zap, Library, BarChart3, ChevronRight, 
  Quote, DollarSign, Activity, Home, MessageCircle, Instagram, ShoppingCart
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, 
  Area, CartesianGrid, XAxis, Tooltip
} from 'recharts';

interface FinancialAdvisorProps {
  transactions: Transaction[];
  currentBalance: number;
}

const data503020 = [
  { name: 'Essencial', value: 50, color: '#f97316' }, 
  { name: 'Estilo Vida', value: 30, color: '#0ea5e9' }, 
  { name: 'Futuro', value: 20, color: '#22c55e' }, 
];

const marketData = [
    { symbol: 'IBOV', name: 'Ibovespa', price: '128k', change: '+0.8%', up: true },
    { symbol: 'USD', name: 'Dólar', price: '5,85', change: '-0.3%', up: false },
    { symbol: 'BTC', name: 'Bitcoin', price: '380k', change: '+2.1%', up: true },
    { symbol: 'CDI', name: 'Selic', price: '11.25%', change: 'a.a.', up: true },
];

const powerQuotes = [
    { text: "Preço é o que você paga. Valor é o que você leva.", author: "Warren Buffett" },
    { text: "Não trabalhe pelo dinheiro. Faça ele trabalhar por você.", author: "Robert Kiyosaki" },
    { text: "Invista em si mesmo. É o melhor retorno.", author: "Paul Clitheroe" },
    { text: "Jamais gaste seu dinheiro antes de tê-lo.", author: "Thomas Jefferson" },
];

const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ currentBalance }) => {
  const [activeContent, setActiveContent] = useState<string>('welcome'); 
  const [currentQuote, setCurrentQuote] = useState(powerQuotes[0]);

  useEffect(() => {
      const randomIndex = Math.floor(Math.random() * powerQuotes.length);
      setCurrentQuote(powerQuotes[randomIndex]);
  }, [activeContent]);
  
  const [simInitial, setSimInitial] = useState(1000);
  const [simMonthly, setSimMonthly] = useState(500);
  const [simYears, setSimYears] = useState(10);
  const [simRate, setSimRate] = useState(10);

  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem('vittacash_advisor_steps');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vittacash_advisor_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  const toggleStep = (step: string) => {
    setCompletedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const financialStatus = useMemo(() => {
    if (currentBalance < 0) return 'debt';
    if (currentBalance < 1000) return 'building'; 
    return 'investing';
  }, [currentBalance]);

  const simulationData = useMemo(() => {
    const data = [];
    let totalInvested = simInitial;
    let totalAmount = simInitial;
    const monthlyRate = Math.pow(1 + (simRate / 100), 1 / 12) - 1;

    for (let year = 0; year <= simYears; year++) {
      if (year > 0) {
        for (let m = 0; m < 12; m++) {
            totalAmount = totalAmount * (1 + monthlyRate) + simMonthly;
            totalInvested += simMonthly;
        }
      }
      data.push({
        ano: `Ano ${year}`,
        investido: Math.round(totalInvested),
        total: Math.round(totalAmount),
        juros: Math.round(totalAmount - totalInvested)
      });
    }
    return data;
  }, [simInitial, simMonthly, simYears, simRate]);

  return (
    <div className="h-full flex flex-col gap-3 animate-in fade-in p-1 overflow-hidden">
      
      {/* 1. TOPO: DIAGNÓSTICO COMPACTO */}
      <div className="shrink-0">
          <div className={`w-full p-4 rounded-2xl relative overflow-hidden shadow-sm transition-colors duration-500 flex flex-row items-center justify-between ${
            financialStatus === 'debt' ? 'bg-rose-600' : 
            financialStatus === 'building' ? 'bg-orange-500' : 'bg-emerald-600'
          }`}>
            <div className="relative z-10 text-white flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-white/20 rounded-lg backdrop-blur-md">
                   {financialStatus === 'debt' ? <AlertTriangle className="w-4 h-4" /> :
                    financialStatus === 'building' ? <ShieldCheck className="w-4 h-4" /> :
                    <TrendingUp className="w-4 h-4" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full">
                  Fase Atual
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                {financialStatus === 'debt' ? 'Sair do Vermelho' : 
                 financialStatus === 'building' ? 'Construir Segurança' : 'Acelerar Riqueza'}
              </h2>
            </div>
            <div className="opacity-20"><Lightbulb className="w-12 h-12 text-white" /></div>
          </div>
      </div>

      {/* 2. MENU + CONTEÚDO */}
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-4 pb-0 lg:pb-0 overflow-hidden">
        
        {/* MENU LATERAL */}
        <div className="lg:col-span-3 shrink-0 flex flex-col max-h-[30vh] lg:max-h-full">
            {/* MOBILE: GRADE DE ÍCONES */}
            <div className="grid grid-cols-5 gap-2 lg:hidden p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-y-auto custom-scrollbar shrink-0">
                <MobileIconItem icon={<Home className="w-4 h-4"/>} label="Início" active={activeContent === 'welcome'} onClick={() => setActiveContent('welcome')} />
                <MobileIconItem icon={<Target className="w-4 h-4 text-emerald-500"/>} label="Metas" active={activeContent === 'checklist'} onClick={() => setActiveContent('checklist')} />
                <MobileIconItem icon={<Activity className="w-4 h-4"/>} label="Mercado" active={activeContent === 'market'} onClick={() => setActiveContent('market')} />
                <MobileIconItem icon={<Calculator className="w-4 h-4"/>} label="Juros" active={activeContent === 'juros'} onClick={() => setActiveContent('juros')} />
                <MobileIconItem icon={<TrendingUp className="w-4 h-4"/>} label="50/30/20" active={activeContent === 'rule'} onClick={() => setActiveContent('rule')} />
                <MobileIconItem icon={<ShieldCheck className="w-4 h-4"/>} label="Reserva" active={activeContent === 'reserva'} onClick={() => setActiveContent('reserva')} />
                <MobileIconItem icon={<BarChart3 className="w-4 h-4"/>} label="Tipos" active={activeContent === 'invest_types'} onClick={() => setActiveContent('invest_types')} />
                <MobileIconItem icon={<Brain className="w-4 h-4"/>} label="Psico" active={activeContent === 'psycho'} onClick={() => setActiveContent('psycho')} />
                <MobileIconItem icon={<Library className="w-4 h-4"/>} label="Livros" active={activeContent === 'books'} onClick={() => setActiveContent('books')} />
                <MobileIconItem icon={<Zap className="w-4 h-4"/>} label="Renda" active={activeContent === 'income'} onClick={() => setActiveContent('income')} />
            </div>

            {/* DESKTOP */}
            <div className="hidden lg:flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-1">
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-l-[6px] border-orange-500 shadow-sm p-1 flex-1 flex flex-col justify-center">
                    <div className="px-4 py-2 mb-1"><h3 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2"><Calculator className="w-4 h-4"/> Ferramentas</h3></div>
                    <div className="space-y-1 px-1">
                        <MenuItem title="Início" icon={<Home className="w-5 h-5 text-emerald-600"/>} active={activeContent === 'welcome'} onClick={() => setActiveContent('welcome')} />
                        <MenuItem title="Próximos Passos" icon={<Target className="w-5 h-5 text-emerald-500"/>} active={activeContent === 'checklist'} onClick={() => setActiveContent('checklist')} />
                        <MenuItem title="Mercado Hoje" icon={<Activity className="w-5 h-5 text-rose-500"/>} active={activeContent === 'market'} onClick={() => setActiveContent('market')} />
                        <MenuItem title="Simulador de Juros" icon={<Calculator className="w-5 h-5 text-emerald-500"/>} active={activeContent === 'juros'} onClick={() => setActiveContent('juros')} />
                        <MenuItem title="Regra 50/30/20" icon={<TrendingUp className="w-5 h-5 text-sky-500"/>} active={activeContent === 'rule'} onClick={() => setActiveContent('rule')} />
                        <MenuItem title="Reserva de Emergência" icon={<ShieldCheck className="w-5 h-5 text-emerald-600"/>} active={activeContent === 'reserva'} onClick={() => setActiveContent('reserva')} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-l-[6px] border-slate-400 dark:border-slate-600 shadow-sm p-1 flex-1 flex flex-col justify-center">
                    <div className="px-4 py-2 mb-1"><h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4"/> Universidade</h3></div>
                    <div className="space-y-1 px-1">
                        <MenuItem title="Tipos de Investimento" icon={<BarChart3 className="w-5 h-5 text-orange-500"/>} active={activeContent === 'invest_types'} onClick={() => setActiveContent('invest_types')} />
                        <MenuItem title="Psicologia do Consumo" icon={<Brain className="w-5 h-5 text-indigo-500"/>} active={activeContent === 'psycho'} onClick={() => setActiveContent('psycho')} />
                        <MenuItem title="Livros Essenciais" icon={<Library className="w-5 h-5 text-purple-500"/>} active={activeContent === 'books'} onClick={() => setActiveContent('books')} />
                        <MenuItem title="Renda Extra" icon={<Zap className="w-5 h-5 text-yellow-500"/>} active={activeContent === 'income'} onClick={() => setActiveContent('income')} />
                    </div>
                </div>
            </div>
        </div>

        {/* VISOR PRINCIPAL */}
        <div className={`flex-1 lg:col-span-9 lg:bg-white lg:dark:bg-zinc-900 lg:p-6 lg:rounded-[2.5rem] lg:border lg:border-slate-100 lg:dark:border-zinc-800 lg:shadow-sm overflow-hidden relative flex flex-col h-full`}>
           
           {/* FRASE DE EFEITO (COM AUTOR COMPLETO) */}
           {activeContent !== 'welcome' && (
             <div className="mb-4 p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-100 dark:border-zinc-700 relative overflow-hidden shrink-0 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3 max-w-[70%]">
                    <Quote className="w-5 h-5 text-emerald-500/50 rotate-180 shrink-0" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic leading-snug">"{currentQuote.text}"</p>
                 </div>
                 {/* CORREÇÃO: Mostrando o nome completo do autor */}
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 whitespace-nowrap pl-2 border-l border-slate-200 dark:border-zinc-700">{currentQuote.author}</p>
             </div>
           )}

           {/* ÁREA DE CONTEÚDO */}
           <div className={`flex-1 overflow-y-auto custom-scrollbar lg:pr-1 ${activeContent === 'welcome' ? 'pb-0' : 'pb-4'}`}>
               
               {/* 0. WELCOME */}
               {activeContent === 'welcome' && (
                   <div className="h-full flex flex-col justify-between animate-in fade-in zoom-in-95 duration-500">
                       
                       {/* CONTEÚDO CENTRAL */}
                       <div className="flex-1 flex flex-col items-center justify-center p-2 text-center lg:p-6">
                           <div className="w-16 h-16 lg:w-28 lg:h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 lg:mb-8 shadow-xl">
                                <TrendingUp className="w-8 h-8 lg:w-14 lg:h-14 text-emerald-600 dark:text-emerald-400" />
                           </div>
                           <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 lg:mb-6">
                               Bem-vindo ao <span className="text-emerald-500">VittaCash</span>
                           </h1>
                           <div className="max-w-3xl text-slate-600 dark:text-slate-300 text-xs lg:text-lg leading-relaxed space-y-2 lg:space-y-4 px-2">
                               <p>
                                   O <strong>VittaCash</strong> é a sua central de comando para a liberdade financeira. Nossa missão é simples: tirar você da estagnação e colocá-lo na rota da prosperidade.
                               </p>
                               <p className="hidden sm:block">
                                   Aqui transformamos números frios em estratégias. Use nossos simuladores para ver o futuro do seu dinheiro e explore a Universidade para blindar sua mente contra o consumismo.
                               </p>
                           </div>
                       </div>

                       {/* FOOTER A2 SOLUTIONS */}
                       <div className="shrink-0 mt-auto bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 p-3 lg:p-6 rounded-t-2xl lg:rounded-none">
                           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-6">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 shadow-md">
                                       <img src="/logo-a2.jpg" alt="A2" className="w-full h-full object-cover" />
                                   </div>
                                   <div className="text-left">
                                       <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Desenvolvido por</p>
                                       <h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white tracking-tight">A2 Solutions</h4>
                                   </div>
                               </div>
                               <div className="flex gap-2 w-full sm:w-auto">
                                   <a 
                                       href="https://instagram.com/a2soluntions" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-gradient-to-tr from-purple-600 to-rose-500 text-white rounded-xl font-bold text-[10px] lg:text-xs hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                                   >
                                       <Instagram className="w-3 h-3 lg:w-4 lg:h-4" /> Instagram
                                   </a>
                                   <a 
                                       href="https://wa.me/5534998408962?text=Ol%C3%A1%2C%20vim%20pelo%20App%20VittaCash%20e%20gostaria%20de%20conhecer%20as%20solu%C3%A7%C3%B5es%20da%20A2%20Solutions!" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] lg:text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                   >
                                       <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4" /> WhatsApp
                                   </a>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* CHECKLIST / PRÓXIMOS PASSOS */}
               {activeContent === 'checklist' && (
                   <div className="animate-in fade-in zoom-in-95">
                        <HeaderContent icon={<Target className="w-6 h-6 text-emerald-500" />} title="Próximos Passos" subtitle="Sua lista de tarefas prioritárias." />
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {financialStatus === 'debt' && (
                                <>
                                <CheckItem text="Listar todas as Dívidas (Valor e Juros)" isChecked={completedSteps.includes('debt_1')} onToggle={() => toggleStep('debt_1')} />
                                <CheckItem text="Cortar Assinaturas Inúteis" isChecked={completedSteps.includes('debt_2')} onToggle={() => toggleStep('debt_2')} />
                                <CheckItem text="Negociar com Credores" isChecked={completedSteps.includes('debt_3')} onToggle={() => toggleStep('debt_3')} />
                                <CheckItem text="Vender Itens Parados (Renda Extra)" isChecked={completedSteps.includes('debt_4')} onToggle={() => toggleStep('debt_4')} />
                                </>
                            )}
                            {financialStatus === 'building' && (
                                <>
                                <CheckItem text="Meta: 3 Meses de Custo de Vida" isChecked={completedSteps.includes('build_1')} onToggle={() => toggleStep('build_1')} />
                                <CheckItem text="Poupar 10% Assim que Receber" isChecked={completedSteps.includes('build_2')} onToggle={() => toggleStep('build_2')} />
                                <CheckItem text="Revisar Gastos Variáveis (Lazer/Ifood)" isChecked={completedSteps.includes('build_3')} onToggle={() => toggleStep('build_3')} />
                                <CheckItem text="Investir em CDB Liq. Diária" isChecked={completedSteps.includes('build_4')} onToggle={() => toggleStep('build_4')} />
                                </>
                            )}
                            {financialStatus === 'investing' && (
                                <>
                                <CheckItem text="Diversificar Renda Fixa e Variável" isChecked={completedSteps.includes('inv_1')} onToggle={() => toggleStep('inv_1')} />
                                <CheckItem text="Estudar Fundos Imobiliários (FIIs)" isChecked={completedSteps.includes('inv_2')} onToggle={() => toggleStep('inv_2')} />
                                <CheckItem text="Aumentar Aportes para 20%" isChecked={completedSteps.includes('inv_3')} onToggle={() => toggleStep('inv_3')} />
                                <CheckItem text="Planejar Aposentadoria" isChecked={completedSteps.includes('inv_4')} onToggle={() => toggleStep('inv_4')} />
                                </>
                            )}
                        </div>
                   </div>
               )}

               {/* 1. MERCADO */}
               {activeContent === 'market' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Activity className="w-6 h-6 text-rose-500" />} title="Mercado Hoje" subtitle="Indicadores em tempo real." />
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                           {marketData.map((item, idx) => (
                               <div key={idx} className="p-3 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 text-center">
                                   <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{item.name}</p>
                                   <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.price}</h3>
                                   <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${item.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                       {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                       {item.change}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* 2. TIPOS DE INVESTIMENTO */}
               {activeContent === 'invest_types' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<BarChart3 className="w-6 h-6 text-orange-500" />} title="Tipos de Investimento" subtitle="Escada de risco." />
                       <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
                           <InvestCard title="Poupança" risk="Baixíssimo" liquidity="Imediata" desc="Seguro, mas desvaloriza seu dinheiro. Use apenas para curtíssimo prazo." color="slate" />
                           <InvestCard title="CDB / Tesouro" risk="Baixo" liquidity="Diária" desc="Empreste para o Banco ou Governo. A base de qualquer carteira sólida." color="emerald" />
                           <InvestCard title="FIIs (Imóveis)" risk="Médio" liquidity="Média" desc="Receba aluguel mensal sem comprar tijolo. Isento de Imposto de Renda." color="sky" />
                           <InvestCard title="Ações" risk="Alto" liquidity="Alta" desc="Sócio de empresas. Foco total no longo prazo (5+ anos)." color="rose" />
                       </div>
                   </div>
               )}

               {/* 3. SIMULADOR */}
               {activeContent === 'juros' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Calculator className="w-6 h-6 text-emerald-500" />} title="Simulador de Riqueza" subtitle="Juros Compostos." />
                       
                       <div className="flex flex-col lg:flex-row gap-4 mt-4">
                           {/* Inputs Otimizados para Mobile (Grid 2 colunas) */}
                           <div className="w-full lg:w-1/3 flex flex-col gap-3">
                                <div className="p-4 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 grid grid-cols-2 gap-3">
                                    <InputGroup label="Tenho Hoje" value={simInitial} onChange={setSimInitial} />
                                    <InputGroup label="Poupo Mensal" value={simMonthly} onChange={setSimMonthly} />
                                    <InputGroup label="Anos" value={simYears} onChange={setSimYears} />
                                    <InputGroup label="Taxa % a.a" value={simRate} onChange={setSimRate} />
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Total Acumulado</p>
                                    <p className="text-2xl font-black text-emerald-700 dark:text-white tracking-tighter">R$ {simulationData[simulationData.length - 1].total.toLocaleString()}</p>
                                </div>
                           </div>

                           <div className="w-full lg:w-2/3 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-zinc-800/30 rounded-2xl p-2 border border-slate-100 dark:border-zinc-800 h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={simulationData}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey="ano" tick={{fontSize: 11}} axisLine={false} tickLine={false} interval={simYears > 15 ? 4 : 1} />
                                        <Tooltip contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '10px', color: '#fff'}} formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`, '']} />
                                        <Area type="monotone" dataKey="total" stroke="#22c55e" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} name="Total" />
                                        <Area type="monotone" dataKey="investido" stroke="#f97316" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" name="Investido" />
                                    </AreaChart>
                                </ResponsiveContainer>
                           </div>
                       </div>
                   </div>
               )}

               {/* 4. PSICOLOGIA */}
               {activeContent === 'psycho' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Brain className="w-6 h-6 text-indigo-500" />} title="Psicologia" subtitle="Mente blindada." />
                       <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
                           <CardContent title="Regra das 24 Horas" color="rose">Viu algo que quer? Espere 24h. A emoção baixa e a lógica volta. Para itens caros, espere 30 dias.</CardContent>
                           <CardContent title="Custo em Horas" color="blue">Divida o preço pelo seu ganho/hora. "Isso vale 20 horas de trabalho?" Isso muda sua percepção de valor.</CardContent>
                           <CardContent title="Armadilha do Mercado" color="emerald" icon={<ShoppingCart className="w-4 h-4"/>}>Nunca vá ao mercado com fome e sem lista. Seu cérebro faminto comprará calorias caras e desnecessárias.</CardContent>
                           <CardContent title="Cancele Newsletters" color="slate">O que os olhos não veem, o bolso não sente. Saia das listas de e-mail de lojas para evitar tentações.</CardContent>
                       </div>
                   </div>
               )}

               {/* 5. LIVROS */}
               {activeContent === 'books' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Library className="w-6 h-6 text-purple-500" />} title="Biblioteca" subtitle="Leituras obrigatórias." />
                       <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
                           <BookRecommendation title="Psicologia Financeira" author="Morgan Housel" desc="O comportamento é mais importante que a inteligência técnica." />
                           <BookRecommendation title="Pai Rico, Pai Pobre" author="Robert Kiyosaki" desc="A diferença crucial entre Ativos (põe dinheiro) e Passivos (tiram)." />
                           <BookRecommendation title="Homem Mais Rico da Babilônia" author="George Clason" desc="Leis antigas do dinheiro: pague-se primeiro e viva com menos." />
                       </div>
                   </div>
               )}

               {/* 6. RENDA EXTRA */}
               {activeContent === 'income' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Zap className="w-6 h-6 text-yellow-500" />} title="Renda Extra" subtitle="Aumente seu caixa." />
                       <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
                           <div className="p-4 bg-white dark:bg-zinc-900 lg:bg-yellow-50 lg:dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 flex gap-3 items-start">
                               <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl"><DollarSign className="w-5 h-5 text-yellow-600"/></div>
                               <div><h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-400">Venda o Parado</h4><p className="text-xs text-yellow-700/80 mt-1 leading-relaxed">Roupas, móveis, eletrônicos. Se não usou em 6 meses, venda na OLX ou Enjoei.</p></div>
                           </div>
                           <div className="p-4 bg-white dark:bg-zinc-900 lg:bg-sky-50 lg:dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/20 flex gap-3 items-start">
                               <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl"><BookOpen className="w-5 h-5 text-sky-600"/></div>
                               <div><h4 className="font-bold text-sm text-sky-800 dark:text-sky-400">Freelancer</h4><p className="text-xs text-sky-700/80 mt-1 leading-relaxed">Workana, 99Freelas. Escreva, traduza, desenhe ou edite vídeos nas horas vagas.</p></div>
                           </div>
                           <div className="p-4 bg-white dark:bg-zinc-900 lg:bg-purple-50 lg:dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 flex gap-3 items-start">
                               <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Activity className="w-5 h-5 text-purple-600"/></div>
                               <div><h4 className="font-bold text-sm text-purple-800 dark:text-purple-400">Consultoria</h4><p className="text-xs text-purple-700/80 mt-1 leading-relaxed">Venda seu conhecimento profissional. Dê aulas, mentorias ou revise trabalhos.</p></div>
                           </div>
                       </div>
                   </div>
               )}

               {/* 7. REGRA 50/30/20 */}
               {activeContent === 'rule' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<TrendingUp className="w-6 h-6 text-sky-500" />} title="Regra 50/30/20" subtitle="Orçamento ideal." />
                       <div className="flex flex-col items-center gap-4 mt-2">
                           <div className="w-full h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data503020} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {data503020.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                           </div>
                           <div className="w-full space-y-3 px-2">
                               <RuleItem color="bg-orange-500" title="50% Necessidades" desc="Aluguel, luz, mercado." />
                               <RuleItem color="bg-sky-500" title="30% Desejos" desc="Lazer, iFood, Netflix." />
                               <RuleItem color="bg-emerald-500" title="20% Futuro" desc="Pagar dívidas ou investir." />
                           </div>
                       </div>
                   </div>
               )}

               {/* 8. RESERVA DE EMERGÊNCIA */}
               {activeContent === 'reserva' && (
                   <div className="animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />} title="Reserva de Emergência" subtitle="Sua segurança." />
                       <div className="flex flex-col gap-4 mt-4 pb-4">
                           <div className="bg-white dark:bg-zinc-900 lg:bg-slate-100 lg:dark:bg-zinc-800 rounded-[2rem] p-6 text-center border-2 border-emerald-500/20">
                               <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Meta de Ouro</p>
                               <div className="text-5xl font-black text-emerald-500 tracking-tighter mb-1">6 x</div>
                               <p className="text-sm font-bold text-slate-700 dark:text-white">Seu Custo Mensal</p>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-3">
                               <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-zinc-900 lg:bg-emerald-50 lg:dark:bg-emerald-900/10">
                                   <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Onde Guardar?</p>
                                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Tesouro Selic ou CDB com liquidez diária (100% CDI).</p>
                               </div>
                               <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-zinc-900 lg:bg-rose-50 lg:dark:bg-rose-900/10">
                                   <p className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 mb-1">Quando Usar?</p>
                                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Desemprego, doença ou carro quebrado. Viagem não!</p>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const MobileIconItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${active ? 'bg-black dark:bg-white text-white dark:text-black scale-105 shadow-md' : 'bg-white dark:bg-zinc-900 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
        <div className="scale-90">{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-wide">{label}</span>
    </button>
);

const MenuItem = ({ title, icon, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${active ? 'bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white scale-105' : 'hover:bg-white/50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-400'}`}>
        <div className="flex items-center gap-2">
            <div className="scale-90">{icon}</div>
            <span className="text-[11px] font-bold uppercase tracking-wide">{title}</span>
        </div>
        {active && <ChevronRight className="w-3 h-3 opacity-50" />}
    </button>
);

const HeaderContent = ({ icon, title, subtitle }: any) => (
    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3 shrink-0">
        <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700">{icon}</div>
        <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
    </div>
);

const InvestCard = ({ title, risk, liquidity, desc, color }: any) => {
    const colors: Record<string, string> = {
        slate: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-slate-900/20',
        emerald: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 lg:bg-emerald-50 lg:dark:bg-emerald-900/20',
        sky: 'border-sky-200 dark:border-sky-800 bg-white dark:bg-zinc-900 lg:bg-sky-50 lg:dark:bg-sky-900/20',
        rose: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900 lg:bg-rose-50 lg:dark:bg-rose-900/20',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col gap-2 min-h-[140px]`}>
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-black text-slate-500">{risk}</span>
            </div>
            <p className="text-xs opacity-90 leading-snug text-slate-600 dark:text-slate-300">{desc}</p>
            <div className="mt-auto pt-2 border-t border-slate-100 dark:border-zinc-800">
                 <span className="text-[9px] uppercase font-bold opacity-60 mr-2">Liquidez:</span>
                 <span className="text-[10px] font-bold">{liquidity}</span>
            </div>
        </div>
    )
}

const CardContent = ({ title, children, color, icon }: any) => {
    const colorClasses: Record<string, string> = {
        rose: 'bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 lg:bg-rose-50 lg:dark:bg-rose-900/20 text-rose-900 dark:text-rose-100',
        blue: 'bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-900 lg:bg-blue-50 lg:dark:bg-blue-900/20 text-blue-900 dark:text-blue-100',
        emerald: 'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-900 lg:bg-emerald-50 lg:dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100',
        slate: 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 lg:bg-slate-50 lg:dark:bg-slate-800/50 text-slate-900 dark:text-slate-100',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex flex-col justify-center min-h-[120px]`}>
            <div className="flex items-center gap-2 mb-2">
                {icon && <div className="opacity-70 scale-90">{icon}</div>}
                <h4 className="font-black text-sm uppercase opacity-80">{title}</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">{children}</p>
        </div>
    );
};

const InputGroup = ({ label, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-black rounded-xl px-2 py-2 text-xs font-bold border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-colors dark:text-white" />
    </div>
);

const RuleItem = ({ color, title, desc }: any) => (
    <div className="flex gap-3 items-start p-3 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
        <div className={`w-3 h-3 rounded-full ${color} mt-1 shrink-0 shadow-sm`}></div>
        <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{desc}</p>
        </div>
    </div>
);

const BookRecommendation = ({ title, author, desc }: { title: string, author: string, desc: string }) => (
    <div className="flex gap-3 items-start p-4 bg-white dark:bg-zinc-900 lg:bg-slate-50 lg:dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-purple-200 transition-all min-h-[100px]">
        <div className="w-8 h-12 bg-slate-100 dark:bg-black rounded-md shrink-0 flex items-center justify-center shadow-sm border border-slate-200 dark:border-zinc-800 mt-1">
            <BookOpen className="w-3 h-3 text-purple-400" />
        </div>
        <div>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</p>
            <p className="text-[10px] text-slate-500 italic mb-1">de {author}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight">{desc}</p>
        </div>
    </div>
);

const CheckItem = ({ text, isChecked, onToggle }: { text: string, isChecked: boolean, onToggle: () => void }) => (
  <button onClick={onToggle} className={`w-full flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 group text-left h-full ${isChecked ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-zinc-600 text-transparent group-hover:border-emerald-400'}`}>
      {isChecked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-full h-full" />}
    </div>
    <span className={`text-xs font-bold leading-tight transition-all ${isChecked ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
  </button>
);

export default FinancialAdvisor;