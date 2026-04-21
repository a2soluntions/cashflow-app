import React, { useState } from 'react';
import { 
  LineChart, TrendingUp, ShieldCheck, Building2, Globe, 
  ArrowUpRight, Target, Zap, Clock, Banknote, Rocket, 
  Percent, ArrowRightCircle
} from 'lucide-react';

interface InvestmentRadarProps {
  theme?: 'light' | 'dark';
}

export function InvestmentRadar({ theme = 'dark' }: InvestmentRadarProps) {
  const isLight = theme === 'light';
  
  // Simulator State
  const [initialAmount, setInitialAmount] = useState<number | ''>('');
  const [monthlyContribution, setMonthlyContribution] = useState<number | ''>('');
  const [timeYears, setTimeYears] = useState<number | ''>('');

  // Constants (Simulated Market Data)
  const RATES = {
    selic: 10.75,
    ipca: 4.50,
    poupança: 6.17, // 70% selic aprox
    carteiraVitta: 13.5 // FIIs + Renda Fixa + Ações Globais
  };

  // Math: Future Value Compound Interest
  // FV = P * (1 + r)^n + PMT * [ ((1 + r)^n - 1) / r ]
  const calculateFutureValue = (principal: number, monthlyAdd: number, rateAnual: number, years: number) => {
    const rateMonthly = rateAnual / 12 / 100;
    const months = years * 12;
    let fv = principal * Math.pow(1 + rateMonthly, months);
    if (monthlyAdd > 0 && rateMonthly > 0) {
      fv += monthlyAdd * ((Math.pow(1 + rateMonthly, months) - 1) / rateMonthly);
    }
    return fv;
  };

  const calculateTotalInvested = (principal: number, monthlyAdd: number, years: number) => {
    return principal + (monthlyAdd * years * 12);
  };

  const parsedInitial = Number(initialAmount) || 0;
  const parsedMonthly = Number(monthlyContribution) || 0;
  const parsedYears = Number(timeYears) || 0;

  const savingsFV = calculateFutureValue(parsedInitial, parsedMonthly, RATES.poupança, parsedYears);
  const vittaFV = calculateFutureValue(parsedInitial, parsedMonthly, RATES.carteiraVitta, parsedYears);
  const totalInvested = calculateTotalInvested(parsedInitial, parsedMonthly, parsedYears);

  const maxVal = Math.max(vittaFV, 1); // evita divisão por zero
  const widthInvested = vittaFV === 0 ? 0 : Math.min((totalInvested / maxVal) * 100, 100);
  const widthSavings = vittaFV === 0 ? 0 : Math.min((savingsFV / maxVal) * 100, 100);
  const widthVitta = vittaFV === 0 ? 0 : 100;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 overflow-hidden pb-4">
      
      {/* 1. HEADER & MACRO */}
      <section className="shrink-0 px-2 flex flex-col md:flex-row justify-between items-end gap-6 pb-8">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500 uppercase tracking-tighter">
            Radar de Investimentos
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <LineChart size={14} className="text-emerald-500" /> Leitura Macro-Econômica Atualizada
          </p>
        </div>

        <div className="flex gap-4">
            <div className={`px-5 py-3 rounded-2xl shadow-lg text-center ${isLight ? 'bg-white' : 'bg-black/40'}`}>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Taxa Selic Base</p>
                <p className="text-xl font-black text-white">{RATES.selic}% <span className="text-[10px] text-emerald-400">a.a</span></p>
            </div>
            <div className={`px-5 py-3 rounded-2xl shadow-lg text-center ${isLight ? 'bg-white' : 'bg-black/40'}`}>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Inflação (IPCA)</p>
                <p className="text-xl font-black text-rose-400">{RATES.ipca}% <span className="text-[10px]">ano</span></p>
            </div>
            <div className={`hidden md:block px-5 py-3 rounded-2xl shadow-lg text-center ${isLight ? 'bg-white' : 'bg-black/40'}`}>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Juro Real Médio</p>
                <p className="text-xl font-black text-indigo-400">{(RATES.selic - RATES.ipca).toFixed(2)}%</p>
            </div>
        </div>
      </section>

      {/* CONTAINER DE ROLAGEM */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 pr-2 pb-10">
      {/* 2. RECOMENDAÇÕES VITTACASH */}
      <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <Target size={14}/> Top Alocações do Momento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CONSERVADOR */}
              <div className={`p-6 flex flex-col items-start rounded-[2rem] transition-all hover:scale-[1.02] shadow-xl ${isLight ? 'bg-white shadow-xl' : 'bg-indigo-900/10 shadow-[-10px_-10px_30px_rgba(99,102,241,0.05)]'}`}>
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl mb-4">
                      <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Caixa Forte</h3>
                  <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-1 mb-4 uppercase">Risco Baixo • Alta Liquidez</p>
                  
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
                      O seu "colchão de paz mútua". Não busque ficar rico aqui, busque não perder para a inflação. Manter dinheiro na poupança atual é derretimento garantido.
                  </p>
                  
                  <div className="w-full mt-auto space-y-3 pt-6">
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-indigo-400"/> Tesouro Selic</span>
                          <span className="text-[9px] font-black text-emerald-400">Padrão Ouro</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-indigo-400"/> CDBs Bancos API</span>
                          <span className="text-[9px] font-black text-emerald-400">{'>'} 110% do CDI</span>
                      </div>
                  </div>
              </div>

              {/* MODERADO / FIIS */}
              <div className={`p-6 flex flex-col items-start rounded-[2rem] transition-all hover:scale-[1.02] shadow-xl ${isLight ? 'bg-white shadow-xl' : 'bg-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]'}`}>
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl mb-4">
                      <Building2 size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Renda Mensal (FIIs)</h3>
                  <p className="text-[10px] text-emerald-400 font-bold tracking-widest mt-1 mb-4 uppercase">Risco Médio • Dividendos</p>
                  
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
                      Comprar "tijolos virtuais" e receber os pinguinhos de aluguel isentos de IR na conta corrente no dia 15. A mágica da bola de neve física real.
                  </p>
                  
                  <div className="w-full mt-auto space-y-3 pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-emerald-400"/> FIIs de Tijolo (Logística)</span>
                          <span className="text-[9px] font-black text-emerald-400">P/VP {'<'} 1.0</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-emerald-400"/> Fundos de Papel</span>
                          <span className="text-[9px] font-black text-rose-400">CDI + 2.5%</span>
                      </div>
                  </div>
              </div>

              {/* ARROJADO */}
              <div className={`p-6 flex flex-col items-start rounded-[2rem] transition-all hover:scale-[1.02] shadow-xl ${isLight ? 'bg-white shadow-xl' : 'bg-purple-900/10 shadow-[10px_10px_30px_rgba(168,85,247,0.05)]'}`}>
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl mb-4">
                      <Globe size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Motor de Crescimento</h3>
                  <p className="text-[10px] text-purple-400 font-bold tracking-widest mt-1 mb-4 uppercase">Risco Alto • Prazo Longo</p>
                  
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
                      É onde as grandes fortunas ganham de lavada da inflação local dolarizando as ações globais e capturando o desenvolvimento mundial (S&P500).
                  </p>
                  
                  <div className="w-full mt-auto space-y-3 pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-purple-400"/> ETFs SP500 (IVVB11)</span>
                          <span className="text-[9px] font-black text-emerald-400">Proteção Dólar</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><ArrowRightCircle size={12} className="text-purple-400"/> Ações de Valor (B3)</span>
                          <span className="text-[9px] font-black text-yellow-400">Bancos/Energia</span>
                      </div>
                  </div>
              </div>

          </div>
      </section>

      {/* 3. SIMULADOR DO TEMPO */}
      <section className="mt-6 flex flex-col xl:flex-row gap-6">
          
          <div className={`flex-1 p-8 rounded-[3rem] relative overflow-hidden shadow-xl ${isLight ? 'bg-white shadow-xl' : 'bg-white/5'}`}>
              <div className="absolute top-0 right-0 p-40 rounded-full blur-[100px] bg-[#00d06c]/10 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Clock className="text-[#00d06c]" /> Simulador: A Máquina do Tempo
                    </h2>
                    <p className="text-xs text-slate-400 mt-2">Esta é uma ferramenta de simulação isolada. Preencha os campos abaixo com valores hipotéticos para projetar juros futuros.</p>
                  </div>
                  <Rocket className="text-[#00d06c]/20" size={60} />
              </div>

              {/* INPUTS SIMULADOR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className={`p-4 rounded-2xl shadow-sm ${isLight ? 'bg-slate-50' : 'bg-black/40'}`}>
                      <label className="text-[9px] font-black uppercase text-zinc-500 mb-2 block flex items-center gap-2"><Banknote size={12}/> Aporte Inicial</label>
                      <input 
                         type="number" 
                         placeholder="Ex: 1000"
                         value={initialAmount === '' ? '' : initialAmount} 
                         onChange={e => setInitialAmount(e.target.value === '' ? '' : Number(e.target.value))}
                         className={`w-full bg-transparent text-xl font-black outline-none placeholder:text-zinc-700 ${isLight ? 'text-slate-900' : 'text-white'}`}
                      />
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${isLight ? 'bg-slate-50' : 'bg-black/40'}`}>
                      <label className="text-[9px] font-black uppercase text-zinc-500 mb-2 block flex items-center gap-2"><ArrowUpRight size={12}/> Aporte Mensal</label>
                      <input 
                         type="number"
                         placeholder="Ex: 500" 
                         value={monthlyContribution === '' ? '' : monthlyContribution} 
                         onChange={e => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))}
                         className={`w-full bg-transparent text-xl font-black outline-none placeholder:text-zinc-700 ${isLight ? 'text-slate-900' : 'text-white'}`}
                      />
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${isLight ? 'bg-slate-50' : 'bg-black/40'}`}>
                      <label className="text-[9px] font-black uppercase text-zinc-500 mb-2 block flex items-center gap-2"><Clock size={12}/> Anos (Tempo)</label>
                      <input 
                         type="number"
                         placeholder="Ex: 10" 
                         value={timeYears === '' ? '' : timeYears} 
                         onChange={e => setTimeYears(e.target.value === '' ? '' : Number(e.target.value))}
                         className={`w-full bg-transparent text-xl font-black outline-none placeholder:text-zinc-700 ${isLight ? 'text-slate-900' : 'text-white'}`}
                      />
                  </div>
              </div>

              {/* RESULTADO (BARRAS) */}
              <div className="space-y-6">
                  
                  <div className="flex items-center gap-4">
                      <div className="w-1/4">
                          <p className="text-[10px] font-black uppercase text-zinc-500">Valor Investido (Real)</p>
                          <p className="text-sm font-black text-white">{formatCurrency(totalInvested)}</p>
                      </div>
                      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 left-0 h-full bg-slate-500/50 rounded-full transition-all duration-1000 ease-out" style={{ width: `${widthInvested}%` }} />
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="w-1/4">
                          <p className="text-[10px] font-black uppercase text-rose-500">Poupança ({RATES.poupança}% a.a)</p>
                          <p className="text-sm font-black text-rose-400">{formatCurrency(savingsFV)}</p>
                      </div>
                      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 left-0 h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${widthSavings}%` }} />
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="w-1/4">
                          <p className="text-[10px] font-black uppercase text-[#00d06c]">VittaCash + FII/Ações</p>
                          <p className="text-lg font-black text-[#00d06c]">{formatCurrency(vittaFV)}</p>
                      </div>
                      <div className="flex-1 h-8 bg-[#00d06c]/10 rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(0,208,108,0.2)]">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-[#00d06c] rounded-full transition-all duration-1000 ease-out" style={{ width: `${widthVitta}%` }} />
                      </div>
                  </div>

              </div>

          </div>

          <div className={`w-full xl:w-80 flex flex-col gap-4 shrink-0`}>
             <div className={`p-6 rounded-[2rem] h-full flex flex-col justify-center text-center shadow-xl ${isLight ? 'bg-white shadow-xl' : 'bg-gradient-to-br from-indigo-900/40 to-black/40'}`}>
                 <Percent className="text-indigo-400 mx-auto mb-4" size={40} />
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">A Mágica do Juro Global</h3>
                 <p className="text-xs text-slate-300 leading-relaxed mb-6">
                     Migrando seu dinheiro da Caderneta de Poupança para uma estratégia ativa e diversificada de ações, FIIs e Tesouro Direto, a sua fortuna ao longo das décadas gera a "Bola de Neve" implacável que as instituições bancárias esconderam de você.
                 </p>
                 <div className="mt-auto p-4 bg-indigo-500/20 text-indigo-300 rounded-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest">Diferença de Patrimônio</p>
                     <p className="text-2xl font-black">{formatCurrency(vittaFV - savingsFV)} a mais</p>
                 </div>
             </div>
          </div>
      </section>
      </div>

    </div>
  );
}
