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

 // FORMULÁRIO CONTEÚDO
 const [newsTitle, setNewsTitle] = useState('');
 const [newsDesc, setNewsDesc] = useState('');
 const [newsImg, setNewsImg] = useState('');
 const [newsUrl, setNewsUrl] = useState('');
 const [contentType, setContentType] = useState('news');
 const [indicators, setIndicators] = useState<any>({
 SELIC: { value: '', symbol: '%' },
 IPCA: { value: '', symbol: '%' },
 INPC: { value: '', symbol: '%' },
 DÓLAR: { value: '', symbol: 'R$' },
 BITCOIN: { value: '', symbol: 'R$' }
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

 useEffect(() => { fetchData(); 

    const channel = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', table: 'site_content', schema: 'public' }, () => fetchData())
      .on('postgres_changes', { event: '*', table: 'licenses', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
 content_type: contentType, 
 title: newsTitle, 
 description: newsDesc, 
 image_url: newsImg,
 is_active: true,
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
 <div className="h-full font-inter overflow-hidden p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col">
 <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0">
 
 {/* HEADER & TABS */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
 <div className="flex items-center gap-4">
  <div className="p-3 bg-emerald-500/10"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
 <div><h1 className="text-2xl font-black uppercase tracking-tighter italic">Vitta Admin</h1><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">SaaS Management Center</p></div>
 </div>
 
 <div className="flex bg-slate-100 dark:bg-white/5 p-1 ">
 <button onClick={() => setActiveTab('vendas')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vendas' ? 'bg-emerald-500 text-black -emerald-500/20' : 'text-slate-500 hover:text-emerald-500'}`}>
 Vendas & KPIS
 </button>
 <button onClick={() => setActiveTab('conteudo')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'conteudo' ? 'bg-emerald-500 text-black -emerald-500/20' : 'text-slate-500 hover:text-emerald-500'}`}>
 Site & Notícias
 </button>
 </div>
 </div>

 {activeTab === 'vendas' ? (
 <div className="animate-in fade-in duration-500">
 {/* KPI CARDS */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
 {[
 { label: 'Receita Vitalícia', val: formatCurrency(stats.totalRevenue), color: 'text-emerald-500' },
 { label: 'Vendas (Mês)', val: formatCurrency(stats.revenueThisMonth), color: 'text-slate-900 dark:text-white' },
 { label: 'Clientes Base', val: stats.totalClients, color: 'text-slate-900 dark:text-white' },
 { label: 'Ticket Médio', val: formatCurrency(stats.averageTicket), color: 'text-blue-500' }
 ].map((kpi, idx) => (
 <div key={idx} className="bg-transparent    pb-4 transition-all ">
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
 <h3 className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</h3>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-6">
 <div className="text-slate-900 dark:text-white">
 <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Plus size={16}/> Registrar Venda</h3>
 <form onSubmit={handleCreateLicense} className="space-y-6">
 <div>
 <input className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Cliente" value={clientName} onChange={e => setClientName(e.target.value)} required />
 </div>
 <div>
 <input className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Valor R$ 0,00" value={saleValue} onChange={e => setSaleValue(e.target.value)} required />
 </div>
 <div className="grid grid-cols-2 gap-4 mt-2">
  <select className="bg-slate-100 dark:bg-white/5 p-4 font-bold text-sm outline-none  transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={productType} onChange={e => setProductType(e.target.value)}>
 <option value="SaaS" className="bg-white dark:bg-[#09090b]">SaaS</option>
 <option value="Desktop" className="bg-white dark:bg-[#09090b]">Desktop</option>
 </select>
 <select className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl font-bold text-sm outline-none  transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={origin} onChange={e => setOrigin(e.target.value)}>
 <option className="bg-white dark:bg-[#09090b]">Instagram</option>
 <option className="bg-white dark:bg-[#09090b]">A2 App</option>
 <option className="bg-white dark:bg-[#09090b]">Indicação</option>
 </select>
 </div>
 <button className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase text-xs text-black active:scale-95 transition-all -emerald-500/20 mt-4 hover:bg-emerald-400">Salvar Licença</button>
 </form>
 </div>
 <div className="lg:col-span-2 flex flex-col h-[400px]">
 <div className="pb-4    flex justify-between items-center mb-6">
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
 <div className="animate-in slide-in-from-right-4 duration-500 space-y-6 mt-6 flex-1 flex flex-col min-h-0">
 
 {/* INDEXADORES FINANCEIROS */}
 <div>
 <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-6 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
 {['SELIC', 'IPCA', 'INPC', 'DÓLAR', 'BITCOIN'].map(key => (
 <div key={key} className="   pb-3 group">
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

 {/* NOTÍCIAS */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
 <div className="text-slate-900 dark:text-white">
 <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Newspaper size={16}/> Compor Conteúdo</h3>
 <form onSubmit={handleAddNews} className="space-y-4">
 <div>
 <select className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none  transition-colors text-slate-500 focus:text-slate-900 dark:focus:text-white" value={contentType} onChange={e => setContentType(e.target.value)}>
 <option value="news" className="bg-white dark:bg-[#09090b]">Notícia (Radar)</option>
 <option value="marketing" className="bg-white dark:bg-[#09090b]">Marketing (Radar)</option>
  <option value="home_banner_left" className="bg-white dark:bg-[#09090b]">Banner Esquerdo (Home)</option>
  <option value="home_banner_right" className="bg-white dark:bg-[#09090b]">Banner Direito (Home)</option>
 </select>
 </div>
 <div>
 <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Título da Notícia" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} required />
 </div>
 <div>
 <textarea className="w-full bg-transparent p-3 rounded-lg font-bold text-sm outline-none h-24  transition-colors placeholder:text-slate-400 custom-scrollbar" placeholder="Descrição curta (Call to action ou resumo da notícia)" value={newsDesc} onChange={e => setNewsDesc(e.target.value)} required />
 </div>
 <div>
 <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Link da Imagem (URL completa)" value={newsImg} onChange={e => setNewsImg(e.target.value)} />
 </div>
 <div>
 <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Link Externo / Fonte (Opcional)" value={newsUrl} onChange={e => setNewsUrl(e.target.value)} />
 </div>
 <button className="w-full bg-emerald-500 text-black py-3 rounded-lg font-black uppercase text-xs tracking-widest -emerald-500/20 active:scale-95 transition-all mt-2 hover:bg-emerald-400">Publicar no Radar</button>
 </form>
 </div>

 <div className="lg:col-span-2 flex flex-col min-h-0">
 <div className="pb-4    flex justify-between items-center mb-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Feed Ativo (Conteúdos)</h3>
 <span className="text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full ">{siteContent.filter(c => c.content_type === 'news' || c.content_type === 'marketing').length} Item(ns) Ativo(s)</span>
 </div>
 <div className="overflow-y-auto flex-1 space-y-4 custom-scrollbar pr-4">
 {siteContent.filter(c => c.content_type === 'news' || c.content_type === 'marketing').length === 0 && (
 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-50 border-dashed border-slate-300  rounded-2xl">
 <Newspaper size={32} className="mb-4" />
 <p className="text-sm font-bold uppercase tracking-widest">Nenhum Conteúdo Publicado</p>
 </div>
 )}
 {siteContent.filter(c => c.content_type === 'news' || c.content_type === 'marketing').map((item, i) => (
 <div key={item.id} className="flex gap-5 p-5 bg-transparent rounded-2xl group relative transition-all ">
 {item.image_url ? (
 <img src={item.image_url} className="w-24 h-24 rounded-xl object-cover transition-all" />
 ) : (
 <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">
 <ImageIcon size={32} />
 </div>
 )}
 <div className="flex-1 overflow-hidden">
 <div className="flex justify-between items-start mb-2">
 <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-tight italic pr-8">
 <span className={`text-[8px] px-2 py-0.5 rounded-sm mr-2 ${item.content_type === 'news' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
 {item.content_type === 'news' ? 'Notícia' : 'Marketing'}
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
 );
};

export default AdminDashboard;



