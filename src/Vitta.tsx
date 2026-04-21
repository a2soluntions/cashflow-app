import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { Transaction, Category, Goal, Investment } from './types'; 
import { User, Bell, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'; 
import InvestmentsManager from './components/InvestmentsManager';
import DebtFreedom from './components/DebtFreedom';
import SubscriptionWall from './components/SubscriptionWall';
import AdminDashboard from './components/AdminDashboard';
import SalesPage from './components/SalesPage';

export default function Vitta() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!session;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // --- ASSINATURA ---
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(999);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const ADMIN_EMAIL = 'a2soluntions@gmail.com';

  const isLimitReached = useMemo(() => {
    if (subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL) return false;
    if (subscriptionPlan === 'basic') return transactions.length >= 50;
    return false;
  }, [subscriptionPlan, transactions.length, session?.user?.email]);

  const loadAllData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const dbTransactions = await appApi.getTransactions(session.user.id);
      setTransactions(dbTransactions);
      const dbCategories = await appApi.getCategories(session.user.id);
      setCategories(dbCategories);
      const dbGoals = await appApi.getGoals(session.user.id);
      setGoals(dbGoals);
      const dbInvestments = await appApi.getInvestments(session.user.id);
      setInvestments(dbInvestments);

      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
      if (profile) {
        const now = new Date();
        setSubscriptionPlan((profile.subscription_tier || 'free') as any);
        const isSubActive = profile.subscription_status === 'active' && (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > now);
        if (isSubActive || session.user.email === ADMIN_EMAIL) {
          setSubscriptionActive(true);
          setTrialDaysLeft(999);
        } else {
          const trialEnd = profile.trial_expires_at ? new Date(profile.trial_expires_at) : new Date(0);
          const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(daysLeft);
          setSubscriptionActive(daysLeft > 0);
        }
      }
    } catch (err) { console.error("Erro ao carregar dados", err); }
  }, [session, ADMIN_EMAIL]);

  useEffect(() => {
    if (session) loadAllData();
  }, [loadAllData, session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cadastro realizado!'); setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/app');
      }
    } catch (error: any) { setAuthError(error.message); setTimeout(() => setAuthError(''), 6000); } finally { setAuthLoading(false); }
  };

  const overdueCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return transactions.filter(t => (t as any).status === 'PENDING' && new Date(t.date) < today).length;
  }, [transactions]);

  const NavigationHeader = () => (
    <div className="absolute top-5 left-4 md:top-12 md:left-10 z-[50] pointer-events-none flex items-center gap-4 md:gap-8">
      <button 
        onClick={() => navigate('/app')}
        className={`px-4 md:px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 group backdrop-blur-md pointer-events-auto shadow-lg
          ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900 shadow-slate-200' : 'bg-black/40 border-white/10 text-white/70 hover:text-white'}
        `}
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Hub
      </button>
      {overdueCount > 0 && (
         <button onClick={() => navigate('/app?tab=bills')} className="pointer-events-auto relative text-rose-500 animate-pulse">
           <Bell size={24} />
           <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">{overdueCount}</span>
        </button>
      )}
    </div>
  );


  // --- COMPONENTE DE LOGIN ---
  const LoginPage = () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleAuth} className="w-full max-w-sm bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center">
            <h2 className="text-2xl font-black text-white uppercase italic mb-8">{isSignUp ? 'Nova Conta' : 'Acesso VittaCash'}</h2>
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white mb-4 outline-none focus:border-emerald-500" />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white mb-8 outline-none focus:border-emerald-500" />
            <button className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all">
                {authLoading ? 'Verificando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
            <p onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-[10px] text-slate-500 uppercase font-black cursor-pointer hover:text-white">
                {isSignUp ? 'Já possuo acesso' : 'Criar minha conta'}
            </p>
            {authError && <p className="mt-4 text-rose-500 text-[10px] font-bold uppercase">{authError}</p>}
        </form>
    </div>
  );

  return (
    <div className={`w-screen h-screen overflow-hidden font-sans relative ${theme === 'light' ? 'bg-slate-50' : 'bg-[#050505] text-white'}`}>
      
      {isAuthenticated && (
          <div className="absolute top-5 right-4 z-[100]">
            <button onClick={() => navigate('/app?tab=settings')} className="w-12 h-12 rounded-full border-2 border-emerald-500/20 overflow-hidden">
                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-emerald-500 font-black">VC</div>}
            </button>
          </div>
      )}

      {location.pathname !== '/' && location.pathname !== '/login' && <NavigationHeader />}

      {!subscriptionActive && isAuthenticated && (
        <SubscriptionWall userEmail={session?.user?.email || ''} userId={session?.user?.id || ''} trialDaysLeft={trialDaysLeft} onSuccess={loadAllData} />
      )}

      <Routes>
        {/* ROTA INICIAL: SALES PAGE (MARKETING) */}
        <Route path="/" element={<SalesPage onSelectPlan={() => navigate('/login')} />} />
        
        {/* ROTA DE LOGIN */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : <LoginPage />} />

        {/* ROTA DO APP (PROTEGIDA) */}
        <Route path="/app" element={
            !isAuthenticated ? <Navigate to="/login" /> : (
                <div className="h-full w-full">
                    {/* Renderiza o conteúdo baseado no Query Param ?tab=... */}
                    {(() => {
                        const tab = new URLSearchParams(location.search).get('tab') || 'hub';
                        if (tab === 'hub') return <HomeHub onNavigate={(t) => navigate(`/app?tab=${t}`)} onNewTransaction={() => setIsModalOpen(true)} currentTheme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} isAdmin={session?.user?.email === ADMIN_EMAIL} />;
                        if (tab === 'sales') return <SalesPage onSelectPlan={() => navigate('/app?tab=settings')} />;
                        if (tab === 'dashboard') return <DashboardHome transactions={transactions as any} />;
                        if (tab === 'history') return <TransactionTable />;
                        if (tab === 'investments') return <InvestmentsManager investments={investments} onAdd={async(v) => { await appApi.addInvestment({...v, id: crypto.randomUUID(), user_id: session?.user?.id}); loadAllData(); }} onDelete={async(id) => { await appApi.deleteInvestment(id); loadAllData(); }} />;
                        if (tab === 'freedom') return <DebtFreedom />;
                        if (tab === 'settings') return <ProfileSettings onUpdate={loadAllData} onClose={() => navigate('/app')} subscriptionPlan={subscriptionPlan} onNavigate={(t) => navigate(`/app?tab=${t}`)} />;
                        if (tab === 'admin') return session?.user?.email === ADMIN_EMAIL ? <AdminDashboard /> : <Navigate to="/app" />;
                        if (tab === 'categories') return <CategoryManager categories={categories} onUpdate={loadAllData} currentUserId={session?.user?.id} />;
                        if (tab === 'target') return <HorizonsManager goals={goals} onUpdate={loadAllData} currentUserId={session?.user?.id} />;
                        if (tab === 'report') return <Reports transactions={transactions as any} />;
                        if (tab === 'contas' || tab === 'bills') return <BillsManager mode={tab === 'bills' ? 'overdue' : 'normal'} />;
                        if (tab === 'advisor') return (subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL) ? <FinancialAdvisor currentBalance={0} transactions={transactions} categories={[]} theme={theme} /> : <div className="h-full flex flex-col items-center justify-center text-center p-6"><Lock size={64} className="text-blue-400 mb-4" /><h2 className="text-2xl font-black uppercase italic">Advisor Premium</h2><p className="text-zinc-500 mb-6 text-xs uppercase font-bold tracking-widest">Upgrade para liberar o cérebro da rede.</p><button onClick={() => navigate('/app?tab=sales')} className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-white uppercase text-[10px]">Ver Planos</button></div>;
                        return <div>Não encontrado</div>;
                    })()}
                </div>
            )
        } />

        {/* REDIRECIONAMENTO DE SEGURANÇA */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={async (txs) => { if(!isLimitReached) { for(const tx of txs) await appApi.addTransaction({...tx, user_id: session?.user?.id}); loadAllData(); } }}
        isLimitReached={isLimitReached}
      />
    </div>
  );
}

function Lock(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    )
}