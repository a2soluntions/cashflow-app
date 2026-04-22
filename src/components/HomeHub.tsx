import React, { useState } from 'react';
import { 
 Plus, Settings, LayoutGrid, Target, 
 BarChart3, Brain, Sun, CheckCircle2, 
 Calendar, AppWindow, Fingerprint, Moon, LogOut,
 ShieldAlert, X, TrendingUp, ShieldCheck, Zap
} from 'lucide-react';

interface HomeHubProps {
 onNavigate: (tabId: string) => void;
 onNewTransaction: () => void; 
 currentTheme: 'light' | 'dark';
 onToggleTheme: () => void;
 isAdmin?: boolean;
 onLogout?: () => void;
}

export function HomeHub({ onNavigate, onNewTransaction, currentTheme, onToggleTheme, isAdmin, onLogout }: HomeHubProps) {
 const isLight = currentTheme === 'light';
 const [showExitConfirm, setShowExitConfirm] = useState(false);

 // Mapeamento dos módulos (11 itens na órbita)
 const menuItems = [
 { id: 'add', label: 'Lançar', icon: <Plus size={22} />, color: 'bg-[#00f2ad]', action: onNewTransaction },
 { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} />, color: 'bg-blue-500', action: () => onNavigate('dashboard') },
 { id: 'investments', label: 'Carteira', icon: <TrendingUp size={20} />, color: 'bg-sky-500', action: () => onNavigate('investments') },
 { id: 'categories', label: 'Categorias', icon: <AppWindow size={20} />, color: 'bg-pink-500', action: () => onNavigate('categories') },
 { id: 'contas', label: 'Contas', icon: <CheckCircle2 size={20} />, color: 'bg-emerald-500', action: () => onNavigate('contas') },
 { id: 'history', label: 'Histórico', icon: <Calendar size={20} />, color: 'bg-rose-500', action: () => onNavigate('history') },
 { id: 'theme', label: 'Alternar Tema', icon: isLight ? <Moon size={20} /> : <Sun size={20} />, color: 'bg-amber-500', action: onToggleTheme },
 { id: 'advisor', label: 'Consultor IA', icon: <Brain size={20} />, color: 'bg-violet-600', action: () => onNavigate('advisor') },
 { id: 'report', label: 'Relatórios', icon: <BarChart3 size={20} />, color: 'bg-indigo-500', action: () => onNavigate('report') },
 { id: 'freedom', label: 'Liberdade $', icon: <ShieldAlert size={20} />, color: 'bg-teal-600', action: () => onNavigate('freedom') },
 { id: 'target', label: 'Vitta Horizons', icon: <Target size={20} />, color: 'bg-orange-600', action: () => onNavigate('target') },
 { id: 'settings', label: 'Ajustes', icon: <Settings size={20} />, color: 'bg-slate-500', action: () => onNavigate('settings') },
 ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, color: 'bg-amber-600', action: () => onNavigate('admin') }] : []),
 {id: 'sales', label: 'Planos & Pro', icon: <Zap size={20} />, color: 'bg-emerald-600', action: () => onNavigate('sales') },
 { id: 'exit', label: 'Sair', icon: <LogOut size={20} />, color: 'bg-rose-600', action: () => setShowExitConfirm(true) }, 
 ];

 const confirmExit = () => {
   if (onLogout) {
     onLogout();
   } else {
     window.close();
     window.location.reload(); 
   }
 };

 const radius = isAdmin ? 290 : 265; 
 const totalItems = menuItems.length;

 return (
 <div className="relative h-full w-full flex items-center justify-center overflow-hidden bg-transparent">
 
 {/* 🌌 SISTEMA ORBITAL (DESKTOP) */}
 <div className={`hidden md:flex relative items-center justify-center w-[650px] h-[650px] transition-all duration-700 ${showExitConfirm ? 'blur-sm scale-95 opacity-50' : 'animate-in fade-in zoom-in'}`}>
 {/* NÚCLEO CENTRAL */}
 <div className="relative z-50 group transition-all duration-700">
 <div className={`absolute inset-0 blur-[100px] rounded-full animate-pulse ${isLight ? 'bg-indigo-400/20' : 'bg-indigo-500/30'}`} />
 <div className={`w-72 h-72 rounded-full flex items-center justify-center -2xl transition-all relative overflow-hidden ${isLight ? 'bg-white' : 'bg-[#0a0a0c]'}`}>
 <img src="./icon.png" alt="VittaCash" className="w-48 h-auto object-contain z-10 transition-transform duration-700 group-hover:scale-110" />
 </div>
 </div>

 {/* ÍCONES ORBITAIS */}
 {menuItems.map((item, index) => {
 const angle = (index * (360 / totalItems)) - 90;
 const x = radius * Math.cos(angle * (Math.PI / 180));
 const y = radius * Math.sin(angle * (Math.PI / 180));
 return (
 <div key={item.id} className="absolute z-40 flex flex-col items-center group transition-all duration-700" style={{ transform: `translate(${x}px, ${y}px)` }}>
 <span className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none whitespace-nowrap bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white py-1.5 px-4 rounded-lg border-white/10 -2xl">
 {item.label}
 </span>
 <button onClick={item.action} className={`p-4 rounded-2xl ${item.color} text-white transition-all duration-300 hover:scale-125 hover:rotate-[360deg] active:scale-90`} style={{ boxShadow : `0 0 25px ${item.color}55` }}>
 {item.icon}
 </button>
 </div>
 );
 })}

 {/* ANÉIS DECORATIVOS (Bordas Removidas) */}
 <div className={`absolute w-[480px] h-[480px] rounded-full opacity-5 bg-gradient-to-r ${isLight ? 'from-slate-200 to-transparent' : 'from-white/10 to-transparent'}`} />
 <div className={`absolute w-[480px] h-[480px] rounded-full opacity-5 ${isLight ? 'bg-indigo-600/5' : 'bg-indigo-400/5'}`} />
 </div>

 {/* 📱 SISTEMA EM GRID (MOBILE) */}
 <div className={`md:hidden flex flex-col items-center w-full max-w-sm px-4 pb-16 transition-all duration-700 z-10 ${showExitConfirm ? 'blur-sm scale-95 opacity-50' : 'animate-in fade-in slide-in-from-bottom-8'}`}>
 <div className="relative mb-8 group">
 <div className={`absolute inset-0 blur-3xl rounded-full scale-[2] animate-pulse ${isLight ? 'bg-indigo-400/20' : 'bg-indigo-500/20'}`} />
 <img src="./icon.png" alt="VittaCash" className="w-24 h-auto object-contain relative z-10 drop- -2xl" />
 </div>

 <div className="grid grid-cols-3 gap-6 w-full">
 {menuItems.map((item) => (
 <button 
 key={item.id} 
 onClick={item.action} 
 className="flex flex-col items-center gap-3 group active:scale-90 transition-all"
 >
 <div 
 className={`w-16 h-16 rounded-2xl ${item.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`} 
 style={{ boxShadow : `0 8px 25px ${item.color}40` }}
 >
 {item.icon}
 </div>
 <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
 {item.label}
 </span>
 </button>
 ))}
 </div>
 </div>

 {/* 🚪 MODAL DE FECHAMENTO CUSTOMIZADO */}
 {showExitConfirm && (
 <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
 <div className={`w-[400px] p-8 rounded-[2.5rem] animate-in zoom-in slide-in-from-bottom-8 duration-500 -2xl ${
 isLight ? 'bg-white' : 'bg-[#0f0f12] -[0_0_50px_rgba(0,0,0,0.5)]'
 }`}>
 <div className="flex flex-col items-center text-center">
 <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
 <ShieldAlert size={32} />
 </div>
 
 <h2 className={`text-xl font-black uppercase tracking-tighter mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
 Encerrar Sessão?
 </h2>
 <p className={`text-xs font-medium leading-relaxed opacity-60 px-6 mb-8 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
 Você está prestes a fechar o VittaCash. Certifique-se de que todos os lançamentos foram salvos.
 </p>

 <div className="flex gap-4 w-full">
 <button 
 onClick={() => setShowExitConfirm(false)}
 className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
 isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
 }`}
 >
 Cancelar
 </button>
 <button 
 onClick={confirmExit}
 className="flex-1 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 -rose-600/20 active:scale-95 transition-all"
 >
 Confirmar Saída
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* FOOTER */}
 <footer className="absolute bottom-10 w-full flex flex-col items-center gap-3 select-none pointer-events-none">
 <div className="flex items-center gap-4">
 <div className={`h-[1px] w-12 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
 <Fingerprint size={16} className={isLight ? 'text-indigo-600 opacity-60' : 'text-indigo-400 opacity-40'} />
 <div className={`h-[1px] w-12 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
 </div>
 <div className="flex flex-col items-center gap-1">
 <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${isLight ? 'text-slate-900' : 'text-white'}`}>VittaCash</p>
 <p className={`text-[8px] font-bold uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-indigo-200 opacity-40'}`}>
 Desenvolvido por <span className={isLight ? 'text-indigo-600 font-black' : 'text-indigo-400'}>A2Solutions</span>
 </p>
 </div>
 </footer>
 </div>
 );
}

