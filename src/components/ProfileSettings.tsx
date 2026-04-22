import React, { useState, useEffect, useRef } from 'react';
import { 
 User, Save, Camera, Mail, ShieldCheck, 
 MessageCircle, CheckCircle2, ArrowLeft, 
 Download, Upload, AlertOctagon, Database, X, AlertCircle,
 BellRing, BellOff, Loader2
} from 'lucide-react';
import logoA2 from '../assets/logo-a2.png'; 
import { useAuth } from './AuthProvider';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface ProfileSettingsProps {
 onUpdate: () => void;
 onClose: () => void;
 subscriptionPlan?: string;
 onNavigate?: (tab: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onUpdate, onClose, subscriptionPlan, onNavigate }) => {
 const [loading, setLoading] = useState(false);
 const [fullName, setFullName] = useState('');
 const [companyName, setCompanyName] = useState('');
 const [userEmail, setUserEmail] = useState('');
 const [userPhone, setUserPhone] = useState('');
 const [notificationChannel, setNotificationChannel] = useState<'email'|'whatsapp'|'both'>('both');
 const [avatarUrl, setAvatarUrl] = useState('');
 
 const { session } = useAuth();
 const { permission, subscribeUser, unsubscribeUser, loading: pushLoading } = usePushNotifications(session?.user?.id);
 
 // --- ESTADO DO TOAST CUSTOMIZADO (PADRÃO VITTA) ---
 const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

 const showInternalToast = (message: string, type: 'success' | 'error') => {
 setToast({ message, type });
 setTimeout(() => setToast(null), 3000);
 };

 const PROFILE_ID = 'desktop_user_v2'; 
 const fileInputRef = useRef<HTMLInputElement>(null);
 const backupInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 loadProfile();
 }, []);

 const loadProfile = async () => {
 const savedName = localStorage.getItem('vittacash_user_name');
 const savedCompany = localStorage.getItem('vittacash_user_company');
 const savedEmail = localStorage.getItem('vittacash_user_email');
 const savedPhone = localStorage.getItem('vittacash_user_phone');
 const savedChannel = localStorage.getItem('vittacash_notification_channel');
 const savedAvatar = localStorage.getItem('vittacash_user_avatar');
 if (savedName) setFullName(savedName);
 if (savedCompany) setCompanyName(savedCompany);
 if (savedEmail) setUserEmail(savedEmail);
 if (savedPhone) setUserPhone(savedPhone);
 if (savedChannel) setNotificationChannel(savedChannel as 'email'|'whatsapp'|'both');
 if (savedAvatar) setAvatarUrl(savedAvatar);
 };

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files?.[0]) {
 const reader = new FileReader();
 reader.readAsDataURL(e.target.files[0]);
 reader.onload = (event) => {
 setAvatarUrl(event.target?.result as string);
 showInternalToast('Avatar atualizado com sucesso!', 'success');
 };
 }
 };

 const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 let v = e.target.value.replace(/\D/g, '');
 if (v.length <= 11) {
 v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
 v = v.replace(/(\d)(\d{4})$/, '$1-$2');
 setUserPhone(v);
 }
 };

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 try {
 localStorage.setItem('vittacash_user_name', fullName);
 localStorage.setItem('vittacash_user_company', companyName);
 localStorage.setItem('vittacash_user_email', userEmail);
 localStorage.setItem('vittacash_user_phone', userPhone);
 localStorage.setItem('vittacash_notification_channel', notificationChannel);
 if (avatarUrl) localStorage.setItem('vittacash_user_avatar', avatarUrl);
 onUpdate(); 
 showInternalToast('Perfil e Notificações atualizados com sucesso!', 'success');
 } catch (err) {
 showInternalToast('Erro ao salvar dados.', 'error');
 }
 };

 const handleExportBackup = () => {
 try {
 const backupData = {
 transactions: localStorage.getItem('vittacash_pro_transactions'),
 profile: { name: fullName, company: companyName, avatar: avatarUrl },
 date: new Date().toISOString()
 };
 const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `VittaCash_Backup.json`;
 a.click();
 showInternalToast('Backup exportado com sucesso!', 'success');
 } catch (err) {
 showInternalToast('Falha na exportação.', 'error');
 }
 };

 return (
 <div className="h-full w-full flex flex-col bg-transparent animate-in fade-in duration-500 relative">
 
 {/* --- TOAST FLUTUANTE (PADRÃO LANÇAMENTO COM SUCESSO) --- */}
 {toast && (
 <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
 <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl -2xl ${
 toast.type === 'success' 
 ? 'bg-emerald-500/10 /20 text-emerald-400' 
 : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
 }`}>
 {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
 <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
 <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
 <X size={14} />
 </button>
 </div>
 </div>
 )}

 {/* HEADER */}
 <div className="flex items-center justify-between pb-8  border-white/5 mb-8">
 <div className="flex items-center gap-6">
 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
 <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#09090b] flex items-center justify-center transition-all group-hover:/50 dark:group-hover:border-[#00d06c]/50">
 {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="User" /> : <User className="w-12 h-12 text-slate-400 dark:text-zinc-800" />}
 </div>
 <div className="absolute -bottom-2 -right-2 bg-emerald-500 dark:bg-[#00d06c] p-2 rounded-lg text-white dark:text-black ">
 <Camera className="w-4 h-4" />
 </div>
 <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
 </div>
 <div>
 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{fullName || 'Comandante'}</h1>
 <p className="text-xs text-emerald-600 dark:text-[#00d06c] font-black uppercase tracking-[0.4em] flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#00d06c] animate-pulse" />
 {companyName || 'VittaCash System'}
 </p>
 </div>
 </div>
 <button onClick={onClose} className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-white text-[10px] font-black uppercase tracking-widest transition-all ">
 <ArrowLeft className="w-4 h-4" /> Voltar ao Hub
 </button>
 </div>

 {/* GRID DE CONTEÚDO */}
 <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
 
 {/* BANNER DE ASSINATURA */}
 <div className="mb-10 p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 dark:from-emerald-500/5 to-indigo-50 dark:to-indigo-500/5 flex flex-col md:flex-row items-center justify-between gap-6 ">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#09090b] flex items-center justify-center text-emerald-500 ">
 <Database size={28} />
 </div>
 <div>
 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Status da Assinatura</h3>
 <div className="flex items-center gap-2 mt-1">
 <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest leading-none">
 Plano {subscriptionPlan || 'Free'}
 </span>
 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ativo</span>
 </div>
 </div>
 </div>
 <button 
 onClick={() => onNavigate?.('sales')}
 className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all active:scale-95"
 >
 Ver Vantagens & Planos
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
 
 {/* LADO A: FORMULÁRIO */}
 <div className="space-y-12">
 <section>
 <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
 <div className="w-6 h-[1px] bg-zinc-800" /> Perfil do Usuário
 </h2>
 <form onSubmit={handleSave} className="space-y-4">
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase ml-2">Nome do Titular</label>
 <input 
 type="text" 
 value={fullName} 
 onChange={e => setFullName(e.target.value)} 
 className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:/40 dark:focus:border-[#00d06c]/40 focus:bg-white dark:focus:bg-white/[0.07] transition-all "
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase ml-2">Organização</label>
 <input 
 type="text" 
 value={companyName} 
 onChange={e => setCompanyName(e.target.value)} 
 className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:/40 dark:focus:border-[#00d06c]/40 focus:bg-white dark:focus:bg-white/[0.07] transition-all "
 />
 </div>
 <button type="submit" className="w-full py-4 mt-4 rounded-2xl bg-emerald-500 dark:bg-[#00d06c] text-white dark:text-black font-black uppercase text-xs tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
 <Save className="w-4 h-4" /> Atualizar Credenciais
 </button>
 </form>
 </section>

 <section>
 <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
 <div className="w-6 h-[1px] bg-zinc-800" /> Backup de Segurança
 </h2>
 <div className="grid grid-cols-2 gap-4">
 <button onClick={handleExportBackup} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all group ">
 <Download className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
 <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Exportar JSON</span>
 </button>
 <button onClick={() => backupInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all ">
 <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
 <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Restaurar Dados</span>
 </button>
 <input type="file" ref={backupInputRef} className="hidden" />
 </div>
 </section>
 </div>

 {/* LADO B: NOTIFICAÇÕES WEB/PWA */}
 <div className="space-y-12">
 <section>
 <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
 <div className="w-6 h-[1px] bg-zinc-800" /> Central de Notificações
 </h2>
 <div className="flex flex-col gap-6">
 <div>
 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Alertas VittaCash</h3>
 <p className="text-emerald-500 dark:text-[#00d06c] text-[10px] font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-2"><CheckCircle2 size={12}/> Sincronização Web Ativa</p>
 <p className="text-xs text-slate-500 dark:text-zinc-500 mt-3 leading-relaxed">
 Cadastre seus contatos para receber relatórios de desempenho e ser alertado sobre contas próximas do vencimento diretamente no seu aparelho.
 </p>
 </div>
 
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase ml-2 flex items-center gap-2"><Mail size={12}/> E-mail Principal</label>
 <input 
 type="email" 
 value={userEmail} 
 onChange={e => setUserEmail(e.target.value)} 
 placeholder="seu@email.com"
 className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:/40 dark:focus:border-[#00d06c]/40 focus:bg-white dark:focus:bg-white/[0.07] transition-all "
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase ml-2 flex items-center gap-2"><MessageCircle size={12}/> WhatsApp (Com DDD)</label>
 <input 
 type="tel" 
 value={userPhone} 
 onChange={handlePhoneChange} 
 placeholder="(11) 99999-9999"
 maxLength={15}
 className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:/40 dark:focus:border-[#00d06c]/40 focus:bg-white dark:focus:bg-white/[0.07] transition-all "
 />
 </div>
 
 <div className="space-y-3 pt-4">
 <label className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase ml-2 flex items-center gap-2">Canal Preferencial de Alertas</label>
 <div className="grid grid-cols-3 gap-2">
 <button 
 type="button"
 onClick={() => setNotificationChannel('email')}
 className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${notificationChannel === 'email' ? 'bg-emerald-50 dark:bg-[#00d06c]/20   text-emerald-600 dark:text-[#00d06c]' : 'bg-slate-50 dark:bg-white/[0.02]   text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}
 >
 E-mail
 </button>
 <button 
 type="button"
 onClick={() => setNotificationChannel('whatsapp')}
 className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${notificationChannel === 'whatsapp' ? 'bg-emerald-50 dark:bg-[#00d06c]/20   text-emerald-600 dark:text-[#00d06c]' : 'bg-slate-50 dark:bg-white/[0.02]   text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}
 >
 WhatsApp
 </button>
 <button 
 type="button"
 onClick={() => setNotificationChannel('both')}
 className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${notificationChannel === 'both' ? 'bg-emerald-50 dark:bg-[#00d06c]/20   text-emerald-600 dark:text-[#00d06c]' : 'bg-slate-50 dark:bg-white/[0.02]   text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}
 >
 Em Ambos
 </button>
 </div>
 </div>

 <div className="pt-6 border-t   space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 {permission === 'granted' ? <BellRing size={14} className="text-emerald-500 dark:text-[#00d06c]" /> : <BellOff size={14} className="text-slate-500 dark:text-zinc-500" />}
 Notificações Push (PWA)
 </h4>
 <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 uppercase font-bold">Alertas diretos no aparelho</p>
 </div>
 <button
 type="button"
 disabled={pushLoading}
 onClick={permission === 'granted' ? unsubscribeUser : subscribeUser}
 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
 permission === 'granted' 
 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
 : 'bg-[#00d06c]/10 border-[#00d06c]/20 text-[#00d06c] hover:bg-[#00d06c]/20'
 }`}
 >
 {pushLoading ? <Loader2 size={12} className="animate-spin" /> : (permission === 'granted' ? 'Desativar' : 'Ativar')}
 </button>
 </div>
 <div className="p-3 rounded-xl bg-orange-500/5 border-orange-500/10 mb-4">
 <p className="text-[9px] text-orange-400/80 leading-relaxed font-medium">
 <AlertCircle size={10} className="inline mr-1 mb-0.5" />
 Para receber em tempo real, certifique-se de que as notificações do navegador estão permitidas no sistema operacional.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="pt-8 border-t  ">
 <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] ">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#09090b] flex items-center justify-center ">
 <img src={logoA2} alt="A2" className="w-8 h-8 grayscale opacity-70" />
 </div>
 <div>
 <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">A2 Solutions</p>
 <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold">Suporte Direto</p>
 </div>
 </div>
 <div className="flex gap-2">
 <a href="https://wa.me/5534998408962" className="p-3 bg-emerald-500 dark:bg-[#00d06c] hover:brightness-110 rounded-xl transition-all text-white dark:text-black -emerald-500/10"><MessageCircle className="w-5 h-5" /></a>
 </div>
 </div>
 </section>
 </div>
 </div>
 </div>
 </div>
 );
};

export default ProfileSettings;



