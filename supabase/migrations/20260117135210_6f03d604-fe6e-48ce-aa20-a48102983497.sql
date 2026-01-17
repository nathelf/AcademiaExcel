-- Drop and recreate get_user_empresa_id with additional security checks
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _empresa_id UUID;
    _user_id UUID;
BEGIN
    -- Get current authenticated user
    _user_id := auth.uid();
    
    -- Return NULL if not authenticated (prevents any access)
    IF _user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get empresa_id for this specific user
    SELECT empresa_id INTO _empresa_id
    FROM public.profiles
    WHERE user_id = _user_id;
    
    -- Return NULL if no profile found (prevents access without valid profile)
    IF _empresa_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN _empresa_id;
END;
$$;

-- Add additional constraint: ensure profiles always have valid empresa_id
ALTER TABLE public.profiles 
ALTER COLUMN empresa_id SET NOT NULL;

-- Create index for faster RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_profiles_user_empresa ON public.profiles(user_id, empresa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON public.clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_empresa ON public.fornecedores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa ON public.contas_pagar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa ON public.contas_receber(empresa_id);

-- Revoke execute permission from public, grant only to authenticated
REVOKE ALL ON FUNCTION public.get_user_empresa_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_empresa_id() TO authenticated;