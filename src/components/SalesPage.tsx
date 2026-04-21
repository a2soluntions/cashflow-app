import React, { useState, useEffect } from 'react';
import { 
  Zap, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, ArrowRight, Newspaper, DollarSign, 
  Globe, LayoutGrid, Brain, Lock, Infinity, Clock
} from 'lucide-react';
import { supabase } from '../supabase';

interface Indicator {
  title: string;
  value: string;
  symbol: string;
}

interface News {
  id: string;
  title: string;
  description: string;
  image_url?: string;
}

export default function SalesPage({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollToPlans = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadDynamicContent() {
      try {
        const res = await fetch('/api/get-financial-data');
        if (!res.ok) throw new Error("API Offline");
        const data = await res.json();
        
        if (data.selic) {
            setIndicators([
                { title: 'SELIC', value: data.selic.value, symbol: '%' },
                { title: 'IPCA', value: data.ipca.value, symbol: '%' },
                { title: 'DÓLAR', value: data.dolar.value, symbol: 'R$' },
            ]);
        } else {
            throw new Error("Dados incompletos");
        }
      } catch (e) {
        console.error("Erro ao carregar conteúdo dinâmico", e);
        setIndicators([
            { title: 'SELIC', value: '10.75', symbol: '%' },
            { title: 'IPCA', value: '4.50', symbol: '%' },
            { title: 'DÓLAR', value: '5.45', symbol: 'R$' },
        ]);
      }

      try {
        const { data: newsData } = await supabase
            .from('site_content')
            .select('*')
            .eq('content_type', 'news')
            .eq('is_active', true)
            .limit(3);
        
        if (newsData) setNews(newsData);
      } catch (e) {
         console.error("Erro ao carregar notícias", e);
      } finally {
        setLoading(false);
      }
    }
    loadDynamicContent();
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-emerald-500/30 scroll-smooth">
      
      {/* 🚀 HERO SECTION: NARRATIVA DE IMPACTO */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Inteligência Financeira Ativa</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 italic">
            O Mercado é uma <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-indigo-500">
              Armadilha para Desavisados.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Juros abusivos, inflação oculta e falta de direção. No VittaCash, nós transformamos 
            dados em poder de decisão para que você nunca mais seja vítima do sistema.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button 
                onClick={() => onSelectPlan('start')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              Assumir o Controle
            </button>
            <button 
                onClick={scrollToPlans}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* 📊 SEÇÃO: INDICADORES EM TEMPO REAL */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)
            ) : (
                indicators.map((ind) => (
                    <div key={ind.title} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-emerald-400 transition-colors">{ind.title}</p>
                            <h3 className="text-3xl font-black text-white mt-1 italic uppercase tracking-tighter">
                                {ind.symbol} {ind.value}
                            </h3>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl">
                          {ind.title === 'DÓLAR' ? <DollarSign size={20} className="text-emerald-400"/> : <TrendingUp size={20} className="text-emerald-400"/>}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* 📰 SEÇÃO: NOTÍCIAS E CONTEXTO */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Radar Econômico</h2>
                <p className="text-slate-500 text-sm font-medium mt-2">Fique por dentro do que move seu patrimônio hoje.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest border-b border-emerald-500/20 pb-1 cursor-pointer hover:gap-4 transition-all">
                Ver todas as notícias <ArrowRight size={14} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map(item => (
                <div key={item.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col h-full">
                    {item.image_url && (
                        <div className="aspect-video overflow-hidden">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                        </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{item.title}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 flex-1">{item.description}</p>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
                             Ler Detalhes <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 💎 SEÇÃO: PLANOS E PREÇOS */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-black to-emerald-950/20">
        <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic">VittaCash <span className="text-emerald-500">Pro</span></h2>
            <p className="text-slate-400 text-sm font-medium mt-4">Escolha a ferramenta certa para o seu nível de ambição.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PLANO 1: FREE */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 flex flex-col hover:bg-white/[0.05] transition-all">
                <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Iniciante</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Gratuito</h3>
                    <p className="text-slate-500 text-xs mt-2 uppercase font-bold">7 Dias de Trial total</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                        <span>Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                        <span>Suporte básico via e-mail</span>
                    </li>
                </ul>
                <button onClick={() => onSelectPlan('free')} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Começar Agora
                </button>
            </div>

            {/* PLANO 2: BÁSICO */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 flex flex-col hover:bg-white/[0.05] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-white/5 blur-[40px] pointer-events-none rounded-full" />
                <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] mb-2">Intermediário</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Básico</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white italic">R$ 19,90</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">/mês</span>
                    </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" /> 
                        <span>Controle de Ativos e Lançamentos</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" /> 
                        <span>Sincronização em Nuvem (Supabase)</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-500">
                        <Lock size={16} className="shrink-0 mt-0.5" /> 
                        <span>Limite de 50 registros/mês</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-500">
                        <Lock size={16} className="shrink-0 mt-0.5" /> 
                        <span>Consultoria IA desabilitada</span>
                    </li>
                </ul>
                <button onClick={() => onSelectPlan('basic')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-blue-500/10 active:scale-95 transition-all">
                    Assinar Básico
                </button>
            </div>

            {/* PLANO 3: PREMIUM */}
            <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-[3rem] p-10 flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)]">
                <div className="absolute top-0 right-10 px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-b-xl">
                    🔥 Mais Potente
                </div>
                <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Acesso Total</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Premium</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white italic">R$ 149,90</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">/ano</span>
                    </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-xs text-emerald-400 font-bold">
                        <Infinity size={16} className="shrink-0 mt-0.5" /> 
                        <span>Banco de Dados Ilimitado</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-emerald-400 font-bold">
                        <Brain size={16} className="shrink-0 mt-0.5" /> 
                        <span>Consultora IA (Advisor) Total</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> 
                        <span>Relatórios Raio-X Financeiro</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> 
                        <span>Suporte Prioritário VIP</span>
                    </li>
                </ul>
                <button onClick={() => onSelectPlan('premium')} className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-black uppercase text-[10px] tracking-widest text-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                    Ativar Modo PRO
                </button>
            </div>

        </div>

        <div className="mt-16 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-amber-500" />
                </div>
                <div className="text-left">
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Garantia VittaCash</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Seu capital e seus dados protegidos por criptografia de ponta a ponta.</p>
                </div>
            </div>
            <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-bc-logo.png" alt="Pix" className="h-6 grayscale opacity-40 hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
          VittaCash © 2026 — Inteligência em Gestão de Patrimônio
        </p>
      </footer>

    </div>
  );
}
