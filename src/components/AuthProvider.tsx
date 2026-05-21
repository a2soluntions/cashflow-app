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
        <div className="fixed inset-0 bg-[#1a237e] flex flex-col items-center justify-center z-[9999]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
            <img src="/logo.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 object-cover mix-blend-screen rounded-full" alt="Loading" />
          </div>
          <p className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando A2 Mentor</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

