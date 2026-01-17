import { Building2, CreditCard, FolderTree, Tags } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categorias = [
  { id: "1", nome: "Materiais", tipo: "despesa" },
  { id: "2", nome: "Utilidades", tipo: "despesa" },
  { id: "3", nome: "Transporte", tipo: "despesa" },
  { id: "4", nome: "Serviços", tipo: "receita" },
  { id: "5", nome: "Produtos", tipo: "receita" },
  { id: "6", nome: "Manutenção", tipo: "receita" },
];

const centrosCusto = [
  { id: "1", nome: "Administrativo" },
  { id: "2", nome: "Operacional" },
  { id: "3", nome: "Comercial" },
  { id: "4", nome: "TI" },
  { id: "5", nome: "Logística" },
];

const formasPagamento = [
  { id: "1", nome: "Boleto" },
  { id: "2", nome: "Transferência" },
  { id: "3", nome: "PIX" },
  { id: "4", nome: "Cartão de Crédito" },
  { id: "5", nome: "Cartão Corporativo" },
  { id: "6", nome: "Débito Automático" },
];

export default function Configuracoes() {
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
                  defaultValue="Empresa Demo Ltda"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fantasia">Nome Fantasia</Label>
                <Input
                  id="fantasia"
                  defaultValue="Empresa Demo"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  defaultValue="12.345.678/0001-90"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="contato@empresademo.com.br"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  defaultValue="(11) 1234-5678"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  defaultValue="Av. Principal, 1000 - São Paulo/SP"
                  className="bg-background"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button>Salvar Alterações</Button>
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
              <Button size="sm">Nova Categoria</Button>
            </div>
            <div className="space-y-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
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
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Excluir
                    </Button>
                  </div>
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
              <Button size="sm">Novo Centro</Button>
            </div>
            <div className="space-y-2">
              {centrosCusto.map((centro) => (
                <div
                  key={centro.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{centro.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Excluir
                    </Button>
                  </div>
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
              <Button size="sm">Nova Forma</Button>
            </div>
            <div className="space-y-2">
              {formasPagamento.map((forma) => (
                <div
                  key={forma.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{forma.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
