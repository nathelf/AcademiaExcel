-- Force fix for RLS policies - complete reset and recreation
-- This migration will drop all existing policies and recreate them properly

-- Temporarily disable RLS to ensure we can work with the table
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (if any)
DROP POLICY IF EXISTS "Anyone can create empresa during signup" ON public.empresas;
DROP POLICY IF EXISTS "Users can view their own empresa" ON public.empresas;
DROP POLICY IF EXISTS "Users can update their own empresa" ON public.empresas;

-- Re-enable RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
-- Allow anyone to create empresas (for signup process)
CREATE POLICY "allow_empresa_creation_for_signup"
    ON public.empresas FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to view their own empresa
CREATE POLICY "allow_users_view_own_empresa"
    ON public.empresas FOR SELECT
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

-- Allow authenticated users to update their own empresa
CREATE POLICY "allow_users_update_own_empresa"
    ON public.empresas FOR UPDATE
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

-- Test the policy by trying to insert (this should work now)
-- This is just for testing - you can remove this after confirming it works
-- INSERT INTO public.empresas (nome, cnpj) VALUES ('Test Empresa', '00.000.000/0000-00');