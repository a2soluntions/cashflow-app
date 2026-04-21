import React, { useState, useEffect } from 'react';
import { 
  Zap, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, ArrowRight, Newspaper, DollarSign, 
  Globe, LayoutGrid, Brain, Lock, Infinity, Clock,
  ExternalLink
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
  meta_value?: {
    external_url?: string;
  };
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
                { title: 'IBOVESPA', value: '127.450', symbol: 'pts' },
                { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
            ]);
        }
      } catch (e) {
        console.error("Erro ao carregar indicadores", e);
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
      } catch (e) { console.error("Erro ao carregar notícias", e); }
      finally { setLoading(false); }
    }
    loadDynamicContent();
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-emerald-500/30 scroll-smooth pb-20">
      
      {/* 📈 TICKER: ESTILO BOLSA DE VALORES */}
      <div className="w-full bg-[#050505] border-b border-emerald-500/10 py-3 overflow-hidden whitespace-nowrap relative z-[100] shadow-2xl flex justify-start">
        <div className="flex animate-marquee hover:pause gap-12 items-center justify-start min-w-full">
            {/* Repetir para efeito infinito - Fallback se vazio (Repetição QUÁDRUPLA para garantir preenchimento) */}
            {(() => {
                const list = indicators.length > 0 ? indicators : [
                    { title: 'SELIC', value: '10.75', symbol: '%' },
                    { title: 'IPCA', value: '4.50', symbol: '%' },
                    { title: 'DÓLAR', value: '5.45', symbol: 'R$' }
                ];
                const repeatedList = [...list, ...list, ...list, ...list];
                return repeatedList.map((ind, i) => (
                    <div key={i} className="flex items-center gap-2 group shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors uppercase font-bold">{ind.title}</span>
                        <span className="text-xs font-black text-white italic">{ind.symbol} {ind.value}</span>
                        <TrendingUp size={10} className="text-emerald-500" />
                    </div>
                ));
            })()}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .hover\:pause:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Inteligência Financeira Ativa</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 italic">
            Domine o <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-indigo-500">
              Seu Futuro.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            Transformamos o caos do mercado financeiro em clareza absoluta. 
            Gestão profissional para investidores que não aceitam o básico.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
                onClick={() => onSelectPlan('start')}
                className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
            >
              Assumir o Controle
            </button>
            <button 
                onClick={scrollToPlans}
                className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* 📰 RADAR ECONÔMICO (NOTÍCIAS) */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
            <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Radar <span className="text-emerald-500">Vitta</span></h2>
                <p className="text-slate-500 text-sm font-medium mt-2">Insights exclusivos que movem o mercado agora.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest border-b border-emerald-500/20 pb-1 cursor-pointer hover:gap-4 transition-all">
                Marketing & Atualizações <ArrowRight size={14} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map(item => (
                <div key={item.id} className="group relative overflow-hidden rounded-[3rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col">
                    {item.image_url && (
                        <div className="aspect-[16/10] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-60" />
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col relative z-20">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 leading-tight italic">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-8 flex-1 line-clamp-4">{item.description}</p>
                        
                        {item.meta_value?.external_url ? (
                            <a 
                                href={item.meta_value.external_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors"
                            >
                                Ler Matéria Completa <ExternalLink size={12} />
                            </a>
                        ) : (
                            <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/50 cursor-default">
                                Fonte: VittaCash Direct
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 💎 PLANOS DE ASSINATURA */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
            <div className="inline-block px-4 py-1.5 bg-emerald-500/10 rounded-full mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Planos e Licenças</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Escolha seu <span className="text-emerald-500">Nível</span></h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* FREE */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[4rem] p-12 flex flex-col hover:border-white/10 transition-all">
                <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Standard</p>
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Trial</h3>
                    <p className="text-slate-500 text-xs mt-3 uppercase font-bold tracking-widest">7 Dias de Acesso Vip</p>
                </div>
                <div className="space-y-5 mb-12 flex-1">
                    {[
                        "Dashboard Completo",
                        "Controle de Lançamentos",
                        "Sync Multidispositivo",
                        "Suporte Comunitário"
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                            <CheckCircle2 size={16} className="text-emerald-500/40 shrink-0" />
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => onSelectPlan('free')} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all italic">
                    Experimentar Grátis
                </button>
            </div>

            {/* BÁSICO */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[4rem] p-12 flex flex-col hover:border-blue-500/20 transition-all relative">
                <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 italic">Essential</p>
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Básico</h3>
                    <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl font-black text-white italic tracking-tighter">R$ 19,90</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/mês</span>
                    </div>
                </div>
                <div className="space-y-5 mb-12 flex-1">
                    {[
                        "Gestão Sem Limites",
                        "Relatórios Mensais",
                        "Categorias Customizadas",
                        "Backup Mensal"
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                            <CheckCircle2 size={16} className="text-blue-500/40 shrink-0" />
                            <span>{feat}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium tracking-tight mt-6">
                        <Lock size={16} className="shrink-0" />
                        <span className="italic">IA Advisor Bloqueado</span>
                    </div>
                </div>
                <button onClick={() => onSelectPlan('basic')} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-500/20 italic active:scale-95">
                    Assinar Agora
                </button>
            </div>

            {/* PREMIUM */}
            <div className="bg-emerald-500/5 border-2 border-emerald-500 rounded-[4rem] p-12 flex flex-col relative shadow-[0_0_100px_rgba(16,185,129,0.15)]">
                <div className="absolute top-0 right-10 px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-b-2xl italic">
                    Top Performance
                </div>
                <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 italic">Unlimited</p>
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Premium</h3>
                    <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl font-black text-white italic tracking-tighter">R$ 149,90</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/ano</span>
                    </div>
                </div>
                <div className="space-y-5 mb-12 flex-1">
                    {[
                        "Controle Ilimitado",
                        "Cérebro de IA (Advisor)",
                        "Raio-X de Carteira",
                        "Análise Macro-Econômica",
                        "Suporte VIP WhatsApp"
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-emerald-50 grupo-hover:font-bold tracking-tight">
                            <Zap size={16} className="text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => onSelectPlan('premium')} className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all shadow-2xl shadow-emerald-500/20 italic active:scale-95">
                    Ativar Modo PRO
                </button>
            </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-white/5 text-center mt-20">
        <div className="flex justify-center mb-8">
            <div className="p-3 bg-white/5 rounded-2xl"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">
          VittaCash © 2026 — Inteligência Financeira de Alto Nível
        </p>
      </footer>

    </div>
  );
}
