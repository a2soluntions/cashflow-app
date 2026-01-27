import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, BookOpen, 
  Target, Lightbulb, CheckCircle2, ArrowRight, Calculator, 
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
    { symbol: 'IBOV', name: 'Ibovespa', price: '128.500', change: '+0.85%', up: true },
    { symbol: 'USD', name: 'Dólar', price: 'R$ 5,85', change: '-0.30%', up: false },
    { symbol: 'BTC', name: 'Bitcoin', price: 'R$ 380k', change: '+2.10%', up: true },
    { symbol: 'CDI', name: 'Taxa Selic', price: '11.25%', change: 'a.a.', up: true },
];

const powerQuotes = [
    { text: "O preço é o que você paga. Valor é o que você leva.", author: "Warren Buffett" },
    { text: "Não trabalhe pelo dinheiro. Faça o dinheiro trabalhar por você.", author: "Robert Kiyosaki" },
    { text: "A riqueza é a capacidade de experimentar a vida plenamente.", author: "Henry D. Thoreau" },
    { text: "Invista em si mesmo. Sua carreira é o motor da sua riqueza.", author: "Paul Clitheroe" },
    { text: "Jamais gaste seu dinheiro antes de possuí-lo.", author: "Thomas Jefferson" },
];

const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ currentBalance }) => {
  const [activeContent, setActiveContent] = useState<string>('welcome'); 
  const [currentQuote, setCurrentQuote] = useState(powerQuotes[0]);

  useEffect(() => {
      const randomIndex = Math.floor(Math.random() * powerQuotes.length);
      setCurrentQuote(powerQuotes[randomIndex]);
  }, [activeContent]);
  
  // === ESTADOS DO SIMULADOR ===
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
      
      {/* 1. LINHA SUPERIOR: STATUS + CHECKLIST */}
      <div className="shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-3 h-auto lg:h-[150px]">
          {/* CARD DE STATUS */}
          <div className={`lg:col-span-4 p-4 rounded-[2rem] relative overflow-hidden shadow-sm transition-colors duration-500 flex flex-col justify-center ${
            financialStatus === 'debt' ? 'bg-rose-600' : 
            financialStatus === 'building' ? 'bg-orange-500' : 'bg-emerald-600'
          }`}>
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-white/20 rounded-lg backdrop-blur-md">
                   {financialStatus === 'debt' ? <AlertTriangle className="w-4 h-4" /> :
                    financialStatus === 'building' ? <ShieldCheck className="w-4 h-4" /> :
                    <TrendingUp className="w-4 h-4" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full">
                  Diagnóstico
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tighter mb-1">
                {financialStatus === 'debt' ? 'Sair do Vermelho' : 
                 financialStatus === 'building' ? 'Construir Segurança' : 'Acelerar Riqueza'}
              </h2>
              <p className="text-white/90 font-medium text-[10px] leading-tight max-w-xs drop-shadow-md">
                {financialStatus === 'debt' ? 'Prioridade: Estancar juros. Organize dívidas e corte gastos não essenciais agora.' :
                 financialStatus === 'building' ? 'Prioridade: Monte sua Reserva de Emergência (6 meses de custo de vida).' :
                 'Prioridade: O dinheiro trabalha por você. Diversifique para aumentar rendimentos.'}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 p-4 opacity-10 pointer-events-none"><Lightbulb className="w-20 h-20 text-white" /></div>
          </div>

          {/* CHECKLIST */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col">
               <h3 className="text-xs font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                 <Target className="w-3.5 h-3.5 text-emerald-500" /> Próximos Passos
               </h3>
               <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar">
                  {financialStatus === 'debt' && (
                    <>
                      <CheckItem text="Listar Dívidas" isChecked={completedSteps.includes('debt_1')} onToggle={() => toggleStep('debt_1')} />
                      <CheckItem text="Cortar Assinaturas" isChecked={completedSteps.includes('debt_2')} onToggle={() => toggleStep('debt_2')} />
                      <CheckItem text="Negociar Credores" isChecked={completedSteps.includes('debt_3')} onToggle={() => toggleStep('debt_3')} />
                      <CheckItem text="Vender Itens" isChecked={completedSteps.includes('debt_4')} onToggle={() => toggleStep('debt_4')} />
                    </>
                  )}
                  {financialStatus === 'building' && (
                    <>
                      <CheckItem text="Meta 3 Meses" isChecked={completedSteps.includes('build_1')} onToggle={() => toggleStep('build_1')} />
                      <CheckItem text="Poupar 10%" isChecked={completedSteps.includes('build_2')} onToggle={() => toggleStep('build_2')} />
                      <CheckItem text="Revisar Gastos" isChecked={completedSteps.includes('build_3')} onToggle={() => toggleStep('build_3')} />
                      <CheckItem text="CDB Liq. Diária" isChecked={completedSteps.includes('build_4')} onToggle={() => toggleStep('build_4')} />
                    </>
                  )}
                  {financialStatus === 'investing' && (
                    <>
                      <CheckItem text="Diversificar" isChecked={completedSteps.includes('inv_1')} onToggle={() => toggleStep('inv_1')} />
                      <CheckItem text="Estudar FIIs" isChecked={completedSteps.includes('inv_2')} onToggle={() => toggleStep('inv_2')} />
                      <CheckItem text="Aportes 20%" isChecked={completedSteps.includes('inv_3')} onToggle={() => toggleStep('inv_3')} />
                      <CheckItem text="Aposentadoria" isChecked={completedSteps.includes('inv_4')} onToggle={() => toggleStep('inv_4')} />
                    </>
                  )}
               </div>
          </div>
      </div>

      {/* 2. LINHA INFERIOR */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* MENU LATERAL */}
        <div className="lg:col-span-3 flex flex-col gap-3 overflow-hidden h-full">
            
            {/* Ferramentas */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-l-[6px] border-orange-500 shadow-sm p-1 flex-1 flex flex-col justify-center">
                <div className="px-4 py-2 mb-1"><h3 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2"><Calculator className="w-4 h-4"/> Ferramentas</h3></div>
                <div className="space-y-1 px-1">
                    <MenuItem title="Início" icon={<Home className="w-5 h-5 text-emerald-600"/>} active={activeContent === 'welcome'} onClick={() => setActiveContent('welcome')} />
                    <MenuItem title="Mercado Hoje" icon={<Activity className="w-5 h-5 text-rose-500"/>} active={activeContent === 'market'} onClick={() => setActiveContent('market')} />
                    <MenuItem title="Simulador de Juros" icon={<Calculator className="w-5 h-5 text-emerald-500"/>} active={activeContent === 'juros'} onClick={() => setActiveContent('juros')} />
                    <MenuItem title="Regra 50/30/20" icon={<TrendingUp className="w-5 h-5 text-sky-500"/>} active={activeContent === 'rule'} onClick={() => setActiveContent('rule')} />
                    <MenuItem title="Reserva de Emergência" icon={<ShieldCheck className="w-5 h-5 text-emerald-600"/>} active={activeContent === 'reserva'} onClick={() => setActiveContent('reserva')} />
                </div>
            </div>

            {/* Universidade */}
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

        {/* VISOR PRINCIPAL */}
        <div className="lg:col-span-9 bg-white dark:bg-zinc-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden h-full relative flex flex-col">
           
           {/* FRASE DE EFEITO (MAIOR E MAIS DESTACADA) */}
           {activeContent !== 'welcome' && (
             <div className="mb-4 p-5 bg-slate-50 dark:bg-zinc-800/60 rounded-3xl border border-slate-100 dark:border-zinc-700 relative overflow-hidden shrink-0 flex items-center justify-between">
                 <div className="flex items-center gap-4 max-w-[80%]">
                    <Quote className="w-8 h-8 text-emerald-500/50 rotate-180 shrink-0" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-200 italic leading-snug">"{currentQuote.text}"</p>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 whitespace-nowrap pl-4 border-l border-slate-200 dark:border-zinc-700">— {currentQuote.author}</p>
             </div>
           )}

           {/* ÁREA DE CONTEÚDO */}
           <div className="flex-1 overflow-hidden relative">
               
               {/* 0. WELCOME (TEXTO EXPANDIDO E PODEROSO) */}
               {activeContent === 'welcome' && (
                   <div className="h-full flex flex-col justify-between animate-in fade-in zoom-in-95 duration-500">
                       <div className="text-center flex flex-col items-center justify-center flex-1 p-6">
                           <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl">
                                <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                           </div>
                           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                               Bem-vindo ao <span className="text-emerald-500">VittaCash</span>
                           </h1>
                           <div className="max-w-4xl text-slate-600 dark:text-slate-300 text-lg leading-relaxed space-y-4">
                               <p>
                                   O <strong>VittaCash</strong> não é apenas uma planilha; é a sua central de comando para a liberdade financeira. 
                                   Nossa missão é simples e ambiciosa: tirar você da estagnação financeira e colocá-lo na rota da prosperidade.
                               </p>
                               <p>
                                   Aqui, transformamos números frios em estratégias quentes. Utilize nossos simuladores para ver o futuro do seu dinheiro, 
                                   explore a "Universidade" para blindar sua mente contra o consumismo e descubra onde investir com segurança e rentabilidade.
                                   Não importa se você está endividado ou começando a investir: o VittaCash é o parceiro que faltava para você assumir o controle.
                               </p>
                           </div>
                       </div>
                       {/* FOOTER */}
                       <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="w-14 h-14 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 shadow-md"><img src="/logo-a2.jpg" alt="A2" className="w-full h-full object-cover" /></div>
                                   <div className="text-left"><h4 className="text-base font-black text-slate-900 dark:text-white">A2 Solutions</h4><p className="text-xs text-slate-500">Tecnologia que Transforma</p></div>
                               </div>
                               <div className="flex gap-3">
                                   <a href="https://instagram.com/a2soluntions" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-purple-600 to-rose-500 text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all"><Instagram className="w-4 h-4" /> Instagram</a>
                                   <a href="https://wa.me/5534998408962" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* 1. MERCADO */}
               {activeContent === 'market' && (
                   <div className="h-full flex flex-col justify-center animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Activity className="w-6 h-6 text-rose-500" />} title="Mercado Hoje" subtitle="Indicadores em tempo real." />
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                           {marketData.map((item, idx) => (
                               <div key={idx} className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 text-center hover:scale-105 transition-transform">
                                   <p className="text-xs font-black uppercase text-slate-400 mb-2">{item.name}</p>
                                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.price}</h3>
                                   <div className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-bold ${item.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                       {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                       {item.change}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* 2. TIPOS DE INVESTIMENTO (TEXTO MAIOR) */}
               {activeContent === 'invest_types' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<BarChart3 className="w-6 h-6 text-orange-500" />} title="Tipos de Investimento" subtitle="Escada de risco." />
                       <div className="grid grid-cols-2 gap-4 mt-4 h-full pb-2 overflow-y-auto custom-scrollbar">
                           <InvestCard title="Poupança" risk="Baixíssimo" liquidity="Imediata" desc="Seguro, mas desvaloriza seu dinheiro. Use apenas para curtíssimo prazo." color="slate" />
                           <InvestCard title="CDB / Tesouro" risk="Baixo" liquidity="Diária" desc="Você empresta para o Banco ou Governo. A base de qualquer carteira sólida." color="emerald" />
                           <InvestCard title="FIIs (Imóveis)" risk="Médio" liquidity="Média" desc="Receba aluguel mensal sem comprar tijolo. Isento de Imposto de Renda." color="sky" />
                           <InvestCard title="Ações" risk="Alto" liquidity="Alta" desc="Torne-se sócio de grandes empresas. Foco total no longo prazo (5+ anos)." color="rose" />
                       </div>
                   </div>
               )}

               {/* 3. SIMULADOR (INPUTS LATERAIS) */}
               {activeContent === 'juros' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Calculator className="w-6 h-6 text-emerald-500" />} title="Simulador de Riqueza" subtitle="Juros Compostos." />
                       
                       <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-4 min-h-0">
                           {/* CONTROLES NA LATERAL ESQUERDA */}
                           <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
                                <div className="p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 space-y-4">
                                    <InputGroup label="Tenho Hoje (R$)" value={simInitial} onChange={setSimInitial} />
                                    <InputGroup label="Poupo Mensal (R$)" value={simMonthly} onChange={setSimMonthly} />
                                    <InputGroup label="Anos Investindo" value={simYears} onChange={setSimYears} />
                                    <InputGroup label="Taxa % ao ano" value={simRate} onChange={setSimRate} />
                                </div>
                                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex-1 flex flex-col justify-center text-center">
                                    <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 mb-2">Total Acumulado</p>
                                    <p className="text-3xl font-black text-emerald-700 dark:text-white tracking-tighter">R$ {simulationData[simulationData.length - 1].total.toLocaleString()}</p>
                                    <div className="h-px bg-emerald-200/50 dark:bg-emerald-700/30 my-3 w-1/2 mx-auto"></div>
                                    <p className="text-[10px] font-black uppercase text-orange-500 mb-1">Rendimento Puro</p>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">+ R$ {simulationData[simulationData.length - 1].juros.toLocaleString()}</p>
                                </div>
                           </div>

                           {/* GRÁFICO NA DIREITA */}
                           <div className="w-full lg:w-2/3 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 flex flex-col">
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={simulationData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="ano" tick={{fontSize: 11}} axisLine={false} tickLine={false} interval={simYears > 15 ? 4 : 1} />
                                            <Tooltip contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff'}} formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`, '']} />
                                            <Area type="monotone" dataKey="total" stroke="#22c55e" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} name="Total" />
                                            <Area type="monotone" dataKey="investido" stroke="#f97316" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" name="Investido" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* 4. CONTEÚDOS DE TEXTO (TEXTO MAIOR) */}
               {activeContent === 'psycho' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Brain className="w-6 h-6 text-indigo-500" />} title="Psicologia" subtitle="Mente blindada." />
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto">
                           <CardContent title="Regra das 24 Horas" color="rose">Viu algo que quer? Espere 24h. A emoção baixa e a lógica volta. Para itens caros, espere 30 dias.</CardContent>
                           <CardContent title="Custo em Horas" color="blue">Divida o preço pelo seu ganho/hora. "Isso vale 20 horas de trabalho?" Isso muda sua percepção de valor.</CardContent>
                           <CardContent title="Armadilha do Mercado" color="emerald" icon={<ShoppingCart className="w-5 h-5"/>}>Nunca vá ao mercado com fome e sem lista. Seu cérebro faminto comprará calorias caras e desnecessárias.</CardContent>
                           <CardContent title="Cancele Newsletters" color="slate">O que os olhos não veem, o bolso não sente. Saia das listas de e-mail de lojas para evitar tentações.</CardContent>
                       </div>
                   </div>
               )}

               {activeContent === 'books' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Library className="w-6 h-6 text-purple-500" />} title="Biblioteca" subtitle="Leituras obrigatórias." />
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto">
                           <BookRecommendation title="Psicologia Financeira" author="Morgan Housel" desc="O comportamento é mais importante que a inteligência técnica." />
                           <BookRecommendation title="Pai Rico, Pai Pobre" author="Robert Kiyosaki" desc="A diferença crucial entre Ativos (põe dinheiro) e Passivos (tiram)." />
                           <BookRecommendation title="Homem Mais Rico da Babilônia" author="George Clason" desc="Leis antigas do dinheiro: pague-se primeiro e viva com menos." />
                           <BookRecommendation title="Segredos da Mente" author="T. Harv Eker" desc="Como reprogramar seu 'termostato financeiro' interno." />
                       </div>
                   </div>
               )}

               {activeContent === 'income' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<Zap className="w-6 h-6 text-yellow-500" />} title="Renda Extra" subtitle="Aumente seu caixa." />
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto">
                           <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 flex gap-4 items-start">
                               <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl"><DollarSign className="w-6 h-6 text-yellow-600"/></div>
                               <div><h4 className="font-bold text-base text-yellow-800 dark:text-yellow-400">Venda o Parado</h4><p className="text-sm text-yellow-700/80 mt-1 leading-relaxed">Roupas, móveis, eletrônicos. Se não usou em 6 meses, venda na OLX ou Enjoei.</p></div>
                           </div>
                           <div className="p-5 bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/20 flex gap-4 items-start">
                               <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl"><BookOpen className="w-6 h-6 text-sky-600"/></div>
                               <div><h4 className="font-bold text-base text-sky-800 dark:text-sky-400">Freelancer</h4><p className="text-sm text-sky-700/80 mt-1 leading-relaxed">Workana, 99Freelas. Escreva, traduza, desenhe ou edite vídeos nas horas vagas.</p></div>
                           </div>
                           <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 flex gap-4 items-start">
                               <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Activity className="w-6 h-6 text-purple-600"/></div>
                               <div><h4 className="font-bold text-base text-purple-800 dark:text-purple-400">Consultoria</h4><p className="text-sm text-purple-700/80 mt-1 leading-relaxed">Venda seu conhecimento profissional. Dê aulas, mentorias ou revise trabalhos.</p></div>
                           </div>
                       </div>
                   </div>
               )}

               {activeContent === 'rule' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<TrendingUp className="w-6 h-6 text-sky-500" />} title="Regra 50/30/20" subtitle="Orçamento ideal." />
                       <div className="flex-1 flex flex-col md:flex-row items-center gap-6 mt-2 overflow-hidden">
                           <div className="w-full md:w-1/2 h-full min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data503020} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                            {data503020.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                           </div>
                           <div className="w-full md:w-1/2 space-y-6 pr-4">
                               <RuleItem color="bg-orange-500" title="50% Necessidades" desc="Aluguel, conta de luz, mercado, transporte." />
                               <RuleItem color="bg-sky-500" title="30% Desejos" desc="Lazer, iFood, Netflix, presentes." />
                               <RuleItem color="bg-emerald-500" title="20% Futuro" desc="Pagar dívidas ou investir para aposentadoria." />
                           </div>
                       </div>
                   </div>
               )}

               {activeContent === 'reserva' && (
                   <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
                       <HeaderContent icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />} title="Reserva de Emergência" subtitle="Sua segurança." />
                       <div className="flex-1 flex flex-col justify-center gap-6 p-4">
                           {/* META PRINCIPAL */}
                           <div className="bg-slate-100 dark:bg-zinc-800 rounded-[2rem] p-8 w-full text-center border-2 border-emerald-500/20">
                               <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Meta de Ouro</p>
                               <div className="text-6xl font-black text-emerald-500 tracking-tighter mb-2">6 Meses</div>
                               <p className="text-lg font-bold text-slate-700 dark:text-white">Do seu Custo de Vida Mensal</p>
                           </div>
                           
                           {/* CARDS DE EXPLICAÇÃO */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10">
                                   <p className="text-sm font-black uppercase text-emerald-600 dark:text-emerald-400 mb-2">Onde Guardar?</p>
                                   <p className="text-base text-slate-700 dark:text-slate-300 leading-snug">Tesouro Selic ou CDB com liquidez diária (100% CDI). Precisa poder sacar na hora.</p>
                               </div>
                               <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10">
                                   <p className="text-sm font-black uppercase text-rose-600 dark:text-rose-400 mb-2">Quando Usar?</p>
                                   <p className="text-base text-slate-700 dark:text-slate-300 leading-snug">Apenas emergências reais: desemprego, doença ou carro quebrado. Viagem não é emergência!</p>
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

// --- COMPONENTES VISUAIS (FONTS AUMENTADAS) ---

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
        <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl">{icon}</div>
        <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
    </div>
);

const InvestCard = ({ title, risk, liquidity, desc, color }: any) => {
    const colors: Record<string, string> = {
        slate: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20',
        emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
        sky: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20',
        rose: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col gap-2 min-h-[160px]`}>
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{title}</h4>
                <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 text-slate-500">{risk}</span>
            </div>
            <p className="text-sm opacity-90 leading-snug text-slate-700 dark:text-slate-300">{desc}</p>
            <div className="mt-auto pt-2 border-t border-slate-200/50 dark:border-white/10">
                 <span className="text-[10px] uppercase font-bold opacity-60 mr-2">Liquidez:</span>
                 <span className="text-xs font-bold">{liquidity}</span>
            </div>
        </div>
    )
}

const CardContent = ({ title, children, color, icon }: any) => {
    const colorClasses: Record<string, string> = {
        rose: 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 text-rose-900 dark:text-rose-100',
        blue: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 text-blue-900 dark:text-blue-100',
        emerald: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-100',
        slate: 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 text-slate-900 dark:text-slate-100',
    };
    return (
        <div className={`p-5 rounded-2xl border ${colorClasses[color]} flex flex-col justify-center min-h-[140px]`}>
            <div className="flex items-center gap-2 mb-2">
                {icon && <div className="opacity-70 scale-90">{icon}</div>}
                <h4 className="font-black text-base uppercase opacity-80">{title}</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">{children}</p>
        </div>
    );
};

const InputGroup = ({ label, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full bg-white dark:bg-black rounded-xl px-3 py-2.5 text-sm font-bold border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-colors dark:text-white" />
    </div>
);

const RuleItem = ({ color, title, desc }: any) => (
    <div className="flex gap-4 items-center">
        <div className={`w-4 h-4 rounded-full ${color} shrink-0 shadow-sm`}></div>
        <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h5>
            <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
    </div>
);

const BookRecommendation = ({ title, author, desc }: { title: string, author: string, desc: string }) => (
    <div className="flex gap-4 items-start p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800/50 min-h-[120px]">
        <div className="w-10 h-14 bg-white dark:bg-zinc-900 rounded-md shrink-0 flex items-center justify-center shadow-sm border border-slate-200 dark:border-zinc-700 mt-1">
            <BookOpen className="w-4 h-4 text-purple-400" />
        </div>
        <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
            <p className="text-xs text-slate-500 italic mb-1">{author}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight">{desc}</p>
        </div>
    </div>
);

const CheckItem = ({ text, isChecked, onToggle }: { text: string, isChecked: boolean, onToggle: () => void }) => (
  <button onClick={onToggle} className={`w-full flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 group text-left h-full ${isChecked ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-zinc-600 text-transparent group-hover:border-emerald-400'}`}>
      {isChecked ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-full h-full" />}
    </div>
    <span className={`text-[10px] font-bold leading-tight transition-all ${isChecked ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
  </button>
);

export default FinancialAdvisor;