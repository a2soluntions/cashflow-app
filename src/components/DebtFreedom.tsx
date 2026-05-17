import React, { useState, useEffect, useMemo } from 'react';
import { 
 ShieldAlert, Plus, Trash2, Target, MessageSquare, Copy, 
 TrendingUp, Calculator, PieChart as PieIcon, Wallet
} from 'lucide-react';
import { 
 PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
// --- TIPOS ---
interface Debt {
 id: number;
 name: string;
 amount: number;
 interest: number;
}

type StrategyType = 'avalanche' | 'snowball';
type TabType = 'debt' | 'invest';
type ProfileType = 'conservative' | 'moderate' | 'bold';

const DebtFreedom = () => {
 // --- ESTADOS GERAIS ---
 const [activeTab, setActiveTab] = useState<TabType>('debt');

 // --- ESTADOS DE DÍVIDAS ---
 const [debts, setDebts] = useState<Debt[]>(() => {
 const saved = localStorage.getItem('a2financas_debts_desktop');
 return saved ? JSON.parse(saved) : [];
 });
 const [strategy, setStrategy] = useState<StrategyType>('avalanche');
 const [newName, setNewName] = useState('');
 const [newAmount, setNewAmount] = useState('');
 const [newInterest, setNewInterest] = useState('');
 const [activeScript, setActiveScript] = useState<string | null>(null);

 // --- ESTADOS DE INVESTIMENTO ---
 const [invMonthly, setInvMonthly] = useState(500);
 const [invYears, setInvYears] = useState(10);
 const [invRate, setInvRate] = useState(10); // 10% a.a.
 const [profile, setProfile] = useState<ProfileType>('conservative');

 // --- EFEITOS ---
 useEffect(() => {
 localStorage.setItem('a2financas_debts_desktop', JSON.stringify(debts));
 }, [debts]);

 // --- LÓGICA DE DÍVIDAS ---
 const handleAddDebt = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newName || !newAmount) return;
 setDebts([...debts, { id: Date.now(), name: newName, amount: Number(newAmount), interest: Number(newInterest) }]);
 setNewName(''); setNewAmount(''); setNewInterest('');
 };

 const sortedDebts = [...debts].sort((a, b) => strategy === 'avalanche' ? b.interest - a.interest : a.amount - b.amount);
 const totalDebt = debts.reduce((a, b) => a + b.amount, 0);
 const avgDebtInterest = debts.length > 0 ? debts.reduce((a, b) => a + b.interest, 0) / debts.length : 0;

 // --- LÓGICA DE INVESTIMENTO ---
 const investmentResult = useMemo(() => {
 const rateMonth = Math.pow(1 + (invRate / 100), 1 / 12) - 1;
 const months = invYears * 12;
 
 // Fórmula Juros Compostos com Aporte Mensal (FV)
 // FV = P * (((1 + r)^n - 1) / r) * (1+r) (para aportes no início do período)
 const total = invMonthly * ( (Math.pow(1 + rateMonth, months) - 1) / rateMonth ) * (1 + rateMonth);
 const invested = invMonthly * months;
 const interest = total - invested;

 return { total: total || 0, invested: invested || 0, interest: interest || 0 };
 }, [invMonthly, invYears, invRate]);

 const allocationData = useMemo(() => {
 if (profile === 'conservative') {
 return [
 { name: 'Tesouro Selic/CDB', value: 80, color: '#10b981' },
 { name: 'LCI/LCA (Isento)', value: 20, color: '#34d399' }
 ];
 } else if (profile === 'moderate') {
 return [
 { name: 'Renda Fixa', value: 50, color: '#10b981' },
 { name: 'Crédito Privado', value: 30, color: '#3b82f6' },
 { name: 'FIIs/Ações', value: 20, color: '#f59e0b' }
 ];
 } else {
 return [
 { name: 'Reserva', value: 30, color: '#94a3b8' },
 { name: 'IPCA+', value: 30, color: '#3b82f6' },
 { name: 'Renda Variável', value: 40, color: '#8b5cf6' }
 ];
 }
 }, [profile]);

 // Scripts
 const scriptsText = {
 discount: "Olá,\n\nEstou entrando em contato para negociar a quitação do contrato [Número]. Tenho interesse em regularizar minha situação e possuo um valor para pagamento à vista.\n\nQual o desconto máximo para quitação total hoje?",
 parcel: "Prezados,\n\nGostaria de propor um parcelamento. Reconheço a dívida, mas os juros atuais inviabilizam o pagamento mensal.\n\nProponho uma entrada de R$ [Valor] e parcelas fixas que caibam no meu orçamento, sem juros abusivos.",
 fees: "Olá,\n\nNotei a incidência de juros excessivos na minha fatura.\n\nSolicito o recálculo da dívida considerando apenas o valor principal e correção monetária justa (INPC), retirando juros de mora acumulados."
 };

 const DEBT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'];

 return (
 <div className="animate-in fade-in zoom-in-95 h-full flex flex-col gap-6 p-1 pb-10">
 
 {/* HEADER + TABS */}
 <div className="flex flex-col sm:flex-row justify-between items-center    pb-4 gap-4">
 <div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
 <Wallet className="w-6 h-6 text-emerald-600" />
 Gestão & Futuro
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400">Resolva o passado ou planeje o futuro.</p>
 </div>

 <div className="flex bg-slate-100 dark:bg-white/5 p-1">
 <button 
 onClick={() => setActiveTab('debt')}
 className={`px-6 py-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'debt' ? 'bg-white dark:bg-zinc-800 text-rose-600 ' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
 >
 <ShieldAlert className="w-4 h-4"/> Sair das Dívidas
 </button>
 <button 
 onClick={() => setActiveTab('invest')}
 className={`px-6 py-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'invest' ? 'bg-white dark:bg-zinc-800 text-emerald-600 ' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
 >
 <TrendingUp className="w-4 h-4"/> Começar a Investir
 </button>
 </div>
 </div>

 {/* ======================= */}
 {/* ABA 1: SAIR DAS DÍVIDAS */}
 {/* ======================= */}
 {activeTab === 'debt' && (
 <div className="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
 
 {/* Coluna Esquerda: Cadastro */}
 <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
 <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 relative overflow-hidden border border-white/5">
 <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
 <Plus className="w-4 h-4 text-rose-500"/> Cadastrar Pendência
 </h3>
 <form onSubmit={handleAddDebt} className="space-y-4">
 <input type="text" placeholder="Nome (Ex: Cartão Visa)" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-rose-500/40 dark:text-white" />
 <div className="grid grid-cols-2 gap-3">
 <input type="number" placeholder="Valor (R$)" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-rose-500/40 dark:text-white" />
 <input type="number" placeholder="Juros %" value={newInterest} onChange={e => setNewInterest(e.target.value)} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-rose-500/40 dark:text-white" />
 </div>
 <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 transition-all active:scale-95 text-[10px] uppercase tracking-widest">Adicionar</button>
 </form>
 </div>

 {/* Card Totais */}
 <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 flex justify-between items-center border border-white/5">
 <div>
 <p className="text-[9px] font-black tracking-widest text-slate-500 dark:text-zinc-500 uppercase italic">Total Devido</p>
 <p className="text-2xl font-black italic tracking-tighter text-rose-500">R$ {totalDebt.toLocaleString()}</p>
 </div>
 <div className="text-right">
 <p className="text-[9px] font-black tracking-widest text-slate-500 dark:text-zinc-500 uppercase italic">Juros Médio</p>
 <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white">{avgDebtInterest.toFixed(1)}%</p>
 </div>
 </div>
 </div>

 {/* Coluna Direita: Estratégia */}
 <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
 <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 flex-1 border border-white/5">
 <div className="flex justify-between items-center mb-6">
 <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide"><Target className="w-5 h-5 text-rose-500"/> Plano de Ataque</h3>
 <div className="flex bg-slate-50 dark:bg-white/[0.03] p-1 ">
 <button onClick={() => setStrategy('avalanche')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${strategy === 'avalanche' ? 'bg-white dark:bg-[#00d06c] text-emerald-600 dark:text-black' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white'}`}>Avalanche (Matemático)</button>
 <button onClick={() => setStrategy('snowball')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${strategy === 'snowball' ? 'bg-white dark:bg-[#00d06c] text-emerald-600 dark:text-black' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white'}`}>Bola de Neve (Psicológico)</button>
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-6">
 {/* Lista */}
 <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
 {debts.length === 0 ? <p className="text-center text-slate-400 py-10 text-sm italic">Adicione dívidas ao lado para gerar o plano.</p> : sortedDebts.map((d, i) => (
 <div key={d.id} className={`flex items-center p-4 ${i===0 ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20' : 'bg-white dark:bg-white/[0.02]  '}`}>
 <div className={`w-8 h-8 flex items-center justify-center font-black text-[10px] mr-4 ${i===0 ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-500'}`}>{i+1}</div>
 <div className="flex-1">
 <div className="flex justify-between">
 <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tighter italic">{d.name}</span>
 <span className="font-black text-sm text-slate-900 dark:text-white italic">R$ {d.amount.toLocaleString()}</span>
 </div>
 <div className="flex justify-between mt-1 items-center">
 <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Juros: {d.interest}% a.m.</span>
 <button onClick={() => setDebts(debts.filter(x => x.id !== d.id))} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-3 h-3"/></button>
 </div>
 </div>
 </div>
 ))}
 </div>
 {/* Gráfico Dívidas */}
 {debts.length > 0 && (
 <div className="w-full lg:w-1/3 h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={debts} dataKey="amount" innerRadius={40} outerRadius={60} paddingAngle={5}>
 {debts.map((_, i) => <Cell key={i} fill={DEBT_COLORS[i % DEBT_COLORS.length]} />)}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>

 {/* Scripts */}
 <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 border border-white/5">
 <h3 className="font-bold text-slate-700 dark:text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wide"><MessageSquare className="w-4 h-4 text-emerald-500 dark:text-[#00d06c]"/> Scripts de Negociação</h3>
 <div className="flex gap-2 mb-4 flex-wrap">
 {Object.keys(scriptsText).map(key => (
 <button key={key} onClick={() => setActiveScript(key)} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeScript === key ? 'bg-emerald-50 dark:bg-[#00d06c]/10 border-emerald-500 dark:border-[#00d06c] text-emerald-600 dark:text-[#00d06c]' : '  text-slate-500 dark:text-zinc-500 hover:border-emerald-500/50 dark:hover:border-[#00d06c]/50'}`}>{key}</button>
 ))}
 </div>
 <div className="relative">
 <textarea readOnly value={activeScript ? scriptsText[activeScript as keyof typeof scriptsText] : "Selecione um script..."} className="w-full h-24 p-4 text-sm bg-slate-50 dark:bg-white/[0.02] resize-none outline-none text-slate-600 dark:text-zinc-300 italic"></textarea>
 {activeScript && <button onClick={() => {navigator.clipboard.writeText(scriptsText[activeScript as keyof typeof scriptsText]); alert('Copiado!')}} className="absolute top-3 right-3 p-2 bg-white dark:bg-[#09090b]/50 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors "><Copy className="w-4 h-4 text-slate-500 dark:text-zinc-400"/></button>}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ========================== */}
 {/* ABA 2: COMEÇAR A INVESTIR */}
 {/* ========================== */}
 {activeTab === 'invest' && (
 <div className="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
 
 {/* Coluna Esquerda: Calculadora */}
 <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 relative overflow-hidden border border-white/5">
  <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
  <Calculator className="w-4 h-4 text-emerald-500"/> Simulador de Futuro
  </h3>
  
  <div className="space-y-4">
  <div>
  <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Aporte Mensal (R$)</label>
  <input type="number" value={invMonthly} onChange={e => setInvMonthly(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm font-black text-emerald-500 dark:text-[#00d06c] outline-none focus:border-emerald-500/40 dark:focus:border-[#00d06c]/40" />
  </div>
  <div className="grid grid-cols-2 gap-3">
  <div>
  <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Anos</label>
  <input type="number" value={invYears} onChange={e => setInvYears(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-emerald-500/40 dark:focus:border-[#00d06c]/40 dark:text-white" />
  </div>
  <div>
  <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1 block mb-1">Taxa Anual %</label>
  <input type="number" value={invRate} onChange={e => setInvRate(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-emerald-500/40 dark:focus:border-[#00d06c]/40 dark:text-white" />
  </div>
  </div>
  </div>
  </div>

 {/* Resultado Calc */}
  <div className="bg-slate-900 dark:bg-white/5 backdrop-blur-xl text-white p-8 relative overflow-hidden border border-white/5">
  <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-32 h-32 text-emerald-500 dark:text-[#00d06c]"/></div>
  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2 italic">Você terá acumulado</p>
  <p className="text-4xl font-black text-emerald-400 dark:text-[#00d06c] mb-6 italic tracking-tighter">R$ {investmentResult.total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
  
  <div className="pt-6 border-t border-slate-800  flex justify-between text-[10px] font-black uppercase tracking-widest italic">
  <span className="text-slate-500 dark:text-zinc-500">Investido: <b className="text-white">R$ {investmentResult.invested.toLocaleString()}</b></span>
  <span className="text-emerald-500 dark:text-[#00d06c]">Juros: <b>R$ {investmentResult.interest.toLocaleString(undefined, {maximumFractionDigits: 0})}</b></span>
  </div>
  </div>
 </div>

 {/* Coluna Direita: Perfil e Alocação */}
 <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
  <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 lg:p-8 flex-1 border border-white/5">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
  <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide"><PieIcon className="w-5 h-5 text-indigo-500"/> Sugestão de Carteira</h3>
  
  <div className="flex bg-slate-50 dark:bg-white/[0.03] p-1 w-full sm:w-auto">
  <button onClick={() => setProfile('conservative')} className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'conservative' ? 'bg-emerald-500 dark:bg-[#00d06c] text-white dark:text-black ' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500'}`}>Conservador</button>
  <button onClick={() => setProfile('moderate')} className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'moderate' ? 'bg-indigo-500 dark:bg-indigo-500 text-white ' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500'}`}>Moderado</button>
  <button onClick={() => setProfile('bold')} className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'bold' ? 'bg-purple-500 dark:bg-purple-500 text-white ' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500'}`}>Arrojado</button>
  </div>
  </div>

 <div className="flex flex-col lg:flex-row gap-8 items-center">
 <div className="w-full lg:w-1/2 space-y-4">
 {profile === 'conservative' && (
 <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-emerald-100 dark:border-emerald-900/20 text-sm text-emerald-800 dark:text-emerald-200">
 <p className="font-bold mb-1">Perfil Segurança Total</p>
 <p className="opacity-80 text-xs">Foco em não perder dinheiro. Ideal para Reserva de Emergência ou objetivos de curto prazo (até 2 anos).</p>
 </div>
 )}
 {profile === 'moderate' && (
 <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl lue-100 dark:lue-900/20 text-sm text-blue-800 dark:text-blue-200">
 <p className="font-bold mb-1">Perfil Equilibrado</p>
 <p className="opacity-80 text-xs">Aceita um pouco de risco para ganhar acima da inflação. Carteira clássica de diversificação.</p>
 </div>
 )}
 {profile === 'bold' && (
 <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border-purple-100 dark:border-purple-900/20 text-sm text-purple-800 dark:text-purple-200">
 <p className="font-bold mb-1">Perfil Construtor de Riqueza</p>
 <p className="opacity-80 text-xs">Foco no longo prazo (5+ anos). Aceita oscilações mensais em troca de maior rentabilidade final.</p>
 </div>
 )}

 {/* Lista Dinâmica */}
 <ul className="space-y-2 mt-4 border-t   pt-4">
 {allocationData.map((item, i) => (
 <li key={i} className="flex items-center justify-between text-sm p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors">
 <div className="flex items-center gap-3">
 <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">{item.name}</span>
 </div>
 <span className="font-black italic text-slate-900 dark:text-white">{item.value}%</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Gráfico Alocação */}
 <div className="w-full lg:w-1/2 h-[220px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={allocationData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
 {allocationData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
 </Pie>
 <Tooltip contentStyle={{backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff'}} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Cards Educativos Rápidos */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="bg-emerald-50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border-emerald-100 dark:border-white/5">
 <h4 className="font-black text-slate-800 dark:text-emerald-400 text-[10px] uppercase tracking-widest mb-2 italic">Tesouro Selic / CDB</h4>
 <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">O porto seguro. Você empresta dinheiro para o governo ou banco. Risco baixíssimo.</p>
 </div>
  <div className="bg-purple-50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border-purple-100 dark:border-white/5">
 <h4 className="font-black text-slate-800 dark:text-purple-400 text-[10px] uppercase tracking-widest mb-2 italic">FIIs (Fundos Imobiliários)</h4>
 <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">Compre pedaços de shoppings e galpões. Receba aluguéis isentos de IR todo mês.</p>
 </div>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default DebtFreedom;



