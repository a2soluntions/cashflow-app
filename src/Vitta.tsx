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
import { User, Bell, Eye, EyeOff, ShieldCheck, Zap, LayoutGrid, Home, X, ArrowLeft } from 'lucide-react'; 
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
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(localStorage.getItem('vittacash_user_avatar'));
  const [userName, setUserName] = useState<string>(localStorage.getItem('vittacash_user_name') || 'Comandante');

  // --- ASSINATURA ---
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(999);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const ADMIN_EMAIL = 'a2soluntions@gmail.com';

  const isLimitReached = useMemo(() => {
    if (subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL) return false;
    
    // Contagem de transações do MÊS ATUAL
    const now = new Date();
    const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const limit = subscriptionPlan === 'basic' ? 300 : 50;
    return currentMonthTxs.length >= limit;
  }, [subscriptionPlan, transactions, session?.user?.email, ADMIN_EMAIL]);

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

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        const now = new Date();
        setSubscriptionPlan((profile.subscription_tier || 'free') as any);
        const isSubActive = profile.subscription_status === 'active' && (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > now);
        
        const trialEnd = profile.trial_expires_at ? new Date(profile.trial_expires_at) : new Date(0);
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        setSubscriptionActive(isSubActive || session.user.email === ADMIN_EMAIL);
        setTrialDaysLeft(daysLeft);
      }

      // Sincroniza dados locais (Avatar e Nome)
      const savedAvatar = localStorage.getItem('vittacash_user_avatar');
      const savedName = localStorage.getItem('vittacash_user_name');
      if (savedAvatar) setUserAvatar(savedAvatar);
      if (savedName) setUserName(savedName);
    } catch (err) { console.error("Erro ao carregar dados", err); }
  }, [session, ADMIN_EMAIL]);

  useEffect(() => {
    if (session) loadAllData();
  }, [loadAllData, session]);

  const handleAuth = async (emailInput: string, passwordInput: string) => {
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email: emailInput, password: passwordInput });
        if (error) throw error;
        alert('Cadastro realizado!'); setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (error) throw error;
        navigate('/app');
      }
    } catch (error: any) { setAuthError(error.message); setTimeout(() => setAuthError(''), 6000); } finally { setAuthLoading(false); }
  };

  const overdueCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return transactions.filter(t => {
      const status = String((t as any).status || '').toUpperCase();
      const tDate = t.date ? new Date(t.date) : null;
      return (status === 'PENDING') && tDate && tDate < today;
    }).length;
  }, [transactions]);

  const NavigationHeader = () => {
    const tab = new URLSearchParams(location.search).get('tab') || 'hub';
    if (location.pathname === '/' || tab === 'hub' || tab === 'sales') return null;

    return (
      <>
        {/* LADO ESQUERDO: Voltar para o Hub (Home) */}
        <div className="fixed top-6 left-8 z-[1001] pointer-events-none flex items-center animate-in slide-in-from-left duration-700">
          <button 
            onClick={() => navigate('/app')}
            title="Voltar ao Hub"
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all group pointer-events-auto
              ${theme === 'light' ? 'bg-white text-slate-900 shadow-xl' : 'bg-zinc-900/60 backdrop-blur-md text-white/80 hover:text-white shadow-2xl'}
            `}
          >
            <Home size={24} className="group-hover:scale-110 transition-transform duration-500" />
          </button>
        </div>

        {/* CENTRO: Avatar do Usuário */}
        <div className="fixed top-6 left-0 right-0 z-[1001] pointer-events-none flex items-center justify-center animate-in fade-in duration-700">
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/app?tab=settings')} 
              className="group relative pointer-events-auto flex items-center justify-center transition-all hover:scale-110 hover:rotate-[360deg] duration-1000 rounded-full"
            >
              <div 
                className="w-16 h-16 rounded-full overflow-hidden bg-zinc-950 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center"
              >
                  {userAvatar ? 
                    <img src={userAvatar} className="w-full h-full object-cover rounded-full" alt="User" /> : 
                    <div className="w-full h-full flex items-center justify-center text-emerald-500 font-black text-lg bg-black rounded-full">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  }
              </div>
            </button>
          )}
        </div>

        {/* LADO DIREITO: Notificações (Sino sempre visível no sistema) */}
        <div className="fixed top-6 right-8 z-[1001] pointer-events-none flex items-center gap-6 animate-in slide-in-from-right duration-700">
          <button 
            onClick={() => navigate('/app?tab=bills')} 
            className={`pointer-events-auto relative transition-all duration-500 hover:scale-110 px-1
              ${overdueCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500'}
            `}
            title={overdueCount > 0 ? `${overdueCount} contas atrasadas` : "Alertas e Notificações"}
          >
            <Bell size={24} />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(225,29,72,0.4)]">
                {overdueCount}
              </span>
            )}
          </button>
        </div>
      </>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className={`w-full font-sans relative ${theme === 'light' ? 'bg-[#F3E5F5] text-slate-900' : 'dark bg-[#283593] text-white'} ${location.pathname === '/' ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      
      {location.pathname !== '/' && location.pathname !== '/login' && <NavigationHeader />}

      {/* SubscriptionWall agora só aparece se o usuário tentar acessar algo bloqueado ou se você quiser manter um banner */}
      {/* {!subscriptionActive && trialDaysLeft <= 0 && isAuthenticated && (
        <SubscriptionWall userEmail={session?.user?.email || ''} userId={session?.user?.id || ''} trialDaysLeft={trialDaysLeft} onSuccess={loadAllData} />
      )} */}

      <Routes>
        {/* ROTA INICIAL: SALES PAGE (MARKETING) */}
        <Route path="/" element={<SalesPage onSelectPlan={(plan) => {
            if (plan === 'free' || plan === 'start') {
                navigate('/login');
            } else {
                // TODO: Substitua pelos seus links reais de checkout (Kiwify, Hotmart, Stripe, etc)
                const checkouts: Record<string, string> = {
                    'basic': 'https://pay.kiwify.com.br/Ud7Lefh',
                    'premium': 'https://pay.kiwify.com.br/l7H6T2P',
                    'desktop': 'https://pay.kiwify.com.br/1Dx2Uvq'
                };
                window.location.href = checkouts[plan] || '#';
            }
        }} />} />
        
        {/* ROTA DE LOGIN */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : (
            <LoginPage 
                isSignUp={isSignUp} 
                setIsSignUp={setIsSignUp} 
                onAuth={handleAuth} 
                authLoading={authLoading} 
                authError={authError} 
            />
        )} />

        {/* ROTA DO APP (PROTEGIDA) */}
        <Route path="/app" element={
            !isAuthenticated ? <Navigate to="/login" /> : (() => {
                const tab = new URLSearchParams(location.search).get('tab') || 'hub';
                return (
                    <div className={`h-full w-full pt-20 md:pt-24 px-4 md:px-8 pb-12 ${['advisor', 'admin'].includes(tab) ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar`}>
                        {(() => {
                            const isTrial = trialDaysLeft > 0;
                            const isPremiumUser = subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL;
                            const isSubscribed = subscriptionActive;
                            
                            // Abas liberadas para todos (essenciais)
                            const freeTabs = ['hub', 'dashboard', 'history', 'categories', 'contas', 'bills', 'target', 'settings', 'sales'];
                            
                            // 1. CHECAGEM DE ACESSO
                            let isAllowed = false;
                            
                            if (freeTabs.includes(tab)) {
                                isAllowed = true;
                            } else if (isTrial || isPremiumUser) {
                                // Trial ativo ou Premium libera tudo
                                isAllowed = true;
                            } else if (isSubscribed) {
                                // Plano Básico ou outro plano pago
                                // BLOQUEIA: Inteligência (advisor) e Dívidas (freedom)
                                const premiumOnlyTabs = ['advisor', 'freedom'];
                                isAllowed = !premiumOnlyTabs.includes(tab);
                            }

                            if (!isAllowed) {
                                return (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                                        <Lock size={64} className="text-emerald-500 mb-6 opacity-20" />
                                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                                            {isSubscribed ? 'Recurso Premium' : 'Período Expirado'}
                                        </h2>
                                        <p className="text-zinc-500 mt-2 mb-8 text-xs uppercase font-bold tracking-widest max-w-xs">
                                            {isSubscribed 
                                              ? 'Este módulo é exclusivo para assinantes do plano Premium.' 
                                              : 'Seu período experimental terminou. Faça o upgrade para continuar usando ferramentas avançadas.'}
                                        </p>
                                        <button onClick={() => navigate('/app?tab=sales')} className="px-10 py-5 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">
                                            {isSubscribed ? 'Fazer Upgrade' : 'Ver Planos de Acesso'}
                                        </button>
                                    </div>
                                );
                            }

                            if (tab === 'hub') return <HomeHub onNavigate={(t) => navigate(`/app?tab=${t}`)} onNewTransaction={() => setIsModalOpen(true)} currentTheme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} isAdmin={session?.user?.email === ADMIN_EMAIL} onLogout={handleLogout} userAvatar={userAvatar} />;
                            if (tab === 'sales') return <SalesPage onSelectPlan={(plan) => {
                                if (plan === 'free' || plan === 'start') {
                                    navigate('/app?tab=settings');
                                } else {
                                    const checkouts: Record<string, string> = {
                                        'basic': 'https://pay.kiwify.com.br/Ud7Lefh',
                                        'premium': 'https://pay.kiwify.com.br/l7H6T2P',
                                        'desktop': 'https://pay.kiwify.com.br/1Dx2Uvq'
                                    };
                                    window.location.href = checkouts[plan] || '#';
                                }
                            }} />;
                            if (tab === 'dashboard') return <DashboardHome transactions={transactions as any} categories={categories} />;
                            if (tab === 'history') return <TransactionTable />;
                            if (tab === 'investments') return <InvestmentsManager investments={investments} onAdd={async(v) => { await appApi.addInvestment({...v, id: crypto.randomUUID(), user_id: session?.user?.id}); loadAllData(); }} onDelete={async(id) => { await appApi.deleteInvestment(id); loadAllData(); }} />;
                            if (tab === 'freedom') return <DebtFreedom />;
                            if (tab === 'settings') return <ProfileSettings onUpdate={loadAllData} onClose={() => navigate('/app')} subscriptionPlan={subscriptionPlan} onNavigate={(t) => navigate(`/app?tab=${t}`)} />;
                            if (tab === 'admin') return session?.user?.email === ADMIN_EMAIL ? <AdminDashboard theme={theme} /> : <Navigate to="/app" />;
                            if (tab === 'categories') return <CategoryManager categories={categories} onUpdate={loadAllData} currentUserId={session?.user?.id} />;
                            if (tab === 'target') return <HorizonsManager goals={goals} onUpdate={loadAllData} currentUserId={session?.user?.id} />;
                            if (tab === 'report') return <Reports transactions={transactions as any} />;
                            if (tab === 'contas' || tab === 'bills') return <BillsManager mode={tab === 'bills' ? 'overdue' : 'normal'} />;
                            if (tab === 'advisor') return <FinancialAdvisor currentBalance={0} transactions={transactions} categories={[]} theme={theme} />;
                            return <div>Não encontrado</div>;
                        })()}
                    </div>
                );
            })()
        } />

        {/* REDIRECIONAMENTO DE SEGURANÇA */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={async (txs) => { 
          if(!isLimitReached) { 
            try {
              for(const tx of txs) {
                await appApi.addTransaction({...tx, user_id: session?.user?.id}); 
              }
              loadAllData(); 
            } catch (err: any) {
              alert("Erro ao salvar transação: " + (err.message || JSON.stringify(err)));
              console.error(err);
            }
          } 
        }}
        isLimitReached={isLimitReached}
        theme={theme}
      />
    </div>
  );
}

// --- NOVO COMPONENTE DE LOGIN (ESTADOS ISOLADOS PARA PERFORMANCE 100%) ---
const LoginPage = ({ isSignUp, setIsSignUp, onAuth, authLoading, authError }: any) => {
    const navigate = useNavigate();
    const [localEmail, setLocalEmail] = useState('');
    const [localPassword, setLocalPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const passwordStrength = useMemo(() => {
        if (!localPassword) return { score: 0, label: '', color: 'bg-zinc-800' };
        if (localPassword.length < 6) return { score: 33, label: 'Fraca', color: 'bg-rose-500' };
        
        const hasNumbers = /\d/.test(localPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(localPassword);
        
        if (localPassword.length >= 8 && hasNumbers && hasSpecial) {
            return { score: 100, label: 'Forte', color: 'bg-emerald-500' };
        }
        if (localPassword.length >= 6 && (hasNumbers || hasSpecial)) {
            return { score: 66, label: 'Média', color: 'bg-amber-500' };
        }
        return { score: 33, label: 'Fraca', color: 'bg-rose-500' };
    }, [localPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAuth(localEmail, localPassword);
    };
    
    return (
        <div className="w-screen h-screen bg-[#283593] flex items-center justify-center p-6 animate-in fade-in duration-700">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-zinc-900/70 backdrop-blur-md p-10 text-center shadow-2xl relative overflow-hidden">
                <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 text-white/40 hover:text-white transition-colors"
                    title="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <h2 className="text-2xl font-black text-white uppercase italic mb-8">{isSignUp ? 'Nova Conta' : 'Acesso VittaCash'}</h2>
                
                <div className="space-y-4 mb-8">
                    <input 
                        type="email" 
                        placeholder="E-mail" 
                        value={localEmail} 
                        onChange={e => setLocalEmail(e.target.value)} 
                        className="w-full bg-black p-4 text-white outline-none focus:bg-zinc-800 transition-all font-bold" 
                        required
                    />
                    
                    <div className="relative">
                        <input 
                            type={showPass ? "text" : "password"} 
                            placeholder="Senha" 
                            value={localPassword} 
                            onChange={e => setLocalPassword(e.target.value)} 
                            className="w-full bg-black p-4 text-white outline-none focus:bg-zinc-800 transition-all pr-12 font-bold" 
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {isSignUp && localPassword && (
                        <div className="px-1 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                    Senha {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                <button className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    {authLoading ? 'Verificando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                </button>
                
                <p 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="mt-8 text-[10px] text-slate-500 uppercase font-black cursor-pointer hover:text-white transition-colors tracking-widest"
                >
                    {isSignUp ? 'Já possuo acesso' : 'Quero criar uma conta'}
                </p>
                
                {authError && (
                    <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-rose-500 text-[10px] font-bold uppercase">{authError}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

function Lock(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    )
}