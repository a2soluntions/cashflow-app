import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
 session: Session | null;
 user: User | null;
 loading: boolean;
 signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
 session: null,
 user: null,
 loading: true,
 signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
 const [session, setSession] = useState<Session | null>(null);
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    // Timeout de segurança: se a conexão com o Supabase demorar mais de 4 segundos, libera a tela
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('[Auth] Supabase session fetch timeout. Proceeding...');
        setLoading(false);
      }
    }, 4000);

    // Busca a sessão inicial com tratamento de erros
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        resolved = true;
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        resolved = true;
        clearTimeout(timeout);
        console.error('[Auth] Error getting session:', err);
        setLoading(false);
      });

    // Escuta mudanças de auth (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolved = true;
      clearTimeout(timeout);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

 const signOut = async () => {
 await supabase.auth.signOut();
 };

 const value = {
 session,
 user,
 loading,
 signOut,
 };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D0E1A 0%, #141527 50%, #0D0E1A 100%)' }}>
          {/* Glow de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }} />
          </div>

          {/* Spinner + Logo */}
          <div className="relative mb-8">
            {/* Anel externo */}
            <div className="w-24 h-24 rounded-full animate-spin"
              style={{ border: '2px solid transparent', borderTopColor: '#6C63FF', borderRightColor: 'rgba(108,99,255,0.2)' }} />
            {/* Anel interno */}
            <div className="absolute inset-2 rounded-full animate-spin"
              style={{ border: '2px solid transparent', borderBottomColor: '#00D4AA', animationDirection: 'reverse', animationDuration: '0.8s' }} />
            {/* Logo */}
            <img
              src="/logo.png"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 object-cover mix-blend-screen rounded-full"
              alt="A2 Mentor"
            />
          </div>

          {/* Texto */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-black uppercase tracking-[0.5em] text-xs animate-pulse"
              style={{ letterSpacing: '0.4em' }}>A2 Mentor</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] animate-pulse"
              style={{ color: '#7B7FA3' }}>Carregando seu painel...</p>
          </div>

          {/* Barra de progresso animada */}
          <div className="mt-8 w-48 h-0.5 overflow-hidden" style={{ background: 'rgba(108,99,255,0.15)' }}>
            <div className="h-full animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #6C63FF, #00D4AA, transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite' }} />
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

