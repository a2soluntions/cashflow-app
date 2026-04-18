import React, { useState } from 'react';
import { Activity, Zap, GraduationCap, Wallet, FileText, Brain } from 'lucide-react';

// --- IMPORTAÇÕES DOS SUB-MÓDULOS ---
import { SidebarItem } from './advisor/SidebarItem'; 
import { DashboardOverview } from './advisor/DashboardOverview';
import { ExtraIncomeModule } from './advisor/ExtraIncomeModule';
import { PsychologyModule } from './advisor/PsychologyModule'; 
import { FinanceQuiz } from './FinanceQuiz';
import DebtManager from './advisor/DebtManager';
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
    <div className="h-full w-full flex p-4 overflow-hidden transition-colors duration-500">
      
      {/* 🟢 BARRA LATERAL FLUTUANTE */}
      <aside className="w-80 flex flex-col gap-6 z-10 pr-6 shrink-0 py-2">
        <div className={`rounded-[3rem] p-6 border transition-all ${
          isLight ? 'bg-white/70 border-slate-200/50 shadow-xl' : 'bg-white/5 border-white/5 backdrop-blur-2xl shadow-2xl'
        } flex flex-col gap-2`}>
            <p className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-2 italic">Consultoria</p>
            <SidebarItem label="Painel Consultor" icon={<Activity size={20}/>} active={activeTab === 'welcome'} onClick={() => setActiveTab('welcome')} />
            <SidebarItem label="Diagnóstico" icon={<FileText size={20}/>} active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
            <SidebarItem label="Gestão & Futuro" icon={<Wallet size={20}/>} active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} />
        </div>

        <div className={`rounded-[3rem] p-6 border transition-all ${
          isLight ? 'bg-white/70 border-slate-200/50 shadow-xl' : 'bg-white/5 border-white/5 backdrop-blur-2xl shadow-2xl'
        } flex flex-col gap-2`}>
            <p className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-2 italic">Universidade</p>
            <SidebarItem label="Mente & Armadilhas" icon={<Brain size={20}/>} active={activeTab === 'psychology'} onClick={() => setActiveTab('psychology')} />
            <SidebarItem label="Renda Extra" icon={<Zap size={20}/>} active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
            <SidebarItem label="Desafio Quiz" icon={<GraduationCap size={20}/>} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
        </div>
      </aside>

      {/* 🔵 ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full p-4 md:px-10 pb-10">
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                  {/* 1. Painel Consultor (Agora com Velocímetros e Texto Editorial) */}
                  {activeTab === 'welcome' && <DashboardOverview {...({ theme, transactions } as any)} />}
                  
                  {/* 2. Diagnóstico Raio-X */}
                  {activeTab === 'report' && <ConsultantReport theme={theme} transactions={transactions} currentBalance={currentBalance} />}
                  
                  {/* 3. Dívidas */}
                  {activeTab === 'debts' && <DebtManager theme={theme} />}
                  
                  {/* 4. Psicologia Financeira */}
                  {activeTab === 'psychology' && <PsychologyModule {...({ theme } as any)} />}
                  
                  {/* 5. Renda Extra */}
                  {activeTab === 'income' && <ExtraIncomeModule />}
                  
                  {/* 6. Quiz */}
                  {activeTab === 'quiz' && <FinanceQuiz />}
              </div>
          </div>
      </main>
    </div>
  );
}