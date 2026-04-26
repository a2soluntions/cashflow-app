import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SidebarItem = ({ label, icon, active, onClick }: any) => (
 <button 
 onClick={onClick}
 className={`w-auto flex items-center justify-center px-3 md:px-4 py-2 md:py-3 transition-all duration-500 group shrink-0 ${
 active 
 ? 'bg-indigo-600 text-white shadow-lg md:scale-[1.02]' 
 : 'text-slate-400 hover:bg-white/5'
 }`}
 >
 <div className="flex items-center gap-2">
 <div className={`p-1 transition-colors ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
 {icon}
 </div>
 <span className="hidden md:inline text-[10px] font-black uppercase tracking-tighter">{label}</span>
 </div>
 {active && <ChevronRight size={14} className="hidden md:inline" />}
 </button>
);
