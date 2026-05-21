import React, { useState } from 'react';
import { 
  Plus, Settings, LayoutGrid, Target, 
  BarChart3, Brain, Sun, CheckCircle2, 
  Calendar, AppWindow, Fingerprint, Moon, LogOut,
  ShieldAlert, X, TrendingUp, ShieldCheck, Zap, Newspaper
} from 'lucide-react';
import NetworkBackground from './NetworkBackground';

interface HomeHubProps {
  onNavigate: (tabId: string) => void;
  onNewTransaction: () => void; 
  currentTheme: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange';
  onToggleTheme: (theme: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange') => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  userAvatar?: string | null;
}

export function HomeHub({ onNavigate, onNewTransaction, currentTheme, onToggleTheme, isAdmin, onLogout, userAvatar }: HomeHubProps) {
 const isLight = currentTheme === 'white' || currentTheme === 'white-orange';
 const isOrange = currentTheme === 'black-orange' || currentTheme === 'white-orange';
 const [showExitConfirm, setShowExitConfirm] = useState(false);

 const getNextTheme = (): 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange' => {
   if (currentTheme === 'blue') return 'black';
   if (currentTheme === 'black') return 'white';
   if (currentTheme === 'white') return 'black-orange';
   if (currentTheme === 'black-orange') return 'white-orange';
   return 'blue';
 };

 // Mapeamento dos módulos (11 itens na órbita)
 const GRADIENT_COLORS = [
  { from: '#f43f5e', to: '#fb923c' },
  { from: '#fb923c', to: '#fbbf24' },
  { from: '#fbbf24', to: '#fde047' },
  { from: '#fde047', to: '#a3e635' },
  { from: '#a3e635', to: '#4ade80' },
  { from: '#4ade80', to: '#10b981' },
  { from: '#10b981', to: '#2dd4bf' },
  { from: '#2dd4bf', to: '#22d3ee' },
  { from: '#22d3ee', to: '#3b82f6' },
  { from: '#3b82f6', to: '#6366f1' },
  { from: '#6366f1', to: '#8b5cf6' },
  { from: '#8b5cf6', to: '#a855f7' },
  { from: '#a855f7', to: '#d946ef' },
  { from: '#d946ef', to: '#ec4899' },
  { from: '#ec4899', to: '#f43f5e' }
 ];

 const rawMenuItems = [
  { id: 'add', label: 'Lançar', icon: <Plus size={22} />, action: onNewTransaction },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} />, action: () => onNavigate('dashboard') },
  { id: 'investments', label: 'Carteira', icon: <TrendingUp size={20} />, action: () => onNavigate('investments') },
  { id: 'categories', label: 'Categorias', icon: <AppWindow size={20} />, action: () => onNavigate('categories') },
  { id: 'contas', label: 'Contas', icon: <CheckCircle2 size={20} />, action: () => onNavigate('contas') },
  { id: 'history', label: 'Histórico', icon: <Calendar size={20} />, action: () => onNavigate('history') },
  { id: 'theme', label: `Tema: ${currentTheme === 'blue' ? 'Azul' : currentTheme === 'black' ? 'Preto' : currentTheme === 'white' ? 'Branco' : currentTheme === 'black-orange' ? 'Preto Laranja' : 'Branco Laranja'}`, icon: isLight ? <Moon size={20} /> : <Sun size={20} />, action: () => onToggleTheme(getNextTheme()) },
  { id: 'advisor', label: 'Consultor IA', icon: <Brain size={20} />, action: () => onNavigate('advisor') },
  { id: 'report', label: 'Relatórios', icon: <BarChart3 size={20} />, action: () => onNavigate('report') },
  { id: 'freedom', label: 'Liberdade $', icon: <ShieldAlert size={20} />, action: () => onNavigate('freedom') },
  { id: 'target', label: 'A2 Horizons', icon: <Target size={20} />, action: () => onNavigate('target') },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={20} />, action: () => onNavigate('settings') },
  ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, action: () => onNavigate('admin') }] : []),
  {id: 'sales', label: 'Planos & Pro', icon: <Zap size={20} />, action: () => onNavigate('sales') },
  { id: 'noticias', label: 'A2 Notícias', icon: <Newspaper size={20} />, action: () => window.open('/noticias', '_blank') },
  { id: 'exit', label: 'Sair', icon: <LogOut size={20} />, isExit: true, action: () => setShowExitConfirm(true) }, 
 ];

 const menuItems = rawMenuItems.map((item, index) => {
   if (item.isExit) return { ...item, grad: { from: '#334155', to: '#0f172a' } };
   if (isOrange) return { ...item, grad: { from: '#f97316', to: '#ea580c' } };
   return { ...item, grad: GRADIENT_COLORS[index % GRADIENT_COLORS.length] };
 });

 const confirmExit = () => {
   if (onLogout) {
     onLogout();
   } else {
     window.close();
     window.location.reload(); 
   }
 };

  const radius = 240; 
 const totalItems = menuItems.length;

 return (
 <div className="relative min-h-full w-full flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden bg-transparent custom-scrollbar md:py-8">
 
 {/* EFEITO DE PARTÍCULAS EM REDE */}
 <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
    <NetworkBackground 
        particleColor={isLight ? '0, 0, 0' : '255, 255, 255'} 
        lineColor={isLight ? '0, 0, 0' : '255, 255, 255'} 
    />
 </div>

 {/* 🌌 SISTEMA ORBITAL (DESKTOP) */}
  <div className={`hidden md:flex relative items-center justify-center w-[650px] h-[650px] transition-all duration-700 ${showExitConfirm ? 'blur-sm scale-95 opacity-50' : 'animate-in fade-in zoom-in'}`}>
 {/* NÚCLEO CENTRAL */}
 <div className="relative z-50 group transition-all duration-700">
  <div className="flex items-center justify-center transition-all relative">
    <img src="/icon.png" alt="A2 Mentor" className="w-56 h-56 object-cover z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-full" />
  </div>
 </div>

 {/* ÍCONES ORBITAIS */}
 {menuItems.map((item, index) => {
 const angle = (index * (360 / totalItems)) - 90;
 const x = radius * Math.cos(angle * (Math.PI / 180));
 const y = radius * Math.sin(angle * (Math.PI / 180));
 return (
  <div key={item.id} className="absolute z-40 flex flex-col items-center group transition-all duration-700" style={{ transform: `translate(${x}px, ${y}px)` }}>
  <button 
    onClick={item.action} 
    className="p-5 text-white transition-all duration-300 hover:scale-125 hover:rotate-[360deg] active:scale-95 shadow-lg group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]" 
    style={{ 
      background: `linear-gradient(135deg, ${item.grad.from}, ${item.grad.to})`, 
      boxShadow: `0 10px 30px ${item.grad.from}66` 
    }}
  >
  {item.icon}
  </button>
  <span className={`absolute ${item.id === 'add' ? 'top-20' : (x >= 0 ? 'left-24' : 'right-24')} ${item.id === 'add' ? '' : 'top-1/2 -translate-y-1/2'} opacity-0 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-300 pointer-events-none whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-slate-900' : 'text-white'} z-[100]`}>
  {item.label}
  </span>
  </div>
 );
 })}

 {/* ANÉIS DECORATIVOS (Bordas Removidas) */}
 <div className={`absolute w-[480px] h-[480px] rounded-full opacity-5 bg-gradient-to-r ${isLight ? 'from-slate-200 to-transparent' : 'from-white/10 to-transparent'}`} />
 <div className={`absolute w-[480px] h-[480px] rounded-full opacity-5 ${isOrange ? (isLight ? 'bg-orange-600/5' : 'bg-orange-400/5') : (isLight ? 'bg-indigo-600/5' : 'bg-indigo-400/5')}`} />
 </div>

 {/* 📱 SISTEMA EM GRID (MOBILE) */}
 <div className={`md:hidden flex flex-col items-center w-full px-3 pt-3 pb-4 transition-all duration-700 z-10 ${showExitConfirm ? 'blur-sm scale-95 opacity-50' : 'animate-in fade-in slide-in-from-bottom-8'}`}>
 <div className="relative mb-3 group shrink-0">
 <div className={`absolute inset-0 blur-3xl rounded-full scale-[2] animate-pulse ${isOrange ? (isLight ? 'bg-orange-400/20' : 'bg-orange-500/20') : (isLight ? 'bg-indigo-400/20' : 'bg-indigo-500/20')}`} />
 <img src="/icon.png" alt="A2 Mentor" className="w-14 h-14 object-cover relative z-10 rounded-full" />
 </div>

 <div className="grid grid-cols-4 gap-2 w-full">
 {menuItems.map((item) => (
 <button 
 key={item.id} 
 onClick={item.action} 
 className="flex flex-col items-center gap-1.5 group active:scale-90 transition-all"
 >
 <div 
 className="w-14 h-14 text-white flex items-center justify-center group-hover:scale-110 transition-transform rounded-xl" 
 style={{ 
   background: `linear-gradient(135deg, ${item.grad.from}, ${item.grad.to})`, 
   boxShadow: `0 4px 12px ${item.grad.from}40` 
 }}
 >
 {item.icon}
 </div>
 <span className={`text-[8px] font-black uppercase tracking-wide text-center leading-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
 {item.label}
 </span>
 </button>
 ))}
 </div>
 </div>

 {/* 🚪 MODAL DE FECHAMENTO CUSTOMIZADO */}
 {showExitConfirm && (
 <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
 <div className={`w-[400px] p-8 animate-in zoom-in slide-in-from-bottom-8 duration-500 -2xl ${
 isLight ? 'bg-white' : 'bg-[#0f0f12] -[0_0_50px_rgba(0,0,0,0.5)]'
 }`}>
 <div className="flex flex-col items-center text-center">
 <div className="w-16 h-16 bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
 <ShieldAlert size={32} />
 </div>
 
 <h2 className={`text-xl font-black uppercase tracking-tighter mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
 Encerrar Sessão?
 </h2>
 <p className={`text-xs font-medium leading-relaxed opacity-60 px-6 mb-8 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
 Você está prestes a fechar o A2 Mentor. Certifique-se de que todos os lançamentos foram salvos.
 </p>

 <div className="flex gap-4 w-full">
 <button 
 onClick={() => setShowExitConfirm(false)}
 className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
 isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
 }`}
 >
 Cancelar
 </button>
 <button 
 onClick={confirmExit}
 className="flex-1 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 -rose-600/20 active:scale-95 transition-all"
 >
 Confirmar Saída
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* FOOTER */}
 <footer className="mt-12 w-full flex flex-col items-center gap-2 select-none pointer-events-none pb-8 shrink-0">
 <div className="flex items-center gap-4">
 <div className={`h-[1px] w-12 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
 <Fingerprint size={14} className={isLight ? 'text-indigo-600 opacity-60' : 'text-indigo-400 opacity-40'} />
 <div className={`h-[1px] w-12 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
 </div>
 <div className="flex flex-col items-center gap-0.5">
 <p className={`text-[9px] font-black uppercase tracking-[0.6em] ${isLight ? 'text-slate-900' : 'text-white'}`}>A2 Mentor</p>
 <p className={`text-[7px] font-bold uppercase tracking-[0.4em] ${isLight ? 'text-slate-400' : isOrange ? 'text-orange-200 opacity-30' : 'text-indigo-200 opacity-30'}`}>
 Desenvolvido por <span className={isLight ? (isOrange ? 'text-orange-600 font-black' : 'text-indigo-600 font-black') : (isOrange ? 'text-orange-400' : 'text-indigo-400')}>A2Solutions</span>
 </p>
 </div>
 </footer>
 </div>
 );
}
