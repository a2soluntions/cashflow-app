import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import {
  LineChart, TrendingUp, ShieldCheck, Building2, Globe,
  ArrowUpRight, Target, Zap, Clock, Banknote, Rocket,
  Percent, ArrowRightCircle, Newspaper, ExternalLink
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

  // Indicators State (Mercado)
  const [indicators, setIndicators] = useState<any[]>([]);

  useEffect(() => {
    async function loadIndicators() {
      try {
        const res = await fetch('/api/get-financial-data');
        if (res.ok) {
          const data = await res.json();
          if (data.selic) {
            setIndicators([
              { title: 'SELIC', value: data.selic.value, symbol: '%' },
              { title: 'IPCA', value: data.ipca.value, symbol: '%' },
              { title: 'DÓLAR', value: data.dolar.value, symbol: 'R$' },
              { title: 'IBOVESPA', value: '127.450', symbol: 'pts' },
              { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
            ]);
            return;
          }
        }
      } catch (e) { /* fallback */ }
      setIndicators([
        { title: 'SELIC', value: '10.75', symbol: '%' },
        { title: 'IPCA', value: '4.50', symbol: '%' },
        { title: 'DÓLAR', value: '5.45', symbol: 'R$' },
        { title: 'IBOVESPA', value: '127.450', symbol: 'pts' },
        { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
      ]);
    }
    loadIndicators();
  }, []);

  const RATES = { selic: 10.75, ipca: 4.50, poupança: 6.17, carteiraVitta: 13.5 };

  const calculateFutureValue = (principal: number, monthlyAdd: number, rateAnual: number, years: number) => {
    const rateMonthly = rateAnual / 12 / 100;
    const months = years * 12;
    let fv = principal * Math.pow(1 + rateMonthly, months);
    if (monthlyAdd > 0 && rateMonthly > 0) fv += monthlyAdd * ((Math.pow(1 + rateMonthly, months) - 1) / rateMonthly);
    return fv;
  };

  const calculateTotalInvested = (principal: number, monthlyAdd: number, years: number) => principal + (monthlyAdd * years * 12);

  const parsedInitial = Number(initialAmount) || 0;
  const parsedMonthly = Number(monthlyContribution) || 0;
  const parsedYears = Number(timeYears) || 0;

  const savingsFV = calculateFutureValue(parsedInitial, parsedMonthly, RATES.poupança, parsedYears);
  const vittaFV = calculateFutureValue(parsedInitial, parsedMonthly, RATES.carteiraVitta, parsedYears);
  const totalInvested = calculateTotalInvested(parsedInitial, parsedMonthly, parsedYears);

  const maxVal = Math.max(vittaFV, 1);
  const widthInvested = vittaFV === 0 ? 0 : Math.min((totalInvested / maxVal) * 100, 100);
  const widthSavings = vittaFV === 0 ? 0 : Math.min((savingsFV / maxVal) * 100, 100);
  const widthVitta = vittaFV === 0 ? 0 : 100;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full w-full flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">

      {/* 1. HEADER - EQUILIBRADO */}
      <section className="shrink-0 px-2 flex justify-between items-center pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500 uppercase tracking-tighter">Radar de Investimentos</h1>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <LineChart size={12} className="text-emerald-500" /> Leitura Macro-Econômica
          </p>
        </div>

        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-slate-400">Selic</p>
            <p className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{RATES.selic}%</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-slate-400">IPCA</p>
            <p className="text-base font-black text-rose-400">{RATES.ipca}%</p>
          </div>
        </div>
      </section>

      {/* 📈 TICKER - SLIM */}
      <section className="px-2 shrink-0">
        <div className={`overflow-hidden py-2 border-b border-white/5 ${isLight ? 'bg-white' : 'bg-transparent'}`}>
          <div className="flex animate-marquee-radar hover:pause gap-12 items-center min-w-full">
            {(() => {
              const list = indicators.length > 0 ? indicators : [{ title: 'SELIC', value: '10.75', symbol: '%' }];
              const repeatedList = [...list, ...list, ...list, ...list];
              return repeatedList.map((ind, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-black uppercase text-slate-500">{ind.title}</span>
                  <span className={`text-[13px] font-black italic ${isLight ? 'text-slate-900' : 'text-white'}`}>{ind.symbol}{ind.value}</span>
                  <TrendingUp size={10} className="text-emerald-500" />
                </div>
              ));
            })()}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
     @keyframes marquee-radar { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
     .animate-marquee-radar { display: flex; width: fit-content; animation: marquee-radar 35s linear infinite; }
     .hover\\:pause:hover { animation-play-state: paused; }
   `}} />
      </section>

      {/* 🏰 CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-2 flex flex-col lg:flex-row gap-2 overflow-y-auto custom-scrollbar pb-10">

        {/* LADO ESQUERDO: CARDS */}
        <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
          <div className={`p-4 flex-1 flex flex-col rounded-2xl ${isLight ? 'bg-white ' : 'bg-black/30 border border-white/5 backdrop-blur-xl'}`}>
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-3"><ShieldCheck size={20} /></div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Conservador</h3>
            <p className="text-[10px] text-slate-500 mb-4">Liquidez Diária</p>
            <div className="mt-auto space-y-2">
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>Tesouro Selic</span></div>
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>CDBs 110%</span></div>
            </div>
          </div>

          <div className={`p-4 flex-1 flex flex-col rounded-2xl ${isLight ? 'bg-white ' : 'bg-black/30 border border-white/5 backdrop-blur-xl'}`}>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-3"><Building2 size={20} /></div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Moderado</h3>
            <p className="text-[10px] text-slate-500 mb-4">Renda Mensal</p>
            <div className="mt-auto space-y-2">
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>FIIs Logística</span></div>
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>FIIs Papel</span></div>
            </div>
          </div>
        </div>

        {/* CENTRO: SIMULADOR (AUTO-FIT) */}
        <div className={`flex-1 p-4 rounded-2xl flex flex-col relative overflow-hidden ${isLight ? 'bg-white ' : 'bg-black/30 border border-white/5 backdrop-blur-xl'}`}>
          <div className="absolute top-0 right-0 p-32 rounded-full blur-[100px] bg-[#00d06c]/10 pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-black uppercase tracking-tighter flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Clock size={20} className="text-[#00d06c]" /> A Máquina do Tempo
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Simule o poder da bola de neve em sua jornada.</p>
            </div>
            <Rocket className="text-[#00d06c]/10" size={48} />
          </div>

          {/* INPUTS - LEITURA FÁCIL */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`${isLight ? 'bg-slate-50' : 'bg-black/20'} p-3 rounded-2xl border border-white/5`}>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1.5">Investimento Inicial</label>
              <input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full bg-transparent text-lg font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLight ? 'text-slate-900' : 'text-white'}`} />
            </div>
            <div className={`${isLight ? 'bg-slate-50' : 'bg-black/20'} p-3 rounded-2xl border border-white/5`}>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1.5">Aporte Mensal</label>
              <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full bg-transparent text-lg font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLight ? 'text-slate-900' : 'text-white'}`} />
            </div>
            <div className={`${isLight ? 'bg-slate-50' : 'bg-black/20'} p-3 rounded-2xl border border-white/5`}>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1.5">Tempo (Anos)</label>
              <input type="number" value={timeYears} onChange={e => setTimeYears(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full bg-transparent text-lg font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLight ? 'text-slate-900' : 'text-white'}`} />
            </div>
          </div>

          {/* RESULTADO (BARRAS LEITURA FÁCIL) */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase"><span>Valor Investido</span><span>{formatCurrency(totalInvested)}</span></div>
              <div className={`h-4 ${isLight ? 'bg-slate-100 border border-slate-300' : 'bg-white/5 border border-white/10'} rounded-full overflow-hidden`}><div className="h-full bg-slate-500/50 transition-all duration-1000" style={{ width: `${widthInvested}%` }} /></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black text-rose-500 uppercase"><span>Na Poupança</span><span>{formatCurrency(savingsFV)}</span></div>
              <div className={`h-4 ${isLight ? 'bg-rose-50 border border-rose-200' : 'bg-white/5 border border-rose-500/10'} rounded-full overflow-hidden`}><div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${widthSavings}%` }} /></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black text-[#00d06c] uppercase"><span>Estratégia VittaCash</span><span>{formatCurrency(vittaFV)}</span></div>
              <div className={`h-4 ${isLight ? 'bg-emerald-50 border border-emerald-500/20' : 'bg-[#00d06c]/10 border border-emerald-500/20'} rounded-full overflow-hidden`}><div className="h-full bg-gradient-to-r from-emerald-500 to-[#00d06c] transition-all duration-1000" style={{ width: `${widthVitta}%` }} /></div>
            </div>
          </div>

          {/* DIFERENÇA (HIGHLIGHT PREMIUM) */}
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00d06c] text-black rounded-full shadow-[0_0_15px_rgba(0,208,108,0.4)]"><Percent size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Diferença de Patrimônio</p>
                <p className="text-[9px] text-slate-500">Poder de Liberdade Gerado</p>
              </div>
            </div>
            <p className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(vittaFV - savingsFV)}</p>
          </div>
        </div>

        {/* LADO DIREITO: CARDS */}
        <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
          <div className={`p-4 flex-1 flex flex-col rounded-2xl ${isLight ? 'bg-white ' : 'bg-black/30 border border-white/5 backdrop-blur-xl'}`}>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl w-fit mb-3"><Globe size={20} /></div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Global Alpha</h3>
            <p className="text-[10px] text-slate-500 mb-4">Proteção em Dólar</p>
            <div className="mt-auto space-y-2">
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>IVVB11</span></div>
              <div className={`flex justify-between items-center p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}><span className={`text-[9px] font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>Ações Globais</span></div>
            </div>
          </div>

          <div className={`p-4 flex-1 flex flex-col rounded-2xl ${isLight ? 'bg-white ' : 'bg-black/30 border border-white/5 backdrop-blur-xl'}`}>
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-3"><Zap size={20} /></div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Poder Real</h3>
            <p className="text-[10px] text-slate-500 mb-2 italic">Juros Compostos</p>
            <p className="text-[9px] text-slate-400 leading-relaxed">Capture o desenvolvimento das maiores empresas do mundo com ativos reais.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
