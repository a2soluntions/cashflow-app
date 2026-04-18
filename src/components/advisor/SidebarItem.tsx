import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SidebarItem = ({ label, icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 group ${
            active 
            ? 'bg-indigo-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] scale-[1.02]' 
            : 'text-slate-400 hover:bg-white/5'
        }`}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                {icon}
            </div>
            <span className="text-xs font-black uppercase tracking-tighter">{label}</span>
        </div>
        {active && <ChevronRight size={14} />}
    </button>
);