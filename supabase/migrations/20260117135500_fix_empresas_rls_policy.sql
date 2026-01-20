-- Fix RLS policy for empresas table to allow INSERT during signup
-- Drop existing policy if it exists and recreate it properly

DROP POLICY IF EXISTS "Anyone can create empresa during signup" ON public.empresas;

CREATE POLICY "Anyone can create empresa during signup"
    ON public.empresas FOR INSERT
    WITH CHECK (true);

-- Also ensure we have the SELECT and UPDATE policies for authenticated users
DROP POLICY IF EXISTS "Users can view their own empresa" ON public.empresas;
DROP POLICY IF EXISTS "Users can update their own empresa" ON public.empresas;

CREATE POLICY "Users can view their own empresa"
    ON public.empresas FOR SELECT
    USING (id = public.get_user_empresa_id());

CREATE POLICY "Users can update their own empresa"
    ON public.empresas FOR UPDATE
    USING (id = public.get_user_empresa_id())
    WITH CHECK (id = public.get_user_empresa_id());