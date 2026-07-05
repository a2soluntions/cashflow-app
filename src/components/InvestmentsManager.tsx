import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { TrendingUp, Trash2, Plus, ArrowUpRight, ArrowDownRight, Wallet, X, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

interface Props {
 investments: Investment[];
 onAdd: (inv: any) => void; // 'any' para evitar conflito de nomes no payload
 onDelete: (id: string) => void;
}

const B3_ASSETS = [
  "ABEV3", "ALOS3", "ALZR11", "ARZZ3", "ASAI3", "AZUL4", "B3SA3", "BBAS3", "BBDC3", "BBDC4",
  "BBOV11", "BBSE3", "BCFF11", "BOVA11", "BPAC11", "BRAP4", "BRCR11", "BRFS3", "BTLG11", "CCRO3",
  "CMIG4", "CMIN3", "COGN3", "CPFE3", "CPLE6", "CPTS11", "CRFB3", "CSAN3", "CSNA3", "CVCB3",
  "CYRE3", "DEVA11", "DIRR3", "EGIE3", "ELET3", "ELET6", "ENEV3", "ENGI11", "EQTL3", "EZTC3",
  "FLRY3", "GGBR4", "GOAU4", "GOLL4", "HAPV3", "HASH11", "HCTR11", "HGBS11", "HGLG11", "HGRU11",
  "HSML11", "IRDM11", "ITSA4", "ITUB4", "IVVB11", "JBSS3", "KLBN11", "KNCR11", "KNRI11", "KNSC11",
  "LREN3", "MCCI11", "MDIA3", "MGLU3", "MRVE3", "MULT3", "MXRF11", "NTCO3", "PCAR3", "PETR3",
  "PETR4", "PRIO3", "PVBI11", "QBTC11", "RADL3", "RAIL3", "RBRR11", "RENT3", "RVBI11", "SBSP3",
  "SMAL11", "SMTO3", "SOMA3", "SUZB3", "TAEE11", "TGAR11", "TIMS3", "TOTS3", "TRPL4", "TRXF11",
  "UGPA3", "USIM5", "VALE3", "VBBR3", "VGHF11", "VIIA3", "VILG11", "VISC11", "VIVT3", "VRTA11",
  "WEGE3", "XPIN11", "XPLG11", "XPML11", "YDUQ3"
].sort();

const CRYPTO_ASSETS = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC", "XRP", "DOGE", "ADA", "AVAX", "LINK", "MATIC", "SHIB"];

const ASSET_SUMMARIES: Record<string, string> = {
  "PETR4": "Petróleo Brasileiro S.A. é uma empresa de capital aberto que atua na exploração, produção, refino, comercialização e transporte de petróleo, gás natural e derivados.",
  "PETR3": "Petróleo Brasileiro S.A. é uma empresa de capital aberto que atua na exploração, produção, refino, comercialização e transporte de petróleo, gás natural e derivados.",
  "VALE3": "Vale S.A. é uma mineradora multinacional brasileira e uma das maiores operadoras de logística do país, sendo a maior produtora de minério de ferro do mundo.",
  "ITUB4": "Itaú Unibanco é o maior banco privado do Brasil e a maior instituição financeira da América Latina.",
  "BBDC3": "Banco Bradesco S.A. é um dos maiores grupos financeiros do Brasil, com atuação focada no atendimento a diversos perfis de clientes.",
  "BBDC4": "Banco Bradesco S.A. é um dos maiores grupos financeiros do Brasil, com atuação focada no atendimento a diversos perfis de clientes.",
  "WEGE3": "WEG S.A. é uma empresa multinacional brasileira que atua na produção de motores elétricos, geradores, transformadores e drives.",
  "ABEV3": "Ambev S.A. é uma empresa brasileira dedicada à produção de bebidas, entre as maiores cervejarias do mundo.",
  "BBAS3": "Banco do Brasil S.A. é a primeira instituição financeira do Brasil, atuando de forma expressiva no agronegócio e no setor público.",
  "MGLU3": "Magazine Luiza é uma rede varejista de eletrônicos e móveis, conhecida por sua forte atuação e inovação no comércio eletrônico (e-commerce).",
  "MXRF11": "Maxi Renda é um dos maiores Fundos Imobiliários (FIIs) da B3, com portfólio focado em papéis de dívida imobiliária (CRIs)."
};

const CRYPTO_SUMMARIES: Record<string, string> = {
  "BTC": "Bitcoin é a primeira e mais valiosa criptomoeda do mundo, criada em 2009 por Satoshi Nakamoto. Funciona como reserva de valor digital descentralizada com oferta limitada a 21 milhões de unidades.",
  "ETH": "Ethereum é a segunda maior criptomoeda e a principal plataforma de contratos inteligentes (smart contracts), possibilitando aplicações descentralizadas (DApps) e DeFi.",
  "USDT": "Tether (USDT) é a maior stablecoin do mercado, pareada 1:1 com o dólar americano. É amplamente usada como par de negociação e reserva de valor estável.",
  "BNB": "Binance Coin é o token nativo da Binance, a maior exchange de criptomoedas do mundo. É usada para taxas de transação, staking e no ecossistema BNB Chain.",
  "SOL": "Solana é uma blockchain de alta performance conhecida por transações rápidas e taxas baixas. Compete com Ethereum no mercado de DApps e NFTs.",
  "USDC": "USD Coin é uma stablecoin regulamentada pareada ao dólar, emitida pela Circle. Considerada uma das mais transparentes e seguras do mercado.",
  "XRP": "XRP é a criptomoeda da Ripple Labs, focada em pagamentos internacionais rápidos e de baixo custo entre instituições financeiras.",
  "DOGE": "Dogecoin é uma criptomoeda meme criada em 2013 que ganhou grande popularidade. Conhecida pela comunidade ativa e apoio de figuras como Elon Musk.",
  "ADA": "Cardano é uma plataforma blockchain de terceira geração focada em sustentabilidade, escalabilidade e interoperabilidade, fundada por Charles Hoskinson.",
  "AVAX": "Avalanche é uma plataforma blockchain rápida e escalável para DApps e DeFi, com tempo de finalização de transação inferior a 1 segundo.",
  "LINK": "Chainlink é um protocolo oracle descentralizado que conecta contratos inteligentes a dados do mundo real, essencial para o ecossistema DeFi.",
  "MATIC": "Polygon (MATIC) é uma solução de escalabilidade Layer 2 para Ethereum, oferecendo transações rápidas e baratas mantendo a segurança da rede principal.",
  "SHIB": "Shiba Inu é uma criptomoeda meme inspirada no Dogecoin, com um ecossistema que inclui DEX (ShibaSwap) e projetos de metaverso."
};

const generateChartData = (currentPrice: number, seedString: string) => {
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const data = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  let simulatedPrice = currentPrice * 0.75;
  
  for (let i = 0; i < 12; i++) {
    const randomShift = (Math.sin(seed + i * 1.5) * 0.15);
    simulatedPrice = simulatedPrice * (1 + randomShift);
    
    if (i === 11) simulatedPrice = currentPrice;

    data.push({
      name: months[i],
      price: Number(simulatedPrice.toFixed(2))
    });
  }
  return data;
};

/** Generates crypto-specific chart data with higher volatility */
const generateCryptoChartData = (currentPrice: number, seedString: string) => {
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const data = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Crypto starts with more variation — can swing 40-60% from current
  let simulatedPrice = currentPrice * (0.45 + (seed % 30) / 100);
  
  for (let i = 0; i < 12; i++) {
    // Higher volatility for crypto (up to 30% swings per month)
    const volatility = Math.sin(seed * 0.7 + i * 2.3) * 0.30;
    const trend = Math.cos(seed * 0.3 + i * 0.8) * 0.08;
    simulatedPrice = simulatedPrice * (1 + volatility + trend);
    
    // Prevent going to zero
    if (simulatedPrice < currentPrice * 0.1) simulatedPrice = currentPrice * 0.15;
    
    // Last month always reflects actual price
    if (i === 11) simulatedPrice = currentPrice;

    data.push({
      name: months[i],
      price: Number(simulatedPrice.toFixed(2))
    });
  }
  return data;
};

const generateDividends = (currentPrice: number, seedString: string) => {
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Simula um Dividend Yield anual entre 3% e 12%
  const yieldPct = 3 + (seed % 9); 
  const totalYearlyDividend = currentPrice * (yieldPct / 100);
  
  const today = new Date();
  const past1 = new Date(today.getFullYear(), today.getMonth() - 2, 15);
  const past2 = new Date(today.getFullYear(), today.getMonth() - 5, 20);
  const future = new Date(today.getFullYear(), today.getMonth() + 1, 10);

  return [
    { date: past2, type: 'Dividendo', value: (totalYearlyDividend * 0.4), status: 'Pago' },
    { date: past1, type: 'JCP', value: (totalYearlyDividend * 0.3), status: 'Pago' },
    { date: future, type: 'Projetado', value: (totalYearlyDividend * 0.3), status: 'A Receber' }
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
};

const calculateEarnedDividends = (inv: Investment) => {
  if (inv.category !== 'Ações/B3') return 0;
  
  const seed = inv.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const annualYield = 4 + (seed % 6); // Yield entre 4% e 9%
  const monthlyYield = annualYield / 12 / 100;
  
  let monthsDiff = 4; // Por padrão (para fins visuais), simulamos 4 meses de retenção inicial
  if (inv.created_at) {
    const createdDate = new Date(inv.created_at);
    const now = new Date();
    const diff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth()); // Get actual months
    // Se o usuário comprou a ação há mais tempo, usamos o tempo real:
    if (diff > 0) monthsDiff = diff;
  }
  
  return inv.invested_amount * monthlyYield * monthsDiff;
};

const InvestmentsManager: React.FC<Props> = ({ investments, onAdd, onDelete }) => {
 const [name, setName] = useState('');
 const [showSuggestions, setShowSuggestions] = useState(false);
 const [investedDisplay, setInvestedDisplay] = useState('');
 const [investedValue, setInvestedValue] = useState(0);
 const [currentDisplay, setCurrentDisplay] = useState('');
 const [currentValue, setCurrentValue] = useState(0);
 const [isFetchingPrice, setIsFetchingPrice] = useState(false);
 
 const [type, setType] = useState<'b3' | 'cripto' | 'fixa' | 'tesouro' | 'outros'>('b3');
 const [quantity, setQuantity] = useState('');
 const [averagePriceDisplay, setAveragePriceDisplay] = useState('');
 const [averagePriceValue, setAveragePriceValue] = useState(0);
 const [currentPriceValue, setCurrentPriceValue] = useState<number>(0);
  const [cdiRate, setCdiRate] = useState<string>('');
  const [monthsInvested, setMonthsInvested] = useState<string>('');
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<Investment | null>(null);
  const [showBalanceInfo, setShowBalanceInfo] = useState(false);

  const fetchAssetPrice = async (ticker: string) => {
    if (!ticker) return;
    setIsFetchingPrice(true);
    try {
      if (type === 'cripto') {
        const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${ticker}BRL`;
        const res = await fetch(binanceUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.price) {
            const price = parseFloat(data.price);
            setCurrentPriceValue(price);
            setCurrentValue(price);
            setCurrentDisplay(formatCurrency(price));
          }
        }
      } else {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.SA?interval=1d&range=1d`;
        const originRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`);
        if (originRes.ok) {
          const originData = await originRes.json();
          const data = JSON.parse(originData.contents);
          if (data.chart && data.chart.result && data.chart.result[0].meta.regularMarketPrice) {
            const price = data.chart.result[0].meta.regularMarketPrice;
            setCurrentPriceValue(price);
            setCurrentValue(price);
            setCurrentDisplay(formatCurrency(price));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar preço do ativo:", error);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Observa se as APIs falharam e aplica o mesmo algoritmo de fallback da A2Noticias
 useEffect(() => {
   if (!isFetchingPrice && currentPriceValue === 0 && name.length >= 3 && type === 'b3' && B3_ASSETS.includes(name)) {
     const ticker = name;
     const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     const fallbackPrice = (seed % 100) + 10.50;
     setCurrentPriceValue(fallbackPrice);
     setCurrentValue(fallbackPrice);
     setCurrentDisplay(formatCurrency(fallbackPrice));
   }
 }, [isFetchingPrice, currentPriceValue, name, type]);

 const formatCurrency = (val: number) => 
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

 const handleCurrencyInput = (val: string, setDisplay: (v: string) => void, setValue: (v: number) => void) => {
 const raw = val.replace(/\D/g, '');
 const num = parseFloat(raw) / 100;
 setValue(num);
 setDisplay(raw ? formatCurrency(num) : '');
 };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isFetchingPrice) {
    alert("Aguarde um instante enquanto buscamos a cotação atual...");
    return;
  }
 
  let finalInvested = investedValue;
  let finalCurrent = currentValue || investedValue;
  let finalName = name.toUpperCase();
 
  if (type === 'cripto') {
    if (investedValue <= 0) {
      alert("Preencha o VALOR INVESTIDO com um valor válido.");
      return;
    }
    
    let cp = currentPriceValue;
    if (!cp || cp <= 0 || isNaN(cp)) {
      alert("Não foi possível buscar a cotação atual. Selecione uma criptomoeda válida.");
      return;
    }
    
    finalInvested = investedValue;
    // Store price per unit in current_amount so we can calculate cotas later
    finalCurrent = cp;
  } else if (type === 'b3') {
    const qStr = String(quantity).replace(/[^0-9.,]/g, '').replace(',', '.');
    const q = Number(qStr);
    let pm = averagePriceValue;
    
    if (!q || q <= 0 || isNaN(q)) {
      alert("Preencha a QUANTIDADE com um valor válido.");
      return;
    }
    
    if (!pm || pm <= 0 || isNaN(pm)) pm = currentPriceValue;
    let cp = currentPriceValue;
    if (!cp || cp <= 0 || isNaN(cp)) cp = pm;
    
    if (pm <= 0) {
      alert("Não foi possível buscar a cotação atual automaticamente. Por favor, preencha o PREÇO MÉDIO para prosseguir.");
      return;
    }
 
    finalInvested = q * pm;
    finalCurrent = q * cp;
  } else {
    if (finalInvested <= 0) {
      alert("Preencha o VALOR APLICADO com um valor válido.");
      return;
    }
    
    if (type === 'fixa' || type === 'tesouro') {
      const cdi = Number(cdiRate);
      const m = Number(monthsInvested);
      if (cdi > 0) {
        finalName = `${finalName} (${cdi}% CDI)`;
        if (m > 0 && (!currentValue || currentValue === investedValue)) {
          const monthlyYield = 0.00825 * (cdi / 100);
          finalCurrent = finalInvested * Math.pow(1 + monthlyYield, m);
        }
      }
    }
  }
 
  if (!name) {
    alert("Preencha o Nome do Ativo.");
    return;
  }
 
  let categoryName = "Ações/B3";
  if (type === 'cripto') categoryName = "Criptomoedas";
  else if (type === 'fixa') categoryName = "CDB / LCI / LCA";
  else if (type === 'tesouro') categoryName = "Tesouro Direto";
  else if (type === 'outros') categoryName = "Outros";
 
  onAdd({ 
    name: finalName,
    category: categoryName,
    invested_amount: finalInvested, 
    current_amount: finalCurrent 
  });
  
  setName(''); setInvestedDisplay(''); setCurrentDisplay('');
  setInvestedValue(0); setCurrentValue(0);
  setQuantity(''); setAveragePriceDisplay(''); setAveragePriceValue(0); setCurrentPriceValue(0);
  setCdiRate(''); setMonthsInvested('');
  setShowSuggestions(false);
  };

  const filteredAssets = type === 'cripto' 
    ? CRYPTO_ASSETS.filter(a => a.includes(name.toUpperCase()))
    : B3_ASSETS.filter(a => a.includes(name.toUpperCase()));

  const totalInvested = investments.reduce((acc, inv) => acc + inv.invested_amount, 0);
  const totalCurrent = investments.reduce((acc, inv) => {
    if (inv.category === 'Criptomoedas') return acc + inv.invested_amount;
    return acc + inv.current_amount;
  }, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : '0.00';
  const isTotalPositive = totalProfit >= 0;

  const CATEGORY_IDEALS: Record<string, number> = {
    "Ações/B3": 30,
    "CDB / LCI / LCA": 25,
    "Tesouro Direto": 25,
    "Criptomoedas": 10,
    "Outros": 10
  };

  const CATEGORY_COLORS: Record<string, string> = {
    "Ações/B3": "#3b82f6",       // Blue
    "CDB / LCI / LCA": "#10b981",  // Emerald
    "Tesouro Direto": "#eab308",  // Yellow
    "Criptomoedas": "#f97316",    // Orange
    "Outros": "#8b5cf6"          // Purple
  };

  const categoryRealValues = investments.reduce((acc, inv) => {
    const cat = inv.category || 'Outros';
    const val = inv.category === 'Criptomoedas' ? inv.invested_amount : inv.current_amount;
    acc[cat] = (acc[cat] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const realPieData = Object.entries(CATEGORY_IDEALS).map(([cat, idealPct]) => {
    const val = categoryRealValues[cat] || 0;
    return {
      name: cat,
      value: val,
      percentage: totalCurrent > 0 ? (val / totalCurrent) * 100 : 0,
      color: CATEGORY_COLORS[cat]
    };
  }).filter(item => item.value > 0);

  const idealPieData = Object.entries(CATEGORY_IDEALS).map(([cat, idealPct]) => {
    return {
      name: cat,
      value: idealPct,
      percentage: idealPct,
      color: CATEGORY_COLORS[cat]
    };
  });

  const historyData = (() => {
    const data = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const diff = totalCurrent - totalInvested;
    for (let i = 0; i < 6; i++) {
      const progress = i / 5;
      const value = totalInvested + (diff * progress) + (Math.sin(i) * totalInvested * 0.02);
      data.push({ name: months[i], Patrimônio: Number(value.toFixed(2)) });
    }
    return data;
  })();

  return (
   <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 p-2 gap-3 overflow-hidden">
     {/* VISÃO GERAL COMPLETA (Índices + Gráficos) */}
     <div className="flex flex-col xl:flex-row gap-4 shrink-0">
       
       {/* Bloco 1: Patrimônio Total (Esquerda) */}
        <div className="relative p-5 rounded-3xl overflow-hidden xl:w-[35%] flex flex-col justify-between"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-15 ${isTotalPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="font-black uppercase text-sm tracking-widest" style={{ color: 'var(--text-primary)' }}>Patrimônio Total</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>Sua Carteira</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black ${isTotalPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {isTotalPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {isTotalPositive ? '+' : ''}{totalPercent}%
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalCurrent)}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Investido:</span>
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalInvested)}</span>
            </div>

            <div className="mt-6 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--bg-border)' }}>
               <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Lucro / Prejuízo</p>
               <p className={`text-lg font-black ${isTotalPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {isTotalPositive ? '+' : ''}{formatCurrency(totalProfit)}
               </p>
            </div>
          </div>
        </div>

       {/* Bloco 2 & 3: Gráficos (Centro e Direita) */}
        {investments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Gráfico de Rosca (Real vs. Ideal) */}
            <div className="relative border rounded-3xl p-4 shadow-xl flex flex-col justify-between min-h-[300px] xl:h-auto"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-blue-500"></div>
              </div>

              <div className="flex items-center gap-2 mb-4 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Composição da Carteira (Real vs. Ideal)</h3>
                <button 
                  onClick={() => setShowBalanceInfo(true)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-slate-500 hover:bg-brand-orange hover:text-white transition-all shadow-sm cursor-pointer ml-auto shrink-0"
                  style={{ background: 'var(--bg-surface)' }}
                  title="O que é uma carteira equilibrada?"
                >
                  <Info size={12} />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-around items-center gap-4 flex-1 mb-6">
                {/* Gráfico Real */}
                <div className="flex flex-col items-center gap-2 relative w-[130px] h-[130px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={realPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={55} stroke="none" dataKey="value" paddingAngle={2}>
                        {realPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatCurrency(val as number)} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real</span>
                    <span className="text-[10px] font-black mt-0.5 truncate max-w-[90px]" style={{ color: 'var(--text-primary)' }}>
                      {totalCurrent >= 1000000 ? `${(totalCurrent/1000000).toFixed(1)}M` : totalCurrent >= 1000 ? `${(totalCurrent/1000).toFixed(0)}k` : totalCurrent.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Gráfico Ideal */}
                <div className="flex flex-col items-center gap-2 relative w-[130px] h-[130px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={idealPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={55} stroke="none" dataKey="value" paddingAngle={2}>
                        {idealPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => typeof val === 'number' ? `${val}%` : val} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ideal</span>
                    <span className="text-[10px] font-black text-emerald-500 mt-0.5">100%</span>
                  </div>
                </div>
              </div>

              {/* Legenda dos Investimentos por Categoria */}
              <div className="pt-4 space-y-3" style={{ borderTop: '1px solid var(--bg-border)' }}>
                {Object.entries(CATEGORY_IDEALS).map(([cat, idealPct]) => {
                  const realVal = categoryRealValues[cat] || 0;
                  const realPct = totalCurrent > 0 ? (realVal / totalCurrent) * 100 : 0;
                  const catInvestments = investments.filter(inv => (inv.category || 'Outros') === cat);
                  const color = CATEGORY_COLORS[cat];

                  let statusText = 'Em Linha';
                  let statusColorClass = 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5';
                  if (realVal === 0) {
                    statusText = 'Falta Investir';
                    statusColorClass = 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5';
                  } else if (realPct < idealPct - 2.5) {
                    statusText = 'Abaixo';
                    statusColorClass = 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5';
                  } else if (realPct > idealPct + 2.5) {
                    statusText = 'Acima';
                    statusColorClass = 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5';
                  }

                  return (
                    <div key={cat} className="flex flex-col gap-1 text-[11px] leading-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                          <span className="font-black" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span>Real: <strong style={{ color: 'var(--text-primary)' }}>{realPct.toFixed(1)}%</strong></span>
                          <span>/</span>
                          <span>Ideal: <strong style={{ color: 'var(--text-primary)' }}>{idealPct}%</strong></span>
                          <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${statusColorClass} ml-1`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lista de Ativos sob a categoria */}
                      {catInvestments.length > 0 ? (
                        <div className="pl-4 text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          Ativos: {catInvestments.map(inv => {
                            const invVal = inv.category === 'Criptomoedas' ? inv.invested_amount : inv.current_amount;
                            const invPct = totalCurrent > 0 ? (invVal / totalCurrent) * 100 : 0;
                            return `${inv.name} (${invPct.toFixed(1)}%)`;
                          }).join(', ')}
                        </div>
                      ) : (
                        <div className="pl-4 text-[9px] font-medium italic" style={{ color: 'var(--text-subtle)' }}>
                          Nenhum ativo cadastrado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

           {/* Gráfico de Linha */}
           <div className="relative border rounded-3xl p-4 shadow-xl flex flex-col justify-between h-[220px] xl:h-auto"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)', boxShadow: 'var(--shadow-card)' }}>
             <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
               <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-brand-orange"></div>
             </div>
             
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 relative z-10">Evolução Total (Simulada)</h3>
             <div className="flex-1 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={historyData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} dy={10} />
                   <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                   <RechartsTooltip formatter={(val: any) => formatCurrency(val as number)} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
                   <Line type="monotone" dataKey="Patrimônio" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', stroke: '#f97316', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f97316' }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>
         </div>
       ) : (
         <div className="flex-1 border border-dashed rounded-3xl p-5 shadow-inner flex items-center justify-center"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)' }}>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Adicione ativos para visualizar a composição</p>
         </div>
       )}
     </div>

     {/* FORMULÁRIO */}
    <div className="p-3 rounded-[1.25rem] border shadow-xl shrink-0"
       style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)' }}>
       <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-2">
         
         <div className="relative">
            <select 
              className="w-full lg:w-40 bg-slate-50 dark:bg-[#1A1C23] px-4 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white transition-all focus:ring-2 focus:ring-brand-orange/50 appearance-none uppercase"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="b3">Ações/FIIs (B3)</option>
              <option value="cripto">Criptomoedas</option>
              <option value="fixa">CDB/LCI/LCA</option>
              <option value="tesouro">Tesouro Direto</option>
              <option value="outros">Outros</option>
            </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             ▼
           </div>
         </div>

          <div className="relative flex-[2] w-full">
            <input 
              type="text" placeholder={type === 'b3' ? "NOME DO ATIVO (EX: PETR4)" : type === 'cripto' ? "NOME (EX: BTC)" : "NOME DO ATIVO"}
              className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 uppercase transition-all focus:ring-2 focus:ring-brand-orange/50"
             value={name} 
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setName(val);
                setShowSuggestions(true);
                if (type === 'b3' && B3_ASSETS.includes(val)) fetchAssetPrice(val);
                if (type === 'cripto' && CRYPTO_ASSETS.includes(val)) fetchAssetPrice(val);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (type === 'b3' || type === 'cripto') && (
             <div className="absolute left-0 top-full mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-[#1A1C23] border border-slate-100 dark:border-white/10 shadow-2xl z-50 rounded-2xl p-2 custom-scrollbar">
               {filteredAssets.length > 0 ? (
                 filteredAssets.map(asset => (
                   <div
                     key={asset}
                     className="px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-brand-orange/10 hover:text-brand-orange cursor-pointer rounded-xl uppercase transition-colors"
                     onClick={() => {
                       setName(asset);
                       setShowSuggestions(false);
                       fetchAssetPrice(asset);
                     }}
                   >
                     {asset}
                   </div>
                 ))
               ) : (
                 <div className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nenhum ativo encontrado</div>
               )}
             </div>
           )}
         </div>

          {type === 'cripto' ? (
             <>
              <div className="flex-[2] w-full relative">
                <input 
                  type="text" placeholder="VALOR INVESTIDO (R$)"
                  className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                  value={investedDisplay} onChange={(e) => handleCurrencyInput(e.target.value, setInvestedDisplay, setInvestedValue)}
                />
              </div>
              
              <div className="flex-1 w-full relative">
                <input 
                  type="text" placeholder="COTAÇÃO AO VIVO" disabled
                  className="w-full bg-slate-50/50 dark:bg-[#1A1C23]/50 px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-500 transition-all cursor-not-allowed"
                  value={currentDisplay ? `ATUAL: ${currentDisplay}` : 'ATUAL: ---'}
                />
                {isFetchingPrice && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full relative hidden md:block">
                <input 
                  type="text" placeholder="COTAS CALCULADAS" disabled
                  className="w-full bg-emerald-500/10 px-6 py-4 rounded-2xl outline-none text-xs font-black text-emerald-600 placeholder:text-emerald-600/50 transition-all cursor-not-allowed"
                  value={(() => {
                    if (investedValue > 0 && currentPriceValue > 0) {
                      const cotas = investedValue / currentPriceValue;
                      return `≈ ${cotas.toFixed(8)} ${name.toUpperCase() || 'COTAS'}`;
                    }
                    return '';
                  })()}
                />
              </div>
            </>
          ) : type === 'b3' ? (
             <>
              <div className="flex-1 w-full relative">
                <input 
                  type="text" placeholder="QUANTIDADE"
                  className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                  value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="flex-1 w-full relative">
                <input 
                  type="text" placeholder="PREÇO MÉDIO (R$)"
                  className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                  value={averagePriceDisplay} onChange={(e) => handleCurrencyInput(e.target.value, setAveragePriceDisplay, setAveragePriceValue)}
                />
              </div>
              
              <div className="flex-1 w-full relative hidden md:block">
                <input 
                  type="text" placeholder="COTAÇÃO AO VIVO" disabled
                  className="w-full bg-slate-50/50 dark:bg-[#1A1C23]/50 px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-500 transition-all cursor-not-allowed"
                  value={currentDisplay ? `ATUAL: ${currentDisplay}` : 'ATUAL: ---'}
                />
                {isFetchingPrice && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full relative hidden md:block">
                <input 
                  type="text" placeholder="TOTAL" disabled
                  className="w-full bg-emerald-500/10 px-6 py-4 rounded-2xl outline-none text-xs font-black text-emerald-600 placeholder:text-emerald-600/50 transition-all cursor-not-allowed"
                  value={(() => {
                    const q = Number(quantity.replace(/[^0-9]/g, ''));
                    const priceToUse = averagePriceValue > 0 ? averagePriceValue : currentPriceValue;
                    return (q > 0 && priceToUse > 0) ? `TOTAL: ${formatCurrency(q * priceToUse)}` : '';
                  })()}
                />
              </div>
            </>
         ) : (
           <>
              <div className="flex-[2] w-full relative">
                <input 
                  type="text" placeholder="VALOR APLICADO (R$)"
                  className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                  value={investedDisplay} onChange={(e) => handleCurrencyInput(e.target.value, setInvestedDisplay, setInvestedValue)}
                />
              </div>
              
              {(type === 'fixa' || type === 'tesouro') && (
                <>
                  <div className="flex-1 w-full relative">
                    <input 
                      type="text" placeholder="TAXA (% CDI)"
                      className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                      value={cdiRate} onChange={(e) => setCdiRate(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                  <div className="flex-1 w-full relative">
                    <input 
                      type="text" placeholder="MESES REND."
                      className="w-full bg-slate-50 dark:bg-[#1A1C23] px-6 py-4 rounded-2xl outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50"
                      value={monthsInvested} onChange={(e) => setMonthsInvested(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </>
              )}

              <div className="flex-[2] w-full relative hidden md:block">
                <input 
                  type="text" placeholder={monthsInvested && cdiRate ? "VALOR ATUAL (AUTO)" : "VALOR ATUAL (R$)"}
                  disabled={!!(monthsInvested && cdiRate)}
                  className={`w-full ${monthsInvested && cdiRate ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-50 dark:bg-[#1A1C23] text-slate-900 dark:text-white'} px-6 py-4 rounded-2xl outline-none text-xs font-black placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-brand-orange/50`}
                  value={
                    (monthsInvested && cdiRate)
                     ? formatCurrency(investedValue * Math.pow(1 + (0.00825 * (Number(cdiRate) / 100)), Number(monthsInvested))) 
                     : currentDisplay
                  } 
                  onChange={(e) => !(monthsInvested && cdiRate) && handleCurrencyInput(e.target.value, setCurrentDisplay, setCurrentValue)}
                />
              </div>
           </>
         )}

         <button type="submit" className="w-full lg:w-16 h-14 rounded-2xl flex items-center justify-center bg-brand-orange text-white transition-all active:scale-95 shrink-0 hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/25">
           <Plus size={24} />
         </button>
       </form>
    </div>

    {/* LISTA DE ATIVOS (Ranking/Cotações) */}
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
      <div className="flex items-center gap-2 mb-2 px-2">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Cotações da sua Carteira</h3>
      </div>
      
      {investments.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600">
            <Wallet size={32} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sua carteira está vazia</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {investments.map(inv => {
            const profit = inv.current_amount - inv.invested_amount;
            const isPositive = profit >= 0;
            const percent = inv.invested_amount > 0 ? ((profit / inv.invested_amount) * 100).toFixed(2) : 0;
            const earnedDividends = calculateEarnedDividends(inv);
            const displayName = inv.name || (inv as any).description || (inv as any).title || "ATIVO";
            const initial = displayName.substring(0, 2).toUpperCase();
            
            return (
              <div
                key={inv.id}
                onClick={() => setSelectedAssetDetails(inv)}
                className="border rounded-2xl p-3 flex flex-col justify-between group hover:border-brand-orange/50 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl min-h-[150px]"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-border)' }}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-xs font-black shadow-inner ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {initial}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
 
                <div className="mt-3 relative z-10">
                  <h4 className="font-black text-base uppercase tracking-tight line-clamp-1" style={{ color: 'var(--text-primary)' }}>{displayName}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>{inv.category}</p>
                </div>

                <div className="mt-auto pt-3 space-y-1.5 relative z-10">
                  <div>
                    <p className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">
                      {inv.category === 'Criptomoedas' 
                        ? formatCurrency(inv.invested_amount)
                        : formatCurrency(inv.current_amount)
                      }
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-[9px] font-black flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp size={10}/> : <ArrowDownRight size={10}/>}
                        {percent}%
                      </p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate ml-2">
                        {inv.category === 'Criptomoedas' 
                          ? `1 ${displayName}: ${formatCurrency(inv.current_amount)}`
                          : `PM: ${formatCurrency(inv.invested_amount)}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {inv.category === 'Ações/B3' ? (
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Wallet size={10}/> Div.
                      </p>
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(earnedDividends)}
                      </p>
                    </div>
                  ) : inv.category === 'Criptomoedas' ? (
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp size={10}/> Cotas
                      </p>
                      <p className="text-[11px] font-black text-cyan-600 dark:text-cyan-400">
                        {(() => {
                          // For crypto: invested_amount = total BRL, current_amount = price per unit
                          // cotas = invested_amount / current_amount
                          if (inv.invested_amount > 0 && inv.current_amount > 0) {
                            const cotas = inv.invested_amount / inv.current_amount;
                            return `≈ ${cotas < 0.001 ? cotas.toFixed(8) : cotas < 1 ? cotas.toFixed(6) : cotas.toFixed(4)} ${displayName}`;
                          }
                          return '---';
                        })()}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-transparent flex justify-between items-center">
                      <p className="text-[9px] text-transparent">.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* ASSET DETAILS MODAL */}
    {selectedAssetDetails && (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
          
          <button 
            onClick={() => setSelectedAssetDetails(null)}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 rotate-12 pointer-events-none">
              <TrendingUp size={120} />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner bg-brand-orange/10 text-brand-orange">
                {(selectedAssetDetails.name || selectedAssetDetails.category).substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {selectedAssetDetails.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {selectedAssetDetails.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-slate-50 dark:bg-[#1A1C23] px-4 py-3 rounded-2xl flex-1 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{selectedAssetDetails.category === 'Criptomoedas' ? 'Valor Investido' : 'Cotação Atual'}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedAssetDetails.category === 'Criptomoedas'
                    ? formatCurrency(selectedAssetDetails.invested_amount)
                    : formatCurrency(selectedAssetDetails.current_amount)
                  }
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1A1C23] px-4 py-3 rounded-2xl flex-1 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{selectedAssetDetails.category === 'Criptomoedas' ? 'Preço Unitário' : 'Seu Preço Médio'}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedAssetDetails.category === 'Criptomoedas'
                    ? formatCurrency(selectedAssetDetails.current_amount)
                    : formatCurrency(selectedAssetDetails.invested_amount)
                  }
                </p>
              </div>
              {selectedAssetDetails.category === 'Criptomoedas' && (
                <div className="bg-cyan-500/10 px-4 py-3 rounded-2xl flex-1 min-w-[120px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Suas Cotas</p>
                  <p className="text-lg font-black text-cyan-400 mt-0.5">
                    {selectedAssetDetails.invested_amount > 0 && selectedAssetDetails.current_amount > 0
                      ? (() => {
                          const cotas = selectedAssetDetails.invested_amount / selectedAssetDetails.current_amount;
                          return `≈ ${cotas < 0.001 ? cotas.toFixed(8) : cotas < 1 ? cotas.toFixed(6) : cotas.toFixed(4)}`;
                        })()
                      : '---'
                    }
                  </p>
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl flex-1 min-w-[120px] ${selectedAssetDetails.current_amount >= selectedAssetDetails.invested_amount ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Rentabilidade</p>
                <p className="text-lg font-black mt-0.5 flex items-center gap-1">
                  {selectedAssetDetails.current_amount >= selectedAssetDetails.invested_amount ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  {(((selectedAssetDetails.current_amount - selectedAssetDetails.invested_amount) / selectedAssetDetails.invested_amount) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            {/* Chart Area */}
            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp size={14} /> {selectedAssetDetails.category === 'Criptomoedas' ? `Evolução ${selectedAssetDetails.name} (1 Ano)` : 'Evolução (1 Ano)'}
              </h3>
              <div className="h-[200px] w-full">
                {(() => {
                  const isCrypto = selectedAssetDetails.category === 'Criptomoedas';
                  const chartColor = isCrypto ? '#06b6d4' : '#f97316';
                  const gradientId = isCrypto ? 'colorCrypto' : 'colorPrice';
                  const priceForChart = isCrypto
                    ? selectedAssetDetails.current_amount
                    : selectedAssetDetails.current_amount;
                  const chartData = isCrypto
                    ? generateCryptoChartData(priceForChart, selectedAssetDetails.name)
                    : generateChartData(priceForChart, selectedAssetDetails.name);
                  
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          itemStyle={{ color: chartColor }}
                          formatter={(value: any) => [formatCurrency(value as number), isCrypto ? `Preço ${selectedAssetDetails.name}` : 'Cotação']}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={3} fillOpacity={1} fill={`url(#${gradientId})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>

            {/* Histórico de Dividendos (only for stocks) / Crypto Info */}
            {selectedAssetDetails.category === 'Criptomoedas' ? (
              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Wallet size={14} /> Detalhes da Posição
                </h3>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner bg-cyan-500/10 text-cyan-500">QTD</div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Quantidade de Cotas</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Frações adquiridas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-cyan-500">
                        {selectedAssetDetails.invested_amount > 0 && selectedAssetDetails.current_amount > 0
                          ? (() => {
                              const cotas = selectedAssetDetails.invested_amount / selectedAssetDetails.current_amount;
                              return `≈ ${cotas < 0.001 ? cotas.toFixed(8) : cotas < 1 ? cotas.toFixed(6) : cotas.toFixed(4)} ${selectedAssetDetails.name}`;
                            })()
                          : '---'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner bg-brand-orange/10 text-brand-orange">R$</div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Preço de Compra</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Preço unitário na aquisição</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(selectedAssetDetails.current_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner bg-emerald-500/10 text-emerald-500">INV</div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Valor Investido</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total aplicado em {selectedAssetDetails.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">{formatCurrency(selectedAssetDetails.invested_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Wallet size={14} /> Proventos e Dividendos (Últimos 12 Meses)
                </h3>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl space-y-3">
                  {generateDividends(selectedAssetDetails.current_amount, selectedAssetDetails.name).map((div, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-slate-100 dark:border-white/5 shadow-sm hover:border-brand-orange/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner ${div.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-orange/10 text-brand-orange'}`}>
                          {div.type.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{div.type}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{div.date.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(div.value)} / cota</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${div.status === 'Pago' ? 'text-emerald-500' : 'text-brand-orange'}`}>
                          {div.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo da Empresa / Sobre o Ativo */}
            <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Info size={14} /> {selectedAssetDetails.category === 'Criptomoedas' ? 'Sobre a Criptomoeda' : 'Sobre o Ativo'}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedAssetDetails.category === 'Criptomoedas'
                  ? (CRYPTO_SUMMARIES[selectedAssetDetails.name] || `${selectedAssetDetails.name} é uma criptomoeda presente na sua carteira digital. Criptomoedas são ativos digitais descentralizados baseados em tecnologia blockchain.`)
                  : (ASSET_SUMMARIES[selectedAssetDetails.name] || 'Um ativo financeiro presente na sua carteira. Esta empresa ou fundo de investimento representa uma fração do capital alocado na B3 (Bolsa de Valores do Brasil).')
                }
              </p>
            </div>
            
          </div>
        </div>
      </div>
    )}

    {/* MODAL DE BALANCEAMENTO E INFORMAÇÕES */}
    {showBalanceInfo && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer" onClick={() => setShowBalanceInfo(false)}></div>
        
        <div className="relative w-full max-w-md bg-white dark:bg-[#12141A] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-orange/20 to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="p-6 sm:p-8 relative z-10">
            <button 
              onClick={() => setShowBalanceInfo(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5">
              <TrendingUp size={24} />
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Carteira Equilibrada</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              O segredo dos grandes investidores não é acertar qual ativo vai subir mais, mas sim ter uma carteira bem balanceada. O balanceamento <strong className="text-slate-700 dark:text-slate-300">reduz riscos</strong> e aumenta a <strong className="text-slate-700 dark:text-slate-300">consistência dos seus ganhos</strong> no longo prazo.
            </p>

            <div className="bg-slate-50 dark:bg-[#1A1C23] p-5 rounded-2xl border border-slate-100 dark:border-white/5 mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Wallet size={12} /> Divisão Ideal Sugerida
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></span>Ações / FIIs</div>
                  <span className="font-black text-slate-900 dark:text-white">30%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }}></span>CDB / LCI / LCA</div>
                  <span className="font-black text-slate-900 dark:text-white">25%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#eab308" }}></span>Tesouro Direto</div>
                  <span className="font-black text-slate-900 dark:text-white">25%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f97316" }}></span>Criptomoedas</div>
                  <span className="font-black text-slate-900 dark:text-white">10%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8b5cf6" }}></span>Outros / Caixa</div>
                  <span className="font-black text-slate-900 dark:text-white">10%</span>
                </div>
              </div>
            </div>

            <div className="bg-brand-orange/5 border border-brand-orange/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2 relative z-10">
                Como fazer na prática?
              </h3>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed relative z-10">
                Se uma categoria estiver <span className="text-amber-500 font-bold uppercase tracking-widest text-[9px] mx-0.5">Abaixo</span>, foque seus novos aportes nela. Evite comprar ativos de categorias que já estão <span className="text-rose-500 font-bold uppercase tracking-widest text-[9px] mx-0.5">Acima</span>. <br/><br/>Você <strong className="text-slate-900 dark:text-white">não precisa vender</strong> o que rendeu muito, apenas direcione o dinheiro novo para o que ficou para trás!
              </p>
            </div>
            
            <button 
              onClick={() => setShowBalanceInfo(false)}
              className="w-full mt-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
 );
};

export default InvestmentsManager;


