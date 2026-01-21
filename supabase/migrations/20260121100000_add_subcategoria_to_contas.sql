-- Add subcategoria_id to contas tables
ALTER TABLE public.contas_pagar
  ADD COLUMN IF NOT EXISTS subcategoria_id UUID;

ALTER TABLE public.contas_receber
  ADD COLUMN IF NOT EXISTS subcategoria_id UUID;

ALTER TABLE public.contas_pagar
  DROP CONSTRAINT IF EXISTS contas_pagar_subcategoria_id_fkey;

ALTER TABLE public.contas_pagar
  ADD CONSTRAINT contas_pagar_subcategoria_id_fkey
  FOREIGN KEY (subcategoria_id)
  REFERENCES public.subcategorias(id)
  ON DELETE SET NULL;

ALTER TABLE public.contas_receber
  DROP CONSTRAINT IF EXISTS contas_receber_subcategoria_id_fkey;

ALTER TABLE public.contas_receber
  ADD CONSTRAINT contas_receber_subcategoria_id_fkey
  FOREIGN KEY (subcategoria_id)
  REFERENCES public.subcategorias(id)
  ON DELETE SET NULL;
