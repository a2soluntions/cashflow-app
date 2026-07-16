import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, ArrowRight, Newspaper, DollarSign, 
  Globe, LayoutGrid, Brain, Lock, Infinity, Clock,
  ExternalLink, Cookie, Mail, Instagram, Youtube, Linkedin, MessageCircle,
  X, ChevronLeft, ChevronRight, Search, Menu
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
  const [leftBanners, setLeftBanners] = useState<News[]>([]);
  const [rightBanners, setRightBanners] = useState<News[]>([]);
  const [currentLeftIdx, setCurrentLeftIdx] = useState(0);
  const [currentRightIdx, setCurrentRightIdx] = useState(0);
  
  const [corporateData, setCorporateData] = useState({
    name: 'A2SOLUNTIONS SOLUÇÕES DIGITAIS',
    cnpj: '00.000.000/0000-00',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
  });
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [modalSide, setModalSide] = useState<'left' | 'right'>('left');
  const [modalIdx, setModalIdx] = useState<number>(0);

  const openModal = (side: 'left' | 'right', idx: number) => {
    setModalSide(side);
    setModalIdx(idx);
    const img = side === 'left' ? leftBanners[idx]?.image_url : rightBanners[idx]?.image_url;
    setModalImg(img || null);
  };

  useEffect(() => {
    const consent = localStorage.getItem('a2_cookie_consent');
    if (!consent) {
      setTimeout(() => setShowCookieConsent(true), 2000);
    }
  }, []);

  const scrollToPlans = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const SUPA_URL = 'https://fhjdymzjikjnyafadhim.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamR5bXpqaWtqbnlhZmFkaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mjc2NjUsImV4cCI6MjA5MjIwMzY2NX0.7qQAYfwddqaDO7ywZUeSELs1UDzPFa3F1hwlVNOvNrs';

    async function fetchFromSupabase(query: string) {
      const url = `${SUPA_URL}/rest/v1/site_content?${query}`;
      console.log('[SalesPage] Fetching:', url);
      const res = await fetch(url, {
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        console.error('[SalesPage] Supabase error:', res.status, res.statusText);
        return [];
      }
      return await res.json();
    }

    async function loadDynamicContent() {
      // 1. Indicadores (Valores estáveis)
      setIndicators([
        { title: 'SELIC', value: '10.75', symbol: '%' },
        { title: 'IPCA', value: '4.50', symbol: '%' },
        { title: 'DÓLAR', value: '5.45', symbol: 'R$' },
        { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
      ]);

      // 2. Banners — busca direta do Supabase (sem depender de serverless /api/banners)
      try {
        const bannerData = await fetchFromSupabase(
          'content_type=in.(ad_skin_left_home,ad_skin_right_home,ad_skin_left,ad_skin_right)&is_active=eq.true&select=id,content_type,image_url,title,meta_value&order=created_at.desc'
        );
        console.log('[SalesPage] Banners recebidos:', bannerData?.length, bannerData);

        if (bannerData && Array.isArray(bannerData) && bannerData.length > 0) {
          const left = bannerData.filter((b: any) => b.content_type === 'ad_skin_left_home' || b.content_type === 'ad_skin_left');
          const right = bannerData.filter((b: any) => b.content_type === 'ad_skin_right_home' || b.content_type === 'ad_skin_right');
          console.log('[SalesPage] Left banners:', left.length, '| Right banners:', right.length);
          if (left.length > 0) setLeftBanners(left);
          if (right.length > 0) setRightBanners(right);
        }
      } catch (e) {
        console.warn('[SalesPage] Falha ao carregar banners:', e);
      }

      // 3. Notícias recentes
      try {
        const newsData = await fetchFromSupabase(
          'content_type=in.(news,marketing)&is_active=eq.true&order=created_at.desc&limit=4&select=id,title,description,image_url,meta_value'
        );
        console.log('[SalesPage] News recebidas:', newsData?.length);
        if (newsData && Array.isArray(newsData) && newsData.length > 0) {
          setNews(newsData);
        }
      } catch (e) {
        console.warn('[SalesPage] Falha ao carregar notícias:', e);
      }

      // 4. Dados Corporativos (Silencioso)
      try {
        const corpData = await fetchFromSupabase('content_type=eq.corporate_data&limit=1');
        const cData = corpData?.[0];
        if (cData) {
          setCorporateData({
            name: cData.title,
            cnpj: cData.meta_value?.cnpj || '00.000.000/0000-00',
            address: cData.description
          });
        }
      } catch (_) {}

      setLoading(false);
    }
    loadDynamicContent();

    // Realtime para atualizar conteúdo automaticamente
    const channel = supabase
      .channel('site-content-changes')
      .on('postgres_changes', { event: '*', table: 'site_content', schema: 'public' }, () => {
        loadDynamicContent();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime subscription failed, using polling fallback');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (leftBanners.length > 0) setCurrentLeftIdx(prev => (prev + 1) % leftBanners.length);
      if (rightBanners.length > 0) setCurrentRightIdx(prev => (prev + 1) % rightBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [leftBanners.length, rightBanners.length]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 scroll-smooth pb-20 overflow-x-hidden">
      
      <div className="fixed top-0 left-0 w-full bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-3 overflow-hidden whitespace-nowrap z-[1000] flex justify-start">
        <div className="flex animate-marquee hover:pause gap-12 items-center justify-start min-w-full">
          <div className="flex items-center gap-2 px-6 border-r border-white/10 mr-4 shrink-0">
            <Clock size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70 italic">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

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
      .hover\\:pause:hover {
      animation-play-state: paused;
      }
      `}} />

      <nav className="fixed top-[41px] left-0 w-full z-[999] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black italic tracking-tighter uppercase text-white">A2<span className="text-emerald-500"> Mentor</span></span>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500">Financial Intelligence</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/noticias" className="group flex items-center gap-2">
                <Newspaper size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">A2 Notícias</span>
              </Link>
              <button onClick={scrollToPlans} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Nossos Planos</button>
              <a href="#radar" className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Radar Econômico</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                Acessar App
              </Link>
              <button onClick={() => onSelectPlan('start')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
                Começar Agora
              </button>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-white/5 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-6">
              <Link to="/noticias" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white">
                <Newspaper size={18} className="text-emerald-500" /> A2 Notícias
              </Link>
              <button onClick={() => { scrollToPlans(); setIsMenuOpen(false); }} className="text-left text-sm font-black uppercase tracking-widest text-white">Nossos Planos</button>
              <a href="#radar" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-white">Radar Econômico</a>
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <Link to="/login" className="w-full py-4 text-center bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">Acessar App</Link>
                <button onClick={() => { onSelectPlan('start'); setIsMenuOpen(false); }} className="w-full py-4 text-center bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">Começar Agora</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="pt-[140px] md:pt-40" />

      <section className="relative pt-16 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-3">
          {/* Mobile: Text first, then banners. Desktop: Left Banner -> Text -> Right Banner */}
          <div className="flex-1 text-center lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">Inteligência Financeira Ativa</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-8 italic">
              Domine o <br />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-indigo-500 py-2">
                Seu Futuro.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              Transformamos o caos financeiro em clareza absoluta. 
              Organização simples para quem quer sair das dívidas e focar no que importa.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => onSelectPlan('start')} className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all active:scale-95">Assuma o Controle</button>
              <button onClick={scrollToPlans} className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-all active:scale-95">Ver Planos</button>
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-2xl lg:order-1 flex justify-center">
            {leftBanners.length > 0 ? (
              <div className="w-full max-w-lg lg:max-w-2xl overflow-hidden rounded-xl cursor-pointer" onClick={() => openModal('left', currentLeftIdx)}>
                <img
                  src={leftBanners[currentLeftIdx]?.image_url}
                  alt="A2 Mentor Web"
                  className="w-full h-auto object-contain hover:scale-[1.03] transition-transform duration-700 rounded-xl shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-full max-w-lg lg:max-w-2xl overflow-hidden rounded-xl">
                <img
                  src="/vitta_sponsor_banner_1_1776825587725.png"
                  alt="A2 Mentor Web"
                  className="w-full h-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full lg:max-w-xs lg:order-3 flex justify-center">
            {rightBanners.length > 0 ? (
              <div className="w-full max-w-xs overflow-hidden rounded-xl cursor-pointer" onClick={() => openModal('right', currentRightIdx)}>
                <img
                  src={rightBanners[currentRightIdx]?.image_url}
                  alt="A2 Mentor Mobile"
                  className="w-full h-auto object-contain hover:scale-[1.03] transition-transform duration-700 rounded-xl shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-full max-w-xs overflow-hidden rounded-xl">
                <img
                  src="/vitta_sponsor_banner_2_1776825608562.png"
                  alt="A2 Mentor Mobile"
                  className="w-full h-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="radar" className="py-12 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Radar <span className="text-emerald-500">A2</span></h2>
            <p className="text-slate-500 text-sm font-medium mt-2">Insights exclusivos que movem o mercado agora.</p>
          </div>
          <Link to="/noticias" className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all group flex items-center gap-2">
            Acessar A2 Notícias <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.slice(0, 4).map(item => (
            <div key={item.id} className="group relative overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col">
              {item.image_url && (
                <div className="aspect-[16/10] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 to-transparent z-10 opacity-60" />
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col relative z-20">
                <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 leading-tight italic">{item.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-8 flex-1 line-clamp-4">{item.description}</p>
                
                {item.meta_value?.external_url ? (
                  <a href={item.meta_value.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors">Ler Matéria Completa <ExternalLink size={12} /></a>
                ) : (
                  <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/50 cursor-default">Fonte: A2 Mentor Direct</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 mb-4 border border-emerald-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Planos e Licenças</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Escolha seu <span className="text-emerald-500">Nível</span></h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/5 p-12 flex flex-col hover:border-white/10 transition-all">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Standard</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Trial</h3>
              <p className="text-slate-500 text-xs mt-3 uppercase font-bold tracking-widest">7 Dias de Acesso Vip</p>
            </div>
            <div className="space-y-5 mb-12 flex-1">
              {["Dashboard Completo", "Controle de Lançamentos", "Sync Multidispositivo", "Suporte Comunitário"].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                  <CheckCircle2 size={16} className="text-emerald-500/40 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelectPlan('free')} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all italic">Experimentar Grátis</button>
          </div>

          <div className="bg-white/5 border border-white/5 p-12 flex flex-col hover:border-blue-500/20 transition-all relative">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 italic">Essential</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Básico</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-3xl font-black text-white italic tracking-tighter">R$ 19,90</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/mês</span>
              </div>
            </div>
            <div className="space-y-5 mb-12 flex-1">
              {["Até 300 Lançamentos/mês", "Relatórios Mensais", "Categorias Customizadas", "Gestão de Investimentos"].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                  <CheckCircle2 size={16} className="text-blue-500/40 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelectPlan('basic')} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all italic active:scale-95">Assinar Agora</button>
          </div>

          <div className="bg-emerald-500/5 border-2 border-emerald-500 p-12 flex flex-col relative">
            <div className="absolute top-0 right-10 px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest italic">Top Performance</div>
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 italic">Unlimited</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Premium</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-3xl font-black text-white italic tracking-tighter">R$ 59,90</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/mês</span>
              </div>
            </div>
            <div className="space-y-5 mb-12 flex-1">
              {["Lançamentos Ilimitados", "Cérebro de IA (Advisor)", "Raio-X de Carteira", "Módulo Quita-Dívidas", "Suporte VIP WhatsApp"].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-emerald-50 tracking-tight">
                  <Zap size={16} className="text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelectPlan('premium')} className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-widest transition-all italic active:scale-95">Ativar Modo PRO</button>
          </div>

          <div className="bg-white/5 border border-white/5 p-12 flex flex-col hover:border-amber-500/30 transition-all relative">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 italic">Offline Edition</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Desktop</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-2xl font-black text-white italic tracking-tighter">R$ 497,00</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/Único</span>
              </div>
            </div>
            <div className="space-y-4 mb-12 flex-1">
              {["Licença Vitalícia", "Sem Mensalidades", "Uso Offline", "Banco de Dados Local", "Foco em Privacidade"].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                  <CheckCircle2 size={16} className="text-amber-500/40 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelectPlan('desktop')} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all italic">Comprar Licença</button>
          </div>
        </div>
      </section>

      <footer className="py-24 px-6 border-t border-white/5 bg-slate-950 relative overflow-hidden mt-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="A2 Mentor" className="h-12 w-12 object-cover rounded-full mix-blend-screen" />
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">A2 Mentor</h2>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Nossa Missão</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm">Transformar o caos financeiro em clareza absoluta.</p>
            </div>
            <div className="space-y-2 pt-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/40">Dados Corporativos</p>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-300">{corporateData.name}</p>
                <p className="text-[10px] font-bold text-slate-500">CNPJ: {corporateData.cnpj}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Fale Conosco</h3>
              <ul className="space-y-5">
                <li><a href="mailto:suporte@a2mentor.com" className="text-[11px] text-emerald-400 font-bold hover:text-white transition-all flex items-center gap-2 group"><Mail size={12} /> suporte@a2mentor.com</a></li>
                <li><a href="https://wa.me/5534998408962" target="_blank" rel="noreferrer" className="text-[11px] text-emerald-400 font-bold hover:text-white transition-all flex items-center gap-2 group"><MessageCircle size={12} /> (34) 99840-8962</a></li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Legal</h3>
              <ul className="space-y-6">
                <li><Link to="/legal/privacy" className="text-xs font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-tighter italic">Privacidade</Link></li>
                <li><Link to="/legal/terms" className="text-xs font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-tighter italic">Termos</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75 rounded-full"></span><span className="relative inline-flex h-1.5 w-1.5 bg-emerald-500 rounded-full"></span></span><span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">System Online</span></div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-1.5 italic">A2soluntions © 2026</p>
          </div>
        </div>
      </footer>

      {modalImg && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setModalImg(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalImg(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={modalImg} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
}
