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
 theme?: 'light' | 'dark';
}

export function FinancialAdvisor({ currentBalance, transactions, theme = 'dark' }: FinancialAdvisorProps) {
 const [activeTab, setActiveTab] = useState('welcome');
 const isLight = theme === 'light';

  return (
  <div className="h-full w-full flex flex-col p-4 transition-colors duration-500 overflow-hidden">
  
  {/* 🟢 TOP NAVIGATION BAR (SUBSTITUINDO O SIDEBAR) */}
  <header className="w-full shrink-0 mb-8 z-10">
    <div className={`p-4 flex gap-4 overflow-x-auto no-scrollbar border border-white/5 ${
      isLight ? 'bg-white/70' : 'bg-white/5 backdrop-blur-2xl shadow-2xl'
    }`}>
      <div className="flex gap-2 pr-4 border-r border-white/10">
        <SidebarItem label="Painel" icon={<Activity size={18}/>} active={activeTab === 'welcome'} onClick={() => setActiveTab('welcome')} />
        <SidebarItem label="Radar" icon={<LineChart size={18}/>} active={activeTab === 'radar'} onClick={() => setActiveTab('radar')} />
        <SidebarItem label="Diagnóstico" icon={<FileText size={18}/>} active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
        <SidebarItem label="Dívidas" icon={<History size={18}/>} active={activeTab === 'debt'} onClick={() => setActiveTab('debt')} />
      </div>
      <div className="flex gap-2">
        <SidebarItem label="Psicologia" icon={<Brain size={18}/>} active={activeTab === 'psychology'} onClick={() => setActiveTab('psychology')} />
        <SidebarItem label="Renda Extra" icon={<Zap size={18}/>} active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
        <SidebarItem label="Quiz" icon={<GraduationCap size={18}/>} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
      </div>
    </div>
  </header>

  {/* 🔵 ÁREA DE CONTEÚDO */}
  <main className="flex-1 overflow-y-auto no-scrollbar relative">
  <div className="h-full w-full p-2 md:px-6 pb-20">
 <div className="max-w-6xl mx-auto h-full flex flex-col">
 {/* 1. Painel Consultor */}
 {activeTab === 'welcome' && <DashboardOverview {...({ theme, transactions } as any)} />}
 
 {/* 2. Diagnóstico Raio-X */}
 {activeTab === 'report' && <ConsultantReport theme={theme} transactions={transactions} currentBalance={currentBalance} />}
 
 {/* 3. Radar de Investimentos */}
 {activeTab === 'radar' && <InvestmentRadar theme={theme} />}

 {/* 4. Máquina do Tempo - Dívidas */}
 {activeTab === 'debt' && <DebtManager theme={theme ?? 'dark'} />}

 {/* 5. Psicologia Financeira */}
 {activeTab === 'psychology' && <PsychologyModule {...({ theme } as any)} />}
 
 {/* 6. Renda Extra */}
 {activeTab === 'income' && <ExtraIncomeModule />}
 
 {/* 7. Quiz */}
 {activeTab === 'quiz' && <FinanceQuiz />}
 </div>
 </div>
 </main>
 </div>
 );
}
