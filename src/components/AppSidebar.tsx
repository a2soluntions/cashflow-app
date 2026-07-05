import React, { useState } from 'react';
import {
  Plus, Settings, LayoutGrid, Target,
  BarChart3, Brain, CheckCircle2,
  Calendar, AppWindow, LogOut,
  ShieldAlert, TrendingUp, ShieldCheck, Zap, Newspaper,
  Bell, ChevronLeft, ChevronRight,
  Wallet, PieChart, FileText
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (tabId: string) => void;
  onNewTransaction: () => void;
  currentTab: string;
  currentTheme: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange';
  onToggleTheme: (theme: 'blue' | 'black' | 'white' | 'black-orange' | 'white-orange') => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  userAvatar?: string | null;
  userName?: string;
  overdueCount?: number;
}

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutGrid,   group: 'main' },
  { id: 'investments', label: 'Carteira',     icon: TrendingUp,   group: 'main' },
  { id: 'history',     label: 'Histórico',    icon: Calendar,     group: 'main' },
  { id: 'categories',  label: 'Categorias',   icon: AppWindow,    group: 'main' },
  { id: 'contas',      label: 'Contas',       icon: CheckCircle2, group: 'main' },
  { id: 'report',      label: 'Relatórios',   icon: BarChart3,    group: 'tools' },
  { id: 'target',      label: 'A2 Horizons',  icon: Target,       group: 'tools' },
  { id: 'freedom',     label: 'Liberdade $',  icon: ShieldAlert,  group: 'tools' },
  { id: 'advisor',     label: 'Consultor IA', icon: Brain,        group: 'tools' },
  { id: 'noticias',    label: 'A2 Notícias',  icon: Newspaper,    group: 'tools' },
  { id: 'sales',       label: 'Planos & Pro', icon: Zap,          group: 'extra' },
  { id: 'settings',    label: 'Ajustes',      icon: Settings,     group: 'extra' },
];

const NAV_ADMIN = { id: 'admin', label: 'Admin', icon: ShieldCheck, group: 'extra' };

export function AppSidebar({
  onNavigate, onNewTransaction, currentTab, currentTheme, onToggleTheme,
  isAdmin, onLogout, userAvatar, userName = 'Usuário', overdueCount = 0,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isLight = currentTheme === 'white' || currentTheme === 'white-orange';

  const items = isAdmin ? [...NAV_ITEMS, NAV_ADMIN] : NAV_ITEMS;
  const groups = [
    { key: 'main',  label: 'Principal' },
    { key: 'tools', label: 'Ferramentas' },
    { key: 'extra', label: 'Conta' },
  ];

  const handleNav = (id: string) => {
    if (id === 'noticias') { window.open('/noticias', '_blank'); return; }
    onNavigate(id);
  };

  const bg = isLight
    ? 'rgba(255,255,255,0.97)'
    : 'rgba(13,14,26,0.97)';
  const border = isLight
    ? '1px solid rgba(108,99,255,0.1)'
    : '1px solid rgba(108,99,255,0.12)';
  const textMuted = isLight ? '#64748b' : '#7B7FA3';
  const textPrimary = isLight ? '#0f172a' : '#F0F0FF';

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 z-50 transition-all duration-300 backdrop-blur-xl"
      style={{
        width: collapsed ? 72 : 240,
        background: bg,
        borderRight: border,
        boxShadow: isLight
          ? '4px 0 24px rgba(108,99,255,0.06)'
          : '4px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Logo + Collapse ───────────────────── */}
      <div className="flex items-center justify-between px-4 py-5 shrink-0"
        style={{ borderBottom: border }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/icon.png" alt="A2 Mentor"
              className="w-8 h-8 rounded-full object-cover shrink-0"
              style={{ boxShadow: '0 0 12px rgba(108,99,255,0.4)' }} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em]"
                style={{ color: textPrimary }}>A2 Mentor</p>
              <p className="text-[9px] font-medium"
                style={{ background: 'linear-gradient(90deg,#6C63FF,#00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Inteligência Financeira
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <img src="/icon.png" alt="A2 Mentor"
            className="w-8 h-8 rounded-full object-cover mx-auto"
            style={{ boxShadow: '0 0 12px rgba(108,99,255,0.4)' }} />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
          style={{ color: textMuted, marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── Botão Novo Lançamento ─────────────── */}
      <div className="px-3 py-3 shrink-0">
        <button
          onClick={onNewTransaction}
          className="w-full flex items-center gap-2.5 py-2.5 px-3 font-bold text-white text-xs transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
            boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Plus size={15} className="shrink-0" />
          {!collapsed && <span className="uppercase tracking-wider text-[10px] font-black">Novo Lançamento</span>}
        </button>
      </div>

      {/* ── Navegação ────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
        {groups.map(group => {
          const groupItems = items.filter(i => i.group === group.key);
          if (!groupItems.length) return null;
          return (
            <div key={group.key} className="mb-3">
              {!collapsed && (
                <p className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-0.5"
                  style={{ color: textMuted }}>
                  {group.label}
                </p>
              )}
              {groupItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={collapsed ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 transition-all text-left group relative"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.08))'
                        : 'transparent',
                      borderLeft: isActive
                        ? '2px solid #6C63FF'
                        : '2px solid transparent',
                      color: isActive ? '#6C63FF' : textMuted,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = isLight
                          ? 'rgba(108,99,255,0.05)'
                          : 'rgba(108,99,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = textPrimary;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = textMuted;
                      }
                    }}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && (
                      <span className="text-xs font-semibold tracking-wide truncate">
                        {item.label}
                      </span>
                    )}
                    {/* Badge contas vencidas */}
                    {item.id === 'contas' && overdueCount > 0 && (
                      <span className="ml-auto shrink-0 w-4 h-4 flex items-center justify-center text-[8px] font-black text-white"
                        style={{ background: '#FF4757', borderRadius: '50%' }}>
                        {overdueCount}
                      </span>
                    )}
                    {/* Tooltip no modo colapsado */}
                    {collapsed && (
                      <span className="absolute left-16 z-[200] px-2 py-1 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{
                          background: isLight ? '#0f172a' : '#1C1D35',
                          color: '#F0F0FF',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Seletor de Tema & Perfil + Logout ───────────────────── */}
      <div className="shrink-0 px-3 py-3 space-y-3.5" style={{ borderTop: border }}>
        {/* Switch de Tema Claro/Escuro */}
        <div className="flex items-center justify-between px-1">
          {!collapsed && (
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
              Modo {isLight ? 'Claro' : 'Escuro'}
            </span>
          )}
          <button
            onClick={() => onToggleTheme(isLight ? 'blue' : 'white')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-slate-200 dark:hover:bg-white/10"
            style={{ color: '#6C63FF', marginLeft: collapsed ? 'auto' : '0', marginRight: collapsed ? 'auto' : '0' }}
            title={isLight ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          >
            {!isLight ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
          </button>
        </div>

        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(108,99,255,0.15)', border: '1.5px solid rgba(108,99,255,0.3)' }}>
              {userAvatar
                ? <img src={userAvatar} className="w-full h-full object-cover" alt="User" />
                : <span className="text-[10px] font-black" style={{ color: '#6C63FF' }}>
                    {userName.substring(0, 2).toUpperCase()}
                  </span>
              }
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: textPrimary }}>{userName}</p>
              <button onClick={onLogout}
                className="text-[9px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: '#FF4757' }}>
                <LogOut size={10} /> Sair
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onLogout}
            className="w-full flex items-center justify-center py-2 transition-colors"
            style={{ color: '#FF4757' }}
            title="Sair">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
