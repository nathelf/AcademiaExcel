import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { apiClient } from '@/lib/apiClient';
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
  testEmpresaInsertion: () => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
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
    const { data } = await apiClient
      .from('profiles')
      .select('empresa_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data?.empresa_id) {
      setEmpresaId(data.empresa_id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await apiClient.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nomeCompleto: string, nomeEmpresa: string, cnpj?: string) => {
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

    // Create profile
    if (authData.user) {
      console.log('Usuário criado, criando perfil...', { userId: authData.user.id });
      const { error: profileError } = await apiClient
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          empresa_id: empresaData.id,
          nome_completo: nomeCompleto,
          email: email,
        });

      console.log('Resultado da criação do perfil:', { profileError });

      if (profileError) {
        console.error('Erro detalhado ao criar perfil:', profileError);
        return { error: new Error('Erro ao criar perfil: ' + profileError.message) };
      }

      console.log('Criando dados padrão (categorias, centros de custo, formas de pagamento)...');

      // Create default categories
      const { error: categoriasError } = await apiClient.from('categorias').insert([
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

      if (categoriasError) {
        console.error('Erro ao criar categorias:', categoriasError);
      }

      // Create default cost centers
      const { error: centrosError } = await apiClient.from('centros_custo').insert([
        { empresa_id: empresaData.id, nome: 'Administrativo' },
        { empresa_id: empresaData.id, nome: 'Operacional' },
        { empresa_id: empresaData.id, nome: 'Comercial' },
        { empresa_id: empresaData.id, nome: 'TI' },
        { empresa_id: empresaData.id, nome: 'Logística' },
        { empresa_id: empresaData.id, nome: 'Produção' },
      ]);

      if (centrosError) {
        console.error('Erro ao criar centros de custo:', centrosError);
      }

      // Create default payment methods
      const { error: formasError } = await apiClient.from('formas_pagamento').insert([
        { empresa_id: empresaData.id, nome: 'Boleto' },
        { empresa_id: empresaData.id, nome: 'Transferência' },
        { empresa_id: empresaData.id, nome: 'PIX' },
        { empresa_id: empresaData.id, nome: 'Cartão de Crédito' },
        { empresa_id: empresaData.id, nome: 'Cartão de Débito' },
        { empresa_id: empresaData.id, nome: 'Débito Automático' },
        { empresa_id: empresaData.id, nome: 'Dinheiro' },
      ]);

      if (formasError) {
        console.error('Erro ao criar formas de pagamento:', formasError);
      }

      console.log('Cadastro concluído com sucesso!');
    }

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
    await apiClient.auth.signOut();
    setUser(null);
    setSession(null);
    setEmpresaId(null);
  };

  const resetPassword = async (email: string) => {
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
