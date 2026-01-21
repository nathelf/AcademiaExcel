import { Calendar, Download, FileSpreadsheet, FileText, Filter, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reports = [
  {
    id: "financial",
    title: "Relatório Financeiro Geral",
    description: "Visão consolidada de contas a pagar e receber",
    icon: FileText,
  },
  {
    id: "cashflow",
    title: "Fluxo de Caixa",
    description: "Entradas e saídas por período",
    icon: FileSpreadsheet,
  },
  {
    id: "clients",
    title: "Relatório de Clientes",
    description: "Faturamento e inadimplência por cliente",
    icon: FileText,
  },
  {
    id: "suppliers",
    title: "Relatório de Fornecedores",
    description: "Gastos e pagamentos por fornecedor",
    icon: FileSpreadsheet,
  },
];

export default function Relatorios() {
  const { empresaId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subcategorias, setSubcategorias] = useState<{ id: string; nome: string }[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState(
    searchParams.get("periodo") ?? "mes"
  );
  const [statusFiltro, setStatusFiltro] = useState(
    searchParams.get("status") ?? "all"
  );
  const [clienteFiltro, setClienteFiltro] = useState(
    searchParams.get("cliente") ?? "all"
  );
  const [fornecedorFiltro, setFornecedorFiltro] = useState(
    searchParams.get("fornecedor") ?? "all"
  );
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(
    searchParams.get("subcategoria") ?? "all"
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transacoes: 0,
  });
  const subcategoriaSelecionada =
    subcategoriaFiltro !== "all"
      ? subcategorias.find((sub) => sub.id === subcategoriaFiltro)?.nome
      : null;

  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!empresaId) return;
      const { data, error } = await supabase
        .from("subcategorias")
        .select("id, nome")
        .eq("empresa_id", empresaId)
        .order("nome");

      if (error) {
        toast.error("Erro ao carregar subcategorias: " + error.message);
        return;
      }

      setSubcategorias(data ?? []);
    };

    fetchSubcategorias();
  }, [empresaId]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (periodoFiltro === "mes") {
      params.delete("periodo");
    } else {
      params.set("periodo", periodoFiltro);
    }

    if (statusFiltro === "all") {
      params.delete("status");
    } else {
      params.set("status", statusFiltro);
    }

    if (clienteFiltro === "all") {
      params.delete("cliente");
    } else {
      params.set("cliente", clienteFiltro);
    }

    if (fornecedorFiltro === "all") {
      params.delete("fornecedor");
    } else {
      params.set("fornecedor", fornecedorFiltro);
    }

    if (subcategoriaFiltro === "all") {
      params.delete("subcategoria");
    } else {
      params.set("subcategoria", subcategoriaFiltro);
    }

    setSearchParams(params, { replace: true });
  }, [
    periodoFiltro,
    statusFiltro,
    clienteFiltro,
    fornecedorFiltro,
    subcategoriaFiltro,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!empresaId) return;
      setIsLoadingSummary(true);

      const subcategoriaFilter =
        subcategoriaFiltro !== "all" ? subcategoriaFiltro : null;

      let contasReceberQuery = supabase
        .from("contas_receber")
        .select("id, valor");
      let contasPagarQuery = supabase
        .from("contas_pagar")
        .select("id, valor");

      if (subcategoriaFilter) {
        contasReceberQuery = contasReceberQuery.eq("subcategoria_id", subcategoriaFilter);
        contasPagarQuery = contasPagarQuery.eq("subcategoria_id", subcategoriaFilter);
      }

      const [receberRes, pagarRes] = await Promise.all([
        contasReceberQuery,
        contasPagarQuery,
      ]);

      if (receberRes.error) {
        toast.error("Erro ao carregar receitas: " + receberRes.error.message);
        setIsLoadingSummary(false);
        return;
      }

      if (pagarRes.error) {
        toast.error("Erro ao carregar despesas: " + pagarRes.error.message);
        setIsLoadingSummary(false);
        return;
      }

      const receitas = (receberRes.data ?? []).reduce(
        (sum, item) => sum + Number(item.valor),
        0
      );
      const despesas = (pagarRes.data ?? []).reduce(
        (sum, item) => sum + Number(item.valor),
        0
      );
      const transacoes =
        (receberRes.data?.length ?? 0) + (pagarRes.data?.length ?? 0);

      setSummary({
        receitas,
        despesas,
        saldo: receitas - despesas,
        transacoes,
      });
      setIsLoadingSummary(false);
    };

    fetchSummary();
  }, [empresaId, subcategoriaFiltro]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios financeiros detalhados
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Este Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              <SelectItem value="1">Empresa ABC Ltda</SelectItem>
              <SelectItem value="2">Tech Solutions</SelectItem>
              <SelectItem value="3">Comércio Delta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Fornecedores</SelectItem>
              <SelectItem value="1">Distribuidor XYZ</SelectItem>
              <SelectItem value="2">Materiais Prime</SelectItem>
              <SelectItem value="3">Logística Express</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <Select value={subcategoriaFiltro} onValueChange={setSubcategoriaFiltro}>
              <SelectTrigger className="w-56 bg-background">
                <SelectValue placeholder="Subcategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Subcategorias</SelectItem>
                {subcategorias.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-6 bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      toast.info(
                        `Exportar ${report.title} em Excel${
                          subcategoriaSelecionada
                            ? ` (Subcategoria: ${subcategoriaSelecionada})`
                            : ""
                        }`
                      )
                    }
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      toast.info(
                        `Exportar ${report.title} em PDF${
                          subcategoriaSelecionada
                            ? ` (Subcategoria: ${subcategoriaSelecionada})`
                            : ""
                        }`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Preview */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">
          Prévia do Período Selecionado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-semibold text-primary">
              {isLoadingSummary ? "..." : summary.receitas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-semibold text-destructive">
              {isLoadingSummary ? "..." : summary.despesas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-2xl font-semibold text-foreground">
              {isLoadingSummary ? "..." : summary.saldo.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transações</p>
            <p className="text-2xl font-semibold text-accent">
              {isLoadingSummary ? "..." : summary.transacoes}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
