import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  Lock, Plus, Copy, RefreshCw, Trash2, ShieldCheck, 
  TrendingUp, DollarSign, Users, Calendar, Filter, Monitor,
  Newspaper, Save, Image as ImageIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const CORES_FUNIL = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'conteudo'>('vendas');
  const [licenses, setLicenses] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  
  // FORMULÁRIO LICENÇAS
  const [clientName, setClientName] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [origin, setOrigin] = useState('Indicação');
  const [productType, setProductType] = useState('SaaS'); 
  const [loading, setLoading] = useState(false);

  // FORMULÁRIO CONTEÚDO
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsImg, setNewsImg] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [indicators, setIndicators] = useState<any>({
    SELIC: { value: '', symbol: '%' },
    IPCA: { value: '', symbol: '%' },
    DÓLAR: { value: '', symbol: 'R$' }
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: licData } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
    if (licData) setLicenses(licData);

    const { data: contData } = await supabase.from('site_content').select('*').order('created_at', { ascending: false });
    if (contData) {
        setSiteContent(contData);
        const inds = contData.filter(c => c.content_type === 'indicator');
        const newInds = { ...indicators };
        inds.forEach(i => {
            if (newInds[i.title]) {
                newInds[i.title].value = i.meta_value?.value || '';
            }
        });
        setIndicators(newInds);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- CÁLCULOS VENDAS ---
  const stats = useMemo(() => {
    const totalRevenue = licenses.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const totalClients = licenses.length;
    const averageTicket = totalClients > 0 ? totalRevenue / totalClients : 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const salesThisMonth = licenses.filter(l => new Date(l.created_at).getMonth() === currentMonth);
    const revenueThisMonth = salesThisMonth.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    
    const funnelMap: Record<string, number> = {};
    licenses.forEach(l => { funnelMap[l.origin || 'Outros'] = (funnelMap[l.origin || 'Outros'] || 0) + 1; });
    const funnelData = Object.entries(funnelMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const productMap: Record<string, number> = { Desktop: 0, SaaS: 0 };
    licenses.forEach(l => { productMap[l.product_type || 'SaaS'] = (productMap[l.product_type || 'SaaS'] || 0) + 1; });
    const productData = [
        { name: 'SaaS', value: productMap['SaaS'] || 0, color: '#3b82f6' },
        { name: 'Desktop', value: productMap['Desktop'] || 0, color: '#f59e0b' }
    ];

    const timelineMap: Record<string, number> = {};
    [...licenses].reverse().forEach(lic => {
        const date = new Date(lic.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        timelineMap[date] = (timelineMap[date] || 0) + (Number(lic.price) || 0);
    });
    const timelineData = Object.entries(timelineMap).map(([name, value]) => ({ name, value }));

    return { totalRevenue, totalClients, averageTicket, revenueThisMonth, funnelData, productData, timelineData };
  }, [licenses]);

  // --- AÇÕES LICENÇAS ---
  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newKey = Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
    const priceNumber = parseFloat(saleValue.replace(/\D/g, '')) / 100;
    try {
      await supabase.from('licenses').insert([{ key: newKey, client_name: clientName, status: 'active', price: priceNumber || 0, origin, product_type: productType }]);
      setClientName(''); setSaleValue(''); fetchData();
      alert(`Chave Gerada: ${newKey}`);
    } catch (err) { alert("Erro ao criar."); } finally { setLoading(false); }
  };

  // --- AÇÕES CONTEÚDO ---
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await supabase.from('site_content').insert([{ 
          content_type: 'news', 
          title: newsTitle, 
          description: newsDesc, 
          image_url: newsImg,
          meta_value: { external_url: newsUrl }
        }]);
        setNewsTitle(''); setNewsDesc(''); setNewsImg(''); setNewsUrl(''); fetchData();
    } catch (e) { alert("Erro ao salvar notícia."); } finally { setLoading(false); }
  };

  const handleUpdateIndicator = async (title: string) => {
    setLoading(true);
    try {
        await supabase.from('site_content').update({ 
            meta_value: { value: indicators[title].value, symbol: indicators[title].symbol } 
        }).eq('content_type', 'indicator').eq('title', title);
        alert(`${title} atualizado!`);
    } catch (e) { alert("Erro ao atualizar indicador."); } finally { setLoading(false); }
  };

  const handleDeleteContent = async (id: string) => {
    if (confirm("Excluir este item?")) {
        await supabase.from('site_content').delete().eq('id', id);
        fetchData();
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="h-full bg-slate-50 dark:bg-black font-inter text-slate-900 dark:text-white overflow-y-auto custom-scrollbar p-4 lg:p-8 rounded-[2.5rem]">
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
                <div><h1 className="text-2xl font-black uppercase tracking-tighter italic">Vitta Admin</h1><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">SaaS Management Center</p></div>
            </div>
            
            <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <button onClick={() => setActiveTab('vendas')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vendas' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>
                    Vendas & KPIS
                </button>
                <button onClick={() => setActiveTab('conteudo')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'conteudo' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>
                    Site & Notícias
                </button>
            </div>
        </div>

        {activeTab === 'vendas' ? (
          <div className="animate-in fade-in duration-500">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Receita Vitalícia</p>
                    <h3 className="text-2xl font-black text-emerald-400">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vendas (Mês)</p>
                    <h3 className="text-2xl font-black text-white">{formatCurrency(stats.revenueThisMonth)}</h3>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Clientes Base</p>
                    <h3 className="text-2xl font-black text-white">{stats.totalClients}</h3>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Médio</p>
                    <h3 className="text-2xl font-black text-blue-400">{formatCurrency(stats.averageTicket)}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[3rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-6 text-xs"><Plus size={16}/> Registrar Venda</h3>
                    <form onSubmit={handleCreateLicense} className="space-y-4">
                        <input className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-emerald-500" placeholder="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
                        <input className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-emerald-500" placeholder="Valor R$ 0,00" value={saleValue} onChange={e => setSaleValue(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className="bg-black border border-white/10 p-3 rounded-xl font-bold text-xs" value={productType} onChange={e => setProductType(e.target.value)}>
                                <option value="SaaS">SaaS</option>
                                <option value="Desktop">Desktop</option>
                            </select>
                            <select className="bg-black border border-white/10 p-3 rounded-xl font-bold text-xs" value={origin} onChange={e => setOrigin(e.target.value)}>
                                <option>Instagram</option>
                                <option>A2 App</option>
                                <option>Indicação</option>
                            </select>
                        </div>
                        <button className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase text-xs text-black active:scale-95 transition-all">Salvar Licença</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-200 dark:border-zinc-800 p-6 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.timelineData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                            <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '12px', border: 'none'}} />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
            
            {/* INDEXADORES FINANCEIROS */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-8 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['SELIC', 'IPCA', 'DÓLAR'].map(key => (
                        <div key={key} className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{key}</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    className="bg-transparent text-xl font-black text-white w-full outline-none focus:text-blue-400" 
                                    value={indicators[key].value} 
                                    onChange={e => setIndicators({ ...indicators, [key]: { ...indicators[key], value: e.target.value } })}
                                    placeholder="0.00"
                                />
                                <span className="text-slate-500 font-black">{indicators[key].symbol}</span>
                                <button onClick={() => handleUpdateIndicator(key)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Save size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* NOTÍCIAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-6 text-xs"><Newspaper size={16}/> Compor Notícia</h3>
                    <form onSubmit={handleAddNews} className="space-y-4">
                        <input className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none" placeholder="Título" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} required />
                        <textarea className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none h-24" placeholder="Descrição curta" value={newsDesc} onChange={e => setNewsDesc(e.target.value)} required />
                        <input className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none" placeholder="Link da Imagem" value={newsImg} onChange={e => setNewsImg(e.target.value)} />
                        <input className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl font-bold text-sm outline-none" placeholder="Link Externo (Fonte)" value={newsUrl} onChange={e => setNewsUrl(e.target.value)} />
                        <button className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95">Publicar no Radar</button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[480px]">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Feed Ativo (Radar)</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar">
                        {siteContent.filter(c => c.content_type === 'news').map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 group relative">
                                {item.image_url && <img src={item.image_url} className="w-20 h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all"/>}
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs mb-1">{item.title}</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                                </div>
                                <button onClick={() => handleDeleteContent(item.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl self-start transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;