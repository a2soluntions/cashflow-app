import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabase';
import { 
 Lock, Plus, Copy, RefreshCw, Trash2, ShieldCheck, 
 TrendingUp, DollarSign, Users, Calendar, Filter, Monitor,
 Newspaper, Save, Image as ImageIcon, Upload, Loader2
} from 'lucide-react';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
 AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const CORES_FUNIL = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'conteudo'>('vendas');
  const [licenses, setLicenses] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  
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
        <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
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

  // FORMULÁRIO CONTEÚDO
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsImg, setNewsImg] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [contentType, setContentType] = useState('news');
  const [visibleCount, setVisibleCount] = useState(10);
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
        setCorpAddress(corp.description || '');
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const totalRevenue = licenses.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalClients = licenses.length;
    const averageTicket = totalClients > 0 ? totalRevenue / totalClients : 0;
    
    const now = new Date();
    const revenueThisMonth = licenses
      .filter(l => new Date(l.created_at).getMonth() === now.getMonth())
      .reduce((acc, curr) => acc + (curr.price || 0), 0);

    const timelineData = licenses.slice(0, 10).reverse().map(l => ({
      name: new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: l.price
    }));

    return { totalRevenue, totalClients, averageTicket, revenueThisMonth, timelineData };
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

      setNewsImg(data.publicUrl);
    } catch (error: any) {
      showAlert('Erro no upload', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('site_content').insert([{ 
        content_type: contentType, 
        title: newsTitle, 
        description: newsDesc, 
        image_url: newsImg,
        is_active: true,
        meta_value: { external_url: newsUrl }
      }]);
      if (error) throw error;
      setNewsTitle(''); setNewsDesc(''); setNewsImg(''); setNewsUrl(''); fetchData();
      showAlert("Sucesso", "Conteúdo publicado com sucesso no radar!", "info");
    } catch (err: any) { showAlert("Erro ao salvar", err.message, "error"); } finally { setLoading(false); }
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
          meta_value: { cnpj: corpCnpj }
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_content').insert([{
          content_type: 'corporate_data',
          title: corpName,
          description: corpAddress,
          meta_value: { cnpj: corpCnpj },
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <>
      <CustomAlert />
      <div className="h-full font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-hidden">
        <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
          
          {/* HEADER & TABS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
              <div><h1 className="text-2xl font-black uppercase tracking-tighter italic">Vitta Admin</h1><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">SaaS Management Center <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded ml-2 font-black anim-pulse">v1.3.1 - ATUALIZADO</span></p></div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
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
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-rose-500/20"
              >
                Limpar Cache
              </button>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <button onClick={() => setActiveTab('vendas')} className={"px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'vendas' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-500')}>
                  Vendas & KPIS
                </button>
                <button onClick={() => setActiveTab('conteudo')} className={"px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all " + (activeTab === 'conteudo' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-500')}>
                  Site & Notícias
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'vendas' ? (
            <div className="animate-in fade-in duration-500 flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-6 pb-12">
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Receita Vitalícia', val: formatCurrency(stats.totalRevenue), color: 'text-emerald-500' },
                  { label: 'Vendas (Mês)', val: formatCurrency(stats.revenueThisMonth), color: 'text-slate-900 dark:text-white' },
                  { label: 'Clientes Base', val: stats.totalClients, color: 'text-slate-900 dark:text-white' },
                  { label: 'Ticket Médio', val: formatCurrency(stats.averageTicket), color: 'text-blue-500' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-transparent pb-4 transition-all ">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                    <h3 className={"text-2xl font-black " + kpi.color}>{kpi.val}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-6">
                <div className="text-slate-900 dark:text-white">
                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Plus size={16}/> Registrar Venda</h3>
                  <form onSubmit={handleCreateLicense} className="space-y-6">
                    <div>
                      <input className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none transition-colors placeholder:text-slate-400" placeholder="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    </div>
                    <div>
                      <input className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none transition-colors placeholder:text-slate-400" placeholder="Valor R$ 0,00" value={saleValue} onChange={e => setSaleValue(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <select className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={productType} onChange={e => setProductType(e.target.value)}>
                        <option value="SaaS" className="bg-white dark:bg-[#09090b]">SaaS</option>
                        <option value="Desktop" className="bg-white dark:bg-[#09090b]">Desktop</option>
                      </select>
                      <select className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={origin} onChange={e => setOrigin(e.target.value)}>
                        <option className="bg-white dark:bg-[#09090b]">Instagram</option>
                        <option className="bg-white dark:bg-[#09090b]">A2 App</option>
                        <option className="bg-white dark:bg-[#09090b]">Indicação</option>
                      </select>
                    </div>
                    <button className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase text-xs text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20 mt-4 hover:bg-emerald-400">Salvar Licença</button>
                  </form>
                </div>
                <div className="lg:col-span-2 flex flex-col h-[300px] md:h-[400px] mb-8">
                  <div className="pb-4 flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Desempenho de Vendas</h3>
                  </div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.timelineData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                        <Tooltip contentStyle={{backgroundColor: '#0a0a0c', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={0.15} fill="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-6 flex-1 overflow-hidden">
              
              {/* INDEXADORES FINANCEIROS */}
              <div>
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-6 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {['SELIC', 'IPCA', 'INPC', 'DÓLAR', 'BITCOIN'].map(key => (
                    <div key={key} className="pb-3 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{key}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          className="bg-transparent text-lg font-black font-mono text-slate-900 dark:text-white w-full outline-none focus:text-blue-500 transition-colors" 
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
              <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-6 text-xs"><ShieldCheck size={16}/> Dados Corporativos & Compliance</h3>
                <form onSubmit={handleUpdateCorporate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Razão Social</label>
                    <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none" value={corpName} onChange={e => setCorpName(e.target.value)} placeholder="Ex: Vitta Digital Ltda" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">CNPJ</label>
                    <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none" value={corpCnpj} onChange={e => setCorpCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Endereço Completo</label>
                    <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none" value={corpAddress} onChange={e => setCorpAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button className="px-8 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar Dados Corporativos"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="w-full h-px bg-slate-200 dark:bg-zinc-800/50" />

              {/* NOTÍCIAS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 overflow-hidden">
                <div className="text-slate-900 dark:text-white">
                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Newspaper size={16}/> Compor Conteúdo</h3>
                  <form onSubmit={handleAddNews} className="space-y-4">
                    <div>
                      <select className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={contentType} onChange={e => setContentType(e.target.value)}>
                        <option value="news" className="bg-white dark:bg-[#09090b]">Notícia (Radar)</option>
                        <option value="marketing" className="bg-white dark:bg-[#09090b]">Marketing (Radar)</option>
                        <option value="home_banner_left" className="bg-white dark:bg-[#09090b]">Banner Esquerdo (Home)</option>
                        <option value="home_banner_right" className="bg-white dark:bg-[#09090b]">Banner Direito (Home)</option>
                      </select>
                    </div>
                    <div>
                      <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none transition-colors placeholder:text-slate-400" placeholder="Título da Notícia" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} required />
                    </div>
                    <div>
                      <textarea className="w-full bg-transparent p-3 rounded-lg font-bold text-sm outline-none h-24 transition-colors placeholder:text-slate-400 custom-scrollbar" placeholder="Descrição curta (Call to action ou resumo da notícia)" value={newsDesc} onChange={e => setNewsDesc(e.target.value)} required />
                    </div>
                    


                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none transition-colors placeholder:text-slate-400" 
                        placeholder="Link da Imagem (URL)" 
                        value={newsImg} 
                        onChange={e => setNewsImg(e.target.value)} 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 bg-slate-100 dark:bg-white/5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center border border-white/5"
                        title="Upload de arquivo"
                      >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                      />
                    </div>
                    <div>
                      <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none transition-colors placeholder:text-slate-400" placeholder="Link Externo / Fonte (Opcional)" value={newsUrl} onChange={e => setNewsUrl(e.target.value)} />
                    </div>
                    <button className="w-full bg-emerald-500 text-black py-3 rounded-lg font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-2 hover:bg-emerald-400">{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publicar no Radar"}</button>
                  </form>
                </div>

                <div className="lg:col-span-2 flex flex-col mt-8 lg:mt-0 overflow-hidden">
                  <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 id="active-feed" className="text-xs font-black uppercase tracking-widest text-slate-400">Feed Ativo (Conteúdos)</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                        <span className="text-[8px] font-black uppercase text-slate-400 ml-1 mr-1">Exibir:</span>
                        {[5, 10, 20, 50].map(val => (
                          <button 
                            key={val}
                            onClick={() => setVisibleCount(val)}
                            className={`px-3 py-1 rounded text-[10px] font-black transition-all ${visibleCount === val ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 whitespace-nowrap">{siteContent.length} Item(ns) Ativo(s)</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20 overscroll-contain">
                    {siteContent.length === 0 && (
                      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
                        <Newspaper size={32} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum Conteúdo Publicado</p>
                      </div>
                    )}
                    {siteContent.slice(0, visibleCount).map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white/5 rounded-2xl group relative transition-all hover:bg-white/[0.08]">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover transition-all flex-shrink-0" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <div className="w-full sm:w-24 h-20 sm:h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-tight italic pr-8">
                              <span className={"text-[8px] px-2 py-0.5 rounded-sm mr-2 " + (
                                  item.content_type === 'news' ? 'bg-indigo-500 text-white' : 
                                  item.content_type === 'marketing' ? 'bg-emerald-500 text-white' : 
                                  'bg-amber-500 text-black'
                                )}>
                                  {item.content_type === 'news' ? 'Notícia' : 
                                   item.content_type === 'marketing' ? 'Marketing' : 
                                   item.content_type.replace('home_banner_', 'Banner ').toUpperCase()}
                              </span>
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                          {item.meta_value?.external_url && (
                            <a href={item.meta_value.external_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[10px] uppercase font-bold tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">Ver Fonte</a>
                          )}
                        </div>
                        <button onClick={() => handleDeleteContent(item.id)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;








