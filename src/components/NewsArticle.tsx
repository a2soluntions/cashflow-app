import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Calendar, Clock, User, MessageSquare, 
  ExternalLink, Globe, ChevronRight, MessageCircle, Mail, Cookie, Newspaper
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
    slides?: any[];
    client_name?: string;
    client_phone?: string;
  };
  is_active: boolean;
}

export default function NewsArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [item, setItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    // Verifica se já aceitou os cookies
    const consent = localStorage.getItem('a2_cookie_consent');
    if (!consent) {
      setTimeout(() => setShowCookieConsent(true), 2000);
    }
  }, []);
  const [inlineAds, setInlineAds] = useState<NewsItem[]>([]);
  const [carouselAds, setCarouselAds] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('suporte@a2mentor.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
    window.location.href = 'mailto:suporte@a2mentor.com';
  };

  const openLink = (url?: string) => {
    if (!url || url === '#' || url.trim() === '') return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };


  const SideAdCarousel = ({ type, position }: { type: string, position: 'left' | 'right' }) => {
    // Busca anúncios do tipo exato (ad_skin_left ou ad_skin_right)
    let slotAds = carouselAds.filter(item => item.content_type === type && item.is_active);
    
    // Se encontrarmos um registro único de carrossel de slides no meta_value
    const mainAd = slotAds[0];
    let adSlides = mainAd?.meta_value?.slides || [];
    if (adSlides.length === 0 && mainAd?.image_url) {
      adSlides = [{
        id: mainAd.id,
        image_url: mainAd.image_url,
        external_url: mainAd.meta_value?.external_url || '#',
        client_name: mainAd.meta_value?.client_name || mainAd.title,
        client_phone: mainAd.meta_value?.client_phone || ''
      }];
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    const totalSlides = adSlides.length > 0 ? adSlides.length : slotAds.length;

    useEffect(() => {
      if (totalSlides <= 1) return;
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % totalSlides);
      }, 5000);
      return () => clearInterval(interval);
    }, [totalSlides]);

    if (totalSlides === 0) return null;

    // Se usa a estrutura nova de slides array
    if (adSlides.length > 0) {
      const currentSlide = adSlides[currentIndex];
      return (
        <div 
          onClick={() => openLink(currentSlide.external_url)}
          className="w-[160px] xl:w-[300px] h-[600px] flex flex-col items-center justify-center relative pointer-events-auto cursor-pointer group overflow-hidden"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}
        >
          <span className={`absolute top-2 ${position === 'left' ? 'right-2' : 'left-2'} text-[7px] font-black uppercase tracking-widest text-zinc-500 z-10 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded backdrop-blur-sm`}>
            Publicidade {adSlides.length > 1 && `(${currentIndex + 1}/${adSlides.length})`}
          </span>
          <div className="w-full h-full relative" style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}>
            <img 
              src={currentSlide.image_url} 
              alt={currentSlide.client_name || "Ad Slide"} 
              className="absolute inset-0 w-full h-full object-contain opacity-95 group-hover:opacity-100 transition-all duration-300"
              referrerPolicy="no-referrer"
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}
            />
          </div>
        </div>
      );
    }

    const currentAd = slotAds[currentIndex];

    return (
      <div 
        onClick={() => openLink(currentAd.meta_value?.external_url)}
        className="w-[160px] xl:w-[300px] h-[600px] flex flex-col items-center justify-center relative pointer-events-auto cursor-pointer group overflow-hidden"
        style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}
      >
        <span className={`absolute top-2 ${position === 'left' ? 'right-2' : 'left-2'} text-[7px] font-black uppercase tracking-widest text-zinc-500 z-10 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded backdrop-blur-sm`}>
          Publicidade {slotAds.length > 1 && `(${currentIndex + 1}/${slotAds.length})`}
        </span>
        <div className="w-full h-full relative" style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}>
          {slotAds.map((ad, idx) => (
            <img 
              key={ad.id}
              src={ad.image_url} 
              alt={`Ad ${idx}`} 
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ${idx === currentIndex ? 'opacity-95 scale-100' : 'opacity-0 scale-95'}`}
              referrerPolicy="no-referrer"
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0px' }}
            />
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        // Notícia
        const { data: newsData, error: newsError } = await supabase
          .from('site_content')
          .select('*')
          .eq('id', id)
          .single();
        
        if (newsError) throw newsError;
        if (newsData) setItem(newsData);

        // Anúncios (Inline + Skins)
        const { data: adsData } = await supabase
          .from('site_content')
          .select('*')
          .in('content_type', ['ad_internal_inline_1', 'ad_internal_inline_2', 'ad_internal_inline_3', 'ad_skin_left', 'ad_skin_right'])
          .eq('is_active', true);
        
        if (adsData) {
          // Filtra anúncios por finalidade
          const inline = adsData
            .filter(ad => ad.content_type.startsWith('ad_internal_inline'))
            .sort((a, b) => a.content_type.localeCompare(b.content_type));
          
          const carousel = adsData.filter(ad => !ad.content_type.startsWith('ad_internal_inline'));
          
          setInlineAds(inline);
          setCarouselAds(carousel);
        }
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [id]);



  const renderContent = (text: string, mainImageUrl?: string) => {
    const paragraphs = text.split('\n').filter(line => line.trim() !== '');
    const elements: React.ReactNode[] = [];

    paragraphs.forEach((paragraph, index) => {
      // Inserir imagem principal da notícia no primeiro parágrafo
      if (index === 0 && mainImageUrl) {
        elements.push(
          <div key="main-img" className="float-right w-full sm:w-80 ml-6 mb-4 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50">
            <img src={mainImageUrl} alt="Capa" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        );
      }

      // Inserir anúncio a cada 3 parágrafos, se houver anúncios disponíveis
      const adIndex = Math.floor(index / 3) - 1; 
      const currentAd = inlineAds[adIndex];

      if (index > 0 && index % 3 === 0 && currentAd) {
        elements.push(
          <div 
            key={`ad-${index}`}
            onClick={() => openLink(currentAd.meta_value?.external_url)}
            className="float-none sm:float-left w-full sm:w-72 sm:mr-6 mb-8 sm:mb-4 mt-4 sm:mt-2 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all"
          >
            <div className="aspect-video sm:aspect-square overflow-hidden bg-zinc-50">
              <img src={currentAd.image_url} alt={currentAd.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 border-t border-zinc-100/50">
              <p className="text-[7px] text-zinc-400 font-black uppercase tracking-[0.2em] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                Saiba mais <ExternalLink size={6} />
              </p>
            </div>
          </div>
        );
      }

      elements.push(
        <p key={`p-${index}`} className="mb-6 last:mb-0 text-zinc-700 font-medium leading-relaxed text-lg text-justify">
          {paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-zinc-950 font-black">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });

    return elements;
  };

  const handleShare = () => {
    if (!item) return;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: 'Confira esta notícia no A2 Notícias: ' + item.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Newspaper size={64} className="text-zinc-200 mb-6" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-400">Notícia não encontrada</h2>
        <button onClick={() => navigate('/noticias')} className="mt-8 px-8 py-3 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-sm shadow-lg">Voltar para o Portal</button>
      </div>
    );
  }

  const formattedDate = new Date(item.created_at).toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100 pb-20">
      
      {/* SKIN ADS CAROUSEL (LATERAIS EXTREMAS) */}
      <div className="hidden 2xl:flex fixed top-48 left-0 w-[calc(50vw-45rem)] h-[600px] z-[10] justify-end pr-4 pointer-events-none">
        <SideAdCarousel type="ad_skin_left" position="left" />
      </div>

      <div className="hidden 2xl:flex fixed top-48 right-0 w-[calc(50vw-45rem)] h-[600px] z-[10] justify-start pl-4 pointer-events-none">
        <SideAdCarousel type="ad_skin_right" position="right" />
      </div>

      {/* 🏛️ TOP NAVIGATION COMPACTA */}
      <nav className="fixed top-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur-md border-b border-zinc-100 py-3 md:py-4 transition-all">
        <div className="max-w-4xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/noticias')} 
            className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          
          <div className="flex flex-col leading-none items-center">
            <span className="text-base md:text-lg font-black italic tracking-tighter uppercase text-zinc-900">A2<span className="text-indigo-600">Notícias</span></span>
            <span className="text-[6px] font-bold uppercase tracking-[0.4em] text-zinc-400">Inteligência Financeira</span>
          </div>

          <button onClick={handleShare} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <div className="pt-24" />

      <article className="max-w-3xl mx-auto px-6">
        {/* Header da Notícia */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg rounded-sm">
              {item.meta_value?.category || 'Mercado'}
            </span>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              <Calendar size={12} /> {formattedDate}
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              <Clock size={12} /> 5 min de leitura
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter italic leading-[1.05] mb-8">
            {item.title}
          </h1>

          <div className="flex items-center gap-4 border-y border-zinc-100 py-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Por {item.meta_value?.author || 'A2 Team'}</span>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Redação A2 Notícias</span>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-zinc max-w-none">
          {renderContent(item.description, item.image_url)}
        </div>

        {/* Rodapé do Artigo */}
        <footer className="mt-16 pt-10 border-t border-zinc-100">
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-black uppercase italic tracking-tighter text-zinc-900 mb-2">Gostou deste conteúdo?</h4>
              <p className="text-sm text-zinc-500 font-medium">Compartilhe com sua rede de contatos e ajude a democratizar a inteligência financeira.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all rounded-sm shadow-md">
                <Share2 size={16} /> Compartilhar
              </button>
              {item.meta_value?.external_url && (
                <a href={item.meta_value.external_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all rounded-sm">
                  <Globe size={16} /> Fonte Original
                </a>
              )}
            </div>
          </div>
        </footer>
      </article>
      
      {/* FOOTER GLOBAL PORTAL */}
      <footer className="bg-zinc-950 text-white py-16 px-6 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-3xl font-black italic tracking-tighter uppercase">A2 <span className="text-indigo-500">Notícias</span></span>
            </div>
            <p className="text-zinc-500 text-xs font-medium max-w-sm mb-12 leading-relaxed">
              O portal de notícias oficial da A2 Mentor. Nossa missão é democratizar a inteligência financeira através de dados precisos e insights estratégicos para o seu crescimento.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Globe size={18} /></button>
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Categorias</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><Link to="/noticias?category=Mercado Financeiro" className="hover:text-indigo-400 transition-colors uppercase">Mercado Financeiro</Link></li>
              <li><Link to="/noticias?category=Empreendedorismo" className="hover:text-indigo-400 transition-colors uppercase">Empreendedorismo</Link></li>
              <li><Link to="/noticias?category=Criptomoedas" className="hover:text-indigo-400 transition-colors uppercase">Criptomoedas</Link></li>
              <li><Link to="/noticias?category=Tecnologia" className="hover:text-indigo-400 transition-colors uppercase">Tecnologia</Link></li>
              <li><Link to="/noticias?category=VittaConsultoria" className="hover:text-indigo-400 transition-colors uppercase">VittaConsultoria</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Institucional</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><Link to="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacidade</Link></li>
              <li><Link to="/legal/terms" className="hover:text-indigo-400 transition-colors">Termos de Uso</Link></li>
              <li><a href="/#pricing" className="hover:text-indigo-400 transition-colors">VittaConsultoria App</a></li>
              <li><a href="https://web.whatsapp.com/send?phone=5534998408962&text=Olá! Tenho interesse em anunciar nos espaços publicitários do portal." target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-bold">📢 Anuncie Conosco</a></li>
              <li>
                <div className="flex flex-col gap-2 pt-2">
                  <a href="https://web.whatsapp.com/send?phone=5534998408962&text=Olá! Gostaria de falar com o suporte do Vitta Notícias." target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold">
                    <MessageCircle size={14} /> (34) 99840-8962
                  </a>
                  <div className="relative">
                    <button 
                      onClick={handleEmailClick}
                      className="text-zinc-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium lowercase text-left"
                    >
                      <Mail size={14} /> suporte@a2mentor.com
                    </button>
                    {emailCopied && (
                      <span className="absolute -top-8 left-0 bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-1 rounded animate-bounce">
                        Copiado!
                      </span>
                    )}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">© 2026 A2SOLUNTIONS SOLUÇÕES DIGITAIS. Todos os direitos reservados.</p>
        </div>

        {/* COOKIE CONSENT BANNER */}
        {showCookieConsent && (
          <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[2000] animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Cookie size={24} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1 leading-none text-left">Aviso de Cookies</h4>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed text-left">
                  Utilizamos cookies para melhorar sua experiência. Ao aceitar, você concorda com nossa <Link to="/legal/privacy" className="text-indigo-500 underline">Política de Privacidade</Link>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.setItem('a2_cookie_consent', 'denied');
                  setShowCookieConsent(false);
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Não Aceitar
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('a2_cookie_consent', 'accepted');
                  setShowCookieConsent(false);
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
              >
                Aceitar Cookies
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
