-- Create profile and default data when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id UUID;
  v_nome TEXT;
BEGIN
  v_empresa_id := NULLIF(NEW.raw_user_meta_data->>'empresa_id', '')::UUID;
  v_nome := NEW.raw_user_meta_data->>'nome_completo';

  IF v_empresa_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (user_id, empresa_id, nome_completo, email)
  VALUES (NEW.id, v_empresa_id, COALESCE(v_nome, NEW.email, 'Usuário'), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.categorias WHERE empresa_id = v_empresa_id) THEN
    INSERT INTO public.categorias (empresa_id, nome, tipo) VALUES
      (v_empresa_id, 'Serviços', 'ambos'),
      (v_empresa_id, 'Produtos', 'ambos'),
      (v_empresa_id, 'Materiais', 'despesa'),
      (v_empresa_id, 'Utilidades', 'despesa'),
      (v_empresa_id, 'Transporte', 'despesa'),
      (v_empresa_id, 'Tecnologia', 'ambos'),
      (v_empresa_id, 'Manutenção', 'despesa'),
      (v_empresa_id, 'Projetos', 'receita'),
      (v_empresa_id, 'Software', 'ambos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.centros_custo WHERE empresa_id = v_empresa_id) THEN
    INSERT INTO public.centros_custo (empresa_id, nome) VALUES
      (v_empresa_id, 'Administrativo'),
      (v_empresa_id, 'Operacional'),
      (v_empresa_id, 'Comercial'),
      (v_empresa_id, 'TI'),
      (v_empresa_id, 'Logística'),
      (v_empresa_id, 'Produção');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.formas_pagamento WHERE empresa_id = v_empresa_id) THEN
    INSERT INTO public.formas_pagamento (empresa_id, nome) VALUES
      (v_empresa_id, 'Boleto'),
      (v_empresa_id, 'Transferência'),
      (v_empresa_id, 'PIX'),
      (v_empresa_id, 'Cartão de Crédito'),
      (v_empresa_id, 'Cartão de Débito'),
      (v_empresa_id, 'Débito Automático'),
      (v_empresa_id, 'Dinheiro');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
