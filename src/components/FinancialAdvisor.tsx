import React, { useState } from 'react';
import { LineChart, Zap, GraduationCap, FileText, Brain, Activity, History } from 'lucide-react';

// --- IMPORTAÇÕES DOS SUB-MÓDULOS ---
import { SidebarItem } from './advisor/SidebarItem'; 
import { DashboardOverview } from './advisor/DashboardOverview';
import { ExtraIncomeModule } from './advisor/ExtraIncomeModule';
import { PsychologyModule } from './advisor/PsychologyModule'; 
import { InvestmentRadar } from './advisor/InvestmentRadar';
import { FinanceQuiz } from './FinanceQuiz';
import ConsultantReport from './advisor/ConsultantReport';
import DebtManager from './advisor/DebtManager';

interface FinancialAdvisorProps {
 currentBalance: number;
 transactions: any[];
 categories?: any[];
  theme?: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange';
}

export function FinancialAdvisor({ currentBalance, transactions, theme = 'blue' }: FinancialAdvisorProps) {
 const [activeTab, setActiveTab] = useState('welcome');
 const isLight = theme === 'white' || theme === 'white-orange';

  return (
  <div className="h-full w-full flex flex-col p-4 transition-colors duration-500 overflow-hidden">
  
  {/* 🟢 TOP NAVIGATION BAR (SUBSTITUINDO O SIDEBAR) */}
  <header className={`w-full shrink-0 z-10 ${activeTab === 'welcome' ? 'mb-1' : 'mb-4'}`}>
    <div className={`p-1.5 flex items-center justify-between overflow-x-auto no-scrollbar border border-white/5 ${
      isLight ? 'bg-white/70' : 'bg-white/5 backdrop-blur-xl shadow-2xl'
    }`}>
      {/* Grupo Esquerda: Painel, Radar e Diagnóstico */}
      <div className="flex gap-1 md:gap-3 items-center">
        <SidebarItem label="Painel" icon={<Activity size={18}/>} active={activeTab === 'welcome'} onClick={() => setActiveTab('welcome')} />
        <SidebarItem label="Radar" icon={<LineChart size={18}/>} active={activeTab === 'radar'} onClick={() => setActiveTab('radar')} />
        <SidebarItem label="Diagnóstico" icon={<FileText size={18}/>} active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
        <SidebarItem label="Dívidas" icon={<History size={18}/>} active={activeTab === 'debt'} onClick={() => setActiveTab('debt')} />
      </div>

      {/* Espaço Central (Placeholder para não sobrepor o Avatar central) */}
      <div className="hidden lg:block w-24 shrink-0 pointer-events-none" />

      {/* Grupo Direita: Psicologia, Renda Extra, Quiz e Dívidas */}
      <div className="flex gap-1 md:gap-3 items-center">
        <SidebarItem label="Psicologia" icon={<Brain size={18}/>} active={activeTab === 'psychology'} onClick={() => setActiveTab('psychology')} />
        <SidebarItem label="Renda Extra" icon={<Zap size={18}/>} active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
        <SidebarItem label="Quiz" icon={<GraduationCap size={18}/>} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
      </div>
    </div>
  </header>

  {/* 🔵 ÁREA DE CONTEÚDO */}
  <main className="flex-1 overflow-y-auto no-scrollbar relative">
  <div className="w-full p-2 md:px-6 pb-20">
 <div className="max-w-6xl mx-auto flex flex-col">
 {/* 1. Painel Consultor */}
 {activeTab === 'welcome' && <DashboardOverview theme={theme} />}
 
 {/* 2. Diagnóstico Raio-X */}
 {activeTab === 'report' && <ConsultantReport theme={theme} transactions={transactions} currentBalance={currentBalance} />}
 
 {/* 3. Radar de Investimentos */}
 {activeTab === 'radar' && <InvestmentRadar theme={theme} />}

 {/* 4. Máquina do Tempo - Dívidas */}
 {activeTab === 'debt' && <DebtManager theme={theme ?? 'dark'} />}

 {/* 5. Psicologia Financeira */}
 {activeTab === 'psychology' && <PsychologyModule theme={theme} />}
 
 {/* 6. Renda Extra */}
 {activeTab === 'income' && <ExtraIncomeModule theme={theme} />}
 
 {/* 7. Quiz */}
 {activeTab === 'quiz' && <FinanceQuiz theme={theme} />}
 </div>
 </div>
 </main>
 </div>
 );
}
