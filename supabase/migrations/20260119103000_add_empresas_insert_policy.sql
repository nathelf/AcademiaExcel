-- Ensure a dedicated RLS policy allows empresa creation during signup
DROP POLICY IF EXISTS "allow_empresa_creation_for_signup" ON public.empresas;

CREATE POLICY "allow_empresa_creation_for_signup"
    ON public.empresas FOR INSERT
    WITH CHECK (true);

-- Reapply the authenticated read/update policies just in case prior migrations removed them,
-- preventing accidental lockout while keeping the tenant restrictions.
DROP POLICY IF EXISTS "allow_users_view_own_empresa" ON public.empresas;
DROP POLICY IF EXISTS "allow_users_update_own_empresa" ON public.empresas;

CREATE POLICY "allow_users_view_own_empresa"
    ON public.empresas FOR SELECT
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "allow_users_update_own_empresa"
    ON public.empresas FOR UPDATE
    USING (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
