-- Allow inserting empresas during signup (before user is fully authenticated)
CREATE POLICY "Anyone can create empresa during signup"
    ON public.empresas FOR INSERT
    WITH CHECK (true);