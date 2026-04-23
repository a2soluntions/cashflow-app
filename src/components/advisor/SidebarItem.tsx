import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SidebarItem = ({ label, icon, active, onClick }: any) => (
 <button 
 onClick={onClick}
 className={`w-auto md:w-full flex items-center justify-center md:justify-between px-4 md:px-6 py-4 md:py-5 transition-all duration-500 group shrink-0 ${
 active 
 ? 'bg-indigo-600 text-white -[0_10px_20px_rgba(79,70,229,0.3)] md: -[0_20px_50px_rgba(79,70,229,0.3)] md:scale-[1.02]' 
 : 'text-slate-400 hover:bg-white/5'
 }`}
 >
 <div className="flex items-center md:gap-4">
 <div className={`p-2 transition-colors ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
 {icon}
 </div>
 <span className="hidden md:inline text-xs font-black uppercase tracking-tighter">{label}</span>
 </div>
 {active && <ChevronRight size={14} className="hidden md:inline" />}
 </button>
);
