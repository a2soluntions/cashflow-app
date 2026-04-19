import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  Lock, Plus, Copy, RefreshCw, Trash2, ShieldCheck, 
  TrendingUp, DollarSign, Users, Calendar, Filter, Monitor
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const CORES_FUNIL = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC = () => {
  const [licenses, setLicenses] = useState<any[]>([]);
  
  // FORMULÁRIO
  const [clientName, setClientName] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [origin, setOrigin] = useState('Indicação');
  const [productType, setProductType] = useState('SaaS'); 
  const [loading, setLoading] = useState(false);

  const fetchLicenses = async () => {
    const { data } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLicenses(data);
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  // --- CÁLCULOS ESTRATÉGICOS (KPIs & GRÁFICOS) ---
  const stats = useMemo(() => {
    const totalRevenue = licenses.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const totalClients = licenses.length;
    const averageTicket = totalClients > 0 ? totalRevenue / totalClients : 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const salesThisMonth = licenses.filter(l => new Date(l.created_at).getMonth() === currentMonth);
    const revenueThisMonth = salesThisMonth.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    
    // 1. DADOS DO FUNIL (Origem)
    const funnelMap: Record<string, number> = {};
    licenses.forEach(l => {
        const source = l.origin || 'Outros';
        funnelMap[source] = (funnelMap[source] || 0) + 1;
    });
    const funnelData = Object.entries(funnelMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // 2. DADOS DO PRODUTO (Desktop vs SaaS)
    const productMap: Record<string, number> = { Desktop: 0, SaaS: 0 };
    licenses.forEach(l => {
        const type = l.product_type || 'SaaS';
        productMap[type] = (productMap[type] || 0) + 1;
    });
    const productData = [
        { name: 'SaaS (Web)', value: productMap['SaaS'] || 0, color: '#3b82f6' },
        { name: 'Desktop (.exe)', value: productMap['Desktop'] || 0, color: '#f59e0b' }
    ];

    // 3. DADOS DA EVOLUÇÃO (Timeline)
    const timelineMap: Record<string, number> = {};
    [...licenses].reverse().forEach(lic => {
        const date = new Date(lic.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        timelineMap[date] = (timelineMap[date] || 0) + (Number(lic.price) || 0);
    });
    const timelineData = Object.entries(timelineMap).map(([name, value]) => ({ name, value }));

    return { totalRevenue, totalClients, averageTicket, revenueThisMonth, funnelData, productData, timelineData };
  }, [licenses]);

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return alert("Digite o nome do cliente!");
    
    setLoading(true);
    const newKey = generateKey();
    const priceNumber = parseFloat(saleValue.replace(/\D/g, '')) / 100;

    try {
      const { error } = await supabase.from('licenses').insert([
        { 
          key: newKey, 
          client_name: clientName, 
          status: 'active',
          price: priceNumber || 0, 
          origin: origin,
          product_type: productType
        }
      ]);
      
      if (error) throw error;
      setClientName(''); setSaleValue(''); fetchLicenses();
      alert(`Venda Registrada!\nChave: ${newKey}`);
    } catch (err) { alert("Erro ao criar licença. Verifique se as colunas 'price', 'origin' e 'product_type' existem no Supabase."); } finally { setLoading(false); }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir o registro de "${name}"?`)) {
        try {
            await supabase.from('licenses').delete().eq('id', id);
            fetchLicenses();
        } catch (e) { alert("Erro ao excluir."); }
    }
  };


  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert("Copiado!"); };
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatInputCurrency = (val: string) => { if(!val) return ''; return (parseFloat(val.replace(/\D/g, '')) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

  return (
    <div className="h-full bg-slate-50 dark:bg-black font-inter text-slate-900 dark:text-white overflow-y-auto custom-scrollbar p-4 lg:p-8 rounded-[2.5rem]">
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl"><ShieldCheck className="w-8 h-8 text-amber-500" /></div>
            <div><h1 className="text-2xl font-black uppercase tracking-tighter">Visão do Administrador</h1><p className="text-slate-500 text-sm font-medium">Gestão de Vendas & Licenças</p></div>
        </div>

        {/* --- LINHA 1: KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-12 h-12" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Faturamento Total</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar className="w-12 h-12" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vendas (Mês)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.revenueThisMonth)}</h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-12 h-12" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Clientes Ativos</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalClients}</h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-12 h-12" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Médio</p>
                <h3 className="text-2xl font-black text-amber-500">{formatCurrency(stats.averageTicket)}</h3>
            </div>
        </div>

        {/* --- LINHA 2: GERADOR E GRÁFICOS SECUNDÁRIOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* 1. GERADOR DE LICENÇA (AGORA DA MESMA COR DO RESTO) */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm h-full">
                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-6 text-xs"><Plus className="w-4 h-4" /> Nova Venda</h3>
                <form onSubmit={handleCreateLicense} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Cliente</label>
                        <input type="text" placeholder="Nome do Cliente" className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Valor</label>
                            <input type="text" placeholder="R$ 0,00" className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm text-emerald-600" value={formatInputCurrency(saleValue)} onChange={e => setSaleValue(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Produto</label>
                            <select className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold text-xs cursor-pointer" value={productType} onChange={e => setProductType(e.target.value)}>
                                <option value="SaaS">SaaS (Web)</option>
                                <option value="Desktop">Desktop (.exe)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Origem (Funil)</label>
                        <select className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold text-xs cursor-pointer" value={origin} onChange={e => setOrigin(e.target.value)}>
                            <option>Indicação</option>
                            <option>Instagram</option>
                            <option>Google</option>
                            <option>A2 App</option>
                            <option>E-mail Marketing</option>
                            <option>Outro</option>
                        </select>
                    </div>

                    <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Lock className="w-4 h-4" />}
                        Gerar Licença
                    </button>
                </form>
            </div>

            {/* 2. PIZZA: MIX DE PRODUTOS */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
                <h3 className="font-black uppercase text-xs text-slate-400 mb-4 flex items-center gap-2"><Monitor className="w-4 h-4"/> Mix de Produtos</h3>
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.productData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.productData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '8px', border: 'none', color: '#fff'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalClients}</span>
                    </div>
                </div>
            </div>

            {/* 3. EVOLUÇÃO FINANCEIRA */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black uppercase text-xs text-slate-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Faturamento Diário</h3>
                    <span className="text-lg font-black text-emerald-500">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.timelineData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                            <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '8px', border: 'none', color: '#fff'}} formatter={(val:any) => formatCurrency(val)} />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* --- LINHA 3: FUNIL E HISTÓRICO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. FUNIL DE VENDAS */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-[400px]">
                <h3 className="font-black uppercase text-xs text-slate-400 mb-4 flex items-center gap-2"><Filter className="w-4 h-4"/> Origem (Funil)</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.funnelData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', borderRadius: '8px', border: 'none', color: '#fff'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.funnelData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CORES_FUNIL[index % CORES_FUNIL.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. LISTA DE HISTÓRICO (MAIS LARGA) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden h-[400px] flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Histórico de Vendas</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-black text-[9px] uppercase font-black text-slate-500 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 pl-6">Cliente / Produto</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Chave</th>
                                <th className="p-4 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {licenses.map(lic => (
                                <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                            {lic.client_name}
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase ${lic.product_type === 'Desktop' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{lic.product_type || 'SaaS'}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Filter className="w-3 h-3" /> {lic.origin || 'Direto'} • {new Date(lic.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </td>
                                    <td className="p-4 font-black text-emerald-600 text-xs">
                                        {formatCurrency(lic.price || 0)}
                                    </td>
                                    <td className="p-4 font-mono text-[10px] text-slate-500 select-all">{lic.key}</td>
                                    <td className="p-4 pr-6 flex items-center justify-end gap-2">
                                        <button onClick={() => copyToClipboard(lic.key)} className="p-2 bg-slate-100 dark:bg-black rounded-lg hover:text-emerald-500 transition-colors"><Copy className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete(lic.id, lic.client_name)} className="p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;