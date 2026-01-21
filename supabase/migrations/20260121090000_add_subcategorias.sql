-- Create subcategorias table
CREATE TABLE IF NOT EXISTS public.subcategorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subcategorias from their empresa"
  ON public.subcategorias FOR SELECT
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert subcategorias to their empresa"
  ON public.subcategorias FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update subcategorias from their empresa"
  ON public.subcategorias FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete subcategorias from their empresa"
  ON public.subcategorias FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());
