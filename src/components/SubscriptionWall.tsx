import React, { useState, useEffect, useCallback } from 'react';
import {
 Zap, Check, Copy, Clock, RefreshCw,
 ShieldCheck, Calendar, Infinity, AlertTriangle, XCircle
} from 'lucide-react';

interface Plan {
 id: string;
 label: string;
 price: number;
 period: string;
 days: number;
 highlight?: boolean;
 badge?: string;
}

const PLANS: Plan[] = [
 { id: 'monthly', label: 'Mensal', price: 19.90, period: '/mês', days: 30 },
 { id: 'annual', label: 'Anual', price: 149.90, period: '/ano', days: 365, highlight: true, badge: '🔥 Mais Popular' },
];

interface SubscriptionWallProps {
 userEmail: string;
 userId: string;
 trialDaysLeft: number; // negativo = expirado
 onSuccess: () => void;
}

type Stage = 'plans' | 'pix' | 'success' | 'error';

export default function SubscriptionWall({ userEmail, userId, trialDaysLeft, onSuccess }: SubscriptionWallProps) {
 const [stage, setStage] = useState<Stage>('plans');
 const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]);
 const [loading, setLoading] = useState(false);
 const [qrCode, setQrCode] = useState('');
 const [qrBase64, setQrBase64] = useState('');
 const [paymentId, setPaymentId] = useState('');
 const [copied, setCopied] = useState(false);
 const [pixTimer, setPixTimer] = useState(30 * 60); // 30 min em segundos
 const [errorMsg, setErrorMsg] = useState('');
 const isTrialExpired = trialDaysLeft <= 0;

 // ---- TIMER DO PIX ----
 useEffect(() => {
 if (stage !== 'pix') return;
 const interval = setInterval(() => {
 setPixTimer(t => {
 if (t <= 1) { clearInterval(interval); setStage('plans'); return 0; }
 return t - 1;
 });
 }, 1000);
 return () => clearInterval(interval);
 }, [stage]);

 const formatTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

 // ---- POLLING DE STATUS ----
 const pollPayment = useCallback(async (pid: string) => {
 const check = async () => {
 try {
 const res = await fetch(`/api/check-payment?payment_id=${pid}`);
 const data = await res.json();
 if (data.status === 'approved') {
 setStage('success');
 setTimeout(onSuccess, 2500);
 return;
 }
 if (data.status === 'rejected' || data.status === 'cancelled') {
 setStage('error');
 setErrorMsg('Pagamento recusado. Tente novamente.');
 return;
 }
 } catch (e) { /* rede, tentar novamente */ }
 setTimeout(check, 3000); // tenta de novo em 3 segundos
 };
 setTimeout(check, 3000);
 }, [onSuccess]);

 // ---- GERAR PIX ----
 const handleGeneratePix = async () => {
 setLoading(true);
 setErrorMsg('');
 try {
 const res = await fetch('/api/create-pix', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ planId: selectedPlan.id, email: userEmail, userId }),
 });
 const data = await res.json();
 if (!res.ok || !data.qr_code) throw new Error(data.error || 'Erro ao gerar PIX');
 setQrCode(data.qr_code);
 setQrBase64(data.qr_code_base64);
 setPaymentId(String(data.payment_id));
 setPixTimer(30 * 60);
 setStage('pix');
 pollPayment(String(data.payment_id));
 } catch (err: any) {
 setErrorMsg(err.message);
 } finally {
 setLoading(false);
 }
 };

 const copyPix = () => {
 navigator.clipboard.writeText(qrCode);
 setCopied(true);
 setTimeout(() => setCopied(false), 2500);
 };

 return (
 <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 font-sans">

 {/* === TELA: SUCESSO === */}
 {stage === 'success' && (
 <div className="flex flex-col items-center gap-6 animate-in zoom-in-90 duration-500 text-center">
 <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center -[0_0_60px_rgba(16,185,129,0.4)]">
 <ShieldCheck size={48} className="text-emerald-400" />
 </div>
 <div>
 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Acesso Liberado!</h2>
 <p className="text-emerald-400 font-bold text-sm mt-2 uppercase tracking-widest">Bem-vindo ao VittaCash</p>
 </div>
 <div className="w-48 h-1 bg-emerald-500/30 rounded-full overflow-hidden">
 <div className="h-full bg-emerald-500 animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '100%' }} />
 </div>
 </div>
 )}

 {/* === TELA: PLANOS === */}
 {stage === 'plans' && (
 <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
 {/* Header */}
 <div className="text-center mb-8">
 <div className="flex justify-center mb-4">
 <div className="px-4 py-1.5 bg-emerald-500/10 border-emerald-500/30 rounded-full">
 {isTrialExpired ? (
 <span className="text-rose-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
 <AlertTriangle size={12} /> Trial expirado — escolha um plano
 </span>
 ) : (
 <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
 <Clock size={12} /> {trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''} de trial
 </span>
 )}
 </div>
 </div>
 <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
 Liberdade<br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
 Financeira Real
 </span>
 </h1>
 <p className="text-slate-400 text-sm mt-3">
 Escolha seu plano e continue sua jornada de liberdade financeira.
 </p>
 </div>

 {/* Cards de plano */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 {PLANS.map(plan => (
 <button
 key={plan.id}
 onClick={() => setSelectedPlan(plan)}
 className={`relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 group
 ${selectedPlan.id === plan.id
 ? 'border-emerald-500 bg-emerald-500/10 -[0_0_40px_rgba(16,185,129,0.2)]'
 : 'border-white/10 bg-white/5 hover:border-white/20'
 }`}
 >
 {plan.badge && (
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full ">
 {plan.badge}
 </div>
 )}
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{plan.label}</p>
 <div className="flex items-baseline gap-1 mt-1">
 <span className="text-3xl font-black text-white">
 R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-slate-500 text-xs">{plan.period}</span>
 </div>
 </div>
 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan.id === plan.id ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'}`}>
 {selectedPlan.id === plan.id && <Check size={12} className="text-white" />}
 </div>
 </div>
 <ul className="space-y-2">
 {['Acesso completo a todos os módulos', 'Sincronização em nuvem (Supabase)', 'Consultor IA com 7 ferramentas', 'Suporte prioritário'].map(f => (
 <li key={f} className="flex items-center gap-2 text-[11px] text-slate-300">
 <Check size={12} className="text-emerald-500 shrink-0" /> {f}
 </li>
 ))}
 {plan.id === 'annual' && (
 <li className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
 <Infinity size={12} /> Equivale a R$ 12,49/mês — 37% off
 </li>
 )}
 </ul>
 </button>
 ))}
 </div>

 {errorMsg && (
 <div className="mb-4 p-3 bg-rose-500/10 border-rose-500/30 rounded-xl flex items-center gap-3">
 <XCircle size={16} className="text-rose-400 shrink-0" />
 <p className="text-rose-300 text-xs font-bold">{errorMsg}</p>
 </div>
 )}

 <button
 onClick={handleGeneratePix}
 disabled={loading}
 className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl -[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 text-sm"
 >
 {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
 {loading ? 'Gerando PIX...' : `Pagar R$ ${selectedPlan.price.toFixed(2).replace('.', ',')} via PIX`}
 </button>
 <p className="text-center text-slate-600 text-[10px] mt-3 uppercase tracking-widest">
 Pagamento 100% seguro · Ativação imediata
 </p>
 </div>
 )}

 {/* === TELA: QR CODE PIX === */}
 {stage === 'pix' && (
 <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
 <div className="bg-zinc-900 border-white/10 rounded-[3rem] p-8 -2xl">
 {/* Header */}
 <div className="text-center mb-6">
 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Pagamento PIX</p>
 <h2 className="text-xl font-black text-white uppercase tracking-tighter">
 {selectedPlan.label} — R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
 </h2>
 <div className="flex items-center justify-center gap-2 mt-2">
 <Clock size={12} className="text-amber-400" />
 <span className="text-amber-400 text-xs font-black font-mono">{formatTimer(pixTimer)}</span>
 <span className="text-slate-500 text-[10px]">para expirar</span>
 </div>
 </div>

 {/* QR Code */}
 <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-6 ">
 {qrBase64 ? (
 <img
 src={`data:image/png;base64,${qrBase64}`}
 alt="QR Code PIX"
 className="w-48 h-48 object-contain"
 />
 ) : (
 <div className="w-48 h-48 flex items-center justify-center">
 <RefreshCw className="text-slate-400 animate-spin" size={32} />
 </div>
 )}
 </div>

 {/* Pix Copia e Cola */}
 <div className="bg-black/40 border-white/10 rounded-xl p-3 mb-4">
 <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Pix Copia e Cola</p>
 <div className="flex items-center gap-2">
 <p className="text-[10px] text-slate-400 font-mono flex-1 truncate">{qrCode.substring(0, 40)}...</p>
 <button onClick={copyPix} className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
 {copied ? <><Check size={10} className="inline mr-1" />Copiado!</> : <><Copy size={10} className="inline mr-1" />Copiar</>}
 </button>
 </div>
 </div>

 {/* Status Polling */}
 <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest">
 <RefreshCw size={10} className="animate-spin" />
 Aguardando confirmação do pagamento...
 </div>

 <button
 onClick={() => { setStage('plans'); setErrorMsg(''); }}
 className="w-full mt-4 py-2 text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors"
 >
 ← Voltar aos planos
 </button>
 </div>
 </div>
 )}

 {/* === TELA: ERRO === */}
 {stage === 'error' && (
 <div className="flex flex-col items-center gap-6 text-center max-w-sm animate-in zoom-in-90">
 <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
 <XCircle size={40} className="text-rose-400" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-white uppercase">Pagamento Recusado</h2>
 <p className="text-slate-400 text-sm mt-2">{errorMsg}</p>
 </div>
 <button
 onClick={() => { setStage('plans'); setErrorMsg(''); }}
 className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
 >
 Tentar Novamente
 </button>
 </div>
 )}

 <style>{`
 @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
 `}</style>
 </div>
 );
}


