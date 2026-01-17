-- Create enum for account status
CREATE TYPE public.account_status AS ENUM ('pago', 'pendente', 'atrasado');

-- Create empresas (companies) table
CREATE TABLE public.empresas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    plano VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clientes table
CREATE TABLE public.clientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fornecedores table
CREATE TABLE public.fornecedores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categorias table
CREATE TABLE public.categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa', 'ambos')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create centros_custo table
CREATE TABLE public.centros_custo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create formas_pagamento table
CREATE TABLE public.formas_pagamento (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contas_pagar table
CREATE TABLE public.contas_pagar (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    centro_custo_id UUID REFERENCES public.centros_custo(id) ON DELETE SET NULL,
    forma_pagamento_id UUID REFERENCES public.formas_pagamento(id) ON DELETE SET NULL,
    data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    numero_documento VARCHAR(100),
    status account_status NOT NULL DEFAULT 'pendente',
    data_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contas_receber table
CREATE TABLE public.contas_receber (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    forma_pagamento_id UUID REFERENCES public.formas_pagamento(id) ON DELETE SET NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    status account_status NOT NULL DEFAULT 'pendente',
    data_recebimento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

-- Create function to get user's empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON public.contas_pagar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON public.contas_receber FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for empresas
CREATE POLICY "Users can view their own empresa"
    ON public.empresas FOR SELECT
    USING (id = public.get_user_empresa_id());

CREATE POLICY "Users can update their own empresa"
    ON public.empresas FOR UPDATE
    USING (id = public.get_user_empresa_id());

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for clientes (multi-tenant)
CREATE POLICY "Users can view clientes from their empresa"
    ON public.clientes FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert clientes to their empresa"
    ON public.clientes FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update clientes from their empresa"
    ON public.clientes FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete clientes from their empresa"
    ON public.clientes FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for fornecedores (multi-tenant)
CREATE POLICY "Users can view fornecedores from their empresa"
    ON public.fornecedores FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert fornecedores to their empresa"
    ON public.fornecedores FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update fornecedores from their empresa"
    ON public.fornecedores FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete fornecedores from their empresa"
    ON public.fornecedores FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for categorias (multi-tenant)
CREATE POLICY "Users can view categorias from their empresa"
    ON public.categorias FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert categorias to their empresa"
    ON public.categorias FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update categorias from their empresa"
    ON public.categorias FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete categorias from their empresa"
    ON public.categorias FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for centros_custo (multi-tenant)
CREATE POLICY "Users can view centros_custo from their empresa"
    ON public.centros_custo FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert centros_custo to their empresa"
    ON public.centros_custo FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update centros_custo from their empresa"
    ON public.centros_custo FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete centros_custo from their empresa"
    ON public.centros_custo FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for formas_pagamento (multi-tenant)
CREATE POLICY "Users can view formas_pagamento from their empresa"
    ON public.formas_pagamento FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert formas_pagamento to their empresa"
    ON public.formas_pagamento FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update formas_pagamento from their empresa"
    ON public.formas_pagamento FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete formas_pagamento from their empresa"
    ON public.formas_pagamento FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for contas_pagar (multi-tenant)
CREATE POLICY "Users can view contas_pagar from their empresa"
    ON public.contas_pagar FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert contas_pagar to their empresa"
    ON public.contas_pagar FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update contas_pagar from their empresa"
    ON public.contas_pagar FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete contas_pagar from their empresa"
    ON public.contas_pagar FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());

-- RLS Policies for contas_receber (multi-tenant)
CREATE POLICY "Users can view contas_receber from their empresa"
    ON public.contas_receber FOR SELECT
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert contas_receber to their empresa"
    ON public.contas_receber FOR INSERT
    WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update contas_receber from their empresa"
    ON public.contas_receber FOR UPDATE
    USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete contas_receber from their empresa"
    ON public.contas_receber FOR DELETE
    USING (empresa_id = public.get_user_empresa_id());