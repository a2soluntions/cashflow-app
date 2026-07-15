import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabase';
 import { 
  Lock, Plus, Copy, RefreshCw, Trash2, ShieldCheck, 
  TrendingUp, DollarSign, Users, Calendar, Filter, Monitor,
  Newspaper, Save, Image as ImageIcon, Upload, Loader2, Brain, Zap, Clock,
  MessageCircle, AlertTriangle, CheckCircle2, Globe, ChevronDown, ChevronUp
 } from 'lucide-react';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
 AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const CORES_FUNIL = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC<{ theme?: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange' }> = ({ theme }) => {
  const isLight = theme === 'white' || theme === 'white-orange';
  const [activeTab, setActiveTab] = useState<'vendas' | 'dados' | 'a2noticias' | 'publicidade' | 'ads_mapa'>('vendas');
  const [licenses, setLicenses] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [adsPerPage, setAdsPerPage] = useState(10);
  const [selectedMapSlot, setSelectedMapSlot] = useState<string | null>(null);
  const [adFormName, setAdFormName] = useState('');
  const [adFormPhone, setAdFormPhone] = useState('');
  const [adFormImage, setAdFormImage] = useState('');
  const [adFormLink, setAdFormLink] = useState('');
  // FORMULÁRIO LICENÇAS
  const [clientName, setClientName] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [origin, setOrigin] = useState('Indicação');
  const [productType, setProductType] = useState('SaaS'); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; title: string; message: string; type: 'info' | 'error' | 'confirm'; onConfirm?: () => void } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- COMPONENTE DE ALERTA CUSTOMIZADO ---
  const showAlert = (title: string, message: string, type: 'info' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ show: true, title, message, type, onConfirm });
  };

  const CustomAlert = () => {
    if (!alertConfig?.show) return null;
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className={`w-full max-w-sm ${isLight ? 'bg-white' : 'bg-white/5 backdrop-blur-3xl'} border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300`}>
          <h4 className={"font-black uppercase tracking-widest text-[10px] mb-2 " + (alertConfig.type === 'error' ? 'text-rose-500' : 'text-emerald-500')}>{alertConfig.title}</h4>
          <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">{alertConfig.message}</p>
          
          <div className="flex gap-3">
            {alertConfig.type === 'confirm' && (
              <button 
                onClick={() => setAlertConfig(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={() => {
                if (alertConfig.onConfirm) alertConfig.onConfirm();
                setAlertConfig(null);
              }}
              className={"flex-1 py-3 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg " +
                (alertConfig.type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20')
              }
            >
              {alertConfig.type === 'confirm' ? 'Confirmar' : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // IMAGEM CARROSSEL
  const [newsImg, setNewsImg] = useState('');
  const [indicators, setIndicators] = useState<any>({
    SELIC: { value: '', symbol: '%' },
    IPCA: { value: '', symbol: '%' },
    INPC: { value: '', symbol: '%' },
    DÓLAR: { value: '', symbol: 'R$' },
    BITCOIN: { value: '', symbol: 'R$' }
  });
  const [corpName, setCorpName] = useState('');
  const [corpCnpj, setCorpCnpj] = useState('');
  const [corpAddress, setCorpAddress] = useState('');
  const [corpPhone, setCorpPhone] = useState('');

  // FORMULÁRIO MANUAL HQ (A2 Notícias)
  const [hqTitle, setHqTitle] = useState('');
  const [hqResume, setHqResume] = useState('');
  const [hqPov, setHqPov] = useState('');
  const [hqSource, setHqSource] = useState('');
  const [hqCategory, setHqCategory] = useState('Mercado');
  const [hqRawText, setHqRawText] = useState('');
  const [hqImagePrompt, setHqImagePrompt] = useState('');
  const [hqExternalUrl, setHqExternalUrl] = useState('');

  // NOVOS ESTADOS VITTANEWS HQ
  const [summaryCharLimit, setSummaryCharLimit] = useState<number>(300);
  const [includeVittaPov, setIncludeVittaPov] = useState<boolean>(true);
  const [resumeOffset, setResumeOffset] = useState<number>(0);
  const [pendingAdSlot, setPendingAdSlot] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: licData } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
    if (licData) setLicenses(licData);

    const { data: contData } = await supabase.from('site_content').select('*').order('created_at', { ascending: false });
    if (contData) {
      setSiteContent(contData);
      const newInds = { ...indicators };
      contData.filter(c => c.content_type === 'indicator').forEach(ind => {
        if (newInds[ind.title]) {
          newInds[ind.title].value = ind.meta_value?.value || '';
          newInds[ind.title].symbol = ind.meta_value?.symbol || '%';
        }
      });
      setIndicators(newInds);

      const corp = contData.find(c => c.content_type === 'corporate_data');
      if (corp) {
        setCorpName(corp.title || '');
        setCorpCnpj(corp.meta_value?.cnpj || '');
        setCorpPhone(corp.meta_value?.phone || '');
        setCorpAddress(corp.description || '');
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalRevenue = licenses.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalClients = licenses.length;
    const averageTicket = totalClients > 0 ? totalRevenue / totalClients : 0;
    const ltv = averageTicket * 12;

    const activeClients = licenses.filter(l => l.status === 'active');
    const inactiveClients = licenses.filter(l => l.status !== 'active');
    const churnRate = totalClients > 0 ? (inactiveClients.length / totalClients) * 100 : 0;

    // MRR: somente SaaS ativos (recorrentes) — exclui Publicidade e Desktop
    const saasActive = activeClients.filter(l => l.product_type === 'SaaS');
    const mrr = saasActive.reduce((acc, curr) => acc + (curr.price || 0), 0);

    // Receita de Publicidade (não entra no MRR)
    const adSales = licenses.filter(l => l.product_type === 'Publicidade');
    const adRevenue = adSales.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const adRevenueThisMonth = adSales
      .filter(l => new Date(l.created_at) >= thisMonthStart)
      .reduce((acc, curr) => acc + (curr.price || 0), 0);

    const revenueThisMonth = licenses
      .filter(l => new Date(l.created_at) >= thisMonthStart)
      .reduce((acc, curr) => acc + (curr.price || 0), 0);
    const revenueLastMonth = licenses
      .filter(l => new Date(l.created_at) >= lastMonthStart && new Date(l.created_at) < thisMonthStart)
      .reduce((acc, curr) => acc + (curr.price || 0), 0);
    const mrrGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

    // Clientes em risco: trial (preço 0) ou gratuito há mais de 5 dias
    const atRisk = licenses.filter(l => {
      const daysSince = (now.getTime() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return (l.price === 0 || l.status === 'trial') && daysSince > 5;
    });

    // Funil de planos por faixa de preço
    const plans = {
      trial: licenses.filter(l => l.price === 0 || l.status === 'trial').length,
      basico: licenses.filter(l => l.price > 0 && l.price <= 25).length,
      premium: licenses.filter(l => l.price > 25 && l.price < 200).length,
      desktop: licenses.filter(l => l.product_type === 'Desktop' || l.price >= 200).length,
    };

    // Distribuição por origem
    const originsMap: Record<string, number> = {};
    licenses.forEach(l => { originsMap[l.origin || 'Direto'] = (originsMap[l.origin || 'Direto'] || 0) + 1; });
    const originData = Object.entries(originsMap).map(([name, value]) => ({ name, value }));

    // Timeline para gráfico
    const timelineData = licenses.slice(0, 12).reverse().map(l => ({
      name: new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: l.price,
      mes: new Date(l.created_at).toLocaleDateString('pt-BR', { month: 'short' }),
    }));

    // Insights automáticos por regras de negócio
    const insights: { type: 'danger' | 'warning' | 'info'; title: string; action: string }[] = [];
    if (churnRate > 20) insights.push({ type: 'danger', title: `Churn em ${churnRate.toFixed(1)}%`, action: 'Ativar campanha de re-engajamento via WhatsApp. Ofereça 1 mês grátis para reativar clientes inativos.' });
    if (plans.trial > (plans.basico + plans.premium)) insights.push({ type: 'warning', title: 'Maioria ainda em Trial', action: 'Enviar email de conversão no D+3. Simplificar o onboarding para reduzir o tempo até o primeiro valor percebido.' });
    if (mrrGrowth < 0) insights.push({ type: 'danger', title: `MRR caindo ${Math.abs(mrrGrowth).toFixed(1)}%`, action: 'Revisar precificação. Ativar downgrade para Básico como barreira de saída antes do churn total.' });
    if (plans.premium < Math.floor(plans.basico * 0.3) && plans.basico > 0) insights.push({ type: 'info', title: 'Baixa conversão Básico → Premium', action: 'Criar campanha de upsell focando em IA Advisor + Quita-Dívidas. Oferecer trial de 7 dias do Premium para usuários Básicos.' });
    if (atRisk.length > 2) insights.push({ type: 'warning', title: `${atRisk.length} clientes em risco de churn`, action: 'Contato direto via WhatsApp com script personalizado de recuperação (ver scripts abaixo).' });
    if (insights.length === 0) insights.push({ type: 'info', title: 'Base saudável', action: 'Continue monitorando. Foco em upsell: migrar usuários Básicos para Premium.' });

    return { totalRevenue, totalClients, averageTicket, revenueThisMonth, revenueLastMonth, mrr, mrrGrowth, churnRate, activeClients, inactiveClients, atRisk, plans, originData, timelineData, ltv, insights, adRevenue, adRevenueThisMonth };
  }, [licenses]);


  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const priceNumber = parseFloat(saleValue.replace('R$', '').replace('.', '').replace(',', '.'));
    const newKey = "VITTA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const { error } = await supabase.from('licenses').insert([{ 
        key: newKey, 
        client_name: clientName, 
        status: 'active', 
        price: priceNumber || 0, 
        origin, 
        product_type: productType 
      }]);
      if (error) throw error;
      setClientName(''); setSaleValue(''); fetchData();
      showAlert("Licença Criada", "Chave Gerada: " + newKey, "info");
    } catch (err: any) { showAlert("Erro ao criar", err.message, "error"); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = Math.random().toString() + "." + fileExt;
      const filePath = "news-images/" + fileName;

      const { error: uploadError } = await supabase.storage
        .from('vitta-assets')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          throw new Error('O Bucket "vitta-assets" não foi encontrado no seu Storage do Supabase. Por favor, crie-o e marque como "Public".');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('vitta-assets')
        .getPublicUrl(filePath);

      if (pendingAdSlot) {
        setLoading(true);
        // Se pendingAdSlot contém um ID após o tipo (ex: "home_banner_left:id"), é um update
        const [type, id] = pendingAdSlot.split(':');
        
        const currentAd = id ? siteContent.find(c => c.id === id) : null;
        
        const { error: upsertError } = await supabase.from('site_content').upsert({
          id: id || undefined,
          content_type: type,
          title: currentAd?.title || type,
          image_url: data.publicUrl,
          is_active: true,
          meta_value: { external_url: currentAd?.meta_value?.external_url || '#' }
        });
        setLoading(false);
        setPendingAdSlot(null);
        if (upsertError) {
          showAlert("Erro ao Salvar", upsertError.message, "error");
        } else {
          fetchData();
          showAlert("Sucesso", "Imagem do carrossel atualizada!", "info");
        }
      } else {
        setNewsImg(data.publicUrl);
      }
    } catch (error: any) {
      showAlert('Erro no upload', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };



  const handleClearHq = () => {
    setHqTitle(''); setHqResume(''); setHqPov(''); setHqSource(''); setHqRawText(''); setNewsImg(''); setHqExternalUrl(''); setResumeOffset(0);
  };

  const handleHqPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let formattedDescription = hqResume;
      if (includeVittaPov && hqPov.trim() !== '') {
        formattedDescription += `\n\n**A2 Insights:**\n${hqPov}\n\nQuer organizar suas finanças na palma da mão e sem interrupções? Conheça nosso aplicativo gratuito.`;
      }
      formattedDescription += `\n\nInformações originais baseadas na reportagem de ${hqSource}`;
      
      const { error } = await supabase.from('site_content').insert([{ 
        content_type: 'news', 
        title: hqTitle, 
        description: formattedDescription, 
        image_url: newsImg, 
        is_active: true,
        meta_value: { 
          category: hqCategory,
          external_url: hqExternalUrl 
        }
      }]);
      if (error) throw error;
      
      handleClearHq();
      fetchData();
      showAlert("Notícia Publicada!", "A curadoria foi salva e já está no ar no A2 Notícias.", "info");
      setActiveTab('a2noticias');
    } catch (err: any) { 
      showAlert("Erro ao salvar", err.message, "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    if (url.length === 11) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCreateNewVideo = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('site_content').insert([{
        content_type: 'ad_featured_video',
        title: 'Novo Vídeo A2 TV',
        description: 'Descreva o conteúdo do vídeo aqui para os usuários...',
        is_active: true,
        meta_value: { external_url: 'https://www.youtube.com/watch?v=' }
      }]);
      if (error) throw error;
      fetchData();
      showAlert("Vídeo Adicionado", "Um novo slot de vídeo foi criado. Agora você pode editar os detalhes.", "info");
    } catch (err: any) {
      showAlert("Erro ao adicionar", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupNews = async () => {
    showAlert(
      "Atenção: Limpeza de Banco", 
      "Tem certeza que deseja apagar permanentemente todas as notícias e conteúdos com mais de 7 dias? Esta ação otimiza a performance e economiza espaço, mas não pode ser desfeita.",
      "confirm",
      async () => {
        setLoading(true);
        try {
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() - 7);
          
          const { error } = await supabase
            .from('site_content')
            .delete()
            .in('content_type', ['news', 'marketing', 'home_banner_left', 'home_banner_right'])
            .lt('created_at', limitDate.toISOString());

          if (error) throw error;
          
          fetchData();
          showAlert("Limpeza Concluída!", "O banco de dados foi limpo. Notícias antigas foram removidas com sucesso.", "info");
        } catch (err: any) {
          showAlert("Erro na limpeza", err.message, "error");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleAutoGenerate = (isNew: boolean = false) => {
    if (!hqRawText.trim()) {
      showAlert("Atenção", "Cole a notícia bruta primeiro.", "error");
      return;
    }

    const newOffset = isNew ? resumeOffset + 1 : 0;
    if (isNew) setResumeOffset(newOffset);
    else setResumeOffset(0);

    const lines = hqRawText.split('\n').filter(l => l.trim().length > 0);
    const paragraphs = hqRawText.split('\n').filter(l => l.trim().length > 20);
    
    if (paragraphs.length === 0) {
      showAlert("Erro", "O texto inserido é muito curto para gerar um contexto lógico.", "error");
      return;
    }
    
    // Lógica Extrativa: usamos parágrafos inteiros para não quebrar a lógica do texto
    const startIdx = newOffset % paragraphs.length;
    let resume = "";
    let i = startIdx;
    
    // Adiciona parágrafos até atingir o limite desejado
    while (i < paragraphs.length && resume.length < summaryCharLimit) {
      resume += paragraphs[i] + "\n\n";
      i++;
    }
    resume = resume.trim();

    // Se ficar excessivamente maior que o limite, fazemos um corte elegante no último ponto final
    if (resume.length > summaryCharLimit + 100) {
      const cut = resume.substring(0, summaryCharLimit + 50);
      const lastPeriod = cut.lastIndexOf('.');
      if (lastPeriod > summaryCharLimit * 0.5) {
        resume = cut.substring(0, lastPeriod + 1);
      } else {
        const lastSpace = cut.lastIndexOf(' ');
        resume = (lastSpace > 0 ? cut.substring(0, lastSpace) : cut) + "...";
      }
    }

    setHqResume(resume);

    // Inteligência Baseada em Regras (A2 Insights)
    let generatedTitle = "Giro de Notícias: O que você precisa saber hoje";
    const genericPOVs = [
      "Esta notícia destaca um movimento importante no cenário econômico. É essencial acompanhar essas tendências para entender como o mercado pode influenciar decisões estratégicas e o planejamento financeiro no curto e médio prazo.",
      "O contexto apresentado reflete mudanças estruturais relevantes. Manter-se informado sobre essas atualizações permite uma visão mais clara do mercado e facilita a adaptação a novas realidades.",
      "A situação ilustra a dinamicidade da economia. Compreender esse cenário é fundamental para quem busca se antecipar a possíveis impactos e proteger seus investimentos de oscilações inesperadas."
    ];
    let pov = genericPOVs[newOffset % genericPOVs.length];

    if (includeVittaPov) {
      const t = (hqRawText + " " + hqTitle).toLowerCase();
      if (t.includes('selic') || t.includes('juros') || t.includes('copom') || t.includes('taxa base')) {
        pov = "Esta mudança na taxa de juros sinaliza um redirecionamento da política monetária. Isso geralmente impacta tanto o custo do crédito quanto a rentabilidade de investimentos em renda fixa, exigindo cautela.";
        generatedTitle = "Nova Taxa Selic: Entenda os impactos da decisão";
      } else if (t.includes('dólar') || t.includes('dolar') || t.includes('câmbio') || t.includes('fed') || t.includes('moeda')) {
        pov = "A volatilidade do câmbio reflete incertezas globais e locais. A oscilação do dólar pode pressionar a inflação interna e afetar custos de importação, servindo de termômetro para a economia.";
        generatedTitle = "Oscilação do Dólar: O que está por trás da movimentação cambial";
      } else if (t.includes('inflação') || t.includes('inflacao') || t.includes('ipca') || t.includes('preços') || t.includes('supermercado')) {
        pov = "A pressão inflacionária continua a ser um desafio, reduzindo o poder de compra da população. É um cenário que demanda atenção aos custos básicos e busca por proteção do valor real do dinheiro.";
        generatedTitle = "Alta da Inflação: Perspectivas sobre o aumento de preços";
      } else if (t.includes('bitcoin') || t.includes('cripto') || t.includes('ethereum')) {
        pov = "O mercado de criptoativos segue demonstrando alta volatilidade e inovação. A notícia ressalta a importância de entender a tecnologia e os riscos antes de se expor a esse setor em constante transformação.";
        generatedTitle = "Movimentação em Criptomoedas: Análise do cenário digital";
      } else if (t.includes('imposto') || t.includes('receita') || t.includes('tributo') || t.includes('governo') || t.includes('taxação')) {
        pov = "As novas diretrizes tributárias podem alterar o planejamento financeiro de empresas e cidadãos. Compreender essas regras é o primeiro passo para otimizar custos e manter a conformidade fiscal.";
        generatedTitle = "Novas Regras Tributárias: O que muda na prática";
      } else if (t.includes('família') || t.includes('familia') || t.includes('aperto') || t.includes('dívida') || t.includes('divida') || t.includes('inadimplência')) {
        pov = "O endividamento e os desafios do orçamento familiar refletem o cenário macroeconômico atual. A educação financeira e a reestruturação de dívidas são caminhos apontados para a recuperação da estabilidade.";
        generatedTitle = "Desafios Financeiros: Reflexões sobre o cenário atual";
      }
      setHqPov(pov);
    } else {
      setHqPov("");
    }

    if (lines.length > 0 && lines[0].length < 120 && !lines[0].includes('.')) {
      generatedTitle = lines[0].trim();
    }
    setHqTitle(generatedTitle);

    if (!isNew) {
      showAlert("Curadoria Gerada!", "A Inteligência A2 analisou o texto e gerou o conteúdo automaticamente.", "info");
    }
  };

  const handleGenerateMockImage = () => {
    setLoading(true);
    setTimeout(() => {
      const basePrompt = hqImagePrompt.trim() !== ''
        ? hqImagePrompt.trim()
        : (hqTitle.trim() !== '' ? hqTitle : "notícia economia finanças mercado");

      const formattedPrompt = encodeURIComponent(
        basePrompt + " realistic professional photojournalism high quality finance news"
      );
      const randomSeed = Math.floor(Math.random() * 999999);
      const finalUrl = `https://image.pollinations.ai/prompt/${formattedPrompt}?width=1200&height=675&nologo=true&seed=${randomSeed}&model=flux`;

      setNewsImg(finalUrl);
      setLoading(false);
      showAlert("🖼️ Imagem Gerada", "Imagem contextual criada com IA. Aguarde carregar no preview.", "info");
    }, 300);
  };

  const handleUpdateIndicator = async (title: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('site_content').update({ 
        meta_value: { value: indicators[title].value, symbol: indicators[title].symbol } 
      }).eq('content_type', 'indicator').eq('title', title);
      if (error) throw error;
      showAlert("Atualizado", title + " atualizado com sucesso!", "info");
    } catch (err: any) { showAlert("Erro ao atualizar", err.message, "error"); } finally { setLoading(false); }
  };

  const handleUpdateCorporate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('site_content').select('id').eq('content_type', 'corporate_data').single();
      
      if (existing) {
        const { error } = await supabase.from('site_content').update({
          title: corpName,
          description: corpAddress,
          meta_value: { cnpj: corpCnpj, phone: corpPhone }
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_content').insert([{
          content_type: 'corporate_data',
          title: corpName,
          description: corpAddress,
          meta_value: { cnpj: corpCnpj, phone: corpPhone },
          is_active: true
        }]);
        if (error) throw error;
      }
      showAlert("Sucesso", "Dados corporativos atualizados!", "info");
      fetchData();
    } catch (err: any) { showAlert("Erro ao salvar", err.message, "error"); } finally { setLoading(false); }
  };

  const handleDeleteContent = async (id: string) => {
    showAlert(
      "Confirmar Exclusão", 
      "Tem certeza que deseja remover este item do feed? Esta ação não pode ser desfeita.", 
      "confirm",
      async () => {
        await supabase.from('site_content').delete().eq('id', id);
        fetchData();
      }
    );
  };

  const renderAdsMapaTab = () => {
    const adSlots = [
      { id: 'ad_top', label: 'Banner Topo (970x250)', type: 'ad_top', price: 'R$ 450' },
      { id: 'ad_vittacash_horizontal', label: 'Banner de Centro (728x90)', type: 'ad_vittacash_horizontal', price: 'R$ 240' },
      { id: 'ad_skin_left_home', label: 'Skin Esquerda (200x600)', type: 'ad_skin_left_home', price: 'R$ 380' },
      { id: 'ad_skin_right_home', label: 'Skin Direita (200x600)', type: 'ad_skin_right_home', price: 'R$ 380' },
      { id: 'ad_sidebar_1', label: 'Sidebar 1 (300x300)', type: 'ad_sidebar_1', price: 'R$ 280' },
      { id: 'ad_sidebar_2', label: 'Sidebar 2 (300x600)', type: 'ad_sidebar_2', price: 'R$ 320' },
      { id: 'ad_internal_inline_1', label: 'Anúncio Interno 01', type: 'ad_internal_inline_1', price: 'R$ 150' },
      { id: 'ad_internal_inline_2', label: 'Anúncio Interno 02', type: 'ad_internal_inline_2', price: 'R$ 150' },
      { id: 'ad_internal_inline_3', label: 'Anúncio Interno 03', type: 'ad_internal_inline_3', price: 'R$ 150' }
    ];

    const activeAds = (siteContent || []).filter(c => c && adSlots.map(s => s.type).includes(c.content_type || '') && c.is_active);
    const pendingRequests = (siteContent || []).filter(c => c && (c.content_type || '').startsWith('request_'));

    const handleOpenAdModal = (slotType: string) => {
      let ad = (siteContent || []).find(c => c && c.content_type === slotType);
      if (!ad && slotType === 'ad_skin_left_home') ad = (siteContent || []).find(c => c && c.content_type === 'ad_skin_left');
      if (!ad && slotType === 'ad_skin_right_home') ad = (siteContent || []).find(c => c && c.content_type === 'ad_skin_right');

      setSelectedMapSlot(slotType);
      setAdFormName(ad?.meta_value?.client_name || ad?.title || '');
      setAdFormPhone(ad?.meta_value?.client_phone || '');
      setAdFormImage(ad?.image_url || '');
      setAdFormLink(ad?.meta_value?.external_url || ad?.meta_value?.link || ad?.description || '');
    };

    const handleSaveAdModal = async () => {
      if (!selectedMapSlot) return;
      setLoading(true);

      let existingAd = (siteContent || []).find(c => c && c.content_type === selectedMapSlot);
      if (!existingAd && selectedMapSlot === 'ad_skin_left_home') existingAd = (siteContent || []).find(c => c && c.content_type === 'ad_skin_left');
      if (!existingAd && selectedMapSlot === 'ad_skin_right_home') existingAd = (siteContent || []).find(c => c && c.content_type === 'ad_skin_right');

      const adData = {
        id: existingAd?.id,
        content_type: selectedMapSlot,
        title: adSlots.find(s => s.type === selectedMapSlot)?.label || selectedMapSlot,
        image_url: adFormImage,
        is_active: true,
        meta_value: {
          ...existingAd?.meta_value,
          client_name: adFormName,
          client_phone: adFormPhone,
          external_url: adFormLink || '#',
          price_quoted: adSlots.find(s => s.type === selectedMapSlot)?.price || 'R$ 240,00'
        }
      };

      const { error } = await supabase.from('site_content').upsert(adData);
      setLoading(false);
      setSelectedMapSlot(null);
      if (error) {
        let msg = error.message;
        if (msg.includes("row-level security policy")) {
          msg = "Ação não permitida pelas políticas de segurança do banco de dados (RLS). Verifique se você está autenticado corretamente.";
        }
        showAlert("Erro ao Salvar", msg, "error");
      } else {
        fetchData();
        showAlert("Anúncio Atualizado", "As informações do banner foram salvas com sucesso!", "info");
      }
    };

    return (
      <div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-8 flex-1 pr-2 md:pr-6 overflow-y-auto custom-scrollbar pb-12">
        
        {/* MAPA INTERATIVO VISUAL DE BANNERS */}
        <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 md:p-8 rounded-3xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="text-indigo-500" size={20} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Mapa de Posicionamento de Banners (Clique no Slot para Editar)</h3>
          </div>

          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            {/* Banner do Topo */}
            <button 
              type="button"
              onClick={() => handleOpenAdModal('ad_top')}
              className="w-full py-6 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
            >
              Banner do Topo (970x250) - R$ 450
            </button>

            <div className="grid grid-cols-12 gap-4">
              {/* Skin Esquerda */}
              <button 
                type="button"
                onClick={() => handleOpenAdModal('ad_skin_left_home')}
                className="col-span-3 py-24 rounded-2xl bg-zinc-800/20 border-2 border-zinc-700/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center text-center [writing-mode:vertical-lr]"
              >
                Skin Esquerda (200x600) - R$ 380
              </button>

              {/* Conteúdo Central */}
              <div className="col-span-6 flex flex-col gap-4">
                <div className="flex-1 py-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 font-medium text-[9px] uppercase tracking-widest flex items-center justify-center text-center">
                  Feed de Matérias do Portal
                </div>

                {/* Banner de Centro */}
                <button 
                  type="button"
                  onClick={() => handleOpenAdModal('ad_vittacash_horizontal')}
                  className="w-full py-4 rounded-2xl bg-zinc-800/20 border-2 border-zinc-700/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Banner de Centro (728x90) - R$ 240
                </button>

                <div className="flex-1 py-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 font-medium text-[9px] uppercase tracking-widest flex items-center justify-center text-center">
                  Simuladores de Dividendos
                </div>
              </div>

              {/* Sidebar Coluna Direita */}
              <div className="col-span-3 flex flex-col gap-4">
                {/* Sidebar 1 */}
                <button 
                  type="button"
                  onClick={() => handleOpenAdModal('ad_sidebar_1')}
                  className="w-full py-8 rounded-2xl bg-zinc-800/20 border-2 border-zinc-700/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Sidebar 1 (300x300) - R$ 280
                </button>

                {/* Sidebar 2 */}
                <button 
                  type="button"
                  onClick={() => handleOpenAdModal('ad_sidebar_2')}
                  className="w-full py-16 rounded-2xl bg-zinc-800/20 border-2 border-zinc-700/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center text-center [writing-mode:vertical-lr]"
                >
                  Sidebar 2 (300x600) - R$ 320
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL POPUP PARA INSERÇÃO DE DADOS */}
        {selectedMapSlot && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`${isLight ? 'bg-white text-slate-800' : 'bg-zinc-900 text-white'} w-full max-w-md p-6 rounded-3xl border ${isLight ? 'border-slate-200' : 'border-white/10'} shadow-2xl animate-in zoom-in-95 duration-200`}>
              
              <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-200 dark:border-white/5">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Configurar Anúncio</h4>
                  <p className="text-[9px] text-slate-400 uppercase font-bold mt-1">Slot: {adSlots.find(s => s.type === selectedMapSlot)?.label || selectedMapSlot}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedMapSlot(null)}
                  className="text-slate-400 hover:text-rose-500 font-bold text-xs uppercase"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block">Nome do Anunciante</label>
                  <input 
                    type="text"
                    value={adFormName}
                    onChange={(e) => setAdFormName(e.target.value)}
                    placeholder="Ex: Banco Vitta"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block">WhatsApp / Contato</label>
                  <input 
                    type="text"
                    value={adFormPhone}
                    onChange={(e) => setAdFormPhone(e.target.value)}
                    placeholder="Ex: (34) 99999-9999"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block">Imagem do Banner (URL ou Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={adFormImage}
                      onChange={(e) => setAdFormImage(e.target.value)}
                      placeholder="URL da imagem ou faça upload..."
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAdSlot(selectedMapSlot);
                        fileInputRef.current?.click();
                        const interval = setInterval(() => {
                          const ad = (siteContent || []).find(c => c && c.content_type === selectedMapSlot);
                          if (ad?.image_url) {
                            setAdFormImage(ad.image_url);
                            clearInterval(interval);
                          }
                        }, 1000);
                        setTimeout(() => clearInterval(interval), 15000);
                      }}
                      className="px-3 bg-indigo-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-indigo-400 transition-colors flex items-center gap-1"
                    >
                      <Upload size={14} /> Upload
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block">Link do Anunciante (URL)</label>
                  <input 
                    type="text"
                    value={adFormLink}
                    onChange={(e) => setAdFormLink(e.target.value)}
                    placeholder="Ex: https://vittacash.com"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedMapSlot(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdModal}
                  className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-colors"
                >
                  Salvar Dados
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LISTAGEM DE BANNERS ATIVOS (Com ícone de Editar e Excluir) */}
        <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 md:p-8 rounded-3xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-200 dark:border-white/5">
            <ImageIcon size={20} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Listagem de Anúncios Ativos</h3>
          </div>

          {activeAds.length === 0 ? (
            <div className="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Nenhum anúncio ativo cadastrado no momento. Use o Mapa para cadastrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 pb-2 text-[8px]">
                    <th className="pb-3 text-zinc-500">Preview</th>
                    <th className="pb-3 text-zinc-500">Slot / Posição</th>
                    <th className="pb-3 text-zinc-500">Anunciante</th>
                    <th className="pb-3 text-zinc-500">Contato</th>
                    <th className="pb-3 text-zinc-500">Link Destino</th>
                    <th className="pb-3 text-zinc-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAds.map(ad => {
                    const isSlotInfo = adSlots.find(s => s.type === ad.content_type);
                    return (
                      <tr key={ad.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="w-12 aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
                            {ad.image_url ? (
                              <img src={ad.image_url} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[7px] text-zinc-600">Sem Img</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-indigo-400 text-[9px]">{isSlotInfo?.label || ad.content_type}</td>
                        <td className="py-3 text-slate-800 dark:text-slate-200">{ad.meta_value?.client_name || ad.title}</td>
                        <td className="py-3 text-zinc-400">{ad.meta_value?.client_phone || 'Sem contato'}</td>
                        <td className="py-3 text-[9px] text-slate-400 lowercase font-medium normal-case max-w-xs truncate">
                          <a href={ad.meta_value?.external_url} target="_blank" rel="noreferrer" className="underline hover:text-indigo-400">{ad.meta_value?.external_url || '#'}</a>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button 
                            type="button"
                            onClick={() => handleOpenAdModal(ad.content_type)}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500 hover:text-black text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded transition-all"
                            title="Editar Anúncio"
                          >
                            Editar
                          </button>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (!window.confirm("Deseja mesmo desativar e excluir este anúncio da listagem?")) return;
                              setLoading(true);
                              await supabase.from('site_content').delete().eq('id', ad.id);
                              setLoading(false);
                              fetchData();
                            }}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-[8px] font-black uppercase tracking-widest rounded transition-all"
                            title="Excluir Anúncio"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SOLICITAÇÕES DE RESERVA PENDENTES */}
        {pendingRequests.length > 0 && (
          <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 md:p-8 rounded-3xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-6 flex items-center gap-2">
              📢 Solicitações de Reserva Pendentes
            </h4>
            <div className="flex flex-col gap-4">
              {pendingRequests.map((req) => {
                const targetSlot = req.content_type.replace('request_', '');
                return (
                  <div key={req.id} className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                    <div className="flex items-start gap-4">
                      <div className="w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex-shrink-0">
                        {req.image_url ? (
                          <img src={req.image_url} className="w-full h-full object-contain" alt="Solicitação" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">Sem Img</div>
                        )}
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full mb-1 inline-block">
                          Vaga: {targetSlot}
                        </span>
                        <h5 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">{req.meta_value?.client_name || req.title}</h5>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">
                          📞 {req.meta_value?.client_phone || 'Sem fone'} | ✉️ {req.meta_value?.client_email || 'Sem e-mail'}
                        </p>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">
                          Preço Ofertado: {req.meta_value?.price_quoted} | {req.meta_value?.duration_days} Dias
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setLoading(true);
                          const existingAd = siteContent.find(c => c.content_type === targetSlot);
                          if (existingAd) {
                            await supabase.from('site_content').delete().eq('id', existingAd.id);
                          }
                          await supabase.from('site_content').update({
                            content_type: targetSlot,
                            is_active: true
                          }).eq('id', req.id);
                          setLoading(false);
                          fetchData();
                          showAlert("Aprovado!", "Anúncio ativado no portal.", "info");
                        }}
                        className="px-4 py-2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Deseja rejeitar?")) return;
                          setLoading(true);
                          await supabase.from('site_content').delete().eq('id', req.id);
                          setLoading(false);
                          fetchData();
                        }}
                        className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-500 hover:text-white"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    );
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <>
      <CustomAlert />
      {/* Input de arquivo global - fora das abas para funcionar em qualquer tab */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
        accept="image/*" 
      />
      <div className={`h-full font-inter p-4 lg:p-6 transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'} flex flex-col overflow-hidden`}>
        <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
          
          {/* HEADER & TABS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <img src="/logo.png" alt="A2 Mentor" className="h-8 w-8 md:h-12 md:w-12 object-contain rounded-full mix-blend-multiply dark:mix-blend-screen" />
              <div>
                <h1 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic leading-none">A2 Admin</h1>
                <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-widest mt-0.5">
                  HQ Center <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded ml-1 font-black">v1.3.1</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => {
                  showAlert(
                    "Limpar Memória", 
                    "Deseja forçar a limpeza do cache? O sistema irá reiniciar para aplicar as atualizações.", 
                    "confirm",
                    () => {
                      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                      caches.keys().then(names => names.forEach(n => caches.delete(n)));
                      window.location.reload();
                    }
                  );
                }}
                className="p-2 md:px-4 md:py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-rose-500/20"
                title="Limpar Cache"
              >
                <RefreshCw size={14} className="md:hidden" />
                <span className="hidden md:inline">Limpar Cache</span>
              </button>
              <div className={`flex ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-1 rounded-xl overflow-x-auto custom-scrollbar flex-1 md:flex-none`}>
                <button onClick={() => setActiveTab('vendas')} className={"whitespace-nowrap px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'vendas' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-500')}>
                  Vendas
                </button>
                <button onClick={() => setActiveTab('dados')} className={"whitespace-nowrap px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'dados' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-500')}>
                  Corporativo
                </button>
                <button onClick={() => setActiveTab('a2noticias')} className={"whitespace-nowrap px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'a2noticias' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-500')}>
                  HQ
                </button>
                <button onClick={() => setActiveTab('publicidade')} className={"whitespace-nowrap px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'publicidade' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-amber-500')}>
                  Ads
                </button>
                <button onClick={() => setActiveTab('ads_mapa')} className={"whitespace-nowrap px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'ads_mapa' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-amber-500')}>
                  Mapa Ads
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'vendas' && (
            <div className="animate-in fade-in duration-500 flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-6 pb-16 space-y-8">

              {/* ── KPI STRIP ── */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'MRR (Recorrente)', val: formatCurrency(stats.mrr), sub: `${stats.mrrGrowth >= 0 ? '▲' : '▼'} ${Math.abs(stats.mrrGrowth).toFixed(1)}% vs mês ant.`, color: 'text-emerald-500', subColor: stats.mrrGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                  { label: 'Receita Publicidade', val: formatCurrency(stats.adRevenue), sub: `Este mês: ${formatCurrency(stats.adRevenueThisMonth)}`, color: 'text-amber-500', subColor: 'text-slate-400' },
                  { label: 'Churn Rate', val: `${stats.churnRate.toFixed(1)}%`, sub: `${stats.inactiveClients.length} inativos`, color: stats.churnRate > 15 ? 'text-rose-500' : stats.churnRate > 5 ? 'text-amber-500' : 'text-emerald-500', subColor: 'text-slate-400' },
                  { label: 'Clientes Ativos', val: String(stats.activeClients.length), sub: `Base total: ${stats.totalClients}`, color: isLight ? 'text-slate-900' : 'text-white', subColor: 'text-slate-400' },
                  { label: 'LTV Médio (12m)', val: formatCurrency(stats.ltv), sub: `Ticket: ${formatCurrency(stats.averageTicket)}`, color: 'text-blue-500', subColor: 'text-slate-400' },
                ].map((kpi, i) => (
                  <div key={i} className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-5 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                    <h3 className={`text-xl font-black ${kpi.color}`}>{kpi.val}</h3>
                    <p className={`text-[9px] font-bold mt-1 ${kpi.subColor}`}>{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── PLANO DE AÇÃO IA  +  REGISTRAR VENDA ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Insights — ocupa 2 colunas */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                    <Brain size={14} /> Plano de Ação Inteligente — A2 Growth Engine
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 flex-1">
                    {stats.insights.map((ins, i) => (
                      <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-1.5 ${ins.type === 'danger' ? 'bg-rose-500/5 border-rose-500/20' : ins.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${ins.type === 'danger' ? 'text-rose-500' : ins.type === 'warning' ? 'text-amber-500' : 'text-blue-400'}`}>
                          {ins.type === 'danger' ? '🚨 Crítico' : ins.type === 'warning' ? '⚠️ Atenção' : 'ℹ️ Insight'}
                        </span>
                        <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'} leading-tight`}>{ins.title}</p>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium leading-relaxed`}>{ins.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulário — ocupa 1 coluna, alinhado ao topo */}
                <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-5 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'} flex flex-col gap-4`}>
                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 text-xs">
                    <Plus size={14}/> Registrar Nova Venda
                  </h3>
                  <form onSubmit={handleCreateLicense} className="flex flex-col gap-3 flex-1">
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-xl font-bold text-sm outline-none transition-colors placeholder:text-slate-400`} placeholder="Nome do Cliente" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-xl font-bold text-sm outline-none transition-colors placeholder:text-slate-400`} placeholder="Valor R$ 0,00" value={saleValue} onChange={e => setSaleValue(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-2">
                      <select className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-xl font-bold text-sm outline-none text-slate-500 focus:text-slate-900 dark:focus:text-white`} value={productType} onChange={e => setProductType(e.target.value)}>
                        <option value="SaaS" className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>SaaS</option>
                        <option value="Desktop" className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>Desktop</option>
                        <option value="Publicidade" className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>Publicidade</option>
                      </select>
                      <select className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-xl font-bold text-sm outline-none text-slate-500 focus:text-slate-900 dark:focus:text-white`} value={origin} onChange={e => setOrigin(e.target.value)}>
                        <option className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>Instagram</option>
                        <option className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>A2 App</option>
                        <option className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>Indicação</option>
                        <option className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>Direto</option>
                        <option className={`${isLight ? 'bg-white' : 'bg-white/10'}`}>WhatsApp</option>
                      </select>
                    </div>
                    {/* Campo de anunciante (só aparece quando tipo = Publicidade) */}
                    {productType === 'Publicidade' && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1">📢 Venda de Publicidade</p>
                        <p className="text-[9px] text-slate-400 font-medium">Esta receita será contabilizada separadamente do MRR de assinaturas.</p>
                      </div>
                    )}
                    <button className={`w-full py-3 rounded-xl font-black uppercase text-xs text-black active:scale-95 transition-all shadow-lg mt-auto ${
                      productType === 'Publicidade'
                        ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                    }`}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : productType === 'Publicidade' ? 'Registrar Anúncio' : 'Salvar Licença'}
                    </button>
                  </form>
                </div>
              </div>

              {/* ── TIMELINE COMPACTA ── */}
              <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'} p-5`}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Receita por Venda — Timeline</h3>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.timelineData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                      <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{backgroundColor: '#0a0a0c', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}} />
                      <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} fillOpacity={0.12} fill="#10b981" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>


              {/* ── CHURN RADAR + FUNIL DE CONVERSÃO ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar de Churn */}
                <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2"><AlertTriangle size={14}/> Radar de Churn — Clientes em Risco</h3>
                  {stats.atRisk.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <p className="text-xs font-bold text-emerald-500">Nenhum cliente em risco detectado. Base saudável ✓</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                      {stats.atRisk.map((client: any) => {
                        const days = Math.floor((Date.now() - new Date(client.created_at).getTime()) / 86400000);
                        const msg = encodeURIComponent(`Olá ${client.client_name}! Vi que você ainda não aproveitou tudo que o A2 Mentor tem a oferecer. Posso te ajudar com algo? 🚀`);
                        return (
                          <div key={client.id} className="flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                            <div>
                              <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{client.client_name}</p>
                              <p className="text-[9px] font-bold text-rose-400">{days} dias · Trial sem conversão</p>
                            </div>
                            <a href={`https://wa.me/5534998408962?text=${msg}`} target="_blank" rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-1 shrink-0">
                              <MessageCircle size={10}/> Recuperar
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Funil de Conversão */}
                <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-5 flex items-center gap-2"><Filter size={14}/> Funil de Conversão</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Trial / Cadastro', count: stats.plans.trial, color: 'bg-slate-400' },
                      { label: 'Plano Básico (R$19,90)', count: stats.plans.basico, color: 'bg-blue-500' },
                      { label: 'Plano Premium (R$59,90)', count: stats.plans.premium, color: 'bg-emerald-500' },
                      { label: 'Desktop Vitalício (R$497)', count: stats.plans.desktop, color: 'bg-amber-500' },
                    ].map((stage) => (
                      <div key={stage.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stage.label}</span>
                          <span className={`text-[10px] font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{stage.count}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5">
                          <div className={`${stage.color} h-1.5 rounded-full transition-all duration-700`}
                            style={{ width: stats.totalClients > 0 ? `${(stage.count / stats.totalClients) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {stats.plans.premium < stats.plans.basico && stats.plans.basico > 0 && (
                    <div className="mt-5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">⚡ Análise de Pricing (Variação C)</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Premium ({stats.plans.premium}) menor que Básico ({stats.plans.basico}). O gap de valor entre R$19,90 e R$59,90 pode estar causando abandono. Considere trial de 7 dias do Premium para usuários Básicos.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ORIGEM + SCRIPTS DE RECUPERAÇÃO ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar de Origem */}
                <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2"><Globe size={14}/> Radar de Origem</h3>
                  {stats.originData.length > 0 ? (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.originData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({name, percent}) => `${name} ${((percent ?? 0)*100).toFixed(0)}%`} labelLine={false}>
                            {stats.originData.map((_: any, i: number) => <Cell key={i} fill={CORES_FUNIL[i % CORES_FUNIL.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0a0a0c', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-40">Sem dados de origem</div>
                  )}
                </div>

                {/* Scripts WhatsApp */}
                <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2"><MessageCircle size={14}/> Scripts de Recuperação</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Variação A · Abandono de Checkout', color: 'rose', msg: 'Olá! Notei que você iniciou seu cadastro no A2 Mentor mas não finalizou. Tivemos algum problema técnico ou posso esclarecer alguma dúvida sobre os planos? 😊' },
                      { label: 'Variação B · Reengajamento Premium', color: 'indigo', msg: 'Oi! Faz alguns dias que não te vejo por aqui. Sabia que o módulo de IA Advisor pode identificar onde seu dinheiro está vazando? Vale 5 minutos 🚀' },
                      { label: 'Variação C · Upsell Básico → Premium', color: 'amber', msg: 'Olá! Você está no plano Básico e pode estar perdendo funcionalidades que fariam a diferença. Posso te dar 7 dias grátis no Premium para você testar?' },
                    ].map((script) => (
                      <a key={script.label} href={`https://wa.me/5534998408962?text=${encodeURIComponent(script.msg)}`}
                        target="_blank" rel="noreferrer"
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all group
                          ${script.color === 'rose' ? 'bg-rose-500/5 border-rose-500/15 hover:border-rose-500/40' :
                            script.color === 'indigo' ? 'bg-indigo-500/5 border-indigo-500/15 hover:border-indigo-500/40' :
                            'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/40'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{script.label}</span>
                        <MessageCircle size={14} className={script.color === 'rose' ? 'text-rose-400' : script.color === 'indigo' ? 'text-indigo-400' : 'text-amber-400'} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── TABELA DE LICENÇAS ── */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Users size={14}/> Base de Clientes</h3>
                <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? 'border-slate-200' : 'border-white/5'} ${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'}`}>
                        {['Cliente', 'Produto', 'Origem', 'Valor', 'Status', 'Data', 'Ação'].map(h => (
                          <th key={h} className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.slice(0, 20).map((l: any) => (
                        <tr key={l.id} className="border-b border-slate-100 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className={`p-3 font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{l.client_name}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${l.product_type === 'SaaS' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>{l.product_type}</span></td>
                          <td className="p-3 text-slate-500 font-bold">{l.origin || '—'}</td>
                          <td className="p-3 font-black text-emerald-500">{formatCurrency(l.price || 0)}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${l.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{l.status}</span></td>
                          <td className="p-3 text-slate-400 font-bold">{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3">
                            <a href={`https://wa.me/5534998408962?text=${encodeURIComponent(`Olá ${l.client_name}! Aqui é da equipe A2 Mentor.`)}`} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all inline-flex">
                              <MessageCircle size={13}/>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {licenses.length > 20 && (
                    <div className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 dark:border-white/5">
                      + {licenses.length - 20} clientes adicionais
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'dados' && (
            <div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-6 pb-12">
              
              {/* INDEXADORES FINANCEIROS */}
              <div>
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-6 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {['SELIC', 'IPCA', 'INPC', 'DÓLAR', 'BITCOIN'].map(key => (
                    <div key={key} className="pb-3 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{key}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          className={`bg-transparent text-lg font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'} w-full outline-none focus:text-blue-500 transition-colors`} 
                          value={indicators[key]?.value || ''} 
                          onChange={e => setIndicators({ ...indicators, [key]: { ...indicators[key], value: e.target.value } })}
                          placeholder="0.00"
                        />
                        <span className="text-slate-400 font-black text-[10px]">{indicators[key]?.symbol || ''}</span>
                        <button onClick={() => handleUpdateIndicator(key)} className="p-1.5 hover:bg-emerald-500 hover:text-black rounded-lg text-blue-500 transition-all opacity-0 group-hover:opacity-100"><Save size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-slate-200 dark:bg-zinc-800/50" />

              {/* DADOS CORPORATIVOS */}
              <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-6 text-xs"><ShieldCheck size={16}/> Dados Corporativos & Compliance</h3>
                <form onSubmit={handleUpdateCorporate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Razão Social</label>
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-lg font-bold text-sm outline-none`} value={corpName} onChange={e => setCorpName(e.target.value)} placeholder="Ex: Vitta Digital Ltda" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">CNPJ</label>
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-lg font-bold text-sm outline-none`} value={corpCnpj} onChange={e => setCorpCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Telefone / Contato</label>
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-lg font-bold text-sm outline-none`} value={corpPhone} onChange={e => setCorpPhone(e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Endereço Completo</label>
                    <input className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-3 rounded-lg font-bold text-sm outline-none`} value={corpAddress} onChange={e => setCorpAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button className="px-8 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar Dados Corporativos"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="w-full h-px bg-slate-200 dark:bg-zinc-800/50" />

              {/* CARROSSEL DA VITRINE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 text-xs">
                    <ImageIcon size={16}/> Carrossel da Vitrine (Tela de Vendas)
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  Imagens exibidas nos painéis esquerdo (Web) e direito (Mobile) da tela inicial. Agora você pode adicionar múltiplas imagens para criar um carrossel automático.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { type: 'home_banner_left', label: 'Painel Web — Esquerdo (16:9)', aspect: 'aspect-[16/9]' },
                    { type: 'home_banner_right', label: 'Painel Mobile — Direito (9:16)', aspect: 'aspect-[9/16]' }
                  ].map((slot) => {
                    const items = siteContent.filter(c => c.content_type === slot.type);
                    return (
                      <div key={slot.type} className="flex flex-col gap-4">
                        <div className={`flex items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-4 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{slot.label}</h4>
                          <button 
                            onClick={() => { setPendingAdSlot(slot.type); fileInputRef.current?.click(); }}
                            className="px-3 py-1.5 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
                          >
                            <Plus size={12} /> Adicionar Imagem
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {items.length === 0 && (
                            <div className={`${slot.aspect} w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2 border border-dashed border-slate-300 dark:border-white/10`}>
                              <ImageIcon size={32} className="opacity-20" />
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Nenhuma imagem configurada</span>
                            </div>
                          )}
                          
                          {items.map((item) => (
                            <div key={item.id} className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-4 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'} flex flex-col gap-4 group`}>
                              <div className={`${slot.aspect} w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-xl overflow-hidden relative border border-slate-200 dark:border-white/10`}>
                                <img src={item.image_url} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => { setPendingAdSlot(`${slot.type}:${item.id}`); fileInputRef.current?.click(); }}
                                    className="px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                  >
                                    <Upload size={12} /> Trocar
                                  </button>
                                </div>
                              </div>



                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setLoading(true);
                                    await supabase.from('site_content').update({ is_active: !item.is_active }).eq('id', item.id);
                                    setLoading(false);
                                    fetchData();
                                  }}
                                  className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                                    item.is_active
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                  }`}
                                >
                                  {item.is_active ? 'Ativo' : 'Inativo'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="text-rose-500 opacity-60 hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/10 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
          {activeTab === 'a2noticias' && (
            <div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-6 flex-1 min-h-0 pb-4 pr-2 md:pr-6">
              
              <form onSubmit={handleHqPublish} className="flex flex-col gap-6 h-full min-h-0">
                {/* CARD QUARTEL GENERAL (FIXO) */}
                <div className={`flex-shrink-0 flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0a0c] lg:bg-white/5 lg:backdrop-blur-3xl border-white/5'} p-4 lg:p-6 rounded-2xl lg:rounded-3xl border shadow-lg`}>
                  <div className={`flex-shrink-0 flex flex-row items-center justify-between gap-4 mb-4 border-b ${isLight ? 'border-slate-200' : 'border-white/5'} pb-4`}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2.5 md:p-3 bg-indigo-500/10 rounded-xl md:rounded-2xl">
                        <Newspaper size={20} className="text-indigo-500 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <h3 className="font-black uppercase tracking-widest text-indigo-500 text-base md:text-lg">
                          <span className="md:hidden">HQ: Curadoria</span>
                          <span className="hidden md:inline">Quartel General: Curadoria Manual</span>
                        </h3>
                        <p className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-widest mt-1 hidden md:block`}>Publique notícias estruturadas diretamente no portal</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleCleanupNews}
                      className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap"
                    >
                      <Trash2 size={14} />
                      <span className="hidden md:inline">Limpar Notícias Antigas (+7 Dias)</span>
                      <span className="md:hidden">Limpar (+7d)</span>
                    </button>
                  </div>

                  {/* CONTROLES FIXOS (NÃO ROLAM) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <button 
                        type="button"
                        onClick={() => handleAutoGenerate(false)}
                        className="flex-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-indigo-500/20 hover:bg-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[44px] md:min-w-[140px]"
                        title="Resumo Automático"
                      >
                        <Zap size={16} />
                        <span className="hidden md:inline">Resumo Automático</span>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => handleAutoGenerate(true)}
                        className="flex-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-indigo-500/20 hover:bg-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[44px] md:min-w-[140px]"
                        title="Novo Contexto"
                      >
                        <RefreshCw size={14} />
                        <span className="hidden md:inline">Novo Contexto</span>
                      </button>

                      <button 
                        type="button"
                        onClick={handleGenerateMockImage}
                        className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[44px] md:min-w-[140px]"
                        title="Imagem IA"
                      >
                        <ImageIcon size={14}/>
                        <span className="hidden md:inline">Imagem IA</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[44px] md:min-w-[140px]"
                        title="Upload Capa"
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span className="hidden md:inline">Upload Capa</span>
                      </button>

                      <button 
                        type="button"
                        onClick={handleClearHq}
                        className="flex-1 bg-rose-500/10 text-rose-500 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[44px] md:min-w-[140px]"
                        title="Limpar Tudo"
                      >
                        <Trash2 size={14} />
                        <span className="hidden md:inline">Limpar Tudo</span>
                      </button>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-indigo-600 text-white py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[120px] md:min-w-[200px]"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={14} />}
                        <span>Publicar Notícia</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-1">
                      <div className={`w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2 ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap md:pl-2`}>Fonte:</label>
                        <input 
                          className={`w-full ${isLight ? 'bg-white' : 'bg-white/10'} border border-slate-200 dark:border-white/10 p-1.5 md:p-2 rounded-lg font-bold text-[10px] outline-none transition-all focus:border-indigo-500`} 
                          placeholder="Ex: InfoMoney" 
                          value={hqSource}
                          onChange={e => setHqSource(e.target.value)}
                          required
                        />
                      </div>

                      <div className={`w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2 ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                         <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap md:pl-2`}>Cat:</label>
                         <select 
                           className={`w-full ${isLight ? 'bg-white' : 'bg-white/10'} border border-slate-200 dark:border-white/10 p-1.5 md:p-2 rounded-lg font-bold text-[10px] outline-none transition-all focus:border-indigo-500`}
                           value={hqCategory}
                           onChange={e => setHqCategory(e.target.value)}
                         >
                           <option value="Mercado">Mercado</option>
                           <option value="Finanças">Finanças</option>
                           <option value="Investimentos">Investimentos</option>
                           <option value="Tecnologia">Tecnologia</option>
                           <option value="Negócios">Negócios</option>
                           <option value="VittaCash">VittaCash</option>
                           <option value="Atualidades">Atualidades</option>
                         </select>
                      </div>

                      <div className={`w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2 ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap md:pl-2`}>Imagem:</label>
                        <input
                          className={`w-full ${isLight ? 'bg-white' : 'bg-white/10'} border border-slate-200 dark:border-white/10 p-1.5 md:p-2 rounded-lg font-bold text-[10px] outline-none transition-all focus:border-indigo-500`}
                          placeholder="Ex: homem..."
                          value={hqImagePrompt}
                          onChange={e => setHqImagePrompt(e.target.value)}
                        />
                      </div>

                       <div className={`w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2 ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap md:pl-2`}>Link:</label>
                        <input
                          className={`w-full ${isLight ? 'bg-white' : 'bg-white/10'} border border-slate-200 dark:border-white/10 p-1.5 md:p-2 rounded-lg font-bold text-[10px] outline-none transition-all focus:border-indigo-500`}
                          placeholder="Link da Matéria Original..."
                          value={hqExternalUrl}
                          onChange={e => setHqExternalUrl(e.target.value)}
                        />
                      </div>

                      <div className={`col-span-2 md:col-span-2 w-full flex items-center gap-3 ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'} px-4 h-[46px]`}>
                        <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap flex gap-1`}>
                          Resumo <span className="text-indigo-500 md:inline hidden">({summaryCharLimit})</span>
                        </label>
                        <input 
                          type="range" min="100" max="1000" step="50" 
                          value={summaryCharLimit} 
                          onChange={(e) => setSummaryCharLimit(Number(e.target.value))} 
                          className="w-full accent-indigo-500 h-1.5" 
                        />
                      </div>
                      
                      <div className={`col-span-2 md:col-span-2 flex items-center ${isLight ? 'bg-slate-100' : 'bg-white/5'} p-2 md:p-2.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'} px-4 h-[46px]`}>
                        <label className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                          <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded flex items-center justify-center border transition-colors ${includeVittaPov ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-400 dark:border-zinc-700'}`}>
                            {includeVittaPov && <Zap size={10} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={includeVittaPov} 
                            onChange={(e) => setIncludeVittaPov(e.target.checked)} 
                            className="hidden" 
                          />
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-indigo-400 transition-colors">
                            Insights IA
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ÁREA ROLÁVEL: TEXTO BRUTO E PREVIEW */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 pr-2">
                      
                      {/* COLUNA ESQUERDA: NOTÍCIA BRUTA INTEIRA (Ocupa 5 colunas no desktop) */}
                      <div className="lg:col-span-5 flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 flex-shrink-0">
                          <Newspaper size={12} /> Texto Bruto / Fonte de Dados
                        </label>
                        <div className={`min-h-[300px] lg:flex-1 lg:min-h-0 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'} p-4 flex flex-col`}>
                          <textarea
                            className={`min-h-[260px] lg:flex-1 w-full bg-transparent border-0 outline-none font-medium text-sm ${isLight ? 'text-slate-900' : 'text-white'} placeholder:text-slate-400 resize-none custom-scrollbar overflow-y-auto`}
                            placeholder="Cole aqui o texto completo da notícia original..."
                            value={hqRawText}
                            onChange={e => setHqRawText(e.target.value)}
                          />
                          <div className={`mt-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} flex items-center justify-between`}>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{hqRawText.length} caracteres</span>
                             <button 
                              type="button"
                              onClick={() => setHqRawText('')}
                              className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                             >Limpar Texto</button>
                          </div>
                        </div>
                      </div>

                      {/* COLUNA DIREITA: LIVE PORTAL PREVIEW (Ocupa 7 colunas no desktop) */}
                      <div className="lg:col-span-7 flex flex-col gap-4 min-h-[600px] lg:h-full lg:min-h-0">
                        <div className="flex items-center justify-between mb-2 flex-shrink-0">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                            <Monitor size={12} /> Visualização Real no Portal
                          </h4>
                          <span className={`text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>Modo Destaque</span>
                        </div>

                        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-200 flex-1 min-h-0 flex flex-col gap-4 md:gap-6 custom-scrollbar overflow-y-auto">
                          {/* Header do Preview (Falsificando o VittaNews) */}
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-2">
                             <div className="flex flex-col leading-none">
                              <span className="text-sm font-black italic tracking-tighter uppercase text-zinc-900">A2<span className="text-indigo-600">Finanças</span></span>
                              <span className="text-[6px] font-bold uppercase tracking-[0.4em] text-zinc-400">Notícias</span>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-100" />
                              <div className="w-2 h-2 rounded-full bg-slate-100" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            {/* Capa */}
                            <div className="aspect-video w-full overflow-hidden rounded-xl relative bg-zinc-50 border border-zinc-100">
                              {newsImg ? (
                                <img src={newsImg} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                                  <ImageIcon size={32} className="opacity-20" />
                                  <span className="text-[8px] font-black uppercase">Aguardando Imagem</span>
                                </div>
                              )}
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">{hqCategory}</span>
                              </div>
                            </div>

                            {/* Texto */}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 text-zinc-400 text-[8px] font-bold uppercase tracking-widest mb-3">
                                <Clock size={10} /> {new Date().toLocaleDateString()} • 5 min de leitura
                              </div>
                              
                              <input
                                className="w-full bg-transparent border-0 font-black text-zinc-900 uppercase tracking-tighter italic leading-none mb-4 outline-none focus:ring-1 focus:ring-indigo-500/20 rounded py-1 text-lg md:text-2xl placeholder:text-zinc-200"
                                placeholder="Título da Matéria..."
                                value={hqTitle}
                                onChange={e => setHqTitle(e.target.value)}
                              />
                              
                              <div className="text-zinc-600 text-xs font-medium leading-relaxed space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                                <textarea
                                  className="w-full bg-transparent border-0 outline-none resize-none min-h-[80px] placeholder:text-zinc-300"
                                  placeholder="O resumo da notícia aparecerá aqui..."
                                  value={hqResume}
                                  onChange={e => setHqResume(e.target.value)}
                                />

                                {includeVittaPov && (
                                  <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                                    <span className="text-[10px] font-black uppercase text-indigo-600 mb-2 block flex items-center gap-1"><Zap size={10}/> A2 Mentor Insights</span>
                                    <textarea
                                      className="w-full bg-transparent border-0 outline-none resize-none font-bold italic text-indigo-900/80 placeholder:text-indigo-200"
                                      placeholder="Insights da IA..."
                                      value={hqPov}
                                      onChange={e => setHqPov(e.target.value)}
                                    />
                                    <p className="text-[10px] text-indigo-500 mt-2 font-black uppercase tracking-widest">Conheça nosso aplicativo gratuito.</p>
                                  </div>
                                )}

                                <p className="text-[10px] text-zinc-400 font-bold mt-4">Informações originais baseadas na reportagem de {hqSource || "..."}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
              </form>
            </div>
          )}
          {activeTab === 'publicidade' && (
            <div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-6 flex-1 pr-2 md:pr-6 overflow-y-auto custom-scrollbar pb-12">
              
              {/* NOVO: KPIs FINANCEIROS E METRICA DE ADS */}
              {(() => {
                const adSlots = ['ad_top', 'ad_vittacash_horizontal', 'ad_skin_left_home', 'ad_skin_right_home', 'ad_sidebar_1', 'ad_sidebar_2', 'ad_skin_left', 'ad_skin_right', 'ad_internal_inline_1', 'ad_internal_inline_2', 'ad_internal_inline_3'];
                const activeAds = siteContent.filter(c => adSlots.includes(c.content_type) && c.is_active);
                const pendingRequests = siteContent.filter(c => c.content_type.startsWith('request_'));

                const parsePrice = (priceStr?: string) => {
                  if (!priceStr) return 0;
                  const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
                  return parseFloat(clean) || 0;
                };

                const estimatedRevenue = activeAds.reduce((acc, curr) => {
                  const price = parsePrice(curr.meta_value?.price_quoted || (curr.content_type.includes('top') ? 'R$ 450,00' : curr.content_type.includes('skin') ? 'R$ 380,00' : curr.content_type.includes('sidebar') ? 'R$ 280,00' : 'R$ 240,00'));
                  return acc + price;
                }, 0);

                const unpaidActiveAds = activeAds.filter(ad => ad.meta_value?.payment_status !== 'Pago');

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                      {[
                        { label: 'Anúncios Ativos', val: `${activeAds.length} slots`, sub: 'Campanhas no ar', color: 'text-indigo-500' },
                        { label: 'Faturamento Mensal (Est.)', val: formatCurrency(estimatedRevenue), sub: 'Somando anúncios ativos', color: 'text-emerald-500' },
                        { label: 'Pagamentos Pendentes', val: `${unpaidActiveAds.length} ativos`, sub: 'Aguardando PIX/Fatura', color: 'text-amber-500' },
                        { label: 'Reservas Pendentes', val: `${pendingRequests.length} solicitações`, sub: 'Novas propostas de clientes', color: 'text-pink-500' },
                      ].map((kpi, i) => (
                        <div key={i} className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-5 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                          <h3 className={`text-xl font-black ${kpi.color}`}>{kpi.val}</h3>
                          <p className="text-[9px] font-bold mt-1 text-slate-400">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5 backdrop-blur-3xl'} p-6 rounded-3xl border ${isLight ? 'border-slate-200' : 'border-white/5'} mb-2`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2">
                          📋 Controle Financeiro de Campanhas Ativas
                        </h4>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-slate-400">Exibir:</span>
                          <select 
                            value={adsPerPage} 
                            onChange={(e) => setAdsPerPage(Number(e.target.value))}
                            className="bg-white dark:bg-zinc-800 text-[10px] font-black text-indigo-500 uppercase border border-slate-200 dark:border-white/10 rounded px-2.5 py-1 outline-none"
                          >
                            <option value={10}>10 Itens</option>
                            <option value={20}>20 Itens</option>
                            <option value={50}>50 Itens</option>
                          </select>
                        </div>
                      </div>

                      {activeAds.length === 0 ? (
                        <div className="text-center py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Nenhum anúncio ativo rodando atualmente no portal.
                        </div>
                      ) : (
                        <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                          <table className="w-full text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-900 z-10">
                              <tr className="border-b border-slate-200 dark:border-white/5 pb-2 text-[8px]">
                                <th className="pb-3 text-zinc-500">Slot</th>
                                <th className="pb-3 text-zinc-500">Cliente / Título</th>
                                <th className="pb-3 text-zinc-500">Pagamento</th>
                                <th className="pb-3 text-zinc-500">Expiração</th>
                                <th className="pb-3 text-zinc-500 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeAds.slice(0, adsPerPage).map(ad => {
                                const expDate = ad.meta_value?.expires_at ? new Date(ad.meta_value.expires_at) : null;
                                const daysLeft = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                                const statusPag = ad.meta_value?.payment_status || 'Pendente';
                                
                                return (
                                  <tr key={ad.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-3 text-indigo-400 text-[9px]">{ad.content_type}</td>
                                    <td className="py-3">
                                      <div className="text-slate-800 dark:text-slate-200">{ad.meta_value?.client_name || ad.title}</div>
                                      <div className="text-[8px] text-slate-400 font-medium normal-case">{ad.meta_value?.client_email || 'Email não cadastrado'}</div>
                                    </td>
                                    <td className="py-3">
                                      <button 
                                        type="button"
                                        onClick={async () => {
                                          setLoading(true);
                                          const newStatus = statusPag === 'Pago' ? 'Pendente' : 'Pago';
                                          await supabase.from('site_content').update({
                                            meta_value: { ...ad.meta_value, payment_status: newStatus }
                                          }).eq('id', ad.id);
                                          setLoading(false);
                                          fetchData();
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest uppercase transition-all ${statusPag === 'Pago' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}
                                      >
                                        {statusPag}
                                      </button>
                                    </td>
                                    <td className="py-3">
                                      {daysLeft !== null ? (
                                        <span className={daysLeft <= 3 ? 'text-rose-500 font-black' : daysLeft <= 7 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                                          {daysLeft <= 0 ? 'Expirado ⚠️' : `${daysLeft} dias restantes`}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500">Sem limite</span>
                                      )}
                                    </td>
                                    <td className="py-3 text-right space-x-2">
                                      <button 
                                        type="button"
                                        onClick={async () => {
                                          setLoading(true);
                                          const currentExp = ad.meta_value?.expires_at ? new Date(ad.meta_value.expires_at) : new Date();
                                          const newExp = new Date(currentExp.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
                                          await supabase.from('site_content').update({
                                            meta_value: { ...ad.meta_value, expires_at: newExp }
                                          }).eq('id', ad.id);
                                          setLoading(false);
                                          fetchData();
                                          showAlert("Prorrogado!", "Campanha estendida por mais 30 dias.", "info");
                                        }}
                                        className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded text-[8px]"
                                      >
                                        +30 Dias
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={async () => {
                                          if (!window.confirm("Deseja desativar este anúncio?")) return;
                                          setLoading(true);
                                          await supabase.from('site_content').update({ is_active: false }).eq('id', ad.id);
                                          setLoading(false);
                                          fetchData();
                                        }}
                                        className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded text-[8px]"
                                      >
                                        Desativar
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'ads_mapa' && renderAdsMapaTab()}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;









