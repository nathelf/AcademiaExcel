import { useEffect, useState } from "react";
import { Building2, CreditCard, FolderTree, Tags } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const defaultEmpresa = {
  razao: "Empresa Demo Ltda",
  fantasia: "Empresa Demo",
  cnpj: "12.345.678/0001-90",
  email: "contato@empresademo.com.br",
  telefone: "(11) 1234-5678",
  endereco: "Av. Principal, 1000 - São Paulo/SP",
};

const initialCategorias = [
  { id: "1", nome: "Materiais", tipo: "despesa" },
  { id: "2", nome: "Utilidades", tipo: "despesa" },
  { id: "3", nome: "Transporte", tipo: "despesa" },
  { id: "4", nome: "Serviços", tipo: "receita" },
  { id: "5", nome: "Produtos", tipo: "receita" },
  { id: "6", nome: "Manutenção", tipo: "receita" },
];

const initialCentrosCusto = [
  { id: "1", nome: "Administrativo" },
  { id: "2", nome: "Operacional" },
  { id: "3", nome: "Comercial" },
  { id: "4", nome: "TI" },
  { id: "5", nome: "Logística" },
];

const initialFormasPagamento = [
  { id: "1", nome: "Boleto" },
  { id: "2", nome: "Transferência" },
  { id: "3", nome: "PIX" },
  { id: "4", nome: "Cartão de Crédito" },
  { id: "5", nome: "Cartão Corporativo" },
  { id: "6", nome: "Débito Automático" },
];

export default function Configuracoes() {
  const { empresaId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);
  const [savedEmpresa, setSavedEmpresa] = useState(defaultEmpresa);
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [categorias, setCategorias] = useState(initialCategorias);
  const [centrosCusto, setCentrosCusto] = useState(initialCentrosCusto);
  const [formasPagamento, setFormasPagamento] = useState(initialFormasPagamento);

  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoTipoCategoria, setNovoTipoCategoria] = useState<"receita" | "despesa">("despesa");
  const [categoriaEditId, setCategoriaEditId] = useState<string | null>(null);
  const [categoriaEditNome, setCategoriaEditNome] = useState("");
  const [categoriaEditTipo, setCategoriaEditTipo] = useState<"receita" | "despesa">("despesa");

  const [novoCentro, setNovoCentro] = useState("");
  const [centroEditId, setCentroEditId] = useState<string | null>(null);
  const [centroEditNome, setCentroEditNome] = useState("");

  const [novaForma, setNovaForma] = useState("");
  const [formaEditId, setFormaEditId] = useState<string | null>(null);
  const [formaEditNome, setFormaEditNome] = useState("");

  const handleEmpresaChange = (field: keyof typeof defaultEmpresa, value: string) => {
    setEmpresa((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmpresaSave = async () => {
    if (!empresa.razao.trim() || !empresa.fantasia.trim()) {
      toast.error("Preencha Razão Social e Nome Fantasia.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(empresa.email)) {
      toast.error("Email inválido.");
      return;
    }
    if (!empresaId) {
      toast.error("Empresa não identificada.");
      return;
    }

    setIsSavingEmpresa(true);
    const { error } = await supabase
      .from("empresas")
      .update({
        nome: empresa.razao,
        cnpj: empresa.cnpj || null,
        email: empresa.email || null,
        telefone: empresa.telefone || null,
        endereco: empresa.endereco || null,
      })
      .eq("id", empresaId);

    setIsSavingEmpresa(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }

    try {
      localStorage.setItem(`empresa_fantasia_${empresaId}`, empresa.fantasia);
    } catch {
      // ignore localStorage errors
    }

    setSavedEmpresa(empresa);
    toast.success("Alterações salvas com sucesso.");
  };

  const handleEmpresaCancel = () => {
    setEmpresa(savedEmpresa);
    toast.message("Alterações descartadas.");
  };

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    if (!empresaId) {
      toast.error("Empresa não identificada.");
      return;
    }

    const { data, error } = await supabase
      .from("categorias")
      .insert({
        empresa_id: empresaId,
        nome: novaCategoria.trim(),
        tipo: novoTipoCategoria,
      })
      .select("id, nome, tipo")
      .single();

    if (error) {
      toast.error("Erro ao adicionar categoria: " + error.message);
      return;
    }

    setCategorias((prev) => [...prev, data]);
    setNovaCategoria("");
    toast.success("Categoria adicionada.");
  };

  const handleEditCategoria = (id: string) => {
    const current = categorias.find((cat) => cat.id === id);
    if (!current) return;
    setCategoriaEditId(id);
    setCategoriaEditNome(current.nome);
    setCategoriaEditTipo(current.tipo);
  };

  const handleSaveCategoria = async () => {
    if (!categoriaEditId) return;
    if (!categoriaEditNome.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    const { error } = await supabase
      .from("categorias")
      .update({
        nome: categoriaEditNome.trim(),
        tipo: categoriaEditTipo,
      })
      .eq("id", categoriaEditId);

    if (error) {
      toast.error("Erro ao atualizar categoria: " + error.message);
      return;
    }

    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaEditId
          ? { ...cat, nome: categoriaEditNome.trim(), tipo: categoriaEditTipo }
          : cat
      )
    );
    setCategoriaEditId(null);
    setCategoriaEditNome("");
    toast.success("Categoria atualizada.");
  };

  const handleCancelCategoria = () => {
    setCategoriaEditId(null);
    setCategoriaEditNome("");
  };

  const handleDeleteCategoria = async (id: string) => {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover categoria: " + error.message);
      return;
    }
    setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    toast.message("Categoria removida.");
  };

  const handleAddCentro = async () => {
    if (!novoCentro.trim()) {
      toast.error("Informe o nome do centro de custo.");
      return;
    }
    if (!empresaId) {
      toast.error("Empresa não identificada.");
      return;
    }

    const { data, error } = await supabase
      .from("centros_custo")
      .insert({
        empresa_id: empresaId,
        nome: novoCentro.trim(),
      })
      .select("id, nome")
      .single();

    if (error) {
      toast.error("Erro ao adicionar centro de custo: " + error.message);
      return;
    }

    setCentrosCusto((prev) => [...prev, data]);
    setNovoCentro("");
    toast.success("Centro de custo adicionado.");
  };

  const handleEditCentro = (id: string) => {
    const current = centrosCusto.find((centro) => centro.id === id);
    if (!current) return;
    setCentroEditId(id);
    setCentroEditNome(current.nome);
  };

  const handleSaveCentro = async () => {
    if (!centroEditId) return;
    if (!centroEditNome.trim()) {
      toast.error("Informe o nome do centro de custo.");
      return;
    }
    const { error } = await supabase
      .from("centros_custo")
      .update({ nome: centroEditNome.trim() })
      .eq("id", centroEditId);

    if (error) {
      toast.error("Erro ao atualizar centro de custo: " + error.message);
      return;
    }

    setCentrosCusto((prev) =>
      prev.map((centro) =>
        centro.id === centroEditId ? { ...centro, nome: centroEditNome.trim() } : centro
      )
    );
    setCentroEditId(null);
    setCentroEditNome("");
    toast.success("Centro de custo atualizado.");
  };

  const handleCancelCentro = () => {
    setCentroEditId(null);
    setCentroEditNome("");
  };

  const handleDeleteCentro = async (id: string) => {
    const { error } = await supabase.from("centros_custo").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover centro de custo: " + error.message);
      return;
    }
    setCentrosCusto((prev) => prev.filter((centro) => centro.id !== id));
    toast.message("Centro de custo removido.");
  };

  const handleAddForma = async () => {
    if (!novaForma.trim()) {
      toast.error("Informe o nome da forma de pagamento.");
      return;
    }
    if (!empresaId) {
      toast.error("Empresa não identificada.");
      return;
    }

    const { data, error } = await supabase
      .from("formas_pagamento")
      .insert({
        empresa_id: empresaId,
        nome: novaForma.trim(),
      })
      .select("id, nome")
      .single();

    if (error) {
      toast.error("Erro ao adicionar forma de pagamento: " + error.message);
      return;
    }

    setFormasPagamento((prev) => [...prev, data]);
    setNovaForma("");
    toast.success("Forma de pagamento adicionada.");
  };

  const handleEditForma = (id: string) => {
    const current = formasPagamento.find((forma) => forma.id === id);
    if (!current) return;
    setFormaEditId(id);
    setFormaEditNome(current.nome);
  };

  const handleSaveForma = async () => {
    if (!formaEditId) return;
    if (!formaEditNome.trim()) {
      toast.error("Informe o nome da forma de pagamento.");
      return;
    }
    const { error } = await supabase
      .from("formas_pagamento")
      .update({ nome: formaEditNome.trim() })
      .eq("id", formaEditId);

    if (error) {
      toast.error("Erro ao atualizar forma de pagamento: " + error.message);
      return;
    }

    setFormasPagamento((prev) =>
      prev.map((forma) =>
        forma.id === formaEditId ? { ...forma, nome: formaEditNome.trim() } : forma
      )
    );
    setFormaEditId(null);
    setFormaEditNome("");
    toast.success("Forma de pagamento atualizada.");
  };

  const handleCancelForma = () => {
    setFormaEditId(null);
    setFormaEditNome("");
  };

  const handleDeleteForma = async (id: string) => {
    const { error } = await supabase.from("formas_pagamento").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover forma de pagamento: " + error.message);
      return;
    }
    setFormasPagamento((prev) => prev.filter((forma) => forma.id !== id));
    toast.message("Forma de pagamento removida.");
  };

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      if (!empresaId) return;
      setIsLoading(true);

      const [empresaRes, categoriasRes, centrosRes, formasRes] = await Promise.all([
        supabase
          .from("empresas")
          .select("id, nome, cnpj, email, telefone, endereco")
          .eq("id", empresaId)
          .maybeSingle(),
        supabase
          .from("categorias")
          .select("id, nome, tipo")
          .eq("empresa_id", empresaId),
        supabase
          .from("centros_custo")
          .select("id, nome")
          .eq("empresa_id", empresaId),
        supabase
          .from("formas_pagamento")
          .select("id, nome")
          .eq("empresa_id", empresaId),
      ]);

      if (empresaRes.error) {
        toast.error("Erro ao carregar empresa: " + empresaRes.error.message);
      } else if (empresaRes.data) {
        let fantasia = empresaRes.data.nome || defaultEmpresa.fantasia;
        try {
          const storedFantasia = localStorage.getItem(`empresa_fantasia_${empresaId}`);
          if (storedFantasia) {
            fantasia = storedFantasia;
          }
        } catch {
          // ignore localStorage errors
        }

        const empresaData = {
          razao: empresaRes.data.nome || defaultEmpresa.razao,
          fantasia,
          cnpj: empresaRes.data.cnpj || "",
          email: empresaRes.data.email || "",
          telefone: empresaRes.data.telefone || "",
          endereco: empresaRes.data.endereco || "",
        };
        setEmpresa(empresaData);
        setSavedEmpresa(empresaData);
      }

      if (categoriasRes.error) {
        toast.error("Erro ao carregar categorias: " + categoriasRes.error.message);
      } else if (categoriasRes.data) {
        setCategorias(categoriasRes.data);
      }

      if (centrosRes.error) {
        toast.error("Erro ao carregar centros de custo: " + centrosRes.error.message);
      } else if (centrosRes.data) {
        setCentrosCusto(centrosRes.data);
      }

      if (formasRes.error) {
        toast.error("Erro ao carregar formas de pagamento: " + formasRes.error.message);
      } else if (formasRes.data) {
        setFormasPagamento(formasRes.data);
      }

      setIsLoading(false);
    };

    fetchConfiguracoes();
  }, [empresaId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-2">
            <Tags className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="centros" className="gap-2">
            <FolderTree className="h-4 w-4" />
            Centros de Custo
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Formas de Pagamento
          </TabsTrigger>
        </TabsList>

        {/* Empresa */}
        <TabsContent value="empresa">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-6">
              Dados da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="razao">Razão Social</Label>
                <Input
                  id="razao"
                  value={empresa.razao}
                  onChange={(e) => handleEmpresaChange("razao", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fantasia">Nome Fantasia</Label>
                <Input
                  id="fantasia"
                  value={empresa.fantasia}
                  onChange={(e) => handleEmpresaChange("fantasia", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={empresa.cnpj}
                  onChange={(e) => handleEmpresaChange("cnpj", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={empresa.email}
                  onChange={(e) => handleEmpresaChange("email", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={empresa.telefone}
                  onChange={(e) => handleEmpresaChange("telefone", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={empresa.endereco}
                  onChange={(e) => handleEmpresaChange("endereco", e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleEmpresaSave} disabled={isSavingEmpresa || isLoading}>
                {isSavingEmpresa ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={handleEmpresaCancel} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Categorias */}
        <TabsContent value="categorias">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">
                Categorias Financeiras
              </h3>
              <Button size="sm" onClick={handleAddCategoria}>
                Nova Categoria
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Input
                placeholder="Nome da categoria"
                className="bg-background"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={novoTipoCategoria}
                onChange={(e) => setNovoTipoCategoria(e.target.value as "receita" | "despesa")}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
              <Button variant="outline" onClick={handleAddCategoria}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  {categoriaEditId === cat.id ? (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="bg-background"
                          value={categoriaEditNome}
                          onChange={(e) => setCategoriaEditNome(e.target.value)}
                        />
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={categoriaEditTipo}
                          onChange={(e) =>
                            setCategoriaEditTipo(e.target.value as "receita" | "despesa")
                          }
                        >
                          <option value="despesa">Despesa</option>
                          <option value="receita">Receita</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSaveCategoria}>
                          Salvar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelCategoria}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{cat.nome}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            cat.tipo === "receita"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {cat.tipo === "receita" ? "Receita" : "Despesa"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(cat.id)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategoria(cat.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Centros de Custo */}
        <TabsContent value="centros">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">
                Centros de Custo
              </h3>
              <Button size="sm" onClick={handleAddCentro}>
                Novo Centro
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Input
                placeholder="Nome do centro"
                className="bg-background"
                value={novoCentro}
                onChange={(e) => setNovoCentro(e.target.value)}
              />
              <div />
              <Button variant="outline" onClick={handleAddCentro}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {centrosCusto.map((centro) => (
                <div
                  key={centro.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  {centroEditId === centro.id ? (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="bg-background"
                          value={centroEditNome}
                          onChange={(e) => setCentroEditNome(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSaveCentro}>
                          Salvar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelCentro}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{centro.nome}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCentro(centro.id)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCentro(centro.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Formas de Pagamento */}
        <TabsContent value="pagamentos">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">
                Formas de Pagamento
              </h3>
              <Button size="sm" onClick={handleAddForma}>
                Nova Forma
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Input
                placeholder="Nome da forma"
                className="bg-background"
                value={novaForma}
                onChange={(e) => setNovaForma(e.target.value)}
              />
              <div />
              <Button variant="outline" onClick={handleAddForma}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {formasPagamento.map((forma) => (
                <div
                  key={forma.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  {formaEditId === forma.id ? (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="bg-background"
                          value={formaEditNome}
                          onChange={(e) => setFormaEditNome(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSaveForma}>
                          Salvar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelForma}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{forma.nome}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditForma(forma.id)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteForma(forma.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
