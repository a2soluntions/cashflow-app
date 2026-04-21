import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './components/AuthProvider';
import { appApi } from './services/api';
import { supabase } from './supabase';
import { HomeHub } from './components/HomeHub';
import { FinancialAdvisor } from "./components/FinancialAdvisor";
import DashboardHome from './components/DashboardHome';
import CategoryManager from './components/CategoryManager';
import NewTransactionModal from './components/NewTransactionModal';
import BillsManager from './components/BillsManager';
import TransactionTable from './components/TransactionTable';
import ProfileSettings from './components/ProfileSettings'; 
import HorizonsManager from './components/HorizonsManager'; 
import Reports from './components/Reports'; 
import { Transaction, Category, Goal } from './types'; 
import { User, Bell, Eye, EyeOff } from 'lucide-react'; 

export default function Vitta() {
  // --- SISTEMA DE LOGIN SUPABASE ---
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // --------------------------------------------------

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentTab, setCurrentTab] = useState('hub');
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const loadAllData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const dbTransactions = await appApi.getTransactions(session.user.id);
      setTransactions(dbTransactions);
      const dbCategories = await appApi.getCategories(session.user.id);
      setCategories(dbCategories);
      const dbGoals = await appApi.getGoals(session.user.id);
      setGoals(dbGoals);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }

    const savedAvatar = localStorage.getItem('vittacash_user_avatar');
    const savedName = localStorage.getItem('vittacash_user_name');
    setUserAvatar(savedAvatar);
    setUserName(savedName || 'Comandante');
  }, [session]);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Você já pode fazer login.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erro na autenticação';
      
      // Tradução de erros comuns do Supabase
      if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu e-mail clicando no link que enviamos antes de fazer login. (Ou desative a "Confirmação de E-mail" no painel do Supabase)';
      } else if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Este e-mail já está cadastrado.';
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (errorMessage.includes('Email address "') && errorMessage.includes('is invalid')) {
        errorMessage = 'O endereço de e-mail fornecido é inválido.';
      }

      setAuthError(errorMessage);
      setTimeout(() => setAuthError(''), 6000);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    if (session) {
      loadAllData();
    }

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, [theme, loadAllData, session]);

  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter(t => {
      const status = (t as any).status;
      if (status !== 'PENDING') return false;
      return new Date(t.date) < today;
    }).length;
  }, [transactions]);

  const handleNavigate = (tabId: string) => setCurrentTab(tabId);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleSaveTransaction = async (newTransactions: any[]) => {
      if (!session?.user?.id) return;

      const updatedList = [...newTransactions, ...transactions];
      // Optmistic UI Update
      setTransactions(updatedList);
      
      // Persist in Backend / Offline Queue
      for (const tx of newTransactions) {
        await appApi.addTransaction({ ...tx, user_id: session.user.id });
      }
      
      loadAllData();
  };

  // ==================================================================================
  // TELA 1: DE BOAS-VINDAS (SPLASH SCREEN) COM VÍDEO
  // ==================================================================================
  if (showWelcome) {
    return (
      <div className="w-screen h-screen bg-[#020202] flex flex-col items-center justify-center overflow-hidden font-sans relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center text-center">
          <div className="relative mb-50 flex items-center justify-center w-90 h-90 md:w-[750px] md:h-[750px]">
            <div className="absolute inset-0 bg-indigo-500/30 blur-[250px] rounded-full animate-pulse" />
            
            <video 
              src="./splash-vitta.mp4" 
              autoPlay 
              muted 
              playsInline
              className="relative w-full h-full object-cover mix-blend-screen scale-850"
              style={{
                maskImage: 'radial-gradient(circle, black 100%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle, black 100%, transparent 100%)'
              }}
            />
          </div>
          
          <div className="space-y-4 animate-[fadeUp_1.5s_ease-out_forwards] -mt-4">
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-zinc-400 font-black uppercase tracking-widest px-4 drop-shadow-md">
                O Verdadeiro Poder
              </p>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent my-1 opacity-50" />
              <p className="text-sm md:text-base text-[#00d06c] font-bold uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,208,108,0.5)]">
                da Sua Liberdade Financeira.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 w-64 h-[3px] bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-[#00d06c] animate-[progress_5.5s_ease-in-out_forwards] shadow-[0_0_15px_rgba(0,208,108,0.5)]" />
        </div>

        <style>{`
          @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ==================================================================================
  // TELA 2: PORTÃO DE SEGURANÇA (ANTI-PIRATARIA)
  // ==================================================================================
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute w-[600px] h-[600px] bg-[#00d06c]/10 blur-[150px] rounded-full" />
        
        <form onSubmit={handleAuth} className="relative z-10 w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center text-center mx-4">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <User className="text-[#00d06c]" size={30} />
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{isSignUp ? 'Criar Conta' : 'Acesso Restrito'}</h2>
          <p className="text-sm text-zinc-400 mb-8">{isSignUp ? 'Crie sua nova conta' : 'Insira seu e-mail e senha para acessar'}</p>
          
          <div className="w-full space-y-4 mb-8">
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full bg-black/50 border ${authError ? 'border-rose-500 text-rose-500' : 'border-white/10 text-white'} rounded-xl px-4 py-3 text-center text-sm tracking-widest focus:outline-none focus:border-[#00d06c] transition-colors`}
              required
            />
            
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className={`w-full bg-black/50 border ${authError ? 'border-rose-500 text-rose-500' : 'border-white/10 text-white'} rounded-xl px-4 py-3 text-center text-sm tracking-widest focus:outline-none focus:border-[#00d06c] transition-colors pr-10`}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {authError && <p className="text-rose-500 text-xs font-bold uppercase mb-4 animate-pulse">{authError}</p>}
          
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full py-4 bg-gradient-to-r from-[#00d06c] to-emerald-700 hover:opacity-90 transition-opacity rounded-xl text-white font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,208,108,0.4)] disabled:opacity-50"
          >
            {authLoading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar no Sistema')}
          </button>

          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-6 text-xs text-zinc-400 hover:text-white uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Já tem conta? Faça Login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </form>
      </div>
    );
  }

  // ==================================================================================
  // TELA 3: SISTEMA PRINCIPAL VITTACASH
  // ==================================================================================
  const NavigationHeader = () => (
    <div className="absolute top-5 left-4 md:top-12 md:left-10 z-[50] pointer-events-none flex items-center gap-4 md:gap-8">
      <button 
        onClick={() => setCurrentTab('hub')}
        className={`px-4 md:px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 group backdrop-blur-md pointer-events-auto shadow-lg
          ${theme === 'light' 
            ? 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50' 
            : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-black/60'}
        `}
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> <span className="hidden md:inline">Menu Hub</span>
      </button>

      {overdueCount > 0 && (
        <button 
          onClick={() => setCurrentTab('bills')}
          className="pointer-events-auto relative flex items-center justify-center text-rose-500 hover:scale-110 transition-transform group"
        >
          <Bell size={32} className="animate-ring drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505] shadow-xl">
            {overdueCount}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div className={`w-screen h-screen overflow-hidden font-sans relative transition-all duration-500
      ${theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#050505] text-white'}
    `}>
      
      <style>{`
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        .light h1, .light h2, .light h3, .light h4, .light p, .light span:not(.text-white), .light label { color: #1e293b !important; }
        .light .text-white, .light .text-zinc-100, .light .text-zinc-200 { color: #0f172a !important; }
        .light .bg-white\\/5, .light .bg-white\\/\\[0\\.01\\], .light .bg-zinc-900\\/50 { background-color: #ffffff !important; border-color: #e2e8f0 !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; }
        .light .border-white\\/10 { border-color: #e2e8f0 !important; }
        @keyframes ring { 0% { transform: rotate(0); } 5% { transform: rotate(20deg); } 10% { transform: rotate(-20deg); } 15% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 25% { transform: rotate(0); } 100% { transform: rotate(0); } }
        .animate-ring { animation: ring 3s infinite ease-in-out; }
      `}</style>
      
      {theme === 'dark' && (
        <>
          <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[180px] rounded-full pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] bg-[#00d06c]/10 blur-[180px] rounded-full pointer-events-none mix-blend-screen" />
        </>
      )}

      {/* AVATAR DE USUÁRIO COM BOTÃO ACESSÍVEL */}
      <div className="absolute top-5 right-4 md:top-8 md:left-1/2 md:-translate-x-1/2 z-[100] flex flex-col items-center group">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`relative p-1 rounded-full border-2 transition-all duration-700 shadow-2xl active:scale-95
            ${theme === 'light' ? 'border-slate-300 bg-white shadow-slate-200' : 'border-[#00d06c]/20 bg-black group-hover:border-[#00d06c]'}
          `}
        >
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center border border-white/5">
            {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="Avatar" /> : <User className="w-6 h-6 md:w-8 md:h-8 text-[#00d06c]" />}
          </div>
          <div className={`absolute bottom-0 right-0 md:bottom-1 md:right-1 w-3 h-3 md:w-4 md:h-4 bg-[#00d06c] rounded-full border-2 ${theme === 'light' ? 'border-white' : 'border-[#050505]'}`} />
        </button>
      </div>

      {currentTab === 'hub' ? (
        <HomeHub 
          onNavigate={handleNavigate} 
          onNewTransaction={() => setIsModalOpen(true)}
          currentTheme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <div className="h-full w-full flex flex-col relative z-10 animate-in fade-in duration-500">
          <NavigationHeader />
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden md:overflow-hidden p-4 md:p-6 pt-24 md:pt-36">
            {currentTab === 'dashboard' && <DashboardHome transactions={transactions as any} />}
            {currentTab === 'categories' && <CategoryManager categories={categories} onUpdate={loadAllData} currentUserId={session?.user?.id} />}
            {currentTab === 'target' && <HorizonsManager goals={goals} onUpdate={loadAllData} currentUserId={session?.user?.id} />} 
            {currentTab === 'report' && <Reports transactions={transactions as any} />} 
            {currentTab === 'settings' && <ProfileSettings onUpdate={loadAllData} onClose={() => setCurrentTab('hub')} />}
            {(currentTab === 'contas' || currentTab === 'bills') && <BillsManager mode={currentTab === 'bills' ? 'overdue' : 'normal'} />}
            {currentTab === 'history' && <TransactionTable />}
            {(currentTab === 'overview' || currentTab === 'edu') && <FinancialAdvisor currentBalance={0} transactions={transactions} categories={[]} />}
          </div>
        </div>
      )}

      <NewTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} />
    </div>
  );
}