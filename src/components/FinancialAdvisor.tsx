import React, { useState } from 'react';
import { Activity, Zap, GraduationCap, Wallet, FileText, Brain } from 'lucide-react';

// --- IMPORTAÇÕES DOS SUB-MÓDULOS ---
import { SidebarItem } from './advisor/SidebarItem'; 
import { DashboardOverview } from './advisor/DashboardOverview';
import { ExtraIncomeModule } from './advisor/ExtraIncomeModule';
import { PsychologyModule } from './advisor/PsychologyModule'; 
import { InvestmentRadar } from './advisor/InvestmentRadar';
import { FinanceQuiz } from './FinanceQuiz';
import ConsultantReport from './advisor/ConsultantReport';

interface FinancialAdvisorProps {
  currentBalance: number;
  transactions: any[];
  categories?: any[];
  theme?: 'light' | 'dark';
}

export function FinancialAdvisor({ currentBalance, transactions, theme = 'dark' }: FinancialAdvisorProps) {
  const [activeTab, setActiveTab] = useState('welcome');
  const isLight = theme === 'light';

  return (
    <div className="h-auto md:h-full w-full flex flex-col md:flex-row p-2 md:p-4 overflow-visible md:overflow-hidden transition-colors duration-500 pb-16 md:pb-4">
      
      {/* 🟢 BARRA LATERAL FLUTUANTE (TAB HORIZONTAL NO MOBILE) */}
      <aside className="w-full md:w-80 flex flex-row md:flex-col gap-2 md:gap-4 z-10 md:pr-6 shrink-0 py-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto no-scrollbar mb-4 md:mb-0">
        <div className={`rounded-[2rem] p-2 md:p-4 transition-all flex flex-row md:flex-col gap-2 shrink-0 ${
          isLight ? 'bg-white/70 shadow-md md:shadow-xl' : 'bg-white/5 backdrop-blur-2xl shadow-lg md:shadow-2xl'
        }`}>
            <p className="hidden md:block px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-1 italic">Consultoria</p>
            <SidebarItem label="Painel Consultor" icon={<Activity size={20}/>} active={activeTab === 'welcome'} onClick={() => setActiveTab('welcome')} />
            <SidebarItem label="Radar do Mercado" icon={<Activity size={20}/>} active={activeTab === 'radar'} onClick={() => setActiveTab('radar')} />
            <SidebarItem label="Diagnóstico" icon={<FileText size={20}/>} active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
        </div>

        <div className={`rounded-[2rem] p-2 md:p-4 transition-all flex flex-row md:flex-col gap-2 shrink-0 ${
          isLight ? 'bg-white/70 shadow-md md:shadow-xl' : 'bg-white/5 backdrop-blur-2xl shadow-lg md:shadow-2xl'
        }`}>
            <p className="hidden md:block px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-1 italic">Universidade</p>
            <SidebarItem label="Mente & Armadilhas" icon={<Brain size={20}/>} active={activeTab === 'psychology'} onClick={() => setActiveTab('psychology')} />
            <SidebarItem label="Renda Extra" icon={<Zap size={20}/>} active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
            <SidebarItem label="Desafio Quiz" icon={<GraduationCap size={20}/>} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
        </div>
      </aside>

      {/* 🔵 ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-visible md:overflow-hidden relative h-auto md:h-full">
          <div className="h-auto md:h-full w-full p-2 md:p-4 md:px-10 pb-10">
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                  {/* 1. Painel Consultor (Agora com Velocímetros e Texto Editorial) */}
                  {activeTab === 'welcome' && <DashboardOverview {...({ theme, transactions } as any)} />}
                  
                  {/* 2. Diagnóstico Raio-X */}
                  {activeTab === 'report' && <ConsultantReport theme={theme} transactions={transactions} currentBalance={currentBalance} />}
                  
                  {/* 3. Radar de Investimentos */}
                  {activeTab === 'radar' && <InvestmentRadar theme={theme} />}

                  {/* 5. Psicologia Financeira */}
                  {activeTab === 'psychology' && <PsychologyModule {...({ theme } as any)} />}
                  
                  {/* 6. Renda Extra */}
                  {activeTab === 'income' && <ExtraIncomeModule />}
                  
                  {/* 6. Quiz */}
                  {activeTab === 'quiz' && <FinanceQuiz />}
              </div>
          </div>
      </main>
    </div>
  );
}