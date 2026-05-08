import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ArrowLeft, Search, TrendingUp, 
  Clock, Share2, Bookmark, Newspaper, ArrowUpRight,
  ChevronDown, ExternalLink, Globe
} from 'lucide-react';
import { supabase } from '../supabase';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  image_url?: string;
  created_at: string;
  meta_value?: {
    external_url?: string;
    category?: string;
    author?: string;
  };
}

export default function VittaNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [scrolled, setScrolled] = useState(false);
  const [expandedFeatured, setExpandedFeatured] = useState(false);

  const categories = ['Todas', 'Mercado', 'Investimentos', 'Tecnologia', 'Negócios', 'VittaCash'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        // Carrega Notícias
        const { data: newsData } = await supabase
          .from('site_content')
          .select('*')
          .in('content_type', ['news', 'marketing', 'ad_top', 'ad_skin_left', 'ad_skin_right', 'ad_sidebar_1', 'ad_sidebar_2'])
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (newsData) setNews(newsData);

        // Carrega Indicadores (Mesmo fallback da SalesPage)
        setIndicators([
          { title: 'SELIC', value: '10.75', symbol: '%' },
          { title: 'IPCA', value: '4.50', symbol: '%' },
          { title: 'INPC', value: '3.90', symbol: '%' },
          { title: 'DÓLAR', value: '5.45', symbol: 'R$' },
          { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
        ]);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleShare = (item: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: 'Confira esta notícia no VittaCash: ' + item.title,
        url: item.meta_value?.external_url || window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(item.meta_value?.external_url || window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').filter(line => line.trim() !== '').map((paragraph, i) => (
      <p key={i} className="mb-4 last:mb-0 text-zinc-600 font-medium leading-relaxed text-base">
        {paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-zinc-950 font-black">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
  };

  const filteredNews = activeCategory === 'Todas' 
    ? news.filter(item => ['news', 'marketing'].includes(item.content_type))
    : news.filter(item => ['news', 'marketing'].includes(item.content_type) && item.meta_value?.category === activeCategory);

  const getAd = (type: string) => news.find(item => item.content_type === type);

  const featured = filteredNews[0];
  const secondary = filteredNews.slice(1, 4);
  const others = filteredNews.slice(4);

  const formattedDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100">
      
      {/* 📈 TICKER: ESTILO BOLSA DE VALORES (Mesmo da SalesPage) */}
      <div className="fixed top-0 left-0 w-full bg-[#1a237e] border-b border-white/5 py-3 overflow-hidden whitespace-nowrap z-[1000] flex justify-start">
        <div className="flex animate-marquee hover:pause gap-12 items-center justify-start min-w-full">
          {/* Data formatada InfoMoney no início do Ticker */}
          <div className="flex items-center gap-2 px-6 border-r border-white/10 mr-4">
            <Clock size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70 italic">{formattedDate}</span>
          </div>

          {[...indicators, ...indicators, ...indicators].map((ind, i) => (
            <div key={i} className="flex items-center gap-2 group shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-400 transition-colors">{ind.title}</span>
              <span className="text-xs font-black text-white italic">{ind.symbol} {ind.value}</span>
              <TrendingUp size={10} className="text-emerald-500" />
            </div>
          ))}
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

      {/* 🏛️ TOP NAVIGATION (Mesmo formato da SalesPage) */}
      <nav className={`fixed ${scrolled ? 'top-0' : 'top-[41px]'} left-0 w-full z-[999] bg-white border-b border-zinc-100 py-5 transition-all duration-500 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
              <img src="/logo.png" alt="VittaCash" className="h-10 w-10 object-contain rounded-full mix-blend-multiply" />
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900">Vitta<span className="text-indigo-600">Cash</span></span>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-400">Notícias &amp; Inteligência</span>
              </div>
            </button>
            
            <div className="hidden lg:flex items-center gap-8">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all relative py-2 ${activeCategory === cat ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  {cat}
                  {activeCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Search size={20} /></button>
            <button onClick={() => navigate('/login')} className="px-8 py-3 bg-indigo-600 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10">
              Assinar Pro
            </button>
          </div>
        </div>
      </nav>

      {/* Ajuste de Padding para o Header Fixo */}
      <div className="pt-32 md:pt-40" />

      {/* SKIN ADS (LATERAIS EXTREMAS - ESQUERDA E DIREITA) */}
      <div className="hidden 2xl:flex fixed top-48 left-0 w-[calc(50vw-40rem)] h-[600px] z-[10] justify-end pr-4 pointer-events-none">
        {getAd('ad_skin_left') && (
          <div 
            onClick={() => window.open(getAd('ad_skin_left')?.meta_value?.external_url || '#', '_blank')}
            className="w-[160px] xl:w-[200px] h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative pointer-events-auto cursor-pointer group overflow-hidden shadow-sm"
          >
            <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
            <img src={getAd('ad_skin_left')?.image_url} alt="Ad Left" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
      </div>

      <div className="hidden 2xl:flex fixed top-48 right-0 w-[calc(50vw-40rem)] h-[600px] z-[10] justify-start pl-4 pointer-events-none">
        {getAd('ad_skin_right') && (
          <div 
            onClick={() => window.open(getAd('ad_skin_right')?.meta_value?.external_url || '#', '_blank')}
            className="w-[160px] xl:w-[200px] h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative pointer-events-auto cursor-pointer group overflow-hidden shadow-sm"
          >
            <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
            <img src={getAd('ad_skin_right')?.image_url} alt="Ad Right" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
      </div>

      {/* TOP AD BANNER */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center">
        <div 
          onClick={() => window.open(getAd('ad_top')?.meta_value?.external_url || '#', '_blank')}
          className="w-full max-w-[970px] h-[90px] md:h-[250px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden cursor-pointer"
        >
          <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
          {getAd('ad_top') ? (
            <img src={getAd('ad_top')?.image_url} alt="Advertisement" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white/90 backdrop-blur-sm px-6 py-2 text-xs font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm">Seu Anúncio Aqui</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* DESTAQUE PRINCIPAL - ESTILO INFOMONEY */}
            {featured && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-zinc-100 pb-16">
                <div className="lg:col-span-6 group cursor-pointer" onClick={() => featured.meta_value?.external_url && window.open(featured.meta_value.external_url, '_blank')}>
                  <div className="aspect-video w-full overflow-hidden rounded-2xl relative bg-white">
                    {featured.image_url
                      ? <img src={featured.image_url} alt={featured.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700" referrerPolicy="no-referrer" />
                      : <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-zinc-100 flex items-center justify-center"><span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">Sem imagem</span></div>
                    }
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">{featured.meta_value?.category || 'Destaque'}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Clock size={12} /> {new Date(featured.created_at).toLocaleDateString()} • 5 min de leitura
                  </div>
                  <h1 
                    className="text-3xl md:text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-[1.05] mb-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => featured.meta_value?.external_url && window.open(featured.meta_value.external_url, '_blank')}
                  >
                    {featured.title}
                  </h1>
                  
                  <div className={`mb-8 relative transition-all duration-500 overflow-hidden ${expandedFeatured ? '' : 'max-h-[140px]'}`}>
                    {renderFormattedText(featured.description)}
                    {!expandedFeatured && (
                      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        if (featured.meta_value?.external_url && featured.meta_value.external_url.trim() !== '') {
                          window.open(featured.meta_value.external_url, '_blank');
                        } else {
                          setExpandedFeatured(!expandedFeatured);
                        }
                      }}
                      className="flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all rounded-sm shadow-md"
                    >
                      {featured.meta_value?.external_url ? 'Acessar Fonte' : expandedFeatured ? 'Recolher Matéria' : 'Ler Matéria Completa'}
                    </button>
                    <button 
                      onClick={() => handleShare(featured)}
                      className="p-3.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-indigo-600 transition-all rounded-sm shadow-sm"
                      title="Compartilhar"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GRID SECUNDÁRIO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {secondary.map(item => (
                <div key={item.id} className="group cursor-pointer flex flex-col" onClick={() => item.meta_value?.external_url && window.open(item.meta_value.external_url, '_blank')}>
                  <div className="aspect-video w-full overflow-hidden rounded-xl mb-4 relative bg-white">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" referrerPolicy="no-referrer" />
                      : <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-zinc-100 flex items-center justify-center"><span className="text-zinc-300 text-[10px] font-bold uppercase">Sem imagem</span></div>
                    }
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-zinc-900 text-[8px] font-black uppercase tracking-widest rounded">{item.meta_value?.category || 'Mercado'}</span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>

            {/* SEÇÃO LISTA E SIDEBAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-16 border-t border-zinc-100">
              
              {/* FEED DE NOTÍCIAS */}
              <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Últimas <span className="text-indigo-600">Notícias</span></h2>
                  <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-2 transition-all">Ver Histórico <ChevronRight size={14} /></button>
                </div>

                <div className="space-y-12">
                  {others.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 group cursor-pointer border-b border-zinc-100 pb-10" onClick={() => item.meta_value?.external_url && window.open(item.meta_value.external_url, '_blank')}>
                      <div className="md:col-span-1 aspect-video overflow-hidden rounded-xl bg-white flex items-center justify-center">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" referrerPolicy="no-referrer" />
                          : <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-zinc-100 flex items-center justify-center"><span className="text-zinc-300 text-[9px] font-bold uppercase">Sem img</span></div>
                        }
                      </div>
                      <div className="md:col-span-3 flex flex-col justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">{item.meta_value?.category || 'Negócios'}</span>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <p className="text-zinc-500 text-sm font-medium line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-4 mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                          <span>Por {item.meta_value?.author || 'Vitta Team'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIDEBAR: MAIS LIDAS E INDICADORES */}
              <aside className="lg:col-span-4 space-y-12 relative">
                
                {/* SIDEBAR AD BANNER 1 (SQUARE) */}
                <div 
                  onClick={() => window.open(getAd('ad_sidebar_1')?.meta_value?.external_url || '#', '_blank')}
                  className="w-full aspect-square bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden cursor-pointer"
                >
                  <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
                  {getAd('ad_sidebar_1') ? (
                    <img src={getAd('ad_sidebar_1')?.image_url} alt="Advertisement" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm">Espaço Publicitário</span>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 flex items-center gap-2"><TrendingUp size={14} /> Mais Lidas Agora</h4>
                  <div className="space-y-8">
                    {filteredNews.slice(0, 5).map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="flex gap-4 group cursor-pointer"
                        onClick={() => item.meta_value?.external_url && window.open(item.meta_value.external_url, '_blank')}
                      >
                        <span className="text-4xl font-black italic text-zinc-200 group-hover:text-indigo-600 transition-colors leading-none">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-bold uppercase tracking-tight text-zinc-700 group-hover:text-zinc-950 transition-colors leading-tight">
                          {item.title}
                        </p>
                      </div>
                    ))}
                    {filteredNews.length === 0 && (
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Nenhuma notícia disponível</p>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><Newspaper size={120} /></div>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4 relative z-10 leading-none">Acesso Pro</h4>
                  <p className="text-xs text-white/70 font-medium mb-8 relative z-10">Receba análises exclusivas direto no seu WhatsApp e e-mail antes de todo mundo.</p>
                  <button onClick={() => navigate('/login')} className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all relative z-10">Quero ser Vitta Pro</button>
                </div>

                {/* SIDEBAR AD BANNER 2 (SKYSCRAPER - STICKY) */}
                <div 
                  onClick={() => window.open(getAd('ad_sidebar_2')?.meta_value?.external_url || '#', '_blank')}
                  className="w-full h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden sticky top-32 cursor-pointer hidden md:flex"
                >
                  <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
                  {getAd('ad_sidebar_2') ? (
                    <img src={getAd('ad_sidebar_2')?.image_url} alt="Advertisement" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm">Anúncio Vertical</span>
                    </div>
                  )}
                </div>

              </aside>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER NOTÍCIAS */}
      <footer className="bg-zinc-950 text-white py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-3xl font-black italic tracking-tighter uppercase">Vitta <span className="text-indigo-500">Notícias</span></span>
            </div>
            <p className="text-zinc-500 text-xs font-medium max-w-sm mb-12 leading-relaxed">
              O portal de notícias oficial da VittaCash. Nossa missão é democratizar a inteligência financeira através de dados precisos e insights estratégicos para o seu crescimento.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Globe size={18} /></button>
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Categorias</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Mercado Financeiro</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Empreendedorismo</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Criptomoedas</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Tecnologia</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Institucional</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><Link to="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacidade</Link></li>
              <li><Link to="/legal/terms" className="hover:text-indigo-400 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">VittaCash App</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">© 2026 A2SOLUNTIONS SOLUÇÕES DIGITAIS. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
            <span>Powered by</span>
            <span className="text-zinc-500">A2soluntions</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

