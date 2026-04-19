import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, LogOut } from 'lucide-react';
// 1. IMPORTANDO A LOGO CORRETAMENTE
import logoVitta from '../assets/logo.png'; 

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function Sidebar({ activeTab, onNavigate }: SidebarProps) {
  
  // Função auxiliar para deixar o botão bonito (ativo ou inativo)
  const getButtonClass = (tabName: string) => {
    const baseClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm";
    return activeTab === tabName
      ? `${baseClass} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` // Estilo Ativo
      : `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800/50`;            // Estilo Inativo
  };

  return (
    <aside className="w-72 bg-[#0f172a] border-r border-slate-800 p-6 flex flex-col h-screen fixed left-0 top-0">
      
      {/* --- ÁREA DA LOGO --- */}
      <div className="mb-10 px-2">
        <img 
          src={logoVitta} 
          alt="VittaCash" 
          className="h-10 object-contain" // Ajuste o tamanho (h-10, h-12) conforme sua logo
        />
      </div>

      {/* --- MENU DE NAVEGAÇÃO --- */}
      <nav className="space-y-2 flex-1">
        
        <button onClick={() => onNavigate('dashboard')} className={getButtonClass('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Visão Geral</span>
        </button>

        <button onClick={() => onNavigate('transactions')} className={getButtonClass('transactions')}>
          <ArrowRightLeft size={20} />
          <span>Transações</span>
        </button>

        <button onClick={() => onNavigate('budget')} className={getButtonClass('budget')}>
          <Wallet size={20} />
          <span>Orçamento</span>
        </button>

        {/* Adicione outros botões aqui se precisar */}
      </nav>

      {/* --- RODAPÉ DO MENU --- */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
        <button onClick={() => onNavigate('settings')} className={getButtonClass('settings')}>
          <Settings size={20} />
          <span>Configurações</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-medium">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}