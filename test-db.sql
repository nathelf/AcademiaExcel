-- Test script to run directly in Supabase SQL Editor
-- Execute this to check and fix the RLS policies

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'empresas';

-- If no policies exist or they're wrong, run the fix:
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create empresa during signup" ON public.empresas;
DROP POLICY IF EXISTS "Users can view their own empresa" ON public.empresas;
DROP POLICY IF EXISTS "Users can update their own empresa" ON public.empresas;
DROP POLICY IF EXISTS "allow_empresa_creation_for_signup" ON public.empresas;
DROP POLICY IF EXISTS "allow_users_view_own_empresa" ON public.empresas;
DROP POLICY IF EXISTS "allow_users_update_own_empresa" ON public.empresas;

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "allow_empresa_creation_for_signup"
    ON public.empresas FOR INSERT
    WITH CHECK (true);

CREATE POLICY "allow_users_view_own_empresa"
    ON public.empresas FOR SELECT
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "allow_users_update_own_empresa"
    ON public.empresas FOR UPDATE
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

-- Test insertion (should work now)
INSERT INTO public.empresas (nome, cnpj)
VALUES ('Empresa Teste SQL', '00.000.000/0000-01')
RETURNING *;