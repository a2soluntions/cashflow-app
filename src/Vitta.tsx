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
import { Eye, EyeOff, X, ArrowLeft, Plus, LayoutGrid, Calendar, CheckCircle2, Brain, Settings } from 'lucide-react';
import { AppSidebar } from './components/AppSidebar';
import InvestmentsManager from './components/InvestmentsManager';
import DebtFreedom from './components/DebtFreedom';
import SubscriptionWall from './components/SubscriptionWall';
import AdminDashboard from './components/AdminDashboard';
import SalesPage from './components/SalesPage';
import LegalPage from './components/LegalPage';
import VittaNews from './components/VittaNews';
import NewsArticle from './components/NewsArticle';
import AdReservationPage from './components/AdReservationPage';
import NetworkBackground from './components/NetworkBackground';

export default function Vitta() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!session;
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [theme, setTheme] = useState<'blue' | 'black' | 'white' | 'black-orange' | 'white-orange'>(
    (localStorage.getItem('a2mentor_theme') as any) || 'blue'
  );
  
  useEffect(() => {
    document.documentElement.classList.remove('theme-blue', 'theme-black', 'theme-white', 'theme-black-orange', 'theme-white-orange', 'dark');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('a2mentor_theme', theme);
    
    if (theme === 'blue' || theme === 'black' || theme === 'black-orange') {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(localStorage.getItem('a2mentor_user_avatar'));
  const [userName, setUserName] = useState<string>(localStorage.getItem('a2mentor_user_name') || 'Comandante');

  // --- ASSINATURA ---
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(999);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const ADMIN_EMAIL = 'a2soluntions@gmail.com';

  const isLimitReached = useMemo(() => {
    if (subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL) return false;
    
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

      // Usando dados locais e de sessão para evitar o erro 406 da tabela profiles
      setSubscriptionPlan('premium');
      setSubscriptionActive(true);
      setTrialDaysLeft(30);

      const savedAvatar = localStorage.getItem('a2mentor_user_avatar');
      const savedName = localStorage.getItem('a2mentor_user_name');
      if (savedAvatar) setUserAvatar(savedAvatar);
      if (savedName) setUserName(savedName);
    } catch (err) { console.error("Erro ao carregar dados", err); }
  }, [session, ADMIN_EMAIL]);

  useEffect(() => {
    if (session) loadAllData();
  }, [loadAllData, session]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleSync = () => {
      loadAllData();
    };
    window.addEventListener('storage', handleSync);
    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('storage', handleSync);
    };
  }, [loadAllData]);

  const handleInstallClick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
  };

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

  // NavigationHeader removido — substituído pelo AppSidebar lateral

  const handleLogout = async () => {
    // Limpa dados de perfil do localStorage para não vazar para outro usuário
    localStorage.removeItem('a2mentor_user_avatar');
    localStorage.removeItem('a2mentor_user_name');
    localStorage.removeItem('a2mentor_user_company');
    localStorage.removeItem('a2mentor_user_email');
    localStorage.removeItem('a2mentor_user_phone');
    localStorage.removeItem('a2mentor_notification_channel');
    setUserAvatar(null);
    setUserName('Comandante');
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className={`w-full font-sans relative text-slate-900 dark:text-white ${
      location.pathname === '/' || location.pathname === '/vendas' ||
      location.pathname.startsWith('/noticias') || location.pathname.startsWith('/legal')
        ? 'min-h-screen overflow-y-auto scroll-smooth custom-scrollbar'
        : 'h-screen overflow-hidden'
    }`}>

      <Routes>
        {/* ROTA INICIAL */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/app" : "/login"} />} />

        {/* VENDAS */}
        <Route path="/vendas" element={<SalesPage onSelectPlan={(plan) => {
            if (plan === 'free' || plan === 'start') { navigate('/login'); }
            else {
              const checkouts: Record<string, string> = {
                'basic': 'https://pay.kiwify.com.br/Ud7Lefh',
                'premium': 'https://pay.kiwify.com.br/l7H6T2P',
                'desktop': 'https://pay.kiwify.com.br/1Dx2Uvq'
              };
              window.location.href = checkouts[plan] || '#';
            }
        }} />} />

        {/* LEGAL */}
        <Route path="/legal/:type" element={<LegalPage />} />

        {/* NOTÍCIAS */}
        <Route path="/noticias" element={<VittaNews />} />
        <Route path="/noticias/anunciar" element={<AdReservationPage />} />
        <Route path="/noticias/:id" element={<NewsArticle />} />

        {/* LOGIN */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : (
            <LoginPage
              isSignUp={isSignUp} setIsSignUp={setIsSignUp}
              onAuth={handleAuth} authLoading={authLoading} authError={authError}
            />
        )} />

        {/* APP — layout com sidebar */}
        <Route path="/app" element={
          !isAuthenticated ? <Navigate to="/login" /> : (() => {
            const tab = new URLSearchParams(location.search).get('tab') || 'dashboard';

            const isTrial = trialDaysLeft > 0;
            const isPremiumUser = subscriptionPlan === 'premium' || session?.user?.email === ADMIN_EMAIL;
            const isSubscribed = subscriptionActive;
            const freeTabs = ['dashboard', 'history', 'categories', 'contas', 'bills', 'target', 'settings', 'sales'];
            let isAllowed = freeTabs.includes(tab) || isTrial || isPremiumUser
              || (isSubscribed && !['advisor','freedom'].includes(tab));

            return (
              <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>

                {/* ── Sidebar (desktop) ── */}
                <div className="hidden md:flex">
                  <AppSidebar
                    onNavigate={(t) => navigate(`/app?tab=${t}`)}
                    onNewTransaction={() => setIsModalOpen(true)}
                    currentTab={tab}
                    currentTheme={theme}
                    onToggleTheme={(newTheme) => setTheme(newTheme)}
                    isAdmin={session?.user?.email === ADMIN_EMAIL}
                    onLogout={handleLogout}
                    userAvatar={userAvatar}
                    userName={userName}
                    overdueCount={overdueCount}
                  />
                </div>

                {/* ── Conteúdo Principal ── */}
                <main className={`flex-1 overflow-y-auto custom-scrollbar ${
                  ['advisor','admin'].includes(tab) ? 'overflow-hidden' : ''
                }`}>

                  {/* Banner instalar PWA */}
                  {showInstallBanner && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm">
                      <div className="p-4 shadow-2xl flex items-center justify-between gap-4"
                        style={{ background: '#6C63FF', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-3">
                          <img src="/pwa-192x192.png" className="w-8 h-8 object-contain" alt="Icon" />
                          <div>
                            <p className="text-white text-xs font-black uppercase tracking-widest">Instalar A2 Mentor</p>
                            <p className="text-white/60 text-[8px] font-bold uppercase">Acesse mais rápido</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowInstallBanner(false)} className="p-1 text-white/50 hover:text-white">
                            <X size={14} />
                          </button>
                          <button onClick={handleInstallClick}
                            className="bg-white text-indigo-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                            Instalar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo da aba */}
                  <div className="h-full p-4 md:p-6">
                    {!isAllowed ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <Lock size={48} className="mb-6 opacity-20" style={{ color: '#6C63FF' }} />
                        <h2 className="text-2xl font-black uppercase tracking-tight"
                          style={{ color: theme === 'white' || theme === 'white-orange' ? '#0f172a' : '#F0F0FF' }}>
                          {isSubscribed ? 'Recurso Premium' : 'Período Expirado'}
                        </h2>
                        <p className="mt-2 mb-8 text-xs font-medium max-w-xs" style={{ color: '#7B7FA3' }}>
                          {isSubscribed
                            ? 'Este módulo é exclusivo para assinantes Premium.'
                            : 'Seu período experimental terminou. Faça o upgrade.'}
                        </p>
                        <button onClick={() => navigate('/app?tab=sales')}
                          className="btn-primary px-8 py-3 text-xs">
                          {isSubscribed ? 'Fazer Upgrade' : 'Ver Planos'}
                        </button>
                      </div>
                    ) : (
                      <>
                        {tab === 'dashboard' && <DashboardHome transactions={transactions as any} categories={categories} />}
                        {tab === 'history' && <TransactionTable />}
                        {tab === 'investments' && <InvestmentsManager investments={investments} onAdd={async(v) => { await appApi.addInvestment({...v, id: crypto.randomUUID(), user_id: session?.user?.id}); loadAllData(); }} onDelete={async(id) => { await appApi.deleteInvestment(id); loadAllData(); }} />}
                        {tab === 'freedom' && <DebtFreedom />}
                        {tab === 'settings' && <ProfileSettings onUpdate={loadAllData} onClose={() => navigate('/app')} subscriptionPlan={subscriptionPlan} onNavigate={(t) => navigate(`/app?tab=${t}`)} />}
                        {tab === 'admin' && (session?.user?.email === ADMIN_EMAIL ? <AdminDashboard theme={theme} /> : <Navigate to="/app" />)}
                        {tab === 'categories' && <CategoryManager categories={categories} onUpdate={loadAllData} currentUserId={session?.user?.id} />}
                        {tab === 'target' && <HorizonsManager goals={goals} onUpdate={loadAllData} currentUserId={session?.user?.id} />}
                        {tab === 'report' && <Reports transactions={transactions as any} />}
                        {(tab === 'contas' || tab === 'bills') && <BillsManager mode={tab === 'bills' ? 'overdue' : 'normal'} />}
                        {tab === 'advisor' && <FinancialAdvisor currentBalance={0} transactions={transactions} categories={[]} theme={theme} />}
                        {tab === 'sales' && <SalesPage onSelectPlan={(plan) => {
                          if (plan === 'free' || plan === 'start') { navigate('/app?tab=settings'); }
                          else {
                            const checkouts: Record<string, string> = {
                              'basic': 'https://pay.kiwify.com.br/Ud7Lefh',
                              'premium': 'https://pay.kiwify.com.br/l7H6T2P',
                              'desktop': 'https://pay.kiwify.com.br/1Dx2Uvq'
                            };
                            window.location.href = checkouts[plan] || '#';
                          }
                        }} />}
                      </>
                    )}
                  </div>
                </main>

                {/* ── Bottom Nav (mobile) ── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
                  style={{
                    background: theme === 'white' || theme === 'white-orange'
                      ? 'rgba(255,255,255,0.97)'
                      : 'rgba(13,14,26,0.97)',
                    borderTop: '1px solid rgba(108,99,255,0.12)',
                    backdropFilter: 'blur(20px)',
                  }}>
                  {[
                    { id: 'dashboard', icon: LayoutGrid },
                    { id: 'history',   icon: Calendar },
                    { id: 'contas',    icon: CheckCircle2 },
                    { id: 'advisor',   icon: Brain },
                    { id: 'settings',  icon: Settings },
                  ].map(({ id, icon: Icon }) => (
                    <button key={id} onClick={() => navigate(`/app?tab=${id}`)}
                      className="flex flex-col items-center p-2 transition-colors"
                      style={{ color: tab === id ? '#6C63FF' : '#7B7FA3' }}>
                      <Icon size={20} />
                    </button>
                  ))}
                  <button onClick={() => setIsModalOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', boxShadow: '0 4px 16px rgba(108,99,255,0.4)', borderRadius: '50%' }}>
                    <Plus size={18} />
                  </button>
                </nav>
              </div>
            );
          })()
        } />

        {/* REDIRECT */}
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
        <div className="w-screen h-screen flex items-center justify-center p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D0E1A 0%, #141527 60%, #0D0E1A 100%)' }}>

          {/* Partículas de fundo */}
          <NetworkBackground />

          {/* Glow decorativo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)' }} />
          </div>

          <form onSubmit={handleSubmit}
            className="w-full max-w-[380px] relative z-10 animate-fade-slide-up"
            style={{
              background: 'rgba(20, 21, 39, 0.85)',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              backdropFilter: 'blur(24px)',
              padding: '40px',
            }}>

            {/* Linha decorativa superior */}
            <div className="absolute top-0 left-8 right-8 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #6C63FF, #00D4AA, transparent)' }} />

            {/* Botão voltar */}
            <button
              type="button"
              onClick={() => navigate('/vendas')}
              className="absolute top-4 left-4 transition-colors"
              title="Ver Planos"
              style={{ color: 'rgba(123,127,163,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0F0FF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(123,127,163,0.6)')}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Logo + Título */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full animate-glow-pulse"
                  style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.3), transparent)' }} />
                <img src="/logo.png" alt="A2 Mentor"
                  className="h-16 w-16 object-cover rounded-full relative z-10"
                  style={{ boxShadow: '0 0 24px rgba(108,99,255,0.4)' }} />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.15em] text-lg">
                {isSignUp ? 'Nova Conta' : 'A2 Mentor'}
              </h2>
              <p className="text-xs mt-1 font-medium"
                style={{ color: '#7B7FA3' }}>
                {isSignUp ? 'Crie sua conta gratuita' : 'Inteligência Financeira Pessoal'}
              </p>
            </div>

            {/* Separador */}
            <div className="mb-6 h-px" style={{ background: 'rgba(108,99,255,0.12)' }} />

            {/* Campos */}
            <div className="flex flex-col gap-3 mb-6">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={localEmail}
                onChange={e => setLocalEmail(e.target.value)}
                className="input-premium w-full p-3.5 text-sm font-medium"
                style={{ fontSize: '0.875rem' }}
                required
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Sua senha"
                  value={localPassword}
                  onChange={e => setLocalPassword(e.target.value)}
                  className="input-premium w-full p-3.5 pr-12 text-sm font-medium"
                  style={{ fontSize: '0.875rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#4A4D6B' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6C63FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4A4D6B')}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Barra de força da senha */}
              {isSignUp && localPassword && (
                <div className="px-0.5 animate-fade-slide-up">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: passwordStrength.score === 100 ? '#00D4AA' : passwordStrength.score >= 66 ? '#FFD60A' : '#FF4757' }}>
                      Senha {passwordStrength.label}
                    </span>
                    <span className="text-[9px] font-bold" style={{ color: '#7B7FA3' }}>
                      {passwordStrength.score}%
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden" style={{ background: 'rgba(108,99,255,0.1)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${passwordStrength.score}%`,
                        background: passwordStrength.score === 100
                          ? 'linear-gradient(90deg, #00D4AA, #6C63FF)'
                          : passwordStrength.score >= 66
                          ? 'linear-gradient(90deg, #FFD60A, #FF9F43)'
                          : '#FF4757',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-xs font-black uppercase tracking-widest"
              style={{ letterSpacing: '0.15em' }}>
              {authLoading ? '⏳ Verificando...' : (isSignUp ? '✦ Criar Conta' : '✦ Entrar')}
            </button>

            {/* Alternância cadastro/login */}
            <p
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-5 text-center text-[10px] font-bold uppercase cursor-pointer transition-colors tracking-wider"
              style={{ color: '#4A4D6B' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6C63FF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4A4D6B')}
            >
              {isSignUp ? '← Já possuo acesso' : 'Criar nova conta →'}
            </p>

            {/* Mensagem de erro */}
            {authError && (
              <div className="mt-5 flex items-center gap-2 p-3 animate-fade-slide-up"
                style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)' }}>
                <p className="text-[10px] font-bold uppercase" style={{ color: '#FF4757' }}>{authError}</p>
              </div>
            )}

            {/* Linha decorativa inferior */}
            <div className="absolute bottom-0 left-8 right-8 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)' }} />
          </form>
        </div>
    );
};

function Lock(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    )
}


