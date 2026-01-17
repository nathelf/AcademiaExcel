import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  empresaId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nomeCompleto: string, nomeEmpresa: string, cnpj?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching profile data
        if (session?.user) {
          setTimeout(() => {
            fetchEmpresaId(session.user.id);
          }, 0);
        } else {
          setEmpresaId(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEmpresaId(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEmpresaId = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data?.empresa_id) {
      setEmpresaId(data.empresa_id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nomeCompleto: string, nomeEmpresa: string, cnpj?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // First create the empresa
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .insert({
        nome: nomeEmpresa,
        cnpj: cnpj || null,
      })
      .select()
      .single();

    if (empresaError) {
      return { error: new Error('Erro ao criar empresa: ' + empresaError.message) };
    }

    // Then sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome_completo: nomeCompleto,
          empresa_id: empresaData.id,
        }
      }
    });

    if (authError) {
      // Rollback empresa creation
      await supabase.from('empresas').delete().eq('id', empresaData.id);
      return { error: authError as Error };
    }

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          empresa_id: empresaData.id,
          nome_completo: nomeCompleto,
          email: email,
        });

      if (profileError) {
        return { error: new Error('Erro ao criar perfil: ' + profileError.message) };
      }

      // Create default categories
      await supabase.from('categorias').insert([
        { empresa_id: empresaData.id, nome: 'Serviços', tipo: 'ambos' },
        { empresa_id: empresaData.id, nome: 'Produtos', tipo: 'ambos' },
        { empresa_id: empresaData.id, nome: 'Materiais', tipo: 'despesa' },
        { empresa_id: empresaData.id, nome: 'Utilidades', tipo: 'despesa' },
        { empresa_id: empresaData.id, nome: 'Transporte', tipo: 'despesa' },
        { empresa_id: empresaData.id, nome: 'Tecnologia', tipo: 'ambos' },
        { empresa_id: empresaData.id, nome: 'Manutenção', tipo: 'despesa' },
        { empresa_id: empresaData.id, nome: 'Projetos', tipo: 'receita' },
        { empresa_id: empresaData.id, nome: 'Software', tipo: 'ambos' },
      ]);

      // Create default cost centers
      await supabase.from('centros_custo').insert([
        { empresa_id: empresaData.id, nome: 'Administrativo' },
        { empresa_id: empresaData.id, nome: 'Operacional' },
        { empresa_id: empresaData.id, nome: 'Comercial' },
        { empresa_id: empresaData.id, nome: 'TI' },
        { empresa_id: empresaData.id, nome: 'Logística' },
        { empresa_id: empresaData.id, nome: 'Produção' },
      ]);

      // Create default payment methods
      await supabase.from('formas_pagamento').insert([
        { empresa_id: empresaData.id, nome: 'Boleto' },
        { empresa_id: empresaData.id, nome: 'Transferência' },
        { empresa_id: empresaData.id, nome: 'PIX' },
        { empresa_id: empresaData.id, nome: 'Cartão de Crédito' },
        { empresa_id: empresaData.id, nome: 'Cartão de Débito' },
        { empresa_id: empresaData.id, nome: 'Débito Automático' },
        { empresa_id: empresaData.id, nome: 'Dinheiro' },
      ]);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEmpresaId(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      empresaId,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
