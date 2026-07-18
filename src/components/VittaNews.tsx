import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, Clock, ChevronRight, TrendingUp, TrendingDown, 
  ExternalLink, Share2, PlayCircle, Newspaper, Calculator, DollarSign,
  ArrowUpRight, ArrowDownRight, Menu, X, Facebook, Instagram, Linkedin, Twitter,
  ChevronDown, ChevronUp, BarChart3, LineChart, Globe, MessageCircle, Mail, Cookie,
  ArrowLeft
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';
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
  is_active: boolean;
}

const ALL_ASSETS = [
  { name: 'PETR4', yield: 14.5, sector: 'Petróleo' },
  { name: 'VALE3', yield: 9.2, sector: 'Mineração' },
  { name: 'ITUB4', yield: 6.8, sector: 'Bancário' },
  { name: 'BBAS3', yield: 11.2, sector: 'Bancário' },
  { name: 'BBDC4', yield: 7.5, sector: 'Bancário' },
  { name: 'SANB11', yield: 8.1, sector: 'Bancário' },
  { name: 'BPAC11', yield: 2.8, sector: 'Bancário' },
  { name: 'ABEV3', yield: 5.4, sector: 'Bebidas' },
  { name: 'WEGE3', yield: 3.2, sector: 'Indústria' },
  { name: 'MXRF11', yield: 10.8, sector: 'FII Papel' },
  { name: 'HGLG11', yield: 8.5, sector: 'FII Logística' },
  { name: 'XPLG11', yield: 8.9, sector: 'FII Logística' },
  { name: 'KNIP11', yield: 11.5, sector: 'FII Papel' },
  { name: 'KNCR11', yield: 12.1, sector: 'FII Papel' },
  { name: 'BCFF11', yield: 9.2, sector: 'FII Fundo de Fundos' },
  { name: 'HGRU11', yield: 8.8, sector: 'FII Renda Urbana' },
  { name: 'HGBS11', yield: 8.2, sector: 'FII Shopping' },
  { name: 'VISC11', yield: 8.4, sector: 'FII Shopping' },
  { name: 'MALL11', yield: 8.5, sector: 'FII Shopping' },
  { name: 'BRCR11', yield: 7.8, sector: 'FII Lajes Corporativas' },
  { name: 'GGRC11', yield: 9.4, sector: 'FII Logística' },
  { name: 'GALG11', yield: 10.5, sector: 'FII Logística' },
  { name: 'CPTS11', yield: 10.2, sector: 'FII Papel' },
  { name: 'IRDM11', yield: 11.8, sector: 'FII Papel' },
  { name: 'VGIR11', yield: 12.5, sector: 'FII Papel' },
  { name: 'TAEE11', yield: 10.2, sector: 'Energia' },
  { name: 'TRPL4', yield: 9.5, sector: 'Energia' },
  { name: 'EGIE3', yield: 6.9, sector: 'Energia' },
  { name: 'CPLE6', yield: 7.8, sector: 'Energia' },
  { name: 'ELET3', yield: 4.5, sector: 'Energia' },
  { name: 'CMIG4', yield: 8.4, sector: 'Energia' },
  { name: 'ENGI11', yield: 5.6, sector: 'Energia' },
  { name: 'NEOE3', yield: 4.8, sector: 'Energia' },
  { name: 'SAPR11', yield: 8.2, sector: 'Saneamento' },
  { name: 'SBSP3', yield: 3.1, sector: 'Saneamento' },
  { name: 'CSAN3', yield: 4.2, sector: 'Energia/Logística' },
  { name: 'VBBR3', yield: 5.1, sector: 'Distribuição' },
  { name: 'PRIO3', yield: 0.0, sector: 'Petróleo' },
  { name: 'RECV3', yield: 3.5, sector: 'Petróleo' },
  { name: 'RENT3', yield: 2.1, sector: 'Locação' },
  { name: 'MOVI3', yield: 4.5, sector: 'Locação' },
  { name: 'LREN3', yield: 4.8, sector: 'Varejo' },
  { name: 'ARZZ3', yield: 2.9, sector: 'Varejo' },
  { name: 'MGLU3', yield: 0.0, sector: 'Varejo' },
  { name: 'VIIA3', yield: 0.0, sector: 'Varejo' },
  { name: 'PETZ3', yield: 1.2, sector: 'Varejo' },
  { name: 'JBSS3', yield: 6.5, sector: 'Alimentos' },
  { name: 'BRFS3', yield: 0.0, sector: 'Alimentos' },
  { name: 'MRFG3', yield: 12.4, sector: 'Alimentos' },
  { name: 'BEEF3', yield: 9.8, sector: 'Alimentos' },
  { name: 'SUZB3', yield: 3.8, sector: 'Papel e Celulose' },
  { name: 'KLBN11', yield: 6.2, sector: 'Papel e Celulose' },
  { name: 'GGBR4', yield: 7.2, sector: 'Siderurgia' },
  { name: 'CSNA3', yield: 5.5, sector: 'Siderurgia' },
  { name: 'USIM5', yield: 4.1, sector: 'Siderurgia' },
  { name: 'B3SA3', yield: 4.9, sector: 'Financeiro' },
  { name: 'BBSE3', yield: 9.4, sector: 'Seguros' },
  { name: 'PSSA3', yield: 5.8, sector: 'Seguros' },
  { name: 'CXSE3', yield: 10.1, sector: 'Seguros' },
  { name: 'RADL3', yield: 1.2, sector: 'Saúde' },
  { name: 'HAPV3', yield: 0.0, sector: 'Saúde' },
  { name: 'RDOR3', yield: 2.5, sector: 'Saúde' },
  { name: 'FLRY3', yield: 5.2, sector: 'Saúde' },
  { name: 'RAIL3', yield: 1.1, sector: 'Logística' },
  { name: 'SLCE3', yield: 6.4, sector: 'Agronegócio' },
  { name: 'SMTO3', yield: 5.8, sector: 'Agronegócio' },
  { name: 'TOTS3', yield: 1.5, sector: 'Tecnologia' },
  { name: 'VIVT3', yield: 7.1, sector: 'Telecom' },
  { name: 'TIMS3', yield: 5.4, sector: 'Telecom' },
  { name: 'SOMA3', yield: 2.1, sector: 'Moda' },
  { name: 'CCRO3', yield: 4.2, sector: 'Infraestrutura' },
  { name: 'HYPE3', yield: 4.5, sector: 'Farmacêutica' },
  { name: 'YDUQ3', yield: 3.1, sector: 'Educação' },
  { name: 'COGN3', yield: 0.0, sector: 'Educação' },
  { name: 'EMBR3', yield: 0.0, sector: 'Aeroespacial' },
  { name: 'MULT3', yield: 4.2, sector: 'Shoppings' },
  { name: 'IGTI11', yield: 3.8, sector: 'Shoppings' },
  { name: 'CYRE3', yield: 7.2, sector: 'Construção' },
  { name: 'MRVE3', yield: 3.5, sector: 'Construção' },
  { name: 'EZTC3', yield: 5.1, sector: 'Construção' }
];

const DividendCalculator = ({ initialAsset }: { initialAsset?: any }) => {
  const [goal, setGoal] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [leftAdIndex, setLeftAdIndex] = useState(0);
  const [rightAdIndex, setRightAdIndex] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    if (initialAsset?.asset) {
      const asset = initialAsset.asset;
      setSelectedAsset({
        name: asset.ticker,
        yield: (Math.random() * 6 + 4),
        sector: 'B3'
      });
      setSearchTerm(asset.ticker);
      if (goal === '') setGoal(1000);
      
      setTimeout(() => {
        const el = document.getElementById('dividend-simulator');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-indigo-600', 'ring-offset-4');
          setTimeout(() => el.classList.remove('ring-4', 'ring-indigo-600', 'ring-offset-4'), 2000);
        }
      }, 100);
    }
  }, [initialAsset]);
  
  const filteredAssets = ALL_ASSETS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.sector.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const currentYield = selectedAsset?.yield || 0;
  const numericGoal = Number(goal) || 0;
  const totalNeeded = currentYield > 0 ? (numericGoal * 12) / (currentYield / 100) : 0;

  return (
    <div className="p-8 bg-zinc-950 text-white rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 rotate-12">
        <Calculator size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <DollarSign size={16} />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Simulador de Dividendos</h4>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Quanto você quer ganhar por mês?</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">R$</span>
                <input 
                  type="number" 
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold focus:border-indigo-500 outline-none transition-all rounded-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
          </div>

          <div className="relative">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Buscar Ativo da B3</label>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Ex: PETR4, MXRF11..."
                value={searchTerm}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold focus:border-indigo-500 outline-none transition-all rounded-sm"
              />
            </div>

            {showDropdown && searchTerm && (
              <div className="absolute top-full left-0 w-full mt-1 bg-zinc-900 border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden">
                {filteredAssets.map(a => (
                  <button
                    key={a.name}
                    onClick={() => {
                      setSelectedAsset(a);
                      setSearchTerm(a.name);
                      setShowDropdown(false);
                    }}
                    className="w-full p-4 hover:bg-white/5 text-left flex justify-between items-center transition-colors border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-black text-white">{a.name}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase">{a.sector}</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 italic">{a.yield}% a.a</span>
                  </button>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="p-4 text-[9px] font-bold text-zinc-500 uppercase text-center">Ativo não encontrado</div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 bg-white/2 p-4 rounded-lg">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">Investimento em {selectedAsset?.name || '---'}</p>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-emerald-400 italic tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalNeeded)}
              </span>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                Para receber R$ {numericGoal.toLocaleString('pt-BR')} mensais
              </span>
            </div>
          </div>

          {/* Mini Chart Mockup */}
          <div className="h-16 w-full flex items-end gap-1 pt-4 opacity-50">
            {[40, 60, 30, 80, 50, 90, 70, 100].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-emerald-500/10 rounded-t-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <button className="w-full py-4 bg-indigo-600/50 text-white/50 text-[9px] font-black uppercase tracking-widest cursor-not-allowed border border-white/5 shadow-lg">
            Montar Carteira A2 Mentor (Em desenvolvimento)
          </button>
        </div>
      </div>
    </div>
  );
};

const MARKET_DATA = {
  altas: [
    { ticker: 'YDUQ3', price: 10.96, change: 7.87, volume: '85,4M' },
    { ticker: 'RENT3', price: 49.88, change: 7.62, volume: '804,8M' },
    { ticker: 'VBBR3', price: 33.80, change: 4.55, volume: '305,4M' },
    { ticker: 'RAIL3', price: 16.93, change: 3.93, volume: '300,2M' },
    { ticker: 'WEGE3', price: 45.52, change: 2.73, volume: '447,0M' },
    { ticker: 'UGPA3', price: 30.16, change: 2.72, volume: '237,6M' },
    { ticker: 'SUZB3', price: 54.20, change: 2.15, volume: '180,4M' },
    { ticker: 'PRIO3', price: 42.10, change: 1.85, volume: '290,1M' },
    { ticker: 'EQTL3', price: 32.50, change: 1.60, volume: '110,4M' },
    { ticker: 'RADL3', price: 26.80, change: 1.40, volume: '95,2M' },
    { ticker: 'CMIG4', price: 12.85, change: 1.25, volume: '45,8M' },
    { ticker: 'CPLE6', price: 10.15, change: 0.95, volume: '32,1M' },
  ],
  baixas: [
    { ticker: 'MGLU3', price: 1.82, change: -5.42, volume: '150,2M' },
    { ticker: 'BHIA3', price: 0.45, change: -4.80, volume: '42,1M' },
    { ticker: 'CVCB3', price: 2.15, change: -3.25, volume: '12,5M' },
    { ticker: 'COGN3', price: 2.10, change: -2.10, volume: '98,3M' },
    { ticker: 'AZUL4', price: 9.80, change: -1.95, volume: '210,4M' },
    { ticker: 'ALPA4', price: 8.50, change: -1.50, volume: '34,2M' },
    { ticker: 'HAPV3', price: 3.80, change: -1.35, volume: '150,4M' },
    { ticker: 'LREN3', price: 16.20, change: -1.20, volume: '180,2M' },
    { ticker: 'BRFS3', price: 18.50, change: -1.10, volume: '140,5M' },
    { ticker: 'MRVE3', price: 7.20, change: -0.95, volume: '50,4M' },
    { ticker: 'TOTS3', price: 28.40, change: -2.30, volume: '18,5M' },
  ],
  volume: [
    { ticker: 'PETR4', price: 38.45, change: 1.20, volume: '2.4B' },
    { ticker: 'VALE3', price: 62.15, change: -0.45, volume: '1.8B' },
    { ticker: 'ITUB4', price: 32.10, change: 0.85, volume: '950,2M' },
    { ticker: 'BBDC4', price: 14.20, change: 0.15, volume: '820,4M' },
    { ticker: 'BBAS3', price: 28.50, change: 1.45, volume: '740,1M' },
    { ticker: 'ABEV3', price: 12.80, change: -0.20, volume: '620,8M' },
    { ticker: 'B3SA3', price: 11.20, change: 0.30, volume: '450,4M' },
    { ticker: 'ELET3', price: 39.50, change: 0.50, volume: '380,2M' },
    { ticker: 'JBSS3', price: 31.20, change: 0.70, volume: '310,4M' },
    { ticker: 'CSNA3', price: 13.80, change: -0.25, volume: '280,1M' },
  ]
};

const SideAdCarousel = ({ type }: { type: string }) => {
  const [carouselAds, setCarouselAds] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadAds = async () => {
      const { data } = await supabase.from('news').select('*').eq('content_type', type).eq('is_active', true);
      if (data) setCarouselAds(data);
    };
    loadAds();
  }, [type]);

  useEffect(() => {
    if (carouselAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselAds.length]);

  if (carouselAds.length === 0) return null;
  const currentAd = carouselAds[currentIndex];

  return (
    <div 
      onClick={() => {
        if (currentAd.meta_value?.external_url) {
          const url = currentAd.meta_value.external_url;
          window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
        }
      }}
      className="w-full aspect-[4/5] bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all relative"
    >
      <img src={currentAd.image_url} alt="Publicidade" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-[7px] text-white font-black uppercase tracking-widest rounded-full">
        Publicidade {carouselAds.length > 1 && `(${currentIndex + 1}/${carouselAds.length})`}
      </div>
    </div>
  );
};

export default function VittaNews() {
  const navigate = useNavigate();
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [scrolled, setScrolled] = useState(false);
  const [expandedFeatured, setExpandedFeatured] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<NewsItem | null>(null);
  
  const [activeMarketTab, setActiveMarketTab] = useState<'altas' | 'baixas' | 'volume'>('altas');
  const [marketSearch, setMarketSearch] = useState('');
  const [showAllMarket, setShowAllMarket] = useState(false);
  const [selectedMarketAsset, setSelectedMarketAsset] = useState<any | null>(null);
  const [marketTimeRange, setMarketTimeRange] = useState('1D');
  const [assetForSimulator, setAssetForSimulator] = useState<{ asset: any, ts: number } | null>(null);

  const openLink = (url?: string) => {
    if (!url || url === '#' || url.trim() === '') {
      navigate('/noticias/anunciar');
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  const handleEmailClick = () => {
    navigator.clipboard.writeText('suporte@a2mentor.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
    window.location.href = 'mailto:suporte@a2mentor.com';
  };

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setTimeout(() => {
        const el = document.getElementById('news-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [categoryParam]);

  useEffect(() => {
    const consent = localStorage.getItem('vitta_cookie_consent');
    if (!consent) {
      setTimeout(() => setShowCookieConsent(true), 2000);
    }
  }, []);

  useEffect(() => {
    if (activeCategory === 'VittaConsultoria') {
      const vids = news.filter(item => item.content_type === 'ad_featured_video' && item.is_active);
      if (vids.length > 0 && !selectedVideo) {
        setSelectedVideo(vids[0]);
      }
    } else {
      setSelectedVideo(null);
    }
  }, [activeCategory, news]);

  const categories = ['Todas', 'Mercado Financeiro', 'Empreendedorismo', 'Criptomoedas', 'Tecnologia', 'VittaConsultoria'];

  const filteredMarketData = React.useMemo(() => {
    const searchLower = marketSearch.toLowerCase().trim();
    if (searchLower !== '') {
      const allAssets = [...MARKET_DATA.altas, ...MARKET_DATA.baixas, ...MARKET_DATA.volume];
      const uniqueAssets = allAssets.filter((v, i, a) => a.findIndex(t => t.ticker === v.ticker) === i);
      const results = uniqueAssets.filter(item => item.ticker.toLowerCase().includes(searchLower));
      
      // Busca Dinâmica "Inteligente": Se não encontrar na base, gera um ativo virtual 
      // para permitir que o usuário veja o dashboard de qualquer ticker da B3.
      if (results.length === 0 && searchLower.length >= 4) {
        const virtualTicker = searchLower.toUpperCase();
        // Gerar valores baseados no ticker para manter consistência
        const seed = virtualTicker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return [{
          ticker: virtualTicker,
          price: (seed % 100) + 10.50,
          change: (seed % 10) - 5,
          volume: (seed % 500) + 'M'
        }];
      }
      return results;
    }
    return MARKET_DATA[activeMarketTab];
  }, [marketSearch, activeMarketTab]);

  const getAssetChartData = React.useMemo(() => {
    if (!selectedMarketAsset) return [];
    const seed = selectedMarketAsset.ticker.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Configurações específicas para cada período
    const configs: Record<string, { length: number, vol: number, trend: number }> = {
      '1D': { length: 40, vol: 0.002, trend: 0.1 },
      '5D': { length: 70, vol: 0.008, trend: 0.2 },
      '1M': { length: 100, vol: 0.02, trend: 0.4 },
      '6M': { length: 160, vol: 0.05, trend: 0.8 },
      'YTD': { length: 200, vol: 0.07, trend: 1.0 },
      '1A': { length: 250, vol: 0.10, trend: 1.5 },
      '5A': { length: 350, vol: 0.20, trend: 3.0 },
      'MÁX': { length: 500, vol: 0.35, trend: 5.0 }
    };

    const config = configs[marketTimeRange] || configs['1D'];
    const data = [];
    
    for (let i = 0; i < config.length; i++) {
      // Simulação mais complexa para períodos longos
      const noise = Math.sin(i * 0.1 + seed) * config.vol;
      const trend = (i / config.length) * (selectedMarketAsset.change / 100) * config.trend;
      const wave = Math.sin(i * 0.05) * (config.vol * 0.5);
      const val = selectedMarketAsset.price * (1 + noise + trend + wave + (Math.sin(i * 0.5) * 0.001));
      data.push({ name: i, value: val });
    }
    return data;
  }, [selectedMarketAsset, marketTimeRange]);

  useEffect(() => {
    if (marketSearch.trim() !== '') {
      setSelectedMarketAsset(null);
      // Garante que a aba mude para mostrar resultados se não houver na aba atual
      const foundInCurrent = MARKET_DATA[activeMarketTab].some(item => 
        item.ticker.toLowerCase().includes(marketSearch.toLowerCase())
      );
      if (!foundInCurrent) {
        // A lógica de filtragem global já cuida disso no filteredMarketData, 
        // mas o useEffect ajuda a garantir que o estado de seleção seja limpo.
      }
    }
  }, [marketSearch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: newsData } = await supabase
          .from('site_content')
          .select('*')
          .in('content_type', ['news', 'marketing', 'ad_top', 'ad_skin_left_home', 'ad_skin_right_home', 'ad_skin_left', 'ad_skin_right', 'ad_sidebar_1', 'ad_sidebar_2', 'ad_featured_video'])
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (newsData) setNews(newsData);
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
      navigator.share({ title: item.title, text: 'Confira no A2 Notícias: ' + item.title, url: item.meta_value?.external_url || window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(item.meta_value?.external_url || window.location.href);
      alert('Link copiado!');
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').filter(line => line.trim() !== '').map((paragraph, i) => (
      <p key={i} className="mb-4 last:mb-0 text-zinc-600 font-medium leading-relaxed text-base">
        {paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="text-zinc-950 font-black">{part.slice(2, -2)}</strong>;
          return part;
        })}
      </p>
    ));
  };

  const filteredNews = activeCategory === 'Todas' 
    ? news.filter(item => ['news', 'marketing'].includes(item.content_type))
    : news.filter(item => ['news', 'marketing'].includes(item.content_type) && item.meta_value?.category === activeCategory);

  const getYouTubeId = (url: string) => {
    if (url.length === 11) return url;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getAd = (type: string) => {
    const exact = news.find(item => item.content_type === type && item.is_active);
    if (exact) return exact;
    if (type === 'ad_skin_left_home') return news.find(item => item.content_type === 'ad_skin_left' && item.is_active);
    if (type === 'ad_skin_right_home') return news.find(item => item.content_type === 'ad_skin_right' && item.is_active);
    return undefined;
  };

  const allFeaturedVideos = activeCategory === 'VittaConsultoria' ? news.filter(item => item.content_type === 'ad_featured_video' && item.is_active) : [];
  const videoFeatured = allFeaturedVideos[0];
  const featured = videoFeatured || filteredNews[0];
  const secondary = videoFeatured ? filteredNews.slice(0, 3) : filteredNews.slice(1, 4);
  const others = videoFeatured ? filteredNews.slice(3) : filteredNews.slice(4);

  const formattedDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100">
      
      {/* 📈 TICKER: ESTILO BOLSA DE VALORES (Mesmo da SalesPage) */}
      <div className="fixed top-0 left-0 w-full bg-[#1a237e] border-b border-white/5 py-3 overflow-hidden whitespace-nowrap z-[1001] flex justify-start">
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
      <nav className="fixed top-[41px] left-0 w-full z-[1000] bg-white border-b border-zinc-100 py-5 transition-all duration-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
              <img src="/logo.png" alt="A2 Mentor" className="h-10 w-10 object-cover rounded-full mix-blend-multiply" />
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900">A2<span className="text-indigo-600">Notícias</span></span>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-400">Inteligência Financeira</span>
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

          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Search size={20} /></button>
            <button onClick={() => navigate('/login')} className="px-5 md:px-8 py-2.5 md:py-3 bg-indigo-600 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10">
              Assinar Pro
            </button>
          </div>
        </div>

        {/* Categorias Mobile: Scroll Horizontal */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-zinc-50 border-t border-zinc-100">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap text-[9px] font-black uppercase tracking-widest transition-all py-1.5 px-3 rounded-full ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 bg-zinc-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-[260px] md:pt-40" />

      {/* SKIN ADS (LATERAIS EXTREMAS - ESQUERDA E DIREITA) */}
      <div className="hidden 2xl:flex fixed top-48 left-0 w-[calc(50vw-40rem)] h-[600px] z-[10] justify-end pr-4 pointer-events-none">
        {(() => {
          const ad = news.find(item => item.content_type === 'ad_skin_left_home' && item.is_active);
          let slides = ad?.meta_value?.slides || [];
          if (slides.length === 0 && ad?.image_url) {
            slides = [{
              id: ad.id,
              image_url: ad.image_url,
              external_url: ad.meta_value?.external_url || '#',
              client_name: ad.meta_value?.client_name || ad.title
            }];
          }
          const hasSlides = slides.length > 0;
          const currentSlide = hasSlides ? slides[leftAdIndex % slides.length] : null;

          return (
            <div 
              onClick={() => openLink(currentSlide ? currentSlide.external_url : ad?.meta_value?.external_url)}
              className="w-[160px] xl:w-[300px] h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative pointer-events-auto cursor-pointer group overflow-hidden shadow-sm rounded-2xl"
            >
              <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">
                Publicidade {slides.length > 1 && `(${(leftAdIndex % slides.length) + 1}/${slides.length})`}
              </span>
              {currentSlide ? (
                <img src={currentSlide.image_url} alt="Ad Left" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm rounded-lg mb-4">Espaço Disponível</span>
                  <span className="text-sm font-black text-indigo-500 group-hover:scale-105 transition-transform duration-300">Anuncie Aqui</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <div className="hidden 2xl:flex fixed top-48 right-0 w-[calc(50vw-40rem)] h-[600px] z-[10] justify-start pl-4 pointer-events-none">
        {(() => {
          const ad = news.find(item => item.content_type === 'ad_skin_right_home' && item.is_active);
          let slides = ad?.meta_value?.slides || [];
          if (slides.length === 0 && ad?.image_url) {
            slides = [{
              id: ad.id,
              image_url: ad.image_url,
              external_url: ad.meta_value?.external_url || '#',
              client_name: ad.meta_value?.client_name || ad.title
            }];
          }
          const hasSlides = slides.length > 0;
          const currentSlide = hasSlides ? slides[rightAdIndex % slides.length] : null;

          return (
            <div 
              onClick={() => openLink(currentSlide ? currentSlide.external_url : ad?.meta_value?.external_url)}
              className="w-[160px] xl:w-[300px] h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative pointer-events-auto cursor-pointer group overflow-hidden shadow-sm rounded-2xl"
            >
              <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">
                Publicidade {slides.length > 1 && `(${(rightAdIndex % slides.length) + 1}/${slides.length})`}
              </span>
              {currentSlide ? (
                <img src={currentSlide.image_url} alt="Ad Right" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm rounded-lg mb-4">Espaço Disponível</span>
                  <span className="text-sm font-black text-indigo-500 group-hover:scale-105 transition-transform duration-300">Anuncie Aqui</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* TOP AD BANNER */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center">
        <div 
          onClick={() => openLink(getAd('ad_top')?.meta_value?.external_url)}
          className="w-full max-w-[970px] h-[120px] md:h-[250px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden cursor-pointer"
        >
          <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
          {getAd('ad_top') ? (
            <img src={getAd('ad_top')?.image_url} alt="Advertisement" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
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
            
            {/* DESTAQUE PRINCIPAL - ESTILO INFOMONEY / YOUTUBE */}
            {featured && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-zinc-100 pb-16">
                {activeCategory === 'VittaConsultoria' && videoFeatured ? (
                  <>
                    {/* LAYOUT VITTACASH: VÍDEO + HISTÓRICO */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                      <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-2xl group">
                        <div className="aspect-video w-full relative bg-zinc-950">
                          <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${getYouTubeId((selectedVideo || videoFeatured).meta_value?.external_url || '')}?autoplay=0&rel=0`}
                            title={(selectedVideo || videoFeatured).title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-[#1a237e] text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              A2 TV
                            </span>
                          </div>
                        </div>
                        <div className="p-8 h-[380px] flex flex-col">
                          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Clock size={12} /> Destaque em Vídeo • {new Date((selectedVideo || videoFeatured).created_at).toLocaleDateString()}
                          </div>
                          <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic leading-tight mb-4 line-clamp-2">
                            {(selectedVideo || videoFeatured).title}
                          </h1>
                          <div className="flex-1 overflow-y-auto pr-4 mb-6 custom-scrollbar text-zinc-600">
                            {renderFormattedText((selectedVideo || videoFeatured).description)}
                          </div>
                          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-zinc-50">
                            <button 
                              onClick={() => openLink((selectedVideo || videoFeatured).meta_value?.external_url)}
                              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all rounded-sm shadow-md"
                            >
                              Assistir no YouTube <ExternalLink size={14} />
                            </button>
                            <button 
                              onClick={() => handleShare(selectedVideo || videoFeatured)}
                              className="p-3.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-indigo-600 transition-all rounded-sm shadow-sm"
                              title="Compartilhar"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 h-full">
                      <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xl p-8 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 pb-4">
                          <Newspaper size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 italic">Histórico de Vídeos</h3>
                        </div>
                        <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar max-h-[640px]">
                          {allFeaturedVideos.map((vid) => (
                            <div 
                              key={vid.id} 
                              onClick={() => {
                                setSelectedVideo(vid);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`flex gap-4 group cursor-pointer p-3 rounded-xl transition-all border ${
                                (selectedVideo?.id === vid.id || (!selectedVideo && vid.id === videoFeatured.id))
                                  ? 'bg-indigo-50 border-indigo-100' 
                                  : 'hover:bg-zinc-50 border-transparent'
                              }`}
                            >
                              <div className="w-24 aspect-video shrink-0 bg-zinc-200 rounded-lg overflow-hidden relative">
                                <img 
                                  src={`https://img.youtube.com/vi/${getYouTubeId(vid.meta_value?.external_url || '')}/mqdefault.jpg`} 
                                  alt={vid.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <PlayCircle size={14} />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col justify-center overflow-hidden">
                                <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight italic line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                  {vid.title}
                                </h4>
                                <span className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">
                                  {new Date(vid.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                          {allFeaturedVideos.length <= 1 && (
                            <div className="text-center py-8">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nenhum vídeo anterior</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lg:col-span-7 group">
                      <div className="aspect-video w-full overflow-hidden rounded-2xl relative bg-zinc-950 shadow-2xl">
                        {featured.content_type === 'ad_featured_video' ? (
                          <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${getYouTubeId(featured.meta_value?.external_url || '')}?autoplay=0&rel=0`}
                            title={featured.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <>
                            {featured.image_url
                              ? <img src={featured.image_url} alt={featured.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700" referrerPolicy="no-referrer" />
                              : <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-zinc-100 flex items-center justify-center"><span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">Sem imagem</span></div>
                            }
                          </>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-[#1a237e] text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            {featured.content_type === 'ad_featured_video' ? 'A2 TV' : (featured.meta_value?.category || 'Destaque')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Clock size={12} /> {featured.content_type === 'ad_featured_video' ? 'Destaque em Vídeo' : `${new Date(featured.created_at).toLocaleDateString()} • 5 min de leitura`}
                      </div>
                      <h1 
                        className="text-3xl md:text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-[1.05] mb-6 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => featured.content_type !== 'ad_featured_video' && navigate(`/noticias/${featured.id}`)}
                      >
                        {featured.title}
                      </h1>
                      
                      <div className={`mb-8 relative transition-all duration-500 overflow-hidden ${expandedFeatured ? '' : 'max-h-[140px]'}`}>
                        {renderFormattedText(featured.description)}
                        {!expandedFeatured && featured.description.length > 200 && (
                          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {featured.content_type === 'ad_featured_video' ? (
                          <button 
                            onClick={() => openLink(featured.meta_value?.external_url)}
                            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all rounded-sm shadow-md"
                          >
                            Assistir no YouTube <ExternalLink size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate(`/noticias/${featured.id}`)}
                            className="flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all rounded-sm shadow-md"
                          >
                            Ler Matéria Completa
                          </button>
                        )}
                        <button 
                          onClick={() => handleShare(featured)}
                          className="p-3.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-indigo-600 transition-all rounded-sm shadow-sm"
                          title="Compartilhar"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* GRID SECUNDÁRIO - Oculto na categoria VittaConsultoria */}
            {activeCategory !== 'VittaConsultoria' && (
              <div id="news-grid" className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {secondary.map(item => (
                  <div key={item.id} className="group cursor-pointer flex flex-col" onClick={() => navigate(`/noticias/${item.id}`)}>
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
            )}

            {/* BANNER HORIZONTAL (VittaConsultoria -> B3) */}
            {activeCategory === 'VittaConsultoria' && (
              <div 
                onClick={() => openLink(getAd('ad_vittacash_horizontal')?.meta_value?.external_url)}
                className="w-full h-24 md:h-32 bg-zinc-100 mb-8 rounded-2xl overflow-hidden relative group cursor-pointer border border-zinc-100 shadow-sm animate-in fade-in duration-1000"
              >
                <span className="absolute top-2 right-4 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
                {getAd('ad_vittacash_horizontal') ? (
                  <img src={getAd('ad_vittacash_horizontal')?.image_url} alt="Advertisement" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Banner Horizontal A2 TV</span>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO LISTA E SIDEBAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-8 border-t border-zinc-100">
              
              {/* FEED DE NOTÍCIAS */}
              <div className="lg:col-span-8 space-y-12">
                {activeCategory === 'VittaConsultoria' ? (
                  <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xl animate-in fade-in duration-700">
                    {/* Market Tool Content (B3 Radar) */}
                    <div className="p-4 md:p-8 border-b border-zinc-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 bg-zinc-50/50">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-xl md:text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">Altas e Baixas - <span className="text-indigo-600">B3</span></h2>
                          <div className="flex items-center gap-2 px-2 py-1 bg-white border border-zinc-200 rounded-full">
                            <Clock size={8} className="text-zinc-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Tempo Real</span>
                          </div>
                        </div>
                        <p className="text-zinc-500 text-[10px] md:text-xs font-medium italic">Monitoramento dinâmico dos principais ativos brasileiros.</p>
                      </div>
                      <div className="relative w-full lg:w-64">
                        <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar ativo..."
                          value={marketSearch}
                          onChange={(e) => setMarketSearch(e.target.value)}
                          className="w-full bg-white border border-zinc-200 p-2.5 md:p-3 pl-10 text-[10px] md:text-xs font-bold text-zinc-900 focus:border-indigo-600 outline-none transition-all rounded-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="p-4 md:p-8">
                      {selectedMarketAsset ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                          <button 
                            onClick={() => setSelectedMarketAsset(null)}
                            className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-zinc-900 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-zinc-100 transition-all">
                              <ArrowLeft size={14} />
                            </div>
                            Voltar para o Radar Completo
                          </button>
                          
                          <div className="bg-[#09090b] p-6 md:p-8 rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl">
                            {/* CABEÇALHO DO DASHBOARD */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-8">
                              <div className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase">B3: {selectedMarketAsset.ticker}</span>
                                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Ações • Brasil</span>
                                  </div>
                                  <p className="md:hidden text-[8px] font-bold text-zinc-600 uppercase tracking-widest">8 Mai, 17:07 BRT</p>
                                </div>
                                <div className="flex items-baseline gap-3">
                                  <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">R$ {selectedMarketAsset.price.toFixed(2)}</h1>
                                  <div className={`flex items-center gap-1 text-xs md:text-sm font-black italic ${selectedMarketAsset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {selectedMarketAsset.change >= 0 ? '+' : ''}{selectedMarketAsset.change.toFixed(2)}% <span className="text-[9px] opacity-60 ml-1">HOJE</span>
                                  </div>
                                </div>
                                <p className="hidden md:block text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-2">8 de mai., 17:07 BRT • Dados em Tempo Real</p>
                              </div>
                              
                              <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                                {['1D', '5D', '1M', '6M', 'YTD', '1A', '5A', 'MÁX'].map(range => (
                                  <button 
                                    key={range}
                                    onClick={() => setMarketTimeRange(range)}
                                    className={`px-3 py-1.5 text-[9px] font-black rounded transition-all whitespace-nowrap ${marketTimeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                  >
                                    {range}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="h-48 md:h-52 w-full mb-6 relative bg-zinc-950/50 rounded-xl p-4 border border-white/5">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                  data={getAssetChartData}
                                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                  <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={true} horizontal={true} />
                                  <XAxis hide />
                                  <YAxis 
                                    orientation="left" 
                                    domain={['auto', 'auto']} 
                                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '11px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ display: 'none' }}
                                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Cotação']}
                                  />
                                  <ReferenceLine 
                                    y={selectedMarketAsset.price * 0.99} 
                                    stroke="#4b5563" 
                                    strokeDasharray="3 3" 
                                    label={{ position: 'right', value: `Fech. ant. R$ ${(selectedMarketAsset.price * 0.99).toFixed(2)}`, fill: '#9ca3af', fontSize: 9, fontWeight: 'black' }} 
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#22c55e" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                    animationDuration={1500}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pt-8 border-t border-zinc-900">
                              <div>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                  {[
                                    { label: 'Abertura', value: (selectedMarketAsset.price * 0.98).toFixed(2) },
                                    { label: 'Cap. merc.', value: (Math.random() * 50 + 10).toFixed(2) + ' bi' },
                                    { label: 'Dividendo', value: (Math.random() * 8 + 2).toFixed(2) + '%' },
                                    { label: 'Alta', value: (selectedMarketAsset.price * 1.02).toFixed(2) },
                                    { label: 'Índice P/L', value: (Math.random() * 20 + 5).toFixed(2) },
                                    { label: 'Div. trim.', value: '0.19' },
                                    { label: 'Baixa', value: (selectedMarketAsset.price * 0.97).toFixed(2) },
                                    { label: 'Alt 52 sem', value: (selectedMarketAsset.price * 1.2).toFixed(2) },
                                    { label: 'Bai 52 sem', value: (selectedMarketAsset.price * 0.7).toFixed(2) },
                                  ].map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                                      <span className="text-xs font-black text-white">{stat.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2">
                                  <DollarSign size={14} /> Oportunidades
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Próximo Pagamento</p>
                                      <p className="text-base font-black text-white italic">R$ {(selectedMarketAsset.price * 0.012).toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Data Com</p>
                                      <p className="text-xs font-black text-emerald-400">22 JUN</p>
                                    </div>
                                  </div>
                                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">D. Yield Anual</p>
                                      <p className="text-base font-black text-emerald-500 italic">{(Math.random() * 6 + 4).toFixed(2)}%</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Frequência</p>
                                      <p className="text-xs font-black text-white uppercase">Trimestral</p>
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setAssetForSimulator({ asset: selectedMarketAsset, ts: Date.now() })}
                                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                                >
                                  <Calculator size={14} /> Projetar Renda com {selectedMarketAsset.ticker}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2 mb-8">
                            <button onClick={() => setActiveMarketTab('altas')} className={`px-5 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest ${activeMarketTab === 'altas' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Altas</button>
                            <button onClick={() => setActiveMarketTab('baixas')} className={`px-5 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest ${activeMarketTab === 'baixas' ? 'bg-rose-500 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Baixas</button>
                            <button onClick={() => setActiveMarketTab('volume')} className={`px-5 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest ${activeMarketTab === 'volume' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Volume</button>
                          </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-zinc-100">
                              <th className="pb-4 text-[9px] font-black uppercase text-zinc-400">Ativo</th>
                              <th className="pb-4 text-[9px] font-black uppercase text-zinc-400">Preço</th>
                              <th className="pb-4 text-[9px] font-black uppercase text-zinc-400">Variação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(showAllMarket || marketSearch ? filteredMarketData : filteredMarketData.slice(0, 6)).map(item => (
                              <tr 
                                key={item.ticker}
                                onClick={() => setSelectedMarketAsset(item)}
                                className="border-b border-zinc-50 hover:bg-indigo-50/30 transition-all cursor-pointer"
                              >
                                <td className="py-4 text-sm font-black text-zinc-900 flex items-center gap-2">
                                  <div className={`w-1 h-4 rounded-full ${item.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {item.ticker}
                                </td>
                                <td className="py-4 text-xs font-bold text-zinc-600">R$ {item.price.toFixed(2)}</td>
                                <td className={`py-4 text-xs font-black italic ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  <div className="flex items-center gap-1">
                                    {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {!marketSearch && filteredMarketData.length > 6 && (
                        <button 
                          onClick={() => setShowAllMarket(!showAllMarket)}
                          className="w-full py-4 mt-4 border-t border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                          {showAllMarket ? 'Ver Menos Ativos' : `Ver Todos os ${filteredMarketData.length} Ativos`}
                          {showAllMarket ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
                ) : null}
                {activeCategory !== 'VittaConsultoria' && (
                  <>
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Últimas <span className="text-indigo-600">Notícias</span></h2>
                      <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-2 transition-all">Ver Histórico <ChevronRight size={14} /></button>
                    </div>

                    <div className="space-y-12">
                      {others.map(item => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 group cursor-pointer border-b border-zinc-100 pb-10" onClick={() => navigate(`/noticias/${item.id}`)}>
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
                  </>
                )}
              </div>

              {/* SIDEBAR: MAIS LIDAS E INDICADORES */}
              <aside className="lg:col-span-4 space-y-12 relative">
                
                {/* SIDEBAR AD BANNER 1 (SQUARE) */}
                <div className="space-y-1.5">
                  <div 
                    onClick={() => openLink(getAd('ad_sidebar_1')?.meta_value?.external_url)}
                    className="w-full aspect-square bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden cursor-pointer rounded-xl"
                  >
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
                    {getAd('ad_sidebar_1') ? (
                      <img src={getAd('ad_sidebar_1')?.image_url} alt="Advertisement" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm rounded-lg mb-2">Espaço Disponível</span>
                        <span className="text-[10px] font-bold text-indigo-500">Clique para anunciar</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Link to="/noticias/anunciar" className="text-[8px] font-black uppercase tracking-wider text-indigo-500 hover:underline">📢 Anunciar neste Espaço</Link>
                  </div>
                </div>


                <div id="dividend-simulator">
                  <DividendCalculator initialAsset={assetForSimulator} />
                </div>

                {/* SIDEBAR AD BANNER 2 (SKYSCRAPER - STICKY) */}
                <div className="space-y-1.5 sticky top-32 hidden md:block">
                  <div 
                    onClick={() => openLink(getAd('ad_sidebar_2')?.meta_value?.external_url)}
                    className="w-full h-[600px] bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 relative group overflow-hidden cursor-pointer rounded-xl"
                  >
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 z-10 bg-white/80 px-2 py-0.5 backdrop-blur-sm">Publicidade</span>
                    {getAd('ad_sidebar_2') ? (
                      <img src={getAd('ad_sidebar_2')?.image_url} alt="Advertisement" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 shadow-sm rounded-lg mb-2">Espaço Disponível</span>
                        <span className="text-[10px] font-bold text-indigo-500">Clique para anunciar</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Link to="/noticias/anunciar" className="text-[8px] font-black uppercase tracking-wider text-indigo-500 hover:underline">📢 Anunciar neste Espaço</Link>
                  </div>
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
              O portal de notícias oficial da A2 Mentor. Nossa missão é democratizar a inteligência financeira através de dados precisos e insights estratégicos para o seu crescimento.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Globe size={18} /></button>
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Categorias</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><button onClick={() => setSearchParams({ category: 'Mercado Financeiro' })} className="hover:text-indigo-400 transition-colors uppercase text-left">Mercado Financeiro</button></li>
              <li><button onClick={() => setSearchParams({ category: 'Empreendedorismo' })} className="hover:text-indigo-400 transition-colors uppercase text-left">Empreendedorismo</button></li>
              <li><button onClick={() => setSearchParams({ category: 'Criptomoedas' })} className="hover:text-indigo-400 transition-colors uppercase text-left">Criptomoedas</button></li>
              <li><button onClick={() => setSearchParams({ category: 'Tecnologia' })} className="hover:text-indigo-400 transition-colors uppercase text-left">Tecnologia</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Institucional</h5>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight text-zinc-500">
              <li><Link to="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacidade</Link></li>
              <li><Link to="/legal/terms" className="hover:text-indigo-400 transition-colors">Termos de Uso</Link></li>
              <li><a href="/#pricing" className="hover:text-indigo-400 transition-colors">A2 Mentor App</a></li>
              <li><Link to="/noticias/anunciar" className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-bold">📢 Anuncie Conosco</Link></li>
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

        {/* COOKIE CONSENT BANNER */}
        {showCookieConsent && (
          <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[2000] animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Cookie size={24} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1 leading-none">Aviso de Cookies</h4>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência. Ao aceitar, você concorda com nossa <Link to="/legal/privacy" className="text-indigo-500 underline">Política de Privacidade</Link>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.setItem('vitta_cookie_consent', 'denied');
                  setShowCookieConsent(false);
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Não Aceitar
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('vitta_cookie_consent', 'accepted');
                  setShowCookieConsent(false);
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
              >
                Aceitar Cookies
              </button>
            </div>
          </div>
        )}
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

