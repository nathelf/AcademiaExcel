import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { apiClient, isUsingLocalFixtures } from '@/lib/apiClient';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  empresaId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    nomeCompleto: string,
    nomeEmpresa: string,
    cnpj?: string
  ) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  testEmpresaInsertion: () => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured && !isUsingLocalFixtures) {
      console.error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.');
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = apiClient.auth.onAuthStateChange(
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
    apiClient.auth.getSession().then(({ data: { session } }) => {
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
    const { data, error } = await apiClient
      .from('profiles')
      .select('empresa_id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error(error);
    }

    const empresaId = data?.[0]?.empresa_id;
    if (empresaId) {
      setEmpresaId(empresaId);
    } else {
      console.warn('Usuário sem empresa vinculada');
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured && !isUsingLocalFixtures) {
      return {
        error: new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'),
      };
    }
    const { error } = await apiClient.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nomeCompleto: string, nomeEmpresa: string, cnpj?: string) => {
    if (!isSupabaseConfigured && !isUsingLocalFixtures) {
      return {
        error: new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'),
      };
    }
    const redirectUrl = `${window.location.origin}/`;

    console.log('Iniciando cadastro com dados:', { email, nomeCompleto, nomeEmpresa, cnpj });

    // First create the empresa
    console.log('Tentando criar empresa...');
    const { data: empresaData, error: empresaError } = await apiClient
      .from('empresas')
      .insert({
        nome: nomeEmpresa,
        cnpj: cnpj || null,
      })
      .select()
      .single();

    console.log('Resultado da criação da empresa:', { empresaData, empresaError });

    if (empresaError) {
      console.error('Erro detalhado ao criar empresa:', empresaError);
      return { error: new Error('Erro ao criar empresa: ' + empresaError.message) };
    }

    // Then sign up the user
    console.log('Empresa criada com sucesso, tentando criar usuário...', { empresaId: empresaData.id });
    const { data: authData, error: authError } = await apiClient.auth.signUp({
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

    console.log('Resultado da criação do usuário:', { authData, authError });

    if (authError) {
      console.error('Erro detalhado ao criar usuário:', authError);
      // Rollback empresa creation
      console.log('Fazendo rollback da empresa criada...');
      await apiClient.from('empresas').delete().eq('id', empresaData.id);
      return { error: authError as Error };
    }

    if (!authData.session) {
      return { error: null, requiresEmailConfirmation: true };
    }

    console.log('Cadastro concluído com sucesso!');
    return { error: null };
  };

  // Debug function to test empresa insertion
  const testEmpresaInsertion = async () => {
    console.log('Testando inserção direta na tabela empresas...');
    const { data, error } = await apiClient
      .from('empresas')
      .insert({
        nome: 'Empresa Teste Debug',
        cnpj: '00.000.000/0000-99',
      })
      .select()
      .single();

    console.log('Resultado do teste:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured && !isUsingLocalFixtures) {
      return;
    }
    await apiClient.auth.signOut();
    setUser(null);
    setSession(null);
    setEmpresaId(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured && !isUsingLocalFixtures) {
      return {
        error: new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'),
      };
    }
    const { error } = await apiClient.auth.resetPasswordForEmail(email, {
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
      testEmpresaInsertion,
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
